const { validationResult } = require('express-validator');
const Agendamento = require('../models/Agendamento');
const { buscarClima } = require('../utils/climaService');

// Horários disponíveis
const HORARIOS_DISPONIVEIS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

// GET /api/agendamentos/horarios-disponiveis
const horariosDisponiveis = async (req, res) => {
  try {
    const { medico, data } = req.query;
    if (!medico || !data) {
      return res.status(400).json({ error: 'Médico e data são obrigatórios.' });
    }

    const dataConsulta = new Date(data);
    const inicioDia = new Date(dataConsulta.setHours(0, 0, 0, 0));
    const fimDia = new Date(dataConsulta.setHours(23, 59, 59, 999));

    const agendados = await Agendamento.find({
      medico,
      data: { $gte: inicioDia, $lte: fimDia },
      status: { $ne: 'cancelado' }
    }).select('horario');

    const horariosOcupados = agendados.map(a => a.horario);
    const horariosLivres = HORARIOS_DISPONIVEIS.filter(h => !horariosOcupados.includes(h));

    res.json({ horariosDisponiveis: horariosLivres, horariosOcupados });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar horários.' });
  }
};

// POST /api/agendamentos
const criar = async (req, res) => {
  try {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ errors: erros.array() });
    }

    const { medico, especialidade, data, horario, observacoes } = req.body;

    // Verificar disponibilidade
    const conflito = await Agendamento.findOne({
      medico,
      data: new Date(data),
      horario,
      status: { $ne: 'cancelado' }
    });

    if (conflito) {
      return res.status(409).json({
        error: 'Horário indisponível. Por favor, escolha outro horário.'
      });
    }

    // Buscar previsão do tempo
    let clima = null;
    try {
      clima = await buscarClima(new Date(data));
    } catch (e) {
      console.log('Clima não disponível:', e.message);
    }

    const agendamento = await Agendamento.create({
      paciente: req.usuario._id,
      medico,
      especialidade,
      data: new Date(data),
      horario,
      observacoes,
      previsaoClimatica: clima,
      criadoPor: req.usuario._id
    });

    await agendamento.populate('paciente', 'nome email telefone');

    res.status(201).json({
      message: 'Consulta agendada com sucesso!',
      agendamento,
      alertaChuva: clima?.temChuva
        ? '⚠️ Previsão de chuva para o dia da consulta. Saia com antecedência!'
        : null
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Horário já ocupado.' });
    }
    res.status(500).json({ error: 'Erro ao criar agendamento.' });
  }
};

// GET /api/agendamentos
const listar = async (req, res) => {
  try {
    const { pagina = 1, limite = 10, status, dataInicio, dataFim } = req.query;
    const filtro = {};

    // Paciente só vê seus próprios agendamentos
    if (req.usuario.perfil === 'paciente') {
      filtro.paciente = req.usuario._id;
    }

    if (status) filtro.status = status;
    if (dataInicio || dataFim) {
      filtro.data = {};
      if (dataInicio) filtro.data.$gte = new Date(dataInicio);
      if (dataFim) filtro.data.$lte = new Date(dataFim);
    }

    const total = await Agendamento.countDocuments(filtro);
    const agendamentos = await Agendamento.find(filtro)
      .populate('paciente', 'nome email telefone cpf')
      .sort({ data: 1, horario: 1 })
      .skip((pagina - 1) * limite)
      .limit(Number(limite));

    res.json({
      agendamentos,
      paginacao: {
        total,
        pagina: Number(pagina),
        limite: Number(limite),
        totalPaginas: Math.ceil(total / limite)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar agendamentos.' });
  }
};

// GET /api/agendamentos/:id
const buscarPorId = async (req, res) => {
  try {
    const agendamento = await Agendamento.findById(req.params.id)
      .populate('paciente', 'nome email telefone cpf dataNascimento endereco');

    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }

    // Paciente só pode ver o próprio agendamento
    if (
      req.usuario.perfil === 'paciente' &&
      agendamento.paciente._id.toString() !== req.usuario._id.toString()
    ) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    res.json({ agendamento });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamento.' });
  }
};

// PUT /api/agendamentos/:id
const atualizar = async (req, res) => {
  try {
    const agendamento = await Agendamento.findById(req.params.id);
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }

    // Paciente só pode cancelar o próprio agendamento
    if (req.usuario.perfil === 'paciente') {
      if (agendamento.paciente.toString() !== req.usuario._id.toString()) {
        return res.status(403).json({ error: 'Acesso negado.' });
      }
      if (req.body.status && req.body.status !== 'cancelado') {
        return res.status(403).json({ error: 'Paciente só pode cancelar consultas.' });
      }
    }

    const camposAtualizaveis = ['status', 'observacoes', 'medico', 'especialidade', 'data', 'horario'];
    camposAtualizaveis.forEach(campo => {
      if (req.body[campo] !== undefined) {
        agendamento[campo] = req.body[campo];
      }
    });

    await agendamento.save();
    await agendamento.populate('paciente', 'nome email telefone');

    res.json({ message: 'Agendamento atualizado!', agendamento });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar agendamento.' });
  }
};

// DELETE /api/agendamentos/:id (apenas admin/secretario)
const deletar = async (req, res) => {
  try {
    const agendamento = await Agendamento.findByIdAndDelete(req.params.id);
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }
    res.json({ message: 'Agendamento removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar agendamento.' });
  }
};

module.exports = { criar, listar, buscarPorId, atualizar, deletar, horariosDisponiveis };
