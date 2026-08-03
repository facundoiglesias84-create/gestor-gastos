import React, { useState } from 'react';
import { Search, Trash2, Edit3, DollarSign, PackageOpen, CreditCard, Receipt, RefreshCw, Layers } from 'lucide-react';

export default function ExpenseList({ expenses, selectedCardFilter, onClearCardFilter, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExpenses = expenses.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.card_name && item.card_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCard = !selectedCardFilter || (item.card_name && item.card_name.trim() === selectedCardFilter);
    return matchesSearch && matchesCard;
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  };

  return (
    <div style={{ marginBottom: '30px' }}>
      {/* Encabezado y Buscador */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
            Gastos a Pagar este Mes ({filteredExpenses.length})
          </h3>

          {selectedCardFilter && (
            <div className="badge badge-card" style={{ gap: '6px', fontSize: '0.8rem', padding: '6px 12px' }}>
              <CreditCard size={14} />
              <span>Filtrado por: <strong>{selectedCardFilter}</strong></span>
              <button
                onClick={onClearCardFilter}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 800, marginLeft: '4px' }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Buscador Simple */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar por detalle o tarjeta..."
            className="form-input"
            style={{ paddingLeft: '40px', height: '44px', fontSize: '0.9rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Items */}
      {filteredExpenses.length === 0 ? (
        <div className="card" style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <PackageOpen size={48} color="var(--border-color)" />
          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>No hay gastos en este filtro</p>
          <span style={{ fontSize: '0.8rem' }}>Presioná el botón <strong>+</strong> para agregar una compra o gasto</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredExpenses.map((expense) => {
            const totalCuotas = expense.installment_total || 1;
            const cuotaActual = expense.installment_current || 1;
            const isMesVencido = expense.pay_next_month;

            return (
              <div
                key={expense.id}
                className="card"
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                {/* Icono + Información */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {expense.card_name ? <CreditCard size={20} /> : <Receipt size={20} />}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <h4 style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {expense.title}
                      </h4>

                      {/* Distintivo de Mes Vencido */}
                      {isMesVencido && (
                        <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontSize: '0.7rem' }}>
                          📅 Mes Vencido
                        </span>
                      )}

                      {/* Distintivos de Cuota o Gasto Fijo */}
                      {totalCuotas > 1 && (
                        <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', fontSize: '0.7rem' }}>
                          Cuota {cuotaActual}/{totalCuotas}
                        </span>
                      )}

                      {expense.is_recurring && (
                        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-secondary)', fontSize: '0.7rem' }}>
                          🔁 Fijo
                        </span>
                      )}

                      {expense.card_name && (
                        <span className="badge badge-card">
                          💳 {expense.card_name}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Comprado: {formatDate(expense.date)}</span>
                      <span>•</span>
                      <span>{expense.payment_method || 'Efectivo'}</span>
                    </div>
                  </div>
                </div>

                {/* Monto + Acciones */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => onEdit(expense)}
                      className="btn btn-secondary"
                      style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px' }}
                      title="Editar"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="btn btn-danger"
                      style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px' }}
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
