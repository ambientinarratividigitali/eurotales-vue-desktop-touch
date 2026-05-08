<script setup>
/* FocusModal — bubble per i 5 bottoni Focus + Crediti.
   Lo stile (rosso/beige/verde) è determinato dalla prop `variant`. */
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import FocusAltText from './FocusAltText.vue'

const props = defineProps({
  /** Numero del focus (1..5) o 'credits' */
  which: { type: [Number, String], required: true },
})
const emit = defineEmits(['close'])

const { t, locale } = useI18n()

/* Quale stile usare in base al focus.
   Originale:
   - bubble_red    (focus 1)  => beige
   - bubble_red1   (focus 2)  => verde con mappa
   - bubble_red2-4 (focus 3-5)=> rosso
   - crediti_bubble           => beige
*/
const variant = computed(() => {
  if (props.which === 'credits') return 'beige'
  if (props.which === 1)         return 'beige'
  if (props.which === 2)         return 'green'
  return 'red'  // 3, 4, 5
})

const isMap   = computed(() => props.which === 2)
const isCredits = computed(() => props.which === 'credits')

const title = computed(() => {
  if (isCredits.value) return t('credits.title')
  return t(`focus.${props.which}.title`)
})
const subtitle = computed(() => {
  if (isCredits.value) return ''
  return t(`focus.${props.which}.subtitle`)
})
const body = computed(() => {
  if (isCredits.value) return t('credits.body')
  return t(`focus.${props.which}.body`)
})

/* Inverso (per le tracce mostriamo entrambe le lingue: IT + EN o EN + IT).
   Lo applichiamo solo ai Focus 1, 3, 4, 5 (testo doppio come nell'originale). */
const altLocale = computed(() => locale.value === 'it' ? 'en' : 'it')
const showDualLanguage = computed(() => !isMap.value && !isCredits.value)
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div :class="['bubble', `bubble-${variant}`, 'bubble-scroll']">
      <button class="close-btn" :aria-label="'close'" @click="emit('close')">
        <img src="/assets/close_btn_white.png" alt="" />
      </button>

      <div class="wrapper">
        <div class="content">
          <div class="space-small"></div>

          <div class="title-block">
            <p class="title" v-html="title"></p>
            <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
          </div>

          <div class="space-small"></div>

          <div class="text-body" v-html="body"></div>

          <!-- Per i Focus testuali: dual-language sotto separato da hr -->
          <FocusAltText
            v-if="showDualLanguage"
            :which="which"
            :alt-locale="altLocale"
          />

          <!-- Focus 2 (Dove sono le tracce): mostra la mappa -->
          <div v-if="isMap" class="map-area">
            <img src="/assets/MappaTracceFullscreen.png" alt="Mappa Europa" />
          </div>
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
  padding: var(--sp-5);
}

/* Variante "bubble rossa" (focus 3,4,5) */
.bubble-red {
  border: clamp(20px, 2vw, 40px) solid var(--bubble-red-bg);
  background-color: var(--bubble-red-bg);
  color: var(--bubble-red-text);
}

/* Variante "bubble beige" (focus 1, crediti) */
.bubble-beige {
  border: clamp(20px, 2vw, 40px) solid var(--bubble-beige-bg);
  background-color: var(--bubble-beige-bg);
  color: var(--bubble-beige-text);
}

/* Variante "bubble verde" (focus 2 con la mappa) */
.bubble-green {
  width: clamp(900px, 90vw, 1800px);
  height: clamp(720px, 90vh, 1300px);
  border: clamp(20px, 2vw, 40px) solid var(--bubble-green-bg);
  background-color: var(--bubble-green-bg);
  color: var(--bubble-green-text);
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

/* Per la beige uso il close scuro (più leggibile) */
.bubble-beige .close-btn img { content: url('/assets/close_btn_grey.png'); }

.wrapper { min-height: 200px; }

.content {
  text-align: center;
  line-height: 1.4;
}

.title-block {
  text-align: center;
  margin-top: var(--sp-3);
}
.title {
  font-family: 'KumbhSans', 'Montserrat', sans-serif;
  font-size: var(--fs-title);
  font-weight: 800;
  text-transform: uppercase;
  margin: 0;
  line-height: 1.15;
}
.subtitle {
  font-size: var(--fs-lg);
  font-style: italic;
  color: var(--accent-teal);
  text-align: center;
  font-weight: 500;
  text-transform: uppercase;
  margin-top: var(--sp-2);
}

.text-body {
  text-align: left;
  font-size: var(--fs-md);
  line-height: 1.7;
  margin: var(--sp-5) 0;
  max-width: 95%;
  margin-left: auto;
  margin-right: auto;
}

.text-body :deep(em),
.text-body :deep(i),
.text-body :deep(i21) {
  color: var(--accent-italic);
  font-style: italic;
  font-weight: 600;
}

.text-body :deep(b),
.text-body :deep(strong) { font-weight: 700; }
.text-body :deep(p) { margin: var(--sp-3) 0; }

/* Mappa */
.map-area {
  margin: var(--sp-5) auto 0;
  text-align: center;
}
.map-area img {
  max-width: 100%;
  max-height: 65vh;
  object-fit: contain;
  margin: 0 auto;
}

.space-small { padding: var(--sp-2); }
</style>
