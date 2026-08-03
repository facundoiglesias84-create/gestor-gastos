import React from 'react';
import { CATEGORIES } from './ExpenseFormModal';
import { PieChart } from 'lucide-react';

export default function CategoryChart({ expenses }) {
  if (expenses.length === 0) return null;

  const total = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  
  // Agrupar por categoría
  const categoryTotals = CATEGORIES.map(cat => {
    const categoryExpenses = expenses.filter(e => e.category === cat.id);
    const amount = categoryExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const percentage = total > 0 ? (amount / total) * 100 : 0;
    return { ...cat, amount, percentage };
  }).filter(c => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="card" style={{ marginBottom: '24px', padding: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <PieChart size={18} color="var(--accent-primary)" />
        <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Distribución por Categorías</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {categoryTotals.map(cat => (
          <div key={cat.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </span>
              <span>{formatCurrency(cat.amount)} ({cat.percentage.toFixed(1)}%)</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--input-bg)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${cat.percentage}%`,
                background: cat.color,
                borderRadius: '99px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
