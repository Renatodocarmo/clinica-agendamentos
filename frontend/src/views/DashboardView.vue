<template>
  <div class="layout">
    <Sidebar />
    <main class="main-content">
      <div class="page-header">
        <h1>Olá, {{ primeiroNome }} 👋</h1>
        <p>{{ dataHoje }} — Aqui está o resumo da clínica</p>
      </div>

      <!-- Stats (admin) -->
      <div v-if="auth.isAdmin && stats" class="stats-grid">
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
          <div class="stat-label">Pacientes</div>
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

      <div class="dashboard-grid">
        <!-- Próximas consultas -->
        <div class="card">
          <div class="card-header">
            <h3>{{ auth.isAdmin ? 'Próximas consultas' : 'Minhas consultas' }}</h3>
            <router-link to="/agendamentos/novo" class="btn btn-primary btn-sm">+ Agendar</router-link>
          </div>
          <div v-if="carregando" class="flex-center" style="padding:40px"><div class="spinner spinner-verde"></div></div>
          <div v-else-if="proximas.length === 0" class="vazio">
            <div class="vazio-icon">📅</div>
            <p>Nenhuma consulta agendada</p>
            <router-link to="/agendamentos/novo" class="btn btn-ghost btn-sm mt-4">Agendar agora</router-link>
          </div>
          <div v-else class="consultas-lista">
            <div v-for="c in proximas" :key="c._id" class="consulta-item">
              <div class="consulta-data">
                <div class="data-dia">{{ formatarDia(c.data) }}</div>
                <div class="data-mes">{{ formatarMes(c.data) }}</div>
              </div>
              <div class="consulta-info">
                <div class="consulta-titulo">{{ c.especialidade }}</div>
                <div class="consulta-sub">Dr(a). {{ c.medico }} • {{ c.horario }}</div>
                <div v-if="auth.isAdmin" class="consulta-paciente">👤 {{ c.paciente?.nome }}</div>
              </div>
              <div class="consulta-status">
                <span :class="['badge', badgeStatus(c.status)]">{{ labelStatus(c.status) }}</span>
                <div v-if="c.previsaoClimatica?.temChuva" class="chuva-alert" title="Previsão de chuva">🌧️</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Acesso rápido -->
        <div class="side-widgets">
          <div class="card widget-acesso">
            <h3>Acesso rápido</h3>
            <div class="acesso-grid">
              <router-link to="/agendamentos/novo" class="acesso-item">
                <div class="acesso-icon verde">📋</div>
                <span>Nova Consulta</span>
              </router-link>
              <router-link to="/agendamentos" class="acesso-item">
                <div class="acesso-icon azul">📁</div>
                <span>Ver Todos</span>
              </router-link>
              <router-link to="/perfil" class="acesso-item">
                <div class="acesso-icon cinza">👤</div>
                <span>Meu Perfil</span>
              </router-link>
              <router-link v-if="auth.isAdmin" to="/admin" class="acesso-item">
                <div class="acesso-icon vermelho">⚙️</div>
                <span>Admin</span>
              </router-link>
            </div>
          </div>

          <div class="card widget-clima">
            <h3>Clima — próximas consultas</h3>
            <div v-if="consultaComChuva" class="alerta alerta-chuva">
              🌧️ <strong>Atenção!</strong> Há previsão de chuva para {{ formatarDataCompleta(consultaComChuva.data) }}. Saia com antecedência!
            </div>
            <div v-else class="alerta alerta-sucesso">
              ☀️ Nenhuma previsão de chuva nas próximas consultas.
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../store/auth'
import Sidebar from '../components/Sidebar.vue'
import api from '../services/api'

const auth = useAuthStore()
const carregando = ref(true)
const proximas = ref([])
const stats = ref(null)

const primeiroNome = computed(() => auth.usuario?.nome?.split(' ')[0] || '')
const dataHoje = computed(() => new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }))
const consultaComChuva = computed(() => proximas.value.find(c => c.previsaoClimatica?.temChuva))

const formatarDia = d => new Date(d).getDate().toString().padStart(2, '0')
const formatarMes = d => new Date(d).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
const formatarDataCompleta = d => new Date(d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })

const badgeStatus = s => ({ agendado: 'badge-amarelo', confirmado: 'badge-verde', cancelado: 'badge-vermelho', realizado: 'badge-azul' }[s] || 'badge-cinza')
const labelStatus = s => ({ agendado: 'Agendado', confirmado: 'Confirmado', cancelado: 'Cancelado', realizado: 'Realizado' }[s] || s)

onMounted(async () => {
  try {
    const hoje = new Date().toISOString().split('T')[0]
    const [agResp] = await Promise.all([
      api.get('/agendamentos', { params: { dataInicio: hoje, limite: 5 } })
    ])
    proximas.value = agResp.data.agendamentos

    if (auth.isAdmin) {
      const { data } = await api.get('/admin/dashboard')
      stats.value = data.estatisticas
      if (data.proximasConsultas?.length) proximas.value = data.proximasConsultas
    }
  } catch (e) {
    console.error(e)
  } finally {
    carregando.value = false
  }
})
</script>

<style scoped>
.dashboard-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }

.consultas-lista { display: flex; flex-direction: column; gap: 0; }
.consulta-item {
  display: flex; align-items: center; gap: 16px; padding: 14px 0;
  border-bottom: 1px solid var(--cinza-200);
}
.consulta-item:last-child { border-bottom: none; }
.consulta-data { text-align: center; background: var(--verde-claro); border-radius: var(--radius-sm); padding: 8px 12px; min-width: 52px; }
.data-dia { font-size: 1.4rem; font-weight: 600; color: var(--verde); line-height: 1; }
.data-mes { font-size: 0.72rem; color: var(--verde); text-transform: uppercase; font-weight: 500; }
.consulta-info { flex: 1; }
.consulta-titulo { font-size: 0.9rem; font-weight: 500; color: var(--cinza-900); }
.consulta-sub { font-size: 0.8rem; color: var(--cinza-500); margin-top: 2px; }
.consulta-paciente { font-size: 0.78rem; color: var(--cinza-500); margin-top: 2px; }
.consulta-status { display: flex; align-items: center; gap: 6px; flex-direction: column; }
.chuva-alert { font-size: 1rem; }

.side-widgets { display: flex; flex-direction: column; gap: 16px; }
.widget-acesso h3, .widget-clima h3 { margin-bottom: 16px; font-size: 1rem; }
.acesso-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.acesso-item {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 14px 10px; border-radius: var(--radius-md);
  border: 1px solid var(--cinza-200); text-decoration: none;
  font-size: 0.8rem; color: var(--cinza-700); transition: all var(--transition);
}
.acesso-item:hover { border-color: var(--verde); background: var(--verde-claro); color: var(--verde); transform: translateY(-1px); }
.acesso-icon { font-size: 1.4rem; }

@media (max-width: 1024px) {
  .dashboard-grid { grid-template-columns: 1fr; }
}
</style>
