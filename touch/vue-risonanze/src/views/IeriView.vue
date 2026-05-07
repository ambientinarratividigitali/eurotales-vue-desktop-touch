<template>
  <PageLayout domain="ieri" @back="goBack">
    <header class="top-bar">
      <logo />
      <h1 class="page-title is-ieri">{{ t('ieri.title') }}</h1>
      <div class="header-actions">
        <button class="btn btn-oro" @click="showSearchModal = true">
          {{ t('ieri.cerca') }}
        </button>
        <button class="btn btn-ghost" @click="showLingueModal = true">
          {{ t('ieri.tabLingue') }}
        </button>
      </div>
    </header>

    <div class="loading-screen" v-if="store.loading">
      <div class="spinner"></div>
      <p>{{ t('common.loading') }}</p>
    </div>

    <main class="ieri-main" v-else-if="store.ieriLoaded">
      <div class="side-info">
        <p v-html="sideContent"></p>
      </div>

      <!-- Sinistra: donut chart, OPPURE lista personaggi se siamo su list-map -->
      <section class="left-panel">
        <div class="panel-label">{{ descChartA }}</div>

        <!-- Donut chart: visibile in tutti gli step tranne list-map -->
        <div class="chart-box" v-if="step !== 'list-map'">
          <DonutChart :data="chartData" :onClick="onChartClick" :key="chartKey" />
        </div>

        <!-- Lista personaggi della nazione cliccata: prende il posto del donut -->
        <div class="names-list thin-scroll" v-else>
          <div
            v-for="p in filteredList"
            :key="p.id"
            class="name-item"
            :style="{ borderColor: getAreaColor(p) }"
            @click="selectPersona(p)"
          >{{ getDisplayTitolo(p) }}</div>
        </div>
      </section>

      <!-- Destra: mappa, OPPURE lista personaggi quando si è su list-chart -->
      <section class="right-panel">
        <div class="panel-label">{{ descChartB }}</div>

        <div class="map-box" v-if="step === 'area' || step === 'lingua' || step === 'list-map'">
          <EuropeMap
            domain="ieri"
            :activeCountries="mapActive"
            :selectedId="selectedMapCountry"
            @click="onMapClick"
          />
        </div>

        <div class="names-list thin-scroll" v-if="step === 'list-chart'">
          <div
            v-for="p in filteredList"
            :key="p.id"
            class="name-item"
            :style="{ borderColor: getAreaColor(p) }"
            @click="selectPersona(p)"
          >{{ getDisplayTitolo(p) }}</div>
        </div>
      </section>
    </main>

    <!-- Modale tabella lingue -->
    <teleport to="body">
      <transition name="fade">
        <div class="modal-overlay" v-if="showLingueModal" @click.self="showLingueModal = false">
          <div class="modal-box">
            <h2 class="modal-title">{{ t('ieri.tabLingue') }}</h2>
            <div class="lingue-grid thin-scroll">
              <div v-for="l in store.lingue" :key="l.id" class="lingua-item">
                <span class="lingua-dot" :style="{ background: l.colors || '#888' }"></span>
                <span>{{ locale === 'en' ? (l.language || l.lingua) : l.lingua }}</span>
              </div>
            </div>
            <button class="btn btn-oro" @click="showLingueModal = false">
              {{ t('common.close') }}
            </button>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Modale ricerca -->
    <teleport to="body">
      <transition name="fade">
        <div class="modal-overlay" v-if="showSearchModal" @click.self="showSearchModal = false">
          <div class="modal-box">
            <h2 class="modal-title">{{ t('ieri.cerca') }}</h2>
            <div class="search-results thin-scroll">
              <div
                v-for="p in searchResults"
                :key="p.id"
                class="search-item"
                @click="selectPersonaFromSearch(p)"
              >{{ getDisplayTitolo(p) }}</div>
              <p v-if="searchResults.length === 0" class="no-results">
                {{ t('common.noResults') }}
              </p>
            </div>
            <button class="btn btn-ghost" @click="showSearchModal = false">
              {{ t('common.close') }}
            </button>
          </div>
        </div>
      </transition>
    </teleport>
  </PageLayout>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDataStore, nationName, sortItemsAlpha } from '../stores/dataStore.js'
import DonutChart from '../components/DonutChart.vue'
import EuropeMap from '../components/EuropeMap.vue'
import PageLayout from '../components/PageLayout.vue'
import logo from '../components/Logo.vue'


const router = useRouter()
const { t, locale } = useI18n()
const store = useDataStore()

// Step navigazione: area → lingua (donut) | list-chart | list-map
const step               = ref('area')
const chartKey           = ref(0)
const selectedArea       = ref(null)
const selectedLang       = ref(null)
const selectedMapCountry = ref(null)
const currentList        = ref([])

const showLingueModal = ref(false)
const showSearchModal = ref(false)
const searchQuery     = ref('')

// Testi reattivi
const sideContent = ref('')
const descChartA  = ref('')
const descChartB  = ref('')

// ── Init e reattività locale ──────────────────────────────────────
onMounted(() => store.fetchAll())
watch(() => store.ieriLoaded, v => { if (v) initView() })
watch(locale, () => { if (store.ieriLoaded) refreshTexts() })
if (store.ieriLoaded) initView()

function initView() {
  step.value = 'area'
  selectedArea.value = null
  selectedLang.value = null
  selectedMapCountry.value = null
  currentList.value = []
  refreshTexts()
}

/** Ricostruisce le stringhe dipendenti da lingua corrente + step. */
function refreshTexts() {
  if (step.value === 'area') {
    descChartA.value = t('ieri.areaLabel')
    descChartB.value = t('ieri.nationLabel')
    sideContent.value = `${t('ieri.everyColor')} <b>${store.risonanzeIeri.length}</b> ${t('ieri.biografie')} ${t('ieri.clickToDiscover')}`
    return
  }
  if (step.value === 'lingua' && selectedArea.value) {
    descChartA.value = t('ieri.chartTitle')
    descChartB.value = selectedArea.value.toUpperCase()
    const count = countInArea(selectedArea.value)
    sideContent.value = t('ieri.areaSelected', { count, area: selectedArea.value.toUpperCase() })
    return
  }
  if (step.value === 'list-chart' && selectedLang.value) {
    descChartB.value = t('ieri.descLanguageMother', { lang: selectedLang.value.toUpperCase() })
    sideContent.value = t('ieri.languageSelected', {
      count: currentList.value.length,
      language: selectedLang.value.toUpperCase(),
    })
    return
  }
  if (step.value === 'list-map' && selectedMapCountry.value) {
    const nation = nationName(selectedMapCountry.value, locale.value)
    // Lista personaggi a sinistra, mappa a destra: i descrittori si invertono.
    descChartA.value = t('ieri.descBornIn', { nation: nation.toUpperCase() })
    descChartB.value = t('ieri.nationLabel')
    sideContent.value = t('ieri.nationSelected', {
      count: currentList.value.length,
      nation: nation.toUpperCase(),
    })
  }
}

// ── Utility ───────────────────────────────────────────────────────
function getDisplayTitolo(p) {
  return locale.value === 'en' && p.title ? p.title : p.titolo
}

function countInArea(areaName) {
  return store.risonanzeIeri.filter(r => {
    const a = store.areaById[r.area_geografico_linguistica]
    if (!a) return false
    const it = a.area_geografico_linguistica
    const en = a.linguistic_geographical_area
    return it === areaName || en === areaName
  }).length
}

// ── Donut chart data ──────────────────────────────────────────────
const chartData = computed(() => {
  if (!store.ieriLoaded) return { labels: [], datasets: [{ data: [], backgroundColor: [] }] }

  if (step.value === 'area' || step.value === 'list-map') {
    const groups = {}
    store.risonanzeIeri.forEach(r => {
      const area = store.areaById[r.area_geografico_linguistica]
      if (!area) return
      const name = locale.value === 'en'
        ? (area.linguistic_geographical_area || area.area_geografico_linguistica)
        : area.area_geografico_linguistica
      if (!groups[name]) groups[name] = { count: 0, color: area.color || '#888' }
      groups[name].count++
    })
    return {
      labels: Object.keys(groups),
      datasets: [{
        data: Object.values(groups).map(g => g.count),
        backgroundColor: Object.values(groups).map(g => g.color),
      }],
    }
  }

  if ((step.value === 'lingua' || step.value === 'list-chart') && selectedArea.value) {
    const inArea = store.risonanzeIeri.filter(r => {
      const a = store.areaById[r.area_geografico_linguistica]
      return a && (
        a.area_geografico_linguistica === selectedArea.value ||
        a.linguistic_geographical_area === selectedArea.value
      )
    })
    const groups = {}
    inArea.forEach(r => {
      const lingua = store.linguaById[r.lingua_madre]
      const name = locale.value === 'en'
        ? (lingua?.language || lingua?.lingua || String(r.lingua_madre))
        : (lingua?.lingua || String(r.lingua_madre))
      const color = lingua?.colors || '#888'
      if (!groups[name]) groups[name] = { count: 0, color }
      groups[name].count++
    })
    return {
      labels: Object.keys(groups),
      datasets: [{
        data: Object.values(groups).map(g => g.count),
        backgroundColor: Object.values(groups).map(g => g.color),
      }],
    }
  }

  return { labels: [], datasets: [{ data: [], backgroundColor: [] }] }
})

// ── Mappa ─────────────────────────────────────────────────────────
const mapActive = computed(() => {
  const active = {}
  Object.entries(store.dictNationsIeri).forEach(([sigla, list]) => {
    if (list.length > 0) active[sigla] = list.length
  })
  return active
})

// ── Click handlers ────────────────────────────────────────────────
function onChartClick(el, chart) {
  const label = chart.data.labels[el[0].index]

  // Step iniziale: scelta dell'area
  if (step.value === 'area') {
    selectedArea.value = label
    step.value = 'lingua'
    chartKey.value++
    refreshTexts()
    return
  }

  // Click su una lingua del chart: filtra i personaggi.
  // Funziona sia partendo da step 'lingua' (mappa visibile) sia
  // ri-cliccando un'altra lingua mentre siamo già su 'list-chart'.
  if (step.value === 'lingua' || step.value === 'list-chart') {
    const lingua = store.lingue.find(l => l.lingua === label || l.language === label)
    selectedLang.value = label
    currentList.value = lingua
      ? store.risonanzeIeri.filter(r => r.lingua_madre === lingua.id)
      : []
    step.value = 'list-chart'
    refreshTexts()
    return
  }

  // Click sul chart aree mentre siamo su 'list-map':
  // cambia il filtro nazione per quell'area? No — è più coerente
  // tornare a vedere le lingue di quella nuova area.
  if (step.value === 'list-map') {
    selectedArea.value = label
    selectedMapCountry.value = null
    currentList.value = []
    step.value = 'lingua'
    chartKey.value++
    refreshTexts()
  }
}

function onMapClick(sigla) {
  selectedMapCountry.value = sigla
  currentList.value = store.dictNationsIeri[sigla] || []
  step.value = 'list-map'
  refreshTexts()
}

// ── Lista filtrata e select persona ───────────────────────────────
const filteredList = computed(() =>
  [...currentList.value].sort((a, b) =>
    (a.cognome || '').toLowerCase().localeCompare((b.cognome || '').toLowerCase())
  )
)

function getAreaColor(p) {
  return store.areaById[p.area_geografico_linguistica]?.color || '#888'
}

function selectPersona(p) {
  const listIds = filteredList.value.map(x => x.id).join(',')
  router.push({
    name: 'persona',
    params: { id: p.id },
    query: { list: listIds },
  })
}

function selectPersonaFromSearch(p) {
  showSearchModal.value = false
  searchQuery.value = ''
  // Lista di un solo elemento: niente nav prev/next nella PersonaView
  router.push({
    name: 'persona',
    params: { id: p.id },
    query: { list: String(p.id) },
  })
}

// ── Search ────────────────────────────────────────────────────────
const searchResults = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()

  store.risonanzeIeri.sort((a, b) => {
    return sortItemsAlpha(a.titolo, b.titolo);
  });

  if (!q) return store.risonanzeIeri

  return store.risonanzeIeri
    .filter(p => {
      const it = (p.titolo || '').toLowerCase()
      const en = (p.title || '').toLowerCase()
      return it.includes(q) || en.includes(q)
    })
    .slice(0, 100)
    .sort()
})

// ── Back button della PageLayout ──────────────────────────────────
function goBack() {
  if (step.value === 'list-chart' || step.value === 'list-map') {
    step.value = step.value === 'list-map' ? 'area' : 'lingua'
    currentList.value = []
    selectedMapCountry.value = null
    refreshTexts()
    return
  }
  if (step.value === 'lingua') {
    step.value = 'area'
    selectedArea.value = null
    chartKey.value++
    refreshTexts()
    return
  }
  router.push('/')
}
</script>

<style scoped>
.ieri-main {
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
  padding: var(--sp-2) 50% var(--sp-2) var(--sp-3);
  font-size: var(--fs-md);
  line-height: 1.5;
  color: var(--w-85);
  font-weight: 500;
  text-align: center;       /* invariato: centra il testo dentro lo spazio "utile" */
  background: rgba(20, 16, 12, 0.55);
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

.names-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-2);
}

.name-item {
  border: 3px solid #888;
  border-radius: var(--radius-pill);
  padding: var(--sp-2) var(--sp-4);
  font-size: var(--fs-base);
  font-weight: 600;
  background: rgba(20, 16, 12, 0.6);
  cursor: pointer;
  transition: background var(--tr-base), transform var(--tr-base);
  text-align: center;
  min-height: 56px;
  display: inline-flex;
  align-items: center;
  color: var(--w-85);
}
.name-item:hover,
.name-item:active {
  background: rgba(20, 16, 12, 0.85);
  transform: scale(1.03);
}

@media (min-width: 2560px) {
  .name-item { min-height: 80px; padding: var(--sp-3) var(--sp-5); }
  .ieri-main { gap: var(--sp-4); }
}
</style>
