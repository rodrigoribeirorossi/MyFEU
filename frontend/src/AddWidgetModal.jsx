import React, { useState, useEffect, useRef } from "react";
import { getWidgets } from "./api";
import './styles/modal.css';

export default function AddWidgetModal({ onClose, userId, onWidgetAdded }) {
  const [widgets, setWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingWidget, setAddingWidget] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentCategory, setCurrentCategory] = useState("all");
  const [addError, setAddError] = useState(null);
  
  // Para a acessibilidade do modal
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);
  
  // Categorias de widgets
  const categories = [
    { id: "all", name: "Todos" },
    { id: "info", name: "Informações" },
    { id: "tools", name: "Ferramentas" },
    { id: "sports", name: "Esportes" }
  ];

  // Mapear widgets para categorias (exemplo)
  const getWidgetCategory = (widget) => {
    const categoryMap = {
      1: "info", // Notícias
      2: "tools", // Lista de Compras
      3: "tools", // Lembretes
      4: "info", // Saúde
      10: "sports" // Jogos
    };
    return categoryMap[widget.id] || "other";
  };

  useEffect(() => {
    async function fetchWidgets() {
      try {
        setLoading(true);
        setError(null);
        const w = await getWidgets();
        setWidgets(Array.isArray(w) ? w : []);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao buscar widgets:", err);
        setError(`Erro ao carregar widgets: ${err.message}`);
        setLoading(false);
      }
    }
    fetchWidgets();
  }, []);

  // Setup para controle de foco no modal (acessibilidade)
  useEffect(() => {
    const handleTabKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      
      if (e.key !== "Tab") return;
      
      if (!modalRef.current) return;
      
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      // Shift+Tab - voltar para o último elemento se estiver no primeiro
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } 
      // Tab - ir para o primeiro elemento se estiver no último
      else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    document.addEventListener("keydown", handleTabKey);
    
    // Focar no primeiro elemento quando o modal abrir
    if (firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
    
    return () => {
      document.removeEventListener("keydown", handleTabKey);
    };
  }, [onClose]);

  const handleAdd = async () => {
    if (!selectedWidget) return;
    try {
      setAddingWidget(true);
      setAddError(null);
      
      // Mapear IDs da API para os IDs de componentes no WidgetComponents
      const componentIdMap = {
        1: 1, // Notícias
        2: 2, // Compras
        3: 3, // Lembretes
        4: 4, // Saúde
        10: 5, // Jogos e Resultados - ID 10 na API, ID 5 no WidgetComponents
        // Adicione outros mapeamentos conforme necessário
      };
      
      // Determinar o widget_id correto baseado no mapeamento ou usar o ID original
      const apiWidgetId = Number(selectedWidget.id);
      const componentWidgetId = componentIdMap[apiWidgetId] || apiWidgetId;
      
      // Criar objeto widget
      const widgetObj = {
        widget_id: componentWidgetId,
        api_widget_id: apiWidgetId,
        name: selectedWidget.name,
        icon: selectedWidget.icon,
        description: selectedWidget.description,
        config: selectedWidget.default_config || { timeId: null, showEscudos: true }
      };
      
      // Limpar configurações anteriores
      if (componentWidgetId === 5) {
        try { localStorage.removeItem('jogosWidgetConfig'); } catch(e) {}
      }
      
      // Chamar o callback com o novo widget
      onWidgetAdded(widgetObj);
      setAddingWidget(false);
    } catch (err) {
      console.error("Erro ao adicionar widget:", err);
      setAddError(`Erro ao adicionar widget: ${err.message}`);
      setAddingWidget(false);
    }
  };

  // Filtrar widgets com base na pesquisa e categoria
  const filteredWidgets = widgets.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          w.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = currentCategory === "all" || getWidgetCategory(w) === currentCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div 
      className="modal-overlay" 
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal appearance-modal" ref={modalRef}>
        <h3 id="modal-title" className="appearance-title">Adicionar Widget</h3>
        
        {addError && (
          <div className="error-message" role="alert">
            <strong>Erro!</strong> {addError}
            <button 
              onClick={() => setAddError(null)} 
              className="error-close-btn"
              aria-label="Fechar mensagem de erro"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="search-filter-container">
          <input
            type="text"
            placeholder="Buscar widgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            ref={firstFocusableRef}
          />
          
          <div className="category-tabs" role="tablist">
            {categories.map(category => (
              <button
                key={category.id}
                role="tab"
                aria-selected={currentCategory === category.id}
                onClick={() => setCurrentCategory(category.id)}
                className={`category-tab ${currentCategory === category.id ? 'active' : ''}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="appearance-options widget-list-container">
          {loading ? (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Carregando widgets...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button 
                className="btn-primary" 
                onClick={() => window.location.reload()}
              >
                Tentar novamente
              </button>
            </div>
          ) : filteredWidgets.length > 0 ? (
            <ul className="widget-list">
              {filteredWidgets.map(w => (
                <li key={w.id} className="widget-list-item">
                  <button
                    className={selectedWidget?.id === w.id ? "widget-option selected" : "widget-option"}
                    onClick={() => setSelectedWidget(w)}
                  >
                    <span className="widget-icon">{w.icon}</span>
                    <div className="widget-option-info">
                      <span className="widget-option-name">{w.name}</span>
                      <span className="widget-option-desc">{w.description}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <p>Nenhum widget encontrado com os filtros atuais.</p>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn-primary" 
            onClick={handleAdd} 
            disabled={!selectedWidget || loading || addingWidget}
          >
            {addingWidget ? "Adicionando..." : "Adicionar"}
          </button>
          <button 
            className="btn-secondary" 
            onClick={onClose}
            disabled={addingWidget}
            ref={lastFocusableRef}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}