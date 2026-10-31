/**
 * Testes de agendamento — criar, listar, atualizar, cancelar
 */
require('./setup');
const request = require('supertest');
const app = require('../src/server');

const registrarELogar = async (dados = {}) => {
  const payload = {
    nome: dados.nome || 'Usuário Teste',
    email: dados.email || `user${Date.now()}@teste.com`,
    senha: dados.senha || 'senha123',
    ...dados
  };
  const res = await request(app).post('/api/auth/registro').send(payload);
  return { token: res.body.token, usuario: res.body.usuario };
};

const amanha = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

describe('POST /api/agendamentos', () => {
  let token;

  beforeEach(async () => {
    ({ token } = await registrarELogar({ email: 'paciente@teste.com' }));
  });

  it('deve criar agendamento com dados válidos', async () => {
    const res = await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        medico: 'Dr. Carlos Mendes',
        especialidade: 'Clínico Geral',
        data: amanha(),
        horario: '09:00'
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('agendamento');
    expect(res.body.agendamento.status).toBe('agendado');
  });

  it('deve retornar erro 400 para data no passado', async () => {
    const res = await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        medico: 'Dr. Carlos Mendes',
        especialidade: 'Clínico Geral',
        data: '2020-01-01',
        horario: '09:00'
      });
    expect(res.status).toBe(400);
  });

  it('deve retornar erro 400 para horário inválido', async () => {
    const res = await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        medico: 'Dr. Carlos Mendes',
        especialidade: 'Clínico Geral',
        data: amanha(),
        horario: '25:00'
      });
    expect(res.status).toBe(400);
  });

  it('deve retornar erro 409 para conflito de horário', async () => {
    const corpo = {
      medico: 'Dra. Ana Rodrigues',
      especialidade: 'Cardiologia',
      data: amanha(),
      horario: '14:00'
    };
    await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send(corpo);

    const { token: token2 } = await registrarELogar({ email: 'outro@teste.com' });
    const res = await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${token2}`)
      .send(corpo);
    expect(res.status).toBe(409);
  });

  it('deve retornar 401 sem autenticação', async () => {
    const res = await request(app)
      .post('/api/agendamentos')
      .send({ medico: 'Dr. X', especialidade: 'Clínico Geral', data: amanha(), horario: '10:00' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/agendamentos', () => {
  let token, token2;

  beforeEach(async () => {
    ({ token } = await registrarELogar({ email: 'lista1@teste.com' }));
    ({ token: token2 } = await registrarELogar({ email: 'lista2@teste.com' }));

    await request(app).post('/api/agendamentos').set('Authorization', `Bearer ${token}`)
      .send({ medico: 'Dr. A', especialidade: 'Clínico Geral', data: amanha(), horario: '08:00' });
    await request(app).post('/api/agendamentos').set('Authorization', `Bearer ${token}`)
      .send({ medico: 'Dr. B', especialidade: 'Cardiologia', data: amanha(), horario: '09:00' });
    await request(app).post('/api/agendamentos').set('Authorization', `Bearer ${token2}`)
      .send({ medico: 'Dr. C', especialidade: 'Ortopedia', data: amanha(), horario: '10:00' });
  });

  it('paciente deve ver apenas seus próprios agendamentos', async () => {
    const res = await request(app).get('/api/agendamentos').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.agendamentos).toHaveLength(2);
  });

  it('deve suportar filtro por status', async () => {
    const res = await request(app)
      .get('/api/agendamentos?status=agendado')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    res.body.agendamentos.forEach(a => expect(a.status).toBe('agendado'));
  });

  it('deve retornar paginação correta', async () => {
    const res = await request(app)
      .get('/api/agendamentos?pagina=1&limite=1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.agendamentos).toHaveLength(1);
    expect(res.body.paginacao.total).toBe(2);
  });
});

describe('PUT /api/agendamentos/:id (cancelar)', () => {
  let token, agendamentoId;

  beforeEach(async () => {
    ({ token } = await registrarELogar({ email: 'cancela@teste.com' }));
    const res = await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({ medico: 'Dr. Cancel', especialidade: 'Clínico Geral', data: amanha(), horario: '11:00' });
    agendamentoId = res.body.agendamento._id;
  });

  it('paciente deve conseguir cancelar o próprio agendamento', async () => {
    const res = await request(app)
      .put(`/api/agendamentos/${agendamentoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'cancelado' });
    expect(res.status).toBe(200);
    expect(res.body.agendamento.status).toBe('cancelado');
  });

  it('paciente não deve alterar status para "realizado"', async () => {
    const res = await request(app)
      .put(`/api/agendamentos/${agendamentoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'realizado' });
    expect(res.status).toBe(403);
  });

  it('outro paciente não deve cancelar agendamento alheio', async () => {
    const { token: tokenOutro } = await registrarELogar({ email: 'outro2@teste.com' });
    const res = await request(app)
      .put(`/api/agendamentos/${agendamentoId}`)
      .set('Authorization', `Bearer ${tokenOutro}`)
      .send({ status: 'cancelado' });
    expect(res.status).toBe(403);
  });
});

describe('GET /api/agendamentos/horarios-disponiveis', () => {
  let token;

  beforeEach(async () => {
    ({ token } = await registrarELogar({ email: 'horarios@teste.com' }));
    await request(app).post('/api/agendamentos').set('Authorization', `Bearer ${token}`)
      .send({ medico: 'Dr. Horario', especialidade: 'Clínico Geral', data: amanha(), horario: '09:00' });
  });

  it('deve retornar horários livres excluindo o ocupado', async () => {
    const res = await request(app)
      .get(`/api/agendamentos/horarios-disponiveis?medico=Dr. Horario&data=${amanha()}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.horariosDisponiveis).not.toContain('09:00');
    expect(res.body.horariosOcupados).toContain('09:00');
  });

  it('deve exigir parâmetros médico e data', async () => {
    const res = await request(app)
      .get('/api/agendamentos/horarios-disponiveis')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});
