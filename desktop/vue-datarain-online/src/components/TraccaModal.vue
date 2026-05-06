<script setup>
/* TraccaModal — bubble rossa con la scheda dettagliata della traccia.
   I campi sono ora oggetti {it, en} per supportare il cambio lingua reattivo. */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { pickLocale } from '../stores/dataStore.js'

const props = defineProps({
  traccia: { type: Object, required: true },
})
const emit = defineEmits(['close'])

const { locale } = useI18n()

/* Helper: prende il valore localizzato.
   Supporta sia il nuovo formato {it, en} che il vecchio formato stringa. */
function L(field) {
  if (!field) return ''
  if (typeof field === 'string') return field
  return pickLocale(field.it, field.en, locale.value)
}

const title        = computed(() => L(props.traccia.title))
const descrizione  = computed(() => L(props.traccia.descrizione))
const descrizione2 = computed(() => L(props.traccia.descrizione2))
const datibox      = computed(() => L(props.traccia.datibox))
const biblio       = computed(() => L(props.traccia.biblio))
const crediti      = computed(() => L(props.traccia.crediti))
const autore       = computed(() => L(props.traccia.autore))
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="bubble bubble-red bubble-scroll">
      <button class="close-btn" :aria-label="'close'" @click="emit('close')">
        <img src="/assets/close_btn_white.png" alt="" />
      </button>

      <div class="wrapper">
        <div class="content">
          <div class="space-large"></div>

          <div class="title-red">
            <p class="title" v-html="title"></p>
          </div>

          <div class="space"></div>

          <img v-if="traccia.image" :src="traccia.image" :alt="title" class="trace-image" />

          <div class="space"></div>

          <div class="text-red" v-if="descrizione" v-html="descrizione"></div>
          <div class="text-red small" v-if="descrizione2" v-html="descrizione2"></div>

          <hr v-if="datibox || biblio" />

          <div class="text-red small" v-if="datibox" v-html="datibox"></div>
          <div class="text-red small" v-if="biblio"  v-html="biblio"></div>
          <div class="text-red small" v-if="crediti" v-html="crediti"></div>
          <div class="text-red autore" v-if="autore" v-html="autore"></div>

          <div class="space"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-5);
}

.bubble {
  position: relative;
  border-radius: var(--radius-lg);
  width: clamp(640px, 50vw, 1100px);
  max-width: 95vw;
  height: clamp(640px, 80vh, 1200px);
  max-height: 90vh;
  overflow-y: auto;
  z-index: 9001;
  box-shadow: var(--shadow-lg);
  font-family: 'Montserrat', sans-serif;
}

.bubble-red {
  border: clamp(20px, 2vw, 40px) solid var(--bubble-red-bg);
  background-color: var(--bubble-red-bg);
  color: var(--bubble-red-text);
  padding: var(--sp-5);
}

.close-btn {
  position: sticky;
  top: 0;
  float: right;
  z-index: 10;
  width: var(--tap-large);
  height: var(--tap-large);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border-radius: 50%;
  padding: 0;
  margin: 0 0 0 auto;
  cursor: pointer;
  transition: transform 0.2s;
}
.close-btn:hover { transform: scale(1.1); }
.close-btn img { width: 70%; height: 70%; object-fit: contain; }

.wrapper { min-height: 200px; }
.content { text-align: center; line-height: 1.4; }

.title-red { text-align: center; padding-top: var(--sp-3); }
.title-red .title {
  font-family: 'KumbhSans', 'Montserrat', sans-serif;
  font-size: var(--fs-title);
  font-weight: 800;
  text-transform: uppercase;
  margin: 0;
  line-height: 1.15;
}

.trace-image {
  width: 70%;
  margin: 0 auto;
  max-height: 50vh;
  object-fit: contain;
}

.text-red {
  text-align: left;
  font-size: var(--fs-md);
  line-height: 1.6;
  margin: var(--sp-4) 0;
}
.text-red.small { font-size: var(--fs-base); }
.text-red.autore {
  font-style: italic;
  text-align: right;
  font-size: var(--fs-sm);
}

.text-red :deep(em),
.text-red :deep(i21),
.text-red :deep(i) {
  color: var(--accent-italic);
  font-style: italic;
  font-weight: 600;
}
.text-red :deep(b),
.text-red :deep(strong) { color: white; }
.text-red :deep(.small_text) { font-size: var(--fs-base); }
.text-red :deep(.Autore_text) {
  font-style: italic;
  text-align: right;
  font-size: var(--fs-sm);
}
.text-red :deep(p) { margin: var(--sp-3) 0; }

hr {
  border: none;
  border-top: 1px solid rgba(255,255,255,0.3);
  margin: var(--sp-4) 0;
}

.space { padding: var(--sp-3); }
.space-large { padding: var(--sp-5); }
</style>
