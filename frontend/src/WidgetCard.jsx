import React, { Suspense, useState } from "react";
import './styles/widgets/common.css';

// Importar ícones do Material-UI para ações
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// Importar ícones específicos para cada widget
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined';           // Notícias (feed de notícias)
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'; // Lista de Compras
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';       // Lembretes (notas com calendário)
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined'; // Saúde
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';     // Repositório/Arquivos
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';   // Jogos e Resultados
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'; // Contas/Pagamentos
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';     // Bolsa de Valores
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';             // Atalhos
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';       // Ideias
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';       // Ferramentas/Calculadora
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'; // Alertas Redes Sociais
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined'; // Widget genérico

// Flag para controlar logs de debug
const DEBUG = false;

// Adicione esta constante WIDGET_DEFAULTS que está faltando
const WIDGET_DEFAULTS = {
  1: { defaultW: 3, defaultH: 3, minW: 3, minH: 3, maxW: 4 }, // Notícias
  2: { defaultW: 3, defaultH: 2, minW: 3, minH: 2, maxW: 4 }, // Lista de Compras
  3: { defaultW: 3, defaultH: 3, minW: 3, minH: 2, maxW: 4 }, // Lembretes
  4: { defaultW: 3, defaultH: 2, minW: 3, minH: 2, maxW: 4 }, // Saúde
  5: { defaultW: 3, defaultH: 2, minW: 3, minH: 2, maxW: 4 }, // Repositório/Arquivos
  6: { defaultW: 3, defaultH: 2, minW: 3, minH: 2, maxW: 4 }, // Contas/Pagamentos
  7: { defaultW: 3, defaultH: 2, minW: 3, minH: 2, maxW: 4 }, // Bolsa de Valores
  8: { defaultW: 3, defaultH: 2, minW: 3, minH: 2, maxW: 4 }, // Ideias
  9: { defaultW: 3, defaultH: 2, minW: 3, minH: 2, maxW: 4 }, // Atalhos
  10: { defaultW: 3, defaultH: 3, minW: 3, minH: 3, maxW: 4 }, // Jogos e Resultados
  11: { defaultW: 3, defaultH: 2, minW: 3, minH: 2, maxW: 4 }, // Ferramentas
  12: { defaultW: 3, defaultH: 2, minW: 3, minH: 2, maxW: 4 }, // Alertas Redes Sociais
};

// Mapear ícones Material-UI para cada tipo de widget
const getWidgetIcon = (widgetId) => {
  const iconMap = {
    1: <FeedOutlinedIcon sx={{ fontSize: '1.1rem' }} />,                    // Notícias
    2: <ShoppingCartOutlinedIcon sx={{ fontSize: '1.1rem' }} />,            // Lista de Compras
    3: <EventNoteOutlinedIcon sx={{ fontSize: '1.1rem' }} />,               // Lembretes
    4: <HealthAndSafetyOutlinedIcon sx={{ fontSize: '1.1rem' }} />,         // Saúde
    5: <FolderOpenOutlinedIcon sx={{ fontSize: '1.1rem' }} />,              // Repositório/Arquivos
    6: <AccountBalanceWalletOutlinedIcon sx={{ fontSize: '1.1rem' }} />,    // Contas/Pagamentos
    7: <TrendingUpOutlinedIcon sx={{ fontSize: '1.1rem' }} />,              // Bolsa de Valores
    8: <LightbulbOutlinedIcon sx={{ fontSize: '1.1rem' }} />,                  // Ideias
    9: <LaunchOutlinedIcon sx={{ fontSize: '1.1rem' }} />,               // Atalhos
    10: <SportsSoccerIcon sx={{ fontSize: '1.1rem' }} />,            // Jogos e Resultados
    11: <CalculateOutlinedIcon sx={{ fontSize: '1.1rem' }} />,              // Ferramentas
    12: <NotificationsOutlinedIcon sx={{ fontSize: '1.1rem' }} />,          // Alertas Redes Sociais
  };
  return iconMap[widgetId] || <PhoneAndroidOutlinedIcon sx={{ fontSize: '1.1rem' }} />; // Fallback genérico
};

// Importações dinâmicas para evitar erros quando um componente não existe
const WidgetComponents = {
  1: React.lazy(() => import("./widgets/WidgetNews")),
  2: React.lazy(() => import("./widgets/WidgetShoppingList")),
  3: React.lazy(() => import("./widgets/WidgetReminders")),
  4: React.lazy(() => import("./widgets/WidgetHealth")),
  5: React.lazy(() => import("./widgets/WidgetRepository")), // Se existir
  6: React.lazy(() => import("./widgets/WidgetPayments")),   // Se existir
  7: React.lazy(() => import("./widgets/WidgetStocks")),     // Se existir
  8: React.lazy(() => import("./widgets/WidgetIdeas")),  // Se existir
  9: React.lazy(() => import("./widgets/WidgetShortcuts")),      
  10: React.lazy(() => import("./widgets/WidgetJogos")),
  11: React.lazy(() => import("./widgets/WidgetTools")),     // Se existir
  12: React.lazy(() => import("./widgets/WidgetAlerts"))     // Se existir
  // Adicione outros widgets aqui conforme necessário
};

export default function WidgetCard({ widget, onRemove, isDragging, isResizing, onRefresh, onConfigure }) {
  // Estado para rastrear se o componente está sendo atualizado
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Adicionar lógica adequada para as ações
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Se um manipulador externo foi fornecido, use-o
    if (onRefresh) {
      onRefresh();
    }
    
    // Simulação de atualização (remover em produção)
    setTimeout(() => setIsRefreshing(false), 800);
  };
  
  const handleConfigure = () => {
    // Se um manipulador externo foi fornecido, use-o
    if (onConfigure) {
      onConfigure(widget);
    }
  };
  
  // Função para renderizar o componente específico do widget
  const renderWidgetContent = (widget) => {
    console.log('🔍 [DEBUG] Renderizando widget:', widget);
    console.log('🔍 [DEBUG] Widget ID:', widget.widget_id);
    console.log('🔍 [DEBUG] Widget nome:', widget.name);

    try {
      const WidgetComponent = WidgetComponents[widget.widget_id];
      
      console.log(`🔍 [DEBUG] Componente para ID ${widget.widget_id}:`, WidgetComponent ? "Encontrado" : "Não encontrado");
      
      if (WidgetComponent) {
        return (
          <Suspense fallback={
            <div className="widget-loading">
              <div className="widget-loading-spinner"></div>
              <p>Carregando widget...</p>
            </div>
          }>
            <WidgetComponent 
              data={widget} 
              onRemove={onRemove} 
              onConfigure={() => handleConfigure()} 
            />
          </Suspense>
        );
      }
      
      // Componente não encontrado
      console.error(`❌ [ERROR] Componente não encontrado para widget ID ${widget.widget_id}`);
      return (
        <div className="widget-error">
          <h4>{widget.name} {getWidgetIcon(widget.widget_id)}</h4>
          <p>Componente não encontrado (ID: {widget.widget_id})</p>
        </div>
      );
    } catch (error) {
      console.error("❌ [ERROR] Erro ao renderizar widget:", error);
      return (
        <div className="widget-error">
          <h4>Erro ao carregar widget</h4>
          <p>{error.message}</p>
        </div>
      );
    }
  };

  // Função para renderizar o ícone do widget
  const renderWidgetIcon = () => {  
    // Sempre usar o ícone baseado no widget_id - sempre usar o Material-UI
    return getWidgetIcon(widget.widget_id);
  };

  return (
    <div 
      className={`widget-card ${isDragging ? 'is-dragging' : ''} ${isResizing ? 'is-resizing' : ''}`}
      data-max-width={WIDGET_DEFAULTS[widget.widget_id]?.maxW || 4}
    >
      <div className="widget-header">
        <div className="widget-drag-handle" title="Arrastar para mover">
          <span className="widget-title">
            {renderWidgetIcon()} {widget.name}
          </span>
        </div>
      </div>
      <div className="widget-content">
        {renderWidgetContent(widget)}
      </div>
      <div className="widget-footer">
        <button 
          className={`widget-refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
          onClick={handleRefresh} 
          aria-label="Atualizar"
          disabled={isRefreshing}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <RefreshOutlinedIcon 
            sx={{ 
              fontSize: '16px',
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
            }} 
          />
        </button>
        <button 
          className="widget-config-btn" 
          onClick={handleConfigure} 
          aria-label="Configurar"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <SettingsOutlinedIcon sx={{ fontSize: '16px' }} />
        </button>
        <button 
          className="widget-remove-btn" 
          onClick={onRemove} 
          aria-label="Remover"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <DeleteOutlineIcon sx={{ fontSize: '16px' }} />
        </button>
      </div>
    </div>
  );
}