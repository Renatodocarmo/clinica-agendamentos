import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useAgendamentosStore = defineStore('agendamentos', () => {
  const agendamentos = ref([])
  const carregando = ref(false)
  const erro = ref(null)
  const paginacao = ref({ pagina: 1, limite: 10, total: 0, totalPaginas: 1 })

  const listar = async (params = {}) => {
    carregando.value = true
    erro.value = null
    try {
      const { data } = await api.get('/agendamentos', { params: { ...params, ...paginacao.value } })
      agendamentos.value = data.agendamentos
      paginacao.value = { ...paginacao.value, ...data.paginacao }
    } catch (e) {
      erro.value = e.response?.data?.error || 'Erro ao carregar agendamentos.'
    } finally {
      carregando.value = false
    }
  }

  const cancelar = async (id) => {
    await api.put(`/agendamentos/${id}`, { status: 'cancelado' })
    const idx = agendamentos.value.findIndex(a => a._id === id)
    if (idx !== -1) agendamentos.value[idx].status = 'cancelado'
  }

  const mudarPagina = (pagina) => {
    paginacao.value.pagina = pagina
  }

  return { agendamentos, carregando, erro, paginacao, listar, cancelar, mudarPagina }
})
