<script setup>
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
      <a href="https://eurotales.eu" class="logo-link">
        <Logo />
      </a>

      <h1 class="hdr-title">{{ t('app.title') }}</h1>

      <div class="lang-switch" role="group" aria-label="language">
        <button
          v-for="loc in ['it', 'en']"
          :key="loc"
          class="lang-btn"
          :class="{ active: locale === loc }"
          @click="setLocale(loc)"
        >{{ loc.toUpperCase() }}</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  height: var(--header-h);
  background: rgba(251, 243, 234, 0.4);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 2px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.hdr-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-5);
  padding: var(--sp-3) var(--sp-6);
  height: 100%;
}

.logo-link {
  display: flex;
  align-items: center;
  height: 100%;
  flex-shrink: 0;
}

.hdr-title {
  flex: 1;
  text-align: center;
  margin: 0;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(36px, 3.6vw, 138px);
  font-weight: 700;
  color: #912B3D;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.lang-switch {
  display: flex;
  gap: var(--sp-2);
  flex-shrink: 0;
}

.lang-btn {
  padding: 0.6em 1.4em;
  min-height: clamp(62px, 5.5vw, 99px);
  min-width: clamp(73px, 6.5vw, 117px);
  border-radius: 9999px;
  font-size: clamp(17px, 1.6vw, 29px);
  font-weight: 700;
  letter-spacing: 0.06em;
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
.lang-btn.active {
  background: #912B3D;
  color: white;
  border-color: #912B3D;
  box-shadow: 0 3px 10px rgba(145, 43, 61, 0.35);
}
.lang-btn:active { transform: scale(0.96); }
</style>