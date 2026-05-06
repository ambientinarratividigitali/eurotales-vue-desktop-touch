<template>
  <footer class="page-footer">

    <!-- Zoom (sinistra) -->
    <div class="zoom-controls">
      <button
        class="zoom-btn"
        @click="$emit('zoom-out')"
        :aria-label="t('ui.zoomOut')"
      >−</button>
      <button
        class="zoom-btn"
        @click="$emit('zoom-in')"
        :aria-label="t('ui.zoomIn')"
      >+</button>
    </div>

    <!-- Categorie come bottoni pill toggle (centro) -->
    <div class="categories-bar">
      <div class="cat-row">
        <button
          v-for="cat in categoriesRow1"
          :key="cat.id"
          class="cat-btn"
          :class="{ active: selectedCategories.includes(cat.id) }"
          @click="toggleCategory(cat.id)"
        >{{ getCatName(cat) }}</button>
      </div>
      <div class="cat-row">
        <button
          v-for="cat in categoriesRow2"
          :key="cat.id"
          class="cat-btn"
          :class="{ active: selectedCategories.includes(cat.id) }"
          @click="toggleCategory(cat.id)"
        >{{ getCatName(cat) }}</button>
      </div>
    </div>

    <!-- Destra: filtro lingue + lang switcher -->
    <div class="footer-actions">
      <button
        v-if="showFilter"
        class="filter-btn"
        @click="$emit('open-filters')"
      >
        <span class="filter-icon" aria-hidden="true">⚙</span>
        <span class="filter-label">{{ t('ui.filterLanguages') }}</span>
      </button>

      <div class="lang-switch">
        <button
          v-for="loc in ['it', 'en']"
          :key="loc"
          class="lang-btn"
          :class="{ active: locale === loc }"
          @click="locale = loc"
        >{{ loc.toUpperCase() }}</button>
      </div>
    </div>

  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDataStore } from '../stores/dataStore.js'

const { t, locale } = useI18n()
const store = useDataStore()

const props = defineProps({
  showFilter: { type: Boolean, default: true },
  selectedCategories: { type: Array, required: true },
})
const emit = defineEmits([
  'zoom-in', 'zoom-out',
  'open-filters',
  'update:selectedCategories',
])

function getCatName(cat) { return store.categoriaName(cat, locale.value) }

const categories = computed(() =>
  [...store.categorie].sort((a, b) => (a.id || 0) - (b.id || 0))
)

const categoriesRow1 = computed(() => categories.value.slice(0, 4))
const categoriesRow2 = computed(() => categories.value.slice(4))

function toggleCategory(id) {
  const list = [...props.selectedCategories]
  const idx = list.indexOf(id)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(id)
  emit('update:selectedCategories', list)
}
</script>

<style scoped>
/*
  Strategia sizing:
  - Il footer NON ha altezza fissa: è alto quanto il suo contenuto + padding.
  - Tutti i bottoni usano font-size fluido (var --fs-sm / --fs-base) e
    padding in em, così scalano proporzionalmente senza mai uscire.
  - Su 4K usiamo un moltiplicatore moderato anziché clamp agganciato a vw.
*/
.page-footer {
  position: relative;
  z-index: var(--z-header);
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  /* padding verticale = unica fonte della "altezza" del footer */
  padding: var(--sp-2) var(--sp-4);
  background: rgba(255, 255, 255, 0.92);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

/* ── Zoom ───────────────────────────────────────────────── */
.zoom-controls {
  display: flex;
  gap: var(--sp-1);
  flex-shrink: 0;
}

.zoom-btn {
  /* dimensione agganciata a font-size, non a vw */
  width: 2.8em;
  height: 2.8em;
  font-size: var(--fs-lg);   /* scala fluida, cap ragionevole */
  border-radius: 50%;
  background: var(--rosso);
  color: white;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: all var(--tr-base);
  box-shadow: 0 2px 8px rgba(145, 43, 61, 0.3);
  touch-action: manipulation;
}
.zoom-btn:hover  { background: var(--rosso-dark); }
.zoom-btn:active { transform: scale(0.93); }

.categories-bar {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-1) 0;
}

.cat-row {
  display: flex;
  justify-content: center;
  gap: var(--sp-2);
}

/* ── Category buttons — stile distinto: tag/chip quadrato ── */
.cat-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0.5em 1.1em;
  border-radius: 6px;
  border: 1.5px solid rgba(0,0,0,0.18);
  background: rgba(255,255,255,0.6);
  color: var(--grigio-mid);
  font-family: var(--font-body);
  font-size: var(--fs-sm);
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--tr-base);
  touch-action: manipulation;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.cat-btn:hover {
  border-color: var(--rosso);
  color: var(--rosso);
  background: rgba(145, 43, 61, 0.05);
}
.cat-btn:active { transform: scale(0.96); }
.cat-btn.active {
  background: var(--rosso);
  border-color: var(--rosso);
  color: white;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(145, 43, 61, 0.25);
}
.cat-btn.active:hover {
  background: var(--rosso-dark);
  border-color: var(--rosso-dark);
  color: white;
}
/* ── Footer actions (destra) ─────────────────────────────── */
.footer-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex-shrink: 0;
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.45em 1.1em;
  border-radius: var(--radius-pill);
  border: 2px solid var(--rosso);
  background: var(--rosso);
  color: white;
  font-family: var(--font-body);
  font-size: var(--fs-sm);
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--tr-base);
  touch-action: manipulation;
  box-shadow: 0 2px 8px rgba(145, 43, 61, 0.3);
}
.filter-btn:hover  { background: var(--rosso-dark); border-color: var(--rosso-dark); }
.filter-btn:active { transform: scale(0.96); }

.filter-icon { font-size: 1.1em; line-height: 1; }

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 1024px) {
  .categories-bar { display: none; }
}

@media (max-width: 768px) {
  .filter-label { display: none; }
  .filter-btn   { padding: 0.45em 0.7em; }
  .filter-icon  { font-size: 1.3em; }
}

/* 4K: il font-size fluido (--fs-sm, --fs-lg) già scala via clamp.
   Qui solo zoom-btn che è dimensionato in em ha bisogno di poco aiuto. */
@media (min-width: 2560px) {
  .page-footer  { padding: var(--sp-3) var(--sp-5); }
}

@media (hover: none) {
  .zoom-btn:hover       { background: var(--rosso); }
  .cat-btn:hover        { background: rgba(255,255,255,0.6); border-color: rgba(0,0,0,0.18); color: var(--grigio-mid); }
  .cat-btn.active:hover { background: var(--rosso); border-color: var(--rosso); color: white; }
  .filter-btn:hover     { background: var(--rosso); border-color: var(--rosso); }
}
</style>