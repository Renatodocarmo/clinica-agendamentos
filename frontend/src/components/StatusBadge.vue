<template>
  <span :class="['badge', classeStatus]">{{ labelStatus }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true }
})

const mapa = {
  agendado:   { classe: 'badge-amarelo', label: 'Agendado' },
  confirmado: { classe: 'badge-verde',   label: 'Confirmado' },
  cancelado:  { classe: 'badge-vermelho', label: 'Cancelado' },
  realizado:  { classe: 'badge-azul',    label: 'Realizado' },
  paciente:   { classe: 'badge-cinza',   label: 'Paciente' },
  secretario: { classe: 'badge-azul',    label: 'Secretário' },
  admin:      { classe: 'badge-vermelho', label: 'Admin' }
}

const classeStatus = computed(() => mapa[props.status]?.classe || 'badge-cinza')
const labelStatus  = computed(() => mapa[props.status]?.label  || props.status)
</script>
