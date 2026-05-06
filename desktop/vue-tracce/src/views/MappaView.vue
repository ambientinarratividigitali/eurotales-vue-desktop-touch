<script setup>
/* MappaView — Leaflet, sidebar reattiva su pan/zoom, accordion legenda. */
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useDataStore, pick } from '../stores/dataStore.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const { t, locale } = useI18n()
const router = useRouter()
const store  = useDataStore()

const mapEl    = ref(null)
const accordionOpen = ref(false)
const visibleItems  = ref([])

let leafletMap = null
let markers = []   // {marker, item, luogo}

const ASSETS = 'https://www.directuseurotales.ambientinarratividigitali.it/assets'

function imgUrl(item) {
  const id = item.img_cover?.id || item.img_cover
  return id ? `${ASSETS}/${id}` : ''
}
function title(item) { return pick(item, 'titolo', 'titles', locale.value) }

// Fix Leaflet default marker icon URLs (problemi con bundler)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function buildMap() {
  if (leafletMap) return
  leafletMap = L.map(mapEl.value, {
    center: [54, 15],
    zoom: 4.25,
    minZoom: 4,
    maxZoom: 18,
    maxBounds: [[34.5, -11.0], [71.0, 40.0]],
    maxBoundsViscosity: 1.0,
    zoomControl: false,
  })
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 18 })
    .addTo(leafletMap)
  L.control.zoom({ position: 'bottomleft' }).addTo(leafletMap)

  leafletMap.on('moveend zoomend', updateVisible)
}

function rebuildMarkers() {
  if (!leafletMap || !store.tracceMappa) return
  // remove existing
  markers.forEach(({ marker }) => leafletMap.removeLayer(marker))
  markers = []

  store.tracceMappa.forEach(item => {
    const luogo = item.luogo
    const coords = luogo?.mappa?.coordinates
    if (!coords) return
    const [lng, lat] = coords
    const m = L.marker([lat, lng]).addTo(leafletMap)
    m.bindPopup(`<strong>${title(item)}</strong><br>${luogo.citta || ''}, ${luogo.via || ''}`)
    m.on('click', () => {
      // su tap dei marker la sidebar mostra la card visibile dell'elemento
    })
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

function goScheda(id) { router.push({ name: 'scheda', params: { id } }) }

onMounted(async () => {
  await store.ensureMapData()
  await nextTick()
  buildMap()
  rebuildMarkers()
})

onBeforeUnmount(() => {
  if (leafletMap) {
    leafletMap.off()
    leafletMap.remove()
    leafletMap = null
  }
  markers = []
})

// Quando cambia la lingua, ribuilda i popup (titoli localizzati)
watch(locale, rebuildMarkers)
// Se il store si carica più tardi
watch(() => store.tracceMappa, rebuildMarkers)
</script>

<template>
  <div class="mappa-view">
    <div class="map-stage">
      <div ref="mapEl" class="map-canvas"></div>

      <!-- Accordion legenda (sx) -->
      <div class="accordion-container">
        <button class="accordion-toggle"
                @click="accordionOpen = !accordionOpen">
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

      <!-- Sidebar marker list (dx) -->
      <div class="marker-list">
        <div v-for="{ item, luogo } in visibleItems" :key="item.id"
             class="marker-card" @click="goScheda(item.id)">
          <img v-if="imgUrl(item)" :src="imgUrl(item)" :alt="title(item)" class="card-img" />
          <div v-else class="card-img placeholder"></div>
          <div class="card-content">
            <div class="card-title">{{ title(item) }}</div>
            <div class="card-subtitle">
              {{ luogo.citta || '' }}<template v-if="luogo.via">, {{ luogo.via }}</template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mappa-view { padding: var(--sp-3); }

.map-stage {
  position: relative;
  width: 100%;
  height: calc(100vh - var(--header-h) - var(--sp-6));
  min-height: 480px;
}
.map-canvas { width: 100%; height: 100%; border-radius: var(--radius); }

/* — Sidebar destra: lista cards visibili nel viewport — */
.marker-list {
  position: absolute;
  top: var(--sp-3);
  right: var(--sp-3);
  width: clamp(280px, 22%, 420px);
  max-height: calc(100% - var(--sp-5));
  overflow-y: auto;
  z-index: 1000;
  border-radius: var(--radius);
  padding: var(--sp-2);
}
.marker-card {
  display: flex;
  align-items: center;
  background: var(--bg-card-soft);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius);
  padding: var(--sp-3) var(--sp-4);
  margin-bottom: var(--sp-3);
  cursor: pointer;
  transition: box-shadow 0.25s;
  height: clamp(120px, 12vh, 180px);
  overflow: hidden;
}
.marker-card:hover { box-shadow: var(--shadow); }
.card-img {
  flex-shrink: 0;
  width: clamp(80px, 8vw, 130px);
  height: clamp(80px, 8vw, 130px);
  border-radius: var(--radius);
  object-fit: cover;
  margin-right: var(--sp-4);
  background: var(--bg-card-hover);
}
.card-img.placeholder { background: var(--bg-card-hover); }
.card-content { flex: 1; min-width: 0; }
.card-title {
  font-weight: 700;
  font-size: var(--fs-base);
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

/* — Accordion legenda (sx) — */
.accordion-container {
  position: absolute;
  top: var(--sp-3);
  left: var(--sp-3);
  z-index: 1200;
  width: clamp(260px, 24%, 420px);
}
.accordion-toggle {
  width: 100%;
  background: var(--accent-deep);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--sp-3) var(--sp-4);
  font-size: var(--fs-base);
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-lg);
  min-height: var(--tap-min);
  transition: background 0.3s, transform 0.3s;
}
.accordion-toggle:hover {
  background: var(--accent-deep-2);
  transform: translateY(-1px);
}
.accordion-icon {
  font-size: var(--fs-md);
  transition: transform 0.3s;
  display: inline-block;
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
  padding: var(--sp-4);
  overflow-y: auto;
}
.legend-title {
  font-size: var(--fs-md);
  text-align: center;
  text-decoration: underline;
  margin-top: 0;
  color: var(--text);
}
.accordion-content p {
  text-align: justify;
  margin: var(--sp-3) 0;
  font-size: var(--fs-sm);
}

/* — Mobile / tablet — */
@media (max-width: 900px) {
  .marker-list, .accordion-container {
    width: 88%;
  }
  .marker-list { right: 6%; }
  .accordion-container { left: 6%; }
}
</style>
