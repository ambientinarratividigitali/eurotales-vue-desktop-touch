<script setup>
/* PageHeader — minimal: titolo + selettore lingua IT/EN. */
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

function setLocale(l) {
  locale.value = l
  localStorage.setItem('datarain-locale', l)
}
</script>

<template>
  <header class="page-header">
    <h1 class="hdr-title">{{ t('app.title') }}</h1>

    <div class="lang-switch">
      <button :class="['lang-btn', { active: locale === 'it' }]" @click="setLocale('it')">IT</button>
      <span class="lang-sep">|</span>
      <button :class="['lang-btn', { active: locale === 'en' }]" @click="setLocale('en')">EN</button>
    </div>
  </header>
</template>

<style scoped>
.page-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-3) var(--sp-5);
  pointer-events: none; /* lascia passare i click sulle gocce dietro */
}
.hdr-title {
  margin: 0;
  font-family: 'KumbhSans', 'Montserrat', sans-serif;
  font-size: var(--fs-lg);
  font-weight: 800;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  text-shadow: 0 2px 8px rgba(0,0,0,0.4);
  pointer-events: auto;
}
.lang-switch {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  background: rgba(0,0,0,0.45);
  border-radius: var(--radius);
  padding: var(--sp-1) var(--sp-2);
  pointer-events: auto;
}
.lang-btn {
  font-size: var(--fs-base);
  font-weight: 700;
  color: rgba(255,255,255,0.6);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-sm);
  min-width: var(--tap-min);
  min-height: var(--tap-min);
  transition: color 0.2s;
}
.lang-btn.active { color: white; text-decoration: underline; }
.lang-sep { color: rgba(255,255,255,0.4); }
</style>
