import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import it from './locales/it.js'
import en from './locales/en.js'
import './assets/main.css'

const i18n = createI18n({
  legacy: false,
  locale: 'it',
  fallbackLocale: 'it',
  messages: { it, en },
})

createApp(App)
  .use(createPinia())
  .use(i18n)
  .mount('#app')
