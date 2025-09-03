import React, { useState, useEffect } from 'react';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import '../styles/modal.css';

// Sugestões de atalhos populares organizadas por categoria
const POPULAR_SHORTCUTS = {
  'Redes Sociais': [
    'https://facebook.com',
    'https://instagram.com',
    'https://twitter.com',
    'https://linkedin.com',
    'https://youtube.com',
    'https://tiktok.com',
    'https://discord.com',
    'https://whatsapp.com'
  ],
  'Entretenimento': [
    'https://netflix.com',
    'https://primevideo.com',
    'https://disneyplus.com',
    'https://globoplay.globo.com',
    'https://spotify.com',
    'https://twitch.tv'
  ],
  'Notícias e Mídia': [
    'https://globo.com',
    'https://uol.com.br',
    'https://folha.uol.com.br',
    'https://estadao.com.br',
    'https://cnn.com.br',
    'https://bbc.com/portuguese'
  ],
  'Tecnologia': [
    'https://github.com',
    'https://stackoverflow.com',
    'https://medium.com',
    'https://dev.to'
  ],
  'E-commerce': [
    'https://amazon.com.br',
    'https://mercadolivre.com.br',
    'https://americanas.com.br',
    'https://magazineluiza.com.br'
  ],
  'Google Services': [
    'https://gmail.com',
    'https://drive.google.com',
    'https://calendar.google.com',
    'https://maps.google.com'
  ]
};

export default function WidgetShortcutsConfig({ config, onSave, onCancel }) {
  config = config || {};
  
  const [shortcuts, setShortcuts] = useState(config.shortcuts || []);
  const [customUrl, setCustomUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Redes Sociais');

  // Função para adicionar atalho
  const handleAddShortcut = (url) => {
    if (shortcuts.length >= 24) {
      alert('Máximo de 24 atalhos permitidos');
      return;
    }

    if (shortcuts.includes(url)) {
      alert('Este atalho já foi adicionado');
      return;
    }

    setShortcuts(prev => [...prev, url]);
  };

  // Função para remover atalho
  const handleRemoveShortcut = (index) => {
    setShortcuts(prev => prev.filter((_, i) => i !== index));
  };

  // Função para adicionar URL customizada
  const handleAddCustomUrl = () => {
    if (!customUrl.trim()) return;

    let url = customUrl.trim();
    
    // Adicionar https:// se não tiver protocolo
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    // Validar URL básica
    try {
      new URL(url);
      handleAddShortcut(url);
      setCustomUrl('');
    } catch (error) {
      alert('URL inválida. Verifique o formato e tente novamente.');
    }
  };

  // Função para salvar configuração
  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const newConfig = {
        shortcuts: shortcuts
      };
      
      await onSave(newConfig);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar configuração');
    } finally {
      setIsLoading(false);
    }
  };

  // Obter nome do domínio para exibição
  const getDomainName = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal add-widget-modal" style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            <LaunchOutlinedIcon sx={{ fontSize: '1.5rem', marginRight: '12px' }} />
            Configurar Atalhos
          </h2>
          <button className="modal-close" onClick={onCancel}>
            <CloseOutlinedIcon />
          </button>
        </div>

        <div className="modal-content">
          {/* Atalhos Atuais */}
          <div className="config-section">
            <h4>Atalhos Configurados ({shortcuts.length}/24)</h4>
            {shortcuts.length > 0 ? (
              <div className="shortcuts-config-grid">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="shortcut-config-item">
                    <span className="shortcut-url" title={shortcut}>
                      {getDomainName(shortcut)}
                    </span>
                    <button
                      className="shortcut-remove-btn"
                      onClick={() => handleRemoveShortcut(index)}
                      aria-label={`Remover ${getDomainName(shortcut)}`}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: '1rem' }} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                Nenhum atalho configurado ainda
              </p>
            )}
          </div>

          {/* Atalhos Populares */}
          <div className="config-section">
            <h4>
              <StarOutlinedIcon sx={{ fontSize: '1.1rem' }} />
              Atalhos Populares
            </h4>
            
            {/* Categorias */}
            <div className="category-tabs" style={{ marginBottom: '16px' }}>
              {Object.keys(POPULAR_SHORTCUTS).map(category => (
                <button
                  key={category}
                  className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Lista de atalhos da categoria ativa */}
            <div className="popular-shortcuts-grid">
              {POPULAR_SHORTCUTS[activeCategory].map((url, index) => (
                <button
                  key={index}
                  className={`popular-shortcut-btn ${shortcuts.includes(url) ? 'added' : ''}`}
                  onClick={() => handleAddShortcut(url)}
                  disabled={shortcuts.includes(url) || shortcuts.length >= 24}
                  title={shortcuts.includes(url) ? 'Já adicionado' : `Adicionar ${getDomainName(url)}`}
                >
                  <span>{getDomainName(url)}</span>
                  {shortcuts.includes(url) ? (
                    <span className="checkmark">✓</span>
                  ) : (
                    <AddOutlinedIcon sx={{ fontSize: '1rem' }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* URL Customizada */}
          <div className="config-section">
            <h4>
              <AddOutlinedIcon sx={{ fontSize: '1.1rem' }} />
              Adicionar URL Personalizada
            </h4>
            <div className="custom-url-container">
              <input
                type="url"
                placeholder="Ex: https://meusite.com ou google.com"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCustomUrl();
                  }
                }}
                className="custom-url-input"
                disabled={shortcuts.length >= 24}
              />
              <button
                className="btn-primary"
                onClick={handleAddCustomUrl}
                disabled={!customUrl.trim() || shortcuts.length >= 24}
                style={{ minWidth: '100px' }}
              >
                <AddOutlinedIcon sx={{ fontSize: '1rem' }} />
                Adicionar
              </button>
            </div>
            <p className="section-description">
              Digite qualquer URL válida. O protocolo https:// será adicionado automaticamente se não especificado.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel} disabled={isLoading}>
            <CloseOutlinedIcon sx={{ fontSize: '1rem' }} />
            Cancelar
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSave} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Salvando...
              </>
            ) : (
              <>
                <SaveOutlinedIcon sx={{ fontSize: '1rem' }} />
                Salvar Configuração
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}