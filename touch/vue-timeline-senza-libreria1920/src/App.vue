<script setup>
import TimelineView from './views/TimelineView.vue'
import { onMounted, onBeforeUnmount } from 'vue'

const IDLE_MS = 120_000
let idleTimer = null

function resetIdle() {
  clearTimeout(idleTimer)
  idleTimer = setTimeout(() => {
    window.location.reload()
  }, IDLE_MS)
}

const events = ['pointerdown', 'pointermove', 'touchstart', 'keydown', 'wheel']

onMounted(() => {
  events.forEach(e => window.addEventListener(e, resetIdle, { passive: true }))
  resetIdle()
})

onBeforeUnmount(() => {
  events.forEach(e => window.removeEventListener(e, resetIdle))
  clearTimeout(idleTimer)
})
</script>

<template>
  <TimelineView />
</template>