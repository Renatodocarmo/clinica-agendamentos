const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const enderecoSchema = new mongoose.Schema({
  cep: { type: String },
  logradouro: { type: String },
  complemento: { type: String },
  bairro: { type: String },
  cidade: { type: String },
  estado: { type: String }
}, { _id: false });

const usuarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter no mínimo 2 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  senha: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
    select: false
  },
  telefone: {
    type: String,
    trim: true
  },
  cpf: {
    type: String,
    trim: true,
    sparse: true
  },
  dataNascimento: {
    type: Date
  },
  endereco: enderecoSchema,
  perfil: {
    type: String,
    enum: ['paciente', 'secretario', 'admin'],
    default: 'paciente'
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash da senha antes de salvar
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  this.senha = await bcrypt.hash(this.senha, 12);
  next();
});

// Comparar senhas
usuarioSchema.methods.compararSenha = async function (senhaInformada) {
  return await bcrypt.compare(senhaInformada, this.senha);
};

// Remover senha do JSON retornado
usuarioSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.senha;
  return obj;
};

module.exports = mongoose.model('Usuario', usuarioSchema);
