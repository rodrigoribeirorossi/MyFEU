import axios from 'axios';
const API_URL = 'http://localhost:8000';

// Configuração global do Axios com timeout
axios.defaults.timeout = 10000; // 10 segundos

// Configuração de logs melhorados
axios.interceptors.response.use(
  response => {
    console.log(`✅ [API] ${response.config.method.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  error => {
    if (error.response) {
      console.error(`❌ [API] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response.status}`);
      console.error('Resposta do servidor:', error.response.data);
    } else if (error.request) {
      console.error(`❌ [API] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Sem resposta do servidor`);
      console.error('Verifique se o servidor backend está rodando em http://localhost:8000');
    } else {
      console.error('Erro na configuração da requisição:', error.message);
    }
    return Promise.reject(error);
  }
);

export const getWidgets = async () => {
  try {
    const resp = await axios.get(`${API_URL}/widgets/`);
    console.log('Widgets recebidos:', resp.data);
    
    // Verificar se há um widget de Jogos e mostrar seus detalhes
    const jogosWidget = resp.data.find(w => w.name.includes('Jogos'));
    if (jogosWidget) {
      console.log('Widget de Jogos encontrado:', jogosWidget);
    }
    
    return resp.data;
  } catch (error) {
    console.error('Error fetching widgets:', error);
    // Fallback para desenvolvimento - retornar widgets estáticos se a API falhar
    return [
      { id: 1, name: 'Notícias', description: 'Notícias personalizadas', icon: '📰', default_config: { topics: ['general'], refreshInterval: 60000 } },
      { id: 2, name: 'Lista de Compras', description: 'Gerencie itens para comprar', icon: '🛒', default_config: {} },
      { id: 3, name: 'Lembretes', description: 'Lembretes importantes', icon: '⏰', default_config: {} },
      { id: 4, name: 'Saúde', description: 'Monitore sua saúde', icon: '❤️', default_config: {} },
      { id: 10, name: 'Jogos e Resultados', description: 'Scores esportivos', icon: '⚽', default_config: { timeId: null, showEscudos: true } }
    ];
  }
};

export const addWidget = async (userId, widget) => {
  try {
    console.log('Adicionando widget:', widget);
    const resp = await axios.post(`${API_URL}/user/${userId}/widgets/`, widget);
    console.log('Resposta ao adicionar widget:', resp.data);
    return resp.data;
  } catch (error) {
    console.error('Erro ao adicionar widget:', error);
    
    // Verifica se é um erro de conexão ou se o servidor está offline
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.warn('Servidor não disponível, usando modo offline');
    }
    
    // Verificar o código de erro específico
    const statusCode = error.response?.status;
    console.log(`Status code do erro: ${statusCode}`);
    
    // FALLBACK: Se tivermos erro com a API, criar um objeto simulado para desenvolvimento
    if (widget.widget_id === 5) {  // Widget de jogos
      console.log('Usando fallback para criar widget de Jogos');
      
      // Criar resposta simulada para desenvolvimento
      const mockResponse = {
        id: Date.now(),
        widget_id: 5,
        api_widget_id: widget.api_widget_id || 10,
        position: widget.position,
        name: widget.name || "Jogos e Resultados",
        icon: widget.icon || "⚽",
        description: widget.description || "Acompanhe os resultados do seu time",
        config: widget.config || { timeId: null, showEscudos: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Widget simulado criado:', mockResponse);
      return mockResponse;
    }
    
    // Para outros widgets, propagar o erro
    throw error;
  }
};

// Função para limpar o cache e buscar os jogos de um time
export const fetchJogosTime = async (timeId) => {
  try {
    // First try to clear the cache
    try {
      await axios.get(`${API_URL}/api/futebol/cache/clear/times/${timeId}`);
      console.log(`Cache do time ID ${timeId} limpo com sucesso`);
    } catch (error) {
      console.warn("Erro ao limpar cache (continuando com fetch):", error);
    }
    
    // Now fetch the game data
    const [ultimaRes, proximaRes] = await Promise.all([
      axios.get(`${API_URL}/api/futebol/times/${timeId}/partidas/ultimas`),
      axios.get(`${API_URL}/api/futebol/times/${timeId}/partidas/proximas`)
    ]);
    
    return {
      ultimas: ultimaRes.data,
      proximas: proximaRes.data
    };
  } catch (error) {
    console.error("Erro ao buscar jogos:", error);
    return {
      ultimas: [],
      proximas: []
    };
  }
};