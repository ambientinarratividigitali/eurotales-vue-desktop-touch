<template>
  <div class="page">
    <!-- Sfondo decorativo -->
    <div class="bg-static" aria-hidden="true"></div>

    <!-- Header: logo + istruzione + legenda lingue + filtro -->
    <PageHeader
      v-if="store.loaded"
      :languages="selectedLanguageObjs"
      :show-filter="true"
      @open-filters="showFilters = true"
    />
    <PageHeader v-else />

    <!-- Stage centrale: timeline + overlay (loading/errore) -->
    <div class="timeline-stage">
      <!-- Loading -->
      <div v-if="store.loading" class="loading-screen">
        <div class="spinner"></div>
        <p>{{ t('ui.loading') }}</p>
      </div>

      <!-- Errore -->
      <div v-if="store.error" class="error-screen">
        <p>⚠️ {{ t('errors.fetchFailed') }}</p>
        <button class="btn btn-oro" @click="store.forceRefresh">
          {{ t('ui.loading') }}
        </button>
      </div>

      <!-- Timeline canvas -->
      <TimelineCanvas
        v-if="store.loaded"
        ref="timelineRef"
        :key="timelineKey"
        :events="filteredEvents"
        :marker-styles="markerStyles"
        @marker-click="onMarkerClick"
      />
    </div>

    <!-- Footer: zoom + frecce + categorie + lang switcher -->
    <PageFooter
      v-if="store.loaded"
      v-model:selectedCategories="selectedCategoryIds"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @prev-marker="prevMarker"
      @next-marker="nextMarker"
    />

    <!-- Popup info evento -->
    <InfoPopup :event="selectedEvent" @close="selectedEvent = null" />

    <!-- Popup filtri (solo lingue) -->
    <FiltersPopup
      :open="showFilters"
      v-model:selectedLanguages="selectedLanguageIds"
      :max-languages="MAX_LANGUAGES"
      :min-languages="MIN_LANGUAGES"
      @close="showFilters = false"
      @apply="onApplyFilters"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDataStore } from '../stores/dataStore.js'
import PageHeader from '../components/PageHeader.vue'
import PageFooter from '../components/PageFooter.vue'
import TimelineCanvas from '../components/TimelineCanvas.vue'
import InfoPopup from '../components/InfoPopup.vue'
import FiltersPopup from '../components/FiltersPopup.vue'

const { t, locale } = useI18n()
const store = useDataStore()

// ── Limiti per i filtri lingua ──────────────────────────────
const MAX_LANGUAGES = 5000
const MIN_LANGUAGES = 1

// ── Stato locale ────────────────────────────────────────────
const showFilters         = ref(false)
const selectedEvent       = ref(null)
const selectedLanguageIds = ref([])
const selectedCategoryIds = ref([])
const timelineKey         = ref(0)
const timelineRef         = ref(null)

// ── Bootstrap dati ──────────────────────────────────────────
onMounted(async () => {
  await store.fetchAll()
  // Selezione iniziale: italiano + inglese se presenti
  const starter = store.lingue
    .filter(l => ['italiano', 'inglese'].includes(l.lingua?.toLowerCase()))
    .map(l => l.id)
  selectedLanguageIds.value = starter.length
    ? starter
    : store.lingue.slice(0, 2).map(l => l.id)
  selectedCategoryIds.value = store.categorie.map(c => c.id)
})

// ── Eventi filtrati e localizzati ───────────────────────────
const filteredEvents = computed(() => {
  if (!store.loaded) return []
  return store.milestones
    .filter(m => m.Anno != null)
    .filter(m => selectedLanguageIds.value.includes(m.lingua))
    .filter(m => selectedCategoryIds.value.includes(m.categoria))
    .map(m => store.localizedEvent(m, locale.value))
})

// ── Stili marker (colore lingua + bordo se ha immagine) ─────
const markerStyles = computed(() => {
  const map = {}
  filteredEvents.value.forEach(e => {
    map[String(e.id)] = {
      color: e.colore,
      hasImage: !!e.immagine,
      whiteText: e.textColor === 'white',
    }
  })
  return map
})

const selectedLanguageObjs = computed(() =>
  selectedLanguageIds.value
    .map(id => store.linguaById[id])
    .filter(Boolean)
)

// ── Reattività: re-render timeline su cambi rilevanti ──────
function rebuildTimeline() { timelineKey.value++ }

watch(
  [selectedLanguageIds, selectedCategoryIds, locale],
  rebuildTimeline,
  { deep: true }
)

function onApplyFilters() {
  showFilters.value = false
  rebuildTimeline()
}

function onMarkerClick(uniqueId) {
  const milestone = store.milestones.find(m => String(m.id) === String(uniqueId))
  if (milestone) selectedEvent.value = store.localizedEvent(milestone, locale.value)
}

function zoomIn()  { timelineRef.value?.zoomIn() }
function zoomOut() { timelineRef.value?.zoomOut() }
function prevMarker() { timelineRef.value?.prevMarker() }
function nextMarker() { timelineRef.value?.nextMarker() }
</script>

<style scoped>
.page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: var(--beige);
}

.bg-static {
  position: absolute;
  inset: 0;
  z-index: var(--z-bg);
  background:
    radial-gradient(ellipse at 30% 20%, rgba(145,43,61,0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 80%, rgba(43,145,127,0.08) 0%, transparent 60%),
    var(--beige);
  pointer-events: none;
}

/* Stage centrale: spazio rimanente fra header e footer */
.timeline-stage {
  position: relative;
  flex: 1;
  min-height: 0;
}

.error-screen {
  position: absolute;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  background: var(--b-65);
  color: white;
}
</style>
