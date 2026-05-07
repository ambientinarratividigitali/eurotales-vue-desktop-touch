/**
 * Pinia store dei dati di Risonanze Linguistiche.
 *
 * Strategia di caching:
 *   - Al primo accesso: fetch da Directus → salva in localStorage.
 *   - Accessi successivi: legge da localStorage (istantaneo).
 *   - Dopo CACHE_TTL_HOURS: la cache scade → rifetch automatico.
 *   - Se incrementi CACHE_VERSION: rifetch immediato (utile quando
 *     cambi la struttura dati o aggiungi nuove fetch).
 *
 * Convenzioni nel DB (campi italiani ↔ inglesi):
 *   - lingue:    `lingua`    ↔ `language`
 *   - attivita:  `attivita`  ↔ `occupation`
 *   - luoghi:    `nome`/`stato` ↔ `nome_citta_originale`/`nome_stato_originale`
 *   - area:      `area_geografico_linguistica` ↔ `linguistic_geographical_area`
 *   - ris_ieri:  `titolo`/`testo` ↔ `title`/`text`
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API = 'https://www.directuseurotales.ambientinarratividigitali.it'

// ── Configurazione cache ─────────────────────────────────────────────
/** Durata della cache in ore. Cambia QUI per modificare la scadenza. */
const CACHE_TTL_HOURS = 24

/** Incrementa per invalidare manualmente la cache di tutti gli utenti. */
const CACHE_VERSION = 1

const CACHE_KEYS = {
  ieri: 'risonanze.ieri',
  oggi: 'risonanze.oggi',
}

// ── Helper localStorage ──────────────────────────────────────────────
/** Salva un payload in localStorage con timestamp e versione. */
function saveCache(key, payload) {
  try {
    const wrapper = {
      version: CACHE_VERSION,
      savedAt: Date.now(),
      payload,
    }
    localStorage.setItem(key, JSON.stringify(wrapper))
  } catch (e) {
    // Quota superata o storage disabilitato: ignora silenziosamente
    console.warn('[dataStore] cache write failed:', e.message)
  }
}

/** Legge dalla cache; restituisce null se assente, scaduta o di versione vecchia. */
function loadCache(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const wrapper = JSON.parse(raw)
    if (wrapper.version !== CACHE_VERSION) return null
    const ageMs = Date.now() - wrapper.savedAt
    const ttlMs = CACHE_TTL_HOURS * 60 * 60 * 1000
    if (ageMs > ttlMs) return null
    return wrapper.payload
  } catch {
    return null
  }
}

/** Cancella la cache di una sezione (o tutto). */
export function clearCache(section) {
  if (section === 'ieri' || section === 'oggi') {
    localStorage.removeItem(CACHE_KEYS[section])
  } else {
    Object.values(CACHE_KEYS).forEach(k => localStorage.removeItem(k))
  }
}

// ── Helper localizzazione ────────────────────────────────────────────
/** Restituisce il campo localizzato in base alla locale. */
function pick(item, fieldIt, fieldEn, locale) {
  if (!item) return ''
  if (locale === 'en') return item[fieldEn] || item[fieldIt] || ''
  return item[fieldIt] || ''
}

// ── Store ────────────────────────────────────────────────────────────
export const useDataStore = defineStore('data', () => {
  const loading = ref(false)
  const error   = ref(null)

  // IERI
  const risonanzeIeri = ref([])
  const lingue        = ref([])
  const secoli        = ref([])
  const luoghi        = ref([])
  const areeGeo       = ref([])
  const relLingue0    = ref([])  // ris_ieri_lingue   (quotidiana)
  const relLingue1    = ref([])  // ris_ieri_lingue_1 (scuola)
  const relLingue2    = ref([])  // ris_ieri_lingue_2 (arte)
  const relLingue3    = ref([])  // ris_ieri_lingue_3 (apprese)
  const attivitaList  = ref([])
  const relAttivita   = ref([])  // ris_ieri_attivita (M2M)
  const relLuoghiRes  = ref([])  // ris_ieri_luoghi_1 (M2M residenza)

  // OGGI
  const risonanzeOggi = ref([])

  const ieriLoaded = computed(() => risonanzeIeri.value.length > 0)
  const oggiLoaded = computed(() => risonanzeOggi.value.length > 0)

  const linguaById = computed(() => Object.fromEntries(lingue.value.map(l => [l.id, l])))
  const luogoById  = computed(() => Object.fromEntries(luoghi.value.map(l => [l.id, l])))
  const areaById   = computed(() => Object.fromEntries(areeGeo.value.map(a => [a.id, a])))

  /** Lista IERI ordinata per cognome. */
  const ieriOrdered = computed(() =>
    [...risonanzeIeri.value].sort((a, b) =>
      (a.cognome || '').toLowerCase().localeCompare((b.cognome || '').toLowerCase())
    )
  )

  /** Mappa { sigla: [personaggi] } per la mappa IERI. */
  const dictNationsIeri = computed(() => {
    const dict = {}
    const reverseMap = {}
    Object.entries(DICT_SIGLA).forEach(([s, n]) => { reverseMap[n.toLowerCase()] = s })

    risonanzeIeri.value.forEach(r => {
      const luogo = luogoById.value[r.luogo_nascita]
      if (!luogo?.stato) return
      const sigla = reverseMap[luogo.stato.toLowerCase().trim()]
      if (!sigla) return
      ;(dict[sigla] ||= []).push(r)
    })
    return dict
  })

  // ── Carica i dati IERI da cache o da API ────────────────────────
  function applyIeriPayload(p) {
    risonanzeIeri.value = p.risonanzeIeri
    lingue.value        = p.lingue
    secoli.value        = p.secoli
    luoghi.value        = p.luoghi
    areeGeo.value       = p.areeGeo
    relLingue0.value    = p.relLingue0
    relLingue1.value    = p.relLingue1
    relLingue2.value    = p.relLingue2
    relLingue3.value    = p.relLingue3
    attivitaList.value  = p.attivitaList
    relAttivita.value   = p.relAttivita
    relLuoghiRes.value  = p.relLuoghiRes
  }

  async function fetchAll() {
    if (ieriLoaded.value) return

    // 1) Tenta dalla cache
    const cached = loadCache(CACHE_KEYS.ieri)
    if (cached) {
      applyIeriPayload(cached)
      return
    }

    // 2) Fetch dalla rete
    loading.value = true
    error.value = null
    try {
      const endpoints = [
        'ris_ieri/?limit=-1&filter[stato][_eq]=4',
        'lingue/?limit=-1&sort[]=lingua',
        'secolo/?limit=-1',
        'luoghi/?limit=-1',
        'ris_ieri_lingue/?limit=-1',
        'ris_ieri_lingue_1/?limit=-1',
        'ris_ieri_lingue_2/?limit=-1',
        'ris_ieri_lingue_3/?limit=-1',
        'area_geografico_linguistica/?limit=-1',
        'attivita/?limit=-1',
        'ris_ieri_attivita/?limit=-1',
        'ris_ieri_luoghi_1/?limit=-1',
      ]
      const responses = await Promise.all(
        endpoints.map(e => fetch(`${API}/items/${e}`).then(r => r.json()))
      )
      const [r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12] = responses

      const enriched = r1.data.map(r => {
        const sec = r3.data.find(s => s.id === r.secolo_nascita)
        return { ...r, secolo_nascita: sec?.secolo ?? r.secolo_nascita }
      })

      const payload = {
        risonanzeIeri: enriched,
        lingue:        r2.data,
        secoli:        r3.data,
        luoghi:        r4.data,
        relLingue0:    r5.data,
        relLingue1:    r6.data,
        relLingue2:    r7.data,
        relLingue3:    r8.data,
        areeGeo:       r9.data,
        attivitaList:  r10.data,
        relAttivita:   r11.data,
        relLuoghiRes:  r12.data,
      }

      applyIeriPayload(payload)
      saveCache(CACHE_KEYS.ieri, payload)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchOggi() {
    if (oggiLoaded.value) return

    const cached = loadCache(CACHE_KEYS.oggi)
    if (cached) {
      risonanzeOggi.value = cached
      return
    }

    loading.value = true
    try {
      const fields = [
        'id', 'genere', 'eta', 'bazuibe_nascita',
        'lingua_madre.*', 'lingua_madre_madre.*', 'lingua_madre_padre.*',
        'nazione_nascita.nazioni',
      ].join(',')
      const r = await fetch(`${API}/items/ris_oggi/?limit=-1&fields=${fields}`).then(r => r.json())
      risonanzeOggi.value = r.data
      saveCache(CACHE_KEYS.oggi, r.data)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // ── Helpers localizzati ─────────────────────────────────────────
  function linguaNameFromId(id, locale) {
    return pick(linguaById.value[id], 'lingua', 'language', locale)
  }

  function areaNameFromId(id, locale) {
    return pick(areaById.value[id], 'area_geografico_linguistica', 'linguistic_geographical_area', locale)
  }

  function luogoFromId(id, locale) {
    const l = luogoById.value[id]
    if (!l) return null

    if ((l.nome == 'Unknown' || l.nome == 'unknown') && locale == 'it'){
      return { nome:  "Sconosciuto"}
    }
    return {
      nome:  pick(l, 'nome',  'nome_citta_originale',  locale),
      stato: pick(l, 'stato', 'nome_stato_originale',  locale),
    }
  }

  function getRelLingue(personaggioId, relTable, locale = 'it') {
    const tables = [relLingue0, relLingue1, relLingue2, relLingue3]
    const rel = tables[relTable]?.value || []
    return rel
      .filter(r => r.ris_ieri_id === personaggioId)
      .map(r => pick(linguaById.value[r.lingue_id], 'lingua', 'language', locale))
      .filter(Boolean)
  }

  function getPersonaggioById(id) {
    return risonanzeIeri.value.find(r => r.id == id) || null
  }

  function getAttivita(personaggioId, locale = 'it') {
    return relAttivita.value
      .filter(r => r.ris_ieri_id === personaggioId)
      .map(r => {
        const a = attivitaList.value.find(x => x.id === r.attivita_id)
        return pick(a, 'attivita', 'occupation', locale)
      })
      .filter(Boolean)
  }

  function getLuoghiResidenza(personaggioId, locale = 'it') {
    return relLuoghiRes.value
      .filter(r => r.ris_ieri_id === personaggioId)
      .map(r => luogoFromId(r.luoghi_id, locale))
      .filter(Boolean)
      .map(l => l.stato ? `${l.nome} (${l.stato})` : l.nome)
  }

  /** Forza un refresh completo bypassando la cache. */
  async function forceRefresh() {
    clearCache()
    risonanzeIeri.value = []
    risonanzeOggi.value = []
    await Promise.all([fetchAll(), fetchOggi()])
  }

  return {
    // state
    loading, error,
    risonanzeIeri, lingue, luoghi, areeGeo, risonanzeOggi,
    ieriLoaded, oggiLoaded,
    // computed
    linguaById, luogoById, areaById,
    ieriOrdered, dictNationsIeri,
    // actions
    fetchAll, fetchOggi, forceRefresh,
    // helpers
    getRelLingue, getPersonaggioById, getAttivita, getLuoghiResidenza,
    linguaNameFromId, areaNameFromId, luogoFromId,
  }
})

/** Mappa sigla ISO → nome italiano (lowercase) per la mappa SVG. */
export const DICT_SIGLA = {
  IT: 'italia', GR: 'grecia', GB: 'regno unito', PT: 'portogallo',
  DE: 'germania', NL: 'paesi bassi', ES: 'spagna', FR: 'francia',
  SE: 'svezia', HR: 'croazia', DK: 'danimarca', IE: 'irlanda',
  BE: 'belgio', CZ: 'repubblica ceca', AT: 'austria', PL: 'polonia',
  CH: 'svizzera', RO: 'romania', BA: 'bosnia erzegovina', UA: 'ucraina',
  TR: 'turchia', LT: 'lituania', BG: 'bulgaria', EE: 'estonia',
  FI: 'finlandia', MD: 'moldavia', NO: 'norvegia', XK: 'kosovo',
  SK: 'slovacchia', SI: 'slovenia', HU: 'ungheria', RS: 'serbia',
  GE: 'georgia', AL: 'albania', AD: 'andorra', AM: 'armenia',
  BY: 'bielorussia', IS: 'islanda', LI: 'liechtenstein', LU: 'lussembourgo',
  CY: 'cipro', RU: 'russia', MK: 'macedonia del nord', ME: 'montenegro',
  KAZA: 'kazakistan', AZER: 'azerbaigian', LV: 'lettonia',
}

/** Mappa sigla ISO → nome inglese, per la locale en. */
export const DICT_SIGLA_EN = {
  IT: 'Italy', GR: 'Greece', GB: 'United Kingdom', PT: 'Portugal',
  DE: 'Germany', NL: 'Netherlands', ES: 'Spain', FR: 'France',
  SE: 'Sweden', HR: 'Croatia', DK: 'Denmark', IE: 'Ireland',
  BE: 'Belgium', CZ: 'Czech Republic', AT: 'Austria', PL: 'Poland',
  CH: 'Switzerland', RO: 'Romania', BA: 'Bosnia and Herzegovina', UA: 'Ukraine',
  TR: 'Turkey', LT: 'Lithuania', BG: 'Bulgaria', EE: 'Estonia',
  FI: 'Finland', MD: 'Moldova', NO: 'Norway', XK: 'Kosovo',
  SK: 'Slovakia', SI: 'Slovenia', HU: 'Hungary', RS: 'Serbia',
  GE: 'Georgia', AL: 'Albania', AD: 'Andorra', AM: 'Armenia',
  BY: 'Belarus', IS: 'Iceland', LI: 'Liechtenstein', LU: 'Luxembourg',
  CY: 'Cyprus', RU: 'Russia', MK: 'North Macedonia', ME: 'Montenegro',
  KAZA: 'Kazakhstan', AZER: 'Azerbaijan', LV: 'Latvia',
}

/** Restituisce il nome di nazione per una sigla nella locale corrente. */
export function nationName(sigla, locale = 'it') {
  return locale === 'en' ? (DICT_SIGLA_EN[sigla] || sigla) : (DICT_SIGLA[sigla] || sigla)
}

export function sortItemsAlpha(a, b) {
  const itemA = a.toUpperCase().trim(); // ignore upper and lowercase
  const itemB = b.toUpperCase().trim(); // ignore upper and lowercase
  if (itemA < itemB) {
    return -1;
  }
  if (itemA > itemB) {
    return 1;
  }
  return 0;
}
