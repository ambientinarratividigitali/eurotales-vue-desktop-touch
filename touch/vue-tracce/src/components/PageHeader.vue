<script setup>
/* PageHeader — barra superiore con titolo, navigazione e selettore lingua */
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'

const { t, locale } = useI18n()
const router = useRouter()
const route  = useRoute()

function setLocale(l) {
  locale.value = l
  localStorage.setItem('tracce-locale', l)
}

function isActive(name) { return route.name === name }
</script>

<template>
  <header class="page-header">
    <div class="hdr-inner">
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
  background: var(--bg-pagina);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}
.hdr-inner {
  max-width: 1800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: var(--sp-5);
  padding: var(--sp-3) var(--sp-5);
  min-height: var(--header-h);
}
.hdr-title {
  margin: 0;
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--text);
  flex-shrink: 0;
}
.hdr-nav {
  display: flex;
  gap: var(--sp-2);
  flex: 1;
  justify-content: center;
}
.nav-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-soft);
  font-size: var(--fs-sm);
  font-weight: 600;
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius);
  min-height: var(--tap-min);
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.nav-btn:hover { color: var(--accent-strong); }
.nav-btn.active {
  background: var(--accent);
  color: white;
}
.lang-switch {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  flex-shrink: 0;
}
.lang-btn {
  background: transparent;
  border: none;
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--text-muted);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-sm);
  min-width: var(--tap-min);
  min-height: var(--tap-min);
  transition: color 0.2s;
}
.lang-btn.active { color: var(--accent-strong); text-decoration: underline; }
.lang-sep { color: var(--border); }

@media (max-width: 700px) {
  .hdr-inner { flex-wrap: wrap; gap: var(--sp-3); }
  .hdr-title { flex-basis: 100%; text-align: center; }
}
</style>
