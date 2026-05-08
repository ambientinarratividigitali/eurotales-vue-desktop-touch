<template>
  <PageLayout domain="ieri" @back="goBack">
    <header class="top-bar">
      <h1 class="page-title is-ieri">{{ titoloDinamico?.toUpperCase() }}</h1>
      <div class="header-actions">
      </div>
    </header>

    <div class="loading-screen" v-if="store.loading || !persona">
      <div class="spinner"></div>
    </div>

    <main class="persona-main" v-if="persona">
      <!-- SINISTRA: rings + foto + legenda + nav prev/next -->
      <section class="left-panel">
        <div class="panel-label">{{ t('ieri.ring.title') }}</div>

        <div class="ring-wrapper">
          <iframe :src="ringIframeUrl" class="ring-iframe" frameborder="0" scrolling="no"></iframe>
          <img v-if="persona.img" :src="imgUrl" class="persona-photo" alt="" />
        </div>

        <div class="colors-legend" v-if="colorLegend.length">
          <div v-for="item in colorLegend" :key="item.lingua" class="legend-item">
            <span class="legend-dot" :style="{ background: item.color }"></span>
            <span>{{ item.lingua }}</span>
          </div>
        </div>

        <div class="side-nav" v-if="fromList.length > 1">
          <button class="nav-btn" @click="prevPersona" :disabled="!hasPrev">
            ← {{ prevName }}
          </button>
          <button class="nav-btn nav-right" @click="nextPersona" :disabled="!hasNext">
            {{ nextName }} →
          </button>
        </div>
      </section>

      <!-- DESTRA: scheda biografica -->
      <section class="right-panel">
        <div class="info-scroll thin-scroll">
          <div class="info-block">
            <InfoRow v-if="persona.date_nascita" :label="t('ieri.fields.dataNascita')" :value="persona.date_nascita" />
            <InfoRow v-if="luogoNascita" :label="t('ieri.fields.luogoNascita')" :value="formatLuogo(luogoNascita)" />
            <InfoRow v-if="persona.data_morte" :label="t('ieri.fields.dataMorte')" :value="persona.data_morte" />
            <InfoRow v-if="luogoMorte" :label="t('ieri.fields.luogoMorte')" :value="formatLuogo(luogoMorte)" />
            <InfoRow v-if="attivita.length" :label="t('ieri.fields.attivita')" :value="attivita.join(', ')" />
            <InfoRow v-if="luoghiResidenza.length" :label="t('ieri.fields.luogoResidenza')" :value="luoghiResidenza.join(', ')" />
          </div>

          <div class="info-block">
            <InfoRow v-if="linguaMadre" :label="t('ieri.fields.linguaMadre')" :value="linguaMadre" />
            <InfoRow v-if="lingueQuotidiane.length" :label="t('ieri.fields.linguaQuotidiana')" :value="lingueQuotidiane.join(', ')" />
            <InfoRow v-if="lingueScuola.length" :label="t('ieri.fields.linguaScuola')" :value="lingueScuola.join(', ')" />
            <InfoRow v-if="lingueArte.length" :label="t('ieri.fields.linguaArte')" :value="lingueArte.join(', ')" />
            <InfoRow v-if="lingueApprese.length" :label="t('ieri.fields.altrelingue')" :value="lingueApprese.join(', ')" />
            <InfoRow v-if="areaLinguistica" :label="t('ieri.fields.areaLinguistica')" :value="areaLinguistica" />
          </div>

          <div class="info-block testo" v-if="bioDinamica">
            <p v-html="bioDinamica"></p>
          </div>

          <div class="info-block" v-if="persona.autore">
            <InfoRow :label="t('ieri.fields.autoreScheda')" :value="persona.autore" />
          </div>
        </div>
      </section>
    </main>

    <!-- Tabella lingue (modale) -->
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
  </PageLayout>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDataStore } from '../stores/dataStore.js'
import PageLayout from '../components/PageLayout.vue'

const route   = useRoute()
const router  = useRouter()
const { t, locale } = useI18n()
const store   = useDataStore()

const showLingueModal = ref(false)

// Componente locale per una riga "label: value"
const InfoRow = defineComponent({
  props: ['label', 'value'],
  setup: (p) => () => h('div', { class: 'info-row' }, [
    h('span', { class: 'lbl' }, p.label),
    h('b', null, p.value),
  ]),
})

// ── Persona corrente ───────────────────────────────────────────────
const persona = computed(() => store.getPersonaggioById(route.params.id))

// Titolo e bio: usa campo inglese se locale=='en' e disponibile
const titoloDinamico = computed(() =>
  locale.value === 'en' && persona.value?.title ? persona.value.title : persona.value?.titolo
)
const bioDinamica = computed(() =>
  locale.value === 'en' && persona.value?.text ? persona.value.text : persona.value?.testo
)

// ── Navigazione prev/next nella lista di provenienza ──────────────
const fromList = computed(() => {
  const ids = route.query.list
  return ids ? ids.split(',').map(Number) : []
})
const currentIndex = computed(() => fromList.value.indexOf(Number(route.params.id)))
const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < fromList.value.length - 1)

const prevName = computed(() => {
  const p = store.getPersonaggioById(fromList.value[currentIndex.value - 1])
  return locale.value === 'en' && p?.title ? p.title : (p?.titolo || '')
})
const nextName = computed(() => {
  const p = store.getPersonaggioById(fromList.value[currentIndex.value + 1])
  return locale.value === 'en' && p?.title ? p.title : (p?.titolo || '')
})

function prevPersona() {
  if (!hasPrev.value) return
  router.replace({
    name: 'persona',
    params: { id: fromList.value[currentIndex.value - 1] },
    query: route.query,
  })
}
function nextPersona() {
  if (!hasNext.value) return
  router.replace({
    name: 'persona',
    params: { id: fromList.value[currentIndex.value + 1] },
    query: route.query,
  })
}

// ── Dati derivati (tutti localizzati) ─────────────────────────────
const imgUrl = computed(() =>
  persona.value?.img
    ? `https://www.directuseurotales.ambientinarratividigitali.it/assets/${persona.value.img}`
    : ''
)
const luogoNascita    = computed(() => store.luogoFromId(persona.value?.luogo_nascita, locale.value))
const luogoMorte      = computed(() => store.luogoFromId(persona.value?.luogo_morte, locale.value))
const linguaMadre     = computed(() => store.linguaNameFromId(persona.value?.lingua_madre, locale.value))
const areaLinguistica = computed(() => store.areaNameFromId(persona.value?.area_geografico_linguistica, locale.value))

const lingueQuotidiane = computed(() => persona.value ? store.getRelLingue(persona.value.id, 0, locale.value) : [])
const lingueScuola     = computed(() => persona.value ? store.getRelLingue(persona.value.id, 1, locale.value) : [])
const lingueArte       = computed(() => persona.value ? store.getRelLingue(persona.value.id, 2, locale.value) : [])
const lingueApprese    = computed(() => persona.value ? store.getRelLingue(persona.value.id, 3, locale.value) : [])
const attivita         = computed(() => persona.value ? store.getAttivita(persona.value.id, locale.value) : [])
const luoghiResidenza  = computed(() => persona.value ? store.getLuoghiResidenza(persona.value.id, locale.value) : [])

function formatLuogo(l) {
  if (!l) return ''
  return l.stato ? `${l.nome} (${l.stato})` : l.nome
}

// ── Rings: legenda colori e iframe ────────────────────────────────
const colorLegend = computed(() => {
  if (!persona.value) return []
  const nomi = [
    linguaMadre.value,
    ...lingueQuotidiane.value,
    ...lingueScuola.value,
    ...lingueArte.value,
    ...lingueApprese.value,
  ].filter(Boolean)
  const seen = new Set()
  return nomi.reduce((acc, nome) => {
    if (seen.has(nome)) return acc
    seen.add(nome)
    // Cerca la lingua sia per nome it che en
    const l = store.lingue.find(x => x.lingua === nome || x.language === nome)
    if (l?.colors) acc.push({ lingua: nome, color: l.colors })
    return acc
  }, [])
})

const ringColors = computed(() =>
  colorLegend.value.length
    ? colorLegend.value.map(l => l.color)
    : ['#912B3D', '#2B917F', '#DBB971']
)

const ringIframeUrl = computed(() => {
  const encoded = encodeURIComponent(JSON.stringify(ringColors.value))
  return `${import.meta.env.BASE_URL}rings.html?c=${encoded}&t=${Date.now()}`
})

onMounted(() => {
  if (!store.ieriLoaded) store.fetchAll()
})

function goBack() { router.push({ name: 'ieri' }) }
</script>

<style scoped>
/* Layout della scheda — solo cose specifiche, il resto è in main.css */
.persona-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  position: relative;
  z-index: var(--z-content);
  padding: 0 var(--sp-4) calc(var(--sp-6) + var(--sp-6));
  overflow: hidden;
  gap: var(--sp-4);
  min-height: 0;
}

/* Sovrascrive lo stile globale solo per l'etichetta in QUESTA pagina */
.panel-label {
  font-size: var(--fs-xs); /* Rende il font più piccolo */
  padding: var(--sp-1) var(--sp-2); /* Riduce leggermente i margini interni */
  min-height: 28px; /* Riduce l'altezza minima del riquadro */
  letter-spacing: 0.05em; /* Aggiusta la spaziatura per renderlo leggibile */
}

.left-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: var(--sp-2);
  min-height: 0;
}

.ring-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}
.ring-iframe { width: 100%; height: 100%; border: none; background: transparent; }

.persona-photo {
  position: absolute;
  width:  clamp(80px, 8vw, 220px);
  height: clamp(80px, 8vw, 220px);
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--w-85);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.7);
  pointer-events: none;
}

.colors-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-1) var(--sp-3);
  justify-content: center;
  padding: var(--sp-2);
  max-height: clamp(70px, 8vh, 140px);
  overflow-y: auto;
  scrollbar-width: thin;
  background: rgba(20, 16, 12, 0.4);
  border-radius: var(--radius-md);
  border: 1px solid var(--w-08);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  font-size: var(--fs-sm);
  color: var(--w-85);
}
.legend-dot {
  width: clamp(14px, 1vw, 22px);
  height: clamp(14px, 1vw, 22px);
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
}

.side-nav {
  display: flex;
  justify-content: space-between;
  gap: var(--sp-2);
  padding: var(--sp-1) 0;
}

.nav-btn {
  background: var(--w-08);
  border: 1.5px solid var(--w-22);
  color: white;
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius-pill);
  font-size: var(--fs-base);
  font-family: var(--font-body);
  font-weight: 500;
  cursor: pointer;
  transition: background var(--tr-base), border-color var(--tr-base);
  flex: 1;
  min-height: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}
.nav-btn.nav-right { text-align: right; }
.nav-btn:hover:not(:disabled),
.nav-btn:active:not(:disabled) {
  background: var(--w-12);
  border-color: var(--w-45);
}
.nav-btn:disabled { opacity: 0.25; cursor: default; }

.right-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-left: 1px solid var(--w-12);
  padding-left: var(--sp-4);
  min-height: 0;
}

.info-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: var(--sp-2);
}

.info-block {
  margin-bottom: var(--sp-4);
  padding-bottom: var(--sp-3);
  border-bottom: 1px solid var(--w-08);
}
.info-block:last-child { border-bottom: none; }

.info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px var(--sp-3);
  margin-bottom: var(--sp-2);
  font-size: var(--fs-base);
  line-height: 1.5;
  align-items: baseline;
}
.lbl {
  color: var(--w-65);
  flex-shrink: 0;
  min-width: clamp(180px, 14vw, 320px);
  font-size: var(--fs-sm);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.info-row :deep(b) {
  color: white;
  font-weight: 600;
}

.testo p {
  font-size: var(--fs-base);
  line-height: 1.7;
  color: var(--w-85);
  text-align: justify;
}

.biblio {
  font-size: var(--fs-sm);
  line-height: 1.6;
  color: var(--w-65);
  margin-top: var(--sp-1);
}

@media (min-width: 2560px) {
  .nav-btn { min-height: 80px; padding: var(--sp-3) var(--sp-5); }
  .lbl { min-width: clamp(240px, 14vw, 360px); }
}

@media (max-width: 768px) {
  .persona-main {
    grid-template-columns: 1fr;
    grid-template-rows: 45vh 1fr;
  }
  .right-panel {
    border-left: none;
    border-top: 1px solid var(--w-08);
    padding-left: 0;
    padding-top: var(--sp-2);
  }
}
</style>
