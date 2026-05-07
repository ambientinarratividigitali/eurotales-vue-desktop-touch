<template>
  <div ref="containerRef" class="timeline-container"></div>
</template>

<script setup>
/**
 * Wrapper Vue attorno alla libreria TimelineJS3 di KnightLab.
 * - Riceve gli eventi già localizzati via prop `events`.
 * - Emette `marker-click` quando l'utente seleziona un marker.
 * - Re-renderizza l'intera timeline quando cambiano gli eventi o la lingua,
 *   usando un :key esterno (gestito dalla view).
 */
import { onMounted, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  events: { type: Array, required: true },
  /** Mappa idEvento → colore-marker, per re-stilare i marker dopo il render */
  markerStyles: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['marker-click', 'ready'])

const containerRef = ref(null)
let tl = null

// Sequenza di zoom dell'asse temporale.
// Indici bassi = vista compressa (più anni visibili).
// Indici alti = vista dilatata (meno anni visibili → zoom-in temporale).
// Adatta alla nostra timeline: 500 d.C. → 2000 d.C.
const ZOOM_SEQUENCE = [1, 2, 3, 5, 8, 13, 21, 34, 55]
const ZOOM_INITIAL  = 0  // indice in ZOOM_SEQUENCE: 0 = massimo zoom-out

const tlOptions = {
  duration: 1,
  default_bg_color: '#47474724',
  font: 'https://eurotales.eu/wp-content/themes/emaurri/timeline/TimeLine/MyCustomFont.css',
  timenav_height_percentage: 90,
  dragging: false,
  zoom_sequence: ZOOM_SEQUENCE,
  initial_zoom: ZOOM_INITIAL,
}

// Indice di zoom corrente; modificato da zoomIn/zoomOut
let currentZoom = ZOOM_INITIAL

function buildData() {
  return {
    events: props.events.map(e => ({
      unique_id: String(e.id),
      text: { headline: e.nome, text: e.nome },
      start_date: { year: e.anno },
    })),
  }
}

function applyMarkerStyles() {
  if (!tl?.config?.events) return
  tl.config.events.forEach(ev => {
    const style = props.markerStyles[ev.unique_id]
    if (!style) return
    const el = document.getElementById(`${ev.unique_id}-marker`)
    if (!el) return

    // Colore sfondo del marker
    const container = el.querySelector('.tl-timemarker-content-container')
    if (container) container.style.backgroundColor = style.color

    // Bordo se ha immagine
    if (style.hasImage && container) {
      container.style.borderColor = '#bababa'
      container.style.borderWidth = '4px'
    }

    // Colore testo — seleziona tutti gli elementi di testo dentro il marker
    const textColor = style.whiteText ? 'white' : '#1a1a1a'
    console.log(`Applying text color ${textColor} to marker ${ev.unique_id}`)
    el.querySelectorAll('.tl-headline, .tl-timemarker-text, p, span').forEach(textEl => {
      textEl.style.setProperty('color', textColor, 'important')
    })
  })
}

function setup() {
  if (!containerRef.value || !window.TL) return
  // Pulisci eventuale istanza precedente
  containerRef.value.innerHTML = ''
  tl = new window.TL.Timeline(containerRef.value, buildData(), tlOptions)

  tl._onTimeNavLoaded = () => {
    setTimeout(() => {
      applyMarkerStyles()
      tl.setZoom(ZOOM_INITIAL)
      currentZoom = ZOOM_INITIAL
      emit('ready', tl)
    }, 500)
  }

  tl._onSlideChange = (e) => {
    emit('marker-click', e.unique_id)
  }
}

onMounted(setup)
onBeforeUnmount(() => { tl = null })

// Cambia il livello di zoom dell'asse temporale mantenendo il punto di vista.
//
// Il problema: tl.setZoom() internamente chiama goToId(current_id), che
// avvia un'animazione per centrare lo slider sul marker attivo (di solito
// il primo evento). Vogliamo invece preservare la posizione di scroll.
//
// Strategia:
//   1. Prima di setZoom: leggo la posizione di scroll attuale come frazione
//      0..1 del range scrollabile.
//   2. Chiamo setZoom() che lascia TimelineJS ridisegnare l'asse e i marker.
//   3. Dopo che il resize è completato, FERMO l'animazione interna di
//      TimelineJS (`tl._timenav.animator.stop()`) e riposiziono lo slider
//      sulla stessa frazione, calcolata sulla NUOVA larghezza totale.
//   4. Aggiorno i constraint dello swipable per i nuovi limiti.
function setZoomIndex(idx) {
  if (!tl) return
  const clamped = Math.max(0, Math.min(ZOOM_SEQUENCE.length - 1, idx))
  if (clamped === currentZoom) return

  // ── 1. Leggi la frazione di scroll PRIMA dello zoom ──────────────
  const slider1 = tl?._timenav?._el?.slider
  const mask1   = tl?._timenav?._el?.marker_container_mask
  let scrollFraction = 0  // default: scroll all'inizio

  if (slider1 && mask1) {
    const currentLeft = parseFloat(slider1.style.left || '0')
    const totalW1  = slider1.offsetWidth || 1
    const visibleW = mask1.offsetWidth   || 0
    // Lo slider in TimelineJS ha left che varia tra (visibleW/2) [inizio]
    // e -(totalW - visibleW/2) [fine]. Lo scroll va da 0 (inizio) a maxScroll.
    // Convertiamo in scroll-from-left positivo:
    //   leftAtStart = visibleW/2  →  scroll = 0
    //   leftAtEnd   = -(totalW - visibleW/2)  →  scroll = totalW - visibleW
    const scrollFromLeft = (visibleW / 2) - currentLeft  // sempre >= 0
    const maxScroll = totalW1 - visibleW
    if (maxScroll > 0) {
      scrollFraction = scrollFromLeft / maxScroll
      scrollFraction = Math.max(0, Math.min(1, scrollFraction))
    }
  }

  currentZoom = clamped
  tl.setZoom(clamped)

  // ── 2/3. Dopo il resize, ferma l'animazione interna e riposiziona ──
  // Uso un secondo timeout con un margine extra perché TimelineJS prima
  // ridisegna (sincrono) e poi avvia animator (asincrono ~1000ms).
  // Lo fermo subito così non sovrascrive il mio reposition.
  setTimeout(() => {
    if (!tl) return

    // Ferma l'animazione che TimelineJS ha avviato per centrare il marker
    if (tl._timenav?.animator?.stop) {
      tl._timenav.animator.stop()
    }
    if (tl._timenav?._swipable?.stopMomentum) {
      tl._timenav._swipable.stopMomentum()
    }

    const slider2 = tl?._timenav?._el?.slider
    const mask2   = tl?._timenav?._el?.marker_container_mask
    if (slider2 && mask2) {
      const totalW2  = slider2.offsetWidth || 1
      const visibleW = mask2.offsetWidth   || 0
      const maxScroll = totalW2 - visibleW
      if (maxScroll > 0) {
        // Rovescio la formula: targetLeft = visibleW/2 - scrollFromLeft
        const scrollFromLeft = scrollFraction * maxScroll
        const targetLeft = (visibleW / 2) - scrollFromLeft
        // Disattivo CSS transition mentre setto, per evitare animazioni
        slider2.className = 'tl-timenav-slider'
        slider2.style.left = `${targetLeft}px`

        // Aggiorna i constraint dello swipable interno (per drag manuale)
        if (tl._timenav?._swipable?.updateConstraint) {
          tl._timenav._swipable.updateConstraint({
            top: false, bottom: false,
            left: visibleW / 2,
            right: -(totalW2 - visibleW / 2),
          })
        }
      }
    }

    applyMarkerStyles()
  }, 50)  // 50ms basta: setZoom completa il redraw sincronamente, poi avvia
          // animator. Lo fermiamo prima che parta sul serio.
}


// Naviga al marker precedente o successivo nella timeline (delta = -1 o +1).
// TimelineJS espone goToId() e config.events ordinati per data.
// Troviamo l'evento corrente tramite _timenav._current_time, poi scorriamo
// all'evento adiacente.
function navigateMarker(delta) {
  if (!tl) return

  // Lista degli eventi ordinata per anno (come li ha costruiti buildData)
  const events = tl.config?.events
  if (!events || events.length === 0) return

  // Trova l'indice corrente guardando quale marker è "active" nel DOM,
  // oppure usa _current_time come fallback
  let currentIdx = -1

  // Metodo 1: cerca l'elemento attivo nel DOM
  const activeEl = containerRef.value?.querySelector('.tl-timemarker.tl-timemarker-active')
  if (activeEl) {
    const activeId = activeEl.id?.replace('-marker', '')
    currentIdx = events.findIndex(e => String(e.unique_id) === String(activeId))
  }

  // Metodo 2: fallback → primo evento
  if (currentIdx < 0) currentIdx = 0

  const nextIdx = Math.max(0, Math.min(events.length - 1, currentIdx + delta))
  if (nextIdx === currentIdx) return

  const targetId = events[nextIdx].unique_id
  tl.goToId(targetId)


}

defineExpose({
  zoomIn()  { setZoomIndex(currentZoom + 1) },
  zoomOut() { setZoomIndex(currentZoom - 1) },
  prevMarker() { navigateMarker(-1) },
  nextMarker() { navigateMarker(+1) },
  getZoomLevel() { return currentZoom },
  getZoomMin()   { return 0 },
  getZoomMax()   { return ZOOM_SEQUENCE.length - 1 },
  getInstance()  { return tl },
})
</script>

<style scoped>
.timeline-container {
  position: absolute;
  inset: 0;
  z-index: var(--z-content);
  background: transparent;
}

/* La timeline interna deve usare tutta l'altezza disponibile */
.timeline-container :deep(.tl-timeline) {
  height: 100% !important;
}
</style>
