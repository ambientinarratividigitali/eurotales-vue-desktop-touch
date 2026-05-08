<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from './components/PageHeader.vue'

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


<template>
  <PageHeader />
  <main class="page-main">
    <router-view />
  </main>
</template>

<style scoped>
.page-main {
  width: 100%;
  height: calc(100vh - var(--header-h));
  overflow: hidden;
}
</style>
