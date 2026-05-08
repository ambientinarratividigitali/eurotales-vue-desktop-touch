<script setup>
/* RainCanvas — gocce di pioggia che cadono, click apre la modale traccia.
   Riproduce la logica dell'originale (D3) ma in Vue + JS puro. */
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useDataStore } from '../stores/dataStore.js'

const emit = defineEmits(['select-traccia'])

const store = useDataStore()
const containerEl = ref(null)

/* Tre dimensioni e tre velocità (in ms) — come l'originale. */
const SIZES = ['far', 'medium', 'near']
const FALL_DURATION = {
  far:    [30000, 35000],
  medium: [20000, 25000],
  near:   [15000, 20000],
}

/* Stato runtime (non reattivo per perf: muto il DOM direttamente). */
let dropElements = []
let activeTimeouts = new Set()
let resizeObserver = null
let stageWidth = 1920
let stageHeight = 1080
let running = true

function rand(min, max) { return min + Math.random() * (max - min) }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function measureStage() {
  if (!containerEl.value) return
  stageWidth  = containerEl.value.clientWidth  || 1920
  stageHeight = containerEl.value.clientHeight || 1080
}

/** Avvia / riavvia la caduta di una singola goccia. */
function dropOnce(el, item) {
  if (!running || !el || !el.isConnected) return

  // Reset visivo: posizione random in alto, dimensione random
  const size = pick(SIZES)
  el.className = `drop ${size}`

  // ── DOVE CADONO LE GOCCE ──
  // xPct = posizione orizzontale in % della larghezza dello schermo
  //   rand(0, 92)   = caduta su tutta la larghezza (default)
  //   rand(20, 80)  = solo fascia centrale
  //   rand(40, 95)  = solo metà destra
  //   rand(0, 50)   = solo metà sinistra
  // Modifica i due numeri qui sotto per cambiare la zona di caduta:
  const xPct = rand(40, 92)
  const startY = -10 - rand(0, 40)    // sopra lo stage (negativo)

  el.style.left = `${xPct}%`
  el.style.top  = `${startY}%`
  el.style.transform = 'translate(0, 0)'
  el.style.transition = 'none'
  el.style.display = 'block'
  el.style.visibility = 'visible'

  // Forzo un reflow prima di applicare la transition (così il browser
  // "vede" la nuova posizione iniziale, e la transizione parte da lì)
  void el.offsetHeight

  const [minDur, maxDur] = FALL_DURATION[size]
  const dur = rand(minDur, maxDur)
  el.style.transition = `top ${dur}ms linear`
  el.style.top = '110%'

  // Quando finisce la caduta, rilancio dopo una breve pausa
  const t = setTimeout(() => {
    activeTimeouts.delete(t)
    if (!running) return
    if (el.dataset.status === 'active') return  // se è aperta come modale, non rilanciare
    dropOnce(el, item)
  }, dur + 800)
  activeTimeouts.add(t)
}

/** Crea le gocce e fa partire la pioggia. */
function buildDrops() {
  if (!containerEl.value || !store.tracce.length) return
  // Cleanup precedente
  dropElements.forEach(el => el.remove())
  dropElements = []
  activeTimeouts.forEach(clearTimeout); activeTimeouts.clear()

  store.tracce.forEach((item, i) => {
    const img = document.createElement('img')
    img.src = item.file || `Immagini/Proverbi/${item.id}.png`
    img.alt = item.title || ''
    img.draggable = false
    img.dataset.id = item.id
    img.dataset.status = 'falling'
    img.className = `drop ${pick(SIZES)}`

    /* Posiziono SUBITO la goccia fuori schermo (sopra) e nascosta:
       senza questo, prima che dropOnce() la avvii, l'immagine apparirebbe
       a top:0/left:0 (in alto a sinistra) per il delay di stagger. */
    img.style.top = '-30%'
    img.style.left = `${rand(0, 92)}%`
    img.style.visibility = 'hidden'

    img.addEventListener('click', () => {
      img.dataset.status = 'active'
      emit('select-traccia', item)
    })

    containerEl.value.appendChild(img)
    dropElements.push(img)

    // Stagger di partenza per non far cadere tutte insieme
    const startDelay = rand(0, 40000) + (i * 800)
    const t = setTimeout(() => {
      activeTimeouts.delete(t)
      dropOnce(img, item)
    }, startDelay)
    activeTimeouts.add(t)
  })
}

/* Quando la modale si chiude, la goccia ritorna a cadere */
function resumeDrop(id) {
  const el = dropElements.find(e => parseInt(e.dataset.id) === id)
  if (!el) return
  el.dataset.status = 'falling'
  const item = store.tracce.find(t => t.id === id)
  dropOnce(el, item)
}
defineExpose({ resumeDrop })

onMounted(async () => {
  await store.load()
  measureStage()
  buildDrops()

  // Su resize, aggiorno solo le dimensioni di riferimento (le posizioni sono in %).
  resizeObserver = new ResizeObserver(measureStage)
  resizeObserver.observe(containerEl.value)
})

onBeforeUnmount(() => {
  running = false
  activeTimeouts.forEach(clearTimeout)
  activeTimeouts.clear()
  if (resizeObserver) resizeObserver.disconnect()
})

watch(() => store.tracce.length, (n) => {
  if (n > 0 && dropElements.length === 0) buildDrops()
})
</script>

<template>
  <div ref="containerEl" class="rain-canvas">
    <slot></slot>
  </div>
</template>

<style scoped>
.rain-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /* Sfondo neutro — modifica --bg-stage in main.css per cambiare colore */
  background: var(--bg-stage);
  overflow: hidden;
}

/* Le gocce — :deep perché vengono inserite via JS, non sono nel template Vue */
:deep(.drop) {
  position: absolute;
  cursor: pointer;
  pointer-events: auto;
  user-select: none;
  -webkit-user-drag: none;
  z-index: 1;
  transition: transform 0.2s;
}
:deep(.drop:hover) {
  transform: scale(1.08);
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
}

/* Tre dimensioni con clamp per scalare anche su 4K */
/* Dimensioni delle gocce — modifica QUI per ingrandire/rimpicciolire.
   Tre profondità: far (lontane, piccole, lente) → near (vicine, grandi, veloci). */
:deep(.drop.far) {
  width: clamp(140px, 11vw, 240px);
  opacity: 0.75;
  z-index: 1;
}
:deep(.drop.medium) {
  width: clamp(190px, 15vw, 320px);
  opacity: 0.9;
  z-index: 2;
}
:deep(.drop.near) {
  width: clamp(240px, 19vw, 420px);
  opacity: 1;
  z-index: 3;
}
</style>
