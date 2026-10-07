export const DEFAULT_CATEGORIES = [
  { id: 'fiesta', name: 'Fiesta y Entretenimiento', hint: 'Alcohol, entradas, eventos', icon: '🎉', color: '#a855f7' },
  { id: 'comida', name: 'Comida y Alimentos', hint: 'Restaurantes, supermercado, snacks', icon: '🍔', color: '#f97316' },
  { id: 'bebidas', name: 'Bebidas', hint: 'Café, refrescos, salidas informales', icon: '☕', color: '#0ea5e9' },
  { id: 'transporte', name: 'Transporte', hint: 'Taxi, gasolina, transporte público', icon: '🚕', color: '#eab308' },
  { id: 'otros', name: 'Otros / Varios', hint: '', icon: '📦', color: '#64748b' },
];

export const getCategory = (id) =>
  DEFAULT_CATEGORIES.find((c) => c.id === id) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
