/**
 * Pinia store dei dati Timeline (Eurotales).
 *
 * Strategia di caching:
 *   - Primo accesso: 3 fetch (timeline, lingue, categorie) → localStorage.
 *   - Accessi successivi: legge da localStorage istantaneamente.
 *   - Dopo CACHE_TTL_HOURS: rifetch automatico.
 *   - Incrementa CACHE_VERSION per invalidare manualmente la cache di tutti.
 *
 * Convenzioni nel DB (campi italiani ↔ inglesi):
 *   - timeline:           nome ↔ name | descrizione ↔ description |
 *                         luogo ↔ place | dida ↔ caption | validita
 *   - timeline_lingua:    lingua ↔ language | colore_TL | Area_linguistica
 *   - timeline_categoria: categoria ↔ category
 *
 * Quando l'inglese non è disponibile, si usa l'italiano come fallback.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API = 'https://www.directuseurotales.ambientinarratividigitali.it'

// ── Configurazione cache ─────────────────────────────────────────────
/** Durata della cache in ore. Cambia QUI per modificare la scadenza. */
const CACHE_TTL_HOURS = 24

/** Incrementa per invalidare la cache di tutti gli utenti al loro prossimo accesso. */
const CACHE_VERSION = 1

const CACHE_KEY = 'timeline.data'

// ── Helper localStorage ──────────────────────────────────────────────
function saveCache(payload) {
  try {
    const wrapper = { version: CACHE_VERSION, savedAt: Date.now(), payload }
    localStorage.setItem(CACHE_KEY, JSON.stringify(wrapper))
  } catch (e) {
    console.warn('[timeline] cache write failed:', e.message)
  }
}

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const wrapper = JSON.parse(raw)
    if (wrapper.version !== CACHE_VERSION) return null
    const ageMs = Date.now() - wrapper.savedAt
    if (ageMs > CACHE_TTL_HOURS * 3600 * 1000) return null
    return wrapper.payload
  } catch {
    return null
  }
}

export function clearCache() {
  localStorage.removeItem(CACHE_KEY)
}

// ── Helper localizzazione con fallback all'italiano ─────────────────
/** Restituisce il campo localizzato. Se EN ed `en` è vuoto, usa `it`. */
function pick(item, fieldIt, fieldEn, locale) {
  if (!item) return ''
  if (locale === 'en') {
    const v = item[fieldEn]
    if (v && String(v).trim()) return v
    return item[fieldIt] || ''
  }
  return item[fieldIt] || ''
}

// ── Store ────────────────────────────────────────────────────────────
export const useDataStore = defineStore('data', () => {
  const loading = ref(false)
  const error   = ref(null)

  // Dati grezzi dal DB
  const milestonesRaw = ref([])  // tabella timeline (eventi)
  const lingue        = ref([])  // tabella timeline_lingua
  const categorie     = ref([])  // tabella timeline_categoria

  const loaded = computed(() => milestonesRaw.value.length > 0)

  // Mappe id → record per lookup veloci
  const linguaById = computed(() => Object.fromEntries(lingue.value.map(l => [l.id, l])))
  const categoriaById = computed(() => Object.fromEntries(categorie.value.map(c => [c.id, c])))

  /**
   * Eventi arricchiti con riferimenti risolti (lingua, categoria).
   * I campi originali `lingua` e `categoria` sono ID, qui diventano oggetti.
   */
  const milestones = computed(() => milestonesRaw.value.map(m => ({
    ...m,
    linguaObj: linguaById.value[m.lingua] || null,
    categoriaObj: categoriaById.value[m.categoria] || null,
  })))

  // ── Actions ────────────────────────────────────────────────────────
  async function fetchAll() {
    if (loaded.value) return

    // 1) Tenta dalla cache
    const cached = loadCache()
    if (cached) {
      milestonesRaw.value = cached.milestones
      lingue.value        = cached.lingue
      categorie.value     = cached.categorie
      return
    }

    // 2) Rete
    loading.value = true
    error.value = null
    try {
      const [r1, r2, r3] = await Promise.all([
        fetch(`${API}/items/timeline/?limit=-1&filter[stato][_eq]=3`).then(r => r.json()),
        fetch(`${API}/items/timeline_lingua/?limit=-1`).then(r => r.json()),
        fetch(`${API}/items/timeline_categoria/?limit=-1`).then(r => r.json()),
      ])

      const payload = {
        milestones: r1.data,
        lingue:     r2.data,
        categorie:  r3.data,
      }

      milestonesRaw.value = payload.milestones
      lingue.value        = payload.lingue
      categorie.value     = payload.categorie

      saveCache(payload)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  /** Forza un refresh completo bypassando la cache. */
  async function forceRefresh() {
    clearCache()
    milestonesRaw.value = []
    lingue.value = []
    categorie.value = []
    await fetchAll()
  }

  // ── Helpers localizzati ────────────────────────────────────────────
  /** Nome di una lingua nella locale corrente, fallback IT se EN vuoto. */
  function linguaName(lingua, locale = 'it') {
    return pick(lingua, 'lingua', 'language', locale)
  }

  /** Nome di una categoria nella locale corrente, fallback IT. */
  function categoriaName(cat, locale = 'it') {
    return pick(cat, 'categoria', 'category', locale)
  }

  /** Ritorna un evento "view-friendly" con tutti i campi già localizzati. */
  function localizedEvent(milestone, locale = 'it') {
    if (!milestone) return null
    return {
      id: milestone.id,
      anno: milestone.Anno,
      validita: milestone.validita,
      nome:        pick(milestone, 'nome',        'name',        locale),
      descrizione: pick(milestone, 'descrizione', 'description', locale),
      luogo:       pick(milestone, 'luogo',       'place',       locale),
      didascalia:  pick(milestone, 'dida',        'caption',     locale),
      immagine: milestone.immagine,
      lingua:    linguaName(milestone.linguaObj, locale),
      colore:    milestone.linguaObj?.colore_TL || '#888',
      textColor: milestone.linguaObj?.Colore_testo === 1 ? 'white' : 'inherit',
      categoria: categoriaName(milestone.categoriaObj, locale),
      areaLinguistica: milestone.linguaObj?.Area_linguistica || '',
    }
  }

  return {
    loading, error, loaded,
    milestonesRaw, lingue, categorie,
    milestones,
    linguaById, categoriaById,
    fetchAll, forceRefresh,
    linguaName, categoriaName, localizedEvent,
  }
})
