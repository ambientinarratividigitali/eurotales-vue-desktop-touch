<template>
  <footer class="page-footer">

    <!-- Zoom (sinistra) -->
    <div class="zoom-controls">
      <button class="zoom-btn" @click="$emit('zoom-out')" :aria-label="t('ui.zoomOut')">−</button>
      <button class="zoom-btn" @click="$emit('zoom-in')"  :aria-label="t('ui.zoomIn')">+</button>
    </div>

    <!-- Frecce navigazione timeline (centro-sinistra) -->
    <div class="nav-arrows">
      <button class="nav-btn" @click="$emit('prev-marker')" :aria-label="t('ui.prevMarker') || 'Precedente'">
        <span class="nav-arrow">&#8592;</span>
      </button>
      <button class="nav-btn" @click="$emit('next-marker')" :aria-label="t('ui.nextMarker') || 'Successivo'">
        <span class="nav-arrow">&#8594;</span>
      </button>
    </div>

    <!-- Categorie (centro) -->
    <div class="categories-bar">
      <div class="cat-row">
        <button
          v-for="cat in categoriesRow1" :key="cat.id"
          class="cat-btn" :class="{ active: selectedCategories.includes(cat.id) }"
          @click="toggleCategory(cat.id)"
        >{{ getCatName(cat) }}</button>
      </div>
      <div class="cat-row">
        <button
          v-for="cat in categoriesRow2" :key="cat.id"
          class="cat-btn" :class="{ active: selectedCategories.includes(cat.id) }"
          @click="toggleCategory(cat.id)"
        >{{ getCatName(cat) }}</button>
      </div>
    </div>

    <!-- Lang switcher (destra) -->
    <div class="lang-switch">
      <button
        v-for="loc in ['it', 'en']" :key="loc"
        class="lang-btn" :class="{ active: locale === loc }"
        @click="locale = loc"
      >{{ loc.toUpperCase() }}</button>
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
  selectedCategories: { type: Array, required: true },
})
const emit = defineEmits([
  'zoom-in', 'zoom-out',
  'prev-marker', 'next-marker',
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
.page-footer {
  position: relative;
  z-index: var(--z-header);
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: clamp(10px, 1vw, 20px) var(--sp-4);
  background: rgba(255, 255, 255, 0.95);
  border-top: 2px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  min-height: clamp(90px, 9vw, 150px);
}

/* ── Zoom ───────────────────────────────────────────────── */
.zoom-controls {
  display: flex;
  gap: var(--sp-2);
  flex-shrink: 0;
}

.zoom-btn {
  width: clamp(56px, 5vw, 90px);
  height: clamp(56px, 5vw, 90px);
  font-size: clamp(24px, 2.5vw, 44px);
  border-radius: 50%;
  background: var(--rosso);
  color: white;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: background var(--tr-base), transform 0.1s;
  box-shadow: 0 3px 10px rgba(145, 43, 61, 0.3);
  touch-action: manipulation;
}
.zoom-btn:hover  { background: var(--rosso-dark); }
.zoom-btn:active { transform: scale(0.92); }

/* ── Frecce navigazione ─────────────────────────────────── */
.nav-arrows {
  display: flex;
  gap: var(--sp-2);
  flex-shrink: 0;
}

.nav-btn {
  width: clamp(56px, 5vw, 90px);
  height: clamp(56px, 5vw, 90px);
  border-radius: var(--radius-md);
  background: var(--verde);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--tr-base), transform 0.1s;
  box-shadow: 0 3px 10px rgba(43, 145, 127, 0.3);
  touch-action: manipulation;
  flex-shrink: 0;
}
.nav-btn:hover  { background: #1f7060; }
.nav-btn:active { transform: scale(0.92); }

.nav-arrow {
  font-size: clamp(22px, 2.2vw, 40px);
  font-weight: 700;
  line-height: 1;
}

/* ── Categorie ──────────────────────────────────────────── */
.categories-bar {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);
}

.cat-row {
  display: flex;
  justify-content: center;
  gap: var(--sp-2);
  flex-wrap: wrap;
}

.cat-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: clamp(44px, 4vw, 72px);
  padding: 0.45em 1.2em;
  border-radius: 8px;
  border: 2px solid rgba(0,0,0,0.18);
  background: rgba(255,255,255,0.7);
  color: var(--grigio-mid);
  font-family: var(--font-body);
  font-size: clamp(12px, 1.1vw, 22px);
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--tr-base);
  touch-action: manipulation;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.cat-btn:hover { border-color: var(--rosso); color: var(--rosso); background: rgba(145,43,61,0.05); }
.cat-btn:active { transform: scale(0.96); }
.cat-btn.active {
  background: var(--rosso);
  border-color: var(--rosso);
  color: white;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(145,43,61,0.25);
}
.cat-btn.active:hover { background: var(--rosso-dark); border-color: var(--rosso-dark); }

/* ── Lang switch ─────────────────────────────────────────── */
.lang-switch {
  display: flex;
  gap: var(--sp-1);
  flex-shrink: 0;
}

.lang-btn {
  padding: 0.5em 1.2em;
  min-height: clamp(48px, 4.2vw, 76px);
  min-width: clamp(56px, 5vw, 90px);
  border-radius: var(--radius-pill);
  font-size: clamp(13px, 1.2vw, 22px);
  font-weight: 700;
  letter-spacing: 0.06em;
  background: var(--grigio-light);
  border: 2px solid transparent;
  color: var(--grigio-mid);
  cursor: pointer;
  transition: all var(--tr-base);
  touch-action: manipulation;
}
.lang-btn.active { background: var(--rosso); color: white; border-color: var(--rosso); }
.lang-btn:hover  { background: var(--beige-deep); color: var(--grigio-dark); }
.lang-btn.active:hover { background: var(--rosso-dark); color: white; }
.lang-btn:active { transform: scale(0.96); }

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 1024px) { .categories-bar { display: none; } }

@media (hover: none) {
  .zoom-btn:hover    { background: var(--rosso); }
  .nav-btn:hover     { background: var(--verde); }
  .cat-btn:hover     { background: rgba(255,255,255,0.7); border-color: rgba(0,0,0,0.18); color: var(--grigio-mid); }
  .cat-btn.active:hover { background: var(--rosso); border-color: var(--rosso); color: white; }
  .lang-btn:hover    { background: var(--grigio-light); color: var(--grigio-mid); }
  .lang-btn.active:hover { background: var(--rosso); color: white; }
}
</style>
