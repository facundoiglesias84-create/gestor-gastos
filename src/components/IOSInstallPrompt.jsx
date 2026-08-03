import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Smartphone } from 'lucide-react';

export default function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detectar si es iOS / Safari y si NO está ejecutándose en modo app standalone
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    const dismissed = localStorage.getItem('ios_prompt_dismissed');

    if (isIOS && !isStandalone && !dismissed) {
      setShowPrompt(true);
    }
  }, []);

  if (!showPrompt) return null;

  const handleDismiss = () => {
    localStorage.setItem('ios_prompt_dismissed', 'true');
    setShowPrompt(false);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      left: '16px',
      right: '16px',
      maxWidth: '500px',
      margin: '0 auto',
      background: 'rgba(28, 28, 30, 0.94)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid #3a3a3c',
      borderRadius: '22px',
      padding: '16px 18px',
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
      zIndex: 99,
      animation: 'slideUpIOS 0.4s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#0a84ff', color: '#fff', padding: '10px', borderRadius: '14px', display: 'flex' }}>
            <Smartphone size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>Instalar en tu iPhone</h4>
            <span style={{ fontSize: '0.78rem', color: '#aeaeb2' }}>Usala como una App nativa en tu pantalla de inicio</span>
          </div>
        </div>

        <button onClick={handleDismiss} style={{ background: 'none', border: 'none', color: '#8e8e93', cursor: 'pointer', padding: '4px' }}>
          <X size={18} />
        </button>
      </div>

      <div style={{
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '0.5px solid #3a3a3c',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.82rem',
        color: '#f2f2f7'
      }}>
        <span>1. Tocá el botón <strong>Compartir</strong></span>
        <Share size={16} color="#0a84ff" />
        <span>y luego <strong>"Agregar a inicio"</strong></span>
        <PlusSquare size={16} color="#0a84ff" />
      </div>
    </div>
  );
}
