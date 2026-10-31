<template>
  <div class="auth-page">
    <div class="auth-left">
      <div class="auth-brand">
        <div class="brand-icon">⚕</div>
        <h1>ClinicaFácil</h1>
        <p>Sistema inteligente de agendamento de consultas médicas com integração de clima e endereço automático.</p>
      </div>
      <div class="auth-features">
        <div class="feature"><span>✓</span> Agendamento online 24h</div>
        <div class="feature"><span>✓</span> Alerta de clima para sua consulta</div>
        <div class="feature"><span>✓</span> Histórico completo de atendimentos</div>
        <div class="feature"><span>✓</span> Acesso seguro com JWT</div>
      </div>
    </div>

    <div class="auth-right">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Entrar na conta</h2>
          <p>Bem-vindo(a) de volta!</p>
        </div>

        <div v-if="erro" class="alerta alerta-erro">{{ erro }}</div>

        <form @submit.prevent="entrar" class="auth-form">
          <div class="form-group">
            <label class="form-label">E-mail</label>
            <input v-model="form.email" type="email" class="form-input" placeholder="seu@email.com" required />
          </div>
          <div class="form-group">
            <label class="form-label">Senha</label>
            <div class="input-senha">
              <input v-model="form.senha" :type="mostrarSenha ? 'text' : 'password'" class="form-input" placeholder="••••••" required />
              <button type="button" class="toggle-senha" @click="mostrarSenha = !mostrarSenha">
                {{ mostrarSenha ? '🙈' : '👁' }}
              </button>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-full btn-lg" :disabled="auth.carregando">
            <span v-if="auth.carregando" class="spinner"></span>
            <span v-else>Entrar</span>
          </button>
        </form>

        <div class="auth-footer">
          Não tem conta?
          <router-link to="/registro">Cadastre-se grátis</router-link>
        </div>

        <div class="demo-info">
          <p><strong>Demo:</strong> admin@clinica.com / admin123</p>
          <p>secretaria@clinica.com / sec123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const auth = useAuthStore()
const router = useRouter()
const mostrarSenha = ref(false)
const erro = ref(null)
const form = ref({ email: '', senha: '' })

const entrar = async () => {
  erro.value = null
  const r = await auth.login(form.value.email, form.value.senha)
  if (r.sucesso) router.push('/dashboard')
  else erro.value = r.erro
}
</script>

<style scoped>
.auth-page { display: flex; min-height: 100vh; }
.auth-left {
  flex: 1; background: var(--verde); padding: 60px 48px;
  display: flex; flex-direction: column; justify-content: center;
  color: #fff;
}
.auth-brand { margin-bottom: 48px; }
.brand-icon { font-size: 3.5rem; margin-bottom: 16px; }
.auth-brand h1 { font-family: var(--fonte-serif); font-size: 2.8rem; color: #fff; margin-bottom: 16px; }
.auth-brand p { font-size: 1rem; opacity: 0.85; line-height: 1.7; max-width: 340px; }
.auth-features { display: flex; flex-direction: column; gap: 12px; }
.feature { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; opacity: 0.9; }
.feature span { background: rgba(255,255,255,0.2); border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0; }

.auth-right {
  width: 480px; display: flex; align-items: center;
  justify-content: center; padding: 40px; background: var(--cinza-100);
}
.auth-card { background: var(--branco); border-radius: var(--radius-xl); padding: 40px; width: 100%; box-shadow: var(--sombra-lg); border: 1px solid var(--cinza-200); }
.auth-header { margin-bottom: 28px; }
.auth-header h2 { font-size: 1.5rem; color: var(--cinza-900); }
.auth-header p { color: var(--cinza-500); font-size: 0.9rem; margin-top: 4px; }
.auth-form { display: flex; flex-direction: column; gap: 18px; }
.input-senha { position: relative; }
.input-senha .form-input { padding-right: 44px; }
.toggle-senha {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; font-size: 1rem; padding: 4px;
}
.auth-footer { margin-top: 20px; text-align: center; font-size: 0.88rem; color: var(--cinza-500); }
.auth-footer a { color: var(--verde); font-weight: 500; text-decoration: none; }
.auth-footer a:hover { text-decoration: underline; }
.demo-info { margin-top: 20px; padding: 12px; background: var(--cinza-100); border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--cinza-500); }
.demo-info p { margin: 2px 0; }

@media (max-width: 900px) {
  .auth-left { display: none; }
  .auth-right { width: 100%; padding: 24px; }
}
</style>
