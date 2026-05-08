<template>
  <PageLayout domain="oggi" @back="goBack">
    <header class="top-bar">
      <logo />
      <h1 class="page-title is-oggi">{{ t('oggi.title') }}</h1>
    </header>
    <div class="loading-screen" v-if="store.loading">
      <div class="spinner is-oggi"></div>
      <p>{{ t('common.loading') }}</p>
    </div>

    <main class="oggi-main" v-else-if="store.oggiLoaded">
      <div class="side-info" v-html="sideContent"></div>

      <!-- Sinistra: chart fasce età → lingue madri -->
      <section class="left-panel">
        <div class="panel-label">{{ descA }}</div>
        <div class="chart-box">
          <DonutChart :data="leftChartData" :onClick="onLeftClick" :key="leftKey" />
        </div>
      </section>

      <!-- Destra: mappa o chart genitori -->
      <section class="right-panel">
        <div class="panel-label">{{ descB }}</div>

        <div class="map-box" v-if="step === 'initial' || step === 'lingua'">
          <EuropeMap
            domain="oggi"
            :activeCountries="mapActiveOggi"
            :selectedId="selectedCountry"
            color-active="#2B917F"
            @click="onMapClick"
          />
        </div>

        <div class="chart-box" v-if="step === 'parents'">
          <DonutChart :data="rightChartData" :key="rightKey" />
        </div>
      </section>
    </main>
  </PageLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDataStore, nationName, DICT_SIGLA } from '../stores/dataStore.js'
import DonutChart from '../components/DonutChart.vue'
import EuropeMap from '../components/EuropeMap.vue'
import PageLayout from '../components/PageLayout.vue'
import logo from '../components/Logo.vue'

const router = useRouter()
const { t, locale } = useI18n()
const store = useDataStore()

// Step: initial → lingua → parents
const step            = ref('initial')
const leftKey         = ref(0)
const rightKey        = ref(0)
const selectedCountry = ref(null)
const selectedAge     = ref(null)
const selectedLang    = ref(null)

const oggiData = computed(() => store.risonanzeOggi)

onMounted(() => store.fetchOggi())

// Restituisce il nome lingua nella locale corrente leggendo i campi dal DB
function langName(linguaObj) {
  if (!linguaObj) return 'N/D'
  return locale.value === 'en'
    ? (linguaObj.language || linguaObj.lingua || 'N/D')
    : (linguaObj.lingua || 'N/D')
}

// ── Testi reattivi (computed → si aggiornano cambiando lingua) ────
const sideContent = computed(() => {
  if (!store.oggiLoaded) return ''
  if (step.value === 'initial') {
    return `<p><b>${t('oggi.totalData')} ${oggiData.value.length}</b></p>`
  }
  const perc = ((currentSet.value.length / oggiData.value.length) * 100).toFixed(1)
  return `
    <p><b>${t('oggi.totalCount')}: ${currentSet.value.length}</b></p>
    <p>${t('oggi.viewing', { perc })}</p>
  `
})

const descA = computed(() => {
  if (!store.oggiLoaded) return ''
  if (step.value === 'initial') return t('oggi.chartTitle')

  if (selectedAge.value) {
    const ageLabel = t(`oggi.ages.${selectedAge.value.replace(' ', '')}`)
    return t('oggi.lingueMadri', { age: ageLabel })
  }
  if (selectedCountry.value) {
    const nation = nationName(selectedCountry.value, locale.value).toUpperCase()
    return t('oggi.lingueMadriOf', { nation })
  }
  return ''
})

const descB = computed(() => {
  if (step.value === 'parents' && selectedLang.value) {
    return t('oggi.genitori', { lang: selectedLang.value })
  }
  return ''
})

// ── Logica dati ───────────────────────────────────────────────────
const currentSet = computed(() => {
  if (selectedCountry.value) {
    const nationIt = (nationName(selectedCountry.value, 'it') || '').toLowerCase()
    return oggiData.value.filter(d =>
      d.nazione_nascita?.nazioni?.toLowerCase() === nationIt
    )
  }
  if (selectedAge.value) {
    return oggiData.value.filter(d => d.eta === selectedAge.value)
  }
  return oggiData.value
})

const AGE_GROUPS_KEYS = ['11-18', '19-30', '31-50', '51-70', 'over70']
const AGE_COLORS = ['#2b917fc7', '#217a7abf', '#385e5dd4', '#2f3c3cd4', '#75f2dab8']

const leftChartData = computed(() => {
  if (step.value === 'initial') {
    const counts = Object.fromEntries(AGE_GROUPS_KEYS.map(k => [k, 0]))
    oggiData.value.forEach(d => {
      const key = d.eta?.replace(' ', '')
      if (counts[key] !== undefined) counts[key]++
    })
    return {
      labels: AGE_GROUPS_KEYS.map(k => t(`oggi.ages.${k}`)),
      datasets: [{
        data: AGE_GROUPS_KEYS.map(k => counts[k]),
        backgroundColor: AGE_COLORS,
      }],
    }
  }
  return buildLinguaChart(currentSet.value)
})

function buildLinguaChart(data) {
  const groups = {}
  data.forEach(d => {
    const lingua = langName(d.lingua_madre)
    const color = d.lingua_madre?.colore || d.lingua_madre?.colors || '#888'
    if (!groups[lingua]) groups[lingua] = { count: 0, color }
    groups[lingua].count++
  })
  const sorted = Object.entries(groups).sort((a, b) => b[1].count - a[1].count)
  return {
    labels: sorted.map(([k]) => k),
    datasets: [{
      data: sorted.map(([, v]) => v.count),
      backgroundColor: sorted.map(([, v]) => v.color),
    }],
  }
}

const rightChartData = computed(() => {
  if (!selectedLang.value) return { labels: [], datasets: [] }
  // Trova il subset filtrando per lingua madre selezionata (in entrambe le lingue)
  const subset = currentSet.value.filter(d => {
    const name = langName(d.lingua_madre)
    return name === selectedLang.value
  })
  const groups = {}
  subset.forEach(d => {
    const langs = [
      langName(d.lingua_madre_madre),
      langName(d.lingua_madre_padre),
    ].filter(l => l && l !== 'N/D')
    new Set(langs).forEach(l => {
      groups[l] = (groups[l] || 0) + 1
    })
  })
  const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1])
  return {
    labels: sorted.map(([k]) => k),
    datasets: [{
      data: sorted.map(([, v]) => v),
      // Colori semi-random ma stabili per label (hash semplice)
      backgroundColor: sorted.map(([k]) => stringToColor(k)),
    }],
  }
})

/** Hash → colore deterministico per le label dei genitori. */
function stringToColor(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h)
  return `hsl(${h % 360}, 55%, 55%)`
}

// ── Azioni ────────────────────────────────────────────────────────
function onLeftClick(el, chart) {
  if (!el.length) return
  const label = chart.data.labels[el[0].index]

  if (step.value === 'initial') {
    selectedAge.value = AGE_GROUPS_KEYS[el[0].index]
    step.value = 'lingua'
    leftKey.value++
  } else if (step.value === 'lingua') {
    selectedLang.value = label
    step.value = 'parents'
    rightKey.value++
  } else if (step.value === 'parents') {
    // Già nello step "parents": cambia lingua selezionata e aggiorna
    // il chart di destra senza tornare indietro.
    selectedLang.value = label
    rightKey.value++
  }
}

function onMapClick(sigla) {
  selectedCountry.value = sigla
  selectedAge.value = null
  selectedLang.value = null
  step.value = 'lingua'
  leftKey.value++
}

function goBack() {
  if (step.value === 'parents') {
    step.value = 'lingua'
    selectedLang.value = null
    return
  }
  if (step.value === 'lingua') {
    step.value = 'initial'
    selectedAge.value = null
    selectedCountry.value = null
    leftKey.value++
    return
  }
  router.push('/')
}

// Mappa nome-nazione (lowercase) → sigla, costruita una sola volta
const NATION_TO_SIGLA = Object.fromEntries(
  Object.entries(DICT_SIGLA).map(([sigla, nome]) => [nome.toLowerCase(), sigla])
)

const mapActiveOggi = computed(() => {
  const active = {}
  oggiData.value.forEach(d => {
    const name = d.nazione_nascita?.nazioni?.toLowerCase().trim()
    if (!name) return
    const sigla = NATION_TO_SIGLA[name]
    if (!sigla) return
    active[sigla] = (active[sigla] || 0) + 1
  })
  return active
})
</script>

<style scoped>
.oggi-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  position: relative;
  z-index: var(--z-content);
  padding: 0 var(--sp-4) calc(var(--sp-6) + var(--sp-4));
  gap: var(--sp-3);
  overflow: hidden;
  background-image: url('/img/mappaStoricaBiancoNero.png');
  background-size: cover;
  background-position: center;
  background-blend-mode: overlay;
  background-color: rgba(0, 0, 0, 0);
}

.side-info {
  grid-column: 1 / -1;
  padding: var(--sp-2) var(--sp-3);
  font-size: var(--fs-md);
  line-height: 1.5;
  color: var(--w-85);
  font-weight: 500;
  text-align: center;
  background: rgba(8, 14, 14, 0.55);
  border: 1px solid var(--w-12);
  border-radius: var(--radius-md);
  backdrop-filter: blur(6px);
}
.side-info :deep(b) { color: var(--oro); font-weight: 700; }

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  overflow: hidden;
  min-height: 0;
}

.chart-box,
.map-box {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-height: 0;
}

@media (min-width: 2560px) {
  .oggi-main { gap: var(--sp-4); }
}
</style>
