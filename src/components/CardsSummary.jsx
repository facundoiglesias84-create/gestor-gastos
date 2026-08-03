import React from 'react';
import { CreditCard, ChevronRight, DollarSign } from 'lucide-react';

export const DEFAULT_CARDS = [
  'Visa Santander',
  'Mastercard BBVA',
  'Visa Galicia',
  'Tarjeta Naranja',
  'Mercado Pago / Amex',
  'Otra Tarjeta'
];

export default function CardsSummary({ expenses, selectedCardFilter, onSelectCardFilter }) {
  // Filtrar solo gastos realizados con Tarjeta (o que tengan card_name definido)
  const cardExpenses = expenses.filter(e => e.card_name && e.card_name.trim() !== '');

  // Agrupar totales por nombre de tarjeta
  const cardTotalsMap = {};
  cardExpenses.forEach(exp => {
    const name = exp.card_name.trim();
    if (!cardTotalsMap[name]) {
      cardTotalsMap[name] = 0;
    }
    cardTotalsMap[name] += parseFloat(exp.amount);
  });

  const cardList = Object.keys(cardTotalsMap).map(cardName => ({
    name: cardName,
    total: cardTotalsMap[cardName]
  })).sort((a, b) => b.total - a.total);

  const totalCardSpent = Object.values(cardTotalsMap).reduce((sum, v) => sum + v, 0);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  };

  if (cardList.length === 0) {
    return (
      <div className="card" style={{ marginBottom: '24px', padding: '18px', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '10px', borderRadius: '12px', color: 'var(--accent-primary)' }}>
            <CreditCard size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Resumen por Tarjetas</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Aún no cargaste gastos asignados a tarjetas en este mes. Al registrar un gasto podés elegir la tarjeta usada (ej: Visa, Mastercard).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '10px', borderRadius: '12px', color: 'var(--accent-primary)' }}>
            <CreditCard size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Mis Tarjetas de Crédito / Débito</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Total a pagar en tarjetas: <strong>{formatCurrency(totalCardSpent)}</strong>
            </span>
          </div>
        </div>

        {selectedCardFilter && (
          <button
            onClick={() => onSelectCardFilter(null)}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            Ver Todas
          </button>
        )}
      </div>

      {/* Grid de Tarjetas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {cardList.map((card) => {
          const isSelected = selectedCardFilter === card.name;
          const percentage = totalCardSpent > 0 ? (card.total / totalCardSpent) * 100 : 0;

          return (
            <div
              key={card.name}
              onClick={() => onSelectCardFilter(isSelected ? null : card.name)}
              style={{
                background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--input-bg)',
                border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  💳 {card.name}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {percentage.toFixed(0)}% del resumen
                </span>
              </div>

              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {formatCurrency(card.total)}
              </div>

              {/* Barra de Proporción */}
              <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '99px', marginTop: '8px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${percentage}%`,
                  background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                  borderRadius: '99px'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
