import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/',                name: 'gallery',       component: () => import('../views/GalleryView.vue') },
  { path: '/mappa',           name: 'mappa',         component: () => import('../views/MappaView.vue') },
  { path: '/random',          name: 'random',        component: () => import('../views/RandomGalleryView.vue') },
  { path: '/scheda/:id',      name: 'scheda',        component: () => import('../views/SchedaView.vue'), props: true },
  { path: '/lingua/:nome',    name: 'lingua',        component: () => import('../views/LinguaView.vue'), props: true },
  { path: '/tag/:id',         name: 'tag',           component: () => import('../views/TagView.vue'),    props: true },
  { path: '/:pathMatch(.*)*', redirect: { name: 'gallery' } },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() { return { top: 0 } },
})
