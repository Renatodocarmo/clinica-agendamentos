# ✅ Checklist de Entrega — ClinicaFácil

## 1. Planejamento do Projeto

- [x] Definição das funcionalidades principais
- [x] Criação do escopo documentado (README.md)
- [x] Protótipo de telas implementado (telas funcionais Vue.js)
- [x] Diagrama de arquitetura (docs/arquitetura.html)
- [x] Documentação de API (docs/swagger.yaml — OpenAPI 3.0)

---

## 2. Configuração do Backend (Node.js + Express)

- [x] Estruturação de rotas com Express Router
- [x] Controllers separados por domínio (auth, agendamentos, admin)
- [x] Models Mongoose (Usuario, Agendamento)
- [x] Endpoint `POST /api/auth/registro` — cadastro de usuários
- [x] Endpoint `POST /api/auth/login` — autenticação
- [x] Endpoints `GET/POST/PUT /api/agendamentos` — gestão de consultas
- [x] Endpoint `GET /api/agendamentos/horarios-disponiveis` — verificação de conflitos
- [x] Endpoints `/api/admin/*` — painel administrativo
- [x] Integração com MongoDB via Mongoose (com índices e validações)
- [x] Rate limiting (express-rate-limit): 100 req/15min
- [x] Health check endpoint `GET /api/health`

---

## 3. Implementação de Autenticação JWT

- [x] Geração de token JWT no login/registro
- [x] Middleware `autenticar()` — verifica e decodifica token em rotas protegidas
- [x] Middleware `autorizar(...perfis)` — controle de acesso por perfil
- [x] Hash de senhas com bcrypt (salt rounds: 12)
- [x] Token com expiração configurável (padrão: 7 dias)
- [x] Remoção automática do campo `senha` nas respostas (`toJSON`)
- [x] Tratamento de token expirado vs. token inválido

---

## 4. Integração com APIs Externas

### ViaCEP
- [x] Endpoint `GET /api/external/cep/:cep`
- [x] Validação de CEP (8 dígitos numéricos)
- [x] Preenchimento automático no cadastro de usuário
- [x] Preenchimento automático no formulário de perfil

### OpenWeatherMap
- [x] Endpoint `GET /api/external/clima?data=`
- [x] Serviço `climaService.js` com lógica de forecast
- [x] Detecção de chuva (Rain, Drizzle, Thunderstorm)
- [x] Alerta de chuva retornado no `POST /agendamentos`
- [x] Falha silenciosa (agendamento prossegue sem clima se API falhar)
- [x] Clima armazenado junto ao agendamento no banco

---

## 5. Criação do Frontend com Vue.js

### Autenticação
- [x] `LoginView.vue` — formulário de login com feedback de erro
- [x] `RegistroView.vue` — cadastro com busca automática de CEP
- [x] Pinia Store (`store/auth.js`) — estado global de autenticação
- [x] Interceptor Axios — injeta token JWT automaticamente
- [x] Guardas de navegação Vue Router — redireciona não autenticados

### Agendamento
- [x] `NovoAgendamentoView.vue` — seleção de médico, data, horário e clima
- [x] Grid de horários disponíveis com atualização em tempo real
- [x] Exibição de previsão climática inline
- [x] Alerta visual de chuva no formulário

### Painel e Listagem
- [x] `AgendamentosView.vue` — tabela com filtros, paginação e modal de edição
- [x] `DashboardView.vue` — resumo, stats (admin) e próximas consultas
- [x] `AdminView.vue` — tabs: Dashboard / Usuários / Relatórios
- [x] `PerfilView.vue` — edição de dados com busca de CEP

### Componentes Reutilizáveis
- [x] `Sidebar.vue` — navegação com controle de perfil e logout
- [x] `LoadingSpinner.vue` — indicador de carregamento
- [x] `AlertaBanner.vue` — alertas com transição e fechamento
- [x] `StatusBadge.vue` — badge de status consistente

### Outros
- [x] `NotFoundView.vue` — página 404
- [x] CSS global com design system completo (variáveis, botões, forms, tabelas)
- [x] Layout responsivo (mobile-friendly)
- [x] Transições de rota com Vue `<transition>`

---

## 6. Testes Automatizados

- [x] `tests/auth.test.js` — 10 testes de registro e login
- [x] `tests/agendamentos.test.js` — 9 testes de criação, listagem e cancelamento
- [x] `tests/admin.test.js` — 6 testes de rotas admin e APIs externas
- [x] `tests/setup.js` — banco em memória com mongodb-memory-server
- [x] Cobertura mínima configurada (70% linhas/funções)

---

## 7. Documentação e Entrega Final

- [x] `README.md` — instruções completas de instalação, uso e deploy
- [x] `docs/swagger.yaml` — documentação OpenAPI 3.0 de todos os endpoints
- [x] `docs/arquitetura.html` — diagrama interativo de arquitetura do sistema
- [x] `CHECKLIST.md` — este arquivo de verificação de requisitos
- [x] `seed.js` — script para popular banco com dados de demonstração
- [x] `.env.example` — template de configuração (backend e frontend)
- [x] `.gitignore` — exclusão de node_modules, .env, dist

---

## 8. DevOps e Deploy

- [x] `backend/Dockerfile` — imagem Node.js 18 Alpine com usuário não-root
- [x] `frontend/Dockerfile` — build multi-stage com Nginx
- [x] `frontend/nginx.conf` — proxy reverso + roteamento SPA
- [x] `docker-compose.yml` — orquestração (mongo + backend + frontend)
- [x] `Makefile` — comandos utilitários (install, dev, test, docker, seed)

---

## Tecnologias Utilizadas

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | Vue.js | 3.3 |
| Estado | Pinia | 2.1 |
| Roteamento | Vue Router | 4.2 |
| HTTP Client | Axios | 1.4 |
| Build | Vite | 4.4 |
| Backend | Node.js + Express | 18 / 4.18 |
| Banco | MongoDB + Mongoose | 7 |
| Auth | JWT + bcryptjs | 9 / 2.4 |
| Validação | express-validator | 7.0 |
| Testes | Jest + Supertest | 29 / 6.3 |
| DB Testes | mongodb-memory-server | 9.0 |
| Container | Docker + Compose | — |
| Servidor | Nginx | Alpine |
| API CEP | ViaCEP | — |
| API Clima | OpenWeatherMap | 2.5 |
