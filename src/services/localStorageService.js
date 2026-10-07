import { sha256, SEED_USER } from './hash';

/**
 * Implementación del servicio de datos sobre LocalStorage.
 * Contrato (compartido con firebaseService.js):
 *   login(username, password) -> { id, username }
 *   getSession() / logout()
 *   getBudget(userId, month) -> { total, categories: { [catId]: number } }
 *   saveBudget(userId, month, budget)
 *   listExpenses(userId, month) -> Expense[]
 *   addExpense(userId, data) / updateExpense(id, data) / deleteExpense(id)
 */
const KEYS = {
  users: 'chalo.users',
  budgets: 'chalo.budgets',
  expenses: 'chalo.expenses',
  session: 'chalo.session',
};

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

async function ensureSeed() {
  const users = read(KEYS.users, []);
  if (!users.some((u) => u.username === SEED_USER.username)) {
    users.push({ id: 'user-chalo', username: SEED_USER.username, passwordHash: await sha256(SEED_USER.password) });
    write(KEYS.users, users);
  }
}

export const localStorageService = {
  async login(username, password) {
    await ensureSeed();
    const hash = await sha256(password);
    const user = read(KEYS.users, []).find((u) => u.username === username.trim() && u.passwordHash === hash);
    if (!user) throw new Error('Usuario o contraseña incorrectos');
    const session = { id: user.id, username: user.username };
    write(KEYS.session, session);
    return session;
  },
  async getSession() {
    return read(KEYS.session, null);
  },
  async logout() {
    localStorage.removeItem(KEYS.session);
  },

  async getBudget(userId, month) {
    return read(KEYS.budgets, {})[`${userId}_${month}`] || { total: 0, categories: {} };
  },
  async saveBudget(userId, month, budget) {
    const all = read(KEYS.budgets, {});
    all[`${userId}_${month}`] = budget;
    write(KEYS.budgets, all);
    return budget;
  },

  async listExpenses(userId, month) {
    return read(KEYS.expenses, []).filter((e) => e.userId === userId && e.date.startsWith(month));
  },
  async addExpense(userId, data) {
    const expense = { id: uid(), userId, ...data, createdAt: Date.now() };
    write(KEYS.expenses, [...read(KEYS.expenses, []), expense]);
    return expense;
  },
  async updateExpense(id, data) {
    const all = read(KEYS.expenses, []).map((e) => (e.id === id ? { ...e, ...data } : e));
    write(KEYS.expenses, all);
    return all.find((e) => e.id === id);
  },
  async deleteExpense(id) {
    write(KEYS.expenses, read(KEYS.expenses, []).filter((e) => e.id !== id));
  },
};
