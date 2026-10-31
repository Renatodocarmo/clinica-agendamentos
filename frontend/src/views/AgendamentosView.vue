<template>
  <div class="layout">
    <Sidebar />
    <main class="main-content">
      <div class="page-header">
        <div>
          <h1>Agendamentos</h1>
          <p>{{ auth.isAdmin ? 'Gerencie todas as consultas' : 'Suas consultas médicas' }}</p>
        </div>
        <router-link to="/agendamentos/novo" class="btn btn-primary">+ Nova Consulta</router-link>
      </div>

      <!-- Filtros -->
      <div class="card filtros-card">
        <div class="filtros-grid">
          <div class="form-group">
            <label class="form-label">Status</label>
            <select v-model="filtros.status" class="form-select" @change="buscar">
              <option value="">Todos</option>
              <option value="agendado">Agendado</option>
              <option value="confirmado">Confirmado</option>
              <option value="realizado">Realizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Data início</label>
            <input v-model="filtros.dataInicio" type="date" class="form-input" @change="buscar" />
          </div>
          <div class="form-group">
            <label class="form-label">Data fim</label>
            <input v-model="filtros.dataFim" type="date" class="form-input" @change="buscar" />
          </div>
          <div class="form-group">
            <label class="form-label" style="opacity:0">Ação</label>
            <button class="btn btn-secondary" @click="limparFiltros">Limpar filtros</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div v-if="carregando" class="flex-center" style="padding:60px"><div class="spinner spinner-verde"></div></div>

        <div v-else-if="agendamentos.length === 0" class="vazio">
          <div class="vazio-icon">📭</div>
          <p>Nenhum agendamento encontrado</p>
        </div>

        <div v-else>
          <div class="tabela-wrapper">
            <table class="tabela">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Especialidade</th>
                  <th>Médico(a)</th>
                  <th v-if="auth.isAdmin">Paciente</th>
                  <th>Clima</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in agendamentos" :key="a._id">
                  <td>
                    <div style="font-weight:500;color:var(--cinza-900)">{{ formatarData(a.data) }}</div>
                    <div style="font-size:0.8rem;color:var(--cinza-500)">{{ a.horario }}</div>
                  </td>
                  <td>{{ a.especialidade }}</td>
                  <td>{{ a.medico }}</td>
                  <td v-if="auth.isAdmin">
                    <div>{{ a.paciente?.nome }}</div>
                    <div style="font-size:0.78rem;color:var(--cinza-500)">{{ a.paciente?.telefone }}</div>
                  </td>
                  <td>
                    <span v-if="a.previsaoClimatica?.temChuva" title="Previsão de chuva" class="badge badge-amarelo">🌧️ Chuva</span>
                    <span v-else-if="a.previsaoClimatica" class="badge badge-verde">☀️ Bom</span>
                    <span v-else class="text-muted" style="font-size:0.78rem">—</span>
                  </td>
                  <td>
                    <span :class="['badge', badgeStatus(a.status)]">{{ labelStatus(a.status) }}</span>
                  </td>
                  <td>
                    <div class="acoes-tabela">
                      <button v-if="auth.isAdmin" class="btn btn-sm btn-secondary" @click="abrirModal(a)">Editar</button>
                      <button
                        v-if="a.status === 'agendado'"
                        class="btn btn-sm btn-danger"
                        @click="cancelar(a._id)"
                        :disabled="cancelando === a._id"
                      >Cancelar</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginação -->
          <div v-if="paginacao.totalPaginas > 1" class="paginacao">
            <button :disabled="paginacao.pagina === 1" @click="mudarPagina(paginacao.pagina - 1)">‹</button>
            <button
              v-for="p in paginacao.totalPaginas" :key="p"
              :class="{ ativo: p === paginacao.pagina }"
              @click="mudarPagina(p)"
            >{{ p }}</button>
            <button :disabled="paginacao.pagina === paginacao.totalPaginas" @click="mudarPagina(paginacao.pagina + 1)">›</button>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal editar -->
    <div v-if="modalAberto" class="modal-overlay" @click.self="modalAberto = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Editar Agendamento</h3>
          <button class="modal-close" @click="modalAberto = false">×</button>
        </div>
        <div class="form-group" style="margin-bottom:16px">
          <label class="form-label">Status</label>
          <select v-model="modalForm.status" class="form-select">
            <option value="agendado">Agendado</option>
            <option value="confirmado">Confirmado</option>
            <option value="realizado">Realizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom:20px">
          <label class="form-label">Observações</label>
          <textarea v-model="modalForm.observacoes" class="form-textarea"></textarea>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button class="btn btn-secondary" @click="modalAberto = false">Cancelar</button>
          <button class="btn btn-primary" @click="salvarEdicao" :disabled="salvando">
            <span v-if="salvando" class="spinner"></span>
            <span v-else>Salvar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/auth'
import Sidebar from '../components/Sidebar.vue'
import api from '../services/api'

const auth = useAuthStore()
const agendamentos = ref([])
const carregando = ref(true)
const cancelando = ref(null)
const salvando = ref(false)
const modalAberto = ref(false)
const modalForm = ref({})
const modalId = ref(null)
const paginacao = ref({ pagina: 1, limite: 10, total: 0, totalPaginas: 1 })
const filtros = ref({ status: '', dataInicio: '', dataFim: '' })

const formatarData = d => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const badgeStatus = s => ({ agendado: 'badge-amarelo', confirmado: 'badge-verde', cancelado: 'badge-vermelho', realizado: 'badge-azul' }[s] || 'badge-cinza')
const labelStatus = s => ({ agendado: 'Agendado', confirmado: 'Confirmado', cancelado: 'Cancelado', realizado: 'Realizado' }[s] || s)

const buscar = async () => {
  carregando.value = true
  try {
    const params = { pagina: paginacao.value.pagina, limite: paginacao.value.limite }
    if (filtros.value.status) params.status = filtros.value.status
    if (filtros.value.dataInicio) params.dataInicio = filtros.value.dataInicio
    if (filtros.value.dataFim) params.dataFim = filtros.value.dataFim
    const { data } = await api.get('/agendamentos', { params })
    agendamentos.value = data.agendamentos
    paginacao.value = { ...paginacao.value, ...data.paginacao }
  } finally {
    carregando.value = false
  }
}

const mudarPagina = p => { paginacao.value.pagina = p; buscar() }
const limparFiltros = () => { filtros.value = { status: '', dataInicio: '', dataFim: '' }; buscar() }

const cancelar = async (id) => {
  if (!confirm('Confirmar cancelamento da consulta?')) return
  cancelando.value = id
  try {
    await api.put(`/agendamentos/${id}`, { status: 'cancelado' })
    await buscar()
  } finally {
    cancelando.value = null
  }
}

const abrirModal = (a) => {
  modalId.value = a._id
  modalForm.value = { status: a.status, observacoes: a.observacoes || '' }
  modalAberto.value = true
}

const salvarEdicao = async () => {
  salvando.value = true
  try {
    await api.put(`/agendamentos/${modalId.value}`, modalForm.value)
    modalAberto.value = false
    await buscar()
  } finally {
    salvando.value = false
  }
}

onMounted(buscar)
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; }
.filtros-card { margin-bottom: 20px; }
.filtros-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
.acoes-tabela { display: flex; gap: 6px; flex-wrap: wrap; }
</style>
