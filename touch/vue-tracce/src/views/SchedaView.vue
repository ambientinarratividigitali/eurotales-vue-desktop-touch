<script setup>
/* SchedaView — dettaglio singola traccia con accordion + mappa + tags + lingue.
   Sfrutta `?fields=*.*.*` di Directus: tutti gli oggetti annidati in 1 chiamata. */
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { pick, useDataStore } from '../stores/dataStore.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({ id: { type: [String, Number], required: true } })
const { t, locale } = useI18n()
const router = useRouter()
const store = useDataStore()

const ASSETS = 'https://www.directuseurotales.ambientinarratividigitali.it/assets'

/* — Fallback discovery: Directus può chiamare la relazione M2M con nomi diversi
   (es. 'iscrizioni' vs 'iscrizione', 'tags' vs 'tracce_tags'). Provo i candidati. */
function findM2M(obj, candidates) {
  if (!obj) return []
  for (const key of candidates) {
    if (Array.isArray(obj[key])) return obj[key]
  }
  return []
}

/* — Estrae l'oggetto correlato da una relazione M2M:
   - se la riga è un pivot {foo_id: {...}}, ritorna l'oggetto
   - se è già l'oggetto, lo ritorna così com'è
   - se è solo un id (numero), ritorna null (oggetto non hydrato) */
function unwrapRel(rel, pivotKey) {
  if (!rel) return null
  if (typeof rel === 'object' && rel[pivotKey] && typeof rel[pivotKey] === 'object') {
    return rel[pivotKey]
  }
  if (typeof rel === 'object' && (rel.id !== undefined)) return rel
  return null
}

const item = ref(null)
const loading = ref(true)
const error = ref(null)
const mapEl = ref(null)
let leafletMap = null

/* — accordion state — */
const openInscriptions = ref({})  // {iscrizioneId: bool}
const openDescription = ref(false)
const openBibliography = ref(false)
const deepeningOpen = ref(false)

/* — load — */
async function load() {
  loading.value = true; error.value = null
  try {
    item.value = await store.fetchTraccia(props.id)
  } catch (e) {
    error.value = e.message
    console.error('[SchedaView] fetch failed', e)
  } finally {
    loading.value = false
  }
}

watch(() => props.id, load, { immediate: false })

onMounted(load)

/* — build map dopo che l'item è caricato — */
watch(item, async (val) => {
  if (!val) return
  await nextTick()
  buildMap()
})

function buildMap() {
  if (leafletMap) { leafletMap.remove(); leafletMap = null }
  const luogo = item.value?.luogo
  const coords = luogo?.mappa?.coordinates
  if (!coords || !mapEl.value) return
  const [lng, lat] = coords

  // Fix default icon
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  leafletMap = L.map(mapEl.value, { zoomControl: true, attributionControl: false }).setView([lat, lng], 14)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 18, minZoom: 4 })
    .addTo(leafletMap)
  L.marker([lat, lng]).addTo(leafletMap)
}

onBeforeUnmount(() => {
  if (leafletMap) { leafletMap.remove(); leafletMap = null }
})

/* — formatters / pickers — */
function imgUrl(it) {
  const id = it?.img_cover?.id || it?.img_cover
  return id ? `${ASSETS}/${id}` : ''
}
function fmtDate(str) {
  if (!str) return ''
  try {
    const d = new Date(str)
    return d.toLocaleDateString(locale.value === 'en' ? 'en-GB' : 'it-IT',
      { year: 'numeric', month: 'long', day: 'numeric' })
  } catch { return str }
}

const itemTitle = computed(() => item.value ? pick(item.value, 'titolo', 'titles', locale.value) : '')
const itemDescription = computed(() => item.value ? pick(item.value, 'descrizione', 'description', locale.value) : '')
const itemDeepening = computed(() => item.value ? pick(item.value, 'approfondimento', 'insight', locale.value) : '')
const itemBibliography = computed(() => item.value ? pick(item.value, 'bibliografia', 'bibliography', locale.value) : '')
const itemDate = computed(() => item.value ? pick(item.value, 'data', 'date', locale.value) : '')
const itemConservazione = computed(() => item.value ? pick(item.value, 'conservazione', 'conservation', locale.value) : '')

const luogo = computed(() => item.value?.luogo || null)
const nazione = computed(() => luogo.value?.nazione || null)
const tipologia = computed(() => item.value?.tipologia || null)

const cityCountry = computed(() => {
  if (!luogo.value) return ''
  const citta = luogo.value.citta || ''
  const naz   = nazione.value?.nazione || ''
  if (citta && naz) return `${citta} (${naz})`
  return citta || naz
})

const tipologiaLabel = computed(() => tipologia.value
  ? pick(tipologia.value, 'tipologia', 'typology', locale.value)
  : '')

/* — relazioni M2M (vengono come array di {tags_id, lingue_id, ...} con oggetto annidato) — */
const tagsList = computed(() => {
  const arr = findM2M(item.value, ['tags', 'tracce_tags'])
  return arr
    .map(rel => unwrapRel(rel, 'tags_id'))
    .filter(Boolean)
    .map(tag => ({
      id: tag.id,
      label: pick(tag, 'tag', 'tag_inglese', locale.value),
    }))
})

const lingueList = computed(() => {
  const arr = findM2M(item.value, ['lingua_tracce', 'tracce_lingue_3', 'tracce_lingue', 'lingue'])
  return arr
    .map(rel => unwrapRel(rel, 'lingue_id'))
    .filter(Boolean)
    .map(l => ({
      id: l.id,
      label: pick(l, 'lingua', 'language', locale.value),
      slug: l.lingua,   // la rotta filtra per nome italiano (canonico nel DB)
    }))
})

const sistemiScrittori = computed(() => {
  const arr = findM2M(item.value, ['sistemi_scrittori', 'tracce_sistemi_scrittori'])
  return arr
    .map(rel => unwrapRel(rel, 'sistemi_scrittori_id'))
    .filter(Boolean)
    .map(s => pick(s, 'sistemi_scrittori', 'writing_systems', locale.value))
    .filter(Boolean)
})

const scritture = computed(() => {
  const arr = findM2M(item.value, ['scrittura', 'scritture', 'tracce_scritture'])
  return arr
    .map(rel => unwrapRel(rel, 'scritture_id'))
    .filter(Boolean)
    .map(s => pick(s, 'scritture', 'writing', locale.value))
    .filter(Boolean)
})

const iscrizioni = computed(() => {
  // Tabella relazione tracce ↔ iscrizione: array di {iscrizione_id: {…}}
  const arr = findM2M(item.value, ['iscrizioni'])
  const seen = new Set()
  return arr
    .map(rel => unwrapRel(rel, 'iscrizione_id'))
    .filter(Boolean)
    .filter(isc => { if (seen.has(isc.id)) return false; seen.add(isc.id); return true })
    .map(isc => ({
      id: isc.id,
      testo: isc.testo || '',
      traduzione_italiana: isc.traduzione_italiana || '',
      traduzione_inglese:  isc.traduzione_inglese || '',
      data_iscrizione: isc.data_iscrizione || '',
      sistemi: findM2M(isc, ['sistemi_scrittori', 'iscrizione_sistemi_scrittori'])
        .map(r => unwrapRel(r, 'sistemi_scrittori_id'))
        .filter(Boolean)
        .map(s => pick(s, 'sistemi_scrittori', 'writing_systems', locale.value))
        .filter(Boolean),
      scritture: findM2M(isc, ['scritture', 'iscrizione_scritture'])
        .map(r => unwrapRel(r, 'scritture_id'))
        .filter(Boolean)
        .map(s => pick(s, 'scritture', 'writing', locale.value))
        .filter(Boolean),
      lingue: findM2M(isc, ['lingue', 'iscrizione_lingue'])
        .map(r => unwrapRel(r, 'lingue_id'))
        .filter(Boolean)
        .map(l => pick(l, 'lingua', 'language', locale.value))
        .filter(Boolean),
    }))
})

/* — info table rows — */
const infoRows = computed(() => {
  const rows = []
  if (cityCountry.value)     rows.push({ k: t('scheda.location'),       v: cityCountry.value })
  if (itemDate.value)        rows.push({ k: t('scheda.date'),           v: itemDate.value })
  if (tipologiaLabel.value)  rows.push({ k: t('scheda.typology'),       v: tipologiaLabel.value })
  if (lingueList.value.length) rows.push({ k: t('scheda.languages'),    v: lingueList.value.map(l => l.label).join(', ') })
  if (item.value?.misure)    rows.push({ k: t('scheda.dimensions'),     v: item.value.misure })
  if (item.value?.materia)   rows.push({ k: t('scheda.material'),       v: item.value.materia })
  if (itemConservazione.value) rows.push({ k: t('scheda.conservation'), v: itemConservazione.value })
  if (item.value?.n_inventario) rows.push({ k: t('scheda.inventory'),   v: item.value.n_inventario })
  if (sistemiScrittori.value.length) rows.push({ k: t('scheda.writingSystems'), v: sistemiScrittori.value.join(', ') })
  if (scritture.value.length) rows.push({ k: t('scheda.scripts'),       v: scritture.value.join(', ') })
  return rows
})

/* — directional address (linea-luogo a piè della mappa) — */
const fullAddress = computed(() => {
  if (!luogo.value) return ''
  const parts = []
  if (luogo.value.Edificio) parts.push(luogo.value.Edificio)
  let via = ''
  if (luogo.value.via)            via += luogo.value.via
  if (luogo.value.numero_civico)  via += ' ' + luogo.value.numero_civico
  if (via.trim()) parts.push(via.trim())
  if (luogo.value.citta) parts.push(luogo.value.citta)
  let result = parts.join(', ')
  if (nazione.value?.nazione) result += ` (${nazione.value.nazione})`
  return result
})

function toggleInscription(id) { openInscriptions.value[id] = !openInscriptions.value[id] }
</script>

<template>
  <div class="scheda-view">
    <div class="back-row">
      <router-link :to="{ name: 'gallery' }" class="back-pill">
        ← {{ t('app.backToTracesBig') }}
      </router-link>
    </div>

    <div v-if="loading" class="loader"></div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>

    <template v-else-if="item">
      <h1 class="scheda-title">{{ itemTitle }}</h1>

      <div class="container">
        <!-- COL SX: immagine + iscrizioni + descrizione + bibliografia -->
        <section class="image-section">
          <img v-if="imgUrl(item)" :src="imgUrl(item)" :alt="itemTitle" />

          <div class="description-container">
            <!-- ISCRIZIONI (accordion ognuna) -->
            <div v-for="isc in iscrizioni" :key="isc.id" class="accordion-item">
              <div class="accordion-title-container">
                <button class="accordion-header" @click="toggleInscription(isc.id)">
                  {{ t('scheda.inscription') }}
                </button>
                <span class="accordion-arrow">{{ openInscriptions[isc.id] ? '▲' : '▼' }}</span>
              </div>
              <hr class="accordion-underline" />
              <div class="accordion-content" :class="{ open: openInscriptions[isc.id] }">
                <p v-if="isc.testo" v-html="isc.testo"></p>
                <p v-if="locale === 'it' && isc.traduzione_italiana">
                  <strong>{{ t('scheda.italianTrans') }}:</strong><br>
                  <span v-html="isc.traduzione_italiana"></span>
                </p>
                <p v-if="locale === 'en' && isc.traduzione_inglese">
                  <strong>{{ t('scheda.englishTrans') }}:</strong><br>
                  <span v-html="isc.traduzione_inglese"></span>
                </p>
                <p v-if="isc.data_iscrizione">
                  <strong>{{ t('scheda.date') }}:</strong> {{ isc.data_iscrizione }}
                </p>
                <p v-if="isc.sistemi.length">
                  <strong>{{ t('scheda.writingSystems') }}:</strong> {{ isc.sistemi.join(', ') }}
                </p>
                <p v-if="isc.scritture.length">
                  <strong>{{ t('scheda.scripts') }}:</strong> {{ isc.scritture.join(', ') }}
                </p>
                <p v-if="isc.lingue.length">
                  <strong>{{ t('scheda.languages') }}:</strong> {{ isc.lingue.join(', ') }}
                </p>
              </div>
            </div>

            <!-- DESCRIZIONE -->
            <div v-if="itemDescription" class="accordion-item">
              <div class="accordion-title-container">
                <button class="accordion-header" @click="openDescription = !openDescription">
                  {{ t('scheda.description') }}
                </button>
                <span class="accordion-arrow">{{ openDescription ? '▲' : '▼' }}</span>
              </div>
              <hr class="accordion-underline" />
              <div class="accordion-content" :class="{ open: openDescription }">
                <p v-html="itemDescription"></p>

                <!-- Approfondimento -->
                <button v-if="itemDeepening && openDescription"
                        class="deepening-btn"
                        @click="deepeningOpen = !deepeningOpen">
                  {{ deepeningOpen ? t('scheda.closeDeepening') : t('scheda.deepening') }}
                </button>
                <div v-if="deepeningOpen && openDescription"
                     class="appro-info"
                     v-html="itemDeepening"></div>
              </div>
            </div>

            <!-- BIBLIOGRAFIA -->
            <div v-if="itemBibliography" class="accordion-item">
              <div class="accordion-title-container">
                <button class="accordion-header" @click="openBibliography = !openBibliography">
                  {{ t('scheda.bibliography') }}
                </button>
                <span class="accordion-arrow">{{ openBibliography ? '▲' : '▼' }}</span>
              </div>
              <hr class="accordion-underline" />
              <div class="accordion-content" :class="{ open: openBibliography }">
                <p v-html="itemBibliography"></p>
              </div>
            </div>
          </div>
        </section>

        <!-- COL DX: tags + lingue + meta + tabella + mappa -->
        <aside class="details-section">
          <!-- META autori -->
          <div class="meta-block">
            <p v-if="item.autore_scheda">
              <strong>{{ t('scheda.cardAuthor') }}:</strong> {{ item.autore_scheda }}
            </p>
            <p v-if="item.autore_traduzione">
              <strong>{{ t('scheda.transAuthor') }}:</strong> {{ item.autore_traduzione }}
            </p>
            <p v-if="item.data_pubblicazione">
              <strong>{{ t('scheda.pubDate') }}:</strong> {{ fmtDate(item.data_pubblicazione) }}
            </p>
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

          
        </aside>
      </div>
    </template>
  </div>
</template>

<style scoped>
.scheda-view {
  padding: var(--sp-3) var(--sp-5) var(--sp-7);
  max-width: 1800px;
  margin: 0 auto;
}

.back-row { margin: var(--sp-3) 0; }
.back-pill {
  display: inline-block;
  background-color: #dbb971;
  font-size: var(--fs-md);
  font-weight: 500;
  border-radius: var(--radius-lg);
  padding: var(--sp-2) var(--sp-4);
  text-decoration: none;
  color: var(--text);
  min-height: var(--tap-min);
}
.back-pill:hover { background-color: #cfa651; }

.scheda-title {
  text-align: center;
  font-size: var(--fs-2xl);
  margin: var(--sp-3) 0;
  color: var(--text);
}

.error-msg {
  text-align: center;
  color: #b32424;
  font-size: var(--fs-md);
  padding: var(--sp-5);
}

/* — layout 2 colonne — */
.container {
  display: grid;
  grid-template-columns: 60% 40%;
  gap: var(--sp-5);
  align-items: start;
  width: 100%;
}
@media (max-width: 1024px) {
  .container { grid-template-columns: 1fr; }
}

.image-section {
  padding: var(--sp-4);
  border-radius: var(--radius-lg);
  text-align: center;
}
.image-section img {
  max-width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: var(--radius-sm);
}
.details-section {
  padding: var(--sp-4);
  border-radius: var(--radius-lg);
}

/* — accordion (riproduco lo stile dell'originale) — */
.accordion-item {
  margin-bottom: var(--sp-3);
  border-bottom: 1px solid var(--border);
  padding: var(--sp-3);
}
.accordion-title-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.accordion-header {
  background-color: transparent;
  border: none;
  padding: var(--sp-2);
  text-align: left;
  font-size: var(--fs-md);
  cursor: pointer;
  color: var(--text-soft);
  font-weight: 700;
  flex: 1;
  min-height: var(--tap-min);
  transition: color 0.2s;
}
.accordion-header:hover { color: var(--accent); }
.accordion-arrow {
  font-size: var(--fs-md);
  margin-left: var(--sp-3);
  color: var(--text-soft);
}
.accordion-underline {
  border: none;
  height: 1px;
  background-color: var(--border);
  margin: 0;
  width: 100%;
}
.accordion-content {
  padding: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease, padding 0.3s ease;
  text-align: justify;
}
.accordion-content.open {
  max-height: 4000px;
  padding: var(--sp-3);
  border-top: 1px solid var(--border);
}
.accordion-content :deep(p) {
  margin-top: var(--sp-3);
  font-size: var(--fs-base);
  line-height: 1.5;
}
.accordion-content :deep(a) { color: var(--text); text-decoration: underline; }

/* — Approfondimento bottone — */
.deepening-btn {
  display: block;
  margin-top: var(--sp-4);
  text-align: center;
  text-decoration: none;
  color: var(--text-soft);
  font-size: var(--fs-sm);
  border: 1px solid var(--text-soft);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-sm);
  background-color: transparent;
  width: 100%;
  cursor: pointer;
  min-height: var(--tap-min);
  transition: background 0.2s;
}
.deepening-btn:hover { background-color: var(--bg-card); }

.appro-info {
  margin-top: var(--sp-3);
  font-size: var(--fs-xs);
  text-align: justify;
}
.appro-info :deep(*) {
  font-size: var(--fs-xs) !important;
  text-align: justify;
}

/* — TAGS / LINGUE — */
.tags-block {
  margin-top: var(--sp-3);
  font-family: 'Rubik', serif;
  font-weight: 400;
  font-size: var(--fs-sm);
  color: var(--text-light);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: var(--sp-3) 0;
}
.dark-hr { color: var(--text); height: 1px; background: var(--border); border: none; }
.thin-hr { background-color: var(--border); height: 1px; width: 100%; border: none; }

.tag-link, .lingua-link {
  display: inline-block;
  color: var(--text-light) !important;
  text-decoration: none;
  margin: var(--sp-1) 0;
  cursor: pointer;
}
.tag-link span, .lingua-link span {
  text-transform: uppercase;
}
.tag-link:hover, .lingua-link:hover {
  color: var(--accent);
  text-decoration: underline;
}
.muted { color: var(--text-light); }

/* — META — */
.meta-block { margin-top: var(--sp-3); }
.meta-block p {
  font-size: var(--fs-xs);
  margin: var(--sp-1) 0;
}

/* — TABELLA — */
.info-table {
  border-collapse: collapse;
  width: 100%;
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-top: var(--sp-4);
}
.info-table td {
  padding: var(--sp-2) var(--sp-3);
  border: none;
  vertical-align: top;
}
.info-label { width: 35%; font-size: var(--fs-sm); }
.info-value { font-size: var(--fs-sm); }

/* — MAPPA — */
.scheda-map {
  width: 100%;
  height: clamp(220px, 30vh, 360px);
  margin-top: var(--sp-4);
  border-radius: var(--radius-sm);
  z-index: 0;
}
.address-line {
  margin-top: var(--sp-2);
  font-size: var(--fs-xs);
  font-weight: 700;
}
</style>
