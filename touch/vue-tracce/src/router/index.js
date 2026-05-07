import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/',                name: 'mappa',  component: () => import('../views/MappaView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() { return { top: 0 } },
})
