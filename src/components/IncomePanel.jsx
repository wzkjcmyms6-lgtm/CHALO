import { useState } from 'react';
import { CURRENCY, dateLabel, formatMoney, todayStr } from '../utils/format';
import { useToast } from '../context/ToastContext';

function IncomeForm({ initial, onSubmit, onCancel }) {
  const notify = useToast();
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [description, setDescription] = useState(initial?.description || '');
  const [date, setDate] = useState(initial?.date || todayStr());

  const submit = async (e) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (isNaN(n) || n <= 0) return notify('Ingresa un monto mayor a 0', 'error');
    await onSubmit({ amount: n, description: description.trim(), date });
    if (!initial) {
      setAmount('');
      setDescription('');
    }
  };

  return (
    <form className="expense-form" onSubmit={submit}>
      <div className="form-row">
        <label>Monto ({CURRENCY})
          <input type="number" min="0" step="0.01" inputMode="decimal" value={amount}
            onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
        </label>
        <label>Fecha
          <input type="date" value={date} max={todayStr()} onChange={(e) => setDate(e.target.value)} required />
        </label>
      </div>
      <label>Descripción
        <input value={description} maxLength={80} onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Sueldo, mesada, venta" />
      </label>
      <div className="form-actions">
        <button className="btn btn-primary">{initial ? 'Guardar cambios' : 'Agregar ingreso'}</button>
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>}
      </div>
    </form>
  );
}

export default function IncomePanel({ incomes, onAdd, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const list = [...incomes].sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
  const total = list.reduce((s, i) => s + i.amount, 0);

  const remove = (i) => {
    if (window.confirm(`¿Eliminar el ingreso de ${formatMoney(i.amount)}?`)) onDelete(i.id);
  };

  return (
    <div className="stack">
      <div className="card">
        <h2>Nuevo ingreso</h2>
        <IncomeForm onSubmit={onAdd} />
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Ingresos del mes</h2>
          <strong className="text-ok">{formatMoney(total)}</strong>
        </div>
        {list.length === 0 && <p className="muted empty">Aún no registraste ingresos este mes.</p>}
        <ul className="expenses">
          {list.map((i) =>
            editingId === i.id ? (
              <li key={i.id} className="expense editing">
                <IncomeForm initial={i}
                  onSubmit={async (d) => { await onUpdate(i.id, d); setEditingId(null); }}
                  onCancel={() => setEditingId(null)} />
              </li>
            ) : (
              <li key={i.id} className="expense">
                <span className="dot" style={{ background: '#16a34a22' }}>💰</span>
                <div className="expense-info">
                  <strong>{i.description || 'Ingreso'}</strong>
                  <span className="muted">{dateLabel(i.date)}</span>
                </div>
                <div className="expense-right">
                  <strong className="text-ok">+{formatMoney(i.amount)}</strong>
                  <div className="actions">
                    <button className="icon-btn" aria-label="Editar" onClick={() => setEditingId(i.id)}>✏️</button>
                    <button className="icon-btn" aria-label="Eliminar" onClick={() => remove(i)}>🗑️</button>
                  </div>
                </div>
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
}
