import React, { useState, useEffect } from 'react';
import { X, DollarSign, Save, Gift, Calendar, Info } from 'lucide-react';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function ProfileModal({ isOpen, onClose, user, currentIncome, selectedMonth, selectedYear, onUpdateIncome }) {
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMonthlyIncome(currentIncome || 0);
    }
  }, [isOpen, currentIncome]);

  if (!isOpen) return null;

  const monthName = MONTHS[selectedMonth - 1];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onUpdateIncome(parseFloat(monthlyIncome) || 0, selectedYear, selectedMonth);
    setLoading(false);
    onClose();
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  };

  const currentIncomeVal = parseFloat(monthlyIncome) || 0;
  const estimatedAguinaldo = currentIncomeVal * 0.5;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Ajustar Sueldo Mensual</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Calendar size={14} />
              A partir de {monthName} {selectedYear}
            </span>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Nota informativa */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '14px',
          padding: '12px 14px',
          marginBottom: '18px',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <Info size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Guardado Inteligente por Mes:</strong> El nuevo sueldo se aplicará para <strong>{monthName} {selectedYear}</strong> y meses posteriores. Tus balances de meses pasados no se modificarán.
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Ingreso Mensual Base */}
          <div className="form-group">
            <label className="form-label">Sueldo Base ($)</label>
            <div style={{ position: 'relative' }}>
              <DollarSign size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                className="form-input"
                style={{ paddingLeft: '40px', fontSize: '1.3rem', fontWeight: 700 }}
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
              />
            </div>
          </div>

          {/* Info Aguinaldo Estimado en Junio y Diciembre */}
          {(selectedMonth === 6 || selectedMonth === 12) && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))',
              border: '1px dashed #f59e0b',
              borderRadius: '14px',
              padding: '12px 14px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Gift size={20} color="#f59e0b" />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>Aguinaldo este mes (+50%):</strong>
                <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.95rem' }}>
                  +{formatCurrency(estimatedAguinaldo)}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', borderRadius: '14px', marginTop: '10px' }}
          >
            <Save size={18} />
            <span>{loading ? 'Guardando...' : `Guardar Sueldo para ${monthName}`}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
