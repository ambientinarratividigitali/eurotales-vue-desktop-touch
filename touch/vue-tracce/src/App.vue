<script setup>
import PageHeader from './components/PageHeader.vue'
</script>

<template>
  <PageHeader />
  <main class="page-main">
    <router-view />
  </main>
</template>

<style scoped>
.page-main {
  width: 100%;
  height: calc(100vh - var(--header-h));
  overflow: hidden;
}
</style>
