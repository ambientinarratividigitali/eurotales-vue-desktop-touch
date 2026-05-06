<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="event" class="info-overlay" @click.self="$emit('close')">
        <div class="info-box">
          <button class="close-btn" @click="$emit('close')" aria-label="Close">×</button>

          <header class="info-head">
            <p class="event-year">{{ headline }}</p>
            <h2 class="event-title">{{ event.nome }}</h2>
          </header>

          <div class="info-meta">
            <div class="meta-item">
              <span class="meta-dot" :style="{ background: event.colore }"></span>
              <div>
                <p class="meta-label">{{ t('fields.language') }}</p>
                <p class="meta-value">{{ event.lingua.toUpperCase() }}</p>
              </div>
            </div>

            <div class="meta-item">
              <img v-if="categoryIcon" :src="categoryIcon" class="meta-icon" alt="" />
              <div>
                <p class="meta-label">{{ t('fields.category') }}</p>
                <p class="meta-value">{{ event.categoria.toUpperCase() }}</p>
              </div>
            </div>

            <div class="meta-item" v-if="event.luogo">
              <span class="pin-icon">📍</span>
              <div>
                <p class="meta-label">{{ t('fields.place') }}</p>
                <p class="meta-value">{{ event.luogo.toUpperCase() }}</p>
              </div>
            </div>
          </div>

          <div v-if="event.descrizione && event.descrizione.length > 1"
               class="info-description thin-scroll"
               v-html="event.descrizione"></div>

          <div v-if="imageUrl" class="info-media">
            <img :src="imageUrl" class="event-image" :alt="event.nome" />
            <div v-if="event.didascalia" class="event-caption" v-html="event.didascalia"></div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  event: { type: Object, default: null },
})
defineEmits(['close'])

const { t } = useI18n()

const API = 'https://www.directuseurotales.ambientinarratividigitali.it'
const ICONS_BASE = 'https://eurotales.eu/wp-content/uploads/timeline/iconsCategorie'

const headline = computed(() => {
  if (!props.event) return ''
  return props.event.validita
    ? `${props.event.anno} ${props.event.validita}`
    : String(props.event.anno)
})

const imageUrl = computed(() =>
  props.event?.immagine ? `${API}/assets/${props.event.immagine}` : ''
)

/** Mappa la categoria al nome del file icona, basandosi sul nome italiano. */
const categoryIcon = computed(() => {
  if (!props.event?.categoria) return ''
  const cat = props.event.categoria.toLowerCase()
  if (cat.includes('attestazion')) return `${ICONS_BASE}/primeattestazioni.png`
  if (cat.includes('canonic'))     return `${ICONS_BASE}/testicanonici.png`
  if (cat.includes('istituzion'))  return `${ICONS_BASE}/istituzioni.png`
  if (cat.includes('politic'))     return `${ICONS_BASE}/politici.png`
  if (cat.includes('media'))       return `${ICONS_BASE}/media.png`
  if (cat.includes('genere'))      return `${ICONS_BASE}/genere.png`
  // Fallback: nessuna icona riconosciuta
  return ''
})
</script>

<style scoped>
.info-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: var(--b-85);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-4);
}

.info-box {
  background: #f5f1ea;
  color: var(--grigio-dark);
  border-radius: var(--radius-lg);
  width: min(1200px, 95vw);
  max-height: 88vh;
  padding: var(--sp-5);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: var(--sp-3);
  right: var(--sp-3);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--grigio-light);
  font-size: 28px;
  line-height: 1;
  color: var(--grigio-mid);
  transition: all var(--tr-base);
}
.close-btn:hover { background: var(--grigio-mid); color: white; }

.info-head { padding-right: var(--sp-5); }
.event-year {
  font-family: var(--font-body);
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--rosso);
  margin-bottom: var(--sp-1);
}
.event-title {
  font-family: var(--font-display);
  font-size: var(--fs-lg);
  font-weight: 600;
  color: var(--nero);
  line-height: 1.2;
}

.info-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--sp-3);
  padding: var(--sp-2) 0;
  border-top: 1px solid var(--grigio-light);
  border-bottom: 1px solid var(--grigio-light);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.meta-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
}

.meta-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
  flex-shrink: 0;
}

.pin-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.meta-label {
  font-size: var(--fs-xs);
  color: var(--grigio-mid);
  line-height: 1.2;
}

.meta-value {
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--nero);
  line-height: 1.2;
}

.info-description {
  font-size: var(--fs-base);
  line-height: 1.7;
  color: var(--grigio-dark);
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.info-media {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);
}

.event-image {
  max-height: 30vh;
  max-width: 100%;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.event-caption {
  font-size: var(--fs-sm);
  color: var(--grigio-mid);
  text-align: center;
  font-style: italic;
  pointer-events: none; 
  cursor: default; 
  color: inherit !important;
  text-decoration: none;
}

.event-caption :deep(a) {
  color: inherit !important;
  text-decoration: none !important;
  pointer-events: none !important;
}
</style>
