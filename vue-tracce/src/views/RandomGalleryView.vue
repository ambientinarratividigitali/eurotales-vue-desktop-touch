<script setup>
/* RandomGalleryView — slider con gruppi da 3 slide, shuffle iniziale,
   auto-advance ogni 4s. Cliccando una card → scheda. */
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useDataStore, pick } from '../stores/dataStore.js'

const { locale } = useI18n()
const router = useRouter()
const store = useDataStore()

const ASSETS = 'https://www.directuseurotales.ambientinarratividigitali.it/assets'
const SLIDE_INTERVAL_MS = 4000
const PER_GROUP = 3

const currentIndex = ref(0)
let timer = null

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const shuffled = ref([])
const groups = computed(() => {
  const out = []
  for (let i = 0; i < shuffled.value.length; i += PER_GROUP) {
    out.push(shuffled.value.slice(i, i + PER_GROUP))
  }
  return out
})

function imgUrl(item) {
  const id = item.img_cover?.id || item.img_cover
  return id ? `${ASSETS}/${id}` : ''
}
function title(item) { return pick(item, 'titolo', 'titles', locale.value) }

function next() {
  if (groups.value.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % groups.value.length
}
function prev() {
  if (groups.value.length === 0) return
  currentIndex.value = (currentIndex.value - 1 + groups.value.length) % groups.value.length
}
function goScheda(id) { router.push({ name: 'scheda', params: { id } }) }

function startAuto() {
  stopAuto()
  timer = setInterval(next, SLIDE_INTERVAL_MS)
}
function stopAuto() {
  if (timer) { clearInterval(timer); timer = null }
}

onMounted(async () => {
  await store.ensureGalleryData()
  shuffled.value = shuffle((store.tracceFull || []).filter(t => t.img_cover))
  startAuto()
})
onBeforeUnmount(stopAuto)

watch(() => store.tracceFull, (v) => {
  if (v && shuffled.value.length === 0) {
    shuffled.value = shuffle(v.filter(t => t.img_cover))
  }
})
</script>

<template>
  <div class="random-view">
    <div class="slider-container" @mouseenter="stopAuto" @mouseleave="startAuto">
      <button class="nav-btn prev" @click="prev" aria-label="prev">‹</button>
      <button class="nav-btn next" @click="next" aria-label="next">›</button>

      <div class="slide-wrapper" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
        <div v-for="(group, gi) in groups" :key="gi" class="slide-group">
          <div v-for="item in group" :key="item.id" class="slide" @click="goScheda(item.id)">
            <img :src="imgUrl(item)" :alt="title(item)" />
            <div class="slide-title">{{ title(item) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.random-view { padding: 0; }

.slider-container {
  position: relative;
  width: 100%;
  height: calc(100vw / 3);
  max-height: 600px;
  overflow: hidden;
}
.slide-wrapper {
  display: flex;
  transition: transform 0.6s ease;
  height: 100%;
}
.slide-group {
  display: flex;
  flex: 0 0 100%;
  height: 100%;
}
.slide {
  flex: 0 0 33.3333%;
  height: 100%;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}
.slide img { width: 100%; height: 100%; object-fit: cover; }
.slide-title {
  position: absolute;
  bottom: var(--sp-3);
  left: var(--sp-3);
  right: var(--sp-3);
  color: white;
  background-color: rgba(0, 0, 0, 0.6);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-sm);
  font-size: var(--fs-base);
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: var(--tap-large);
  height: var(--tap-large);
  font-size: var(--fs-xl);
  background: rgba(0, 0, 0, 0.4);
  color: white;
  border: none;
  cursor: pointer;
  z-index: 2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.nav-btn:hover { background: rgba(0, 0, 0, 0.6); }
.nav-btn.prev { left: var(--sp-3); }
.nav-btn.next { right: var(--sp-3); }
</style>
