<template>
  <header class="page-header">
    <a href="https://eurotales.eu" class="logo-link">
      <img src="https://eurotales.eu/wp-content/uploads/2021/05/Logo-eurotales-ROSSO-DEFINITIVO.png"
           class="logo" alt="Eurotales" />
    </a>

    <h1 class="title">{{ t('app.title') }}</h1>

    <!-- Bottone filtro nell'header (azione primaria) -->
    <button
      v-if="showFilter"
      class="header-btn header-btn-primary"
      @click="$emit('open-filters')"
    >
      <span class="filter-icon" aria-hidden="true">⚙</span>
      <span>{{ t('ui.filterLanguages') }}</span>
    </button>

    <!-- Lang switcher: stesso pattern di Risonanze, in alto a destra -->
    <div class="lang-switch">
      <button
        v-for="loc in ['it', 'en']"
        :key="loc"
        class="lang-btn"
        :class="{ active: locale === loc }"
        @click="locale = loc"
      >{{ loc.toUpperCase() }}</button>
    </div>
  </header>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()
defineProps({
  showFilter: { type: Boolean, default: true },
})
defineEmits(['open-filters'])
</script>

<style scoped>
.page-header {
  position: relative;
  z-index: var(--z-header);
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-4);
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  height: clamp(72px, 8vh, 120px);
  flex-shrink: 0;
}

.logo-link { display: flex; align-items: center; height: 100%; }
.logo { height: 80%; max-height: 64px; }

.title {
  font-family: var(--font-display);
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--rosso);
  letter-spacing: 0.05em;
  flex: 1;
}

/* Bottone primario nell'header (filtra lingue) */
.header-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: var(--fs-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--tr-base);
  white-space: nowrap;
  min-height: 48px;
  touch-action: manipulation;
}

.header-btn-primary {
  background: var(--rosso);
  color: white;
  box-shadow: 0 2px 8px rgba(145, 43, 61, 0.3);
}
.header-btn-primary:hover { background: #6f1f2e; }
.header-btn-primary:active { transform: scale(0.97); }

.filter-icon {
  font-size: 1.15em;
  line-height: 1;
}

@media (max-width: 768px) {
  .title { font-size: var(--fs-lg); }
  .header-btn span:last-child { display: none; }
  .header-btn { padding: var(--sp-2); }
  .filter-icon { font-size: 1.5em; }
}

@media (min-width: 2560px) {
  .header-btn { min-height: 64px; padding: var(--sp-3) var(--sp-4); }
  .lang-btn   { min-height: 56px; }
}
</style>
