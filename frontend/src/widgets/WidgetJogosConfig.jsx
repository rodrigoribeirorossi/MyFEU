import React, { useState } from "react";
import "../styles/modal.css";

// Importar ícones do Material-UI
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SportsSoccerOutlinedIcon from '@mui/icons-material/SportsSoccerOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

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
    
    // Certificar que estamos passando os valores corretos
    const updatedConfig = {
      ...config,
      timeId: selectedTimeId,
      showEscudos: showEscudos
    };
    
    console.log("Salvando configuração:", updatedConfig);
    
    // Chamar onSave com o objeto de configuração atualizado
    onSave(updatedConfig);
  };
  
  // Adicione um console.log na renderização para debug
  console.log("Renderizando WidgetJogosConfig com timeId:", selectedTimeId);
  
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            <SettingsOutlinedIcon sx={{ fontSize: '1.5rem', marginRight: '8px' }} />
            Configurar Time Favorito
          </h2>
          <button 
            className="modal-close" 
            onClick={onCancel}
            aria-label="Fechar modal"
          >
            <CloseOutlinedIcon />
          </button>
        </div>
        
        <div className="modal-content">
          <p style={{ marginBottom: "15px", fontSize: "0.9rem" }}>
            Escolha seu time preferido para visualizar os jogos e resultados.
          </p>
          
          <div className="config-section">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SportsSoccerOutlinedIcon sx={{ fontSize: '1.1rem' }} />
              Selecione seu time do coração:
            </h4>
            <div className="clubes-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginTop: '16px'
            }}>
              {clubesDisponiveis.map(clube => (
                <div 
                  key={clube.id}
                  className={`topic-item ${Number(selectedTimeId) === Number(clube.id) ? 'selected' : ''}`}
                  onClick={() => setSelectedTimeId(Number(clube.id))}
                  style={{ cursor: 'pointer' }}
                >
                  <label style={{ cursor: 'pointer', width: '100%' }}>
                    <input
                      type="radio"
                      name="clube"
                      checked={Number(selectedTimeId) === Number(clube.id)}
                      onChange={() => setSelectedTimeId(Number(clube.id))}
                      style={{ marginRight: '12px' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={clube.escudo} 
                        alt={`Escudo ${clube.nome}`}
                        loading="lazy"
                        onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_CREST; }}
                        style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                      />
                      <span style={{ fontWeight: '600' }}>{clube.nome}</span>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="config-section">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <VisibilityOutlinedIcon sx={{ fontSize: '1.1rem' }} />
              Opções de exibição:
            </h4>
            <div className="topic-item" style={{ marginTop: '12px' }}>
              <label style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showEscudos}
                  onChange={() => setShowEscudos(!showEscudos)}
                  style={{ marginRight: '12px' }}
                />
                <span>Mostrar escudos dos times</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            onClick={onCancel} 
            className="btn-secondary"
            aria-label="Cancelar configuração"
          >
            <CloseOutlinedIcon sx={{ fontSize: '1rem' }} />
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            className="btn-primary"
            disabled={!selectedTimeId}
            aria-label="Salvar configuração"
          >
            <SaveOutlinedIcon sx={{ fontSize: '1rem' }} />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}