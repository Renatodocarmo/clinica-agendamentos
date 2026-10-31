<template>
  <div class="layout">
    <Sidebar />
    <main class="main-content">
      <div class="page-header">
        <h1>Painel Administrativo</h1>
        <p>Gerencie usuários, agendamentos e relatórios</p>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button v-for="t in tabs" :key="t.id" :class="['tab-btn', { ativo: abaAtiva === t.id }]" @click="abaAtiva = t.id">
          {{ t.icon }} {{ t.label }}
        </button>
      </div>

      <!-- Dashboard Stats -->
      <div v-if="abaAtiva === 'dashboard'">
        <div v-if="carregando" class="flex-center" style="padding:60px"><div class="spinner spinner-verde"></div></div>
        <div v-else>
          <div class="stats-grid">
            <div class="stat-card verde">
              <div class="stat-value">{{ stats.totalAgendamentosHoje }}</div>
              <div class="stat-label">Consultas hoje</div>
            </div>
            <div class="stat-card azul">
              <div class="stat-value">{{ stats.agendamentosPendentes }}</div>
              <div class="stat-label">Pendentes</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ stats.totalPacientes }}</div>
              <div class="stat-label">Pacientes ativos</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ stats.agendamentosRealizados }}</div>
              <div class="stat-label">Realizados</div>
            </div>
            <div class="stat-card vermelho">
              <div class="stat-value">{{ stats.agendamentosCancelados }}</div>
              <div class="stat-label">Cancelados</div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3>Próximas consultas agendadas</h3>
            </div>
            <div class="tabela-wrapper">
              <table class="tabela">
                <thead>
                  <tr><th>Data</th><th>Hora</th><th>Paciente</th><th>Especialidade</th><th>Médico</th><th>Status</th></tr>
                </thead>
                <tbody>
                  <tr v-for="c in proximasConsultas" :key="c._id">
                    <td>{{ formatarData(c.data) }}</td>
                    <td>{{ c.horario }}</td>
                    <td>{{ c.paciente?.nome }}</td>
                    <td>{{ c.especialidade }}</td>
                    <td>{{ c.medico }}</td>
                    <td><span :class="['badge', badgeStatus(c.status)]">{{ labelStatus(c.status) }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Usuários -->
      <div v-if="abaAtiva === 'usuarios'">
        <div class="card">
          <div class="card-header">
            <h3>Gerenciar Usuários</h3>
            <div class="filtros-inline">
              <input v-model="buscaUsuario" type="text" class="form-input" placeholder="Buscar por nome ou email..." style="width:240px" @input="buscarUsuarios" />
              <select v-model="filtroPerfilUsuario" class="form-select" style="width:140px" @change="buscarUsuarios">
                <option value="">Todos perfis</option>
                <option value="paciente">Paciente</option>
                <option value="secretario">Secretário</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div v-if="carregandoUsuarios" class="flex-center" style="padding:40px"><div class="spinner spinner-verde"></div></div>
          <div v-else class="tabela-wrapper">
            <table class="tabela">
              <thead>
                <tr><th>Nome</th><th>Email</th><th>Perfil</th><th>Status</th><th>Desde</th><th>Ações</th></tr>
              </thead>
              <tbody>
                <tr v-for="u in usuarios" :key="u._id">
                  <td>
                    <div style="display:flex;align-items:center;gap:10px">
                      <div class="mini-avatar">{{ iniciais(u.nome) }}</div>
                      {{ u.nome }}
                    </div>
                  </td>
                  <td style="color:var(--cinza-500)">{{ u.email }}</td>
                  <td>
                    <span :class="['badge', u.perfil === 'admin' ? 'badge-vermelho' : u.perfil === 'secretario' ? 'badge-azul' : 'badge-cinza']">
                      {{ u.perfil }}
                    </span>
                  </td>
                  <td><span :class="['badge', u.ativo ? 'badge-verde' : 'badge-vermelho']">{{ u.ativo ? 'Ativo' : 'Inativo' }}</span></td>
                  <td style="font-size:0.82rem;color:var(--cinza-500)">{{ formatarData(u.createdAt) }}</td>
                  <td>
                    <button class="btn btn-sm btn-secondary" @click="abrirModalUsuario(u)">Editar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Relatório -->
      <div v-if="abaAtiva === 'relatorio'">
        <div class="card" style="margin-bottom:20px">
          <div class="card-header">
            <h3>Filtrar período</h3>
          </div>
          <div style="display:flex;gap:16px;align-items:flex-end">
            <div class="form-group">
              <label class="form-label">Data início</label>
              <input v-model="relFiltros.dataInicio" type="date" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Data fim</label>
              <input v-model="relFiltros.dataFim" type="date" class="form-input" />
            </div>
            <button class="btn btn-primary" @click="gerarRelatorio">Gerar relatório</button>
          </div>
        </div>

        <div v-if="relatorio" class="relatorio-grid">
          <div class="card">
            <h3 style="margin-bottom:16px;font-size:1rem">Por especialidade</h3>
            <div v-for="item in relatorio.porEspecialidade" :key="item._id" class="rel-item">
              <span>{{ item._id }}</span>
              <div class="rel-bar-wrap">
                <div class="rel-bar" :style="{ width: (item.total / maxEspecialidade * 100) + '%' }"></div>
                <span class="rel-num">{{ item.total }}</span>
              </div>
            </div>
          </div>
          <div class="card">
            <h3 style="margin-bottom:16px;font-size:1rem">Por status</h3>
            <div v-for="item in relatorio.porStatus" :key="item._id" class="status-item">
              <span :class="['badge', badgeStatus(item._id)]">{{ labelStatus(item._id) }}</span>
              <span style="font-weight:600;font-size:1.1rem">{{ item.total }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal editar usuário -->
    <div v-if="modalUsuarioAberto" class="modal-overlay" @click.self="modalUsuarioAberto = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Editar usuário: {{ usuarioSelecionado?.nome }}</h3>
          <button class="modal-close" @click="modalUsuarioAberto = false">×</button>
        </div>
        <div class="form-group" style="margin-bottom:16px">
          <label class="form-label">Perfil</label>
          <select v-model="modalUsuarioForm.perfil" class="form-select">
            <option value="paciente">Paciente</option>
            <option value="secretario">Secretário</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom:20px">
          <label class="form-label">Status</label>
          <select v-model="modalUsuarioForm.ativo" class="form-select">
            <option :value="true">Ativo</option>
            <option :value="false">Inativo</option>
          </select>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button class="btn btn-secondary" @click="modalUsuarioAberto = false">Cancelar</button>
          <button class="btn btn-primary" @click="salvarUsuario" :disabled="salvandoUsuario">
            <span v-if="salvandoUsuario" class="spinner"></span>
            <span v-else>Salvar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import api from '../services/api'

const abaAtiva = ref('dashboard')
const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '◫' },
  { id: 'usuarios', label: 'Usuários', icon: '◉' },
  { id: 'relatorio', label: 'Relatórios', icon: '◈' }
]

const carregando = ref(true)
const stats = ref({})
const proximasConsultas = ref([])
const usuarios = ref([])
const carregandoUsuarios = ref(false)
const buscaUsuario = ref('')
const filtroPerfilUsuario = ref('')
const modalUsuarioAberto = ref(false)
const usuarioSelecionado = ref(null)
const modalUsuarioForm = ref({})
const salvandoUsuario = ref(false)
const relatorio = ref(null)
const relFiltros = ref({ dataInicio: '', dataFim: '' })

const maxEspecialidade = computed(() => Math.max(...(relatorio.value?.porEspecialidade?.map(i => i.total) || [1])))

const formatarData = d => new Date(d).toLocaleDateString('pt-BR')
const badgeStatus = s => ({ agendado: 'badge-amarelo', confirmado: 'badge-verde', cancelado: 'badge-vermelho', realizado: 'badge-azul' }[s] || 'badge-cinza')
const labelStatus = s => ({ agendado: 'Agendado', confirmado: 'Confirmado', cancelado: 'Cancelado', realizado: 'Realizado' }[s] || s)
const iniciais = nome => { const p = nome?.split(' ') || []; return (p[0]?.[0] || '') + (p[1]?.[0] || '') }

const carregarDashboard = async () => {
  carregando.value = true
  try {
    const { data } = await api.get('/admin/dashboard')
    stats.value = data.estatisticas
    proximasConsultas.value = data.proximasConsultas || []
  } finally {
    carregando.value = false
  }
}

const buscarUsuarios = async () => {
  carregandoUsuarios.value = true
  try {
    const params = {}
    if (buscaUsuario.value) params.busca = buscaUsuario.value
    if (filtroPerfilUsuario.value) params.perfil = filtroPerfilUsuario.value
    const { data } = await api.get('/admin/usuarios', { params })
    usuarios.value = data.usuarios
  } finally {
    carregandoUsuarios.value = false
  }
}

const abrirModalUsuario = (u) => {
  usuarioSelecionado.value = u
  modalUsuarioForm.value = { perfil: u.perfil, ativo: u.ativo }
  modalUsuarioAberto.value = true
}

const salvarUsuario = async () => {
  salvandoUsuario.value = true
  try {
    await api.put(`/admin/usuarios/${usuarioSelecionado.value._id}`, modalUsuarioForm.value)
    modalUsuarioAberto.value = false
    await buscarUsuarios()
  } finally {
    salvandoUsuario.value = false
  }
}

const gerarRelatorio = async () => {
  const { data } = await api.get('/admin/relatorio', { params: relFiltros.value })
  relatorio.value = data
}

onMounted(() => {
  carregarDashboard()
  buscarUsuarios()
})
</script>

<style scoped>
.tabs { display: flex; gap: 4px; margin-bottom: 24px; border-bottom: 1px solid var(--cinza-200); padding-bottom: 0; }
.tab-btn { padding: 10px 18px; border: none; background: none; cursor: pointer; font-family: var(--fonte-sans); font-size: 0.88rem; color: var(--cinza-500); border-bottom: 2px solid transparent; transition: all var(--transition); font-weight: 500; }
.tab-btn:hover { color: var(--cinza-900); }
.tab-btn.ativo { color: var(--verde); border-bottom-color: var(--verde); }

.filtros-inline { display: flex; gap: 10px; align-items: center; }
.mini-avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--cinza-200); color: var(--cinza-700); display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 600; flex-shrink: 0; }

.relatorio-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.rel-item { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-size: 0.85rem; }
.rel-item span:first-child { width: 140px; flex-shrink: 0; color: var(--cinza-700); }
.rel-bar-wrap { flex: 1; display: flex; align-items: center; gap: 8px; }
.rel-bar { height: 8px; background: var(--verde); border-radius: 4px; transition: width 0.4s ease; min-width: 4px; }
.rel-num { font-weight: 600; color: var(--cinza-900); min-width: 24px; }
.status-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--cinza-200); }
.status-item:last-child { border-bottom: none; }

@media (max-width: 768px) {
  .relatorio-grid { grid-template-columns: 1fr; }
}
</style>
