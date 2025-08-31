import React, { Suspense, useState } from "react";
import './styles/widgets/common.css';
import { 
  FiRefreshCw,
  FiSettings,
  FiTrash2
} from 'react-icons/fi';

// Flag para controlar logs de debug
const DEBUG = false;

// Importações dinâmicas para evitar erros quando um componente não existe
const WidgetComponents = {
  1: React.lazy(() => import("./widgets/WidgetNews")),
  2: React.lazy(() => import("./widgets/WidgetShoppingList")),
  3: React.lazy(() => import("./widgets/WidgetReminders")),
  4: React.lazy(() => import("./widgets/WidgetHealth")),
  5: React.lazy(() => import("./widgets/WidgetJogos"))
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
    if (DEBUG && widget) {
      console.log(`Renderizando widget:`, widget);
    }

    try {
      const WidgetComponent = WidgetComponents[widget.widget_id];
      
      if (DEBUG) {
        console.log(`Componente encontrado para widget_id ${widget.widget_id}:`, 
          WidgetComponent ? "Sim" : "Não");
      }
      
      if (WidgetComponent) {
        return (
          <Suspense fallback={
            <div className="widget-loading">
              <div className="widget-loading-spinner"></div>
              <p>Carregando widget...</p>
            </div>
          }>
            <WidgetComponent data={widget} onRemove={onRemove} />
          </Suspense>
        );
      }
      
      // Componente não encontrado - mostrar mensagem de erro
      console.error(`Componente não encontrado para widget ID ${widget.widget_id}`);
      return (
        <div className="widget-error">
          <h4>{widget.name} {widget.icon}</h4>
          <p>Componente não encontrado (ID: {widget.widget_id})</p>
        </div>
      );
    } catch (error) {
      console.error("Erro ao renderizar widget:", error);
      return (
        <div className="widget-error">
          <h4>Erro ao carregar widget</h4>
          <p>{error.message}</p>
        </div>
      );
    }
  };

  return (
    <div className={`widget-card ${isDragging ? 'is-dragging' : ''} ${isResizing ? 'is-resizing' : ''}`}>
      <div className="widget-header">
        <div className="widget-drag-handle" title="Arrastar para mover">
          <span className="widget-title">{widget.name} {widget.icon}</span>
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
        >
          <FiRefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
        </button>
        <button className="widget-config-btn" onClick={handleConfigure} aria-label="Configurar">
          <FiSettings size={16} />
        </button>
        <button className="widget-remove-btn" onClick={onRemove} aria-label="Remover">
          <FiTrash2 size={16} />
        </button>
      </div>
      <div className="widget-resize-handle" title="Redimensionar widget"></div>
    </div>
  );
}