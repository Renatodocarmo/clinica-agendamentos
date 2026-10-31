<template>
  <div class="layout">
    <Sidebar />
    <main class="main-content">
      <div class="page-header">
        <h1>Nova Consulta</h1>
        <p>Preencha os dados para agendar sua consulta</p>
      </div>

      <div class="form-grid">
        <div class="card form-card">
          <div v-if="sucesso" class="alerta alerta-sucesso" style="margin-bottom:20px">
            ✅ {{ sucesso }}
          </div>
          <div v-if="alertaChuva" class="alerta alerta-chuva" style="margin-bottom:20px">
            🌧️ {{ alertaChuva }}
          </div>
          <div v-if="erro" class="alerta alerta-erro" style="margin-bottom:20px">
            {{ erro }}
          </div>

          <form @submit.prevent="agendar">
            <div class="form-section">
              <h3 class="section-title">Dados da Consulta</h3>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Especialidade *</label>
                  <select v-model="form.especialidade" class="form-select" required>
                    <option value="">Selecione...</option>
                    <option v-for="e in especialidades" :key="e" :value="e">{{ e }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Médico(a) *</label>
                  <select v-model="form.medico" class="form-select" required>
                    <option value="">Selecione...</option>
                    <option v-for="m in medicosFiltrados" :key="m.nome" :value="m.nome">{{ m.nome }}</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Data *</label>
                  <input v-model="form.data" type="date" class="form-input" :min="amanha" required @change="buscarHorariosEClima" />
                </div>
                <div class="form-group">
                  <label class="form-label">Horário *</label>
                  <div v-if="buscandoHorarios" class="horarios-loading">Buscando horários...</div>
                  <div v-else-if="horariosDisponiveis.length > 0" class="horarios-grid">
                    <button
                      v-for="h in todosHorarios" :key="h"
                      type="button"
                      :class="['horario-btn', { disponivel: horariosDisponiveis.includes(h), selecionado: form.horario === h, ocupado: !horariosDisponiveis.includes(h) }]"
                      :disabled="!horariosDisponiveis.includes(h)"
                      @click="form.horario = h"
                    >{{ h }}</button>
                  </div>
                  <p v-else-if="form.data && form.medico" class="text-muted text-sm">Selecione médico e data para ver horários</p>
                  <p v-else class="text-muted text-sm">Selecione médico e data primeiro</p>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Observações</label>
                <textarea v-model="form.observacoes" class="form-textarea" placeholder="Descreva seus sintomas ou observações importantes..."></textarea>
              </div>
            </div>

            <!-- Clima -->
            <div v-if="clima" class="clima-preview">
              <div class="clima-header">
                <span>🌡️</span>
                <h4>Previsão para {{ formatarData(form.data) }}</h4>
              </div>
              <div class="clima-info">
                <div class="clima-temp">{{ clima.temperatura }}°C</div>
                <div class="clima-desc">{{ clima.descricao }}</div>
              </div>
              <div v-if="clima.temChuva" class="alerta alerta-chuva" style="margin-top:10px">
                🌧️ Previsão de chuva! Planeje-se com antecedência.
              </div>
            </div>

            <div class="form-actions">
              <router-link to="/agendamentos" class="btn btn-secondary">Cancelar</router-link>
              <button type="submit" class="btn btn-primary btn-lg" :disabled="salvando || !form.horario">
                <span v-if="salvando" class="spinner"></span>
                <span v-else>Confirmar Agendamento</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Resumo -->
        <div class="side-info">
          <div class="card">
            <h3 style="margin-bottom:16px;font-size:1rem">Resumo</h3>
            <div class="resumo-lista">
              <div class="resumo-item">
                <span>Especialidade</span>
                <strong>{{ form.especialidade || '—' }}</strong>
              </div>
              <div class="resumo-item">
                <span>Médico</span>
                <strong>{{ form.medico || '—' }}</strong>
              </div>
              <div class="resumo-item">
                <span>Data</span>
                <strong>{{ form.data ? formatarData(form.data) : '—' }}</strong>
              </div>
              <div class="resumo-item">
                <span>Horário</span>
                <strong>{{ form.horario || '—' }}</strong>
              </div>
            </div>
          </div>

          <div class="card" style="margin-top:16px">
            <h4 style="margin-bottom:10px;font-size:0.9rem;color:var(--cinza-500)">Informações</h4>
            <ul class="info-lista">
              <li>Chegue 15 minutos antes</li>
              <li>Traga seus documentos e cartão do plano</li>
              <li>Cancelamentos com até 24h de antecedência</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import Sidebar from '../components/Sidebar.vue'
import api from '../services/api'

const auth = useAuthStore()
const router = useRouter()

const especialidades = [
  'Clínico Geral','Cardiologia','Dermatologia','Ginecologia',
  'Ortopedia','Pediatria','Psiquiatria','Neurologia','Oftalmologia','Urologia'
]

const medicos = [
  { nome: 'Dr. Carlos Mendes', especialidade: 'Clínico Geral' },
  { nome: 'Dra. Ana Rodrigues', especialidade: 'Cardiologia' },
  { nome: 'Dr. Paulo Ferreira', especialidade: 'Dermatologia' },
  { nome: 'Dra. Mariana Costa', especialidade: 'Ginecologia' },
  { nome: 'Dr. Roberto Lima', especialidade: 'Ortopedia' },
  { nome: 'Dra. Sofia Alves', especialidade: 'Pediatria' },
  { nome: 'Dr. André Santos', especialidade: 'Psiquiatria' },
  { nome: 'Dra. Camila Nunes', especialidade: 'Neurologia' },
  { nome: 'Dr. Felipe Castro', especialidade: 'Oftalmologia' },
  { nome: 'Dr. Bruno Araújo', especialidade: 'Urologia' },
]

const todosHorarios = [
  '08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30'
]

const form = ref({ especialidade: '', medico: '', data: '', horario: '', observacoes: '' })
const horariosDisponiveis = ref([])
const buscandoHorarios = ref(false)
const clima = ref(null)
const salvando = ref(false)
const sucesso = ref(null)
const alertaChuva = ref(null)
const erro = ref(null)

const amanha = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})

const medicosFiltrados = computed(() =>
  form.value.especialidade
    ? medicos.filter(m => m.especialidade === form.value.especialidade)
    : medicos
)

const formatarData = d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

watch(() => form.value.especialidade, () => { form.value.medico = '' })

const buscarHorariosEClima = async () => {
  if (!form.value.data || !form.value.medico) return
  buscandoHorarios.value = true
  form.value.horario = ''
  try {
    const [horariosResp, climaResp] = await Promise.all([
      api.get('/agendamentos/horarios-disponiveis', { params: { medico: form.value.medico, data: form.value.data } }),
      api.get('/external/clima', { params: { data: form.value.data } })
    ])
    horariosDisponiveis.value = horariosResp.data.horariosDisponiveis
    clima.value = climaResp.data.disponivel ? climaResp.data : null
  } catch (e) {
    horariosDisponiveis.value = [...todosHorarios]
  } finally {
    buscandoHorarios.value = false
  }
}

watch(() => form.value.medico, () => {
  if (form.value.data) buscarHorariosEClima()
})

const agendar = async () => {
  if (!form.value.horario) return
  salvando.value = true
  erro.value = null
  sucesso.value = null
  alertaChuva.value = null
  try {
    const { data } = await api.post('/agendamentos', form.value)
    sucesso.value = data.message
    alertaChuva.value = data.alertaChuva
    setTimeout(() => router.push('/agendamentos'), 2500)
  } catch (e) {
    erro.value = e.response?.data?.error || 'Erro ao agendar consulta.'
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.form-grid { display: grid; grid-template-columns: 1fr 280px; gap: 20px; align-items: start; }
.form-card { }
.section-title { font-size: 1rem; color: var(--cinza-700); margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--cinza-200); }
.form-section { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }

.horarios-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.horario-btn {
  padding: 7px 12px; border-radius: var(--radius-sm); font-size: 0.82rem;
  cursor: pointer; border: 1.5px solid var(--cinza-300); background: var(--branco);
  transition: all var(--transition); font-family: var(--fonte-sans);
}
.horario-btn.disponivel:hover { border-color: var(--verde); color: var(--verde); background: var(--verde-claro); }
.horario-btn.selecionado { background: var(--verde); color: #fff; border-color: var(--verde); }
.horario-btn.ocupado { opacity: 0.35; cursor: not-allowed; text-decoration: line-through; }
.horarios-loading { font-size: 0.85rem; color: var(--cinza-500); }

.clima-preview { background: var(--cinza-100); border-radius: var(--radius-md); padding: 16px; margin-bottom: 24px; border: 1px solid var(--cinza-200); }
.clima-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.clima-header h4 { font-size: 0.9rem; color: var(--cinza-700); }
.clima-info { display: flex; align-items: center; gap: 16px; }
.clima-temp { font-size: 2rem; font-weight: 600; color: var(--cinza-900); }
.clima-desc { font-size: 0.9rem; color: var(--cinza-500); text-transform: capitalize; }

.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }

.resumo-lista { display: flex; flex-direction: column; gap: 10px; }
.resumo-item { display: flex; justify-content: space-between; align-items: flex-start; font-size: 0.85rem; gap: 8px; }
.resumo-item span { color: var(--cinza-500); }
.resumo-item strong { color: var(--cinza-900); text-align: right; }

.info-lista { padding-left: 16px; display: flex; flex-direction: column; gap: 6px; }
.info-lista li { font-size: 0.82rem; color: var(--cinza-500); }

@media (max-width: 900px) {
  .form-grid { grid-template-columns: 1fr; }
}
</style>
