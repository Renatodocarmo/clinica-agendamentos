const router = require('express').Router();
const { body } = require('express-validator');
const { registrar, login, perfil, atualizarPerfil } = require('../controllers/authController');
const { autenticar } = require('../middleware/auth');

router.post('/registro', [
  body('nome').trim().isLength({ min: 2 }).withMessage('Nome deve ter no mínimo 2 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('telefone').optional().isMobilePhone('pt-BR').withMessage('Telefone inválido')
], registrar);

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
], login);

router.get('/perfil', autenticar, perfil);
router.put('/perfil', autenticar, atualizarPerfil);

module.exports = router;
