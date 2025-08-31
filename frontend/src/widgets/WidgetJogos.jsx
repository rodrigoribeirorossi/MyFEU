import React, { useState, useEffect, useRef } from "react";
import WidgetJogosConfig from "./WidgetJogosConfig";
import axios from "axios";
import * as api from "../api"; // Importando da pasta src em vez de widgets
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
export default function WidgetJogos({ data, onRemove }) {
  // Garantir que data sempre seja um objeto
  data = data || {};

  logWithTime("Widget inicializado com dados:", data);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfig, setShowConfig] = useState(false); // Não mostrar config primeiro se já tiver timeId
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
    
    if (data?.config?.timeId) {
      return {
        ...defaultConfig,
        ...data.config
      };
    }
    
    return defaultConfig;
  });
  
  const isFirstRender = useRef(true);
  
  // Função para buscar jogos do time com timeout
  const fetchJogosTime = async (timeId) => {
    if (!timeId || requestInProgress.current) {
      logWithTime(`Ignorando busca: timeId inválido ou requisição em andamento. TimeId: ${timeId}, Em andamento: ${requestInProgress.current}`);
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
        logWithTime(`Timeout atingido para busca de dados do time ${timeId}`);
        setLoading(false);
        setError("Tempo limite excedido. Não foi possível carregar os dados do time.");
        requestInProgress.current = false;
      }
    }, API_TIMEOUT);
    
    setTimeoutId(id);
    
    try {
      logWithTime(`Iniciando busca de partidas para time ID: ${timeId}`);
      
      // Limpar cache primeiro para garantir dados atualizados
      try {
        await axios.get(`${API_URL}/cache/clear/times/${timeId}`);
        logWithTime("Cache limpo com sucesso");
      } catch (cacheError) {
        logWithTime("Erro ao limpar cache (continuando)", cacheError);
      }
      
      // Buscar dados da API
      const [ultimaRes, proximaRes] = await Promise.all([
        axios.get(`${API_URL}/times/${timeId}/partidas/ultimas`),
        axios.get(`${API_URL}/times/${timeId}/partidas/proximas`)
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
        setError(`Não foram encontradas partidas para ${CLUBES_SERIE_A.find(t => t.id === parseInt(timeId))?.nome}. Os dados podem não estar disponíveis no momento.`);
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
  
  // Efeito para carregar jogos quando o componente montar ou quando a configuração mudar
  useEffect(() => {
    // Carregar configuração salva do localStorage
    if (isFirstRender.current) {
      logWithTime("Primeira renderização, verificando configuração salva");
      
      try {
        const savedConfig = localStorage.getItem('jogosWidgetConfig');
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          logWithTime("Configuração encontrada no localStorage:", parsedConfig);
          
          setConfig(prevConfig => ({
            ...prevConfig,
            ...parsedConfig
          }));
          
          // Se já temos um time salvo, podemos mostrar os dados dele
          if (parsedConfig.timeId) {
            logWithTime(`Time já configurado (ID: ${parsedConfig.timeId}), carregando dados`);
            setShowConfig(false); // Não mostrar config se já temos timeId
            
            // Tentar limpar o cache primeiro
            axios.get(`${API_URL}/cache/clear/times/${parsedConfig.timeId}`)
              .then(() => {
                logWithTime(`Cache do time ID ${parsedConfig.timeId} limpo com sucesso`);
                setTimeout(() => fetchJogosTime(parsedConfig.timeId), 300);
              })
              .catch(error => {
                logWithTime(`Erro ao limpar cache: ${error.message}`, error);
                
                // Tentar método alternativo - forçar atualização via endpoint refresh
                logWithTime("Tentando refresh alternativo dos dados");
                axios.post(`${API_URL}/times/${parsedConfig.timeId}/refresh`)
                  .then(() => logWithTime("Refresh de dados solicitado com sucesso"))
                  .catch(e => logWithTime("Erro no refresh alternativo", e));
              
                // Continuar com o fetch mesmo sem limpar o cache
                setTimeout(() => fetchJogosTime(parsedConfig.timeId), 300);
              });
          } else {
            logWithTime("Nenhum time configurado, exibindo tela de configuração");
            setShowConfig(true);
          }
        } else {
          logWithTime("Nenhuma configuração encontrada, exibindo tela de configuração");
          setShowConfig(true);
        }
        
        isFirstRender.current = false;
      } catch (error) {
        logWithTime("Erro ao carregar configurações:", error);
        setShowConfig(true);
      }
    }
    
    // Limpar todos os timeouts ao desmontar
    return () => {
      if (timeoutId) {
        logWithTime("Limpando timeout ao desmontar componente");
        clearTimeout(timeoutId);
      }
    };
  }, []);
  
  // Função para salvar a configuração
  const saveConfig = (newConfig) => {
    logWithTime("Tentando salvar configuração:", newConfig);
    
    if (!newConfig.timeId) {
      logWithTime("Tentativa de salvar sem time selecionado");
      alert("Por favor, selecione um time antes de salvar.");
      return;
    }
    
    // Atualizar o estado
    setConfig(newConfig);
    setShowConfig(false);
    
    // Salvar no localStorage
    try {
      localStorage.setItem('jogosWidgetConfig', JSON.stringify(newConfig));
      logWithTime("Configuração salva no localStorage com sucesso");
    } catch (error) {
      logWithTime("Erro ao salvar no localStorage:", error);
    }
    
    // Limpar cache antes de carregar dados novos
    logWithTime(`Limpando cache do time ID ${newConfig.timeId} antes de carregar dados`);
    axios.get(`${API_URL}/cache/clear/times/${newConfig.timeId}`)
      .then(() => {
        logWithTime("Cache limpo com sucesso");
        // Carregar os jogos do time selecionado
        fetchJogosTime(newConfig.timeId);
      })
      .catch(error => {
        logWithTime("Erro ao limpar cache (continuando mesmo assim):", error);
        // Mesmo com erro, continuar com o carregamento
        fetchJogosTime(newConfig.timeId);
      });
  };
  
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
  
  // Renderizar a configuração primeiro se necessário
  if (showConfig) {
    return (
      <WidgetJogosConfig 
        config={config} 
        onSave={saveConfig} 
        onCancel={() => {
          if (config.timeId) {
            setShowConfig(false);
            fetchJogosTime(config.timeId);
          }
        }}
        clubesDisponiveis={CLUBES_SERIE_A}
      />
    );
  }
  
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
            setShowConfig(true);
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
            onClick={() => setShowConfig(true)}
            style={{ flex: 1 }}
          >
            Configurar Time Favorito ⚙️
          </button>
          <button
            className="btn-secondary"
            onClick={() => fetchJogosTime(config.timeId)}
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
                setShowConfig(true);
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