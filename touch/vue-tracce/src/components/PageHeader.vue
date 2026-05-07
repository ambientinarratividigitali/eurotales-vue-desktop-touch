<script setup>
/* PageHeader — barra trasparente con titolo + selettore lingua (touch friendly) */
import { useI18n } from 'vue-i18n'
import Logo from './Logo.vue'

const { t, locale } = useI18n()

function setLocale(l) {
  locale.value = l
  localStorage.setItem('tracce-locale', l)
}
</script>

<template>
  <header class="page-header">
    <div class="hdr-inner">
      <Logo />
      <h1 class="hdr-title">{{ t('app.title') }}</h1>

      <div class="lang-switch" role="group" aria-label="language">
        <button :class="['lang-btn', { active: locale === 'it' }]" @click="setLocale('it')">IT</button>
        <span class="lang-sep">|</span>
        <button :class="['lang-btn', { active: locale === 'en' }]" @click="setLocale('en')">EN</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.page-header {
  background: rgba(251, 243, 234, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(204, 204, 204, 0.35);
  position: sticky;
  top: 0;
  z-index: 2000;
}

.hdr-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-5);
  padding: var(--sp-3) var(--sp-6);
  min-height: var(--header-h);
}

.hdr-title {
  margin: 0;
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--text);
}

.lang-switch {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.lang-btn {
  background: transparent;
  border: none;
  font-size: var(--fs-md);
  font-weight: 700;
  color: var(--text-muted);
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius);
  min-width: var(--tap-large);
  min-height: var(--tap-large);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}
.lang-btn:active { background: rgba(0,0,0,0.06); }
.lang-btn.active {
  color: var(--accent-strong);
  text-decoration: underline;
  text-decoration-thickness: 3px;
  text-underline-offset: 6px;
}
.lang-sep { color: var(--border); font-size: var(--fs-md); }
</style>
