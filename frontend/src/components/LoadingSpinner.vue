<template>
  <div class="spinner-wrap" :style="{ padding: padding }">
    <div :class="['spinner', cor === 'verde' ? 'spinner-verde' : '']" :style="{ width: size, height: size }"></div>
    <p v-if="texto" class="spinner-texto">{{ texto }}</p>
  </div>
</template>

<script setup>
defineProps({
  texto: { type: String, default: '' },
  cor: { type: String, default: 'verde' },
  size: { type: String, default: '28px' },
  padding: { type: String, default: '48px' }
})
</script>

<style scoped>
.spinner-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
.spinner-texto { font-size: 0.85rem; color: var(--cinza-500); }
</style>
