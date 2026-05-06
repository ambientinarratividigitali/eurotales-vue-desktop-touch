import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/ieri', name: 'ieri', component: () => import('../views/IeriView.vue') },
  { path: '/ieri/persona/:id', name: 'persona', component: () => import('../views/PersonaView.vue') },
  { path: '/oggi', name: 'oggi', component: () => import('../views/OggiView.vue') },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
