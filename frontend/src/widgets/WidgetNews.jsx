import React, { useState, useEffect, useRef } from "react";
import WidgetNewsConfig from "./WidgetNewsConfig";
import axios from "axios";
import '../styles/widgets/common.css';
import '../styles/widgets/news.css';

// Tópicos disponíveis
const AVAILABLE_TOPICS = [
  { id: "technology", name: "Tecnologia" },
  { id: "business", name: "Finanças" },
  { id: "health", name: "Saúde" },
  { id: "science", name: "Ciência" },
  { id: "sports", name: "Esportes" },
  { id: "entertainment", name: "Entretenimento" },
  { id: "general", name: "Geral" }
];

// Sua chave de API da NewsAPI
const NEWS_API_KEY = "b401d9300ef2488895039d1d36f28e9a";

// Adicione esta função auxiliar para detectar idiomas antes da função fetchNewsFromApi
// Esta função simples verifica os caracteres para determinar se é provavelmente cirílico (russo) ou outro alfabeto não-latino
const isLikelyLatinBased = (text) => {
  if (!text) return true;
  
  // Regex para identificar alfabetos não-latinos mais comuns (cirílico, chinês, japonês, etc)
  const nonLatinPattern = /[\u0400-\u04FF\u0500-\u052F\u2DE0-\u2DFF\uA640-\uA69F\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  
  // Se houver uma alta concentração de caracteres não-latinos, provavelmente não é inglês/português
  return !nonLatinPattern.test(text.substring(0, 20));
};

// Função para buscar notícias da API real - modificar para filtrar por idioma
const fetchNewsFromApi = async (topic, country = 'br', language = null) => {
  try {
    console.log(`Buscando notícias sobre: ${topic}, país: ${country}, idioma: ${language}`);
    
    // Estratégia 1: Tentar top-headlines com parâmetros específicos
    try {
      // Parâmetros da requisição
      const params = {
        category: topic,
        apiKey: NEWS_API_KEY,
        pageSize: 20 // Aumentar para ter mais resultados antes do filtro
      };
      
      // Adicionar parâmetros opcionais
      if (country) params.country = country;
      if (language) params.language = language;
      
      // Chamar a API
      const response = await axios.get(`https://newsapi.org/v2/top-headlines`, { params });
      
      console.log("Resposta da API:", response);
      console.log("Artigos recebidos:", response.data?.articles);

      // Se recebemos artigos, filtrar e retornar
      if (response.data?.articles?.length > 0) {
        // Filtrar artigos para garantir que sejam apenas em português ou inglês
        const filteredArticles = response.data.articles.filter(article => 
          isLikelyLatinBased(article.title) && isLikelyLatinBased(article.description)
        );
        
        console.log(`Filtrados ${filteredArticles.length} de ${response.data.articles.length} artigos`);
        
        if (filteredArticles.length > 0) {
          return filteredArticles.map((article, index) => ({
            id: index,
            title: article.title || "Sem título",
            description: article.description || "",
            source: article.source?.name || "Fonte desconhecida",
            url: article.url || "#",
            urlToImage: article.urlToImage || null,
            publishedAt: article.publishedAt || new Date().toISOString()
          }));
        }
      }
      
      // Se chegou aqui, não recebemos artigos com essa configuração
      console.log("Nenhum resultado com top-headlines, tentando estratégia alternativa");
    } catch (topHeadlinesError) {
      console.error("Erro em top-headlines:", topHeadlinesError);
    }
    
    // Estratégia 2: Tentar "everything" com termo de pesquisa mais amplo e forçar idioma
    try {
      // Traduzir tópicos para termos de busca mais específicos
      const searchTerms = {
        technology: "tecnologia OR technology",
        business: "negócios OR business OR economia",
        health: "saúde OR health OR medicina",
        science: "ciência OR science",
        sports: "esportes OR sports OR futebol OR soccer",
        entertainment: "entretenimento OR entertainment OR cinema",
        general: "notícias OR news OR brasil OR brazil"
      };
      
      const everythingParams = {
        q: searchTerms[topic] || topic,
        apiKey: NEWS_API_KEY,
        pageSize: 20,
        sortBy: 'publishedAt',
        // Forçar idioma para inglês ou português
        language: language || (Math.random() > 0.5 ? 'pt' : 'en')
      };
      
      const everythingResponse = await axios.get(`https://newsapi.org/v2/everything`, { 
        params: everythingParams 
      });
      
      console.log("Resposta da API (everything):", everythingResponse);
      
      if (everythingResponse.data?.articles?.length > 0) {
        // Filtrar novamente para garantir
        const filteredArticles = everythingResponse.data.articles.filter(article => 
          isLikelyLatinBased(article.title) && isLikelyLatinBased(article.description)
        );
        
        if (filteredArticles.length > 0) {
          return filteredArticles.map((article, index) => ({
            id: index,
            title: article.title || "Sem título",
            description: article.description || "",
            source: article.source?.name || "Fonte desconhecida",
            url: article.url || "#",
            urlToImage: article.urlToImage || null,
            publishedAt: article.publishedAt || new Date().toISOString()
          }));
        }
      }
    } catch (everythingError) {
      console.error("Erro em everything:", everythingError);
    }
    
    // Se ambas as estratégias falharam, lance um erro
    throw new Error("Não foi possível encontrar notícias para este tópico");
    
  } catch (error) {
    console.error("Erro detalhado:", error);
    
    // Usar dados mockados em caso de erro na API
    const mockNewsByTopic = {
      technology: [
        { 
          id: 1, 
          title: "Nova versão do React lançada", 
          source: "TechCrunch", 
          url: "https://techcrunch.com",
          description: "React 19 traz melhorias significativas de performance",
          urlToImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800"
        },
        { 
          id: 2, 
          title: "Avanços em IA superam expectativas", 
          source: "Wired", 
          url: "https://wired.com",
          description: "Novos modelos de linguagem mostram capacidades surpreendentes",
          urlToImage: "https://images.unsplash.com/photo-1677442135136-760c813030e6?q=80&w=800"
        }
      ],
      business: [
        { 
          id: 1, 
          title: "Mercado financeiro em alta após anúncios", 
          source: "Bloomberg", 
          url: "https://bloomberg.com",
          description: "Ações sobem com otimismo no mercado",
          urlToImage: "https://images.unsplash.com/photo-1581092588365-7f3c8e6f3f3b?q=80&w=800"
        },
        { 
          id: 2, 
          title: "Startups brasileiras atraem investimentos", 
          source: "Exame", 
          url: "https://exame.com",
          description: "Novos fundos estão apostando em tecnologia e saúde",
          urlToImage: "https://images.unsplash.com/photo-1593642632784-0d1b2b2f3f3b?q=80&w=800"
        }
      ],
      health: [
        { 
          id: 1, 
          title: "Estudo revela benefícios da meditação", 
          source: "Health Magazine", 
          url: "https://health.com",
          description: "Meditar pode aumentar a concentração e reduzir o estresse",
          urlToImage: "https://images.unsplash.com/photo-1516972814920-c540b5f3f3f3?q=80&w=800"
        },
        { 
          id: 2, 
          title: "Avanços no tratamento de doenças cardíacas", 
          source: "Medical News", 
          url: "https://medicalnews.com",
          description: "Novas técnicas estão salvando vidas",
          urlToImage: "https://images.unsplash.com/photo-1581092588365-7f3c8e6f3f3b?q=80&w=800"
        }
      ],
      science: [
        { 
          id: 1, 
          title: "NASA anuncia nova missão a Marte", 
          source: "Space.com", 
          url: "https://space.com",
          description: "A missão Mars 2020 está a caminho",
          urlToImage: "https://images.unsplash.com/photo-1516972814920-c540b5f3f3f3?q=80&w=800"
        },
        { 
          id: 2, 
          title: "Descoberta revoluciona física quântica", 
          source: "Nature", 
          url: "https://nature.com",
          description: "Pesquisadores conseguem teletransportar informações quânticas",
          urlToImage: "https://images.unsplash.com/photo-1581092588365-7f3c8e6f3f3b?q=80&w=800"
        }
      ],
      sports: [
        { 
          id: 1, 
          title: "Brasil se classifica para final do torneio", 
          source: "ESPN", 
          url: "https://espn.com",
          description: "Uma vitória emocionante nos pênaltis",
          urlToImage: "https://images.unsplash.com/photo-1581092588365-7f3c8e6f3f3b?q=80&w=800"
        },
        { 
          id: 2, 
          title: "Recordes quebrados nas olimpíadas", 
          source: "Sports Illustrated", 
          url: "https://si.com",
          description: "Atletas superam limites e estabelecem novas marcas",
          urlToImage: "https://images.unsplash.com/photo-1581092588365-7f3c8e6f3f3b?q=80&w=800"
        }
      ],
      entertainment: [
        { 
          id: 1, 
          title: "Novo filme bate recordes de bilheteira", 
          source: "Variety", 
          url: "https://variety.com",
          description: "Filme de ação supera expectativas e arrecada milhões",
          urlToImage: "https://images.unsplash.com/photo-1581092588365-7f3c8e6f3f3b?q=80&w=800"
        },
        { 
          id: 2, 
          title: "Festival de música anuncia atrações", 
          source: "Rolling Stone", 
          url: "https://rollingstone.com",
          description: "Line-up inclui grandes nomes da música internacional",
          urlToImage: "https://images.unsplash.com/photo-1581092588365-7f3c8e6f3f3b?q=80&w=800"
        }
      ],
      general: [
        { 
          id: 1, 
          title: "Eleições: pesquisas mostram empate", 
          source: "Reuters", 
          url: "https://reuters.com",
          description: "Candidatos estão tecnicamente empatados nas intenções de voto",
          urlToImage: "https://images.unsplash.com/photo-1581092588365-7f3c8e6f3f3b?q=80&w=800"
        },
        { 
          id: 2, 
          title: "Congresso aprova nova lei ambiental", 
          source: "The Guardian", 
          url: "https://theguardian.com",
          description: "Nova legislação visa proteger florestas e reduzir emissões",
          urlToImage: "https://images.unsplash.com/photo-1581092588365-7f3c8e6f3f3b?q=80&w=800"
        }
      ]
    };
    
    console.log("Usando dados mockados como fallback para:", topic);
    return mockNewsByTopic[topic] || mockNewsByTopic.technology;
  }
};

export default function WidgetNews({ data }) {
  // Estado para armazenar as notícias
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  
  // MUDANÇA: Iniciar com modal de configuração aberto se não houver configuração prévia
  const [showConfig, setShowConfig] = useState(!data?.config?.topics || data?.config?.topics.length === 0);

  // Garantir que haja sempre um tópico padrão
  const [config, setConfig] = useState(() => {
    const defaultConfig = {
      topics: ["general"],
      refreshInterval: 5000,
      maxNewsItems: 10
    };
    
    if (data?.config) {
      return {
        ...defaultConfig,
        ...data.config,
        topics: data.config.topics?.length > 0 ? data.config.topics : ["general"]
      };
    }
    
    return defaultConfig;
  });

  // Adicione este novo estado para controlar a última atualização
  const [lastUpdate, setLastUpdate] = useState(null);

  // Referência para o temporizador
  const timerRef = useRef(null);
  
  // Flag para primeira execução
  const isFirstRender = useRef(true);

  // Buscar notícias - função separada para melhor legibilidade
  const loadNews = async () => {
    // Verificações iniciais...
    if (!config.topics || config.topics.length === 0) {
      console.log("Nenhum tópico selecionado, exibindo configuração");
      setShowConfig(true);
      setError("Nenhum tópico selecionado. Configure o widget.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Armazenar todas as notícias de todos os tópicos
      let allNews = [];
      const failedTopics = [];
      
      // Buscar notícias para cada tópico selecionado pelo usuário
      for (const topic of config.topics) {
        try {
          console.log(`Buscando notícias para o tópico preferido: ${topic}`);
          
          // Tentar buscar notícias para este tópico
          let topicNews;
          try {
            // Primeiro tenta em português
            topicNews = await fetchNewsFromApi(topic, 'br');
          } catch (ptError) {
            console.log(`Erro buscando ${topic} em pt-br, tentando em inglês...`);
            // Se falhar, tenta em inglês
            topicNews = await fetchNewsFromApi(topic, null, 'en');
          }
          
          if (topicNews && topicNews.length > 0) {
            // Adicionar etiqueta do tópico às notícias para referência
            const taggedNews = topicNews.map(item => ({
              ...item, 
              topicSource: topic
            }));
            
            // Adicionar à coleção completa
            allNews = [...allNews, ...taggedNews];
          } else {
            failedTopics.push(topic);
          }
        } catch (topicError) {
          console.error(`Erro ao buscar notícias para o tópico ${topic}:`, topicError);
          failedTopics.push(topic);
        }
      }
      
      // Registrar tópicos que falharam
      if (failedTopics.length > 0) {
        console.log(`Não foi possível obter notícias para os tópicos: ${failedTopics.join(', ')}`);
      }
      
      // Se conseguimos alguma notícia
      if (allNews.length > 0) {
        // Misturar as notícias para diversidade e limitar ao número máximo
        const shuffledNews = shuffleArray(allNews).slice(0, config.maxNewsItems);
        
        setNews(shuffledNews);
        setCurrentNewsIndex(0);
        setLoading(false);
        setError(null);
        setLastUpdate(new Date());
      } else {
        throw new Error("Nenhuma notícia encontrada para os tópicos selecionados");
      }
    } catch (error) {
      console.error("Erro ao buscar notícias:", error);
      setError("Não foi possível carregar as notícias. " + error.message);
      setLoading(false);
    }
  };

  // Adicione esta função auxiliar para misturar o array de notícias
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Buscar notícias iniciais
  useEffect(() => {
    // Tentar carregar configurações salvas no localStorage
    try {
      const savedConfig = localStorage.getItem('newsWidgetConfig');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        console.log("Carregando configurações salvas:", parsedConfig);
        setConfig(prevConfig => ({
          ...prevConfig,
          ...parsedConfig
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar configurações salvas:", error);
    }
    
    // Continuar com a inicialização normal
    if (isFirstRender.current) {
      isFirstRender.current = false;
      loadNews();
      
      // Refresh periódico de notícias (a cada hora)
      const refreshInterval = setInterval(loadNews, 3600000);
      return () => clearInterval(refreshInterval);
    }
  }, []); 
  
  // Efeito separado que recarrega notícias quando a configuração muda
  useEffect(() => {
    if (!isFirstRender.current && config?.topics?.length > 0) {
      loadNews();
    }
  }, [config.topics, config.maxNewsItems]);
  
  // Rodar temporizador para alternar notícias
  useEffect(() => {
    if (news.length <= 1) return; // Não alterna se tiver apenas uma notícia
    
    // Limpa qualquer timer existente
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Configura novo timer
    timerRef.current = setInterval(() => {
      setCurrentNewsIndex(prev => (prev + 1) % news.length);
    }, config.refreshInterval);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [news, config.refreshInterval]);

  // Reinicia o estado de carregamento de imagem quando muda a notícia
  useEffect(() => {
    setImageLoading(true);
  }, [currentNewsIndex]);

  // Salvar configurações
  const saveConfig = (newConfig) => {
    console.log("Salvando nova configuração:", newConfig);
    
    // Atualizar o estado local
    setConfig(newConfig);
    setShowConfig(false);
    
    // Persistir as configurações (se tiver acesso à API ou ao localStorage)
    try {
      // Opção 1: Salvar via API
      // Se você tiver uma API para salvar as preferências do usuário:
      // await saveUserPreferences(userId, widgetId, newConfig);
      
      // Opção 2: Salvar no localStorage como fallback
      localStorage.setItem('newsWidgetConfig', JSON.stringify(newConfig));
      
      console.log("Configurações salvas com sucesso");
    } catch (error) {
      console.error("Erro ao persistir configurações:", error);
    }
    
    // Carregar notícias com as novas configurações
    setTimeout(loadNews, 100);
  };

  // Abre a URL da notícia em uma nova aba
  const openNewsUrl = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Renderização condicional
  if (loading) {
    return (
      <div className="widget-news-loading">
        <p>Carregando notícias...</p>
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget-news-error">
        <p>{error}</p>
        
        {/* Botão de configuração mais destacado */}
        <button 
          className="btn-primary" 
          onClick={() => {
            console.log("Botão de configuração clicado");
            setShowConfig(true);
            console.log("showConfig após clique:", true);
          }}
          style={{ marginTop: "10px", display: "block", width: "100%" }}
        >
          Configurar Widget de Notícias ⚙️
        </button>
        
        <button 
          className="btn-secondary" 
          onClick={loadNews}
          style={{ marginTop: "10px", display: "block", width: "100%" }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Mostra uma notícia de cada vez com navegação
  const currentNews = news[currentNewsIndex] || null;

  return (
    <div className="widget-news" style={{ position: 'relative', overflow: 'hidden', height: '100%', boxSizing: 'border-box' }}>
      {news.length === 0 ? (
        // Código existente para quando não há notícias
        <div className="widget-news-empty">
          <p>Nenhuma notícia disponível.</p>
          <p>Configure tópicos para ver notícias relevantes.</p>
          <button 
            className="btn-primary" 
            onClick={() => setShowConfig(true)}
            style={{ marginTop: "10px" }}
          >
            Configurar
          </button>
        </div>
      ) : (
        <>
          <div 
            className="news-display" 
            onClick={() => openNewsUrl(currentNews.url)}
            style={{ 
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              height: "calc(100% - 32px)", // Ajustar altura para dar espaço aos botões
              overflow: "hidden",
            }}
            title="Clique para abrir a notícia"
          >
            {currentNews && (
              <div className="news-item">
                <h4 className="news-title">{currentNews.title}</h4>
                
                {/* Mover as informações de fonte e categoria para cima da imagem */}
                <div className="news-meta-top">
                  <span className="news-source">{currentNews.source}</span>
                  {currentNews.topicSource && (
                    <span className="topic-badge" title={`Categoria: ${currentNews.topicSource}`}>
                      {AVAILABLE_TOPICS.find(t => t.id === currentNews.topicSource)?.name || currentNews.topicSource}
                    </span>
                  )}
                </div>
                
                {currentNews.urlToImage ? (
                  <div className="news-image-container">
                    {imageLoading && (
                      <div className="image-loading-indicator">
                        <div className="loader-small"></div>
                      </div>
                    )}
                    <img 
                      src={currentNews.urlToImage}
                      alt={`Imagem: ${currentNews.title}`}
                      className="news-image"
                      style={{ display: imageLoading ? 'none' : 'block' }}
                      onLoad={() => setImageLoading(false)}
                      onError={(e) => {
                        console.log("Erro ao carregar imagem:", currentNews.urlToImage);
                        setImageLoading(false);
                        e.target.onerror = null;
                        
                        // Substituir com imagem de fallback baseada no tópico
                        const fallbackImages = {
                          technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop",
                          business: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop",
                          health: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop",
                          science: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop",
                          sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop",
                          entertainment: "https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=800&auto=format&fit=crop",
                          general: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&auto=format&fit=crop"
                        };
                        
                        const topic = config.topics[0] || "general";
                        e.target.src = fallbackImages[topic];
                        e.target.style.display = 'block';
                      }}
                    />
                  </div>
                ) : (
                  // Sempre mostrar uma imagem de categoria quando não houver imagem específica
                  <div className="news-image-container">
                    <img 
                      src={`https://source.unsplash.com/featured/?${config.topics[0] || "news"}`}
                      alt="Imagem representativa"
                      className="news-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {currentNews.description && (
                  <p className="news-description">{currentNews.description}</p>
                )}
                
                {/* Nova área de footer apenas para contagem de notícias */}
                <div className="news-counter">
                  {news.length > 1 && `${currentNewsIndex + 1}/${news.length}`}
                </div>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Modal de configuração existente */}
      {showConfig && (
        <WidgetNewsConfig
          config={config}
          topics={AVAILABLE_TOPICS}
          onSave={saveConfig}
          onCancel={() => setShowConfig(false)}
        />
      )}
    </div>
  );
}