const router = require('express').Router();
const fetch = require('node-fetch');
const { autenticar } = require('../middleware/auth');
const { buscarClima } = require('../utils/climaService');

// GET /api/external/cep/:cep
router.get('/cep/:cep', autenticar, async (req, res) => {
  try {
    const cep = req.params.cep.replace(/\D/g, '');
    if (cep.length !== 8) {
      return res.status(400).json({ error: 'CEP deve ter 8 dígitos.' });
    }

    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const dados = await response.json();

    if (dados.erro) {
      return res.status(404).json({ error: 'CEP não encontrado.' });
    }

    res.json({
      cep: dados.cep,
      logradouro: dados.logradouro,
      complemento: dados.complemento,
      bairro: dados.bairro,
      cidade: dados.localidade,
      estado: dados.uf
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao consultar CEP.' });
  }
});

// GET /api/external/clima?data=YYYY-MM-DD
router.get('/clima', autenticar, async (req, res) => {
  try {
    const { data } = req.query;
    if (!data) {
      return res.status(400).json({ error: 'Data é obrigatória.' });
    }

    const clima = await buscarClima(new Date(data));
    if (!clima) {
      return res.json({ disponivel: false, message: 'Previsão não disponível.' });
    }

    res.json({ disponivel: true, ...clima });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clima.' });
  }
});

module.exports = router;
