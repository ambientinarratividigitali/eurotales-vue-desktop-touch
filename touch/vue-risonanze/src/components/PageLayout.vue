<template>
  <div class="page-layout">
    <!-- Sfondo mappa + overlay colore-dominio -->
    <div class="bg-map"></div>
    <div class="bg-overlay" :class="`is-${domain}`"></div>

    <!-- Contenuto pagina -->
    <slot />

    <!-- Bottone Indietro fisso (basso sx) -->
    <button class="fixed-back-btn" @click="$emit('back')">
      <span>←</span>
      <span>{{ t('nav.back') }}</span>
    </button>

    <!-- Language switcher fisso (basso dx) -->
    <div class="fixed-lang-switch">
      <button
        v-for="loc in ['it', 'en']"
        :key="loc"
        class="lang-btn"
        :class="{ active: locale === loc }"
        @click="locale = loc"
      >{{ loc.toUpperCase() }}</button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()
defineProps({ domain: { type: String, default: 'ieri' } })
defineEmits(['back'])
</script>

<style scoped>
.page-layout {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: white;
}

.bg-map {
  position: absolute;
  inset: 0;
  z-index: var(--z-bg);
  background: var(--bg-map);
  /* Quando arriva l'immagine pulita, sostituire con:
     background: url('/map-bg.png') center/cover no-repeat; */
}

.bg-overlay {
  position: absolute;
  inset: 0;
  z-index: var(--z-overlay);
}
.bg-overlay.is-ieri { background: var(--overlay-ieri); }
.bg-overlay.is-oggi { background: var(--overlay-oggi); }

.fixed-back-btn {
  position: fixed;
  bottom: var(--sp-4);
  left: var(--sp-4);
  z-index: var(--z-fixed);
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  background: var(--b-65);
  border: 1.5px solid var(--w-30);
  color: white;
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: var(--fs-base);
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: background var(--tr-base), border-color var(--tr-base), transform var(--tr-fast);
  min-height: 64px;
}
.fixed-back-btn:hover,
.fixed-back-btn:active {
  background: var(--w-12);
  border-color: white;
}
.fixed-back-btn:active { transform: scale(0.97); }

.fixed-lang-switch {
  position: fixed;
  bottom: var(--sp-4);
  right: var(--sp-4);
  z-index: var(--z-fixed);
  display: flex;
  gap: var(--sp-2);
}

.lang-btn {
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius-pill);
  font-size: var(--fs-base);
  font-weight: 600;
  letter-spacing: 0.06em;
  background: var(--b-65);
  border: 1.5px solid var(--w-30);
  color: var(--w-85);
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all var(--tr-base);
  min-height: 64px;
  min-width: 72px;
}
.lang-btn.active {
  background: var(--w-18);
  color: white;
  border-color: white;
}
.lang-btn:hover:not(.active),
.lang-btn:active:not(.active) {
  background: var(--w-12);
  color: white;
}

@media (min-width: 2560px) {
  .fixed-back-btn,
  .lang-btn { min-height: 80px; }
  .lang-btn { min-width: 96px; }
}
</style>
