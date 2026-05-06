<script setup>
/* FocusButtons — i 5 bottoni Focus posizionati sulla scena.
   Ora sono bottoni HTML (non immagini) con SOLO il testo nella lingua attiva. */
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['select'])
const { t } = useI18n()

/* Posizioni in % per scalare da 1080p a 4K 55".
   Ricalcate dall'originale (era fisso 1920x1080). */
const buttons = [
  { which: 1, top: '26%', left: '3%' },
  { which: 2, top: '44%', left: '16%' },
  { which: 3, top: '64%', left: '28%' },
  { which: 4, top: '25%', left: '28%' },
  { which: 5, top: '66%', left: '4%' },
]
</script>

<template>
  <div class="focus-layer">
    <button v-for="b in buttons" :key="b.which"
            class="focus-btn"
            :style="{ top: b.top, left: b.left }"
            @click="emit('select', b.which)">
      <span class="focus-num">{{ b.which }}</span>
      <span class="focus-label">{{ t(`focus.${b.which}.title`) }}</span>
    </button>
  </div>
</template>

<style scoped>
.focus-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

.focus-btn {
  position: absolute;
  pointer-events: auto;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  background: rgba(40, 40, 40, 0.85);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-lg);
  padding: var(--sp-3) var(--sp-5);
  min-width: clamp(180px, 14vw, 320px);
  min-height: var(--tap-large);
  box-shadow: var(--shadow);
  transition: transform 0.25s, background 0.25s, border-color 0.25s;
}
.focus-btn:hover {
  background: rgba(60, 60, 60, 0.95);
  border-color: var(--accent-teal);
  transform: scale(1.05);
}

.focus-num {
  font-family: 'KumbhSans', 'Montserrat', sans-serif;
  font-size: var(--fs-xl);
  font-weight: 800;
  color: var(--accent-teal);
  flex-shrink: 0;
  line-height: 1;
}
.focus-label {
  font-family: 'Montserrat', sans-serif;
  font-size: var(--fs-base);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  text-align: left;
}
</style>
