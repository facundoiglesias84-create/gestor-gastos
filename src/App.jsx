import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MonthSelector from './components/MonthSelector';
import SummaryCards from './components/SummaryCards';
import CardsSummary from './components/CardsSummary';
import ExpenseList from './components/ExpenseList';
import ExpenseFormModal from './components/ExpenseFormModal';
import LoginModal from './components/LoginModal';
import ProfileModal from './components/ProfileModal';
import Navbar from './components/Navbar';
import IOSInstallPrompt from './components/IOSInstallPrompt';

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
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [allGuestExpenses, setAllGuestExpenses] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [monthlyIncome, setMonthlyIncome] = useState(450000);
  const [guestIncomeMap, setGuestIncomeMap] = useState({});
  const [selectedCardFilter, setSelectedCardFilter] = useState(null);

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
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
        .catch(() => localStorage.removeItem('token'));
    } else {
      setAllGuestExpenses([
        { id: 1, title: 'Alquiler y Expensas', amount: 160000, category: 'General', payment_method: 'Transferencia', card_name: '', date: `2026-08-02`, impact_date: `2026-08-02`, pay_next_month: false, is_recurring: true, installment_current: 1, installment_total: 1 },
        { id: 2, title: 'Supermercado Coto', amount: 85000, category: 'General', payment_method: 'Tarjeta de Crédito', card_name: 'Visa Santander', date: `2026-07-18`, impact_date: `2026-08-18`, pay_next_month: true, is_recurring: false, installment_current: 1, installment_total: 1 },
        { id: 3, title: 'Compra Heladera (Smart)', amount: 45000, category: 'General', payment_method: 'Tarjeta de Crédito', card_name: 'Mastercard BBVA', date: `2026-06-10`, impact_date: `2026-08-10`, pay_next_month: true, is_recurring: false, installment_current: 2, installment_total: 6 },
        { id: 4, title: 'Carga de Nafta Shell', amount: 35000, category: 'General', payment_method: 'Tarjeta de Débito', card_name: 'Visa Galicia', date: `2026-08-12`, impact_date: `2026-08-12`, pay_next_month: false, is_recurring: false, installment_current: 1, installment_total: 1 },
        { id: 5, title: 'Servicio de Internet y Cable', amount: 18000, category: 'General', payment_method: 'Débito', card_name: '', date: `2026-08-14`, impact_date: `2026-08-14`, pay_next_month: false, is_recurring: true, installment_current: 1, installment_total: 1 }
      ]);
    }
  }, []);

  // Cargar gastos y sueldo correspondiente al año y mes seleccionados
  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchMonthlyIncome();
    } else {
      const key = `${selectedYear}-${selectedMonth}`;
      if (guestIncomeMap[key] !== undefined) {
        setMonthlyIncome(guestIncomeMap[key]);
      } else {
        setMonthlyIncome(450000);
      }

      const filtered = allGuestExpenses.filter(e => {
        const impDate = e.impact_date || e.date;
        const parts = impDate.split('-');
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        if (e.is_recurring) return true;
        return y === selectedYear && m === selectedMonth;
      });

      setExpenses(filtered);
    }
  }, [selectedYear, selectedMonth, user, allGuestExpenses]);

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

  // Guardar o Editar Gasto
  const handleSaveExpense = async (expenseData) => {
    const totalCuotas = parseInt(expenseData.installment_total) || 1;

    if (!user) {
      if (totalCuotas > 1) {
        const newCuotas = [];
        const baseId = Date.now();
        for (let i = 1; i <= totalCuotas; i++) {
          const impDate = getInstallmentDate(expenseData.date, i);
          newCuotas.push({
            ...expenseData,
            id: baseId + i,
            date: expenseData.date,
            impact_date: impDate,
            pay_next_month: true,
            installment_current: i,
            installment_total: totalCuotas
          });
        }
        setAllGuestExpenses(prev => [...newCuotas, ...prev]);
      } else {
        const impDate = expenseData.pay_next_month
          ? getInstallmentDate(expenseData.date, 1)
          : expenseData.date;

        const newExp = {
          ...expenseData,
          id: expenseData.id || Date.now(),
          impact_date: impDate
        };

        if (expenseData.id) {
          setAllGuestExpenses(prev => prev.map(e => e.id === expenseData.id ? newExp : e));
        } else {
          setAllGuestExpenses(prev => [newExp, ...prev]);
        }
      }
      return;
    }

    const token = localStorage.getItem('token');
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
    if (!user) {
      setAllGuestExpenses(prev => prev.filter(e => e.id !== id));
      return;
    }

    const token = localStorage.getItem('token');
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
    if (!user) {
      const key = `${targetYear}-${targetMonth}`;
      setGuestIncomeMap(prev => ({ ...prev, [key]: newIncome }));
      setMonthlyIncome(newIncome);
      return;
    }

    const token = localStorage.getItem('token');
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
  };

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
        onOpenLogin={() => setIsLoginOpen(true)}
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
        onOpenLogin={() => setIsLoginOpen(true)}
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

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(u) => {
          setUser(u);
          setIsLoginOpen(false);
        }}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user || { name: 'Mi Cuenta', email: 'usuario@miweb.com' }}
        currentIncome={monthlyIncome}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onUpdateIncome={handleUpdateIncome}
      />
    </div>
  );
}
