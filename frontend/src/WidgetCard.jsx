import React from "react";

export default function WidgetCard({ widget, slot, onAdd }) {
  
  const titles = [

  ];
  //  const titles = [
  //  "Notícias 📝", "Lista de Compras 🎁", "Lembretes 📅", "Saúde ❤️",
  //  "Alertas Redes Sociais 🛡️", "Repositório ☁️", "Contas e Pagamentos 💸",
  //  "Bolsa de Valores 📈", "Atalhos 🧭", "Jogos e Resultados ⚽",
  //  "Ideias 📝", "Ferramentas 🛠️"
  //];
  return (
    <div className="widget-card">
      <h4 style={{ textAlign: "center" }}>{titles[slot - 1]}</h4>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        {!widget ? (
          <button
            className="add-widget-big"
            onClick={onAdd}
            title={`Adicionar widget em ${titles[slot - 1]}`}
          >
            +
          </button>
        ) : (
          <div>
            {/* Renderize o widget normalmente */}
            {JSON.stringify(widget.config)}
          </div>
        )}
      </div>
    </div>
  );
}