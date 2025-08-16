import React, { useState, useEffect } from "react";
import { getWidgets, addWidget } from "./api";

export default function AddWidgetModal({ onClose, userId, userWidgets, setUserWidgets, slot }) {
  const [widgets, setWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);

  useEffect(() => {
    async function fetchWidgets() {
      const w = await getWidgets();
      setWidgets(w);
    }
    fetchWidgets();
  }, []);

  const handleAdd = async () => {
    if (!selectedWidget) return;
    const widgetObj = {
      widget_id: selectedWidget.id,
      position: slot + 1,
      config: { name: selectedWidget.name }
    };
    const newWidget = await addWidget(userId, widgetObj);
    setUserWidgets([...userWidgets, newWidget]);
    onClose();
  };

  return (
    <div className="modal appearance-modal">
      <h3 className="appearance-title">Adicionar Widget</h3>
      <div className="appearance-options" style={{ marginBottom: "24px" }}>
        <ul style={{ padding: 0 }}>
          {widgets.map(w => (
            <li key={w.id} style={{ listStyle: "none", marginBottom: "8px" }}>
              <button
                className={selectedWidget?.id === w.id ? "btn-primary" : "btn-secondary"}
                style={{ width: "100%" }}
                onClick={() => setSelectedWidget(w)}
              >
                {w.name} - {w.description}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="modal-footer">
        <button className="btn-primary" onClick={handleAdd} disabled={!selectedWidget}>Adicionar</button>
        <button className="btn-secondary" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}