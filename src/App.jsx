import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MonthSelector from './components/MonthSelector';
import SummaryCards from './components/SummaryCards';
import CardsSummary from './components/CardsSummary';
import ExpenseList from './components/ExpenseList';
import ExpenseFormModal from './components/ExpenseFormModal';
import ProfileModal from './components/ProfileModal';
import Navbar from './components/Navbar';
import IOSInstallPrompt from './components/IOSInstallPrompt';
import { Wallet, LogIn, UserPlus, AlertCircle, Lock, Mail, User as UserIcon } from 'lucide-react';

function getInstallmentDate(purchaseDateStr, installmentIndex) {
  const parts = purchaseDateStr.split('-');
  const baseYear = parseInt(parts[0], 10);
  const baseMonth = parseInt(parts[1], 10);
  const baseDay = Math.min(parseInt(parts[2], 10) || 1, 28);

  let targetMonth = baseMonth + installmentIndex;
  let targetYear = baseYear;

  while (targetMonth > 12) {
    targetMonth -= 12;
    targetYear += 1;
  }

  const mm = String(targetMonth).padStart(2, '0');
  const dd = String(baseDay).padStart(2, '0');
  return `${targetYear}-${mm}-${dd}`;
}

export default function App() {
  const currentDate = new Date();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [expenses, setExpenses] = useState([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [selectedCardFilter, setSelectedCardFilter] = useState(null);

  // Estados de Auth Form (si no hay sesión)
  const [isRegister, setIsRegister] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Aplicar tema en root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Verificar token guardado al inicio
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
          } else {
            localStorage.removeItem('token');
          }
        })
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setAuthChecking(false));
    } else {
      setAuthChecking(false);
    }
  }, []);

  // Cargar gastos y sueldo cuando el usuario está autenticado
  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchMonthlyIncome();
    }
  }, [selectedYear, selectedMonth, user]);

  const fetchExpenses = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`/api/expenses?year=${selectedYear}&month=${selectedMonth}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.expenses) {
        setExpenses(data.expenses);
      }
    } catch (error) {
      console.error('Error al cargar gastos:', error);
    }
  };

  const fetchMonthlyIncome = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`/api/user/income?year=${selectedYear}&month=${selectedMonth}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.monthly_income !== undefined) {
        setMonthlyIncome(data.monthly_income);
      }
    } catch (error) {
      console.error('Error al obtener sueldo del mes:', error);
    }
  };

  // Manejo de Registro / Login
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister
      ? { name: authName, email: authEmail, password: authPassword }
      : { email: authEmail, password: authPassword };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error');
      }

      localStorage.setItem('token', data.token);
      setUser(data.user);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Guardar o Editar Gasto
  const handleSaveExpense = async (expenseData) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const method = expenseData.id ? 'PUT' : 'POST';
    const url = expenseData.id ? `/api/expenses/${expenseData.id}` : '/api/expenses';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(expenseData)
      });
      const data = await res.json();
      if (data.expense) {
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error guardando gasto:', error);
    }
  };

  // Eliminar Gasto
  const handleDeleteExpense = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchExpenses();
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
    }
  };

  // Actualizar Ingreso Base
  const handleUpdateIncome = async (newIncome, targetYear, targetMonth) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/user/income', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          monthly_income: newIncome,
          year: targetYear,
          month: targetMonth
        })
      });
      const data = await res.json();
      if (data.success) {
        setMonthlyIncome(newIncome);
      }
    } catch (error) {
      console.error('Error al actualizar ingreso:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setExpenses([]);
  };

  if (authChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cargando...</span>
      </div>
    );
  }

  // SI NO ESTÁ LOGUEADO: PANTALLA EXCLUSIVA DE INICIO DE SESIÓN / REGISTRO
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'var(--bg-primary)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          padding: '32px 24px',
          boxShadow: 'var(--shadow-md)'
        }}>
          {/* Logo y Encabezado */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              width: '54px',
              height: '54px',
              borderRadius: '18px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: '12px',
              boxShadow: '0 6px 18px rgba(99, 102, 241, 0.4)'
            }}>
              <Wallet size={30} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              Control<span style={{ color: 'var(--accent-primary)' }}>Gastos</span>
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Ingresá a tu cuenta para gestionar tus finanzas
            </p>
          </div>

          {authError && (
            <div style={{
              background: 'var(--accent-danger-bg)',
              color: 'var(--accent-danger)',
              padding: '12px 14px',
              borderRadius: '14px',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={18} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit}>
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="Tu Nombre"
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="correo@ejemplo.com"
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', borderRadius: '16px', marginTop: '12px', fontSize: '1rem' }}
            >
              {isRegister ? <UserPlus size={20} /> : <LogIn size={20} />}
              <span>{authLoading ? 'Ingresando...' : isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setAuthError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isRegister ? '¿Ya tenés cuenta? Iniciar Sesión' : '¿No tenés cuenta? Registrate gratis'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SI ESTÁ LOGUEADO: MOSTRAR PANEL PRINCIPAL
  const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Encabezado */}
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
      />

      <main className="app-container">
        {/* Seleccionador de Meses */}
        <MonthSelector
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
          onSelectYear={setSelectedYear}
        />

        {activeTab === 'home' && (
          <>
            {/* Tarjetas Resumen */}
            <SummaryCards
              monthlyIncome={monthlyIncome}
              totalExpenses={totalExpenses}
              selectedMonth={selectedMonth}
              onOpenProfile={() => setIsProfileOpen(true)}
            />

            {/* Resumen de Tarjetas de Crédito */}
            <CardsSummary
              expenses={expenses}
              selectedCardFilter={selectedCardFilter}
              onSelectCardFilter={setSelectedCardFilter}
            />

            {/* Lista de Gastos */}
            <ExpenseList
              expenses={expenses}
              selectedCardFilter={selectedCardFilter}
              onClearCardFilter={() => setSelectedCardFilter(null)}
              onEdit={(exp) => {
                setEditingExpense(exp);
                setIsFormOpen(true);
              }}
              onDelete={handleDeleteExpense}
            />
          </>
        )}

        {activeTab === 'cards' && (
          <>
            <CardsSummary
              expenses={expenses}
              selectedCardFilter={selectedCardFilter}
              onSelectCardFilter={setSelectedCardFilter}
            />
            <ExpenseList
              expenses={expenses}
              selectedCardFilter={selectedCardFilter}
              onClearCardFilter={() => setSelectedCardFilter(null)}
              onEdit={(exp) => {
                setEditingExpense(exp);
                setIsFormOpen(true);
              }}
              onDelete={handleDeleteExpense}
            />
          </>
        )}
      </main>

      {/* Navegación Inferior Móvil + FAB */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingExpense(null);
          setIsFormOpen(true);
        }}
        user={user}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Cartel de Instalación de App en iPhone */}
      <IOSInstallPrompt />

      {/* Modales */}
      <ExpenseFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveExpense}
        editingExpense={editingExpense}
        defaultDate={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        currentIncome={monthlyIncome}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onUpdateIncome={handleUpdateIncome}
      />
    </div>
  );
}
