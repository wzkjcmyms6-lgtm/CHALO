import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { db } from './services';
import { currentMonth, monthLabel } from './utils/format';
import Login from './components/Login';
import BudgetPanel from './components/BudgetPanel';
import ExpensePanel from './components/ExpensePanel';

export default function App() {
  const { user, loading, logout } = useAuth();
  if (loading) return <div className="center muted">Cargando…</div>;
  return user ? <Dashboard user={user} onLogout={logout} /> : <Login />;
}

function Dashboard({ user, onLogout }) {
  const notify = useToast();
  const month = currentMonth();
  const [budget, setBudget] = useState({ total: 0, categories: {} });
  const [expenses, setExpenses] = useState([]);
  const [tab, setTab] = useState('expenses'); // solo afecta a móvil

  const load = useCallback(async () => {
    try {
      const [b, e] = await Promise.all([db.getBudget(user.id, month), db.listExpenses(user.id, month)]);
      setBudget(b);
      setExpenses(e);
    } catch (err) {
      notify(`Error al cargar datos: ${err.message}`, 'error');
    }
  }, [user.id, month, notify]);

  useEffect(() => {
    load();
  }, [load]);

  const saveBudget = async (next) => {
    await db.saveBudget(user.id, month, next);
    setBudget(next);
    notify('Presupuesto actualizado');
  };
  const addExpense = async (data) => {
    await db.addExpense(user.id, data);
    await load();
    notify('Gasto agregado');
  };
  const updateExpense = async (id, data) => {
    await db.updateExpense(id, data);
    await load();
    notify('Gasto actualizado');
  };
  const deleteExpense = async (id) => {
    await db.deleteExpense(id);
    await load();
    notify('Gasto eliminado');
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>💸 Mis Gastos</h1>
          <p className="muted">{monthLabel(month)} · Hola, {user.username}</p>
        </div>
        <button className="btn btn-ghost" onClick={onLogout}>Salir</button>
      </header>

      <nav className="tabs" aria-label="Paneles">
        <button className={tab === 'budget' ? 'active' : ''} onClick={() => setTab('budget')}>📊 Presupuesto</button>
        <button className={tab === 'expenses' ? 'active' : ''} onClick={() => setTab('expenses')}>🧾 Gastos</button>
      </nav>

      <main className="grid">
        <section className={`panel-wrap ${tab === 'budget' ? 'show' : ''}`}>
          <BudgetPanel budget={budget} expenses={expenses} onSave={saveBudget} />
        </section>
        <section className={`panel-wrap ${tab === 'expenses' ? 'show' : ''}`}>
          <ExpensePanel
            expenses={expenses}
            onAdd={addExpense}
            onUpdate={updateExpense}
            onDelete={deleteExpense}
          />
        </section>
      </main>
    </div>
  );
}
