<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'


const router = useRouter()

const IDLE_MS = 120_000  
let idleTimer = null

function resetIdle() {
  clearTimeout(idleTimer)
  idleTimer = setTimeout(() => {
    // Vai alla home solo se non ci sei già
    if (router.currentRoute.value.path !== '/') {
      router.push('/')
    }
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