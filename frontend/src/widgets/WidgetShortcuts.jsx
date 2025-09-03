import React, { useState, useEffect } from 'react';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import '../styles/widgets/shortcuts.css';

// Mapeamento de ícones/logos para URLs conhecidas
const KNOWN_SHORTCUTS = {
  // Redes Sociais
  'facebook.com': {
    name: 'Facebook',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png',
    color: '#1877F2'
  },
  'instagram.com': {
    name: 'Instagram',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
    color: '#E4405F'
  },
  'twitter.com': {
    name: 'Twitter',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg',
    color: '#1DA1F2'
  },
  'x.com': {
    name: 'X (Twitter)',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_original.svg',
    color: '#000000'
  },
  'linkedin.com': {
    name: 'LinkedIn',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
    color: '#0A66C2'
  },
  'youtube.com': {
    name: 'YouTube',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png',
    color: '#FF0000'
  },
  'gmail.com': {
    name: 'Gmail',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg',
    color: '#EA4335'
  },
  'google.com': {
    name: 'Google',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    color: '#4285F4'
  },
  'globo.com': {
    name: 'Globo',
    icon: 'https://s2.glbimg.com/rCDoEOUTOtaZqO1tBiG4c4Vvsr8=/0x0:1024x1024/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_c3c606ff68e7478091d1ca496f9c5625/internal_photos/bs/2021/Z/I/9vUZHKTNSOq2NKKHMk7g/globo-logo-share.png',
    color: '#1B4B8C'
  },
  'cnn.com.br': {
    name: 'CNN Brasil',
    icon: 'https://www.google.com/s2/favicons?domain=cnn.com.br',
    color: '#CC0000'
  },
  'stackoverflow.com': {
    name: 'Stack Overflow',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Stack_Overflow_icon.svg',
    color: '#F48024'
  },
  'github.com': {
    name: 'GitHub',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg',
    color: '#000000'
  },
  'dev.to': {
    name: 'Dev.to',
    icon: 'https://www.google.com/s2/favicons?domain=dev.to',
    color: '#0A0A0A'
  },
  'medium.com': {
    name: 'Medium',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Medium_logo_Monogram.svg',
    color: '#000000'
  },
  'amazon.com.br': {
    name: 'Amazon',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    color: '#FF9900'
  },
  'mercadolivre.com.br': {
    name: 'Mercado Livre',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/35/MercadoLibre.svg',
    color: '#FFE600'
  },
  'maps.google.com': {
    name: 'Google Maps',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Google_Maps_Logo_2020.svg',
    color: '#4285F4'
  },
  'drive.google.com': {
    name: 'Google Drive',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg',
    color: '#4285F4'
  },
  'calendar.google.com': {
    name: 'Google Calendar',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg',
    color: '#4285F4'
  }
};

// Ícone genérico para URLs não conhecidas  
const GENERIC_ICON = 'https://www.google.com/s2/favicons?domain=';

export default function WidgetShortcuts({ data, onRemove, onConfigure }) {
  console.log('🔗 WidgetShortcuts renderizado com data:', data);
  
  const widgetData = data || {};
  const widgetId = widgetData.i || 'temp';
  
  const [shortcuts, setShortcuts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // CORRIGIR: Adicionar dependência para reagir às mudanças de configuração
  useEffect(() => {
    const loadConfig = () => {
      try {
        console.log('🔗 Carregando config para widget:', widgetId);
        
        // Tentar carregar configuração salva
        const savedConfig = localStorage.getItem(`widget_config_${widgetId}`);
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          console.log('🔗 Config carregada:', config);
          setShortcuts(config.shortcuts || []);
        } else {
          console.log('🔗 Nenhuma config salva encontrada');
          setShortcuts([]);
        }
      } catch (error) {
        console.error('🔗 Erro ao carregar configuração de atalhos:', error);
        setShortcuts([]);
        setError('Erro ao carregar configuração');
      }
    };

    loadConfig();
    
    // NOVO: Também reagir às mudanças no refreshTimestamp
    if (widgetData.refreshTimestamp) {
      console.log('🔗 Detectada mudança de configuração, recarregando...');
      loadConfig();
    }
  }, [widgetId, widgetData.refreshTimestamp, widgetData.config]); // ADICIONAR DEPENDÊNCIAS

  // Função para obter informações do atalho
  const getShortcutInfo = (url) => {
    try {
      if (!url || typeof url !== 'string') {
        return {
          name: 'URL inválida',
          icon: `${GENERIC_ICON}example.com`,
          color: '#999999',
          url: '',
          domain: 'invalid'
        };
      }

      const cleanUrl = url.trim();
      const urlObj = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
      const domain = urlObj.hostname.replace('www.', '');
      
      if (KNOWN_SHORTCUTS[domain]) {
        return {
          ...KNOWN_SHORTCUTS[domain],
          url: cleanUrl,
          domain: domain
        };
      }
      
      // Atalho genérico
      return {
        name: domain,
        icon: `${GENERIC_ICON}${domain}`,
        color: '#666666',
        url: cleanUrl,
        domain: domain
      };
    } catch (error) {
      console.warn('🔗 URL inválida:', url, error);
      return {
        name: 'Link inválido',
        icon: `${GENERIC_ICON}example.com`,
        color: '#999999',
        url: url || '',
        domain: 'invalid'
      };
    }
  };

  // Função para abrir atalho
  const handleShortcutClick = (url) => {
    try {
      if (!url || typeof url !== 'string') {
        console.error('🔗 URL inválida para abrir:', url);
        return;
      }

      let fullUrl = url.trim();
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = `https://${fullUrl}`;
      }
      
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('🔗 Erro ao abrir atalho:', error);
    }
  };

  // Renderizar estado vazio
  if (!Array.isArray(shortcuts) || shortcuts.length === 0) {
    return (
      <div className="widget-shortcuts">
        <div className="shortcuts-empty">
          <LaunchOutlinedIcon sx={{ fontSize: '3rem', color: '#ccc', marginBottom: '12px' }} />
          <p>Nenhum atalho configurado</p>
          <button 
            onClick={onConfigure}
            className="btn-primary"
            style={{ marginTop: '12px' }}
          >
            <AddOutlinedIcon sx={{ fontSize: '1rem' }} />
            Adicionar Atalhos
          </button>
        </div>
      </div>
    );
  }

  // Renderizar estado com atalhos
  return (
    <div className="widget-shortcuts">
      <div className="shortcuts-content">
        {loading ? (
          <div className="widget-loading">
            <div className="widget-loading-spinner"></div>
            <p>Carregando atalhos...</p>
          </div>
        ) : (
          <div className="shortcuts-grid">
            {shortcuts.map((shortcut, index) => {
              const shortcutInfo = getShortcutInfo(shortcut);
              
              return (
                <div
                  key={`shortcut-${index}`}
                  className="shortcut-item"
                  onClick={() => handleShortcutClick(shortcut)}
                  title={`${shortcutInfo.name} - ${shortcut}`}
                >
                  <div 
                    className="shortcut-icon"
                    style={{ borderColor: shortcutInfo.color }}
                  >
                    <img
                      src={shortcutInfo.icon}
                      alt={shortcutInfo.name}
                      onError={(e) => {
                        e.target.src = `${GENERIC_ICON}${shortcutInfo.domain}`;
                      }}
                    />
                  </div>
                </div>
              );
            })}
            
            {/* Botão adicionar se houver espaço */}
            {shortcuts.length < 24 && (
              <div
                key="shortcut-add"
                className="shortcut-item shortcut-add"
                onClick={onConfigure}
                title="Adicionar mais atalhos"
              >
                <div className="shortcut-icon add-icon">
                  <AddOutlinedIcon sx={{ fontSize: '1.5rem', color: '#666' }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}