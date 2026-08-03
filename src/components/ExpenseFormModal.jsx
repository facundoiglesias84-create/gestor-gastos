import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, Calendar, CreditCard, RefreshCw, Layers, CalendarClock } from 'lucide-react';
import { DEFAULT_CARDS } from './CardsSummary';

export const PAYMENT_METHODS = [
  'Tarjeta de Crédito',
  'Tarjeta de Débito',
  'Efectivo',
  'Transferencia'
];

export default function ExpenseFormModal({ isOpen, onClose, onSave, editingExpense, defaultDate }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta de Crédito');
  const [cardName, setCardName] = useState('Visa Santander');
  const [customCardName, setCustomCardName] = useState('');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [payNextMonth, setPayNextMonth] = useState(true);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isInstallments, setIsInstallments] = useState(false);
  const [installmentTotal, setInstallmentTotal] = useState(3);

  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title || '');
      setAmount(editingExpense.amount || '');
      setPaymentMethod(editingExpense.payment_method || 'Tarjeta de Crédito');
      setCardName(editingExpense.card_name || 'Visa Santander');
      const formattedDate = editingExpense.date ? new Date(editingExpense.date).toISOString().split('T')[0] : defaultDate;
      setDate(formattedDate);
      setPayNextMonth(editingExpense.pay_next_month !== undefined ? editingExpense.pay_next_month : true);
      setIsRecurring(Boolean(editingExpense.is_recurring));
      setIsInstallments((editingExpense.installment_total || 1) > 1);
      setInstallmentTotal(editingExpense.installment_total || 3);
    } else {
      setTitle('');
      setAmount('');
      setPaymentMethod('Tarjeta de Crédito');
      setCardName('Visa Santander');
      setCustomCardName('');
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setPayNextMonth(true);
      setIsRecurring(false);
      setIsInstallments(false);
      setInstallmentTotal(3);
    }
  }, [editingExpense, isOpen, defaultDate]);

  if (!isOpen) return null;

  const isCardPayment = paymentMethod.toLowerCase().includes('tarjeta');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || parseFloat(amount) <= 0) return;

    const finalCardName = isCardPayment
      ? (cardName === 'CUSTOM' ? customCardName.trim() : cardName)
      : '';

    onSave({
      id: editingExpense ? editingExpense.id : undefined,
      title: title.trim(),
      amount: parseFloat(amount),
      category: 'General',
      payment_method: paymentMethod,
      card_name: finalCardName,
      date,
      pay_next_month: payNextMonth,
      is_recurring: isRecurring,
      installment_total: isInstallments ? parseInt(installmentTotal) || 1 : 1
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
            {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Monto */}
          <div className="form-group">
            <label className="form-label">Monto ($)</label>
            <div style={{ position: 'relative' }}>
              <DollarSign size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                className="form-input"
                style={{ paddingLeft: '40px', fontSize: '1.3rem', fontWeight: 700 }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Título / Concepto */}
          <div className="form-group">
            <label className="form-label">Descripción / Detalle</label>
            <input
              type="text"
              required
              placeholder="Ej: Supermercado Coto, Alquiler, Nafta"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Método de Pago y Fecha */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Método de Pago</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => {
                  const val = e.target.value;
                  setPaymentMethod(val);
                  if (val.toLowerCase().includes('tarjeta')) {
                    setPayNextMonth(true);
                  }
                }}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Fecha de Compra</label>
              <input
                type="date"
                required
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* OPCIÓN MES VENCIDO */}
          <div className="form-group" style={{
            background: payNextMonth ? 'rgba(245, 158, 11, 0.12)' : 'var(--input-bg)',
            border: payNextMonth ? '1px solid #f59e0b' : '1px solid var(--border-color)',
            padding: '14px',
            borderRadius: '14px',
            marginBottom: '16px'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CalendarClock size={20} color={payNextMonth ? '#f59e0b' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: payNextMonth ? '#f59e0b' : 'var(--text-primary)' }}>
                    Liquida a Mes Vencido (Próximo Mes)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Comprás este mes pero impacta en el resumen/presupuesto del mes que viene
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={payNextMonth}
                onChange={(e) => setPayNextMonth(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#f59e0b' }}
              />
            </label>
          </div>

          {/* Selección de Tarjeta */}
          {isCardPayment && (
            <div className="form-group" style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <label className="form-label" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={16} />
                <span>¿Con qué Tarjeta abonás este gasto?</span>
              </label>
              <select
                className="form-select"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              >
                {DEFAULT_CARDS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="CUSTOM">+ Nombre Personalizado de Tarjeta</option>
              </select>

              {cardName === 'CUSTOM' && (
                <input
                  type="text"
                  required
                  placeholder="Ej: Visa Banco Macro, Naranja X"
                  className="form-input"
                  style={{ marginTop: '8px' }}
                  value={customCardName}
                  onChange={(e) => setCustomCardName(e.target.value)}
                />
              )}
            </div>
          )}

          {/* OPCIONES DE CUOTAS Y GASTO FIJO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {/* Gasto Fijo Recurrente */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: isRecurring ? 'rgba(16, 185, 129, 0.12)' : 'var(--input-bg)',
              border: isRecurring ? '1px solid var(--accent-secondary)' : '1px solid var(--border-color)',
              borderRadius: '14px',
              cursor: 'pointer'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <RefreshCw size={18} color={isRecurring ? 'var(--accent-secondary)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Es un Gasto Fijo Recurrente</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Se repetirá todos los meses (Alquiler, Luz, Internet)</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => {
                  setIsRecurring(e.target.checked);
                  if (e.target.checked) setIsInstallments(false);
                }}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-secondary)' }}
              />
            </label>

            {/* Pago en Cuotas */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: isInstallments ? 'rgba(99, 102, 241, 0.12)' : 'var(--input-bg)',
              border: isInstallments ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
              borderRadius: '14px',
              cursor: 'pointer'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layers size={18} color={isInstallments ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Es una compra en Cuotas</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Se distribuirá en la cantidad de cuotas elegida</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isInstallments}
                onChange={(e) => {
                  setIsInstallments(e.target.checked);
                  if (e.target.checked) setIsRecurring(false);
                }}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
              />
            </label>

            {/* Selector de Cantidad de Cuotas */}
            {isInstallments && (
              <div style={{ background: 'var(--input-bg)', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <label className="form-label">Cantidad de Cuotas</label>
                <select
                  className="form-select"
                  value={installmentTotal}
                  onChange={(e) => setInstallmentTotal(e.target.value)}
                >
                  {[2, 3, 6, 9, 12, 18, 24].map(n => (
                    <option key={n} value={n}>{n} cuotas fijas de ${amount || '0'}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Botón Guardar */}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '16px' }}>
            <Check size={20} />
            <span>{editingExpense ? 'Guardar Cambios' : 'Registrar Gasto'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
