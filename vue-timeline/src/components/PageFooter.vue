<template>
  <footer class="page-footer">
    <!-- Legenda lingue selezionate (sinistra) -->
    <aside class="legend" v-if="languages.length">
      <span class="legend-label-prefix">{{ t('fields.language') }}:</span>
      <div
        v-for="lang in languages"
        :key="lang.id"
        class="legend-item"
      >
        <span class="legend-dot" :style="{ background: lang.colore_TL }"></span>
        <span class="legend-label">{{ getName(lang) }}</span>
      </div>
    </aside>

    <!-- Spazio centrale: istruzione -->
    <p class="instruction">{{ t('ui.instruction') }}</p>

    <!-- Zoom (destra) -->
    <div class="zoom-controls">
      <button
        class="zoom-btn"
        @click="$emit('zoom-out')"
        :aria-label="t('ui.zoomOut')"
      >−</button>
      <button
        class="zoom-btn"
        @click="$emit('zoom-in')"
        :aria-label="t('ui.zoomIn')"
      >+</button>
    </div>
  </footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useDataStore } from '../stores/dataStore.js'

const { t, locale } = useI18n()
const store = useDataStore()

defineProps({
  languages: { type: Array, default: () => [] },
})
defineEmits(['zoom-in', 'zoom-out'])

function getName(lang) {
  return store.linguaName(lang, locale.value)
}
</script>

<style scoped>
.page-footer {
  position: relative;
  z-index: var(--z-header);
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-4);
  background: rgba(255, 255, 255, 0.92);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  height: clamp(72px, 7vh, 110px);
  flex-shrink: 0;
}

/* ── Legenda ─────────────────────────────────────────────── */
.legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-1) var(--sp-3);
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.legend-label-prefix {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--grigio-mid);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fs-sm);
  color: var(--grigio-dark);
  font-weight: 500;
  white-space: nowrap;
}

.legend-dot {
  width: clamp(14px, 1.2vw, 22px);
  height: clamp(14px, 1.2vw, 22px);
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── Istruzione (centrata) ──────────────────────────────── */
.instruction {
  font-size: var(--fs-sm);
  color: var(--grigio-mid);
  font-style: italic;
  text-align: center;
  white-space: nowrap;
}

/* ── Zoom controls ──────────────────────────────────────── */
.zoom-controls {
  display: flex;
  gap: var(--sp-1);
  flex-shrink: 0;
}

.zoom-btn {
  width: clamp(48px, 4vw, 72px);
  height: clamp(48px, 4vw, 72px);
  border-radius: 50%;
  background: var(--rosso);
  color: white;
  font-size: clamp(24px, 1.8vw, 36px);
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: all var(--tr-base);
  box-shadow: 0 2px 8px rgba(145, 43, 61, 0.3);
  touch-action: manipulation;
}
.zoom-btn:hover  { background: #6f1f2e; }
.zoom-btn:active { transform: scale(0.93); }

/* ── Responsive ─────────────────────────────────────────── */
@media (max-width: 1024px) {
  .instruction { display: none; }
}
@media (max-width: 768px) {
  .legend-label-prefix { display: none; }
  .legend-item .legend-label { display: none; }
  .legend { flex: 0 1 auto; }
}

@media (min-width: 2560px) {
  .zoom-btn { width: 80px; height: 80px; font-size: 40px; }
}

@media (hover: none) {
  .zoom-btn:hover { background: var(--rosso); }
}
</style>
