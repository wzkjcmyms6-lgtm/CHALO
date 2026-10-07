import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import { CURRENCY, formatMoney, levelFor } from '../utils/format';
import { useToast } from '../context/ToastContext';

function Progress({ spent, limit }) {
  const pct = limit > 0 ? (spent / limit) * 100 : 0;
  return (
    <div className="progress" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`progress-bar ${levelFor(pct)}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

export default function BudgetPanel({ budget, expenses, incomes = [], onSave }) {
  const notify = useToast();
  const [total, setTotal] = useState('');
  const [cats, setCats] = useState({});
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setTotal(budget.total ? String(budget.total) : '');
    setCats(Object.fromEntries(Object.entries(budget.categories || {}).map(([k, v]) => [k, String(v)])));
  }, [budget]);

  const spent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const income = useMemo(() => incomes.reduce((s, i) => s + i.amount, 0), [incomes]);
  const balance = income - spent;
  const spentBy = useMemo(() => {
    const m = {};
    expenses.forEach((e) => (m[e.categoryId] = (m[e.categoryId] || 0) + e.amount));
    return m;
  }, [expenses]);

  const limit = budget.total || 0;
  const pct = limit > 0 ? (spent / limit) * 100 : 0;
  const remaining = limit - spent;
  const level = levelFor(pct);

  const save = async (e) => {
    e.preventDefault();
    const t = parseFloat(total);
    if (isNaN(t) || t < 0) return notify('Ingresa un presupuesto total válido', 'error');
    const categories = {};
    for (const [k, v] of Object.entries(cats)) {
      const n = parseFloat(v);
      if (v !== '' && (isNaN(n) || n < 0)) return notify('Monto de categoría inválido', 'error');
      if (n > 0) categories[k] = n;
    }
    await onSave({ total: t, categories });
    setEditing(false);
  };

  return (
    <div className="card">
      <div className="card-head">
        <h2>Presupuesto mensual</h2>
        <button className="btn btn-ghost" onClick={() => setEditing((v) => !v)}>
          {editing ? 'Cancelar' : limit ? 'Editar' : 'Definir'}
        </button>
      </div>

      <div className="stats balance">
        <div><span className="muted">Ingresos</span><strong className="text-ok">{formatMoney(income)}</strong></div>
        <div><span className="muted">Gastos</span><strong>{formatMoney(spent)}</strong></div>
        <div>
          <span className="muted">Balance</span>
          <strong className={balance < 0 ? 'text-danger' : 'text-ok'}>
            {balance < 0 && '-'}{formatMoney(Math.abs(balance))}
          </strong>
        </div>
      </div>

      {limit > 0 ? (
        <>
          <div className="stats">
            <div><span className="muted">Presupuesto</span><strong>{formatMoney(limit)}</strong></div>
            <div><span className="muted">Gastado</span><strong>{formatMoney(spent)}</strong></div>
            <div>
              <span className="muted">{remaining >= 0 ? 'Disponible' : 'Excedido'}</span>
              <strong className={remaining < 0 ? 'text-danger' : ''}>{formatMoney(Math.abs(remaining))}</strong>
            </div>
          </div>
          <Progress spent={spent} limit={limit} />
          <p className={`pct text-${level}`}>{pct.toFixed(0)}% del presupuesto usado</p>
        </>
      ) : (
        !editing && <p className="muted">Aún no definiste un presupuesto para este mes.</p>
      )}

      {editing && (
        <form onSubmit={save} className="budget-form">
          <label>Presupuesto total del mes ({CURRENCY})
            <input type="number" min="0" step="0.01" inputMode="decimal" value={total}
              onChange={(e) => setTotal(e.target.value)} placeholder="0.00" required />
          </label>
          <h3>Por categoría <span className="muted">(opcional)</span></h3>
          {DEFAULT_CATEGORIES.map((c) => (
            <label key={c.id} className="row-label">
              <span>{c.icon} {c.name}</span>
              <input type="number" min="0" step="0.01" inputMode="decimal" value={cats[c.id] ?? ''}
                onChange={(e) => setCats({ ...cats, [c.id]: e.target.value })} placeholder="—" />
            </label>
          ))}
          <button className="btn btn-primary">Guardar presupuesto</button>
        </form>
      )}

      {!editing && (
        <div className="cat-list">
          <h3>Por categoría</h3>
          {DEFAULT_CATEGORIES.map((c) => {
            const s = spentBy[c.id] || 0;
            const l = budget.categories?.[c.id] || 0;
            if (!s && !l) return null;
            return (
              <div key={c.id} className="cat-item">
                <div className="cat-row">
                  <span>{c.icon} {c.name}</span>
                  <span className="muted">{formatMoney(s)}{l > 0 && ` / ${formatMoney(l)}`}</span>
                </div>
                {l > 0 && <Progress spent={s} limit={l} />}
              </div>
            );
          })}
          {expenses.length === 0 && <p className="muted">Sin gastos este mes.</p>}
        </div>
      )}
    </div>
  );
}
