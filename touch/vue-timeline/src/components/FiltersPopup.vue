<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="open" class="filters-overlay" @click.self="$emit('close')">
        <div class="filters-box">
          <header class="filters-head">
            <h2 class="modal-title">{{ t('ui.filterLanguages') }}</h2>
            <button class="close-btn" @click="$emit('close')">×</button>
          </header>

          <!-- Lingue raggruppate per area linguistica, 2–3 colonne -->
          <div class="filter-section thin-scroll">
            <div class="languages-columns">
              <div v-for="group in linguageGroups" :key="group.area" class="language-group">
                <p class="group-area">{{ group.area }}</p>
                <div class="group-items">
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
          </div>

          <div class="filters-footer">
            <button class="btn btn-azzera" @click="resetLanguages">
              {{ t('ui.reset') || 'Azzera' }}
            </button>
          </div>
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
  selectedLanguages: { type: Array, required: true },
  maxLanguages: { type: Number, default: 6 },
  minLanguages: { type: Number, default: 1 },
})
const emit = defineEmits([
  'close', 'apply',
  'update:selectedLanguages',
])

const { t, locale } = useI18n()
const store = useDataStore()

function getName(lang) { return store.linguaName(lang, locale.value) }

function areaOrder(area) {
  const m = (area || '').match(/^(\d+(\.\d+)?)/)
  return m ? parseFloat(m[1]) : 999
}

const linguageGroups = computed(() => {
  const usedLangIds = new Set(store.milestonesRaw.map(m => m.lingua))
  const availableLangs = store.lingue.filter(l => usedLangIds.has(l.id))

  // Usa Map (non oggetto) per evitare collisioni con chiavi speciali come '__proto__'
  const map = new Map()

  availableLangs.forEach(l => {
    const raw = (l.Area_linguistica ?? '—')

    const label = raw.trim().replace(/^\d+(\.\d+)?\s*/, '') || '—'
    const key = label.toLowerCase()
    if (!map.has(key)) {
      map.set(key, { label, items: [], sortKey: areaOrder(raw) })
    }
    map.get(key).items.push(l)
  })

  return [...map.values()]
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(g => ({
      area: g.label,
      items: g.items.sort((x, y) => getName(x).localeCompare(getName(y))),
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

function resetLanguages() {
  const defaults = store.lingue
    .filter(l => ['italiano', 'inglese'].includes(l.lingua?.toLowerCase()))
    .map(l => l.id)
  const fallback = defaults.length ? defaults : store.lingue.slice(0, 2).map(l => l.id)
  emit('update:selectedLanguages', fallback)
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
  width: min(1400px, 95vw);
  max-height: 90vh;
  padding: var(--sp-5);
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  overflow: hidden;
}

.filters-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.close-btn {
  width: clamp(56px, 4.5vw, 84px);
  height: clamp(56px, 4.5vw, 84px);
  border-radius: 50%;
  background: var(--w-08);
  color: white;
  font-size: clamp(28px, 2.4vw, 44px);
  line-height: 1;
  transition: background var(--tr-base);
  
}
.close-btn:hover  { background: var(--w-22); }
.close-btn:active { transform: scale(0.95); }

/* ── Sezione scrollabile ─────────────────────────────────── */
.filter-section {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: var(--sp-2);
  scrollbar-width: thin;
  scrollbar-color: var(--w-22) transparent;
}
.filter-section::-webkit-scrollbar { width: 8px; }
.filter-section::-webkit-scrollbar-thumb {
  background: var(--w-22);
  border-radius: 4px;
}

/* ── Layout a colonne (2 di default, 3 su wide) ──────────── */
.languages-columns {
  columns: 2;
  column-gap: var(--sp-5);
  column-rule: 1px solid var(--w-08);
}

@media (min-width: 1200px) {
  .languages-columns { columns: 3; }
}

@media (min-width: 2560px) {
  .languages-columns { columns: 3; column-gap: var(--sp-6); }
}

/* ── Gruppo per area ─────────────────────────────────────── */
.language-group {
  break-inside: avoid;
  margin-bottom: var(--sp-4);
}

.group-area {
  font-size: clamp(12px, 1.1vw, 22px);
  color: var(--w-45);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: var(--sp-2);
  padding-bottom: var(--sp-1);
  border-bottom: 1px solid var(--w-08);
}

/* ── Items lingue dentro gruppo ──────────────────────────── */
.group-items {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.lang-item {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid transparent;
  color: var(--w-65);
  font-size: clamp(14px, 1.3vw, 26px);
  font-family: var(--font-body);
  cursor: pointer;
  transition: all var(--tr-base);
  min-height: clamp(56px, 5vw, 88px);
  
  width: 100%;
  text-align: left;
}

.lang-item:hover:not(:disabled) {
  background: var(--w-08);
  color: white;
  border-color: var(--w-12);
}

.lang-item:active:not(:disabled) { transform: scale(0.98); }

.lang-item.selected {
  background: var(--w-08);
  border-color: var(--w-30);
  color: white;
  font-weight: 600;
}

/* Colore a sinistra più grande se selezionato */
.lang-color {
  width: clamp(14px, 1.2vw, 20px);
  height: clamp(14px, 1.2vw, 20px);
  border-radius: 50%;
  flex-shrink: 0;
  transition: all var(--tr-fast);
  box-shadow: 0 0 0 0px transparent;
}

.lang-item.selected .lang-color {
  width: clamp(18px, 1.5vw, 26px);
  height: clamp(18px, 1.5vw, 26px);
  box-shadow: 0 0 0 3px rgba(255,255,255,0.15);
}

.lang-item:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

/* ── Footer con bottone Azzera ───────────────────────────── */
.filters-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
}

.btn-azzera {
  min-height: clamp(48px, 4vw, 72px);
  padding: var(--sp-2) var(--sp-5);
  font-size: var(--fs-base);
  border-radius: var(--radius-pill);
  background: var(--rosso);
  color: white;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background var(--tr-base), transform 0.1s;
  box-shadow: 0 3px 10px rgba(145, 43, 61, 0.3);
}
.btn-azzera:hover  { background: var(--rosso-dark); }
.btn-azzera:active { transform: scale(0.96); }

@media (hover: none) {
  .lang-item:hover { background: transparent; border-color: transparent; color: var(--w-65); }
  .close-btn:hover { background: var(--w-08); }
}

@media (min-width: 2560px) {
  .lang-item  { min-height: 72px; font-size: var(--fs-base); }
  .close-btn  { width: 80px; height: 80px; font-size: 44px; }
  .filter-section::-webkit-scrollbar { width: 14px; }
}
</style>
