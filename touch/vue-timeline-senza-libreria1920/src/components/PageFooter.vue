<template>
  <footer class="page-footer">
    <div class="zoom-controls">
      <button class="zoom-btn" @click="$emit('zoom-out')" :aria-label="t('ui.zoomOut')">−</button>
      <button class="zoom-btn" @click="$emit('zoom-in')"  :aria-label="t('ui.zoomIn')">+</button>
    </div>
    <div class="categories-bar">
      <div class="cat-row">
        <button v-for="cat in categoriesRow1" :key="cat.id"
          class="cat-btn" :class="{ active: selectedCategories.includes(cat.id) }"
          @click="toggleCategory(cat.id)">{{ getCatName(cat) }}</button>
      </div>
      <div class="cat-row">
        <button v-for="cat in categoriesRow2" :key="cat.id"
          class="cat-btn" :class="{ active: selectedCategories.includes(cat.id) }"
          @click="toggleCategory(cat.id)">{{ getCatName(cat) }}</button>
      </div>
    </div>
    <div class="lang-switch">
      <button v-for="loc in ['it', 'en']" :key="loc"
        class="lang-btn" :class="{ active: locale === loc }"
        @click="locale = loc">{{ loc.toUpperCase() }}</button>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDataStore } from '../stores/dataStore.js'
const { t, locale } = useI18n()
const store = useDataStore()
const props = defineProps({ selectedCategories: { type: Array, required: true } })
const emit = defineEmits(['zoom-in', 'zoom-out', 'prev-marker', 'next-marker', 'update:selectedCategories'])
function getCatName(cat) { return store.categoriaName(cat, locale.value) }
const categories = computed(() => [...store.categorie].sort((a, b) => (a.id || 0) - (b.id || 0)))
const categoriesRow1 = computed(() => categories.value.slice(0, 4))
const categoriesRow2 = computed(() => categories.value.slice(4))
function toggleCategory(id) {
  const list = [...props.selectedCategories]
  const idx = list.indexOf(id)
  if (idx >= 0) { if (list.length <= 1) return; list.splice(idx, 1) }
  else { list.push(id) }
  emit('update:selectedCategories', list)
}
</script>

<style scoped>
/* Footer: 95px su viewport 1920×1080 */
.page-footer {
  position: relative; z-index: var(--z-header);
  display: flex; align-items: center; gap: 16px;
  padding: 8px 24px;
  background: rgba(255,255,255,0.95);
  border-top: 2px solid rgba(0,0,0,0.08);
  flex-shrink: 0; height: 95px;
}

.zoom-controls { display: flex; gap: 10px; flex-shrink: 0; }
.zoom-btn {
  width: 52px; height: 52px; font-size: 26px;
  border-radius: 50%; background: var(--rosso); color: white;
  font-weight: 700; line-height: 1; cursor: pointer;
  transition: background var(--tr-base), transform 0.1s;
  box-shadow: 0 2px 6px rgba(145,43,61,0.3); touch-action: manipulation;
}
.zoom-btn:hover  { background: var(--rosso-dark); }
.zoom-btn:active { transform: scale(0.92); }

.categories-bar { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 5px; }
.cat-row { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
.cat-btn {
  display: inline-flex; align-items: center; justify-content: center;
  height: 34px; padding: 0 16px;
  border-radius: 6px; border: 2px solid rgba(0,0,0,0.18);
  background: rgba(255,255,255,0.7); color: var(--grigio-mid);
  font-family: var(--font-body); font-size: 13px; font-weight: 600;
  white-space: nowrap; cursor: pointer; transition: all var(--tr-base);
  letter-spacing: 0.03em; text-transform: uppercase; touch-action: manipulation;
}
.cat-btn:hover { border-color: var(--rosso); color: var(--rosso); background: rgba(145,43,61,0.05); }
.cat-btn:active { transform: scale(0.96); }
.cat-btn.active { background: var(--rosso); border-color: var(--rosso); color: white; font-weight: 700; box-shadow: 0 1px 5px rgba(145,43,61,0.25); }
.cat-btn.active:hover { background: var(--rosso-dark); border-color: var(--rosso-dark); }

.lang-switch { display: flex; gap: 6px; flex-shrink: 0; }
.lang-btn {
  padding: 0 18px; height: 42px; min-width: 54px;
  border-radius: 25px; font-size: 14px; font-weight: 700; letter-spacing: 0.06em;
  background: var(--grigio-light); border: 2px solid transparent;
  color: var(--grigio-mid); cursor: pointer; transition: all var(--tr-base); touch-action: manipulation;
}
.lang-btn.active { background: var(--rosso); color: white; border-color: var(--rosso); }
.lang-btn:hover  { background: var(--beige-deep); color: var(--grigio-dark); }
.lang-btn.active:hover { background: var(--rosso-dark); color: white; }
.lang-btn:active { transform: scale(0.96); }

@media (max-width: 1280px) { .categories-bar { display: none; } }
@media (hover: none) {
  .zoom-btn:hover { background: var(--rosso); }
  .cat-btn:hover  { background: rgba(255,255,255,0.7); border-color: rgba(0,0,0,0.18); color: var(--grigio-mid); }
  .cat-btn.active:hover { background: var(--rosso); border-color: var(--rosso); color: white; }
  .lang-btn:hover { background: var(--grigio-light); color: var(--grigio-mid); }
  .lang-btn.active:hover { background: var(--rosso); color: white; }
}
</style>
