<template>
  <div class="map-container">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="60 170 800 580"
      class="europe-svg"
    >
      <path
        v-for="country in countries"
        :key="country.id"
        :d="country.d"
        :id="country.id"
        :class="['country-path', { clickable: hasData(country.id), selected: selectedId === country.id }]"
        :style="getStyle(country.id)"
        @click="handleClick(country)"
        @mouseenter="hovered = country.id"
        @mouseleave="hovered = null"
      />
      <!-- Tooltip -->
      <text 
        v-if="hovered && inDictionary(hovered)" 
        x="80" 
        y="700" 
        class="country-label" 
        text-anchor="start">
        {{ countryName(hovered) }} {{ hasData(hovered) ? '(' + activeCountries[hovered] + ')' : '' }}
      </text>
    </svg>
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

const countries = computed(() => europePaths)

// Colori fedeli all'originale
// OGGI: vuoto=#2b917f69, pieno=#2b917fc2, selezionato=#912B3D
// IERI: vuoto=#00000030, pieno=#000000bd, selezionato=#912B3D
const COLOR = {
  oggi: { empty: '#2b917f69', full: '#2b917fc2', selected: '#912B3D' },
  ieri: { empty: '#00000030', full: '#000000bd', selected: '#912B3D' },
}

// Un paese è "nel dizionario" se ha una sigla riconosciuta
function inDictionary(id) {
  return id in DICT_SIGLA
}

// Un paese ha dati reali se è in activeCountries con count > 0
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

function handleClick(country) {
  if (!hasData(country.id)) return
  emit('click', country.id)
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.europe-svg {
  width: 100%;
  height: 100%;
}
.country-path {
  stroke: rgba(255,255,255,0.25);
  stroke-width: 0.8;
  transition: fill 0.2s, opacity 0.2s;
}
.country-path.clickable {
  cursor: pointer;
}
.country-path.clickable:hover {
  filter: brightness(3.0);
}
.country-path.selected {
  stroke: white;
  stroke-width: 1.5;
}
.country-label {
  fill: white;
  font-size: 18px;
  font-family: var(--font-body);
  font-weight: 600;
  pointer-events: none;
  text-shadow: 0 1px 4px rgba(0,0,0,0.8);
}
</style>
