/**
 * Testes de autenticação — registro, login, perfil
 */
require('./setup');
const request = require('supertest');
const app = require('../src/server');

describe('POST /api/auth/registro', () => {
  const dadosValidos = {
    nome: 'João Teste',
    email: 'joao@teste.com',
    senha: 'senha123'
  };

  it('deve registrar um novo usuário com dados válidos', async () => {
    const res = await request(app).post('/api/auth/registro').send(dadosValidos);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.usuario.email).toBe('joao@teste.com');
    expect(res.body.usuario).not.toHaveProperty('senha');
  });

  it('deve retornar erro 400 para email inválido', async () => {
    const res = await request(app).post('/api/auth/registro').send({ ...dadosValidos, email: 'email-invalido' });
    expect(res.status).toBe(400);
  });

  it('deve retornar erro 400 para senha curta (< 6 chars)', async () => {
    const res = await request(app).post('/api/auth/registro').send({ ...dadosValidos, senha: '123' });
    expect(res.status).toBe(400);
  });

  it('deve retornar erro 409 para email duplicado', async () => {
    await request(app).post('/api/auth/registro').send(dadosValidos);
    const res = await request(app).post('/api/auth/registro').send(dadosValidos);
    expect(res.status).toBe(409);
  });

  it('deve criar usuário com perfil padrão "paciente"', async () => {
    const res = await request(app).post('/api/auth/registro').send(dadosValidos);
    expect(res.body.usuario.perfil).toBe('paciente');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/registro').send({
      nome: 'Maria Login',
      email: 'maria@teste.com',
      senha: 'senha456'
    });
  });

  it('deve realizar login com credenciais corretas', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'maria@teste.com', senha: 'senha456' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.usuario.email).toBe('maria@teste.com');
  });

  it('deve retornar erro 401 para senha incorreta', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'maria@teste.com', senha: 'senhaErrada' });
    expect(res.status).toBe(401);
  });

  it('deve retornar erro 401 para email inexistente', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'naoexiste@teste.com', senha: 'qualquer' });
    expect(res.status).toBe(401);
  });

  it('o token retornado deve ser um JWT válido', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'maria@teste.com', senha: 'senha456' });
    const partes = res.body.token.split('.');
    expect(partes).toHaveLength(3); // header.payload.signature
  });
});

describe('GET /api/auth/perfil', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/registro').send({
      nome: 'Pedro Perfil',
      email: 'pedro@teste.com',
      senha: 'senha789'
    });
    token = res.body.token;
  });

  it('deve retornar dados do perfil com token válido', async () => {
    const res = await request(app)
      .get('/api/auth/perfil')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.usuario.email).toBe('pedro@teste.com');
  });

  it('deve retornar 401 sem token', async () => {
    const res = await request(app).get('/api/auth/perfil');
    expect(res.status).toBe(401);
  });

  it('deve retornar 401 com token inválido', async () => {
    const res = await request(app)
      .get('/api/auth/perfil')
      .set('Authorization', 'Bearer token.invalido.aqui');
    expect(res.status).toBe(401);
  });
});
