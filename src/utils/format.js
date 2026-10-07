export const CURRENCY = import.meta.env.VITE_CURRENCY || '$';

export const formatMoney = (n) =>
  `${CURRENCY}${Number(n || 0).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const pad = (n) => String(n).padStart(2, '0');

/** Fecha local en formato YYYY-MM-DD */
export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Mes actual en formato YYYY-MM */
export const currentMonth = () => todayStr().slice(0, 7);

export const monthLabel = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  const s = new Date(y, m - 1, 1).toLocaleDateString('es', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const dateLabel = (ymd) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
};

/** Verde < 70%, amarillo 70-90%, rojo > 90% */
export const levelFor = (pct) => (pct > 90 ? 'danger' : pct >= 70 ? 'warn' : 'ok');
