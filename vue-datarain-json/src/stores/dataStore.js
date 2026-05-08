/* ==========================================================================
   Datarain — dataStore (Pinia)
   - Carica tracce.json (statico, importato a build-time)
   - Ma replica il pattern degli altri progetti: cache localStorage TTL 24h,
     così se in futuro i dati arriveranno da un endpoint, basterà sostituire
     la sorgente in load().
   ========================================================================== */

import { defineStore } from 'pinia'
import tracceData from '../data/tracce.json'

const CACHE_VERSION = 'datarain-v1'
const CACHE_TTL_MS  = 24 * 60 * 60 * 1000

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

/** Normalizza un record dal JSON originale al formato usato dall'app. */
function normalize(d) {
  return {
    id:      d.id,
    title:   d.Titolo || '',
    sottotitolo: d.Sottotitolo || '',
    type:    d.Type || 'true',
    image:   d.Image || '',          // immagine grande dentro la card
    file:    d.File || '',           // immagine piccola della goccia che cade
    descrizione:  d.Descrizione || '',
    descrizione2: d.Descrizione2 || '',
    datibox: d.Dati_box || '',
    biblio:  d.Bibliografia || '',
    crediti: d.Crediti || '',
    autore:  d.Autore || '',
    mappa:   d.Mappa || '',
  }
}

export const useDataStore = defineStore('datarain', {
  state: () => ({
    tracce:  [],   // record normalizzati
    loading: false,
    error:   null,
  }),

  actions: {
    /** Carica i dati. Cache-first; se la cache è scaduta, ricarica e salva. */
    async load() {
      // Cache hit
      const cached = cacheGet('tracce')
      if (cached && Array.isArray(cached) && cached.length > 0) {
        this.tracce = cached
        return
      }
      this.loading = true
      try {
        // In questo progetto i dati sono statici (import a build-time).
        // Se in futuro arriveranno da un endpoint, qui basta:
        //   const res = await fetch(API_URL); const json = await res.json();
        //   const records = json.data || json
        const records = (tracceData || []).map(normalize)
        this.tracce = records
        cacheSet('tracce', records)
      } catch (e) {
        this.error = e.message
        console.error('[dataStore.load]', e)
      } finally {
        this.loading = false
      }
    },

    /** Reset cache (utile per debug). */
    invalidateCache() {
      try {
        Object.keys(localStorage)
          .filter(k => k.startsWith(`${CACHE_VERSION}:`))
          .forEach(k => localStorage.removeItem(k))
        this.tracce = []
      } catch {}
    },
  },
})
