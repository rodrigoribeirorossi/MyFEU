import React, { useState, useEffect, useRef } from "react";
import { getWidgets } from "./api";
import './styles/modal.css';

// Importar ícones do Material-UI
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import SportsSoccerOutlinedIcon from '@mui/icons-material/SportsSoccerOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';

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
  
  // Categorias de widgets com ícones mais específicos
  const categories = [
    { 
      id: "all", 
      name: "Todos", 
      icon: <AppsOutlinedIcon sx={{ fontSize: '1rem' }} />,
      description: "Visualizar todos os widgets disponíveis"
    },
    { 
      id: "info", 
      name: "Informação", 
      icon: <InfoOutlinedIcon sx={{ fontSize: '1rem' }} />,
      description: "Widgets de notícias, dados e informações"
    },
    { 
      id: "productivity", 
      name: "Produtividade", 
      icon: <BuildOutlinedIcon sx={{ fontSize: '1rem' }} />,
      description: "Ferramentas, tarefas e organização pessoal"
    },
    { 
      id: "entertainment", 
      name: "Entretenimento", 
      icon: <SportsSoccerOutlinedIcon sx={{ fontSize: '1rem' }} />,
      description: "Esportes, jogos e diversão"
    },
    { 
      id: "finance", 
      name: "Finanças", 
      icon: <TrendingUpOutlinedIcon sx={{ fontSize: '1rem' }} />,
      description: "Investimentos, contas e controle financeiro"
    }
  ];

  // Mapear widgets para categorias (baseado no tipo de funcionalidade)
  const getWidgetCategory = (widget) => {
    const categoryMap = {
      1: "info",         // Notícias
      2: "productivity", // Lista de Compras
      3: "productivity", // Lembretes
      4: "info",         // Saúde
      5: "productivity", // Repositório/Arquivos
      6: "finance",      // Contas e Pagamentos
      7: "finance",      // Bolsa de Valores
      8: "productivity", // Ideias
      9: "productivity", // Atalhos
      10: "entertainment", // Jogos e Resultados
      11: "productivity", // Ferramentas
      12: "info"         // Alertas Redes Sociais
    };
    return categoryMap[widget.id] || "info";
  };

  // Mapear ícones Material-UI específicos para cada widget
  const getWidgetIcon = (widget) => {
    const iconMap = {
      1: <FeedOutlinedIcon sx={{ fontSize: '2rem' }} />,                    // Notícias
      2: <ShoppingCartOutlinedIcon sx={{ fontSize: '2rem' }} />,            // Lista de Compras
      3: <EventNoteOutlinedIcon sx={{ fontSize: '2rem' }} />,               // Lembretes
      4: <HealthAndSafetyOutlinedIcon sx={{ fontSize: '2rem' }} />,         // Saúde
      5: <FolderOpenOutlinedIcon sx={{ fontSize: '2rem' }} />,              // Repositório/Arquivos
      6: <AccountBalanceWalletOutlinedIcon sx={{ fontSize: '2rem' }} />,    // Contas e Pagamentos
      7: <TrendingUpOutlinedIcon sx={{ fontSize: '2rem' }} />,              // Bolsa de Valores
      8: <LightbulbOutlinedIcon sx={{ fontSize: '2rem' }} />,                  // Ideias
      9: <LaunchOutlinedIcon sx={{ fontSize: '2rem' }} />,               // Atalhos
      10: <SportsSoccerIcon sx={{ fontSize: '2rem' }} />,            // Jogos e Resultados
      11: <CalculateOutlinedIcon sx={{ fontSize: '2rem' }} />,              // Ferramentas
      12: <NotificationsOutlinedIcon sx={{ fontSize: '2rem' }} />           // Alertas Redes Sociais
    };
    return iconMap[widget.id] || <PhoneAndroidOutlinedIcon sx={{ fontSize: '2rem' }} />;
  };

  // Mapear ícones emoji para widgets (para salvar como string)
  const getWidgetEmojiIcon = (widget) => {
    const iconMap = {
      1: "📰",  // Notícias
      2: "🛒",  // Lista de Compras
      3: "📝",  // Lembretes
      4: "🏥",  // Saúde
      5: "📁",  // Repositório/Arquivos
      6: "💳",  // Contas e Pagamentos
      7: "📈",  // Bolsa de Valores
      8: "💡",  // Ideias
      9: "🔗",  // Atalhos
      10: "⚽", // Jogos e Resultados
      11: "🧮", // Ferramentas
      12: "🔔"  // Alertas Redes Sociais
    };
    return iconMap[widget.id] || "📱";
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
    };
    
    document.addEventListener("keydown", handleTabKey);
    
    // Focar no primeiro elemento quando o modal abrir
    if (firstFocusableRef.current) {
      setTimeout(() => {
        firstFocusableRef.current.focus();
      }, 100);
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
        1: 1,  // Notícias
        2: 2,  // Compras
        3: 3,  // Lembretes
        4: 4,  // Saúde
        5: 5,  // Repositório/Arquivos
        6: 6,  // Contas e Pagamentos
        7: 7,  // Bolsa de Valores
        8: 8,  // Ideias
        9: 9,  // Atalhos
        10: 10, // Jogos e Resultados
        11: 11, // Ferramentas
        12: 12  // Alertas Redes Sociais
      };
      
      const apiWidgetId = Number(selectedWidget.id);
      const componentWidgetId = componentIdMap[apiWidgetId] || apiWidgetId;
      
      const widgetObj = {
        widget_id: componentWidgetId,
        api_widget_id: apiWidgetId,
        name: selectedWidget.name,
        icon: getWidgetEmojiIcon(selectedWidget), // Usar emoji em vez de objeto React
        description: selectedWidget.description,
        config: selectedWidget.default_config || { timeId: null, showEscudos: true }
      };
      
      // Limpar configurações anteriores para alguns widgets específicos
      if (componentWidgetId === 10) { // Jogos
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

  // Obter categoria ativa
  const activeCategory = categories.find(cat => cat.id === currentCategory);

  return (
    <div 
      className="modal-overlay" 
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal add-widget-modal" ref={modalRef}>
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            <AddOutlinedIcon sx={{ fontSize: '1.5rem', marginRight: '12px' }} />
            Adicionar Widget
          </h2>
          <button 
            className="modal-close" 
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <CloseOutlinedIcon />
          </button>
        </div>
        
        <div className="modal-content">
          {addError && (
            <div className="error-message" role="alert">
              <ErrorOutlineIcon sx={{ fontSize: '1rem', marginRight: '12px' }} />
              <span>
                <strong>Erro!</strong> {addError}
              </span>
              <button 
                onClick={() => setAddError(null)} 
                className="error-close-btn"
                aria-label="Fechar mensagem de erro"
              >
                <CloseOutlinedIcon sx={{ fontSize: '0.9rem' }} />
              </button>
            </div>
          )}
          
          {/* Seção de Busca */}
          <div className="config-section">
            <h4>
              <SearchOutlinedIcon sx={{ fontSize: '1.1rem' }} />
              Buscar Widgets
            </h4>
            <p className="section-description">
              Digite o nome ou descrição para encontrar o widget desejado
            </p>
            <div className="search-container">
              <SearchOutlinedIcon className="search-icon" sx={{ fontSize: '1rem' }} />
              <input
                type="text"
                placeholder="Ex: notícias, lista de compras, lembretes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                ref={firstFocusableRef}
                aria-label="Buscar widgets"
              />
            </div>
          </div>
          
          {/* Seção de Categorias */}
          <div className="config-section">
            <h4>
              {activeCategory?.icon}
              Filtrar por Categoria
            </h4>
            <p className="section-description">
              {activeCategory?.description}
            </p>
            
            <div className="category-tabs" role="tablist">
              {categories.map(category => (
                <button
                  key={category.id}
                  role="tab"
                  aria-selected={currentCategory === category.id}
                  onClick={() => setCurrentCategory(category.id)}
                  className={`category-tab ${currentCategory === category.id ? 'active' : ''}`}
                  aria-label={`Filtrar por categoria ${category.name}`}
                >
                  {category.icon}
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Seção de Widgets */}
          <div className="config-section">
            <h4>
              <AppsOutlinedIcon sx={{ fontSize: '1.1rem' }} />
              Widgets Disponíveis
              {filteredWidgets.length > 0 && (
                <span className="selected-count">
                  {filteredWidgets.length} {filteredWidgets.length === 1 ? 'widget' : 'widgets'}
                </span>
              )}
            </h4>
            <p className="section-description">
              Selecione um widget para adicionar ao seu dashboard personalizado
            </p>
            
            <div className="widget-list-container">
              {loading ? (
                <div className="loading-state">
                  <div className="loader"></div>
                  <p>Carregando widgets disponíveis...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <ErrorOutlineIcon sx={{ fontSize: '2rem', color: '#dc3545', marginBottom: '16px' }} />
                  <p style={{ marginBottom: '16px' }}>{error}</p>
                  <button 
                    className="btn-primary" 
                    onClick={() => window.location.reload()}
                  >
                    <RefreshOutlinedIcon sx={{ fontSize: '1rem' }} />
                    Tentar novamente
                  </button>
                </div>
              ) : filteredWidgets.length > 0 ? (
                <div className="widgets-grid">
                  {filteredWidgets.map(w => (
                    <div
                      key={w.id}
                      className={`widget-card-option ${selectedWidget?.id === w.id ? 'selected' : ''}`}
                      onClick={() => setSelectedWidget(w)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Selecionar widget ${w.name}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedWidget(w);
                        }
                      }}
                    >
                      <div className="widget-card-icon">
                        {getWidgetIcon(w)}
                      </div>
                      <div className="widget-card-info">
                        <h5 className="widget-card-name">{w.name}</h5>
                        <p className="widget-card-desc">{w.description}</p>
                        <span className="widget-card-category">
                          {categories.find(cat => cat.id === getWidgetCategory(w))?.name || 'Outros'}
                        </span>
                      </div>
                      {selectedWidget?.id === w.id && (
                        <div className="widget-card-selected" aria-label="Widget selecionado">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <AppsOutlinedIcon sx={{ fontSize: '3rem', color: '#6c757d', marginBottom: '16px' }} />
                  <p>Nenhum widget encontrado com os filtros atuais.</p>
                  <p style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
                    Tente ajustar sua busca ou selecionar outra categoria.
                  </p>
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentCategory("all");
                    }}
                  >
                    <RefreshOutlinedIcon sx={{ fontSize: '1rem' }} />
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn-secondary" 
            onClick={onClose}
            disabled={addingWidget}
          >
            <CloseOutlinedIcon sx={{ fontSize: '1rem' }} />
            Cancelar
          </button>
          <button 
            className="btn-primary" 
            onClick={handleAdd} 
            disabled={!selectedWidget || loading || addingWidget}
            title={!selectedWidget ? "Selecione um widget para adicionar" : "Adicionar widget selecionado"}
          >
            {addingWidget ? (
              <>
                <span style={{ 
                  display: 'inline-block', 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}>
                </span>
                Adicionando...
              </>
            ) : (
              <>
                <AddOutlinedIcon sx={{ fontSize: '1rem' }} />
                Adicionar Widget
              </>
            )}
          </button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}