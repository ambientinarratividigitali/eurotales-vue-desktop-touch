/* ==========================================================================
   Datarain — dataStore (Pinia)

   Due sorgenti dati possibili (configurabili tramite USE_DIRECTUS):

   1) Directus (preferito se le tracce sono già nel DB):
      Fetch dalle tracce con stato_traccia=4 e ID compresi nella lista
      degli ID storici di datarain (1..44 escluso 29). Mappatura campi:

         Directus  →  datarain
         titolo    →  Titolo (IT)
         titles    →  Titolo (EN)
         descrizione        → Descrizione (IT)
         description        → Descrizione (EN)
         approfondimento    → Descrizione2 (IT)
         insight            → Descrizione2 (EN)
         bibliografia       → Bibliografia (IT)
         bibliography       → Bibliografia (EN)
         autore_scheda      → Autore
         img_cover (file id) → Image (URL assets)
         dati misti (luogo, materia, conservazione, lingue) → Dati_box

   2) JSON statico (fallback): src/data/tracce.json

   In entrambi i casi, cache localStorage TTL 24h con versioning.
   ========================================================================== */

import { defineStore } from 'pinia'
import tracceData from '../data/tracce.json'

const API_BASE = 'https://www.directuseurotales.ambientinarratividigitali.it'

/* Imposta a true per leggere da Directus, false per usare il JSON statico.
   Se Directus fallisce o restituisce 0 record, fa fallback automatico. */
const USE_DIRECTUS = true

const CACHE_VERSION = 'datarain-v2'
const CACHE_TTL_MS  = 24 * 60 * 60 * 1000

/* ID dei record presenti nell'esposizione datarain originale (43 record). */
const DATARAIN_IDS = [
   1, 2, 3, 4, 5, 6, 7, 8, 9,10,
  11,12,13,14,15,16,17,18,19,20,
  21,22,23,24,25,26,27,28,30,31,   // manca id 29 nell'originale
  32,33,34,35,36,37,38,39,40,41,
  42,43,44,
]

/* ---------------------------------------------------------------- helpers */

function cacheKey(name) { return `${CACHE_VERSION}:${name}` }

function cacheGet(name) {
  try {
    const raw = localStorage.getItem(cacheKey(name))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed.t !== 'number') return null
    if (Date.now() - parsed.t > CACHE_TTL_MS) return null
    return parsed.d
  } catch { return null }
}
function cacheSet(name, data) {
  try { localStorage.setItem(cacheKey(name), JSON.stringify({ t: Date.now(), d: data })) }
  catch { /* quota / private mode */ }
}

async function jget(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`)
  return r.json()
}

/** Sceglie il valore italiano se locale==='it', altrimenti inglese (con fallback). */
export function pickLocale(itVal, enVal, locale) {
  if (locale === 'en') return enVal || itVal || ''
  return itVal || enVal || ''
}

/** Normalizza un record ARRIVATO DA DIRECTUS al formato datarain con entrambe le lingue. */
function normalizeFromDirectus(d) {
  const imgId = d.img_cover?.id || d.img_cover
  const imgUrl = imgId ? `${API_BASE}/assets/${imgId}` : ''

  // Costruisco un blocco "Dati_box" sintetico dai vari campi disponibili
  const buildDati = (lang) => {
    const lines = []
    const luogo = d.luogo
    const naz = luogo?.nazione?.nazione || ''
    const citta = luogo?.citta || ''
    const cityNaz = [citta, naz ? `(${naz})` : ''].filter(Boolean).join(' ')
    if (cityNaz) lines.push(`<b>${lang === 'en' ? 'Location' : 'Luogo'}:</b> ${cityNaz}`)
    const date = pickLocale(d.data, d.date, lang)
    if (date) lines.push(`<b>${lang === 'en' ? 'Date' : 'Data'}:</b> ${date}`)
    if (d.materia) lines.push(`<b>${lang === 'en' ? 'Material' : 'Materia'}:</b> ${d.materia}`)
    const cons = pickLocale(d.conservazione, d.conservation, lang)
    if (cons) lines.push(`<b>${lang === 'en' ? 'Conservation' : 'Conservazione'}:</b> ${cons}`)
    if (d.misure) lines.push(`<b>${lang === 'en' ? 'Dimensions' : 'Misure'}:</b> ${d.misure}`)
    return lines.length ? `<p class="small_text">${lines.join('<br>')}</p>` : ''
  }

  return {
    id: d.id,
    title: { it: d.titolo || '', en: d.titles || d.titolo || '' },
    descrizione:  { it: d.descrizione || '',     en: d.description || d.descrizione || '' },
    descrizione2: { it: d.approfondimento || '', en: d.insight || d.approfondimento || '' },
    biblio:       { it: d.bibliografia || '',    en: d.bibliography || d.bibliografia || '' },
    datibox:      { it: buildDati('it'),         en: buildDati('en') },
    crediti:      { it: '',                      en: '' },
    autore:       { it: d.autore_scheda ? `<p class="Autore_text"><i>${d.autore_scheda}</i></p>` : '', en: '' },
    image:  imgUrl,
    file:   `/Immagini/Proverbi/${d.id}.png`,   // le gocce restano locali
    type:   'true',
    sottotitolo: 'tracce',
    mappa: '',
    _source: 'directus',
  }
}

/** Normalizza un record dal JSON STATICO (lingua mista) — produce campi {it,en} uguali. */
function normalizeFromJson(d) {
  const wrap = (s) => ({ it: s || '', en: s || '' })
  return {
    id: d.id,
    title:        wrap(d.Titolo),
    descrizione:  wrap(d.Descrizione),
    descrizione2: wrap(d.Descrizione2),
    biblio:       wrap(d.Bibliografia),
    datibox:      wrap(d.Dati_box),
    crediti:      wrap(d.Crediti),
    autore:       wrap(d.Autore),
    image:  d.Image || '',
    file:   d.File || '',
    type:   d.Type || 'true',
    sottotitolo: d.Sottotitolo || '',
    mappa:  d.Mappa || '',
    _source: 'json',
  }
}

/* ----------------------------------------------------- store definitions */

export const useDataStore = defineStore('datarain', {
  state: () => ({
    tracce:  [],
    source:  null,    // 'directus' | 'json' (per debug)
    loading: false,
    error:   null,
  }),

  actions: {
    async load() {
      // Cache hit
      const cached = cacheGet('tracce')
      if (cached && Array.isArray(cached.records) && cached.records.length > 0) {
        this.tracce = cached.records
        this.source = cached.source
        return
      }

      this.loading = true
      try {
        let records = []
        let source  = 'json'

        if (USE_DIRECTUS) {
          try {
            const idsStr = DATARAIN_IDS.join(',')
            // Fetch denso con campi annidati a 2 livelli (luogo + nazione)
            const res = await jget(
              `${API_BASE}/items/tracce?fields=*,luogo.*,luogo.nazione.*` +
              `&filter[stato_traccia][_eq]=4&filter[id][_in]=${idsStr}&limit=-1`
            )
            const data = res.data || []
            if (data.length > 0) {
              records = data.map(normalizeFromDirectus)
              source = 'directus'
              console.log(`[datarain] Caricate ${records.length}/${DATARAIN_IDS.length} tracce da Directus`)
            } else {
              console.warn('[datarain] Directus ha restituito 0 record, uso JSON statico')
            }
          } catch (e) {
            console.warn('[datarain] Directus non raggiungibile, uso JSON statico:', e.message)
          }
        }

        // Fallback al JSON statico
        if (records.length === 0) {
          records = (tracceData || []).map(normalizeFromJson)
          source = 'json'
        }

        this.tracce = records
        this.source = source
        cacheSet('tracce', { records, source })
      } catch (e) {
        this.error = e.message
        console.error('[dataStore.load]', e)
      } finally {
        this.loading = false
      }
    },

    invalidateCache() {
      try {
        Object.keys(localStorage)
          .filter(k => k.startsWith(`${CACHE_VERSION}:`))
          .forEach(k => localStorage.removeItem(k))
        this.tracce = []
        this.source = null
      } catch {}
    },
  },
})
