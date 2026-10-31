# ClinicaFácil — Sistema de Agendamento de Consultas

Sistema web completo para gerenciamento de agendamentos em clínicas médicas, desenvolvido com Vue.js no frontend e Node.js + Express no backend.

---

## Funcionalidades

- **Autenticação JWT** — Cadastro e login seguro com tokens JWT, proteção de rotas e controle de perfis (paciente, secretário, admin)
- **Agendamento de Consultas** — Agendamento com verificação de horários disponíveis em tempo real, evitando conflitos
- **Consulta de CEP (ViaCEP)** — Preenchimento automático de endereço ao informar o CEP
- **Previsão do Tempo (OpenWeatherMap)** — Alerta automático se houver previsão de chuva no dia da consulta
- **Painel Administrativo** — Dashboard com estatísticas, gerenciamento de usuários e relatórios por especialidade/status

---

## Tecnologias

### Backend
| Tecnologia | Uso |
|---|---|
| Node.js + Express | Servidor HTTP e roteamento |
| MongoDB + Mongoose | Banco de dados |
| JWT (jsonwebtoken) | Autenticação |
| bcryptjs | Hash de senhas |
| express-validator | Validação de dados |
| express-rate-limit | Proteção contra abuso |
| node-fetch | Integração com APIs externas |

### Frontend
| Tecnologia | Uso |
|---|---|
| Vue 3 (Composition API) | Interface reativa |
| Vue Router 4 | Navegação entre telas |
| Pinia | Gerenciamento de estado global |
| Axios | Requisições HTTP |
| Vite | Build e servidor de desenvolvimento |

### APIs Externas
- **ViaCEP** — `https://viacep.com.br/ws/{cep}/json/`
- **OpenWeatherMap** — `https://api.openweathermap.org/data/2.5/forecast`

---

## Instalação e Execução

### Pré-requisitos

- Node.js 18+
- MongoDB rodando localmente ou Atlas URI
- Chave de API do OpenWeatherMap (gratuita em [openweathermap.org](https://openweathermap.org/api))

### 1. Backend

```bash
cd backend
npm install

# Criar arquivo de configuração
cp .env.example .env
# Editar o .env com suas credenciais

npm run dev
# Servidor disponível em http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Interface disponível em http://localhost:5173
```

---

## Variáveis de Ambiente (backend/.env)

```env
PORT=3000
NODE_ENV=development

# MongoDB (local ou Atlas)
MONGODB_URI=mongodb://localhost:27017/clinica_db

# JWT (use uma chave longa e segura)
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=7d

# OpenWeatherMap
OPENWEATHER_API_KEY=sua_chave_aqui
OPENWEATHER_CITY=São Paulo
OPENWEATHER_COUNTRY=BR

# CORS
FRONTEND_URL=http://localhost:5173
```

---

## Estrutura do Projeto

```
clinica-agendamentos/
├── backend/
│   ├── src/
│   │   ├── config/          # Conexão com banco de dados
│   │   ├── controllers/     # Lógica de negócio
│   │   ├── middleware/      # Auth JWT, validações
│   │   ├── models/          # Schemas MongoDB
│   │   ├── routes/          # Rotas da API
│   │   └── utils/           # Serviço de clima
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── assets/          # CSS global
    │   ├── components/      # Componentes reutilizáveis
    │   ├── router/          # Rotas Vue Router
    │   ├── services/        # Axios configurado
    │   ├── store/           # Pinia (estado global)
    │   └── views/           # Páginas da aplicação
    └── package.json
```

---

## Endpoints da API

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/registro` | Cadastrar usuário |
| POST | `/api/auth/login` | Login e geração de token |
| GET | `/api/auth/perfil` | Dados do usuário autenticado |
| PUT | `/api/auth/perfil` | Atualizar dados do perfil |

### Agendamentos
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/agendamentos` | Listar agendamentos |
| POST | `/api/agendamentos` | Criar novo agendamento |
| GET | `/api/agendamentos/:id` | Buscar agendamento |
| PUT | `/api/agendamentos/:id` | Atualizar/cancelar |
| DELETE | `/api/agendamentos/:id` | Remover (admin) |
| GET | `/api/agendamentos/horarios-disponiveis` | Horários livres por médico/data |

### APIs Externas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/external/cep/:cep` | Buscar endereço por CEP |
| GET | `/api/external/clima?data=` | Previsão climática por data |

### Administrativo *(secretário/admin)*
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/admin/dashboard` | Estatísticas gerais |
| GET | `/api/admin/usuarios` | Listar usuários |
| PUT | `/api/admin/usuarios/:id` | Alterar perfil/status |
| GET | `/api/admin/relatorio` | Relatório por especialidade/status |

---

## Perfis de Acesso

| Perfil | Permissões |
|---|---|
| **paciente** | Ver/criar/cancelar próprios agendamentos, editar perfil |
| **secretario** | Tudo do paciente + ver todos agendamentos + dashboard admin |
| **admin** | Acesso completo incluindo gerenciamento de usuários |

---

## Deploy

### Backend — Railway / Render

1. Faça push do código para um repositório GitHub
2. Conecte o repositório ao serviço (Railway ou Render)
3. Configure as variáveis de ambiente no painel
4. O serviço detecta automaticamente Node.js e executa `npm start`

### Frontend — Vercel / Netlify

```bash
cd frontend
npm run build
# A pasta /dist está pronta para deploy
```

Configure a variável `VITE_API_URL` apontando para o backend em produção e ajuste o proxy no `vite.config.js`.

### MongoDB Atlas

1. Crie um cluster gratuito em [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Obtenha a connection string
3. Substitua `MONGODB_URI` no `.env` com a string do Atlas

---

## Segurança Implementada

- Senhas hasheadas com bcrypt (salt rounds: 12)
- Tokens JWT com expiração configurável
- Proteção de rotas por perfil (middleware de autorização)
- Rate limiting: 100 req/15min por IP
- Validação de entrada com express-validator
- CORS configurado para origem específica
- Campos sensíveis nunca retornados nas respostas

---

## Autor Renato do Carmo

Trabalho desenvolvido como projeto de Tecnologia em Desenvolvimento de Sistemas.

Sistema de Agendamento de Clínica Médica — Vue.js + Node.js + MongoDB
