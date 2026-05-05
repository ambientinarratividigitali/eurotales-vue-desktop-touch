<script setup>
/* CreditsButton — bottone "Crediti" in basso a destra, reattivo alla lingua. */
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['click'])
const { t } = useI18n()
</script>

<template>
  <button class="credits-btn" @click="emit('click')">
    {{ t('app.credits') }}
  </button>
</template>

<style scoped>
.credits-btn {
  position: fixed;
  bottom: var(--sp-5);
  right: var(--sp-5);
  z-index: 50;
  background: rgba(40, 40, 40, 0.85);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-lg);
  padding: var(--sp-3) var(--sp-5);
  font-family: 'Montserrat', sans-serif;
  font-size: var(--fs-base);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-width: clamp(140px, 10vw, 220px);
  min-height: var(--tap-large);
  box-shadow: var(--shadow);
  transition: transform 0.25s, background 0.25s, border-color 0.25s;
  cursor: pointer;
}
.credits-btn:hover {
  background: rgba(60, 60, 60, 0.95);
  border-color: var(--accent-teal);
  transform: scale(1.05);
}
</style>
