import React, { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import PaletteIcon from '@mui/icons-material/Palette';
// Novos ícones para o cabeçalho
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LightModeIcon from '@mui/icons-material/LightMode';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import WidgetCard from "./WidgetCard";
import AddWidgetModal from "./AddWidgetModal";
import AppearanceModal from "./AppearanceModal";
import Notification from './Notification';
// Importar o modal de configuração do WidgetJogos
import WidgetJogosConfig from "./widgets/WidgetJogosConfig";
import WidgetNewsConfig from "./widgets/WidgetNewsConfig";
import WidgetShortcutsConfig from "./widgets/WidgetShortcutsConfig";
import './styles/dashboard.css';
import './styles/components/header.css';
import './styles/components/buttons.css';
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

// API key para OpenWeatherMap (gratuita)
const WEATHER_API_KEY = "71ce78b06a4152f39338f99f315bd92b"; // Obtenha em: https://openweathermap.org/api

const CLUBES_SERIE_A = [
  { id: 1776, nome: "São Paulo", escudo: "https://logodetimes.com/times/sao-paulo/logo-sao-paulo-256.png" },
  { id: 1765, nome: "Fluminense", escudo: "https://logodetimes.com/times/fluminense/logo-fluminense-256.png" },
  { id: 1766, nome: "Atlético Mineiro", escudo: "https://logodetimes.com/times/atletico-mineiro/logo-atletico-mineiro-256.png" },
  { id: 1767, nome: "Grêmio", escudo: "https://logodetimes.com/times/gremio/logo-gremio-256.png" },
  { id: 1769, nome: "Palmeiras", escudo: "https://logodetimes.com/times/palmeiras/logo-palmeiras-256.png" },
  { id: 1770, nome: "Botafogo", escudo: "https://logodetimes.com/times/botafogo/logo-botafogo-256.png" },
  { id: 1771, nome: "Cruzeiro", escudo: "https://logodetimes.com/times/cruzeiro/logo-cruzeiro-256.png" },
  { id: 1777, nome: "Bahia", escudo: "https://logodetimes.com/times/bahia/logo-bahia-256.png" },
  { id: 1778, nome: "Sport", escudo: "https://th.bing.com/th/id/OIP.AD7kitf-NPc7d3Z8mjFVhwHaIS?w=149&h=180&c=7&r=0&o=7&pid=1.7&rm=3" },
  { id: 1779, nome: "Corinthians", escudo: "https://logodetimes.com/times/corinthians/logo-corinthians-256.png" },
  { id: 1780, nome: "Vasco", escudo: "https://wallpapercave.com/wp/wp1988597.png" },
  { id: 1782, nome: "Vitória", escudo: "https://logodetimes.com/times/vitoria/logo-vitoria-256.png" },
  { id: 1783, nome: "Flamengo", escudo: "https://logodetimes.com/times/flamengo/logo-flamengo-256.png" },
  { id: 1837, nome: "Ceará", escudo: "https://logodetimes.com/times/ceara/logo-ceara-256.png" },
  { id: 3984, nome: "Fortaleza", escudo: "https://logodetimes.com/times/fortaleza/logo-fortaleza-256.png" },
  { id: 4245, nome: "Juventude", escudo: "https://logodetimes.com/times/juventude/logo-juventude-256.png" },
  { id: 4286, nome: "RB Bragantino", escudo: "data:image/webp;base64,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" },
  { id: 4364, nome: "Mirassol", escudo: "https://logodetimes.com/times/mirassol/logo-mirassol-256.png" },
  { id: 6684, nome: "Internacional", escudo: "https://logodetimes.com/times/internacional/logo-internacional-256.png" },
  { id: 6685, nome: "Santos", escudo: "https://logodetimes.com/times/santos/logo-santos-256.png" }
];

// Registry de tipos de widgets com seus tamanhos padrão e mínimos
const WIDGET_DEFAULTS = {
  1: { defaultW: 3, defaultH: 3, minW: 3, minH: 3, maxW: 4 }, // Notícias
  2: { defaultW: 3, defaultH: 2, minW: 3, minH: 2, maxW: 4 }, // Lista de Compras
  3: { defaultW: 3, defaultH: 3, minW: 3, minH: 2, maxW: 4 }, // Lembretes
  4: { defaultW: 3, defaultH: 2, minW: 3, minH: 2, maxW: 4 }, // Saúde
  5: { defaultW: 3, defaultH: 3, minW: 3, minH: 3, maxW: 4 }, // 
  6: { defaultW: 3, defaultH: 3, minW: 3, minH: 3, maxW: 4 }, // 
  7: { defaultW: 3, defaultH: 3, minW: 3, minH: 3, maxW: 4 }, // 
  8: { defaultW: 3, defaultH: 3, minW: 3, minH: 3, maxW: 4 }, // Ideias
  9: { defaultW: 3, defaultH: 3, minW: 3, minH: 3, maxW: 4 }, // Atalhos
  10: { defaultW: 3, defaultH: 3, minW: 3, minH: 3, maxW: 4 }, // Jogos
  11: { defaultW: 3, defaultH: 3, minW: 3, minH: 3, maxW: 4 }, // 
  12: { defaultW: 3, defaultH: 3, minW: 3, minH: 3, maxW: 4 }, // 
};

// ADICIONAR TÓPICOS DISPONÍVEIS PARA NOTÍCIAS
const AVAILABLE_TOPICS = [
  { id: "technology", name: "Tecnologia" },
  { id: "business", name: "Finanças" },
  { id: "health", name: "Saúde" },
  { id: "science", name: "Ciência" },
  { id: "sports", name: "Esportes" },
  { id: "entertainment", name: "Entretenimento" },
  { id: "general", name: "Geral" }
];

export default function Dashboard() {
  // Estado para os widgets atuais (array de objetos com propriedades de layout)
  const [widgets, setWidgets] = useState([]);
  const [layouts, setLayouts] = useState({ lg: [], md: [], sm: [] });
  const [showModal, setShowModal] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const [bgColor, setBgColor] = useState(
    localStorage.getItem("dashboard_background_color") || "#f6f8fc"
  );
  const [frontendName, setFrontendName] = useState(
    localStorage.getItem("dashboard_name") || "Seu Front End"
  );
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(frontendName);
  const [context, setContext] = useState({
    location: "Carregando localização...",
    temperature: "Carregando...",
    datetime: new Date().toLocaleString(),
    isLocationLoading: true,
    locationError: null
  });
  const [nextWidgetId, setNextWidgetId] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // ADICIONAR NOVOS ESTADOS PARA CONFIGURAÇÃO DE WIDGETS
  const [showJogosConfig, setShowJogosConfig] = useState(false);
  const [jogosConfigWidget, setJogosConfigWidget] = useState(null);
  const [showNewsConfig, setShowNewsConfig] = useState(false);
  const [newsConfigWidget, setNewsConfigWidget] = useState(null);

  const [showShortcutsConfig, setShowShortcutsConfig] = useState(false);
  const [shortcutsConfigWidget, setShortcutsConfigWidget] = useState(null);

  // Carrega o layout salvo no localStorage quando o componente é montado
  useEffect(() => {
    try {
      const savedLayout = localStorage.getItem("myfeu:dashboard:layout:1");
      if (savedLayout) {
        const { widgets: savedWidgets, layouts: savedLayouts } = JSON.parse(savedLayout);
        setWidgets(savedWidgets);
        setLayouts(savedLayouts);
        
        // Encontra o próximo ID disponível
        if (savedWidgets.length > 0) {
          const maxId = Math.max(...savedWidgets.map(w => parseInt(w.i)));
          setNextWidgetId(maxId + 1);
        }
      } else {
        // Se não há layout salvo, inicializa com layout vazio
        setWidgets([]);
        setLayouts({ 
          lg: [], // desktop: 12 colunas
          md: [], // tablet: 6 colunas
          sm: []  // mobile: 1 coluna
        });
      }
      setIsInitialLoad(false);
    } catch (error) {
      console.error("Erro ao carregar o layout:", error);
      setIsInitialLoad(false);
    }
  }, []);

  // Salva o layout no localStorage quando há mudanças
  useEffect(() => {
    if (!isInitialLoad) {
      const saveTimeout = setTimeout(() => {
        try {
          localStorage.setItem(
            "myfeu:dashboard:layout:1", 
            JSON.stringify({ widgets, layouts })
          );
        } catch (error) {
          console.error("Erro ao salvar o layout:", error);
        }
      }, 300); // Debounce de 300ms

      return () => clearTimeout(saveTimeout);
    }
  }, [widgets, layouts, isInitialLoad]);

  // Salva o nome do frontend quando alterado
  useEffect(() => {
    localStorage.setItem("dashboard_name", frontendName);
  }, [frontendName]);

  // Salva a cor de fundo quando alterada
  useEffect(() => {
    localStorage.setItem("dashboard_background_color", bgColor);
  }, [bgColor]);

  // Busca de geolocalização e clima
  useEffect(() => {
    const getLocationAndWeather = async () => {
      // Verificar cache
      const cachedData = localStorage.getItem("myfeu:location_data");
      if (cachedData) {
        const data = JSON.parse(cachedData);
        // Cache válido por 1 hora
        if (Date.now() - data.timestamp < 3600000) {
          setContext(prev => ({
            ...prev, 
            location: data.location,
            temperature: data.temperature,
            isLocationLoading: false
          }));
          return;
        }
      }
      
      // Se não há cache válido, buscar novos dados
      setContext(prev => ({
        ...prev,
        isLocationLoading: true
      }));
      
      if (navigator.geolocation) {
        try {
          // Obter posição atual
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 3600000 // 1 hora
            });
          });
          
          const { latitude, longitude } = position.coords;
          
          // Buscar localização via Nominatim (OpenStreetMap)
          const nominatimRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=pt-BR`,
            { headers: {'User-Agent': 'MyFEU Dashboard Application'} }
          );
          
          if (!nominatimRes.ok) throw new Error("Falha ao obter dados de localização");
          
          const locationData = await nominatimRes.json();
          const city = locationData.address.city || 
                      locationData.address.town || 
                      locationData.address.village || 
                      locationData.address.municipality || 
                      "Desconhecida";
          const state = locationData.address.state || "";
          const country = locationData.address.country_code?.toUpperCase() || "";
          
          const locationString = `${city} | ${state} | ${country}`;
          
          // Buscar temperatura via Open-Meteo (sem API key)
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`
          );
          
          if (!weatherRes.ok) throw new Error("Falha ao obter dados meteorológicos");
          
          const weatherData = await weatherRes.json();
          const temperature = weatherData.current?.temperature_2m 
            ? `${Math.round(weatherData.current.temperature_2m)}°C` 
            : "Indisponível";
          
          // Atualizar contexto
          setContext(prev => ({
            ...prev,
            location: locationString,
            temperature: temperature,
            isLocationLoading: false
          }));
          
          // Salvar no cache
          localStorage.setItem("myfeu:location_data", JSON.stringify({
            location: locationString,
            temperature: temperature,
            timestamp: Date.now()
          }));
          
        } catch (error) {
          console.error("Erro ao obter localização/clima:", error);
          
          // Tentar usar cache, mesmo que expirado
          if (cachedData) {
            const data = JSON.parse(cachedData);
            setContext(prev => ({
              ...prev,
              location: data.location,
              temperature: data.temperature,
              isLocationLoading: false,
              locationError: `Usando dados em cache. ${error.message}`
            }));
            
            showNotification("Usando dados de localização em cache", "warning");
          } else {
            setContext(prev => ({
              ...prev,
              location: "Localização indisponível",
              temperature: "Indisponível",
              isLocationLoading: false,
              locationError: error.message
            }));
            
            showNotification("Não foi possível obter sua localização", "warning");
          }
        }
      } else {
        // Navegador não suporta geolocalização
        setContext(prev => ({
          ...prev,
          location: "Geolocalização não suportada",
          temperature: "Indisponível",
          isLocationLoading: false
        }));
      }
    };
    
    // Iniciar busca
    getLocationAndWeather();
    
    // Atualizar a cada 1 hora
    const updateInterval = setInterval(getLocationAndWeather, 3600000);
    return () => clearInterval(updateInterval);
  }, []); // Executar apenas na montagem do componente

  // Salva o layout no localStorage quando há mudanças
  useEffect(() => {
    if (!isInitialLoad) {
      const saveTimeout = setTimeout(() => {
        try {
          localStorage.setItem(
            "myfeu:dashboard:layout:1", 
            JSON.stringify({ widgets, layouts })
          );
        } catch (error) {
          console.error("Erro ao salvar o layout:", error);
        }
      }, 300); // Debounce de 300ms

      return () => clearTimeout(saveTimeout);
    }
  }, [widgets, layouts, isInitialLoad]);

  // Salva o nome do frontend quando alterado
  useEffect(() => {
    localStorage.setItem("dashboard_name", frontendName);
  }, [frontendName]);

  // Salva a cor de fundo quando alterada
  useEffect(() => {
    localStorage.setItem("dashboard_background_color", bgColor);
  }, [bgColor]);

  // Atualiza data/hora a cada segundo
  useEffect(() => {
    const updateDateTime = () => {
      setContext(prev => ({
        ...prev,
        datetime: new Date().toLocaleString()
      }));
    };

    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Função para adicionar um widget
  const handleWidgetAdded = (newWidget) => {
    // Obter as configurações de tamanho para este tipo de widget
    const widgetType = newWidget.widget_id;
    const {
      defaultW = 4,
      defaultH = 2,
      minW = 3,
      minH = 2,
      maxW = 4
    } = WIDGET_DEFAULTS[widgetType] || {};

    // Criar um novo item para a grade
    const widgetId = nextWidgetId.toString();
    const newItem = {
      ...newWidget,
      i: widgetId,
    };

    // Função melhorada para calcular posicionamento em grade
    const calcGridPosition = (layout, cols) => {
      // Se não há widgets, começar no topo esquerdo
      if (!layout || layout.length === 0) return { x: 0, y: 0 };

      // Organizar os widgets por linha (y)
      let rows = {};
      layout.forEach(item => {
        if (!rows[item.y]) rows[item.y] = [];
        rows[item.y].push({
          x: item.x,
          w: item.w,
          right: item.x + item.w
        });
      });

      // Definir tamanho do widget baseado no breakpoint
      const widgetWidth = cols === 12 ? 3 : (cols === 6 ? 3 : 1);
      
      // Verificar cada linha começando do topo
      const rowKeys = Object.keys(rows).map(Number).sort((a, b) => a - b);
      
      // Primeiro, tentamos encontrar espaço em linhas existentes
      for (const y of rowKeys) {
        const rowItems = rows[y].sort((a, b) => a.x - b.x);
        
        // Verificar espaço no início da linha
        if (rowItems[0] && rowItems[0].x >= widgetWidth) {
          return { x: 0, y };
        }
        
        // Verificar espaços entre os widgets
        for (let i = 0; i < rowItems.length - 1; i++) {
          const gap = rowItems[i + 1].x - rowItems[i].right;
          if (gap >= widgetWidth) {
            return { x: rowItems[i].right, y };
          }
        }
        
        // Verificar espaço no final da linha
        const lastItem = rowItems[rowItems.length - 1];
        // Garantir espaço suficiente para este widget, respeitando o número de colunas
        if (lastItem.right + widgetWidth <= cols) {
          return { x: lastItem.right, y };
        }
      }
      
      // Se não encontrou espaço em nenhuma linha existente, criar nova linha
      return { x: 0, y: rowKeys.length > 0 ? Math.max(...rowKeys) + 1 : 0 };
    };

    // Calcular posições específicas para cada breakpoint
    const lgPos = calcGridPosition(layouts.lg || [], 12);
    const mdPos = calcGridPosition(layouts.md || [], 6);
    const smPos = calcGridPosition(layouts.sm || [], 1);

    // Criar layouts para cada breakpoint
    const lgLayout = {
      i: widgetId,
      x: lgPos.x,
      y: lgPos.y,
      w: 4, 
      h: defaultH,
      minW,
      minH,
      maxW
    };

    const mdLayout = {
      i: widgetId,
      x: mdPos.x,
      y: mdPos.y,
      w: Math.min(defaultW, 3), // Máximo 3 colunas para permitir 2 por linha
      h: defaultH,
      minW: Math.min(minW, 3),
      minH,
      maxW: 3
    };

    const smLayout = {
      i: widgetId,
      x: smPos.x,
      y: smPos.y,
      w: 1, // Em mobile, sempre ocupa a largura total
      h: defaultH,
      minW: 1,
      minH,
      maxW: 1
    };

    setWidgets(prevWidgets => [...prevWidgets, newItem]);
    setLayouts(prevLayouts => ({
      lg: [...(prevLayouts.lg || []), lgLayout],
      md: [...(prevLayouts.md || []), mdLayout],
      sm: [...(prevLayouts.sm || []), smLayout]
    }));
    
    setNextWidgetId(nextWidgetId + 1);
    setShowModal(false);

    // Mostrar notificação
    showNotification(`Widget ${newWidget.name} adicionado com sucesso!`, "success");
  };

  // Função para remover um widget
  const removeWidget = (widgetId) => {
    setWidgets(prevWidgets => prevWidgets.filter(widget => widget.i !== widgetId));
    setLayouts(prevLayouts => ({
      lg: prevLayouts.lg.filter(item => item.i !== widgetId),
      md: prevLayouts.md.filter(item => item.i !== widgetId),
      sm: prevLayouts.sm.filter(item => item.i !== widgetId)
    }));

    showNotification("Widget removido com sucesso", "info");
  };

  // Função para atualizar o layout quando o usuário arrastar ou redimensionar widgets
  const handleLayoutChange = (currentLayout, allLayouts) => {
    setLayouts(allLayouts);
  };

  // Gerenciamento de notificações
  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto-remoção após 5 segundos
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
    
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Anunciar mudanças para leitores de tela
  const announceForAccessibility = (message) => {
    const announcer = document.getElementById('accessibility-announcer');
    if (announcer) {
      announcer.textContent = message;
    }
  };

  // Função para atualizar um widget
  const handleRefreshWidget = (widgetId) => {
    console.log(`Atualizando widget ${widgetId}`);
      
    // Aqui você implementaria a lógica específica para cada tipo de widget
    const widget = widgets.find(w => w.i === widgetId);
    if (widget) {
      // Lógica específica por tipo de widget
      if (widget.widget_id === 1) {
        // Atualizar notícias
      } else if (widget.widget_id === 5) {
        // Atualizar jogos
      }
    }

    showNotification(`Widget atualizado`);
  };
  
  const handleConfigureWidget = (widget) => {
    console.log(`Configurando widget ${widget.i}, tipo: ${widget.widget_id}`);
    
    // Verificar o tipo do widget e abrir o modal apropriado
    if (widget.widget_id === 10) { // Widget de Jogos
      setJogosConfigWidget(widget);
      setShowJogosConfig(true);
    } else if (widget.widget_id === 1) { // Widget de Notícias
      setNewsConfigWidget(widget);
      setShowNewsConfig(true);
    } else if (widget.widget_id === 9) { // Widget de Atalhos
    setShortcutsConfigWidget(widget);
    setShowShortcutsConfig(true);
    } else if (widget.widget_id === 2) {
      // Lista de compras em desenvolvimento
      showNotification("Configuração de lista de compras em desenvolvimento", "info");
    } else if (widget.widget_id === 3) {
      // Lembretes em desenvolvimento
      showNotification("Configuração de lembretes em desenvolvimento", "info");
    } else if (widget.widget_id === 4) {
      // Saúde em desenvolvimento
      showNotification("Configuração de saúde em desenvolvimento", "info");
    } else {
      // Para outros widgets não implementados
      showNotification(`Configuração para ${widget.name} em desenvolvimento`, "info");
    }
  };

  // Adicionar função para salvar configuração de atalhos
  const handleSaveShortcutsConfig = async (newConfig) => {
    try {
      console.log("🔗 Salvando configuração de atalhos:", newConfig);
      const timestamp = Date.now();
      console.log("🔗 Timestamp gerado:", timestamp);

      // Atualizar o widget na lista
      setWidgets(prevWidgets => {
        const updatedWidgets = prevWidgets.map(w => 
          w.i === shortcutsConfigWidget.i 
            ? { 
                ...w, 
                config: newConfig,
                refreshTimestamp: timestamp
              }
            : w
        );
        console.log("🔗 Widgets atualizados:", updatedWidgets);
        return updatedWidgets;
      });

      // Salvar no localStorage
      const savedConfig = {
        ...newConfig,
        widgetId: shortcutsConfigWidget.i,
        timestamp: timestamp
      };
      localStorage.setItem(`widget_config_${shortcutsConfigWidget.i}`, JSON.stringify(savedConfig));
      console.log("🔗 Config salva no localStorage:", savedConfig);

      setShowShortcutsConfig(false);
      setShortcutsConfigWidget(null);

      showNotification("Configuração do widget de atalhos salva com sucesso!", "success");

    } catch (error) {
      console.error("🔗 Erro ao salvar configuração:", error);
      showNotification("Erro ao salvar configuração", "error");
    }
  };

  // NOVA FUNÇÃO PARA SALVAR CONFIGURAÇÃO DE JOGOS
  const handleSaveJogosConfig = async (newConfig) => {
    try {
      console.log("Salvando configuração de jogos:", newConfig);
      
      // Atualizar o widget na lista
      setWidgets(prevWidgets => 
        prevWidgets.map(w => 
          w.i === jogosConfigWidget.i 
            ? { 
                ...w, 
                config: newConfig,
                refreshTimestamp: Date.now(),
                // Adicionar dados pré-carregados se disponíveis
                preloadedData: newConfig.preloadedData || null
              }
            : w
        )
      );
      
      // Salvar no localStorage
      const savedConfig = {
        ...newConfig,
        widgetId: jogosConfigWidget.i
      };
      localStorage.setItem(`widget_config_${jogosConfigWidget.i}`, JSON.stringify(savedConfig));
      
      setShowJogosConfig(false);
      setJogosConfigWidget(null);
      
      showNotification("Configuração do widget de jogos salva com sucesso!", "success");
      
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      showNotification("Erro ao salvar configuração", "error");
    }
  };

  // NOVA FUNÇÃO PARA SALVAR CONFIGURAÇÃO DE NOTÍCIAS
  const handleSaveNewsConfig = async (newConfig) => {
    try {
      console.log("Salvando configuração de notícias:", newConfig);
      
      // Atualizar o widget na lista
      setWidgets(prevWidgets => 
        prevWidgets.map(w => 
          w.i === newsConfigWidget.i 
            ? { 
                ...w, 
                config: newConfig,
                refreshTimestamp: Date.now()
              }
            : w
        )
      );
      
      // Salvar no localStorage
      const savedConfig = {
        ...newConfig,
        widgetId: newsConfigWidget.i
      };
      localStorage.setItem(`widget_config_${newsConfigWidget.i}`, JSON.stringify(savedConfig));
      
      setShowNewsConfig(false);
      setNewsConfigWidget(null);
      
      showNotification("Configuração do widget de notícias salva com sucesso!", "success");
      
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      showNotification("Erro ao salvar configuração", "error");
    }
  };

  // Função para determinar o ícone da temperatura
  const getTemperatureIcon = () => {
    if (context.isLocationLoading) return null;
    
    // Extrair valor numérico da temperatura
    const tempMatch = context.temperature.match(/(\d+)/);
    if (!tempMatch) return <WbTwilightIcon className="header-card-icon" />;
    
    const temp = parseInt(tempMatch[1]);
    
    if (temp > 22) {
      return <LightModeIcon className="header-card-icon temperature-hot" />;
    } else if (temp >= 14 && temp <= 22) {
      return <WbTwilightIcon className="header-card-icon temperature-mild" />;
    } else {
      return <AcUnitIcon className="header-card-icon temperature-cold" />;
    }
  };

  return (
    <div className="dashboard-container" style={{ background: bgColor }}>
      <header className="dashboard-header">
        <div className="header-card">
          <div className="header-card-title">
            <LocationOnIcon className="header-card-icon location-icon" />
            <span>Localidade</span>
          </div>
          <div className="header-card-content">
            {context.isLocationLoading ? (
              <span className="loading-indicator">Carregando...</span>
            ) : (
              context.location
            )}
          </div>
        </div>
        
        <div className="header-card">
          <div className="header-card-title">
            {getTemperatureIcon()}
            <span>Temperatura</span>
          </div>
          <div className="header-card-content">
            {context.isLocationLoading ? (
              <span className="loading-indicator">Carregando...</span>
            ) : (
              context.temperature
            )}
          </div>
        </div>
        
        <div className="header-card">
          <div className="header-card-title">
            <QueryBuilderIcon className="header-card-icon datetime-icon" />
            <span>Data/Hora</span>
          </div>
          <div className="header-card-content">{context.datetime}</div>
        </div>
      </header>

      <div className="dashboard-title-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="dashboard-title">
          {editingName ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={() => {
                setFrontendName(tempName);
                setEditingName(false);
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  setFrontendName(tempName);
                  setEditingName(false);
                }
              }}
              autoFocus
            />
          ) : (
            <span onClick={() => setEditingName(true)}>{frontendName}</span>
          )}
        </h1>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />} 
            onClick={() => setShowModal(true)}
          >
            Adicionar Widget
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PaletteIcon />} 
            onClick={() => setShowAppearance(true)}
          >
            Aparência
          </Button>
        </div>
      </div>

      {/* NOVO GRID DINÂMICO */}
      <div 
        className="dashboard-dynamic-grid" 
        role="region" 
        aria-label="Área de Widgets do Dashboard"
      >
        {widgets.length === 0 ? (
          <div className="empty-dashboard">
            <div>
              <h2>Seu dashboard está vazio</h2>
              <p>Adicione widgets para personalizar seu dashboard</p>
              <button 
                className="btn-primary"
                onClick={() => setShowModal(true)}
              >
                + Adicionar seu primeiro widget
              </button>
            </div>
          </div>
        ) : (
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1025, md: 641, sm: 0 }}
            cols={{ lg: 12, md: 6, sm: 1 }}
            rowHeight={100}
            //width={1440}
            containerPadding={[8, 8]}
            margin={[12, 16]}
            onLayoutChange={handleLayoutChange}
            onDragStart={() => {
              setIsDragging(true);
              announceForAccessibility("Movendo widget. Use as setas para posicionar e Enter para confirmar.");
            }}
            onDragStop={() => {
              setIsDragging(false);
              announceForAccessibility("Widget reposicionado.");
            }}
            onResizeStart={() => {
              setIsResizing(true);
              announceForAccessibility("Redimensionando widget. Use Shift+setas para redimensionar e Enter para confirmar.");
            }}
            onResizeStop={() => {
              setIsResizing(false);
              announceForAccessibility("Widget redimensionado.");
            }}
            draggableHandle=".widget-drag-handle"
            useCSSTransforms={true}
            compactType="vertical"
            preventCollision={false}
            isBounded={true}
            isResizable={true}
            autoSize={true}
            verticalCompact={true}
          >
            {widgets.map((widget) => (
              <div key={widget.i} className="dashboard-widget-container">
                <WidgetCard
                  widget={widget}
                  onRemove={() => removeWidget(widget.i)}
                  onRefresh={() => handleRefreshWidget(widget.i)}
                  onConfigure={() => handleConfigureWidget(widget)}
                  isDragging={isDragging}
                  isResizing={isResizing}
                />
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </div>

      {/* Modais */}
      {showModal && (
        <AddWidgetModal
          onClose={() => setShowModal(false)}
          userId={1}
          onWidgetAdded={handleWidgetAdded}
        />
      )}
      
      {showAppearance && (
        <AppearanceModal
          currentColor={bgColor}
          onClose={() => setShowAppearance(false)}
          onSave={(color) => {
            setBgColor(color);
            setShowAppearance(false);
            showNotification("Aparência atualizada com sucesso");
          }}
        />
      )}

      {/* ADICIONAR O MODAL DE CONFIGURAÇÃO DE JOGOS APÓS OS OUTROS MODAIS */}
      {showJogosConfig && jogosConfigWidget && (
        <WidgetJogosConfig
          config={jogosConfigWidget.config || {}}
          onSave={handleSaveJogosConfig}
          onCancel={() => {
            setShowJogosConfig(false);
            setJogosConfigWidget(null);
          }}
          clubesDisponiveis={CLUBES_SERIE_A}
        />
      )}

      {/* ADICIONAR O MODAL DE CONFIGURAÇÃO DE NOTÍCIAS APÓS O MODAL DE JOGOS */}
      {showNewsConfig && newsConfigWidget && (
        <WidgetNewsConfig
          config={newsConfigWidget.config || {}}
          topics={AVAILABLE_TOPICS}
          onSave={handleSaveNewsConfig}
          onCancel={() => {
            setShowNewsConfig(false);
            setNewsConfigWidget(null);
          }}
        />
      )}

      {showShortcutsConfig && shortcutsConfigWidget && (
        <WidgetShortcutsConfig
          config={shortcutsConfigWidget.config || {}}
          onSave={handleSaveShortcutsConfig}
          onCancel={() => {
            setShowShortcutsConfig(false);
            setShortcutsConfigWidget(null);
          }}
        />
      )}

      {/* Notificações */}
      {notifications.map(({ id, message, type }) => (
        <Notification 
          key={id}
          message={message}
          type={type}
          onClose={() => removeNotification(id)}
        />
      ))}

      {/* Anunciador de acessibilidade */}
      <div 
        id="accessibility-announcer"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      ></div>

      <footer className="dashboard-footer">
        <span>MyFEU - made by (@rodrigoribeirorossi)</span>
      </footer>
    </div>
  );
}