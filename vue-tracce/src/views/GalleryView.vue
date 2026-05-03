<script setup>
/* GalleryView — lista completa delle tracce con:
   - filtri per tipologia (label IT/EN reattiva)
   - search (su titolo/città/nazione, IT+EN)
   - toggle ordinamento per secolo (parseSecolo gestisce formato "01_02")
   - skeleton iniziali + lazy load on scroll
*/
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDataStore, pick } from '../stores/dataStore.js'
import TracciaCard from '../components/TracciaCard.vue'

const { t, locale } = useI18n()
const store = useDataStore()

const PAGE_SIZE = 12
const SCROLL_BATCH = 6

const activeTipologia = ref(null)   // null = tutte
const searchQuery     = ref('')
const searchInput     = ref('')     // raw input, debounced → searchQuery
const isChronological = ref(false)
const visibleCount    = ref(PAGE_SIZE)
const isLoadingMore   = ref(false)

const sentinel        = ref(null)   // div osservato da IntersectionObserver
let observer = null
let searchTimer = null

/* — debounce search (250ms) — */
function onSearchInput(e) {
  const v = e.target.value
  searchInput.value = v
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchQuery.value = v
    activeTipologia.value = null
    resetVisible()
  }, 250)
}

/* — parseSecolo (uguale all'originale) — */
function parseSecolo(raw) {
  if (!raw) return { main: 9999, sub: 9999 }
  const cleaned = String(raw).trim()
  if (cleaned.includes('_')) {
    const [a, b] = cleaned.split('_')
    return { main: parseInt(a, 10) || 9999, sub: parseInt(b, 10) || 9999 }
  }
  return { main: parseInt(cleaned, 10) || 9999, sub: 0 }
}

/* — items filtrati e ordinati (computed reattivo) — */
const filteredItems = computed(() => {
  const all = store.tracceFull || []
  let out = all

  // Filtro tipologia
  if (activeTipologia.value !== null) {
    out = out.filter(item => {
      const tid = typeof item.tipologia === 'object' ? item.tipologia?.id : item.tipologia
      return tid === activeTipologia.value
    })
  }

  // Search
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    out = out.filter(item => {
      const titIt  = (item.titolo || '').toLowerCase()
      const titEn  = (item.titles || '').toLowerCase()
      const luogo  = store.luoghi[item.luogo?.id ?? item.luogo] || item.luogo || {}
      const citta  = (luogo.citta || '').toLowerCase()
      const nazId  = luogo.nazione?.id ?? luogo.nazione
      const naz    = store.nazioni[nazId] || luogo.nazione || {}
      const nazNm  = (naz.nazione || '').toLowerCase()
      return titIt.includes(q) || titEn.includes(q) || citta.includes(q) || nazNm.includes(q)
    })
  }

  // Ordinamento per secolo
  if (isChronological.value) {
    out = [...out].sort((a, b) => {
      const sa = parseSecolo(a?.secolo?.secolo)
      const sb = parseSecolo(b?.secolo?.secolo)
      return sa.main !== sb.main ? sa.main - sb.main : sa.sub - sb.sub
    })
  }
  return out
})

const visibleItems = computed(() => filteredItems.value.slice(0, visibleCount.value))

/* — lista tipologie effettivamente usate — */
const usedTipologie = computed(() => {
  if (!store.tracceFull || !store.tipologie) return []
  const usedIds = new Set()
  store.tracceFull.forEach(it => {
    const tid = typeof it.tipologia === 'object' ? it.tipologia?.id : it.tipologia
    if (tid) usedIds.add(tid)
  })
  return store.tipologie.filter(tip => usedIds.has(tip.id))
})

/* — helper localizzati — */
function tipoLabel(tip) { return pick(tip, 'tipologia', 'typology', locale.value) }

function getLuogo(item) {
  const id = item.luogo?.id ?? item.luogo
  return store.luoghi[id] || item.luogo || null
}
function getNazione(item) {
  const luogo = getLuogo(item)
  if (!luogo) return null
  const nazId = luogo.nazione?.id ?? luogo.nazione
  return store.nazioni[nazId] || luogo.nazione || null
}

/* — handlers — */
function selectTipologia(id) { activeTipologia.value = id; resetVisible() }
function selectAll()          { activeTipologia.value = null; searchQuery.value = ''; searchInput.value = ''; resetVisible() }
function toggleChronology()   { isChronological.value = !isChronological.value; resetVisible() }
function resetVisible()       { visibleCount.value = PAGE_SIZE }

/* — lazy load via IntersectionObserver --------------------------------- */
function loadMore() {
  if (isLoadingMore.value) return
  if (visibleCount.value >= filteredItems.value.length) return
  isLoadingMore.value = true
  setTimeout(() => {
    visibleCount.value += SCROLL_BATCH
    isLoadingMore.value = false
  }, 150)
}

function setupObserver() {
  if (observer) observer.disconnect()
  if (!sentinel.value) return
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) loadMore()
  }, { rootMargin: '400px 0px' })
  observer.observe(sentinel.value)
}

/* — lifecycle ---------------------------------------------------------- */
onMounted(async () => {
  await store.ensureGalleryData()
  await nextTick()
  setupObserver()
})
onBeforeUnmount(() => {
  if (observer) { observer.disconnect(); observer = null }
  if (searchTimer) clearTimeout(searchTimer)
})

/* — quando cambia la lingua, reset count (le label si aggiornano da sole) — */
watch(locale, () => { resetVisible() })
</script>

<template>
  <div class="gallery-view">
    <!-- Filtri tipologia -->
    <div class="filters-bar">
      <button class="filter-all"
              :class="{ active: activeTipologia === null }"
              @click="selectAll">
        {{ t('gallery.allTypologies') }}
      </button>

      <div class="filter-tipologias">
        <button v-for="tip in usedTipologie"
                :key="tip.id"
                class="filter-word"
                :class="{ active: activeTipologia === tip.id }"
                @click="selectTipologia(tip.id)">
          {{ tipoLabel(tip) }}
        </button>
      </div>
    </div>

    <!-- Tools bar: ordinamento + search -->
    <div class="tools-bar">
      <button class="chrono-btn"
              :class="{ active: isChronological }"
              @click="toggleChronology">
        {{ t('gallery.sortByCentury') }}
      </button>

      <input class="search-input"
             type="text"
             :placeholder="t('gallery.searchPlaceholder')"
             :value="searchInput"
             @input="onSearchInput" />
    </div>

    <!-- Loader iniziale: skeleton -->
    <div v-if="store.loading && (!store.tracceFull || store.tracceFull.length === 0)"
         class="items-grid">
      <div v-for="n in 12" :key="`sk-${n}`" class="skeleton-card">
        <div class="skeleton-img"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text short"></div>
      </div>
    </div>

    <!-- Grid items -->
    <div v-else class="items-grid">
      <TracciaCard
        v-for="item in visibleItems"
        :key="item.id"
        :item="item"
        :luogo="getLuogo(item)"
        :nazione="getNazione(item)" />

      <!-- Skeleton appendix on scroll -->
      <template v-if="isLoadingMore">
        <div v-for="n in SCROLL_BATCH" :key="`ld-${n}`" class="skeleton-card">
          <div class="skeleton-img"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text short"></div>
        </div>
      </template>
    </div>

    <!-- Sentinel per IntersectionObserver: trigger lazy-load quando entra nel viewport -->
    <div ref="sentinel" class="lazy-sentinel" aria-hidden="true"></div>

    <!-- Stato vuoto -->
    <p v-if="!store.loading && filteredItems.length === 0" class="empty-msg">
      {{ t('app.notFound') }}
    </p>
  </div>
</template>

<style scoped>
.gallery-view { padding: var(--sp-4) var(--sp-5); }

/* — filtri — */
.filters-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-3) var(--sp-4);
  margin-bottom: var(--sp-3);
  padding: var(--sp-2);
}
.filter-all,
.filter-word {
  background: transparent;
  border: none;
  padding: var(--sp-2) var(--sp-3);
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--accent);
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;
  min-height: var(--tap-min);
}
.filter-all:hover,
.filter-word:hover { color: var(--accent-strong); }
.filter-all.active,
.filter-word.active {
  text-decoration: underline;
  color: var(--accent-strong);
}
.filter-tipologias {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

/* — tools — */
.tools-bar {
  display: flex;
  justify-content: flex-end;
  gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-3);
  margin-bottom: var(--sp-2);
  flex-wrap: wrap;
}
.chrono-btn {
  padding: var(--sp-2) var(--sp-4);
  font-size: var(--fs-sm);
  border-radius: var(--radius);
  border: 1px solid var(--accent);
  background: white;
  color: var(--text);
  min-height: var(--tap-min);
  transition: background 0.2s, color 0.2s;
}
.chrono-btn.active {
  background: var(--accent);
  color: white;
}
.search-input {
  width: clamp(220px, 30%, 480px);
  padding: var(--sp-2) var(--sp-3);
  font-size: var(--fs-sm);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: white;
  min-height: var(--tap-min);
}

/* — grid — */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(clamp(240px, 20vw, 360px), 1fr));
  gap: var(--sp-5);
  padding: var(--sp-5);
}

/* — skeleton — */
.skeleton-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: var(--sp-3);
}
.skeleton-img {
  width: 100%;
  height: clamp(160px, 14vw, 260px);
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, #d6cec4 25%, #ece4d9 37%, #d6cec4 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}
.skeleton-text {
  height: 16px;
  margin-top: var(--sp-3);
  width: 80%;
  border-radius: 4px;
  background: linear-gradient(90deg, #d6cec4 25%, #ece4d9 37%, #d6cec4 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}
.skeleton-text.short { width: 60%; }

.empty-msg {
  text-align: center;
  font-size: var(--fs-md);
  color: var(--text-muted);
  margin-top: var(--sp-7);
}
.lazy-sentinel {
  width: 100%;
  height: 1px;
  margin-top: var(--sp-2);
}
</style>
