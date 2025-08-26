import React, { useState, useEffect } from 'react';

export default function Notification({ message, type = 'success', duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return '#d4edda';
      case 'error': return '#f8d7da';
      case 'warning': return '#fff3cd';
      case 'info': return '#d1ecf1';
      default: return '#d4edda';
    }
  };
  
  const getColor = () => {
    switch (type) {
      case 'success': return '#155724';
      case 'error': return '#721c24';
      case 'warning': return '#856404';
      case 'info': return '#0c5460';
      default: return '#155724';
    }
  };
  
  if (!visible) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '10px 15px',
      borderRadius: '4px',
      backgroundColor: getBackgroundColor(),
      color: getColor(),
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      zIndex: 9999,
      maxWidth: '80%',
      animation: 'fadeIn 0.3s, fadeOut 0.3s ease-in-out forwards',
      animationDelay: '0s, 2.7s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{message}</span>
        <button
          onClick={() => {
            setVisible(false);
            if (onClose) onClose();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: getColor(),
            marginLeft: '15px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}