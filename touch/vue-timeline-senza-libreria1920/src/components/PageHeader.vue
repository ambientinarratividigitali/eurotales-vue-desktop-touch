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
      <button v-if="showFilter" class="filter-btn" @click="$emit('open-filters')">
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
defineProps({ languages: { type: Array, default: () => [] }, showFilter: { type: Boolean, default: false } })
defineEmits(['open-filters'])
function getName(lang) { return store.linguaName(lang, locale.value) }
</script>

<style scoped>
.page-header {
  position: relative; 
  z-index: var(--z-header);
  display: flex; 
  flex-direction: column; 
  /* Portiamo l'altezza a 130px per renderlo più alto e arioso */
  height: 130px; 
  flex-shrink: 0;
  background: rgba(255,255,255,0.95);
  border-bottom: 1px solid rgba(0,0,0,0.08);
  /* Padding interno: 15px sopra, 20px lati, 15px sotto */
  padding: 15px 20px;
}

.logo-title-content { 
  display: flex; 
  align-items: center; 
  width: 100%; 
  position: relative; 
  /* Questa sezione occupa la parte alta */
  flex: 1; 
}

.logo-link { display: flex; align-items: center; height: 100%; }
.logo { 
  height: 44px; 
  max-width: 130px; 
  object-fit: contain; 
}

.title {
  position: absolute; 
  left: 50%; 
  top: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--font-display); 
  font-size: 60px; 
  font-weight: 700;
  color: var(--rosso); 
  letter-spacing: 0.05em; 
  white-space: nowrap; 
  pointer-events: none;
}

/* Riga inferiore con lingue e bottone */
.filtrilingua-lingue { 
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  width: 100%; 
  /* Aggiungiamo margine sopra per staccarlo dal titolo */
  margin-top: 10px;
  /* Spazio di sicurezza dal margine inferiore dell'header */
  padding-bottom: 8px; 
}

.legend { 
  display: flex; 
  align-items: center; 
  flex-wrap: wrap; 
  gap: 3px 10px; 
  min-width: 0; 
}

.legend-label-prefix { 
  font-size: 13px; 
  font-weight: 600; 
  color: var(--grigio-mid); 
  text-transform: uppercase; 
  letter-spacing: 0.06em; 
}

.legend-item { 
  display: flex; 
  align-items: center; 
  gap: 6px; 
  font-size: 13px; 
  color: var(--grigio-dark); 
  font-weight: 500; 
  white-space: nowrap; 
}

.legend-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }

.filter-btn {
  display: flex; 
  align-items: center; 
  gap: 6px;
  padding: 8px 18px; 
  min-height: 38px;
  background: var(--rosso); 
  color: white;
  border-radius: 8px; 
  font-size: 14px;
  font-family: var(--font-body); 
  font-weight: 700; 
  letter-spacing: 0.04em;
  white-space: nowrap; 
  cursor: pointer; 
  flex-shrink: 0;
  transition: background 0.15s ease, transform 0.1s ease;
  box-shadow: 0 2px 8px rgba(145,43,61,0.3); 
  touch-action: manipulation;
  /* Rimuovo margin-left: auto perché lo space-between del padre gestisce già la posizione */
}

.filter-btn:active { transform: scale(0.96); }
.filter-icon { font-size: 1.1em; line-height: 1; }
</style>
