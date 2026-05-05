<template>
  <header class="page-header">
    <a href="https://eurotales.eu" class="logo-link">
      <img src="https://eurotales.eu/wp-content/uploads/2021/05/Logo-eurotales-ROSSO-DEFINITIVO.png"
           class="logo" alt="Eurotales" />
    </a>

    <!-- Titolo app -->
    <h1 class="title">{{ t('app.title') }}</h1>

    <!-- Istruzione centrale -->
    <p class="instruction">{{ t('ui.instruction') }}</p>

    <!-- Legenda lingue selezionate -->
    <aside class="legend" v-if="languages.length">
      <span class="legend-label-prefix">{{ t('fields.language') }}:</span>
      <div
        v-for="lang in languages"
        :key="lang.id"
        class="legend-item"
      >
        <span class="legend-dot" :style="{ background: lang.colore_TL }"></span>
        <span class="legend-label">{{ getName(lang) }}</span>
      </div>
    </aside>
  </header>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useDataStore } from '../stores/dataStore.js'

const { t, locale } = useI18n()
const store = useDataStore()

defineProps({
  languages: { type: Array, default: () => [] },
})

function getName(lang) {
  return store.linguaName(lang, locale.value)
}
</script>

<style scoped>
.page-header {
  position: relative;
  z-index: var(--z-header);
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-4);
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  height: clamp(72px, 8vh, 120px);
  flex-shrink: 0;
}

.logo-link { display: flex; align-items: center; height: 100%; }
.logo { height: 80%; max-height: 64px; }

.title {
  font-family: var(--font-display);
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--rosso);
  letter-spacing: 0.05em;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Istruzione centrata */
.instruction {
  flex: 1;
  font-size: var(--fs-sm);
  color: var(--grigio-mid);
  font-style: italic;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Legenda */
.legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-1) var(--sp-3);
  min-width: 0;
  overflow: hidden;
}

.legend-label-prefix {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--grigio-mid);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fs-sm);
  color: var(--grigio-dark);
  font-weight: 500;
  white-space: nowrap;
}

.legend-dot {
  width: clamp(14px, 1.2vw, 22px);
  height: clamp(14px, 1.2vw, 22px);
  border-radius: 50%;
  flex-shrink: 0;
}

@media (max-width: 1024px) {
  .instruction { display: none; }
}

@media (max-width: 768px) {
  .title { display: none; }
  .legend-label-prefix { display: none; }
  .legend-item .legend-label { display: none; }
}

@media (min-width: 2560px) {
  .legend-dot {
    width: clamp(18px, 1.5vw, 28px);
    height: clamp(18px, 1.5vw, 28px);
  }
}
</style>