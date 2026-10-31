<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">⚕</div>
      <div>
        <div class="logo-nome">ClinicaFácil</div>
        <div class="logo-sub">Sistema de Agendamento</div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/dashboard" class="nav-item" active-class="ativo">
        <span class="nav-icon">◫</span> Dashboard
      </router-link>
      <router-link to="/agendamentos" class="nav-item" active-class="ativo">
        <span class="nav-icon">◷</span> Agendamentos
      </router-link>
      <router-link to="/agendamentos/novo" class="nav-item" active-class="ativo">
        <span class="nav-icon">＋</span> Nova Consulta
      </router-link>
      <router-link v-if="auth.isAdmin" to="/admin" class="nav-item" active-class="ativo">
        <span class="nav-icon">◈</span> Painel Admin
      </router-link>
      <router-link to="/perfil" class="nav-item" active-class="ativo">
        <span class="nav-icon">◉</span> Meu Perfil
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="usuario-info">
        <div class="usuario-avatar">{{ iniciais }}</div>
        <div class="usuario-detalhe">
          <div class="usuario-nome">{{ auth.usuario?.nome?.split(' ')[0] }}</div>
          <div class="usuario-perfil">{{ labelPerfil }}</div>
        </div>
      </div>
      <button class="btn-logout" @click="sair" title="Sair">⏻</button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const auth = useAuthStore()
const router = useRouter()

const iniciais = computed(() => {
  const partes = auth.usuario?.nome?.split(' ') || []
  return (partes[0]?.[0] || '') + (partes[1]?.[0] || '')
})

const labelPerfil = computed(() => ({
  paciente: 'Paciente',
  secretario: 'Secretário(a)',
  admin: 'Administrador'
}[auth.usuario?.perfil] || ''))

const sair = () => {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar { display: flex; flex-direction: column; }

.sidebar-logo {
  display: flex; align-items: center; gap: 12px;
  padding: 24px 20px 20px; border-bottom: 1px solid var(--cinza-200);
}
.logo-icon { font-size: 1.8rem; }
.logo-nome { font-size: 1rem; font-weight: 600; color: var(--cinza-900); }
.logo-sub { font-size: 0.72rem; color: var(--cinza-500); margin-top: 1px; }

.sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: var(--radius-sm);
  font-size: 0.88rem; font-weight: 500; color: var(--cinza-700);
  text-decoration: none; transition: all var(--transition);
}
.nav-item:hover { background: var(--cinza-100); color: var(--cinza-900); }
.nav-item.ativo { background: var(--verde-claro); color: var(--verde); }
.nav-icon { font-size: 1rem; width: 18px; text-align: center; }

.sidebar-footer {
  padding: 16px; border-top: 1px solid var(--cinza-200);
  display: flex; align-items: center; gap: 10px;
}
.usuario-info { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.usuario-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--verde-claro); color: var(--verde);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 600; flex-shrink: 0;
}
.usuario-detalhe { min-width: 0; }
.usuario-nome { font-size: 0.85rem; font-weight: 500; color: var(--cinza-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.usuario-perfil { font-size: 0.72rem; color: var(--cinza-500); }
.btn-logout {
  background: none; border: none; cursor: pointer; font-size: 1.1rem;
  color: var(--cinza-500); padding: 6px; border-radius: var(--radius-sm);
  transition: all var(--transition);
}
.btn-logout:hover { background: var(--vermelho-claro); color: var(--vermelho); }
</style>
