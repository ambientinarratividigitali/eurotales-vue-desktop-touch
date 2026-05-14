<template>
  <header class="page-header">
    <div class="logo-title-content">
      <a href="https://eurotales.eu" class="logo-link">
        <img src="https://eurotales.eu/wp-content/uploads/2021/05/Logo-eurotales-ROSSO-DEFINITIVO.png"
            class="logo" alt="Eurotales" />
      </a>

      <h1 class="title">{{ t('app.title') }}</h1> 
      <span></span>
    </div>
    <div class="filtrilingua-lingue">
      <span class="legend" v-if="languages.length">
        <span class="legend-label-prefix">{{ t('fields.language') }}:</span>
        <span v-for="lang in languages" :key="lang.id" class="legend-item">
          <span class="legend-dot" :style="{ background: lang.colore_TL }"></span>
          <span class="legend-label">{{ getName(lang) }}</span>
        </span>
      </span>

      <button
        v-if="showFilter"
        class="filter-btn"
        @click="$emit('open-filters')"
      >
        <span class="filter-icon" aria-hidden="true">⚙</span>
        <span class="filter-label">{{ t('ui.filterLanguages') }}</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useDataStore } from '../stores/dataStore.js'

const { t, locale } = useI18n()
const store = useDataStore()

defineProps({
  languages:  { type: Array,   default: () => [] },
  showFilter: { type: Boolean, default: false },
})
defineEmits(['open-filters'])

function getName(lang) { return store.linguaName(lang, locale.value) }
</script>

<style scoped>
.page-header {
  position: relative;
  z-index: var(--z-header);
  
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-5);
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 2px solid rgba(0, 0, 0, 0.08);
  height: clamp(260px, 19vh, 520px);
  flex-shrink: 0;
}

.logo-link {  align-items: center; height: 100%; }
.logo { height: clamp(40px,6vw,300px); }

.filtrilingua-lingue{
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  flex-wrap: wrap;
}

.logo-title-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  min-width: 0;
  flex-shrink: 0;
}

.title {
  font-family: var(--font-display);
  font-size: clamp(36px, 3.6vw, 138px);
  font-weight: 700;
  color: var(--rosso);
  letter-spacing: 0.05em;
  white-space: nowrap;
  flex-shrink: 0;
}

.instruction {
  flex: 1;
  font-size: clamp(18px, 1.6vw, 31px);
  color: var(--grigio-mid);
  font-style: italic;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-1) var(--sp-3);
  min-width: 0;
  overflow: hidden;
}

.legend-label-prefix {
  font-size: clamp(17px, 1.4vw, 29px);
  font-weight: 600;
  color: var(--grigio-mid);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: clamp(17px, 1.4vw, 29px);
  color: var(--grigio-dark);
  font-weight: 500;
  white-space: nowrap;
}

.legend-dot {
  width: clamp(24px, 2vw, 39px);
  height: clamp(24px, 2vw, 39px);
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── Bottone filtro ───────────────────────────────────────── */
.filter-btn {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: clamp(18px, 1.6vw, 29px) clamp(26px, 2.6vw, 52px);
  min-height: clamp(78px, 7vw, 125px);
  background: var(--rosso);
  color: white;
  border-radius: var(--radius-lg);
  font-size: clamp(20px, 1.7vw, 34px);
  font-family: var(--font-body);
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
  cursor: pointer;
  
  flex-shrink: 0;
  transition: background 0.15s ease, transform 0.1s ease;
  margin-left: auto;
  box-shadow: 0 3px 12px rgba(145, 43, 61, 0.35);
}
.filter-btn:hover  { background: var(--rosso-dark); }
.filter-btn:active { transform: scale(0.96); }

.filter-icon { font-size: 1.2em; line-height: 1; }

@media (max-width: 1024px) { .instruction { display: none; } }
@media (max-width: 768px) {
  .title { display: none; }
  .legend-label-prefix { display: none; }
  .legend-item .legend-label { display: none; }
}
</style>
