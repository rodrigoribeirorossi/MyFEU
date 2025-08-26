import React, { Suspense } from "react";

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

export default function WidgetCard({ widget, slot, onAdd, onRemove }) {
  // Função para renderizar o componente específico do widget
  const renderWidgetContent = (widget) => {
    // Log para debug - mostrar qual widget está sendo renderizado apenas se for diferente de null
    if (DEBUG && widget) {
      console.log(`Renderizando widget (${slot}):`, widget);
    }
    
    // Se não houver widget, mostrar botão de adicionar
    if (!widget) {
      return (
        <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <button className="add-widget-big" onClick={onAdd}>
            +
          </button>
        </div>
      );
    }

    // Agora podemos acessar widget_id com segurança
    if (DEBUG) console.log(`Widget ID (${slot}):`, widget.widget_id);

    // Se o widget existir, tentar carregar o componente correspondente
    try {
      const WidgetComponent = WidgetComponents[widget.widget_id];
      
      // Log para debug - verificar se encontrou o componente
      if (DEBUG) {
        console.log(`Componente encontrado para widget_id ${widget.widget_id}:`, WidgetComponent ? "Sim" : "Não");
      }
      
      if (WidgetComponent) {
        return (
          <Suspense fallback={<div>Carregando...</div>}>
            {/* repassa onRemove para o widget (se suportado) */}
            <WidgetComponent data={widget} onRemove={onRemove} />
          </Suspense>
        );
      }
      
      // Componente não encontrado - mostrar mensagem de erro
      console.error(`Componente não encontrado para widget ID ${widget.widget_id}`);
      return (
        <div>
          <h4>{widget.name} {widget.icon}</h4>
          <p>Componente não encontrado (ID: {widget.widget_id})</p>
          <pre style={{fontSize: '10px', overflow: 'auto', maxHeight: '100px'}}>
            {JSON.stringify(widget, null, 2)}
          </pre>
        </div>
      );
    } catch (error) {
      console.error("Erro ao renderizar widget:", error);
      return (
        <div>
          <h4>Erro ao carregar widget</h4>
          <p>{error.message}</p>
          <pre style={{fontSize: '10px', overflow: 'auto', maxHeight: '100px'}}>
            {JSON.stringify(widget, null, 2)}
          </pre>
        </div>
      );
    }
  };

  return (
    <div style={{ height: "100%" }}>
      {renderWidgetContent(widget)}
    </div>
  );
}