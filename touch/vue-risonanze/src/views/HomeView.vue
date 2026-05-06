<template>
  <div class="home">
    <!-- Cerchi animati di sfondo -->
    <div class="home-bg" aria-hidden="true">
      <div class="bg-circle bg-c1"></div>
      <div class="bg-circle bg-c2"></div>
      <div class="bg-circle bg-c3"></div>
    </div>

    <!-- Logo Eurotales -->
    <header class="home-header">
      <logo />
    </header>

    <!-- Language switcher in alto a destra (solo qui, non c'è PageLayout) -->
    <div class="home-lang">
      <button
        v-for="loc in ['it', 'en']"
        :key="loc"
        class="lang-btn"
        :class="{ active: locale === loc }"
        @click="locale = loc"
      >{{ loc.toUpperCase() }}</button>
    </div>

    <!-- Titolo + cerchi navigazione -->
    <div class="home-title">
      <h1>{{ t('home.title') }}</h1>
      <p>{{ t('home.subtitle') }}</p>
    </div>

    <nav class="circles-nav">
      <button class="circle circle-ieri" @click="router.push('/ieri')">
        <div class="circle-inner">
          <span class="circle-label">{{ t('home.ieri') }}</span>
          <span class="circle-desc">{{ t('home.ieriDesc') }}</span>
        </div>
        <div class="circle-ring"></div>
      </button>

      <button class="circle circle-info" @click="showInfo = true">
        <div class="circle-inner">
          <span class="circle-label">{{ t('home.info') }}</span>
        </div>
        <div class="circle-ring"></div>
      </button>

      <button class="circle circle-oggi" @click="router.push('/oggi')">
        <div class="circle-inner">
          <span class="circle-label">{{ t('home.oggi') }}</span>
          <span class="circle-desc">{{ t('home.oggiDesc') }}</span>
        </div>
        <div class="circle-ring"></div>
      </button>
    </nav>

    <!-- Modale info -->
    <transition name="fade">
      <div class="modal-overlay" v-if="showInfo" @click.self="showInfo = false">
        <div class="modal-box modal-info">
          <h2 class="modal-title">{{ t('info.title') }}</h2>
          <div class="modal-cols">
            <div class="modal-col">
              <h3 class="col-ieri">{{ t('info.ieriTitle') }}</h3>
              <p>{{ t('info.ieriDesc') }}</p>
            </div>
            <div class="modal-col">
              <h3 class="col-oggi">{{ t('info.oggiTitle') }}</h3>
              <p>{{ t('info.oggiDesc') }}</p>
            </div>
          </div>
          <button class="btn btn-oro" @click="showInfo = false">
            {{ t('common.close') }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import logo from '../components/Logo.vue'

const router = useRouter()
const { t, locale } = useI18n()
const showInfo = ref(false)
</script>

<style scoped>
.home {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: var(--nero-deep);
  background-image: url('/img/mappaStorica.png'); 
  background-size: cover; 
  background-position: center; 
  background-blend-mode: overlay; 
  background-color: rgba(0, 0, 0, 0);
}

/* Sfondo animato */
.home-bg { position: absolute; inset: 0; pointer-events: none;}
.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: drift 12s ease-in-out infinite alternate;
}
.bg-c1 { width: 600px; height: 600px; background: var(--rosso); top: -100px; left: -100px; }
.bg-c2 { width: 500px; height: 500px; background: var(--verde); bottom: -100px; right: -50px; animation-delay: -4s; }
.bg-c3 { width: 400px; height: 400px; background: var(--oro); top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: -8s; }
@keyframes drift {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(30px, 20px) scale(1.1); }
}

/* Logo */
.home-header {
  position: absolute;
  top: var(--sp-3);
  left: var(--sp-4);
}

/* Lang switch in alto a destra */
.home-lang {
  position: absolute;
  top: var(--sp-3);
  right: var(--sp-4);
  display: flex;
  gap: var(--sp-1);
}
.lang-btn {
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius-pill);
  font-size: var(--fs-base);
  font-weight: 600;
  letter-spacing: 0.05em;
  background: var(--b-50);
  border: 1.5px solid var(--w-30);
  color: var(--w-85);
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all var(--tr-base);
  min-height: 56px;
  min-width: 64px;
}
.lang-btn.active {
  background: var(--w-18);
  color: white;
  border-color: white;
}
.lang-btn:hover:not(.active) { background: var(--w-12); color: white; }

@media (min-width: 2560px) {
  .lang-btn { min-height: 80px; min-width: 96px; }
}

/* Titolo */
.home-title {
  text-align: center;
  margin-bottom: var(--sp-6);
  position: relative;
  z-index: 1;
  padding: var(--sp-3) var(--sp-5);
  background: rgba(0, 0, 0, 0.35);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(4px);
}
.home-title h1 {
  font-family: var(--font-display);
  font-size: var(--fs-2xl);
  font-weight: 600;
  color: white;
  letter-spacing: 0.02em;
  line-height: 1;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.6);
}
.home-title p {
  font-size: var(--fs-md);
  color: var(--w-85);
  margin-top: var(--sp-2);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 500;
}

/* Cerchi */
.circles-nav {
  display: flex;
  align-items: center;
  gap: clamp(20px, 4vw, 80px);
  position: relative;
  z-index: 1;
}

.circle {
  position: relative;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: none;
  transition: transform var(--tr-slow) cubic-bezier(0.34, 1.56, 0.64, 1);
}
.circle:hover { transform: scale(1.06); }
.circle:hover .circle-ring { opacity: 1; transform: scale(1.15); }

.circle-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: var(--sp-3);
}

.circle-label {
  font-family: var(--font-display);
  font-size: clamp(28px, 3.2vw, 96px);
  font-weight: 600;
  letter-spacing: 0.05em;
  line-height: 1;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
}

.circle-desc {
  font-size: var(--fs-base);
  font-weight: 500;
  opacity: 0.9;
  text-align: center;
  max-width: clamp(160px, 14vw, 320px);
  letter-spacing: 0.02em;
  line-height: 1.3;
}

.circle-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid currentColor;
  opacity: 0.3;
  transition: all var(--tr-slow);
}

/* IERI */
.circle-ieri {
  width: clamp(180px, 22vw, 640px);
  height: clamp(180px, 22vw, 640px);
  background: radial-gradient(circle at 40% 40%, rgba(145, 43, 61, 0.85), rgba(80, 20, 30, 0.95));
  color: white;
  box-shadow: 0 20px 60px rgba(145, 43, 61, 0.4);
}
.circle-ieri .circle-ring { border-color: var(--rosso); }

/* INFO */
.circle-info {
  width: clamp(110px, 11vw, 320px);
  height: clamp(110px, 11vw, 320px);
  background: radial-gradient(circle at 40% 40%, rgba(80, 75, 65, 0.9), rgba(40, 38, 35, 0.95));
  color: var(--w-85);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}
.circle-info .circle-ring { border-color: var(--w-45); }

/* OGGI */
.circle-oggi {
  width: clamp(180px, 22vw, 640px);
  height: clamp(180px, 22vw, 640px);
  background: radial-gradient(circle at 40% 40%, rgba(43, 145, 127, 0.85), rgba(20, 80, 70, 0.95));
  color: white;
  box-shadow: 0 20px 60px rgba(43, 145, 127, 0.4);
}
.circle-oggi .circle-ring { border-color: var(--verde); }

/* Modale info: layout specifico (le classi base modal-* sono in main.css) */
.modal-info { text-align: center; }
.modal-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-5);
  margin: var(--sp-3) 0;
  text-align: left;
}
.modal-col p {
  font-size: var(--fs-base);
  line-height: 1.7;
  color: var(--w-85);
}
.col-ieri,
.col-oggi {
  font-family: var(--font-display);
  font-size: var(--fs-lg);
  font-weight: 600;
  margin-bottom: var(--sp-2);
  letter-spacing: 0.04em;
}
.col-ieri { color: var(--rosso); }
.col-oggi { color: var(--verde); }

@media (max-width: 768px) {
  .circles-nav { flex-direction: column; gap: var(--sp-3); }
  .modal-cols  { grid-template-columns: 1fr; }
}
</style>
