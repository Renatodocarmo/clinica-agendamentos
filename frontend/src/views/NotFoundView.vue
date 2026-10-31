<template>
  <div class="not-found">
    <div class="nf-content">
      <div class="nf-code">404</div>
      <h1>Página não encontrada</h1>
      <p>A página que você procura não existe ou foi removida.</p>
      <router-link to="/dashboard" class="btn btn-primary btn-lg" style="margin-top:24px">
        Voltar ao início
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--cinza-100); }
.nf-content { text-align: center; padding: 40px; }
.nf-code { font-size: 7rem; font-weight: 700; color: var(--cinza-300); line-height: 1; margin-bottom: 16px; font-family: var(--fonte-serif); }
h1 { font-size: 1.5rem; color: var(--cinza-900); margin-bottom: 8px; }
p { color: var(--cinza-500); }
</style>
