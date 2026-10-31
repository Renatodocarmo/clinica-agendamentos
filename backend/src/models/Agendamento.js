const mongoose = require('mongoose');

const agendamentoSchema = new mongoose.Schema({
  paciente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'Paciente é obrigatório']
  },
  medico: {
    type: String,
    required: [true, 'Médico é obrigatório'],
    trim: true
  },
  especialidade: {
    type: String,
    required: [true, 'Especialidade é obrigatória'],
    enum: [
      'Clínico Geral',
      'Cardiologia',
      'Dermatologia',
      'Ginecologia',
      'Ortopedia',
      'Pediatria',
      'Psiquiatria',
      'Neurologia',
      'Oftalmologia',
      'Urologia'
    ]
  },
  data: {
    type: Date,
    required: [true, 'Data é obrigatória']
  },
  horario: {
    type: String,
    required: [true, 'Horário é obrigatório'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de horário inválido (HH:MM)']
  },
  status: {
    type: String,
    enum: ['agendado', 'confirmado', 'cancelado', 'realizado'],
    default: 'agendado'
  },
  observacoes: {
    type: String,
    maxlength: [500, 'Observações devem ter no máximo 500 caracteres']
  },
  previsaoClimatica: {
    descricao: String,
    temperatura: Number,
    temChuva: Boolean,
    icone: String
  },
  criadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }
}, {
  timestamps: true
});

// Índice composto para evitar conflito de horários por médico
agendamentoSchema.index({ medico: 1, data: 1, horario: 1 }, { unique: true });
agendamentoSchema.index({ paciente: 1, data: 1 });

module.exports = mongoose.model('Agendamento', agendamentoSchema);
