import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Gift, Sparkles } from 'lucide-react';

const MONTHS = [
  { id: 1, name: 'Enero', short: 'Ene' },
  { id: 2, name: 'Febrero', short: 'Feb' },
  { id: 3, name: 'Marzo', short: 'Mar' },
  { id: 4, name: 'Abril', short: 'Abr' },
  { id: 5, name: 'Mayo', short: 'May' },
  { id: 6, name: 'Junio', short: 'Jun', hasAguinaldo: true },
  { id: 7, name: 'Julio', short: 'Jul' },
  { id: 8, name: 'Agosto', short: 'Ago' },
  { id: 9, name: 'Septiembre', short: 'Sep' },
  { id: 10, name: 'Octubre', short: 'Oct' },
  { id: 11, name: 'Noviembre', short: 'Nov' },
  { id: 12, name: 'Diciembre', short: 'Dic', hasAguinaldo: true }
];

export default function MonthSelector({ selectedYear, selectedMonth, onSelectMonth, onSelectYear }) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      onSelectMonth(12);
      onSelectYear(selectedYear - 1);
    } else {
      onSelectMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      onSelectMonth(1);
      onSelectYear(selectedYear + 1);
    } else {
      onSelectMonth(selectedMonth + 1);
    }
  };

  return (
    <div className="card" style={{ padding: '16px 20px', marginBottom: '24px', background: 'var(--bg-card)' }}>
      {/* Fila Superior */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        paddingBottom: '14px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {/* Lado Izquierdo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--accent-primary)',
            padding: '10px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={22} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
                {MONTHS[selectedMonth - 1].name} {selectedYear}
              </h2>
              {selectedYear === currentYear && selectedMonth === currentMonth && (
                <span className="badge" style={{ background: 'var(--accent-primary)', color: '#fff', fontSize: '0.68rem', padding: '3px 8px' }}>
                  Mes Actual
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Seleccioná un mes para ver y filtrar tus balances
            </span>
          </div>
        </div>

        {/* Lado Derecho */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handlePrevMonth}
            className="btn btn-secondary"
            style={{ width: '38px', height: '38px', padding: 0, borderRadius: '12px' }}
            title="Mes Anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <select
            value={selectedYear}
            onChange={(e) => onSelectYear(parseInt(e.target.value))}
            className="form-select"
            style={{ padding: '6px 12px', fontSize: '0.9rem', width: 'auto', height: '38px', borderRadius: '12px', fontWeight: 700 }}
          >
            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={handleNextMonth}
            className="btn btn-secondary"
            style={{ width: '38px', height: '38px', padding: 0, borderRadius: '12px' }}
            title="Mes Siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Grid de 12 Meses */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '6px',
        width: '100%',
        overflowX: 'auto'
      }}>
        {MONTHS.map((m) => {
          const isSelected = selectedMonth === m.id;
          const isCurrent = selectedYear === currentYear && currentMonth === m.id;

          return (
            <button
              key={m.id}
              onClick={() => onSelectMonth(m.id)}
              style={{
                padding: '10px 4px',
                borderRadius: '12px',
                border: isSelected
                  ? '2px solid var(--accent-primary)'
                  : isCurrent
                  ? '1px solid var(--accent-primary)'
                  : '1px solid var(--border-color)',
                background: isSelected
                  ? 'linear-gradient(135deg, var(--accent-primary), #818cf8)'
                  : isCurrent
                  ? 'rgba(99, 102, 241, 0.12)'
                  : 'var(--input-bg)',
                color: isSelected ? '#ffffff' : isCurrent ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: isSelected || isCurrent ? 800 : 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 4px 14px rgba(99, 102, 241, 0.35)' : 'none',
                minWidth: '54px'
              }}
            >
              <span>{m.short}</span>
              {m.hasAguinaldo && (
                <span style={{ fontSize: '0.62rem', color: isSelected ? '#fef08a' : '#f59e0b', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '2px' }}>
                  🎁 SAC
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
