import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, limit,
} from 'firebase/firestore';
import { sha256, SEED_USER } from './hash';

/**
 * Implementación sobre Firebase Firestore con el mismo contrato que localStorageService.
 * Colecciones: `users`, `budgets` (id: `${userId}_${YYYY-MM}`), `expenses` e `incomes`.
 * Login custom: usuario + hash SHA-256 guardados en `users`.
 *
 * NOTA: para producción, usa Firebase Authentication y reglas de seguridad de Firestore;
 * un login custom en el cliente no protege los datos por sí solo.
 */
const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});
const db = getFirestore(app);
const SESSION_KEY = 'chalo.session';

async function ensureSeed() {
  const q = query(collection(db, 'users'), where('username', '==', SEED_USER.username), limit(1));
  if ((await getDocs(q)).empty) {
    await addDoc(collection(db, 'users'), {
      username: SEED_USER.username,
      passwordHash: await sha256(SEED_USER.password),
    });
  }
}

export const firebaseService = {
  async login(username, password) {
    await ensureSeed();
    const q = query(collection(db, 'users'), where('username', '==', username.trim()), limit(1));
    const snap = await getDocs(q);
    const hash = await sha256(password);
    if (snap.empty || snap.docs[0].data().passwordHash !== hash) {
      throw new Error('Usuario o contraseña incorrectos');
    }
    const session = { id: snap.docs[0].id, username: snap.docs[0].data().username };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },
  async getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
      return null;
    }
  },
  async logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  async getBudget(userId, month) {
    const snap = await getDoc(doc(db, 'budgets', `${userId}_${month}`));
    return snap.exists() ? snap.data() : { total: 0, categories: {} };
  },
  async saveBudget(userId, month, budget) {
    await setDoc(doc(db, 'budgets', `${userId}_${month}`), { ...budget, userId, month });
    return budget;
  },

  async listExpenses(userId, month) {
    const snap = await getDocs(query(collection(db, 'expenses'), where('userId', '==', userId)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((e) => e.date.startsWith(month));
  },
  async addExpense(userId, data) {
    const payload = { userId, ...data, createdAt: Date.now() };
    const ref = await addDoc(collection(db, 'expenses'), payload);
    return { id: ref.id, ...payload };
  },
  async updateExpense(id, data) {
    await updateDoc(doc(db, 'expenses', id), data);
    return { id, ...data };
  },
  async deleteExpense(id) {
    await deleteDoc(doc(db, 'expenses', id));
  },

  async listIncomes(userId, month) {
    const snap = await getDocs(query(collection(db, 'incomes'), where('userId', '==', userId)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((i) => i.date.startsWith(month));
  },
  async addIncome(userId, data) {
    const payload = { userId, ...data, createdAt: Date.now() };
    const ref = await addDoc(collection(db, 'incomes'), payload);
    return { id: ref.id, ...payload };
  },
  async updateIncome(id, data) {
    await updateDoc(doc(db, 'incomes', id), data);
    return { id, ...data };
  },
  async deleteIncome(id) {
    await deleteDoc(doc(db, 'incomes', id));
  },
};
