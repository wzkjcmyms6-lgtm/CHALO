import { localStorageService } from './localStorageService';

/**
 * Punto único de acceso a datos. La UI solo importa `db` de aquí.
 * Cambia de backend con VITE_DATA_BACKEND=firebase en .env (ver .env.example).
 * Para añadir Supabase u otro: crea otro archivo con el mismo contrato y regístralo aquí.
 */
const backend = import.meta.env.VITE_DATA_BACKEND || 'local';

const lazy = (loader) =>
  new Proxy({}, {
    get: (_, method) => async (...args) => (await loader())[method](...args),
  });

export const db =
  backend === 'firebase'
    ? lazy(() => import('./firebaseService').then((m) => m.firebaseService))
    : localStorageService;
