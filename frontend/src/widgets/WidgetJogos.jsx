import React, { useState, useEffect, useRef } from "react";
// Remover esta importação que não será mais usada diretamente aqui
// import WidgetJogosConfig from "./WidgetJogosConfig";
import axios from "axios";
import * as api from "../api";
import '../styles/widgets/jogos.css';

// Lista dos clubes do Brasileirão Série A
const CLUBES_SERIE_A = [
  { id: 1776, nome: "São Paulo", escudo: "https://logodetimes.com/times/sao-paulo/logo-sao-paulo-256.png", slug: "sao-paulo" },
  { id: 1765, nome: "Fluminense", escudo: "https://logodetimes.com/times/fluminense/logo-fluminense-256.png", slug: "fluminense" },
  { id: 1766, nome: "Atlético Mineiro", escudo: "https://logodetimes.com/times/atletico-mineiro/logo-atletico-mineiro-256.png", slug: "atletico-mg" },
  { id: 1767, nome: "Grêmio", escudo: "https://logodetimes.com/times/gremio/logo-gremio-256.png", slug: "gremio" },
  { id: 1769, nome: "Palmeiras", escudo: "https://logodetimes.com/times/palmeiras/logo-palmeiras-256.png", slug: "palmeiras" },
  { id: 1770, nome: "Botafogo", escudo: "https://logodetimes.com/times/botafogo/logo-botafogo-256.png", slug: "botafogo" },
  { id: 1771, nome: "Cruzeiro", escudo: "https://logodetimes.com/times/cruzeiro/logo-cruzeiro-256.png", slug: "cruzeiro" },
  { id: 1777, nome: "Bahia", escudo: "https://logodetimes.com/times/bahia/logo-bahia-256.png", slug: "bahia" },
  { id: 1778, nome: "Sport (SC Recife)", escudo: "https://logodetimes.com/times/sport-club-do-recife/logo-sport-club-do-recife-256.png", slug: "sport" },
  { id: 1779, nome: "Corinthians", escudo: "https://logodetimes.com/times/corinthians/logo-corinthians-256.png", slug: "corinthians" },
  { id: 1780, nome: "Vasco", escudo: "https://logodetimes.com/times/vasco/logo-vasco-da-gama-256.png", slug: "vasco" },
  { id: 1782, nome: "Vitória", escudo: "https://logodetimes.com/times/vitoria/logo-vitoria-256.png", slug: "vitoria" },
  { id: 1783, nome: "Flamengo", escudo: "https://logodetimes.com/times/flamengo/logo-flamengo-256.png", slug: "flamengo" },
  { id: 1837, nome: "Ceará", escudo: "https://logodetimes.com/times/ceara/logo-ceara-256.png", slug: "ceara" },
  { id: 3984, nome: "Fortaleza", escudo: "https://logodetimes.com/times/fortaleza/logo-fortaleza-256.png", slug: "fortaleza" },
  { id: 4245, nome: "Juventude", escudo: "https://logodetimes.com/times/juventude/logo-juventude-256.png", slug: "juventude" },
  { id: 4286, nome: "RB Bragantino", escudo: "https://logodetimes.com/times/bragantino/logo-bragantino-256.png", slug: "bragantino" },
  { id: 4364, nome: "Mirassol", escudo: "https://logodetimes.com/times/mirassol/logo-mirassol-256.png", slug: "mirassol" },
  { id: 6684, nome: "Internacional", escudo: "https://logodetimes.com/times/internacional/logo-internacional-256.png", slug: "internacional" },
  { id: 6685, nome: "Santos", escudo: "https://logodetimes.com/times/santos/logo-santos-256.png", slug: "santos" }
];

const PLACEHOLDER_CREST = "https://via.placeholder.com/80x80.png?text=badge";
const API_URL = "http://localhost:8000/api/futebol";
const API_TIMEOUT = 8000; // Reduzir para 8 segundos para feedback mais rápido

// Função para fazer log com timestamp
const logWithTime = (message, data = null) => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString();
  console.log(`[${timeStr}] [WidgetJogos] ${message}`);
  if (data) console.log(data);
};

// Helper: combina date + time (UTC) vindo do backend em Date local
const toLocalDate = (datePart, timePart) => {
  if (!datePart) return null;
  const time = timePart ? timePart : "00:00:00";
  const iso = `${datePart}T${time}Z`; // backend fornece UTC parts — marcar Z
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
};

// Componente principal do widget
export default function WidgetJogos({ data, onRemove, onConfigure }) {
  // Garantir que data sempre seja um objeto
  data = data || {};

  logWithTime("Widget inicializado com dados:", data);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ultimaPartida, setUltimaPartida] = useState(null);
  const [proximaPartida, setProximaPartida] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);
  const requestInProgress = useRef(false); // Para prevenir múltiplas requisições simultâneas
  
  // Configuração padrão
  const [config, setConfig] = useState(() => {
    const defaultConfig = {
      timeId: null,
      showEscudos: true
    };
    
    // MODIFICAÇÃO: Priorizar props.data.config sobre localStorage
    if (data?.config?.timeId) {
      return {
        ...defaultConfig,
        ...data.config
      };
    }
    
    // Só usar localStorage se não houver configuração nas props
    try {
      const savedConfig = localStorage.getItem('jogosWidgetConfig');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        return {
          ...defaultConfig,
          ...parsedConfig
        };
      }
    } catch (error) {
      logWithTime("Erro ao carregar configurações do localStorage:", error);
    }
    
    return defaultConfig;
  });
  
  const isFirstRender = useRef(true);
  
  // Função para buscar jogos do time com timeout
  const fetchJogosTime = async (forceTimeId) => {
    // IMPORTANTE: Sempre usar o ID fornecido explicitamente, ignorando estado local
    const timeIdToUse = forceTimeId; // Não mais || config.timeId
    
    // Log explícito para debugging
    console.log(`[WidgetJogos] Iniciando fetchJogosTime com timeId explícito: ${timeIdToUse}`);
    
    if (!timeIdToUse || requestInProgress.current) {
      logWithTime(`Ignorando busca: timeId inválido ou requisição em andamento. TimeId: ${timeIdToUse}, Em andamento: ${requestInProgress.current}`);
      return;
    }
    
    requestInProgress.current = true;
    setLoading(true);
    setError(null);
    
    // Limpar qualquer timeout anterior
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Configurar novo timeout
    const id = setTimeout(() => {
      if (requestInProgress.current) {
        logWithTime(`Timeout atingido para busca de dados do time ${timeIdToUse}`);
        setLoading(false);
        setError("Tempo limite excedido. Não foi possível carregar os dados do time.");
        requestInProgress.current = false;
      }
    }, API_TIMEOUT);
    
    setTimeoutId(id);
    
    try {
      logWithTime(`Iniciando busca de partidas para time ID: ${timeIdToUse}`);
      
      // Limpar cache primeiro - Agora usando o ID forçado
      try {
        const cacheResponse = await axios.get(`${API_URL}/cache/clear/times/${timeIdToUse}`);
        logWithTime(`Cache do time ${timeIdToUse} limpo com sucesso:`, cacheResponse.data);
      } catch (cacheError) {
        logWithTime(`Erro ao limpar cache para timeId ${timeIdToUse} (continuando):`, cacheError);
      }
      
      // Adicionar um pequeno delay para garantir que o cache foi limpo no servidor
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Agora buscar dados frescos da API usando o ID forçado
      const [ultimaRes, proximaRes] = await Promise.all([
        axios.get(`${API_URL}/times/${timeIdToUse}/partidas/ultimas`),
        axios.get(`${API_URL}/times/${timeIdToUse}/partidas/proximas`)
      ]);
      
      // Limpar timeout após sucesso
      clearTimeout(id);
      setTimeoutId(null);
      
      logWithTime(`Dados recebidos:`, { 
        ultimasCount: ultimaRes.data.length, 
        proximasCount: proximaRes.data.length 
      });
      
      // Definir última partida (pegar a mais recente)
      setUltimaPartida(ultimaRes.data[0] || null);
      
      // Definir próxima partida (pegar a mais próxima)
      setProximaPartida(proximaRes.data[0] || null);
      
      // Se não temos dados de nenhuma partida, mostrar mensagem
      if (ultimaRes.data.length === 0 && proximaRes.data.length === 0) {
        setError(`Não foram encontradas partidas para ${CLUBES_SERIE_A.find(t => t.id === parseInt(timeIdToUse))?.nome}. Os dados podem não estar disponíveis no momento.`);
      }
      
      setLoading(false);
      requestInProgress.current = false;
    } catch (error) {
      logWithTime(`Erro na busca de partidas: ${error?.message || error}`, error);
      // Limpar timeout
      clearTimeout(id);
      setTimeoutId(null);

      // axios / http errors: inspecionar response.status
      const status = error?.response?.status;
      if (status === 429) {
        setError("Limite de requisições atingido. Aguarde alguns segundos e tente novamente.");
      } else if (status === 403) {
        setError("Dados restritos pelo plano da API (403). Verifique token/permissões.");
      } else if (error?.message?.includes("timeout") || error?.code === "ECONNABORTED") {
        setError("Tempo limite excedido. Verifique sua conexão e tente novamente.");
      } else if (error?.code === "ERR_NETWORK") {
        setError("Não foi possível conectar ao servidor. O servidor pode estar offline ou indisponível.");
      } else {
        setError(`Não foi possível carregar os jogos do time selecionado.`);
      }

      setLoading(false);
      requestInProgress.current = false;
    }
  };
  
  // Efeito para carregar jogos quando o componente montar
  useEffect(() => {
    // Verificar configuração ao iniciar
    if (isFirstRender.current) {
      // Se já temos um timeId nas props ou no estado local, usamos ele
      const timeIdToUse = data?.config?.timeId || config.timeId;
      
      if (timeIdToUse) {
        logWithTime(`Inicializando widget com timeId: ${timeIdToUse}`);
        
        // Tentar limpar o cache primeiro
        axios.get(`${API_URL}/cache/clear/times/${timeIdToUse}`)
          .then(() => {
            logWithTime(`Cache do time ID ${timeIdToUse} limpo com sucesso`);
            setTimeout(() => fetchJogosTime(timeIdToUse), 300);
          })
          .catch(error => {
            logWithTime(`Erro ao limpar cache: ${error.message}`, error);
            setTimeout(() => fetchJogosTime(timeIdToUse), 300);
          });
      } else {
        // Se não há time configurado, notificar para configurar
        setError("Clique no ícone de configuração para selecionar seu time favorito");
      }
      
      isFirstRender.current = false;
    }
    
    // Limpar timeouts ao desmontar
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);
  
  // Modificar o useEffect que observa mudanças nas props data
  useEffect(() => {
    // Este efeito executa quando as props mudam
    // 1. Verificar se temos dados pré-carregados (vindos do Dashboard após salvar config)
    if (data?.preloadedData && data.preloadedData.loadedAt) {
      const { ultimas, proximas, loadedAt } = data.preloadedData;
      
      // Verificar se os dados pré-carregados são recentes (menos de 10 segundos)
      const isRecent = (Date.now() - loadedAt) < 10000;
      
      if (isRecent && (ultimas?.length > 0 || proximas?.length > 0)) {
        logWithTime("Usando dados pré-carregados do time", {
          timeId: data.config?.timeId,
          ultimasCount: ultimas.length,
          proximasCount: proximas.length
        });
        
        // IMPORTANTE: Primeiro atualizar o estado local com o novo timeId
        if (data.config?.timeId !== undefined) {
          setConfig(prevConfig => ({
            ...prevConfig,
            ...data.config
          }));
        }
        
        // Atualizar dados diretamente sem fazer nova requisição
        setUltimaPartida(ultimas[0] || null);
        setProximaPartida(proximas[0] || null);
        setLoading(false);
        setError(null);
        
        return; // Sair do efeito para não fazer requisição duplicada
      }
    }

    // 2. Processamento normal das props (quando não há dados pré-carregados)
    if (data?.refreshTimestamp || (data?.config?.timeId !== undefined)) {
      const newTimeId = data?.config?.timeId;
      
      logWithTime("Detectada mudança nas props:", {
        oldTimeId: config.timeId,
        newTimeId: newTimeId,
        timestamp: data?.refreshTimestamp
      });
      
      // IMPORTANTE: Usar um flag para garantir que o código abaixo só execute uma vez por mudança
      const needsUpdate = 
        data?.refreshTimestamp || 
        (newTimeId !== undefined && newTimeId !== config.timeId);
      
      if (needsUpdate) {
        // CRITICAL FIX: Guardar o timeId que será usado em uma variável local
        // para não depender do estado que pode mudar assincronamente
        const timeIdToUse = newTimeId || config.timeId;
        
        // Atualizar o estado local de config primeiro
        if (newTimeId !== undefined) {
          // Atualizar estado de forma síncrona antes de fazer a requisição
          setConfig(prevConfig => {
            const newConfig = {
              ...prevConfig,
              timeId: newTimeId
            };
            
            logWithTime("Config local atualizada para:", newConfig);
            return newConfig;
          });
        }
        
        // PONTO CRÍTICO: Se temos um ID válido (novo ou atual), fazer a requisição
        if (timeIdToUse) {
          // Usar setTimeout para garantir que outros efeitos não interfiram
          setTimeout(() => {
            logWithTime(`Buscando dados para timeId: ${timeIdToUse}`);
            fetchJogosTime(timeIdToUse);
          }, 0);
        }
      }
    }
  }, [data]); // Observar mudanças apenas em data
  
  // Componente para exibir uma partida
  const PartidaCard = ({ partida, tipo }) => {
    if (!partida) return null;
    
    // Identificar se o time selecionado é mandante ou visitante (usar IDs — mais confiável)
    const selectedTeamId = Number(config.timeId);
    const mandanteId = Number(partida.time_mandante?.id);
    const visitanteId = Number(partida.time_visitante?.id);
    const isMandante = selectedTeamId && mandanteId === selectedTeamId;
    const isVisitante = selectedTeamId && visitanteId === selectedTeamId;
    
    // Determinar o resultado (vitória, derrota ou empate)
    const getResultado = () => {
      const mandRaw = partida.placar_mandante_final;
      const visRaw = partida.placar_visitante_final;
      // aceitar null/undefined como "sem placar", tratar zeros corretamente
      if (mandRaw == null && visRaw == null) return null;
      const mandanteGols = Number.isInteger(mandRaw) ? mandRaw : 0;
      const visitanteGols = Number.isInteger(visRaw) ? visRaw : 0;
      if (mandanteGols === visitanteGols) return "empate";
      const mandanteVence = mandanteGols > visitanteGols;
      // Se o time favoritado é mandante/visitante, mapear para vitoria/derrota corretamente
      if (isMandante) return mandanteVence ? "vitoria" : "derrota";
      if (isVisitante) return mandanteVence ? "derrota" : "vitoria";
      // Se o time favorito não participa (edge-case), indicar resultado relativo ao mandante
      return mandanteVence ? "vitoria" : "derrota";
    };
    
    // Formatar data e hora combinando partes UTC enviadas pelo backend
    const formatarData = (p) => {
      const d = toLocalDate(p.data_realizacao, p.hora_realizacao);
      if (!d) return "";
      return new Intl.DateTimeFormat('pt-BR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(d);
    };

    const formatarHora = (p) => {
      const d = toLocalDate(p.data_realizacao, p.hora_realizacao);
      if (!d) return "";
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };
    
    const resultado = getResultado();
    
    return (
      <div className={`partida-container ${tipo}`}>
        <div className="partida-header">
          <span className="partida-tipo">
            {tipo === 'ultima' ? 'Última Partida' : 'Próxima Partida'}
          </span>
          <span className="partida-data">
            {formatarData(partida)} - {formatarHora(partida)}
          </span>
        </div>
        
        <div className="partida-times">
          <div className={`time ${isMandante ? 'time-favorito' : ''}`}>
            {config.showEscudos && (
              <img
                src={partida.time_mandante.escudo}
                alt={`Escudo ${partida.time_mandante.nome_popular}`}
                className="escudo-time"
                loading="lazy"
                onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_CREST; }}
                style={{ width: 40, height: 40, objectFit: "contain", display: "block" }}
              />
            )}
            <span className="nome-time" style={{ fontWeight: 600 }}>{partida.time_mandante.nome_popular}</span>
          </div>
          
          {tipo === 'ultima' ? (
            <div className="placar">
              <span className="gols">{partida.placar_mandante_final || 0}</span>
              <span className="separador">x</span>
              <span className="gols">{partida.placar_visitante_final || 0}</span>
            </div>
          ) : (
            <div className="vs">VS</div>
          )}
          
          <div className={`time ${isVisitante ? 'time-favorito' : ''}`}>
            {config.showEscudos && (
              <img
                src={partida.time_visitante.escudo}
                alt={`Escudo ${partida.time_visitante.nome_popular}`}
                className="escudo-time"
                loading="lazy"
                onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_CREST; }}
                style={{ width: 40, height: 40, objectFit: "contain", display: "block" }}
              />
            )}
            <span className="nome-time" style={{ fontWeight: 600 }}>{partida.time_visitante.nome_popular}</span>
          </div>
        </div>
        
        {resultado && (
          <div className={`resultado-badge ${resultado}`}>
            {resultado === 'vitoria' && 'Vitória'}
            {resultado === 'derrota' && 'Derrota'}
            {resultado === 'empate' && 'Empate'}
          </div>
        )}
        
        <div className="partida-info">
          <span className="estadio">{partida.estadio?.nome_popular || "Estádio a definir"}</span>
          <span className="campeonato">{partida.campeonato?.nome || "Campeonato"}</span>
        </div>
      </div>
    );
  };
  
  // Componente para usar o widget incorporável oficial
  const EmbeddedWidget = ({ timeId }) => {
    // Chave mockada ou vazia para desenvolvimento
    const apiKey = "test_33d8ba6573c32c484278a08eab6f1f"; // Defina a chave diretamente aqui
    
    useEffect(() => {
      try {
        // Criar o script para o widget
        const script = document.createElement('script');
        script.src = 'https://api.api-futebol.com.br/v1/widget-partidas.js';
        script.setAttribute('data-chave', apiKey);
        script.setAttribute('data-modo', 'ultimas-proximas');
        script.setAttribute('data-time', timeId);
        
        const container = document.getElementById('widget-container');
        if (container) {
          container.appendChild(script);
        } else {
          console.error("Container de widget não encontrado");
        }
        
        return () => {
          // Limpar o script ao desmontar
          const container = document.getElementById('widget-container');
          if (container) {
            container.innerHTML = '';
          }
        };
      } catch (error) {
        console.error("Erro ao carregar widget externo:", error);
      }
    }, [timeId, apiKey]);
    
    return (
      <div id="widget-container" style={{ width: '100%', height: '100%' }}>
        {/* Conteúdo de fallback se o widget não carregar */}
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Carregando dados do time {timeId}...</p>
        </div>
      </div>
    );
  };
  
  // Renderizar o widget de loading (snippet substitui o bloco atual)
  if (loading) {
    return (
      <div
        className="widget-jogos-loading"
        style={{
          maxHeight: "220px",
          minHeight: "160px",
          overflow: "auto",
          padding: "12px",
          borderRadius: "8px",
          boxSizing: "border-box",
          background: "#fffaf7",
          border: "1px solid #f0d9d9",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>Carregando dados de jogos...</p>
        <div className="loader" style={{ marginTop: 12 }}></div>
        <button
          className="btn-secondary"
          onClick={() => {
            if (timeoutId) clearTimeout(timeoutId);
            setLoading(false);
            requestInProgress.current = false;
            // Remover o showConfig, pois não é mais usado
            // setShowConfig(true);
          }}
          style={{ marginTop: "12px", padding: "8px 16px" }}
        >
          Cancelar
        </button>
      </div>
    );
  }
  
  // Renderizar mensagem de erro se houver
  if (error) {
    return (
      <div
        className="widget-jogos-error"
        style={{
          maxHeight: "220px",
          overflow: "auto",
          padding: "12px",
          borderRadius: "8px",
          boxSizing: "border-box",
          background: "#fff6f6",
          border: "1px solid #f5c6cb"
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, color: "#721c24" }}>{error}</p>
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button
            className="btn-primary"
            onClick={() => {
              console.log("Botão Configurar Time Favorito clicado");
              if (typeof onConfigure === 'function') {
                onConfigure();
              } else {
                console.error("onConfigure não é uma função ou não foi fornecido");
              }
            }}
            style={{ flex: 1 }}
          >
            Configurar Time Favorito ⚙️
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              console.log("Botão Tentar novamente clicado");
              if (config.timeId) {
                fetchJogosTime(config.timeId);
              } else {
                setError("Selecione um time favorito primeiro");
              }
            }}
            style={{ flex: 1 }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }
  
  // Buscar o time selecionado
  const timeSelecionado = CLUBES_SERIE_A.find(t => t.id.toString() === config.timeId?.toString());
  
  // Se não temos dados de partidas, mostrar uma mensagem para o usuário
  if (!ultimaPartida && !proximaPartida) {
    return (
      <div className="widget-jogos">
        <div className="jogos-content">
          {timeSelecionado && (
            <div className="clube-header">
              {config.showEscudos && (
                <img
                  src={timeSelecionado.escudo}
                  alt={`Escudo ${timeSelecionado.nome}`}
                  className="clube-escudo"
                  loading="lazy"
                  onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_CREST; }}
                  style={{ width: 48, height: 48, objectFit: "contain" }}
                />
              )}
              <h3 className="clube-nome" style={{ fontWeight: 600 }}>{timeSelecionado.nome}</h3>
            </div>
          )}
          
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '20px',
            textAlign: 'center'
          }}>
            <p>Não foram encontradas partidas para este time.</p>
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
              Tente novamente mais tarde ou selecione outro time.
            </p>
          </div>
          
          <div className="widget-footer">
            <button 
              className="widget-config-btn" 
              onClick={(e) => {
                e.stopPropagation();
                onConfigure();
              }}
              title="Configurar time favorito"
            >
              ⚙️
            </button>
            <button
              className="widget-remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (!onRemove) return;
                if (window.confirm("Remover este widget do seu painel?")) {
                  onRemove();
                }
              }}
              title="Remover widget"
              style={{ marginLeft: 8 }}
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Renderizar as partidas normalmente
  return (
    <div className="widget-jogos">
      <div className="jogos-content">
        {timeSelecionado && (
          <div className="clube-header">
            {config.showEscudos && (
              <img
                src={timeSelecionado.escudo}
                alt={`Escudo ${timeSelecionado.nome}`}
                className="clube-escudo"
                loading="lazy"
                onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_CREST; }}
                style={{ width: 48, height: 48, objectFit: "contain" }}
              />
            )}
            <h3 className="clube-nome" style={{ fontWeight: 600 }}>{timeSelecionado.nome}</h3>
          </div>
        )}
        
        <div className="partidas-container">
          {ultimaPartida && (
            <PartidaCard 
              partida={ultimaPartida} 
              tipo="ultima" 
            />
          )}
          
          {proximaPartida && (
            <PartidaCard 
              partida={proximaPartida} 
              tipo="proxima" 
            />
          )}
        </div>
      </div>
    </div>
  );
}