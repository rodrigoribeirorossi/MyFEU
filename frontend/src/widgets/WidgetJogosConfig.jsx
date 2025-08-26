import React, { useState } from "react";

export default function WidgetJogosConfig({ config, onSave, onCancel, clubesDisponiveis }) {
  // Garantir que config sempre seja um objeto
  config = config || {};
  
  // Forçar Number para evitar comparações incorretas entre string/number
  const [selectedTimeId, setSelectedTimeId] = useState(config.timeId ? Number(config.timeId) : null);

  const [showEscudos, setShowEscudos] = useState(
    config.showEscudos !== undefined ? config.showEscudos : true
  );
  
  const PLACEHOLDER_CREST = "https://via.placeholder.com/80x80.png?text=badge";

  const handleSave = () => {
    if (!selectedTimeId) {
      alert("Por favor, selecione um clube favorito para continuar");
      return;
    }
    
    onSave({
      ...config,
      timeId: selectedTimeId,
      showEscudos: showEscudos
    });
  };
  
  return (
    <div className="widget-jogos-config">
      <h3>Configurar Time Favorito</h3>
      <p style={{ marginBottom: "15px", fontSize: "0.9rem" }}>
        Escolha seu time preferido para visualizar os jogos e resultados.
      </p>
      
      <div className="config-section">
        <h4>Selecione seu time do coração:</h4>
        <div className="clubes-grid">
          {clubesDisponiveis.map(clube => (
            <div 
              key={clube.id}
              className={`clube-item ${Number(selectedTimeId) === Number(clube.id) ? 'selected' : ''}`}
              onClick={() => setSelectedTimeId(Number(clube.id))}
              style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: 6 }}
            >
              <img 
                src={clube.escudo} 
                alt={`Escudo ${clube.nome}`}
                className="clube-escudo-select"
                width={40}
                height={40}
                loading="lazy"
                onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_CREST; }}
                style={{ objectFit: "contain", borderRadius: 4 }}
              />
              <span className="clube-nome-select" style={{ fontWeight: 600 }}>{clube.nome}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="config-section">
        <h4>Opções de exibição:</h4>
        <label>
          <input
            type="checkbox"
            checked={showEscudos}
            onChange={() => setShowEscudos(!showEscudos)}
          />
          Mostrar escudos dos times
        </label>
      </div>
      
      <div className="config-actions">
        <button 
          onClick={handleSave} 
          className="btn-primary"
        >
          Salvar
        </button>
        <button 
          onClick={onCancel} 
          className="btn-secondary"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}