import React, { useState, useEffect } from "react";
import { getWidgets, addWidget } from "./api";

// Modificar a props do componente
export default function AddWidgetModal({ onClose, userId, userWidgets, setUserWidgets, slot, onWidgetAdded }) {
  const [widgets, setWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingWidget, setAddingWidget] = useState(false);
  const [addError, setAddError] = useState(null);

  useEffect(() => {
    async function fetchWidgets() {
      try {
        setLoading(true);
        setError(null);
        console.log("Buscando widgets da API...");
        const w = await getWidgets();
        console.log("Widgets recebidos:", w);
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

  // Modifique a função handleAdd para mapear corretamente os IDs de widgets
  const handleAdd = async () => {
    if (!selectedWidget) return;
    try {
      setAddingWidget(true);
      setAddError(null);
      
      console.log("Adicionando widget selecionado:", selectedWidget);
      
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
      
      console.log(`Mapeando API ID ${apiWidgetId} para Component ID ${componentWidgetId}`);
      
      // Cria um objeto de widget completo com todos os dados necessários
      const widgetObj = {
        widget_id: componentWidgetId,
        api_widget_id: apiWidgetId,
        position: slot + 1,
        name: selectedWidget.name,
        icon: selectedWidget.icon,
        description: selectedWidget.description,
        config:  { timeId: null, showEscudos: true }
      };
      
      try { localStorage.removeItem('jogosWidgetConfig'); } catch(e) {}
      
      const newWidget = await addWidget(userId, widgetObj);
      console.log("Widget adicionado com sucesso:", newWidget);
      
      // Chamar o callback em vez de atualizar diretamente
      if (onWidgetAdded) {
        onWidgetAdded(newWidget, slot);
      } else {
        // Fallback para o método anterior
        const newWidgets = [...userWidgets];
        newWidgets[slot] = newWidget;
        setUserWidgets(newWidgets);
      }
      
      setAddingWidget(false);
      onClose();
    } catch (err) {
      console.error("Erro ao adicionar widget:", err);
      setAddError(`Erro ao adicionar widget: ${err.message}`);
      setAddingWidget(false);
      // Não fechar o modal para que o usuário veja a mensagem de erro
    }
  };

  return (
    <div className="modal appearance-modal">
      <h3 className="appearance-title">Adicionar Widget</h3>
      {addError && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          <strong>Erro!</strong> {addError}
          <button 
            onClick={() => setAddError(null)} 
            style={{
              background: 'none',
              border: 'none',
              color: '#721c24',
              float: 'right',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </div>
      )}
      <div className="appearance-options" style={{ marginBottom: "24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>Carregando widgets...</p>
            <p style={{ fontSize: "0.8rem", color: "#666" }}>
              Certifique-se de que a API está rodando em http://localhost:8000
            </p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
            <p>{error}</p>
            <button 
              className="btn-primary" 
              onClick={() => window.location.reload()}
              style={{ marginTop: "10px" }}
            >
              Tentar novamente
            </button>
          </div>
        ) : widgets.length > 0 ? (
          <ul style={{ padding: 0 }}>
            {widgets.map(w => (
              <li key={w.id} style={{ listStyle: "none", marginBottom: "8px" }}>
                <button
                  className={selectedWidget?.id === w.id ? "btn-primary" : "btn-secondary"}
                  style={{ width: "100%" }}
                  onClick={() => setSelectedWidget(w)}
                >
                  {w.name} {w.icon} - {w.description}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>Nenhum widget disponível.</p>
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
        >
          Fechar
        </button>
      </div>
    </div>
  );
}