import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref(JSON.parse(localStorage.getItem('usuario') || 'null'))
  const token = ref(localStorage.getItem('token') || null)
  const carregando = ref(false)
  const erro = ref(null)

  const autenticado = computed(() => !!token.value)
  const isAdmin = computed(() => ['admin', 'secretario'].includes(usuario.value?.perfil))

  const login = async (email, senha) => {
    carregando.value = true
    erro.value = null
    try {
      const { data } = await api.post('/auth/login', { email, senha })
      token.value = data.token
      usuario.value = data.usuario
      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      return { sucesso: true }
    } catch (e) {
      erro.value = e.response?.data?.error || 'Erro ao fazer login.'
      return { sucesso: false, erro: erro.value }
    } finally {
      carregando.value = false
    }
  }

  const registrar = async (dados) => {
    carregando.value = true
    erro.value = null
    try {
      const { data } = await api.post('/auth/registro', dados)
      token.value = data.token
      usuario.value = data.usuario
      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      return { sucesso: true }
    } catch (e) {
      const msg = e.response?.data?.errors?.[0]?.msg || e.response?.data?.error || 'Erro ao registrar.'
      erro.value = msg
      return { sucesso: false, erro: msg }
    } finally {
      carregando.value = false
    }
  }

  const logout = () => {
    token.value = null
    usuario.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  const atualizarPerfil = async (dados) => {
    const { data } = await api.put('/auth/perfil', dados)
    usuario.value = data.usuario
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    return data
  }

  return { usuario, token, carregando, erro, autenticado, isAdmin, login, registrar, logout, atualizarPerfil }
})
