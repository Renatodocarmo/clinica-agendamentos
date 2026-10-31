const fetch = require('node-fetch');

const buscarClima = async (data) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const cidade = process.env.OPENWEATHER_CITY || 'São Paulo';
  const pais = process.env.OPENWEATHER_COUNTRY || 'BR';

  if (!apiKey || apiKey === 'sua_chave_openweathermap_aqui') {
    return null;
  }

  try {
    // Forecast para até 5 dias
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)},${pais}&appid=${apiKey}&units=metric&lang=pt_br`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`OpenWeather API: ${response.status}`);

    const dados = await response.json();
    const dataAlvo = new Date(data);
    dataAlvo.setHours(12, 0, 0, 0);

    // Encontrar a previsão mais próxima da data
    let previsaoMaisProxima = null;
    let menorDiferenca = Infinity;

    for (const item of dados.list) {
      const itemData = new Date(item.dt * 1000);
      const diff = Math.abs(itemData - dataAlvo);
      if (diff < menorDiferenca) {
        menorDiferenca = diff;
        previsaoMaisProxima = item;
      }
    }

    if (!previsaoMaisProxima) return null;

    const temChuva = previsaoMaisProxima.weather[0].main === 'Rain' ||
      previsaoMaisProxima.weather[0].main === 'Drizzle' ||
      previsaoMaisProxima.weather[0].main === 'Thunderstorm' ||
      (previsaoMaisProxima.rain && previsaoMaisProxima.rain['3h'] > 0);

    return {
      descricao: previsaoMaisProxima.weather[0].description,
      temperatura: Math.round(previsaoMaisProxima.main.temp),
      tempMin: Math.round(previsaoMaisProxima.main.temp_min),
      tempMax: Math.round(previsaoMaisProxima.main.temp_max),
      umidade: previsaoMaisProxima.main.humidity,
      temChuva,
      icone: previsaoMaisProxima.weather[0].icon,
      cidade
    };
  } catch (error) {
    console.error('Erro ao buscar clima:', error.message);
    return null;
  }
};

module.exports = { buscarClima };
