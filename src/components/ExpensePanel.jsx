import { useMemo, useState } from 'react';
import { DEFAULT_CATEGORIES, getCategory } from '../utils/categories';
import { CURRENCY, dateLabel, formatMoney, todayStr } from '../utils/format';
import { useToast } from '../context/ToastContext';

function ExpenseForm({ initial, onSubmit, onCancel }) {
  const notify = useToast();
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId || DEFAULT_CATEGORIES[0].id);
  const [description, setDescription] = useState(initial?.description || '');
  const [date, setDate] = useState(initial?.date || todayStr());

  const submit = async (e) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (isNaN(n) || n <= 0) return notify('Ingresa un monto mayor a 0', 'error');
    await onSubmit({ amount: n, categoryId, description: description.trim(), date });
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
      <label>Categoría
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {DEFAULT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </label>
      <label>Descripción
        <input value={description} maxLength={80} onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Almuerzo trabajo" />
      </label>
      <div className="form-actions">
        <button className="btn btn-primary">{initial ? 'Guardar cambios' : 'Agregar gasto'}</button>
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>}
      </div>
    </form>
  );
}

export default function ExpensePanel({ expenses, onAdd, onUpdate, onDelete }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return expenses
      .filter((e) => filter === 'all' || e.categoryId === filter)
      .filter((e) => !q || e.description.toLowerCase().includes(q) || getCategory(e.categoryId).name.toLowerCase().includes(q))
      .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
  }, [expenses, filter, search]);

  const filteredTotal = list.reduce((s, e) => s + e.amount, 0);

  const remove = (e) => {
    if (window.confirm(`¿Eliminar el gasto de ${formatMoney(e.amount)}?`)) onDelete(e.id);
  };

  return (
    <div className="stack">
      <div className="card">
        <h2>Nuevo gasto</h2>
        <ExpenseForm onSubmit={onAdd} />
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Historial del mes</h2>
          <strong>{formatMoney(filteredTotal)}</strong>
        </div>
        <div className="filters">
          <input type="search" placeholder="🔍 Buscar…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrar por categoría">
            <option value="all">Todas las categorías</option>
            {DEFAULT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>

        {list.length === 0 && <p className="muted empty">No hay gastos para mostrar.</p>}
        <ul className="expenses">
          {list.map((e) => {
            const cat = getCategory(e.categoryId);
            if (editingId === e.id) {
              return (
                <li key={e.id} className="expense editing">
                  <ExpenseForm initial={e}
                    onSubmit={async (d) => { await onUpdate(e.id, d); setEditingId(null); }}
                    onCancel={() => setEditingId(null)} />
                </li>
              );
            }
            return (
              <li key={e.id} className="expense">
                <span className="dot" style={{ background: cat.color }}>{cat.icon}</span>
                <div className="expense-info">
                  <strong>{e.description || cat.name}</strong>
                  <span className="muted">{cat.name} · {dateLabel(e.date)}</span>
                </div>
                <div className="expense-right">
                  <strong>{formatMoney(e.amount)}</strong>
                  <div className="actions">
                    <button className="icon-btn" aria-label="Editar" onClick={() => setEditingId(e.id)}>✏️</button>
                    <button className="icon-btn" aria-label="Eliminar" onClick={() => remove(e)}>🗑️</button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
