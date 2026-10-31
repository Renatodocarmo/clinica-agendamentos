const router = require('express').Router();
const { autenticar, autorizar } = require('../middleware/auth');
const Usuario = require('../models/Usuario');
const Agendamento = require('../models/Agendamento');

// Todas as rotas admin requerem autenticação e perfil adequado
router.use(autenticar, autorizar('admin', 'secretario'));

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const [
      totalPacientes,
      totalAgendamentosHoje,
      agendamentosPendentes,
      agendamentosRealizados,
      agendamentosCancelados,
      proximasConsultas
    ] = await Promise.all([
      Usuario.countDocuments({ perfil: 'paciente', ativo: true }),
      Agendamento.countDocuments({ data: { $gte: hoje, $lt: amanha } }),
      Agendamento.countDocuments({ status: 'agendado', data: { $gte: hoje } }),
      Agendamento.countDocuments({ status: 'realizado' }),
      Agendamento.countDocuments({ status: 'cancelado' }),
      Agendamento.find({ data: { $gte: hoje }, status: { $ne: 'cancelado' } })
        .populate('paciente', 'nome telefone')
        .sort({ data: 1, horario: 1 })
        .limit(5)
    ]);

    res.json({
      estatisticas: {
        totalPacientes,
        totalAgendamentosHoje,
        agendamentosPendentes,
        agendamentosRealizados,
        agendamentosCancelados
      },
      proximasConsultas
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar dashboard.' });
  }
});

// GET /api/admin/usuarios
router.get('/usuarios', autorizar('admin'), async (req, res) => {
  try {
    const { pagina = 1, limite = 20, perfil, busca } = req.query;
    const filtro = {};
    if (perfil) filtro.perfil = perfil;
    if (busca) {
      filtro.$or = [
        { nome: { $regex: busca, $options: 'i' } },
        { email: { $regex: busca, $options: 'i' } }
      ];
    }

    const total = await Usuario.countDocuments(filtro);
    const usuarios = await Usuario.find(filtro)
      .sort({ createdAt: -1 })
      .skip((pagina - 1) * limite)
      .limit(Number(limite));

    res.json({ usuarios, paginacao: { total, pagina: Number(pagina), limite: Number(limite) } });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
});

// PUT /api/admin/usuarios/:id
router.put('/usuarios/:id', autorizar('admin'), async (req, res) => {
  try {
    const { perfil, ativo } = req.body;
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { perfil, ativo },
      { new: true, runValidators: true }
    );
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json({ message: 'Usuário atualizado!', usuario });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuário.' });
  }
});

// GET /api/admin/relatorio
router.get('/relatorio', async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    const filtro = {};
    if (dataInicio || dataFim) {
      filtro.data = {};
      if (dataInicio) filtro.data.$gte = new Date(dataInicio);
      if (dataFim) filtro.data.$lte = new Date(dataFim);
    }

    const porEspecialidade = await Agendamento.aggregate([
      { $match: filtro },
      { $group: { _id: '$especialidade', total: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    const porStatus = await Agendamento.aggregate([
      { $match: filtro },
      { $group: { _id: '$status', total: { $sum: 1 } } }
    ]);

    res.json({ porEspecialidade, porStatus });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório.' });
  }
});

module.exports = router;
