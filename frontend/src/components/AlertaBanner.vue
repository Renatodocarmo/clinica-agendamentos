<template>
  <transition name="alerta-fade">
    <div v-if="mensagem" :class="['alerta', `alerta-${tipo}`]" role="alert">
      <span class="alerta-icone">{{ icone }}</span>
      <span>{{ mensagem }}</span>
      <button v-if="fechavel" class="alerta-fechar" @click="$emit('fechar')" aria-label="Fechar">×</button>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mensagem: { type: String, default: '' },
  tipo: { type: String, default: 'info' }, // info | sucesso | erro | chuva
  fechavel: { type: Boolean, default: false }
})

defineEmits(['fechar'])

const icone = computed(() => ({
  info: 'ℹ️',
  sucesso: '✅',
  erro: '❌',
  chuva: '🌧️'
}[props.tipo] || 'ℹ️'))
</script>

<style scoped>
.alerta { display: flex; align-items: flex-start; gap: 10px; padding: 12px 16px; border-radius: var(--radius-sm); font-size: 0.88rem; }
.alerta-icone { flex-shrink: 0; }
.alerta-fechar { background: none; border: none; cursor: pointer; font-size: 1.2rem; margin-left: auto; color: inherit; opacity: 0.6; line-height: 1; padding: 0 4px; }
.alerta-fechar:hover { opacity: 1; }
.alerta-fade-enter-active, .alerta-fade-leave-active { transition: opacity 0.25s, transform 0.25s; }
.alerta-fade-enter-from, .alerta-fade-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
