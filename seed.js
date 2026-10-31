/**
 * Script para popular o banco com dados de demonstração
 * Uso: node backend/seed.js
 */

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinica_db';

const usuarioSchema = new mongoose.Schema({
  nome: String, email: String, senha: String,
  telefone: String, perfil: String, ativo: { type: Boolean, default: true }
}, { timestamps: true });

const agendamentoSchema = new mongoose.Schema({
  paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  medico: String, especialidade: String,
  data: Date, horario: String, status: String, observacoes: String
}, { timestamps: true });

const Usuario = mongoose.model('Usuario', usuarioSchema);
const Agendamento = mongoose.model('Agendamento', agendamentoSchema);

const seed = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('Conectado ao MongoDB...');

  await Usuario.deleteMany({});
  await Agendamento.deleteMany({});

  const senhaHash = async (s) => bcrypt.hash(s, 12);

  const usuarios = await Usuario.insertMany([
    { nome: 'Administrador Clínica', email: 'admin@clinica.com', senha: await senhaHash('admin123'), perfil: 'admin', telefone: '(11) 99999-0001' },
    { nome: 'Maria Secretária', email: 'secretaria@clinica.com', senha: await senhaHash('sec123'), perfil: 'secretario', telefone: '(11) 99999-0002' },
    { nome: 'João Silva Paciente', email: 'joao@email.com', senha: await senhaHash('joao123'), perfil: 'paciente', telefone: '(11) 98888-0001' },
    { nome: 'Ana Lima Paciente', email: 'ana@email.com', senha: await senhaHash('ana123'), perfil: 'paciente', telefone: '(11) 98888-0002' },
  ]);

  const paciente1 = usuarios[2];
  const paciente2 = usuarios[3];

  const hoje = new Date();
  const amanha = new Date(hoje); amanha.setDate(amanha.getDate() + 1);
  const depois = new Date(hoje); depois.setDate(depois.getDate() + 3);

  await Agendamento.insertMany([
    { paciente: paciente1._id, medico: 'Dr. Carlos Mendes', especialidade: 'Clínico Geral', data: amanha, horario: '09:00', status: 'agendado', observacoes: 'Consulta de rotina' },
    { paciente: paciente1._id, medico: 'Dra. Ana Rodrigues', especialidade: 'Cardiologia', data: depois, horario: '14:00', status: 'confirmado' },
    { paciente: paciente2._id, medico: 'Dr. Felipe Castro', especialidade: 'Oftalmologia', data: amanha, horario: '10:30', status: 'agendado' },
    { paciente: paciente2._id, medico: 'Dra. Sofia Alves', especialidade: 'Pediatria', data: hoje, horario: '08:00', status: 'realizado', observacoes: 'Consulta realizada com sucesso' },
  ]);

  console.log('✅ Banco populado com sucesso!');
  console.log('\n--- Usuários criados ---');
  console.log('Admin:       admin@clinica.com     / admin123');
  console.log('Secretária:  secretaria@clinica.com / sec123');
  console.log('Paciente 1:  joao@email.com         / joao123');
  console.log('Paciente 2:  ana@email.com           / ana123');

  await mongoose.disconnect();
};

seed().catch(console.error);
