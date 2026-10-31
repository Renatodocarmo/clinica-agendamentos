<template>
  <div class="layout">
    <Sidebar />
    <main class="main-content">
      <div class="page-header">
        <h1>Meu Perfil</h1>
        <p>Gerencie suas informações pessoais</p>
      </div>

      <div class="perfil-grid">
        <div class="card">
          <div class="avatar-section">
            <div class="avatar-grande">{{ iniciais }}</div>
            <div>
              <h2 class="perfil-nome">{{ auth.usuario?.nome }}</h2>
              <span :class="['badge', auth.isAdmin ? 'badge-azul' : 'badge-verde']">{{ labelPerfil }}</span>
            </div>
          </div>

          <div v-if="sucesso" class="alerta alerta-sucesso" style="margin:16px 0">{{ sucesso }}</div>
          <div v-if="erro" class="alerta alerta-erro" style="margin:16px 0">{{ erro }}</div>

          <form @submit.prevent="salvar" class="perfil-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nome completo</label>
                <input v-model="form.nome" type="text" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">Telefone</label>
                <input v-model="form.telefone" type="tel" class="form-input" placeholder="(11) 99999-9999" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">E-mail</label>
              <input :value="auth.usuario?.email" type="email" class="form-input" disabled style="opacity:0.6" />
              <span style="font-size:0.78rem;color:var(--cinza-500)">O e-mail não pode ser alterado</span>
            </div>

            <div class="form-group">
              <label class="form-label">Data de nascimento</label>
              <input v-model="form.dataNascimento" type="date" class="form-input" />
            </div>

            <div class="form-section-title">Endereço</div>

            <div class="form-group">
              <label class="form-label">CEP</label>
              <div class="cep-wrapper">
                <input v-model="cep" type="text" class="form-input" placeholder="00000-000" maxlength="9" @blur="buscarCEP" />
                <span v-if="buscandoCEP" class="spinner spinner-verde"></span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Logradouro</label>
                <input v-model="form.endereco.logradouro" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Bairro</label>
                <input v-model="form.endereco.bairro" type="text" class="form-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Cidade</label>
                <input v-model="form.endereco.cidade" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Estado</label>
                <input v-model="form.endereco.estado" type="text" class="form-input" maxlength="2" />
              </div>
            </div>

            <div class="perfil-actions">
              <button type="submit" class="btn btn-primary" :disabled="salvando">
                <span v-if="salvando" class="spinner"></span>
                <span v-else>Salvar alterações</span>
              </button>
            </div>
          </form>
        </div>

        <div class="side-info">
          <div class="card info-conta">
            <h3 style="margin-bottom:16px;font-size:1rem">Informações da conta</h3>
            <div class="info-linha">
              <span>Perfil</span>
              <strong>{{ labelPerfil }}</strong>
            </div>
            <div class="info-linha">
              <span>Membro desde</span>
              <strong>{{ dataRegistro }}</strong>
            </div>
            <div class="info-linha">
              <span>Status</span>
              <span class="badge badge-verde">Ativo</span>
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
const salvando = ref(false)
const buscandoCEP = ref(false)
const sucesso = ref(null)
const erro = ref(null)
const cep = ref('')

const form = ref({
  nome: auth.usuario?.nome || '',
  telefone: auth.usuario?.telefone || '',
  dataNascimento: auth.usuario?.dataNascimento?.split('T')[0] || '',
  endereco: { cep: '', logradouro: '', bairro: '', cidade: '', estado: '', ...auth.usuario?.endereco }
})

const iniciais = computed(() => {
  const p = auth.usuario?.nome?.split(' ') || []
  return (p[0]?.[0] || '') + (p[1]?.[0] || '')
})
const labelPerfil = computed(() => ({ paciente: 'Paciente', secretario: 'Secretário(a)', admin: 'Administrador' }[auth.usuario?.perfil] || ''))
const dataRegistro = computed(() => {
  const d = auth.usuario?.createdAt
  return d ? new Date(d).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : '—'
})

const buscarCEP = async () => {
  const c = cep.value?.replace(/\D/g, '')
  if (c?.length !== 8) return
  buscandoCEP.value = true
  try {
    const { data } = await api.get(`/external/cep/${c}`)
    form.value.endereco = { cep: data.cep, logradouro: data.logradouro, bairro: data.bairro, cidade: data.cidade, estado: data.estado }
  } catch { } finally {
    buscandoCEP.value = false
  }
}

const salvar = async () => {
  salvando.value = true
  sucesso.value = null
  erro.value = null
  try {
    await auth.atualizarPerfil(form.value)
    sucesso.value = 'Perfil atualizado com sucesso!'
  } catch (e) {
    erro.value = e.response?.data?.error || 'Erro ao salvar perfil.'
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.perfil-grid { display: grid; grid-template-columns: 1fr 260px; gap: 20px; align-items: start; }
.avatar-section { display: flex; align-items: center; gap: 20px; margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid var(--cinza-200); }
.avatar-grande { width: 72px; height: 72px; border-radius: 50%; background: var(--verde-claro); color: var(--verde); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 600; flex-shrink: 0; }
.perfil-nome { font-size: 1.3rem; margin-bottom: 6px; }
.perfil-form { display: flex; flex-direction: column; gap: 16px; }
.form-section-title { font-size: 0.85rem; font-weight: 500; color: var(--cinza-500); text-transform: uppercase; letter-spacing: 0.05em; padding-top: 8px; border-top: 1px solid var(--cinza-200); }
.cep-wrapper { position: relative; }
.cep-wrapper .spinner { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); }
.perfil-actions { display: flex; justify-content: flex-end; margin-top: 8px; }

.info-conta { }
.info-linha { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--cinza-200); font-size: 0.85rem; }
.info-linha:last-child { border-bottom: none; }
.info-linha span:first-child { color: var(--cinza-500); }

@media (max-width: 900px) {
  .perfil-grid { grid-template-columns: 1fr; }
}
</style>
