import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import it from './locales/it.js'
import en from './locales/en.js'
import App from './App.vue'
import './assets/main.css'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('datarain-locale') || 'it',
  fallbackLocale: 'it',
  messages: { it, en },
})

const app = createApp(App)
app.use(createPinia())
app.use(i18n)
app.mount('#app')
