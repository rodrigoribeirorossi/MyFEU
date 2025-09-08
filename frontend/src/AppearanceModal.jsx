import React, { useState } from "react";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import ColorizeOutlinedIcon from '@mui/icons-material/ColorizeOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import './styles/modal.css';

const palette = [
  // Cores neutras e suaves
  { color: "#f6f8fc", name: "Cinza Muito Claro" },
  { color: "#ffffff", name: "Branco" },
  { color: "#f8f9fa", name: "Cinza Claro" },
  { color: "#e9ecef", name: "Cinza Suave" },
  { color: "#f1f5f9", name: "Azul Muito Claro" },
  { color: "#f9fafb", name: "Neutro Claro" },
  
  // Cores temáticas suaves
  { color: "#e3fcef", name: "Verde Suave" },
  { color: "#ffe3e3", name: "Rosa Suave" },
  { color: "#e3e9ff", name: "Azul Suave" },
  { color: "#fffbe3", name: "Amarelo Suave" },
  { color: "#f0fdf4", name: "Verde Menta" },
  { color: "#fef9c3", name: "Amarelo Claro" },
  
  // Cores mais definidas mas ainda elegantes
  { color: "#dbeafe", name: "Azul Claro" },
  { color: "#f3e8ff", name: "Roxo Claro" },
  { color: "#e0e7ff", name: "Índigo Claro" },
  { color: "#d1e7dd", name: "Verde Claro" },
  { color: "#fff3cd", name: "Amarelo Creme" },
  { color: "#cfe2ff", name: "Azul Céu" },
  
  // Cores mais vibrantes (para usuários que preferem)
  { color: "#ff5252", name: "Vermelho Vibrante" },
  { color: "#ff9800", name: "Laranja" },
  { color: "#ffd600", name: "Amarelo Ouro" },
  { color: "#00e676", name: "Verde Vibrante" },
  { color: "#2979ff", name: "Azul Vibrante" },
  { color: "#651fff", name: "Roxo Vibrante" },
  { color: "#d500f9", name: "Magenta" },
  { color: "#c51162", name: "Rosa Escuro" }
];

export default function AppearanceModal({ currentColor, onClose, onSave }) {
  const [showPalette, setShowPalette] = useState(false);
  const [selectedColor, setSelectedColor] = useState(currentColor);

  const handleSave = () => {
    onSave(selectedColor);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal appearance-modal">
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">
            <PaletteOutlinedIcon sx={{ fontSize: '1.5rem', marginRight: '8px' }} />
            Personalizar Aparência
          </h3>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            <CloseOutlinedIcon />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          <div className="config-section">
            <h4>
              <ColorizeOutlinedIcon sx={{ fontSize: '1.1rem' }} />
              Cor de Fundo
            </h4>
            <p className="section-description">
              Escolha uma cor de fundo para personalizar a aparência do seu dashboard. 
              Selecione uma cor que combine com seu estilo e facilite a visualização.
            </p>
            
            <div className="color-preview-container">
              <div className="color-preview-wrapper">
                <div 
                  className="color-preview"
                  style={{ backgroundColor: selectedColor }}
                  onClick={() => setShowPalette(!showPalette)}
                />
                <div className="color-info">
                  <span className="color-name">
                    {palette.find(p => p.color === selectedColor)?.name || "Cor Personalizada"}
                  </span>
                  <span className="color-code">{selectedColor}</span>
                </div>
              </div>
              <button 
                className="btn-secondary color-change-btn"
                onClick={() => setShowPalette(!showPalette)}
              >
                <PaletteOutlinedIcon sx={{ fontSize: '1rem' }} />
                {showPalette ? 'Fechar Paleta' : 'Escolher Cor'}
              </button>
            </div>

            {/* Paleta de Cores */}
            {showPalette && (
              <div className="color-palette-section">
                <h5 className="palette-title">Selecione uma cor:</h5>
                <div className="color-palette-grid">
                  {palette.map(({ color, name }) => (
                    <div
                      key={color}
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                      title={name}
                    >
                      <div 
                        className="color-swatch"
                        style={{ backgroundColor: color }}
                      />
                      {selectedColor === color && (
                        <CheckCircleOutlinedIcon className="color-selected-icon" />
                      )}
                      <span className="color-option-name">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Seção de funcionalidades futuras */}
          <div className="config-section">
            <h4>
              Personalização Avançada
            </h4>
            <p className="section-description">
              Mais opções de personalização estarão disponíveis em breve:
            </p>
            <div className="future-features">
              <div className="feature-item disabled">
                <span>🌙</span>
                <div>
                  <strong>Modo Escuro/Claro</strong>
                  <p>Alternar entre temas claro e escuro</p>
                </div>
              </div>
              <div className="feature-item disabled">
                <span>🎨</span>
                <div>
                  <strong>Esquemas de Cores</strong>
                  <p>Paletas de cores predefinidas</p>
                </div>
              </div>
              <div className="feature-item disabled">
                <span>📱</span>
                <div>
                  <strong>Layout</strong>
                  <p>Diferentes layouts para o dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-primary" onClick={handleSave}>
            <SaveOutlinedIcon sx={{ fontSize: '1rem' }} />
            Salvar Alterações
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}