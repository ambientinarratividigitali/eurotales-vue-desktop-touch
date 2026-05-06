<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import PageHeader   from './components/PageHeader.vue'
import RainCanvas   from './components/RainCanvas.vue'
import FocusButtons  from './components/FocusButtons.vue'
import CreditsButton from './components/CreditsButton.vue'
import TraccaModal   from './components/TraccaModal.vue'
import FocusModal    from './components/FocusModal.vue'

/* Stato modali */
const selectedTraccia = ref(null)
const selectedFocus   = ref(null)   // 1..5 oppure 'credits'

const rainCanvasRef = ref(null)

function onSelectTraccia(item) {
  selectedFocus.value = null
  selectedTraccia.value = item
}
function onSelectFocus(which) {
  selectedTraccia.value = null
  selectedFocus.value = which
}
function closeAll() {
  if (selectedTraccia.value && rainCanvasRef.value) {
    rainCanvasRef.value.resumeDrop(selectedTraccia.value.id)
  }
  selectedTraccia.value = null
  selectedFocus.value = null
}

/* Auto-reload dopo 3 minuti di inattività (come l'originale: idleInterval) */
const IDLE_MS = 3 * 60 * 1000
let idleTimer = null
function resetIdle() {
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = setTimeout(() => location.reload(), IDLE_MS)
}
function bindIdleEvents() {
  ['mousemove','keypress','touchstart','click'].forEach(ev =>
    window.addEventListener(ev, resetIdle, { passive: true })
  )
}
function unbindIdleEvents() {
  ['mousemove','keypress','touchstart','click'].forEach(ev =>
    window.removeEventListener(ev, resetIdle)
  )
}

/* ESC chiude le modali */
function onKey(e) {
  if (e.key === 'Escape') closeAll()
}

onMounted(() => {
  bindIdleEvents()
  resetIdle()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  unbindIdleEvents()
  if (idleTimer) clearTimeout(idleTimer)
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div class="stage">
    <RainCanvas ref="rainCanvasRef" @select-traccia="onSelectTraccia" />
    <FocusButtons @select="onSelectFocus" />
    <PageHeader />
    <CreditsButton @click="onSelectFocus('credits')" />

    <!-- Modale traccia singola -->
    <Transition name="fade">
      <TraccaModal v-if="selectedTraccia"
                   :traccia="selectedTraccia"
                   @close="closeAll" />
    </Transition>

    <!-- Modale focus / crediti -->
    <Transition name="fade">
      <FocusModal v-if="selectedFocus"
                  :which="selectedFocus"
                  @close="closeAll" />
    </Transition>
  </div>
</template>

<style scoped>
.stage {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* Modal fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
