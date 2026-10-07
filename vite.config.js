import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' permite servir la app desde la raíz o desde un subdirectorio (p. ej. GitHub Pages)
export default defineConfig({ base: './', plugins: [react()] });
