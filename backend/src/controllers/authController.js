const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Usuario = require('../models/Usuario');

const gerarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// POST /api/auth/registro
const registrar = async (req, res) => {
  try {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ errors: erros.array() });
    }

    const { nome, email, senha, telefone, cpf, dataNascimento, perfil } = req.body;

    // Verificar se email já existe
    const emailExistente = await Usuario.findOne({ email });
    if (emailExistente) {
      return res.status(409).json({ error: 'Email já cadastrado.' });
    }

    // Apenas admins podem criar secretários
    const perfilFinal = perfil === 'secretario' ? 'paciente' : (perfil || 'paciente');

    const usuario = await Usuario.create({
      nome,
      email,
      senha,
      telefone,
      cpf,
      dataNascimento,
      perfil: perfilFinal
    });

    const token = gerarToken(usuario._id);

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      token,
      usuario
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email ou CPF já cadastrado.' });
    }
    res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ errors: erros.array() });
    }

    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({ email }).select('+senha');
    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const senhaCorreta = await usuario.compararSenha(senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = gerarToken(usuario._id);
    const usuarioSemSenha = usuario.toJSON();

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      usuario: usuarioSemSenha
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao realizar login.' });
  }
};

// GET /api/auth/perfil
const perfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario._id);
    res.json({ usuario });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil.' });
  }
};

// PUT /api/auth/perfil
const atualizarPerfil = async (req, res) => {
  try {
    const camposPermitidos = ['nome', 'telefone', 'dataNascimento', 'endereco'];
    const atualizacoes = {};
    camposPermitidos.forEach(campo => {
      if (req.body[campo] !== undefined) {
        atualizacoes[campo] = req.body[campo];
      }
    });

    const usuario = await Usuario.findByIdAndUpdate(
      req.usuario._id,
      atualizacoes,
      { new: true, runValidators: true }
    );

    res.json({ message: 'Perfil atualizado!', usuario });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
};

module.exports = { registrar, login, perfil, atualizarPerfil };
