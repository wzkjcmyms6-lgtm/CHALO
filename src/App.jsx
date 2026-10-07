import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { db } from './services';
import { currentMonth, monthLabel } from './utils/format';
import Login from './components/Login';
import BudgetPanel from './components/BudgetPanel';
import ExpensePanel from './components/ExpensePanel';
import IncomePanel from './components/IncomePanel';

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
  const [incomes, setIncomes] = useState([]);
  const [tab, setTab] = useState('expenses'); // solo afecta a móvil

  const load = useCallback(async () => {
    try {
      const [b, e, i] = await Promise.all([
        db.getBudget(user.id, month),
        db.listExpenses(user.id, month),
        db.listIncomes(user.id, month),
      ]);
      setBudget(b);
      setExpenses(e);
      setIncomes(i);
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

  const addIncome = async (data) => {
    await db.addIncome(user.id, data);
    await load();
    notify('Ingreso agregado');
  };
  const updateIncome = async (id, data) => {
    await db.updateIncome(id, data);
    await load();
    notify('Ingreso actualizado');
  };
  const deleteIncome = async (id) => {
    await db.deleteIncome(id);
    await load();
    notify('Ingreso eliminado');
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
        <button className={tab === 'income' ? 'active' : ''} onClick={() => setTab('income')}>💰 Ingresos</button>
        <button className={tab === 'expenses' ? 'active' : ''} onClick={() => setTab('expenses')}>🧾 Gastos</button>
      </nav>

      <main className="grid">
        <div className="col">
          <section className={`panel-wrap ${tab === 'budget' ? 'show' : ''}`}>
            <BudgetPanel budget={budget} expenses={expenses} incomes={incomes} onSave={saveBudget} />
          </section>
          <section className={`panel-wrap ${tab === 'income' ? 'show' : ''}`}>
            <IncomePanel incomes={incomes} onAdd={addIncome} onUpdate={updateIncome} onDelete={deleteIncome} />
          </section>
        </div>
        <div className="col">
          <section className={`panel-wrap ${tab === 'expenses' ? 'show' : ''}`}>
            <ExpensePanel
              expenses={expenses}
              onAdd={addExpense}
              onUpdate={updateExpense}
              onDelete={deleteExpense}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
