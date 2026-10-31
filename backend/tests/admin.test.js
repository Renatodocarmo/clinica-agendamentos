/**
 * Testes das rotas administrativas e APIs externas
 */
require('./setup');
const request = require('supertest');
const app = require('../src/server');

const criarUsuario = async (perfil = 'paciente', emailSuffix = '') => {
  const email = `${perfil}${emailSuffix}${Date.now()}@teste.com`;
  const res = await request(app).post('/api/auth/registro').send({
    nome: `Usuário ${perfil}`,
    email,
    senha: 'senha123'
  });
  // Para admin/secretario, forçamos via banco diretamente
  return { token: res.body.token, id: res.body.usuario._id, email };
};

describe('GET /api/admin/dashboard', () => {
  it('deve retornar 403 para paciente comum', async () => {
    const { token } = await criarUsuario('paciente', 'dash');
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('deve retornar 401 sem autenticação', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/external/cep/:cep', () => {
  let token;

  beforeAll(async () => {
    const { token: t } = await criarUsuario('paciente', 'cep');
    token = t;
  });

  it('deve retornar erro 400 para CEP com menos de 8 dígitos', async () => {
    const res = await request(app)
      .get('/api/external/cep/1234567')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it('deve retornar erro 400 para CEP com letras', async () => {
    const res = await request(app)
      .get('/api/external/cep/ABCDE123')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it('deve exigir autenticação', async () => {
    const res = await request(app).get('/api/external/cep/01310100');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/external/clima', () => {
  let token;

  beforeAll(async () => {
    const { token: t } = await criarUsuario('paciente', 'clima');
    token = t;
  });

  it('deve retornar erro 400 sem parâmetro data', async () => {
    const res = await request(app)
      .get('/api/external/clima')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it('deve retornar resposta válida com data fornecida (API key pode ser inválida em testes)', async () => {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const res = await request(app)
      .get(`/api/external/clima?data=${amanha.toISOString().split('T')[0]}`)
      .set('Authorization', `Bearer ${token}`);
    // Sem API key real, retorna disponivel: false — mas não deve quebrar
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('disponivel');
  });

  it('deve exigir autenticação', async () => {
    const res = await request(app).get('/api/external/clima?data=2025-01-01');
    expect(res.status).toBe(401);
  });
});

describe('Health check', () => {
  it('GET /api/health deve retornar status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});
