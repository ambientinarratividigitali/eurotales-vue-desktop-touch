<template>
  <div class="chart-wrap">
    <canvas ref="canvasEl"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'

Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

const props = defineProps({
  data: { type: Object, required: true },   // { labels, datasets:[{data, backgroundColor}] }
  onClick: { type: Function, default: null },
  canvasId: { type: String, default: 'donut' },
})

const canvasEl = ref(null)
let chart = null

function buildChart() {
  if (chart) { chart.destroy(); chart = null }
  if (!canvasEl.value) return

  chart = new Chart(canvasEl.value, {
    type: 'doughnut',
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      borderWidth: 0.5,
      layout: { padding: 20 },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            title: items => items[0].label + ': ' + items[0].parsed,
          },
        },
      },
      onClick: props.onClick
        ? (evt, el, chart) => { if (el.length) props.onClick(el, chart) }
        : undefined,
    },
  })
}

onMounted(buildChart)
watch(() => props.data, buildChart, { deep: true })
onUnmounted(() => { if (chart) chart.destroy() })
</script>

<style scoped>
.chart-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
canvas { max-width: 100%; max-height: 100%; }
</style>
