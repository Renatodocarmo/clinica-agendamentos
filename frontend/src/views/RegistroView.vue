<template>
  <div class="auth-page">
    <div class="auth-left">
      <div class="auth-brand">
        <div class="brand-icon">⚕</div>
        <h1>Cadastre-se</h1>
        <p>Crie sua conta gratuitamente e agende consultas com facilidade e segurança.</p>
      </div>
    </div>

    <div class="auth-right">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Criar conta</h2>
          <p>Preencha seus dados para começar</p>
        </div>

        <div v-if="erro" class="alerta alerta-erro">{{ erro }}</div>

        <form @submit.prevent="registrar" class="auth-form">
          <div class="form-group">
            <label class="form-label">Nome completo *</label>
            <input v-model="form.nome" type="text" class="form-input" placeholder="João da Silva" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">E-mail *</label>
              <input v-model="form.email" type="email" class="form-input" placeholder="seu@email.com" required />
            </div>
            <div class="form-group">
              <label class="form-label">Telefone</label>
              <input v-model="form.telefone" type="tel" class="form-input" placeholder="(11) 99999-9999" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">CPF</label>
              <input v-model="form.cpf" type="text" class="form-input" placeholder="000.000.000-00" />
            </div>
            <div class="form-group">
              <label class="form-label">Data de nascimento</label>
              <input v-model="form.dataNascimento" type="date" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">CEP (endereço)</label>
            <div class="cep-wrapper">
              <input v-model="form.cep" type="text" class="form-input" placeholder="00000-000" maxlength="9" @blur="buscarCEP" />
              <span v-if="buscandoCEP" class="spinner spinner-verde"></span>
            </div>
            <div v-if="enderecoEncontrado" class="endereco-preview">
              📍 {{ enderecoEncontrado }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Senha *</label>
            <input v-model="form.senha" type="password" class="form-input" placeholder="Mínimo 6 caracteres" required minlength="6" />
          </div>

          <button type="submit" class="btn btn-primary btn-full btn-lg" :disabled="auth.carregando">
            <span v-if="auth.carregando" class="spinner"></span>
            <span v-else>Criar conta</span>
          </button>
        </form>

        <div class="auth-footer">
          Já tem conta?
          <router-link to="/login">Entrar</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import api from '../services/api'

const auth = useAuthStore()
const router = useRouter()
const erro = ref(null)
const buscandoCEP = ref(false)
const enderecoEncontrado = ref('')

const form = ref({
  nome: '', email: '', senha: '', telefone: '', cpf: '',
  dataNascimento: '', cep: ''
})

const buscarCEP = async () => {
  const cep = form.value.cep?.replace(/\D/g, '')
  if (cep?.length !== 8) return
  buscandoCEP.value = true
  try {
    const { data } = await api.get(`/external/cep/${cep}`)
    enderecoEncontrado.value = `${data.logradouro}, ${data.bairro} — ${data.cidade}/${data.estado}`
    form.value.endereco = data
  } catch {
    enderecoEncontrado.value = ''
  } finally {
    buscandoCEP.value = false
  }
}

const registrar = async () => {
  erro.value = null
  const payload = { ...form.value }
  if (form.value.cep) {
    payload.cep = form.value.cep
  }
  const r = await auth.registrar(payload)
  if (r.sucesso) router.push('/dashboard')
  else erro.value = r.erro
}
</script>

<style scoped>
.auth-page { display: flex; min-height: 100vh; }
.auth-left {
  width: 320px; background: var(--verde); padding: 60px 40px;
  display: flex; flex-direction: column; justify-content: center; color: #fff;
}
.auth-brand { }
.brand-icon { font-size: 3rem; margin-bottom: 16px; }
.auth-brand h1 { font-family: var(--fonte-serif); font-size: 2.2rem; color: #fff; margin-bottom: 16px; }
.auth-brand p { font-size: 0.9rem; opacity: 0.85; line-height: 1.7; }

.auth-right {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 40px; background: var(--cinza-100); overflow-y: auto;
}
.auth-card { background: var(--branco); border-radius: var(--radius-xl); padding: 40px; width: 100%; max-width: 560px; box-shadow: var(--sombra-lg); }
.auth-header { margin-bottom: 28px; }
.auth-header h2 { font-size: 1.5rem; }
.auth-header p { color: var(--cinza-500); font-size: 0.9rem; }
.auth-form { display: flex; flex-direction: column; gap: 16px; }
.cep-wrapper { position: relative; }
.cep-wrapper .spinner { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); }
.endereco-preview { font-size: 0.82rem; color: var(--verde); background: var(--verde-claro); padding: 6px 10px; border-radius: var(--radius-sm); margin-top: 6px; }
.auth-footer { margin-top: 20px; text-align: center; font-size: 0.88rem; color: var(--cinza-500); }
.auth-footer a { color: var(--verde); font-weight: 500; text-decoration: none; }

@media (max-width: 768px) {
  .auth-left { display: none; }
}
</style>
