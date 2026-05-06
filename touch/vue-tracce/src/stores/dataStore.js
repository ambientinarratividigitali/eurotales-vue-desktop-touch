/* ==========================================================================
   Tracce — dataStore (Pinia)
   - Fetch da Directus
   - Cache localStorage con TTL 24h e versioning
   - Helper localizzati pick(item, fieldIt, fieldEn, locale)
   ========================================================================== */

import { defineStore } from 'pinia'

const API_BASE = 'https://www.directuseurotales.ambientinarratividigitali.it'

const CACHE_VERSION = 'tracce-v2'
const CACHE_TTL_MS  = 24 * 60 * 60 * 1000

/* ---------------------------------------------------------------- helpers */

/** Restituisce il valore EN se locale==='en' e presente, altrimenti IT. */
export function pick(item, fieldIt, fieldEn, locale) {
  if (!item) return ''
  if (locale === 'en') {
    const v = item[fieldEn]
    if (v !== undefined && v !== null && v !== '') return v
  }
  return item[fieldIt] ?? ''
}

/** Cache wrapper su localStorage. */
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
  try {
    localStorage.setItem(cacheKey(name), JSON.stringify({ t: Date.now(), d: data }))
  } catch { /* quota / private mode: ignora */ }
}

/** Fetch JSON con gestione errori uniforme. */
async function jget(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`)
  return r.json()
}

/* ----------------------------------------------------- store definitions */

export const useDataStore = defineStore('tracce', {
  state: () => ({
    /* tracce con stato_traccia=4 (pubblicate) */
    tracceFull:     null,   // gallery: tracce + cronologia + secolo + tipologia + luogo (con nazione)
    tracceMappa:    null,   // mappa: tracce + luogo (con coords)
    luoghi:         null,   // dict id -> luogo
    nazioni:        null,   // dict id -> nazione
    tipologie:      null,   // array tipologia

    /* metadati piccoli, ok caricarli interi */
    tags:           null,   // array tags (per label localizzata)
    lingue:         null,   // array lingue (per slug → id e label)

    loading: false,
    error: null,
  }),

  actions: {

    /* ---- GALLERY: tutte le tracce con campi annidati ------------------ */
    async ensureGalleryData() {
      if (this.tracceFull) return
      const cached = cacheGet('gallery')
      if (cached) {
        this.tracceFull = cached.tracce
        this.luoghi     = cached.luoghi
        this.nazioni    = cached.nazioni
        this.tipologie  = cached.tipologie
        return
      }

      this.loading = true
      try {
        const [tracceRes, tipoRes] = await Promise.all([
          jget(`${API_BASE}/items/tracce?fields=*,cronologia.*,secolo.*,tipologia.*,luogo.*&filter[stato_traccia][_eq]=4&sort=secolo.secolo&limit=-1`),
          jget(`${API_BASE}/items/tipologia?limit=-1`),
        ])

        const tracce = tracceRes.data || []

        const luoghi = {}
        const nazioneIds = new Set()
        tracce.forEach(t => {
          const l = t.luogo
          if (l && typeof l === 'object') {
            luoghi[l.id] = l
            if (l.nazione) nazioneIds.add(l.nazione)
          }
        })

        let nazioni = {}
        if (nazioneIds.size > 0) {
          const ids = [...nazioneIds].join(',')
          const naz = await jget(`${API_BASE}/items/nazioni_tracce?filter[id][_in]=${ids}&limit=-1`)
          naz.data.forEach(n => { nazioni[n.id] = n })
        }

        const tipologie = tipoRes.data || []

        this.tracceFull = tracce
        this.luoghi = luoghi
        this.nazioni = nazioni
        this.tipologie = tipologie

        cacheSet('gallery', { tracce, luoghi, nazioni, tipologie })
      } catch (e) {
        this.error = e.message
        console.error('[ensureGalleryData]', e)
      } finally {
        this.loading = false
      }
    },

    /* ---- MAPPA: tracce con coordinate ---------------------------------- */
    async ensureMapData() {
      if (this.tracceMappa) return
      const cached = cacheGet('mappa')
      if (cached) {
        this.tracceMappa = cached.tracce
        return
      }
      this.loading = true
      try {
        const res = await jget(`${API_BASE}/items/tracce?fields=titolo,titles,img_cover,luogo.*,id&filter[stato_traccia][_eq]=4&limit=-1`)
        const tracce = (res.data || []).filter(t => t.luogo?.mappa?.coordinates)
        this.tracceMappa = tracce
        cacheSet('mappa', { tracce })
      } catch (e) {
        this.error = e.message
        console.error('[ensureMapData]', e)
      } finally {
        this.loading = false
      }
    },

    /* ---- TAGS metadati (lista tag con label) --------------------------- */
    async ensureTags() {
      if (this.tags) return
      const cached = cacheGet('tags-meta')
      if (cached) { this.tags = cached; return }
      const r = await jget(`${API_BASE}/items/tags?limit=-1`)
      this.tags = r.data || []
      cacheSet('tags-meta', this.tags)
    },

    /* ---- LINGUE metadati (lista lingua con label) ---------------------- */
    async ensureLingue() {
      if (this.lingue) return
      const cached = cacheGet('lingue-meta')
      if (cached) { this.lingue = cached; return }
      const r = await jget(`${API_BASE}/items/lingue?limit=-1`)
      this.lingue = r.data || []
      cacheSet('lingue-meta', this.lingue)
    },

    /* ---- TAG: tracce filtrate per tag id (fetch puntuale) -------------- */
    async fetchTracceByTag(tagId) {
      const ckey = `tag-${tagId}`
      const cached = cacheGet(ckey)
      if (cached) return cached

      // 1. Pivot puntuale: solo le righe con questo tag
      const ttRes = await jget(`${API_BASE}/items/tracce_tags?filter[tags_id][_eq]=${tagId}&limit=-1`)
      const tracceIds = (ttRes.data || []).map(rel => rel.tracce_id)
      if (tracceIds.length === 0) {
        cacheSet(ckey, [])
        return []
      }

      // 2. Fetch solo le tracce con quegli id
      const idsStr = tracceIds.join(',')
      const tRes = await jget(`${API_BASE}/items/tracce?fields=id,titolo,titles,img_cover,luogo.*&filter[id][_in]=${idsStr}&filter[stato_traccia][_eq]=4&limit=-1`)
      const tracce = tRes.data || []

      // 3. Nazioni in batch
      const nazioneIds = new Set()
      tracce.forEach(t => {
        const nid = t.luogo?.nazione
        if (nid) nazioneIds.add(nid)
      })
      let nazioni = {}
      if (nazioneIds.size > 0) {
        const naz = await jget(`${API_BASE}/items/nazioni_tracce?filter[id][_in]=${[...nazioneIds].join(',')}&limit=-1`)
        naz.data.forEach(n => { nazioni[n.id] = n })
      }

      const result = { tracce, nazioni }
      cacheSet(ckey, result)
      return result
    },

    /* ---- LINGUA: tracce filtrate per nome lingua (fetch puntuale) ------ */
    async fetchTracceByLingua(linguaId) {
      const ckey = `lingua-${linguaId}`
      const cached = cacheGet(ckey)
      if (cached) return cached

      // Path A: tracce_lingue_3 — link diretto tracce ↔ lingua
      const tlRes = await jget(`${API_BASE}/items/tracce_lingue_3?filter[lingue_id][_eq]=${linguaId}&limit=-1`)
      const idsA = (tlRes.data || []).map(rel => rel.tracce_id)

      // Path B: iscrizione_lingue → tracce_iscrizione (catena via iscrizioni)
      const ilRes = await jget(`${API_BASE}/items/iscrizione_lingue?filter[lingue_id][_eq]=${linguaId}&limit=-1`)
      const iscrizIds = (ilRes.data || []).map(rel => rel.iscrizione_id)
      let idsB = []
      if (iscrizIds.length > 0) {
        const tiRes = await jget(`${API_BASE}/items/tracce_iscrizione?filter[iscrizione_id][_in]=${iscrizIds.join(',')}&limit=-1`)
        idsB = (tiRes.data || []).map(rel => rel.tracce_id)
      }

      const tracceIds = [...new Set([...idsA, ...idsB])]
      if (tracceIds.length === 0) {
        const empty = { tracce: [], nazioni: {} }
        cacheSet(ckey, empty)
        return empty
      }

      const tRes = await jget(`${API_BASE}/items/tracce?fields=id,titolo,titles,img_cover,luogo.*&filter[id][_in]=${tracceIds.join(',')}&filter[stato_traccia][_eq]=4&limit=-1`)
      const tracce = tRes.data || []

      const nazioneIds = new Set()
      tracce.forEach(t => {
        const nid = t.luogo?.nazione
        if (nid) nazioneIds.add(nid)
      })
      let nazioni = {}
      if (nazioneIds.size > 0) {
        const naz = await jget(`${API_BASE}/items/nazioni_tracce?filter[id][_in]=${[...nazioneIds].join(',')}&limit=-1`)
        naz.data.forEach(n => { nazioni[n.id] = n })
      }

      const result = { tracce, nazioni }
      cacheSet(ckey, result)
      return result
    },

    /* ---- SCHEDA singola: fetch denso (un solo round-trip) -------------- */
    async fetchTraccia(id) {
      const ckey = `traccia-${id}`
      const cached = cacheGet(ckey)
      if (cached) return cached
      const res = await jget(`${API_BASE}/items/tracce/${id}?fields=*.*.*`)
      const data = res.data
      cacheSet(ckey, data)
      return data
    },

    /* ---- Reset cache (utile per debug / forzare refresh) --------------- */
    invalidateCache() {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach(k => {
          if (k.startsWith(`${CACHE_VERSION}:`)) localStorage.removeItem(k)
        })
        this.$reset()
      } catch { /* ignora */ }
    },
  },
})
