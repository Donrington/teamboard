import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Consume the shared package straight from its TS source so Vite bundles it as
      // ESM (enums + const values resolve cleanly). The backend still uses the built
      // CommonJS dist — one contract, two consumption paths (docs/01, docs/05).
      '@teamboard/shared': fileURLToPath(new URL('../shared/src/index.ts', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Allow importing the sibling `shared/` source from within the monorepo.
    fs: { allow: ['..'] },
  },
});
