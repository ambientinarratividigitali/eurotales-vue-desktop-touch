<script setup>
/* LinguaView — tracce filtrate per nome lingua (route :nome).
   Catena: nome → id lingua → fetchTracceByLingua. */
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDataStore, pick } from '../stores/dataStore.js'
import TracciaCard from '../components/TracciaCard.vue'

const props = defineProps({ nome: { type: String, required: true } })
const { t, locale } = useI18n()
const store = useDataStore()

const linguaParam = computed(() => decodeURIComponent(props.nome).toLowerCase())

const tracceList = ref([])
const nazioniMap = ref({})
const loading    = ref(false)

const linguaObj = computed(() => {
  if (!store.lingue) return null
  return store.lingue.find(l =>
    (l.lingua || '').toLowerCase() === linguaParam.value ||
    (l.language || '').toLowerCase() === linguaParam.value
  ) || null
})

const linguaLabel = computed(() => {
  if (!linguaObj.value) return t('lingue.tagNotFound')
  const v = pick(linguaObj.value, 'lingua', 'language', locale.value) || ''
  return v.charAt(0).toUpperCase() + v.slice(1)
})

async function load() {
  loading.value = true
  try {
    await store.ensureLingue()
    if (!linguaObj.value) {
      tracceList.value = []
      return
    }
    const { tracce, nazioni } = await store.fetchTracceByLingua(linguaObj.value.id)
    tracceList.value = tracce
    nazioniMap.value = nazioni
  } catch (e) {
    console.error('[LinguaView] load failed', e)
  } finally {
    loading.value = false
  }
}

function getNazione(item) {
  const nid = item.luogo?.nazione
  return nazioniMap.value[nid] || null
}

onMounted(load)
watch(linguaParam, load)
</script>

<template>
  <div class="lingua-view">
    <h1 class="lingua-title">{{ linguaLabel }}</h1>

    <div class="back-link">
      <router-link :to="{ name: 'gallery' }" class="back-btn">
        {{ t('app.backToTraces') }}
      </router-link>
    </div>

    <div v-if="loading" class="loader"></div>

    <div v-else-if="tracceList.length === 0" class="empty-msg">
      {{ t('app.notFound') }}
    </div>

    <div v-else class="items-grid">
      <TracciaCard v-for="item in tracceList" :key="item.id"
                   :item="item"
                   :luogo="item.luogo"
                   :nazione="getNazione(item)"
                   :showCentury="false" />
    </div>
  </div>
</template>

<style scoped>
.lingua-view { padding: var(--sp-5); }
.lingua-title {
  text-align: center;
  font-size: var(--fs-xl);
  font-weight: 700;
  margin-top: var(--sp-4);
  color: var(--text);
}
.back-link {
  display: flex;
  justify-content: center;
  margin: var(--sp-4) 0;
}
.back-btn {
  padding: var(--sp-2) var(--sp-4);
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--accent);
  text-decoration: none;
  min-height: var(--tap-min);
  display: inline-flex;
  align-items: center;
}
.back-btn:hover { color: var(--accent-strong); }
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(clamp(240px, 20vw, 360px), 1fr));
  gap: var(--sp-5);
  padding: var(--sp-4);
}
.empty-msg {
  text-align: center;
  font-size: var(--fs-md);
  color: var(--text-muted);
  margin-top: var(--sp-7);
}
</style>
