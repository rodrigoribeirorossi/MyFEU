import React, { useState } from "react";
import "../styles/modal.css";

// Importar ícones do Material-UI
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import SportsFootballOutlinedIcon from '@mui/icons-material/SportsFootballOutlined';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import NewspaperOutlinedIcon from '@mui/icons-material/NewspaperOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import LoopOutlinedIcon from '@mui/icons-material/LoopOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import BalanceOutlinedIcon from '@mui/icons-material/BalanceOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';

export default function WidgetNewsConfig({ config, topics, onSave, onCancel }) {
  // Garantir que config sempre seja um objeto
  config = config || {};
  
  const [selectedTopics, setSelectedTopics] = useState(
    config.topics && config.topics.length > 0 ? config.topics : ["general"]
  );
  const [refreshInterval, setRefreshInterval] = useState(
    config.refreshInterval || 5000
  );
  const [maxNewsItems, setMaxNewsItems] = useState(
    config.maxNewsItems || 10
  );
  
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  const handleSave = async () => {
    // Não permita salvar sem nenhum tópico selecionado
    if (selectedTopics.length === 0) {
      alert("Selecione pelo menos um tópico de notícias");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const updatedConfig = {
        ...config,
        topics: selectedTopics,
        refreshInterval: refreshInterval,
        maxNewsItems: maxNewsItems
      };
      
      console.log("Salvando configuração de notícias:", updatedConfig);
      
      // Simular um pequeno delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSave(updatedConfig);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar configurações. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Mapear ícones do Material-UI para cada tópico
  const getTopicIcon = (topicId) => {
    const iconMap = {
      technology: <ComputerOutlinedIcon sx={{ fontSize: '1.2rem' }} />,
      business: <BusinessCenterOutlinedIcon sx={{ fontSize: '1.2rem' }} />,
      health: <LocalHospitalOutlinedIcon sx={{ fontSize: '1.2rem' }} />,
      science: <ScienceOutlinedIcon sx={{ fontSize: '1.2rem' }} />,
      sports: <SportsFootballOutlinedIcon sx={{ fontSize: '1.2rem' }} />,
      entertainment: <MovieOutlinedIcon sx={{ fontSize: '1.2rem' }} />,
      general: <NewspaperOutlinedIcon sx={{ fontSize: '1.2rem' }} />
    };
    return iconMap[topicId] || <ArticleOutlinedIcon sx={{ fontSize: '1.2rem' }} />;
  };

  // Mapear descrições para cada tópico
  const getTopicDescription = (topicId) => {
    const descriptionMap = {
      technology: "Tecnologia, inovação e gadgets",
      business: "Economia, finanças e negócios",
      health: "Saúde, medicina e bem-estar",
      science: "Descobertas científicas e pesquisas",
      sports: "Esportes, jogos e competições",
      entertainment: "Cinema, música e entretenimento",
      general: "Notícias gerais e atuais"
    };
    return descriptionMap[topicId] || "Notícias diversas";
  };

  // Função para obter ícone da velocidade
  const getSpeedIcon = (interval) => {
    if (interval === 3000) return <BoltOutlinedIcon sx={{ fontSize: '1rem' }} />;
    if (interval === 5000) return <BalanceOutlinedIcon sx={{ fontSize: '1rem' }} />;
    if (interval === 8000) return <HourglassEmptyOutlinedIcon sx={{ fontSize: '1rem' }} />;
    return <LoopOutlinedIcon sx={{ fontSize: '1rem' }} />;
  };
  
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            <SettingsOutlinedIcon sx={{ fontSize: '1.5rem', marginRight: '8px' }} />
            Configurar Notícias
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
          {/* Seção de Tópicos */}
          <div className="config-section">
            <div className="topics-header">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArticleOutlinedIcon sx={{ fontSize: '1.1rem' }} />
                Tópicos de Interesse
              </h4>
              <span className="selected-count">
                {selectedTopics.length} {selectedTopics.length === 1 ? 'selecionado' : 'selecionados'}
              </span>
            </div>
            <p style={{ 
              color: '#6c757d', 
              fontSize: '0.9rem', 
              marginBottom: '20px',
              lineHeight: '1.4'
            }}>
              Escolha os temas que mais interessam para personalizar suas notícias
            </p>
            
            <div className="topics-grid">
              {topics.map(topic => (
                <div 
                  key={topic.id} 
                  className={`topic-item ${selectedTopics.includes(topic.id) ? 'selected' : ''}`}
                  onClick={() => handleTopicToggle(topic.id)}
                >
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(topic.id)}
                      onChange={() => handleTopicToggle(topic.id)}
                      aria-label={`Selecionar tópico ${topic.name}`}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getTopicIcon(topic.id)}
                        <span style={{ fontWeight: '600' }}>{topic.name}</span>
                      </div>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        color: selectedTopics.includes(topic.id) ? '#0d6efd' : '#6c757d',
                        opacity: 0.8
                      }}>
                        {getTopicDescription(topic.id)}
                      </span>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Seção de Velocidade */}
          <div className="config-section">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LoopOutlinedIcon sx={{ fontSize: '1.1rem' }} />
              Velocidade de Rotação
            </h4>
            <p style={{ 
              color: '#6c757d', 
              fontSize: '0.9rem', 
              marginBottom: '12px' 
            }}>
              Defina com que frequência as notícias irão alternar
            </p>
            <select 
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              aria-label="Selecionar velocidade de rotação"
            >
              <option value={3000}>
                ⚡ Rápido - 3 segundos
              </option>
              <option value={5000}>
                ⚖️ Médio - 5 segundos
              </option>
              <option value={8000}>
                ⏳ Lento - 8 segundos
              </option>
            </select>
          </div>
          
          {/* Seção de Quantidade */}
          <div className="config-section">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChartOutlinedIcon sx={{ fontSize: '1.1rem' }} />
              Quantidade de Notícias
            </h4>
            <p style={{ 
              color: '#6c757d', 
              fontSize: '0.9rem', 
              marginBottom: '12px' 
            }}>
              Escolha quantas notícias carregar para cada tópico
            </p>
            <select 
              value={maxNewsItems}
              onChange={(e) => setMaxNewsItems(Number(e.target.value))}
              aria-label="Selecionar número máximo de notícias"
            >
              <option value={5}>5 notícias por tópico</option>
              <option value={10}>10 notícias por tópico</option>
              <option value={15}>15 notícias por tópico</option>
              <option value={20}>20 notícias por tópico</option>
            </select>
          </div>

          {/* Preview das configurações */}
          <div className="config-section" style={{ 
            background: '#f8f9fa', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ 
              color: '#495057', 
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <VisibilityOutlinedIcon sx={{ fontSize: '1.1rem' }} />
              Resumo da Configuração
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#6c757d', lineHeight: '1.5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <ArticleOutlinedIcon sx={{ fontSize: '0.9rem' }} />
                <strong>{selectedTopics.length}</strong> tópicos selecionados
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                {getSpeedIcon(refreshInterval)}
                Rotação a cada <strong>{refreshInterval / 1000} segundos</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <BarChartOutlinedIcon sx={{ fontSize: '0.9rem' }} />
                Máximo de <strong>{maxNewsItems} notícias</strong> por tópico
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <NewspaperOutlinedIcon sx={{ fontSize: '0.9rem' }} />
                Total estimado: <strong>{selectedTopics.length * maxNewsItems} notícias</strong>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            onClick={onCancel} 
            className="btn-secondary"
            disabled={isLoading}
            aria-label="Cancelar configuração"
          >
            <CloseOutlinedIcon sx={{ fontSize: '1rem' }} />
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            className="btn-primary"
            disabled={isLoading || selectedTopics.length === 0}
            aria-label="Salvar configuração"
          >
            {isLoading ? (
              <>
                <span style={{ 
                  display: 'inline-block', 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}>
                </span>
                Salvando...
              </>
            ) : (
              <>
                <SaveOutlinedIcon sx={{ fontSize: '1rem' }} />
                Salvar
              </>
            )}
          </button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}