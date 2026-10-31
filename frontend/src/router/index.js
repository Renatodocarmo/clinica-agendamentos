import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

const routes = [
  { path: '/', redirect: '/dashboard' },
  {
    path: '/login',
    component: () => import('../views/LoginView.vue'),
    meta: { publico: true }
  },
  {
    path: '/registro',
    component: () => import('../views/RegistroView.vue'),
    meta: { publico: true }
  },
  {
    path: '/dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requerAuth: true }
  },
  {
    path: '/agendamentos',
    component: () => import('../views/AgendamentosView.vue'),
    meta: { requerAuth: true }
  },
  {
    path: '/agendamentos/novo',
    component: () => import('../views/NovoAgendamentoView.vue'),
    meta: { requerAuth: true }
  },
  {
    path: '/perfil',
    component: () => import('../views/PerfilView.vue'),
    meta: { requerAuth: true }
  },
  {
    path: '/admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requerAuth: true, requerAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('../views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requerAuth && !auth.autenticado) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }
  if (to.meta.publico && auth.autenticado) {
    return next('/dashboard')
  }
  if (to.meta.requerAdmin && !auth.isAdmin) {
    return next('/dashboard')
  }
  next()
})

export default router
