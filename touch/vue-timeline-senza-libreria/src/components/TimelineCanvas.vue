<template>
  <div ref="containerRef" class="timeline-container">
    <div
      ref="viewportRef"
      class="tl-viewport"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerUp"
    >
      <div
        ref="trackRef"
        class="tl-track"
        :style="{ width: trackWidth + 'px', transform: `translateX(${-scrollX}px)` }"
      >
        <div
          v-for="m in placedMarkers"
          :key="`tick-${m.id}`"
          class="tl-tick"
          :class="{ active: activeId === m.id }"
          :style="{ left: m.tickX + 'px', top: m.tickTop + 'px', height: m.tickHeight + 'px' }"
        />

        <button
          v-for="m in placedMarkers"
          :key="`marker-${m.id}`"
          class="tl-marker"
          :class="{ active: activeId === m.id }"
          :style="{
            left: m.boxX + 'px',
            top:  m.boxY + 'px',
            width:  markerWidth + 'px',
            height: markerHeight + 'px',
            backgroundColor: m.color,
            color: m.textColor,
            borderColor: m.hasImage ? '#bababa' : 'transparent',
            borderWidth: m.hasImage ? '4px' : '0',
          }"
          @click.stop="onMarkerClick(m.id)"
        >
          <span class="tl-marker-headline">{{ m.label }}</span>
        </button>

        <div class="tl-axis" :style="{ top: axisTop + 'px' }">
          <div
            v-for="t in yearTicks"
            :key="t.year"
            class="tl-year-tick"
            :class="{ major: t.major }"
            :style="{ left: t.x + 'px' }"
          >
            <span v-if="t.major" class="tl-year-label">{{ t.year }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  events: { type: Array, required: true },
  markerStyles: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['marker-click', 'ready'])

const containerRef = ref(null)
const viewportRef  = ref(null)
const trackRef     = ref(null)

const viewportWidth  = ref(0)
const viewportHeight = ref(0)

const ZOOM_PX_PER_YEAR = [4, 7, 12, 20, 32, 50, 80, 130, 210]
const ZOOM_INITIAL = 0
const currentZoom = ref(ZOOM_INITIAL)
const pxPerYear = computed(() => ZOOM_PX_PER_YEAR[currentZoom.value])

const TIMELINE_YEAR_MIN = 400
const TIMELINE_YEAR_MAX = 2100

const yearMin = computed(() => TIMELINE_YEAR_MIN)
const yearMax = computed(() => TIMELINE_YEAR_MAX)

const PAD_YEARS = 0

const trackWidth = computed(() => {
  const span = (yearMax.value - yearMin.value) + 2 * PAD_YEARS
  return Math.max(span * pxPerYear.value, viewportWidth.value)
})

const markerWidth  = ref(160)
const markerHeight = ref(110)

function updateMarkerSize() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  markerWidth.value  = Math.max(130, Math.min(220, vw * 0.11))
  markerHeight.value = Math.max(90,  Math.min(160, vh * 0.09))
}

const ROW_GAP = 8
const TICK_SPACE = 60
const AXIS_HEIGHT = 40

function yearToX(year) {
  return (year - yearMin.value + PAD_YEARS) * pxPerYear.value
}

const placedMarkers = computed(() => {
  if (!props.events.length || !viewportHeight.value) return []

  const sorted = [...props.events].sort((a, b) => a.anno - b.anno)
  const usableH = viewportHeight.value - TICK_SPACE - AXIS_HEIGHT
  const rowH = markerHeight.value + ROW_GAP
  const maxRows = Math.max(1, Math.floor(usableH / rowH))
  const rowEndX = new Array(maxRows).fill(-Infinity)

  return sorted.map(ev => {
    const tickX = yearToX(ev.anno)
    const boxX  = tickX - markerWidth.value / 2

    let row = 0
    for (let r = 0; r < maxRows; r++) {
      if (boxX >= rowEndX[r] + 4) { row = r; break }
      if (r === maxRows - 1) row = r
    }
    rowEndX[row] = boxX + markerWidth.value

    const boxY = row * rowH
    const tickTop = boxY + markerHeight.value
    const tickBottom = viewportHeight.value - AXIS_HEIGHT
    const tickHeight = Math.max(0, tickBottom - tickTop)

    const style = props.markerStyles[String(ev.id)] || {}
    return {
      id: String(ev.id),
      label: ev.nome,
      boxX, boxY, tickX, tickTop, tickHeight,
      color: style.color || '#3a8fbd',
      textColor: style.whiteText ? 'white' : '#1a1a1a',
      hasImage: !!style.hasImage,
    }
  })
})

const axisTop = computed(() => viewportHeight.value - AXIS_HEIGHT)

const yearTicks = computed(() => {
  if (!props.events.length) return []
  const span = yearMax.value - yearMin.value
  if (span <= 0) return []

  const targetMajorPx = 120
  const yearsPerMajor = Math.max(1, Math.round(targetMajorPx / pxPerYear.value))
  const niceSteps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000]
  const major = niceSteps.find(s => s >= yearsPerMajor) || 1000
  const minor = Math.max(1, Math.floor(major / 5))

  const startYear = Math.floor((yearMin.value - PAD_YEARS) / minor) * minor
  const endYear   = yearMax.value + PAD_YEARS

  const ticks = []
  for (let y = startYear; y <= endYear; y += minor) {
    ticks.push({ year: y, x: yearToX(y), major: y % major === 0 })
  }
  return ticks
})

const scrollX = ref(0)

function clampScroll(x) {
  const max = Math.max(0, trackWidth.value - viewportWidth.value)
  return Math.max(0, Math.min(max, x))
}

const activeId = ref(null)

function onMarkerClick(id) {
  activeId.value = id
  emit('marker-click', id)
}

const DRAG_THRESHOLD = 8
let pointerStartX = 0
let scrollStartX  = 0
let pointerActive = false
let pointerIsDrag = false
let pointerId     = null

function onPointerDown(e) {
  pointerStartX = e.clientX
  scrollStartX  = scrollX.value
  pointerActive = true
  pointerIsDrag = false
  pointerId = e.pointerId
}

function onPointerMove(e) {
  if (!pointerActive) return
  const dx = e.clientX - pointerStartX

  if (!pointerIsDrag) {
    if (Math.abs(dx) < DRAG_THRESHOLD) return
    pointerIsDrag = true
    try { viewportRef.value?.setPointerCapture(pointerId) } catch (_) {}
  }

  scrollX.value = clampScroll(scrollStartX - dx)
}

function onPointerUp() {
  if (!pointerActive) return
  pointerActive = false
  if (pointerIsDrag && pointerId != null) {
    try { viewportRef.value?.releasePointerCapture(pointerId) } catch (_) {}
  }
  pointerId = null
}

let _resizeObs = null

function measureViewport() {
  if (!viewportRef.value) return
  viewportWidth.value  = viewportRef.value.clientWidth
  viewportHeight.value = viewportRef.value.clientHeight
  updateMarkerSize()
}

function getOrderedMarkers() {
  return [...props.events].sort((a, b) => a.anno - b.anno)
}

function navigateMarker(delta) {
  const list = getOrderedMarkers()
  if (!list.length) return

  let idx = list.findIndex(e => String(e.id) === activeId.value)
  if (idx < 0) idx = 0

  const next = Math.max(0, Math.min(list.length - 1, idx + delta))
  if (next === idx && activeId.value !== null) return

  const target = list[next]
  activeId.value = String(target.id)
  centerOnYear(target.anno)
}

function centerOnYear(year) {
  const x = yearToX(year)
  scrollX.value = clampScroll(x - viewportWidth.value / 2)
}

function setZoomIndex(idx) {
  const clamped = Math.max(0, Math.min(ZOOM_PX_PER_YEAR.length - 1, idx))
  if (clamped === currentZoom.value) return

  const centerYear = (scrollX.value + viewportWidth.value / 2) / pxPerYear.value + yearMin.value - PAD_YEARS
  currentZoom.value = clamped
  nextTick(() => { centerOnYear(centerYear) })
}

function scrollToStart() {
  scrollX.value = 0
}

onMounted(async () => {
  await nextTick()
  measureViewport()

  if (typeof ResizeObserver !== 'undefined' && viewportRef.value) {
    _resizeObs = new ResizeObserver(() => { measureViewport() })
    _resizeObs.observe(viewportRef.value)
  } else {
    window.addEventListener('resize', measureViewport)
  }

  await nextTick()
  scrollToStart()
  emit('ready', { custom: true })
})

onBeforeUnmount(() => {
  _resizeObs?.disconnect()
  _resizeObs = null
  window.removeEventListener('resize', measureViewport)
})

watch(() => props.events, () => {
  nextTick(() => { measureViewport(); scrollToStart() })
})

defineExpose({
  zoomIn()  { setZoomIndex(currentZoom.value + 1) },
  zoomOut() { setZoomIndex(currentZoom.value - 1) },
  prevMarker() { navigateMarker(-1) },
  nextMarker() { navigateMarker(+1) },
  scrollToStart,
  getZoomLevel() { return currentZoom.value },
  getZoomMin()   { return 0 },
  getZoomMax()   { return ZOOM_PX_PER_YEAR.length - 1 },
  getInstance()  { return null },
})
</script>

<style scoped>
.timeline-container {
  position: absolute;
  inset: 0;
  z-index: var(--z-content);
  background: transparent;
  overflow: hidden;
}

.tl-viewport {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.18);
  touch-action: none;
  user-select: none;
}

.tl-track {
  position: relative;
  height: 100%;
  will-change: transform;
}

.tl-marker {
  position: absolute;
  border-style: solid;
  border-radius: 8px;
  padding: 8px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: clamp(12px, 1.1vw, 22px);
  line-height: 1.25;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform 80ms ease, box-shadow 0.2s ease;
}
.tl-marker:active { transform: scale(0.96); }
.tl-marker.active {
  box-shadow: 0 0 0 3px var(--rosso, #912B3D), 0 4px 12px rgba(0, 0, 0, 0.25);
  z-index: 2;
}

.tl-marker-headline {
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.tl-tick {
  position: absolute;
  width: 1px;
  background: rgba(0, 0, 0, 0.35);
  pointer-events: none;
  transition: background 0.2s ease, width 0.2s ease;
}

.tl-tick.active {
  width: 3px;
  background: var(--rosso, #912B3D);
  box-shadow: 0 0 8px rgba(145, 43, 61, 0.6);
}

.tl-axis {
  position: absolute;
  left: 0;
  right: 0;
  height: 40px;
  border-top: 1px solid rgba(0, 0, 0, 0.4);
  pointer-events: none;
}

.tl-year-tick {
  position: absolute;
  top: 0;
  width: 1px;
  height: 6px;
  background: rgba(0, 0, 0, 0.4);
}
.tl-year-tick.major {
  height: 12px;
  background: rgba(0, 0, 0, 0.7);
}

.tl-year-label {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  font-size: clamp(10px, 0.85vw, 16px);
  font-family: var(--font-body);
  color: rgba(0, 0, 0, 0.7);
  white-space: nowrap;
  font-weight: 500;
}
</style>