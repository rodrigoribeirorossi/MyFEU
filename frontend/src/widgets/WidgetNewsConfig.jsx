import React, { useState } from "react";

export default function WidgetNewsConfig({ config, topics, onSave, onCancel }) {
  const [selectedTopics, setSelectedTopics] = useState(config.topics || ["general"]);
  const [refreshInterval, setRefreshInterval] = useState(config.refreshInterval || 5000);
  
  const handleTopicToggle = (topicId) => {
    if (selectedTopics.includes(topicId)) {
      // Se for o último tópico, não permite remover
      if (selectedTopics.length === 1) {
        alert("Você precisa manter pelo menos um tópico selecionado");
        return;
      }
      setSelectedTopics(selectedTopics.filter(id => id !== topicId));
    } else {
      setSelectedTopics([...selectedTopics, topicId]);
    }
  };
  
  const handleSave = () => {
    // Não permita salvar sem nenhum tópico selecionado
    if (selectedTopics.length === 0) {
      alert("Selecione pelo menos um tópico de notícias");
      return;
    }
    
    console.log("Salvando configuração:", { topics: selectedTopics, refreshInterval });
    onSave({
      ...config,
      topics: selectedTopics,
      refreshInterval: refreshInterval
    });
  };
  
  return (
    <div className="widget-config-modal" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <div className="widget-config-content" style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '80%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h3>Configurar Notícias</h3>
        
        <div className="config-section">
          <h4>Selecione os tópicos de seu interesse:</h4>
          <div className="topics-list">
            {topics.map(topic => (
              <div key={topic.id} className="topic-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(topic.id)}
                    onChange={() => handleTopicToggle(topic.id)}
                  />
                  {topic.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="config-section">
          <h4>Velocidade de rotação das notícias:</h4>
          <select 
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
          >
            <option value={3000}>Rápido (3 segundos)</option>
            <option value={5000}>Médio (5 segundos)</option>
            <option value={8000}>Lento (8 segundos)</option>
          </select>
        </div>
        
        <div className="config-actions">
          <button onClick={handleSave} className="btn-primary">Salvar</button>
          <button onClick={onCancel} className="btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  );
}