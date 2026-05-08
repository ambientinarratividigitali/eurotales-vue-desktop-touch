<script setup>
/* FocusAltText — mostra il testo del Focus nella lingua "alternativa".
   Riproduce il comportamento dell'originale dove il testo viene
   presentato in due lingue, separato da <hr>, con la traduzione in colore teal. */
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const props = defineProps({
  which:     { type: [Number, String], required: true },
  altLocale: { type: String, required: true },
})

const { messages } = useI18n()

const altBody = computed(() => {
  const m = messages.value[props.altLocale]
  return m?.focus?.[props.which]?.body || ''
})
</script>

<template>
  <template v-if="altBody">
    <hr class="alt-divider" />
    <div class="alt-body" v-html="altBody"></div>
  </template>
</template>

<style scoped>
.alt-divider {
  border: none;
  border-top: 1px solid rgba(255,255,255,0.3);
  margin: var(--sp-4) 0;
}
.alt-body {
  text-align: left;
  font-size: var(--fs-md);
  line-height: 1.7;
  color: var(--accent-teal);
  max-width: 95%;
  margin: 0 auto;
}
.alt-body :deep(em),
.alt-body :deep(i),
.alt-body :deep(i21) {
  font-style: italic;
  font-weight: 600;
}
.alt-body :deep(p) { margin: var(--sp-3) 0; }

/* Quando è dentro la bubble beige, contrasto invertito */
:global(.bubble-beige) .alt-body { color: #2a7a64; }
</style>
