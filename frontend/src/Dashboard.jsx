import React, { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import PaletteIcon from '@mui/icons-material/Palette';
import WidgetCard from "./WidgetCard";
import AddWidgetModal from "./AddWidgetModal";
import AppearanceModal from "./AppearanceModal";
import Notification from './Notification';
import './styles/dashboard.css';
import './styles/components/header.css';
import './styles/components/buttons.css';
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

// API key para OpenWeatherMap (gratuita)
const WEATHER_API_KEY = "71ce78b06a4152f39338f99f315bd92b"; // Obtenha em: https://openweathermap.org/api

// Registry de tipos de widgets com seus tamanhos padrão e mínimos
const WIDGET_DEFAULTS = {
  1: { defaultW: 3, defaultH: 3, minW: 3, minH: 3, maxW: 4 }, // Notícias
  2: { defaultW: 3, defaultH: 2, minW: 3, minH: 2, maxW: 4 }, // Lista de Compras
  3: { defaultW: 3, defaultH: 3, minW: 3, minH: 2, maxW: 4 }, // Lembretes
  4: { defaultW: 3, defaultH: 2, minW: 3, minH: 2, maxW: 4 }, // Saúde
  5: { defaultW: 3, defaultH: 3, minW: 3, minH: 3, maxW: 4 }, // Jogos
};

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
    // Implementar lógica para abrir configuração específica do widget
    console.log(`Configurando widget ${widget.i}`);
    
    // Exemplo de implementação:
    if (widget.widget_id === 1) {
      // Abrir configuração de WidgetNews
      // setNewsConfigWidget(widget);
      // setShowNewsConfig(true);
    } else if (widget.widget_id === 5) {
      // Abrir configuração de WidgetJogos
      // setJogosConfigWidget(widget);
      // setShowJogosConfig(true);
    }
  };

  return (
    <div className="dashboard-container" style={{ background: bgColor }}>
      <header className="dashboard-header">
        <div className="header-card">
          <div className="header-card-title">Localidade</div>
          <div className="header-card-content">
            {context.isLocationLoading ? (
              <span className="loading-indicator">Carregando...</span>
            ) : (
              context.location
            )}
          </div>
        </div>
        
        <div className="header-card">
          <div className="header-card-title">Temperatura</div>
          <div className="header-card-content">
            {context.isLocationLoading ? (
              <span className="loading-indicator">Carregando...</span>
            ) : (
              context.temperature
            )}
          </div>
        </div>
        
        <div className="header-card">
          <div className="header-card-title">Data/Hora</div>
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