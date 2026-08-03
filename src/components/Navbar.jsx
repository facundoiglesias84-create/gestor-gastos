import React from 'react';
import { Home, Plus, CreditCard, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAddModal, user, onOpenLogin, onOpenProfile }) {
  return (
    <>
      {/* Botón Flotante Central (FAB) */}
      <button onClick={onOpenAddModal} className="fab-button" title="Agregar Gasto">
        <Plus size={28} />
      </button>

      {/* Navegación Inferior Móvil */}
      <nav className="bottom-nav">
        <button
          onClick={() => setActiveTab('home')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: activeTab === 'home' ? 'var(--accent-primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: activeTab === 'home' ? 700 : 500
          }}
        >
          <Home size={20} />
          <span>Resumen</span>
        </button>

        <button
          onClick={() => setActiveTab('cards')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: activeTab === 'cards' ? 'var(--accent-primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: activeTab === 'cards' ? 700 : 500
          }}
        >
          <CreditCard size={20} />
          <span>Tarjetas</span>
        </button>

        <button
          onClick={user ? onOpenProfile : onOpenLogin}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: 500
          }}
        >
          <User size={20} />
          <span>{user ? user.name.split(' ')[0] : 'Cuenta'}</span>
        </button>
      </nav>
    </>
  );
}
