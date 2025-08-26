import React, { useState } from "react";

export default function WidgetHealth({ data }) {
  const [metrics, setMetrics] = useState(data?.config?.metrics || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMetric, setNewMetric] = useState({ name: "", value: "", unit: "" });

  const addMetric = () => {
    if (!newMetric.name || !newMetric.value) return;
    
    setMetrics([
      ...metrics,
      { 
        id: Date.now(),
        name: newMetric.name,
        value: newMetric.value,
        unit: newMetric.unit,
        date: new Date().toISOString()
      }
    ]);
    
    setNewMetric({ name: "", value: "", unit: "" });
    setShowAddForm(false);
  };

  const removeMetric = (id) => {
    setMetrics(metrics.filter(metric => metric.id !== id));
  };

  return (
    <div className="widget-health">
      {showAddForm ? (
        <div className="health-form">
          <input
            type="text"
            placeholder="Nome (ex: Peso)"
            value={newMetric.name}
            onChange={(e) => setNewMetric({...newMetric, name: e.target.value})}
          />
          <input
            type="text"
            placeholder="Valor"
            value={newMetric.value}
            onChange={(e) => setNewMetric({...newMetric, value: e.target.value})}
          />
          <input
            type="text"
            placeholder="Unidade (ex: kg)"
            value={newMetric.unit}
            onChange={(e) => setNewMetric({...newMetric, unit: e.target.value})}
          />
          <div>
            <button onClick={addMetric}>Salvar</button>
            <button onClick={() => setShowAddForm(false)}>Cancelar</button>
          </div>
        </div>
      ) : (
        <>
          <ul className="health-metrics">
            {metrics.length === 0 ? (
              <li className="empty-list">Sem métricas de saúde</li>
            ) : (
              metrics.map(metric => (
                <li key={metric.id} className="health-metric-item">
                  <div className="metric-header">
                    <span className="metric-name">{metric.name}</span>
                    <button onClick={() => removeMetric(metric.id)}>×</button>
                  </div>
                  <div className="metric-value">
                    {metric.value} {metric.unit}
                  </div>
                  <div className="metric-date">
                    {new Date(metric.date).toLocaleDateString()}
                  </div>
                </li>
              ))
            )}
          </ul>
          
          <button 
            className="add-metric-btn" 
            onClick={() => setShowAddForm(true)}
          >
            + Adicionar Métrica
          </button>
        </>
      )}
      
      <div className="widget-footer">
        <button className="widget-config-btn">⚙️</button>
      </div>
    </div>
  );
}