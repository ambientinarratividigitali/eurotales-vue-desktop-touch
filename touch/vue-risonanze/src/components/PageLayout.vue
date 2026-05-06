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
  gap: var(--sp-1);
  background: var(--b-50);
  border: 1.5px solid var(--w-22);
  color: white;
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: var(--fs-base);
  font-weight: 500;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: background var(--tr-base), border-color var(--tr-base);
  min-height: 44px;
}
.fixed-back-btn:hover {
  background: var(--w-12);
  border-color: var(--w-45);
}

.fixed-lang-switch {
  position: fixed;
  bottom: var(--sp-4);
  right: var(--sp-4);
  z-index: var(--z-fixed);
  display: flex;
  gap: var(--sp-1);
}

.lang-btn {
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-pill);
  font-size: var(--fs-base);
  font-weight: 600;
  letter-spacing: 0.06em;
  background: var(--b-50);
  border: 1.5px solid var(--w-22);
  color: var(--w-45);
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all var(--tr-base);
  min-height: 44px;
  min-width: 56px;
}
.lang-btn.active {
  background: var(--w-12);
  color: white;
  border-color: var(--w-45);
}
.lang-btn:hover { background: var(--w-12); color: white; }
</style>
