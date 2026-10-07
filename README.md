# 💸 Chalo · Presupuesto y Gastos

SPA mobile-first (React + Vite) para controlar el presupuesto mensual y registrar gastos diarios.

## Ejecutar en local

```bash
npm install
npm run dev        # http://localhost:5173
```

Producción: `npm run build` y `npm run preview`.

**Login inicial:** usuario `Chalo` · contraseña `130602`

## Funcionalidades

- **Panel 1 – Presupuesto:** límite mensual, límite opcional por categoría, gastado / disponible y barra de progreso (verde < 70 %, amarillo 70–90 %, rojo > 90 %).
- **Panel 2 – Gastos:** formulario rápido (monto, categoría, descripción, fecha), historial del mes con búsqueda, filtro por categoría, edición y borrado.
- Mensajes de confirmación (toasts) al agregar/editar/eliminar gastos y actualizar el presupuesto.
- En móvil los paneles se alternan con la barra inferior; en escritorio se muestran lado a lado.

## Estructura

```
src/
  services/
    index.js               # selecciona el backend (VITE_DATA_BACKEND)
    localStorageService.js # persistencia en LocalStorage (por defecto)
    firebaseService.js     # Firestore: colecciones users, budgets, expenses
    hash.js                # SHA-256 de contraseñas + usuario inicial
  context/                 # AuthContext, ToastContext
  components/              # Login, BudgetPanel, ExpensePanel
  utils/                   # categorías y formato
```

La UI solo habla con `db` (`src/services/index.js`); cambiar de backend no requiere tocar componentes.

## Usar Firebase

1. Crea un proyecto en Firebase y habilita **Firestore**.
2. `cp .env.example .env` y completa las claves `VITE_FIREBASE_*`.
3. Pon `VITE_DATA_BACKEND=firebase` y reinicia `npm run dev`.
4. En el primer login se crea el usuario `Chalo` en la colección `users`.

> ⚠️ El login es una comprobación del lado del cliente (contraseña con hash SHA-256). Es válido para uso personal/pruebas; para producción usa Firebase Authentication + reglas de seguridad de Firestore.

Para Supabase: crea `supabaseService.js` con el mismo contrato (ver comentario en `localStorageService.js`) y regístralo en `services/index.js`.

## Moneda

Cambia el símbolo con `VITE_CURRENCY` en `.env` (por ejemplo `Bs`).
