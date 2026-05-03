<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="open" class="filters-overlay" @click.self="$emit('close')">
        <div class="filters-box">
          <header class="filters-head">
            <h2 class="modal-title">{{ t('ui.filterLanguages') }}</h2>
            <button class="close-btn" @click="$emit('close')">×</button>
          </header>

          <!-- Lingue raggruppate per area linguistica -->
          <div class="filter-section thin-scroll">
            <h3 class="section-title">{{ t('fields.language') }}</h3>
            <div class="languages-grid">
              <div v-for="group in linguageGroups" :key="group.area" class="language-group">
                <p class="group-area">{{ group.area }}</p>
                <button
                  v-for="lang in group.items"
                  :key="lang.id"
                  class="lang-item"
                  :class="{ selected: isSelected(lang) }"
                  :disabled="!isSelected(lang) && atMax"
                  @click="toggleLanguage(lang)"
                >
                  <span class="lang-color" :style="{ background: lang.colore_TL }"></span>
                  <span class="lang-name">{{ getName(lang) }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Categorie -->
          <div class="filter-section">
            <h3 class="section-title">{{ t('ui.selectCategory') }}</h3>
            <div class="categories-grid">
              <label v-for="cat in categories" :key="cat.id" class="cat-checkbox">
                <input
                  type="checkbox"
                  :checked="selectedCategories.includes(cat.id)"
                  @change="toggleCategory(cat.id)"
                />
                <span>{{ getCatName(cat) }}</span>
              </label>
            </div>
          </div>

          <button class="btn btn-oro" @click="$emit('apply')">
            {{ t('ui.close') }}
          </button>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDataStore } from '../stores/dataStore.js'

const props = defineProps({
  open: Boolean,
  selectedLanguages: { type: Array, required: true },  // array di id
  selectedCategories: { type: Array, required: true }, // array di id
  maxLanguages: { type: Number, default: 5 },
  minLanguages: { type: Number, default: 1 },
})
const emit = defineEmits([
  'close', 'apply',
  'update:selectedLanguages', 'update:selectedCategories',
])

const { t, locale } = useI18n()
const store = useDataStore()

function getName(lang)    { return store.linguaName(lang, locale.value) }
function getCatName(cat)  { return store.categoriaName(cat, locale.value) }

const categories = computed(() =>
  [...store.categorie].sort((a, b) => (a.id || 0) - (b.id || 0))
)

/** Estrae l'ordine numerico da "01.01 Neoatina" → 01.01 */
function areaOrder(area) {
  const m = (area || '').match(/^(\d+(\.\d+)?)/)
  return m ? parseFloat(m[1]) : 999
}

/** Lingue raggruppate per Area_linguistica e ordinate. */
const linguageGroups = computed(() => {
  // Filtra solo lingue effettivamente presenti nei dati
  const usedLangIds = new Set(store.milestonesRaw.map(m => m.lingua))
  const availableLangs = store.lingue.filter(l => usedLangIds.has(l.id))

  const groups = {}
  availableLangs.forEach(l => {
    const area = l.Area_linguistica || '—'
    if (!groups[area]) groups[area] = []
    groups[area].push(l)
  })

  return Object.entries(groups)
    .sort((a, b) => areaOrder(a[0]) - areaOrder(b[0]))
    .map(([area, items]) => ({
      area: area.replace(/^\d+(\.\d+)?\s*/, ''), // rimuovi prefisso ordinale
      items: items.sort((x, y) => getName(x).localeCompare(getName(y))),
    }))
})

const atMax = computed(() => props.selectedLanguages.length >= props.maxLanguages)

function isSelected(lang) {
  return props.selectedLanguages.includes(lang.id)
}

function toggleLanguage(lang) {
  const list = [...props.selectedLanguages]
  const idx = list.indexOf(lang.id)
  if (idx >= 0) {
    if (list.length <= props.minLanguages) return
    list.splice(idx, 1)
  } else {
    if (list.length >= props.maxLanguages) return
    list.push(lang.id)
  }
  emit('update:selectedLanguages', list)
}

function toggleCategory(id) {
  const list = [...props.selectedCategories]
  const idx = list.indexOf(id)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(id)
  emit('update:selectedCategories', list)
}
</script>

<style scoped>
.filters-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: var(--b-85);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-4);
}

.filters-box {
  background: #1c1814;
  border: 1px solid var(--w-12);
  border-radius: var(--radius-lg);
  width: min(1200px, 95vw);
  max-height: 90vh;
  padding: var(--sp-5);
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  overflow: hidden;
}

.filters-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  width: clamp(44px, 3.5vw, 64px);
  height: clamp(44px, 3.5vw, 64px);
  border-radius: 50%;
  background: var(--w-08);
  color: white;
  font-size: clamp(24px, 2vw, 36px);
  line-height: 1;
  transition: background var(--tr-base);
  touch-action: manipulation;
}
.close-btn:hover  { background: var(--w-22); }
.close-btn:active { transform: scale(0.95); }

.filter-section {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  min-height: 0;
}
.filter-section:first-of-type {
  flex: 2;
  overflow-y: auto;
  padding-right: var(--sp-1);
}
.filter-section:nth-of-type(2) {
  flex: 0 0 auto;
}

.section-title {
  font-family: var(--font-display);
  font-size: var(--fs-md);
  color: var(--oro);
  font-weight: 600;
}

/* ── Lingue ────────────────────────────────────────────── */
.languages-grid {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.language-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-1);
  align-items: center;
}

.group-area {
  width: 100%;
  font-size: var(--fs-sm);
  color: var(--w-65);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: var(--sp-1);
}

.lang-item {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--radius-pill);
  background: var(--w-05);
  border: 1px solid var(--w-12);
  color: var(--w-65);
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: all var(--tr-base);
  min-height: 48px;
  touch-action: manipulation;
}
.lang-item:hover:not(:disabled) { background: var(--w-12); color: white; }
.lang-item:active:not(:disabled) { transform: scale(0.97); }

.lang-item.selected {
  background: var(--w-12);
  border-color: var(--w-45);
  color: white;
  font-weight: 600;
}

.lang-item:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.lang-color {
  width: clamp(14px, 1.2vw, 20px);
  height: clamp(14px, 1.2vw, 20px);
  border-radius: 50%;
  flex-shrink: 0;
}
.lang-item.selected .lang-color {
  width: clamp(18px, 1.5vw, 26px);
  height: clamp(18px, 1.5vw, 26px);
}

/* ── Categorie con custom checkbox grande e touch-friendly ── */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--sp-2);
}

.cat-checkbox {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-md);
  background: var(--w-05);
  cursor: pointer;
  font-size: var(--fs-base);
  color: var(--w-85);
  transition: background var(--tr-base);
  min-height: 56px;
  touch-action: manipulation;
}
.cat-checkbox:hover  { background: var(--w-08); }
.cat-checkbox:active { transform: scale(0.98); }

/* Custom checkbox visivamente grande */
.cat-checkbox input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: clamp(24px, 2vw, 36px);
  height: clamp(24px, 2vw, 36px);
  border: 2px solid var(--w-45);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: all var(--tr-fast);
}

.cat-checkbox input[type="checkbox"]:checked {
  background: var(--oro);
  border-color: var(--oro);
}

/* Spunta */
.cat-checkbox input[type="checkbox"]:checked::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 45%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 30%;
  height: 60%;
  border: solid white;
  border-width: 0 3px 3px 0;
}

/* ── Scrollbar fine ──────────────────────────────────────── */
.filter-section:first-of-type {
  scrollbar-width: thin;
  scrollbar-color: var(--w-22) transparent;
}
.filter-section:first-of-type::-webkit-scrollbar { width: 8px; }
.filter-section:first-of-type::-webkit-scrollbar-thumb {
  background: var(--w-22);
  border-radius: 4px;
}

@media (hover: none) {
  .lang-item:hover, .cat-checkbox:hover, .close-btn:hover {
    background: inherit;
  }
}

@media (min-width: 2560px) {
  .lang-item    { min-height: 64px; }
  .cat-checkbox { min-height: 72px; }
  .close-btn    { width: 72px; height: 72px; font-size: 40px; }
}
</style>
