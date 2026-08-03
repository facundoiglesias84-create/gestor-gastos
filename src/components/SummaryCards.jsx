import React from 'react';
import { ArrowDownCircle, ArrowUpCircle, DollarSign, Gift, Edit2 } from 'lucide-react';

export default function SummaryCards({ monthlyIncome, totalExpenses, selectedMonth, onOpenProfile }) {
  const isAguinaldoMonth = selectedMonth === 7 || selectedMonth === 12;
  const aguinaldoAmount = isAguinaldoMonth ? monthlyIncome * 0.5 : 0;
  const totalIncome = monthlyIncome + aguinaldoAmount;
  const balance = totalIncome - totalExpenses;
  const spentPercentage = totalIncome > 0 ? Math.min(Math.round((totalExpenses / totalIncome) * 100), 100) : 0;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
      
      {/* Banner Especial de Aguinaldo */}
      {isAguinaldoMonth && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.15))',
          border: '1px solid #f59e0b',
          borderRadius: '18px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            background: '#f59e0b',
            color: '#fff',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Gift size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f59e0b' }}>
                ¡Mes de Aguinaldo ({selectedMonth === 7 ? '1° Cuota - Julio' : '2° Cuota - Diciembre'})!
              </h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Se adiciona el 50% de tu sueldo base: <strong>+{formatCurrency(aguinaldoAmount)}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Tarjeta Principal de Balance */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--bg-card), var(--bg-card-hover))',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              BALANCE DEL MES
            </span>
            <h3 style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              marginTop: '4px',
              color: balance >= 0 ? 'var(--text-primary)' : 'var(--accent-danger)'
            }}>
              {formatCurrency(balance)}
            </h3>
          </div>
          <button
            onClick={onOpenProfile}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.75rem', gap: '4px', borderRadius: '10px' }}
          >
            <Edit2 size={12} />
            <span>Sueldo</span>
          </button>
        </div>

        {/* Barra de Progreso del Gasto */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <span>Uso del presupuesto</span>
            <span>{spentPercentage}% consumido</span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{
                width: `${spentPercentage}%`,
                backgroundColor: spentPercentage > 90 ? 'var(--accent-danger)' : spentPercentage > 75 ? 'var(--accent-warning)' : 'var(--accent-secondary)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Grid 2 Columnas de Ingresos y Gastos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Ingresos */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ background: 'var(--accent-secondary-bg)', padding: '6px', borderRadius: '8px' }}>
              <ArrowUpCircle size={18} color="var(--accent-secondary)" />
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>INGRESOS</span>
          </div>
          <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>
            {formatCurrency(totalIncome)}
          </p>
          {isAguinaldoMonth && (
            <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600, display: 'block', marginTop: '2px' }}>
              Base + SAC
            </span>
          )}
        </div>

        {/* Gastos */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ background: 'var(--accent-danger-bg)', padding: '6px', borderRadius: '8px' }}>
              <ArrowDownCircle size={18} color="var(--accent-danger)" />
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>GASTOS</span>
          </div>
          <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-danger)' }}>
            {formatCurrency(totalExpenses)}
          </p>
        </div>
      </div>

    </div>
  );
}
