const router = require('express').Router();
const { body } = require('express-validator');
const { autenticar, autorizar } = require('../middleware/auth');
const {
  criar, listar, buscarPorId, atualizar, deletar, horariosDisponiveis
} = require('../controllers/agendamentoController');

const validacaoAgendamento = [
  body('medico').trim().notEmpty().withMessage('Médico é obrigatório'),
  body('especialidade').notEmpty().withMessage('Especialidade é obrigatória'),
  body('data').isISO8601().withMessage('Data inválida').custom(val => {
    if (new Date(val) < new Date()) throw new Error('Data não pode ser no passado');
    return true;
  }),
  body('horario').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horário inválido (HH:MM)')
];

router.get('/horarios-disponiveis', autenticar, horariosDisponiveis);
router.get('/', autenticar, listar);
router.get('/:id', autenticar, buscarPorId);
router.post('/', autenticar, validacaoAgendamento, criar);
router.put('/:id', autenticar, atualizar);
router.delete('/:id', autenticar, autorizar('admin', 'secretario'), deletar);

module.exports = router;
