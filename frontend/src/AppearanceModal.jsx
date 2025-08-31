import React, { useState } from "react";
import './styles/modal.css';

const palette = [
  "#f6f8fc", "#ffffff", "#e3fcef", "#ffe3e3", "#e3e9ff", "#fffbe3",
  "#d1e7dd", "#f8d7da", "#cfe2ff", "#fff3cd", "#dbeafe", "#f0fdf4",
  "#fef9c3", "#f3e8ff", "#e0e7ff", "#f1f5f9", "#f9fafb", "#f3f4f6",
  // Cores mais vivas
  "#ff5252", "#ff9800", "#ffd600", "#00e676", "#2979ff", "#651fff", "#d500f9", "#c51162"
];

export default function AppearanceModal({ currentColor, onClose, onSave }) {
  const [showPalette, setShowPalette] = useState(false);
  const [selectedColor, setSelectedColor] = useState(currentColor);

  return (
    <div className="modal appearance-modal">
      <h3 className="appearance-title">Aparência</h3>
      <div className="appearance-options">
        <div style={{ marginBottom: "24px" }}>
          <label
            className="appearance-label"
            style={{ cursor: "pointer", fontWeight: "bold" }}
            onClick={() => setShowPalette(true)}
          >
            Cor de Fundo
            <span
              style={{
                display: "inline-block",
                marginLeft: "12px",
                width: "28px",
                height: "28px",
                background: selectedColor,
                border: "2px solid #333",
                borderRadius: "50%",
                verticalAlign: "middle"
              }}
            />
          </label>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn-primary" onClick={() => onSave(selectedColor)}>Salvar</button>
        <button className="btn-secondary" onClick={onClose}>Fechar</button>
      </div>
      {showPalette && (
        <div className="palette-popup">
          <h4 style={{ textAlign: "center", marginBottom: "12px" }}>Escolha uma cor</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
            {palette.map(color => (
              <button
                key={color}
                style={{
                  width: 36,
                  height: 36,
                  background: color,
                  border: selectedColor === color ? "3px solid #333" : "1px solid #ccc",
                  borderRadius: "50%",
                  cursor: "pointer"
                }}
                onClick={() => {
                  setSelectedColor(color);
                  setShowPalette(false);
                }}
              />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <button className="btn-secondary" onClick={() => setShowPalette(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}