<template>
  <div class="map-container">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="60 170 800 580"
      class="europe-svg"
      @click.self="clearActiveLabel"
    >
      <path
        v-for="country in countries"
        :key="country.id"
        :d="country.d"
        :id="country.id"
        :class="[
          'country-path',
          { clickable: hasData(country.id), selected: selectedId === country.id, hovered: hovered === country.id }
        ]"
        :style="getStyle(country.id)"
        @click="handleClick(country)"
        @mouseenter="hovered = country.id; showLabel(country.id)"
        @mouseleave="hovered = null"
      />
    </svg>

    <!-- Pannello info persistente (touch-friendly): mostra sempre l'ultimo paese
         toccato/hoverato. Su touch resta visibile dopo il tap. -->
    <transition name="fade">
      <div v-if="activeLabelId" class="map-info-pill" :class="{ 'has-data': hasData(activeLabelId) }">
        <span class="mip-flag" :style="{ background: pillColor }"></span>
        <span class="mip-name">{{ countryName(activeLabelId) }}</span>
        <span v-if="hasData(activeLabelId)" class="mip-count">
          {{ activeCountries[activeLabelId] }}
        </span>
        <button class="mip-close" @click="clearActiveLabel" aria-label="Chiudi">×</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { DICT_SIGLA } from '../stores/dataStore.js'
import { europePaths } from '../assets/europePaths.js'

const props = defineProps({
  // { sigla: count } - paesi con dati
  activeCountries: { type: Object, default: () => ({}) },
  selectedId:      { type: String, default: null },
  // 'ieri' o 'oggi' - determina la palette colori
  domain:          { type: String, default: 'oggi' },
})

const emit = defineEmits(['click'])
const hovered = ref(null)

// "Pin" del label: persiste dopo il tap, finché non si tocca un altro paese
// o si chiude esplicitamente. Mostra anche al primo hover desktop.
const activeLabelId = ref(null)

const countries = computed(() => europePaths)

// Palette: contrasti alzati per leggibilità su 4K + sfondo overlay scuro
// OGGI: vuoto verde tenue, pieno verde solido, selezionato rosso identità
// IERI: vuoto grigio tenue, pieno scuro solido, selezionato rosso identità
const COLOR = {
  oggi: { empty: '#2b917f80', full: '#2B917F', selected: '#DBB971' }, 
  
  ieri: { empty: '#1a1a1a55', full: '#333',  selected: '#912B3D' }, 
}

function inDictionary(id) {
  return id in DICT_SIGLA
}

function hasData(id) {
  return props.activeCountries[id] != null && props.activeCountries[id] > 0
}

function getStyle(id) {
  const palette = COLOR[props.domain] || COLOR.oggi
  if (id === props.selectedId) {
    return { fill: palette.selected }
  }
  if (!inDictionary(id)) {
    // Isole, Gibilterra, Jersey, ecc. - invisibili
    return { fill: 'transparent', stroke: 'none' }
  }
  if (hasData(id)) {
    return { fill: palette.full }
  }
  return { fill: palette.empty }
}

function countryName(id) {
  const nome = DICT_SIGLA[id]
  if (!nome) return id
  return nome.charAt(0).toUpperCase() + nome.slice(1)
}

const pillColor = computed(() => {
  const palette = COLOR[props.domain] || COLOR.oggi
  if (!activeLabelId.value) return palette.full
  if (activeLabelId.value === props.selectedId) return palette.selected
  return hasData(activeLabelId.value) ? palette.full : palette.empty
})

function showLabel(id) {
  if (!inDictionary(id)) return
  activeLabelId.value = id
}

function clearActiveLabel() {
  activeLabelId.value = null
}

function handleClick(country) {
  if (!inDictionary(country.id)) return
  // Un singolo tap aggiorna sempre il pannello info e, se il paese ha
  // dati, attiva la navigazione. L'info pill resta visibile come feedback.
  activeLabelId.value = country.id
  if (hasData(country.id)) emit('click', country.id)
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.europe-svg {
  width: 100%;
  height: 100%;
}
.country-path {
  stroke: rgba(255, 255, 255, 0.35);
  stroke-width: 0.8;
  transition: fill 0.2s, opacity 0.2s, filter 0.2s;
}
.country-path.clickable {
  cursor: pointer;
}
.country-path.clickable:not(.selected):hover,
.country-path.hovered.clickable:not(.selected) {
  filter: brightness(1.6);
}
.country-path.selected {
  stroke: white;
  stroke-width: 1.5;
}

/* Pillola info: visibile e ben leggibile su 4K */
.map-info-pill {
  position: absolute;
  bottom: var(--sp-2);
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  background: rgba(20, 16, 12, 0.92);
  border: 2px solid var(--w-30);
  border-radius: var(--radius-pill);
  color: white;
  font-size: var(--fs-base);
  font-weight: 600;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  max-width: 90%;
  white-space: nowrap;
  z-index: 5;
}
.map-info-pill.has-data { border-color: white; }

.mip-flag {
  width: clamp(14px, 1vw, 22px);
  height: clamp(14px, 1vw, 22px);
  border-radius: 4px;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
}
.mip-name {
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.mip-count {
  color: var(--oro);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  padding-left: var(--sp-1);
}
.mip-close {
  margin-left: var(--sp-2);
  font-size: 1.4em;
  line-height: 1;
  color: var(--w-65);
  background: transparent;
  border: none;
  padding: 0 var(--sp-1);
  cursor: pointer;
}
.mip-close:hover { color: white; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
