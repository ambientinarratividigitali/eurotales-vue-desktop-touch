<script setup>
/* MappaView — vista unica: mappa fullscreen + lista dx + popup grande sx
   Ottimizzata per touchscreen 55" 4K. */
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDataStore, pick } from '../stores/dataStore.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const { t, locale } = useI18n()
const store = useDataStore()

const mapEl         = ref(null)
const accordionOpen = ref(false)
const visibleItems  = ref([])

/* — Popup scheda laterale — */
const popupItem    = ref(null)
const popupDetail  = ref(null)
const popupLoading = ref(false)
const inscriptionsOpen = ref(false)            // accordion unico raggruppato
const activeInscription = ref(0)               // tab attivo dentro al gruppo
const openDescription  = ref(false)
const openBibliography = ref(false)
const deepeningOpen    = ref(false)

let leafletMap = null
let markers    = []

const ASSETS = 'https://www.directuseurotales.ambientinarratividigitali.it/assets'

function imgUrl(it) {
  const id = it?.img_cover?.id || it?.img_cover
  return id ? `${ASSETS}/${id}` : ''
}
function titleOf(it) { return pick(it, 'titolo', 'titles', locale.value) }

/* ── helpers ───────────────────────────────────────────────────── */
function findM2M(obj, candidates) {
  if (!obj) return []
  for (const key of candidates) {
    if (Array.isArray(obj[key]) && obj[key].length > 0) return obj[key]
  }
  return []
}

function unwrapRel(rel, pivotKey) {
  if (!rel) return null
  if (typeof rel === 'object' && rel[pivotKey] && typeof rel[pivotKey] === 'object') return rel[pivotKey]
  if (typeof rel === 'object' && rel.id !== undefined) return rel
  return null
}

/* ── computed scheda popup ──────────────────────────────────────── */
const detail = computed(() => popupDetail.value)

const popupTitle = computed(() =>
  detail.value ? pick(detail.value, 'titolo', 'titles', locale.value) : titleOf(popupItem.value || {}))

const popupDescription = computed(() =>
  detail.value ? pick(detail.value, 'descrizione', 'description', locale.value) : '')

const popupDeepening = computed(() =>
  detail.value ? pick(detail.value, 'approfondimento', 'insight', locale.value) : '')

const popupBibliography = computed(() =>
  detail.value ? pick(detail.value, 'bibliografia', 'bibliography', locale.value) : '')

const popupDate = computed(() =>
  detail.value ? pick(detail.value, 'data', 'date', locale.value) : '')

const popupConservazione = computed(() =>
  detail.value ? pick(detail.value, 'conservazione', 'conservation', locale.value) : '')

const luogoPopup = computed(() => detail.value?.luogo || popupItem.value?.luogo || null)
const nazionePopup = computed(() => luogoPopup.value?.nazione || null)
const tipologiaPopup = computed(() => detail.value?.tipologia || null)

const cityCountry = computed(() => {
  if (!luogoPopup.value) return ''
  const citta = luogoPopup.value.citta || ''
  const naz   = (typeof nazionePopup.value === 'object' ? nazionePopup.value?.nazione : '') || ''
  if (citta && naz) return `${citta} (${naz})`
  return citta || naz
})

const tipologiaLabel = computed(() =>
  tipologiaPopup.value ? pick(tipologiaPopup.value, 'tipologia', 'typology', locale.value) : '')

const lingueList = computed(() => {
  if (!detail.value) return []
  const arr = findM2M(detail.value, ['lingua_tracce', 'tracce_lingue_3', 'tracce_lingue', 'lingue'])
  return arr
    .map(rel => unwrapRel(rel, 'lingue_id'))
    .filter(Boolean)
    .map(l => ({ id: l.id, label: pick(l, 'lingua', 'language', locale.value) }))
})

const sistemiScrittori = computed(() => {
  if (!detail.value) return []
  return findM2M(detail.value, ['sistemi_scrittori', 'tracce_sistemi_scrittori'])
    .map(rel => unwrapRel(rel, 'sistemi_scrittori_id'))
    .filter(Boolean)
    .map(s => pick(s, 'sistemi_scrittori', 'writing_systems', locale.value))
    .filter(Boolean)
})

const scritture = computed(() => {
  if (!detail.value) return []
  return findM2M(detail.value, ['scrittura', 'scritture', 'tracce_scritture'])
    .map(rel => unwrapRel(rel, 'scritture_id'))
    .filter(Boolean)
    .map(s => pick(s, 'scritture', 'writing', locale.value))
    .filter(Boolean)
})

/* — Iscrizioni: dedup per id, raggruppate in un unico accordion — */
const iscrizioni = computed(() => {
  if (!detail.value) return []
  const arr = findM2M(detail.value, ['iscrizioni'])
  const seen = new Set()
  return arr
    .map(rel => unwrapRel(rel, 'iscrizione_id'))
    .filter(Boolean)
    .filter(isc => { if (seen.has(isc.id)) return false; seen.add(isc.id); return true })
    .map(isc => ({
      id: isc.id,
      titolo: isc.titolo || '',
      testo: isc.testo || '',
      traduzione_italiana: isc.traduzione_italiana || '',
      traduzione_inglese:  isc.traduzione_inglese || '',
      data_iscrizione: isc.data_iscrizione || '',
      sistemi: findM2M(isc, ['sistemi_scrittori', 'iscrizione_sistemi_scrittori'])
        .map(r => unwrapRel(r, 'sistemi_scrittori_id')).filter(Boolean)
        .map(s => pick(s, 'sistemi_scrittori', 'writing_systems', locale.value)).filter(Boolean),
      scritture: findM2M(isc, ['scritture', 'iscrizione_scritture'])
        .map(r => unwrapRel(r, 'scritture_id')).filter(Boolean)
        .map(s => pick(s, 'scritture', 'writing', locale.value)).filter(Boolean),
      lingue: findM2M(isc, ['lingue', 'iscrizione_lingue'])
        .map(r => unwrapRel(r, 'lingue_id')).filter(Boolean)
        .map(l => pick(l, 'lingua', 'language', locale.value)).filter(Boolean),
    }))
})

const infoRows = computed(() => {
  const rows = []
  if (cityCountry.value)        rows.push({ k: t('scheda.location'),      v: cityCountry.value })
  if (popupDate.value)          rows.push({ k: t('scheda.date'),          v: popupDate.value })
  if (tipologiaLabel.value)     rows.push({ k: t('scheda.typology'),      v: tipologiaLabel.value })
  if (lingueList.value.length)  rows.push({ k: t('scheda.languages'),     v: lingueList.value.map(l => l.label).join(', ') })
  if (detail.value?.misure)     rows.push({ k: t('scheda.dimensions'),    v: detail.value.misure })
  if (detail.value?.materia)    rows.push({ k: t('scheda.material'),      v: detail.value.materia })
  if (popupConservazione.value) rows.push({ k: t('scheda.conservation'),  v: popupConservazione.value })
  if (detail.value?.n_inventario) rows.push({ k: t('scheda.inventory'),   v: detail.value.n_inventario })
  if (sistemiScrittori.value.length) rows.push({ k: t('scheda.writingSystems'), v: sistemiScrittori.value.join(', ') })
  if (scritture.value.length)   rows.push({ k: t('scheda.scripts'),       v: scritture.value.join(', ') })
  return rows
})

/* ── apri popup ─────────────────────────────────────────────────── */
async function openPopup(item) {
  inscriptionsOpen.value = false
  activeInscription.value = 0
  openDescription.value  = false
  openBibliography.value = false
  deepeningOpen.value    = false

  popupItem.value    = item
  popupDetail.value  = null
  popupLoading.value = true

  try {
    popupDetail.value = await store.fetchTraccia(item.id)
  } catch (e) {
    console.error('[MappaView] fetchTraccia', e)
  } finally {
    popupLoading.value = false
  }
}

function closePopup() {
  popupItem.value   = null
  popupDetail.value = null
}

/* ── Leaflet ────────────────────────────────────────────────────── */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function buildMap() {
  if (leafletMap) return
  leafletMap = L.map(mapEl.value, {
    center: [51, 12],
    zoom: 5.5,                    // più zoomato di prima (era 5)
    minZoom: 5.5,
    maxZoom: 18,
    
    zoomControl: false,
    tap: true,
    tapTolerance: 25,           // tap target più tollerante per dito
  })
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 18 })
    .addTo(leafletMap)
  L.control.zoom({ position: 'bottomleft' }).addTo(leafletMap)
  leafletMap.on('moveend zoomend', updateVisible)
}

function rebuildMarkers() {
  if (!leafletMap || !store.tracceMappa) return
  markers.forEach(({ marker }) => leafletMap.removeLayer(marker))
  markers = []

  // Icona più grande per il touch su 4K
  const bigIcon = L.icon({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize:    [38, 62],
    iconAnchor:  [19, 62],
    popupAnchor: [0, -56],
    shadowSize:  [62, 62],
  })

  store.tracceMappa.forEach(item => {
    const luogo = item.luogo
    const coords = luogo?.mappa?.coordinates
    if (!coords) return
    const [lng, lat] = coords
    const m = L.marker([lat, lng], { icon: bigIcon }).addTo(leafletMap)
    m.on('click', () => openPopup(item))
    markers.push({ marker: m, item, luogo })
  })
  updateVisible()
}

function updateVisible() {
  if (!leafletMap) return
  const bounds = leafletMap.getBounds()
  visibleItems.value = markers
    .filter(({ marker }) => bounds.contains(marker.getLatLng()))
    .map(({ item, luogo }) => ({ item, luogo }))
}

onMounted(async () => {
  await store.ensureMapData()
  await nextTick()
  buildMap()
  rebuildMarkers()
})

onBeforeUnmount(() => {
  if (leafletMap) { leafletMap.off(); leafletMap.remove(); leafletMap = null }
  markers = []
})

watch(locale, rebuildMarkers)
watch(() => store.tracceMappa, rebuildMarkers)
</script>

<template>
  <div class="mappa-fullscreen">
    <div ref="mapEl" class="map-canvas"></div>

    <!-- Accordion legenda (sx) — si nasconde quando il pannello è aperto -->
    <div class="accordion-container" :class="{ hidden: popupItem }">
      <button class="accordion-toggle" @click="accordionOpen = !accordionOpen">
        <span>{{ t('mappa.legend') }}</span>
        <span class="accordion-icon" :class="{ rotate: accordionOpen }">+</span>
      </button>
      <div class="accordion-content" :class="{ open: accordionOpen }">
        <h3 class="legend-title">{{ t('mappa.legendTitle') }}</h3>
        <p>{{ t('mappa.legendBody') }}</p>
        <p>{{ t('mappa.legendBody2') }}</p>
        <p>{{ t('mappa.legendBody3') }}</p>
        <p><strong>{{ t('mappa.legendCta') }}</strong></p>
      </div>
    </div>

    <!-- Sidebar lista marker (dx) — sempre presente, anche con popup aperto -->
    <div class="marker-list">
      <div v-for="{ item, luogo } in visibleItems" :key="item.id"
           class="marker-card"
           :class="{ 'is-active': popupItem && popupItem.id === item.id }"
           @click="openPopup(item)">
        <img v-if="imgUrl(item)" :src="imgUrl(item)" :alt="titleOf(item)" class="card-img" />
        <div v-else class="card-img placeholder"></div>
        <div class="card-content">
          <div class="card-title">{{ titleOf(item) }}</div>
          <div class="card-subtitle">
            {{ luogo.citta || '' }}<template v-if="luogo.via">, {{ luogo.via }}</template>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ PANNELLO SCHEDA GRANDE ════════════════════════════════ -->
    <transition name="panel-slide">
      <div v-if="popupItem" class="scheda-panel">

        <button class="panel-close" @click="closePopup" aria-label="Chiudi">✕</button>

        <div v-if="popupLoading" class="loader panel-loader"></div>

        <template v-else-if="popupDetail">
          <img v-if="imgUrl(popupDetail)" :src="imgUrl(popupDetail)"
               :alt="popupTitle" class="panel-cover" />

          <h2 class="panel-title">{{ popupTitle }}</h2>

          <!-- ═ ISCRIZIONI raggruppate in un unico blocco ═════════ -->
          <div v-if="iscrizioni.length" class="accordion-item">
            <button class="accordion-header" @click="inscriptionsOpen = !inscriptionsOpen">
              <span class="accordion-label">
                {{ iscrizioni.length > 1
                   ? `${t('scheda.inscription')} (${iscrizioni.length})`
                   : t('scheda.inscription') }}
              </span>
              <span class="accordion-arrow">{{ inscriptionsOpen ? '▲' : '▼' }}</span>
            </button>
            <div class="accordion-content-inner" :class="{ open: inscriptionsOpen }">

              <!-- Tabs se ci sono più iscrizioni -->
              <div v-if="iscrizioni.length > 1" class="tabs">
                <button
                  v-for="(isc, idx) in iscrizioni"
                  :key="isc.id"
                  class="tab-btn"
                  :class="{ active: activeInscription === idx }"
                  @click="activeInscription = idx">
                  {{ isc.titolo || `${t('scheda.inscription')} ${idx + 1}` }}
                </button>
              </div>

              <!-- Contenuto della iscrizione attiva -->
              <div v-if="iscrizioni[activeInscription]" class="inscription-body">
                <p v-if="iscrizioni[activeInscription].testo"
                   v-html="iscrizioni[activeInscription].testo"></p>
                <p v-if="locale === 'it' && iscrizioni[activeInscription].traduzione_italiana">
                  <strong>{{ t('scheda.italianTrans') }}:</strong><br>
                  <span v-html="iscrizioni[activeInscription].traduzione_italiana"></span>
                </p>
                <p v-if="locale === 'en' && iscrizioni[activeInscription].traduzione_inglese">
                  <strong>{{ t('scheda.englishTrans') }}:</strong><br>
                  <span v-html="iscrizioni[activeInscription].traduzione_inglese"></span>
                </p>
                <p v-if="iscrizioni[activeInscription].data_iscrizione">
                  <strong>{{ t('scheda.date') }}:</strong>
                  {{ iscrizioni[activeInscription].data_iscrizione }}
                </p>
                <p v-if="iscrizioni[activeInscription].sistemi.length">
                  <strong>{{ t('scheda.writingSystems') }}:</strong>
                  {{ iscrizioni[activeInscription].sistemi.join(', ') }}
                </p>
                <p v-if="iscrizioni[activeInscription].scritture.length">
                  <strong>{{ t('scheda.scripts') }}:</strong>
                  {{ iscrizioni[activeInscription].scritture.join(', ') }}
                </p>
                <p v-if="iscrizioni[activeInscription].lingue.length">
                  <strong>{{ t('scheda.languages') }}:</strong>
                  {{ iscrizioni[activeInscription].lingue.join(', ') }}
                </p>
              </div>
            </div>
          </div>

          <!-- DESCRIZIONE -->
          <div v-if="popupDescription" class="accordion-item">
            <button class="accordion-header" @click="openDescription = !openDescription">
              <span class="accordion-label">{{ t('scheda.description') }}</span>
              <span class="accordion-arrow">{{ openDescription ? '▲' : '▼' }}</span>
            </button>
            <div class="accordion-content-inner" :class="{ open: openDescription }">
              <p v-html="popupDescription"></p>
              <button v-if="popupDeepening && openDescription"
                      class="deepening-btn"
                      @click="deepeningOpen = !deepeningOpen">
                {{ deepeningOpen ? t('scheda.closeDeepening') : t('scheda.deepening') }}
              </button>
              <div v-if="deepeningOpen && openDescription"
                   class="appro-info" v-html="popupDeepening"></div>
            </div>
          </div>

          <!-- BIBLIOGRAFIA -->
          <div v-if="popupBibliography" class="accordion-item">
            <button class="accordion-header" @click="openBibliography = !openBibliography">
              <span class="accordion-label">{{ t('scheda.bibliography') }}</span>
              <span class="accordion-arrow">{{ openBibliography ? '▲' : '▼' }}</span>
            </button>
            <div class="accordion-content-inner" :class="{ open: openBibliography }">
              <p v-html="popupBibliography"></p>
            </div>
          </div>

          <!-- TABELLA INFO -->
          <table v-if="infoRows.length" class="info-table">
            <tbody>
              <tr v-for="(row, i) in infoRows" :key="i">
                <td class="info-label"><strong>{{ row.k }}:</strong></td>
                <td class="info-value">{{ row.v }}</td>
              </tr>
            </tbody>
          </table>

          <!-- META autori -->
          <div class="meta-block">
            <p v-if="popupDetail.autore_scheda">
              <strong>{{ t('scheda.cardAuthor') }}:</strong> {{ popupDetail.autore_scheda }}
            </p>
            <p v-if="popupDetail.autore_traduzione">
              <strong>{{ t('scheda.transAuthor') }}:</strong> {{ popupDetail.autore_traduzione }}
            </p>
          </div>
        </template>

        <template v-else>
          <h2 class="panel-title">{{ titleOf(popupItem) }}</h2>
          <p v-if="popupItem.luogo?.citta" class="panel-city">{{ popupItem.luogo.citta }}</p>
        </template>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* ── Fullscreen ─────────────────────────────────────────────────── */
.mappa-fullscreen {
  position: fixed;
  inset: var(--header-h) 0 0 0;
  overflow: hidden;
}

.map-canvas {
  width: 100%;
  height: 100%;
}

/* Marker Leaflet più grandi al volo (CSS) */
:deep(.leaflet-marker-icon) {
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
}
:deep(.leaflet-control-zoom a) {
  width: var(--tap-min) !important;
  height: var(--tap-min) !important;
  line-height: var(--tap-min) !important;
  font-size: var(--fs-lg) !important;
}

/* ── Accordion legenda (sx) ─────────────────────────────────────── */
.accordion-container {
  position: absolute;
  top: var(--sp-4);
  left: var(--sp-4);
  z-index: 1200;
  width: clamp(360px, 22%, 560px);
  transition: opacity 0.3s, transform 0.3s;
}
.accordion-container.hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateX(-30px);
}

.accordion-toggle {
  width: 100%;
  background: var(--accent-deep);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--sp-4) var(--sp-5);
  font-size: var(--fs-md);
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-lg);
  min-height: var(--tap-large);
  cursor: pointer;
}

.accordion-icon {
  font-size: var(--fs-lg);
  transition: transform 0.3s;
  display: inline-block;
  margin-left: var(--sp-3);
}
.accordion-icon.rotate { transform: rotate(45deg); }

.accordion-content {
  margin-top: var(--sp-3);
  background: rgba(251, 243, 234, 0.97);
  border-radius: var(--radius-lg);
  padding: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease, padding 0.3s ease;
  box-shadow: var(--shadow-lg);
  color: var(--text);
}
.accordion-content.open {
  max-height: 70vh;
  padding: var(--sp-5);
  overflow-y: auto;
}
.legend-title {
  font-size: var(--fs-lg);
  text-align: center;
  text-decoration: underline;
  margin-top: 0;
  color: var(--text);
}
.accordion-content p {
  text-align: justify;
  margin: var(--sp-3) 0;
  font-size: var(--fs-base);
  line-height: 1.5;
}

/* ── Sidebar lista marker (dx) ──────────────────────────────────── */
.marker-list {
  position: absolute;
  top: var(--sp-4);
  right: var(--sp-4);
  width: clamp(380px, 24%, 600px);
  max-height: calc(100% - var(--sp-7));
  overflow-y: auto;
  z-index: 1000;
  border-radius: var(--radius);
  padding: var(--sp-3);
  -webkit-overflow-scrolling: touch;
}

.marker-card {
  display: flex;
  align-items: center;
  background: var(--bg-card-soft);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius);
  padding: var(--sp-4);
  margin-bottom: var(--sp-3);
  cursor: pointer;
  transition: box-shadow 0.2s, background 0.2s;
  min-height: clamp(140px, 14vh, 200px);
  overflow: hidden;
  /* tap state attivo */
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.marker-card:active {
  background: var(--bg-card-hover);
  transform: scale(0.99);
}
.marker-card.is-active {
  background: var(--accent);
  box-shadow: var(--shadow);
}
.marker-card.is-active .card-title,
.marker-card.is-active .card-subtitle { color: var(--text); }

.card-img {
  flex-shrink: 0;
  width: clamp(110px, 10vw, 180px);
  height: clamp(110px, 10vw, 180px);
  border-radius: var(--radius);
  object-fit: cover;
  margin-right: var(--sp-4);
  background: var(--bg-card-hover);
}
.card-img.placeholder { background: var(--bg-card-hover); }
.card-content { flex: 1; min-width: 0; }
.card-title {
  font-weight: 700;
  font-size: var(--fs-md);
  margin-bottom: var(--sp-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text);
}
.card-subtitle {
  font-size: var(--fs-sm);
  color: var(--text-soft);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Pannello scheda GRANDE (sx) ────────────────────────────────── */
.scheda-panel {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: clamp(560px, 48%, 1100px);
  background: rgba(251, 243, 234, 0.97);
  backdrop-filter: blur(12px);
  z-index: 1500;
  overflow-y: auto;
  padding: var(--sp-6) var(--sp-6) var(--sp-7);
  box-shadow: 6px 0 32px rgba(0,0,0,0.22);
  -webkit-overflow-scrolling: touch;
}

.panel-close {
  position: sticky;
  top: 0;
  float: right;
  background: var(--accent-deep);
  color: white;
  border: none;
  border-radius: 50%;
  width: var(--tap-large);
  height: var(--tap-large);
  font-size: var(--fs-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  margin-bottom: var(--sp-3);
  box-shadow: var(--shadow);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.panel-close:active { background: var(--accent-deep-2); transform: scale(0.95); }

.panel-cover {
  width: 100%;
  max-height: clamp(280px, 35vh, 560px);
  object-fit: cover;
  border-radius: var(--radius);
  margin-bottom: var(--sp-5);
  clear: both;
  display: block;
}

.panel-title {
  font-size: var(--fs-2xl);
  font-weight: 700;
  margin: 0 0 var(--sp-5);
  color: var(--text);
  clear: both;
  line-height: 1.2;
}

.panel-city {
  font-size: var(--fs-md);
  color: var(--text-soft);
  margin: 0 0 var(--sp-4);
}

.panel-loader {
  margin-top: var(--sp-7);
  width: clamp(48px, 4vw, 72px);
  height: clamp(48px, 4vw, 72px);
  clear: both;
}

/* ── Accordion interno pannello ─────────────────────────────────── */
.accordion-item {
  margin-bottom: var(--sp-4);
  border-bottom: 2px solid var(--border);
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: transparent;
  border: none;
  padding: var(--sp-4) var(--sp-3);
  text-align: left;
  font-size: var(--fs-lg);
  cursor: pointer;
  color: var(--text-soft);
  font-weight: 700;
  min-height: var(--tap-large);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.accordion-header:active { background: rgba(0,0,0,0.04); }
.accordion-label { flex: 1; }
.accordion-arrow {
  font-size: var(--fs-md);
  margin-left: var(--sp-3);
  color: var(--text-soft);
}

.accordion-content-inner {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease, padding 0.3s ease;
  text-align: justify;
  padding: 0 var(--sp-3);
}
.accordion-content-inner.open {
  max-height: 8000px;
  padding: var(--sp-4) var(--sp-3);
  border-top: 1px solid var(--border);
}
.accordion-content-inner :deep(p) {
  margin-top: var(--sp-3);
  font-size: var(--fs-base);
  line-height: 1.6;
}

/* ── Tabs interne (per gruppo iscrizioni) ───────────────────────── */
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin-bottom: var(--sp-4);
  padding-bottom: var(--sp-3);
  border-bottom: 1px dashed var(--border);
}
.tab-btn {
  background: var(--bg-card);
  border: 2px solid transparent;
  color: var(--text-soft);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius);
  font-size: var(--fs-sm);
  font-weight: 600;
  min-height: var(--tap-min);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.tab-btn:active { background: var(--bg-card-hover); }
.tab-btn.active {
  background: var(--accent);
  color: var(--text);
  border-color: var(--accent-strong);
}

.inscription-body :deep(p) {
  font-size: var(--fs-base);
  line-height: 1.6;
}

/* ── Tabella info ───────────────────────────────────────────────── */
.info-table {
  border-collapse: collapse;
  width: 100%;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-top: var(--sp-5);
}
.info-table td {
  padding: var(--sp-3) var(--sp-4);
  border: none;
  vertical-align: top;
  font-size: var(--fs-base);
}
.info-label { width: 38%; }

/* ── Meta autori ─────────────────────────────────────────────────── */
.meta-block { margin-top: var(--sp-5); }
.meta-block p { font-size: var(--fs-sm); margin: var(--sp-2) 0; }

/* ── Approfondimento ─────────────────────────────────────────────── */
.deepening-btn {
  display: block;
  margin-top: var(--sp-5);
  text-align: center;
  color: var(--text-soft);
  font-size: var(--fs-md);
  border: 2px solid var(--text-soft);
  padding: var(--sp-4) var(--sp-5);
  border-radius: var(--radius);
  background: transparent;
  width: 100%;
  cursor: pointer;
  min-height: var(--tap-large);
  font-weight: 600;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.deepening-btn:active { background: var(--bg-card); }
.appro-info {
  margin-top: var(--sp-4);
  font-size: var(--fs-sm);
  text-align: justify;
  line-height: 1.5;
}

/* ── Transizione pannello ───────────────────────────────────────── */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
