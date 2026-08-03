import React from 'react';
import { Sun, Moon, User, LogOut, Wallet, CreditCard, LayoutDashboard } from 'lucide-react';

export default function Header({ theme, toggleTheme, user, activeTab, setActiveTab, onOpenProfile, onOpenLogin, onLogout }) {
  return (
    <header className="header-glass">
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)'
          }}>
            <Wallet size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Control<span style={{ color: 'var(--accent-primary)' }}>Gastos</span>
            </h1>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Gestión Mensual
            </span>
          </div>
        </div>

        {/* NAVEGACIÓN ESCRITORIO */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="desktop-tabs">
          <button
            onClick={() => setActiveTab('home')}
            className={`btn ${activeTab === 'home' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '12px' }}
          >
            <LayoutDashboard size={16} />
            <span>Resumen</span>
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            className={`btn ${activeTab === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '12px' }}
          >
            <CreditCard size={16} />
            <span>Mis Tarjetas</span>
          </button>
        </nav>

        {/* Acciones de usuario y Tema */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%' }}
            title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          >
            {theme === 'dark' ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} color="#6366f1" />}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={onOpenProfile}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', borderRadius: '20px', gap: '6px' }}
              >
                <User size={16} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.85rem', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </span>
              </button>
              <button
                onClick={onLogout}
                className="btn btn-secondary"
                style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%' }}
                title="Cerrar Sesión"
              >
                <LogOut size={16} color="var(--accent-danger)" />
              </button>
            </div>
          ) : (
            <button onClick={onOpenLogin} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Ingresar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
