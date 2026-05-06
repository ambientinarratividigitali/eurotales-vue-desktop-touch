<template>
  <div class="chart-wrap">
    <div class="chart-and-info">
      <div class="canvas-box">
        <canvas ref="canvasEl"></canvas>

        <!-- Tooltip touch persistente: mostra info dell'ultimo spicchio toccato -->
        <transition name="fade">
          <div
            v-if="touchInfo"
            class="touch-tooltip"
            :style="{ borderColor: touchInfo.color }"
            @click.stop="touchInfo = null"
          >
            <span class="tt-dot" :style="{ background: touchInfo.color }"></span>
            <span class="tt-label">{{ touchInfo.label }}</span>
            <span class="tt-value">{{ touchInfo.value }}</span>
            <span class="tt-perc">({{ touchInfo.perc }}%)</span>
            <button class="tt-close" aria-label="Chiudi">×</button>
          </div>
        </transition>
      </div>

      <!-- Legenda esplicita: utile per touch (sostituisce l'hover) -->
      <ul v-if="showLegend && legendItems.length" class="chart-legend thin-scroll">
        <li
          v-for="(item, i) in legendItems"
          :key="item.label + i"
          class="legend-row"
          :class="{ active: touchInfo && touchInfo.label === item.label }"
          @click="onLegendClick(i)"
        >
          <span class="lg-dot" :style="{ background: item.color }"></span>
          <span class="lg-label" @scroll.passive="markScrolled">{{ item.label }}</span>
          <span class="lg-value">{{ item.value }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'

Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

const props = defineProps({
  data:     { type: Object, required: true },
  onClick:  { type: Function, default: null },
  canvasId: { type: String,  default: 'donut' },
  // Mostra la legenda laterale (utile su touch). True di default.
  showLegend: { type: Boolean, default: true },
})

const canvasEl = ref(null)
const touchInfo = ref(null)
let chart = null

// Voci legenda derivate dai dati passati in props (label + valore + colore)
const legendItems = computed(() => {
  const labels = props.data?.labels || []
  const ds = props.data?.datasets?.[0]
  if (!ds) return []
  const values = ds.data || []
  const colors = ds.backgroundColor || []
  return labels.map((label, i) => ({
    label,
    value: values[i] ?? 0,
    color: colors[i] || '#888',
  }))
})

const totalValue = computed(() =>
  legendItems.value.reduce((sum, it) => sum + (Number(it.value) || 0), 0)
)

function setTouchInfoFromIndex(i) {
  const item = legendItems.value[i]
  if (!item) { touchInfo.value = null; return }
  const total = totalValue.value || 1
  const perc = ((item.value / total) * 100).toFixed(1)
  touchInfo.value = { ...item, perc }
}

// Flag globale che si attiva quando l'utente sta scrollando una label.
// Resta attivo per un breve tempo dopo lo scroll, sufficiente a inghiottire
// il click che il browser sintetizza al rilascio del dito.
const justScrolled = ref(false)
let scrollResetTimer = null
function markScrolled() {
  justScrolled.value = true
  clearTimeout(scrollResetTimer)
  scrollResetTimer = setTimeout(() => { justScrolled.value = false }, 250)
}

function onLegendClick(i) {
  // Se l'utente ha appena scrollato una label, ignora questo click:
  // era con tutta probabilità un tap-fine-swipe, non una vera selezione.
  if (justScrolled.value) return
  setTouchInfoFromIndex(i)
  if (props.onClick && chart) {
    // Simula la struttura di un click element di Chart.js
    props.onClick([{ index: i }], chart)
  }
}

function labelsEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

function buildChart() {
  if (chart) { chart.destroy(); chart = null }
  if (!canvasEl.value) return

  // Reset tooltip al rebuild (solo al primo mount o cambio reale di chart)
  touchInfo.value = null

  chart = new Chart(canvasEl.value, {
    type: 'doughnut',
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.35)',
      layout: { padding: 16 },
      // Animazione veloce per non bloccare il prossimo tap
      animation: { duration: 250 },
      plugins: {
        legend: { display: false },
        // Tooltip nativo Chart.js: utile per mouse, ma su touch
        // rimane troppo piccolo. Lo lasciamo per il desktop.
        tooltip: {
          enabled: true,
          padding: 14,
          titleFont: { size: 18, weight: '600' },
          bodyFont:  { size: 16 },
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0) || 1
              const perc = ((ctx.parsed / total) * 100).toFixed(1)
              return ` ${ctx.parsed} (${perc}%)`
            },
          },
        },
      },
      // Click: mostra il bubble persistente (touch-friendly)
      // e propaga al consumer per la navigazione.
      onClick: (evt, els, c) => {
        if (!els.length) return
        const idx = els[0].index
        setTouchInfoFromIndex(idx)
        if (props.onClick) props.onClick(els, c)
      },
    },
  })
}

/**
 * Aggiorna i dati del chart esistente senza distruggerlo.
 * Mantiene listener e animazioni fluide. Usa questo quando cambiano
 * solo i numeri/colori ma la struttura (labels) resta uguale.
 */
function updateChartData() {
  if (!chart) { buildChart(); return }
  chart.data = props.data
  chart.update()
}

onMounted(() => {
  // Attende il prossimo tick per essere sicuri che il canvas abbia dimensioni
  nextTick(buildChart)
})

watch(() => props.data, (newData, oldData) => {
  const newLabels = newData?.labels || []
  const oldLabels = oldData?.labels || []

  if (chart && labelsEqual(newLabels, oldLabels)) {
    // Stessa struttura: aggiorno in-place senza perdere listener/animazioni.
    updateChartData()
    // Se c'era un bubble attivo, aggiornane il valore/percentuale (i conteggi
    // potrebbero essere cambiati). Se la label non esiste più, lo nascondo.
    if (touchInfo.value) {
      const idx = newLabels.indexOf(touchInfo.value.label)
      if (idx >= 0) setTouchInfoFromIndex(idx)
      else touchInfo.value = null
    }
  } else {
    // Struttura cambiata (nuovo set di label): rebuild completo.
    buildChart()
  }
}, { deep: true })

onUnmounted(() => {
  if (chart) chart.destroy()
  chart = null
  clearTimeout(scrollResetTimer)
})
</script>

<style scoped>
.chart-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-and-info {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr minmax(240px, 38%);
  gap: var(--sp-3);
  align-items: stretch;
  min-height: 0;
}

.canvas-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
}

canvas {
  max-width: 100%;
  max-height: 100%;
}

/* Tooltip touch persistente sotto al chart */
.touch-tooltip {
  position: absolute;
  bottom: var(--sp-2);
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  background: rgba(20, 16, 12, 0.95);
  border: 2px solid #fff;
  border-radius: var(--radius-pill);
  color: var(--w-85);
  font-size: var(--fs-base);
  font-weight: 600;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  cursor: pointer;
  max-width: 90%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 5;
}
.tt-dot {
  width: clamp(14px, 1vw, 22px);
  height: clamp(14px, 1vw, 22px);
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.35);
}
.tt-label {
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.tt-value { color: var(--oro); font-weight: 700; }
.tt-perc  { color: var(--w-65); font-weight: 500; }
.tt-close {
  margin-left: var(--sp-2);
  font-size: 1.4em;
  line-height: 1;
  color: var(--w-65);
  background: transparent;
  border: none;
  padding: 0 var(--sp-1);
  cursor: pointer;
}
.tt-close:hover { color: white; }

/* Legenda laterale: contenitore unico con sfondo scuro semitrasparente,
   le righe scorrono al suo interno (touch-friendly) */
.chart-legend {
  list-style: none;
  margin: 0;
  padding: var(--sp-2);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  min-height: 0;
  background: rgba(20, 16, 12, 0.55);
  border: 1px solid var(--w-12);
  border-radius: var(--radius-md);
  backdrop-filter: blur(6px);
}
.legend-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-2);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  color: var(--w-85);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  min-height: 48px;
  transition: background var(--tr-fast), border-color var(--tr-fast);
}
.legend-row:hover,
.legend-row:active { background: var(--w-12); }
.legend-row.active {
  background: var(--w-18);
  border-color: var(--w-45);
}
.lg-dot {
  width: clamp(14px, 1vw, 22px);
  height: clamp(14px, 1vw, 22px);
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.35);
}
.lg-label {
  /* min-width: 0 è essenziale: senza, in contesto grid/flex, la colonna 1fr
     si espande al contenuto invece di rispettare l'overflow. */
  min-width: 0;
  white-space: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  font-weight: 500;
  /* Niente scrollbar visibile orizzontale per non rovinare l'estetica;
     touch-swipe e trackpad continuano a funzionare. */
  scrollbar-width: none;
  -ms-overflow-style: none;
  /* Migliora lo scroll touch con momentum */
  -webkit-overflow-scrolling: touch;
  /* Indica visivamente che c'è altro testo da scoprire (fade a destra) */
  mask-image: linear-gradient(to right, black calc(100% - 24px), transparent);
  -webkit-mask-image: linear-gradient(to right, black calc(100% - 24px), transparent);
  /* Azione touch: solo pan-x (non verticale, che lasciamo al contenitore legenda) */
  touch-action: pan-x;
}
.lg-label::-webkit-scrollbar { display: none; }
/* Quando la riga è attiva, mostra il testo intero senza fade per chiarezza */
.legend-row.active .lg-label {
  mask-image: none;
  -webkit-mask-image: none;
}
.lg-value {
  color: var(--oro);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  padding-left: var(--sp-1);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Su 4K, la legenda merita più spazio per essere ben tappabile */
@media (min-width: 2560px) {
  .chart-and-info {
    grid-template-columns: 1fr minmax(360px, 40%);
    gap: var(--sp-4);
  }
  .legend-row { min-height: 64px; padding: var(--sp-2) var(--sp-3); }
}

/* Su schermi stretti, impila legenda sotto al chart */
@media (max-width: 900px) {
  .chart-and-info {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }
  .chart-legend { max-height: 30%; }
}
</style>
