<script setup>
/* TracciaCard — card riusabile per gallery/lingue/tag */
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { pick } from '../stores/dataStore.js'

const props = defineProps({
  item: { type: Object, required: true },
  luogo: { type: Object, default: null },
  nazione: { type: Object, default: null },
  showCentury: { type: Boolean, default: true },
})

const { locale } = useI18n()
const router = useRouter()

const ASSETS = 'https://www.directuseurotales.ambientinarratividigitali.it/assets'

function goToScheda() {
  router.push({ name: 'scheda', params: { id: props.item.id } })
}

function imgUrl(item) {
  // img_cover può essere stringa-id oppure oggetto con .id
  const id = item.img_cover?.id || item.img_cover
  return id ? `${ASSETS}/${id}` : ''
}

function title(item)    { return pick(item, 'titolo', 'titles', locale.value) }
function citta(luogo)   { return luogo?.citta || '' }
function nazione(naz)   { return naz?.nazione || '' }
</script>

<template>
  <a class="card" @click.prevent="goToScheda" :href="`#/scheda/${item.id}`">
    <img class="card-img" :src="imgUrl(item)" :alt="title(item)" loading="lazy" />
    <div class="card-body">
      <span class="card-title">{{ title(item) }}</span>
      <span class="card-meta">
        {{ citta(luogo) }}<template v-if="luogo?.citta && nazione(props.nazione)"> ({{ nazione(props.nazione) }})</template>
        <template v-else-if="nazione(props.nazione)">{{ nazione(props.nazione) }}</template>
      </span>
      <span v-if="showCentury && item.cronologia?.DTZG" class="card-century">
        {{ item.cronologia.DTZG }}
      </span>
    </div>
  </a>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius);
  padding: var(--sp-3);
  text-align: center;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  text-decoration: none;
  color: var(--text);
}
.card:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow);
}
.card-img {
  width: 100%;
  height: clamp(160px, 14vw, 260px);
  object-fit: cover;
  border-radius: var(--radius-sm);
  background: var(--bg-card-hover);
}
.card-body {
  padding-top: var(--sp-3);
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  font-size: var(--fs-sm);
  color: var(--text-soft);
}
.card-title {
  font-style: italic;
  font-weight: 600;
  font-size: var(--fs-base);
  color: var(--text);
}
.card-meta { color: var(--text-muted); }
.card-century { color: var(--text-muted); font-size: var(--fs-xs); }
</style>
