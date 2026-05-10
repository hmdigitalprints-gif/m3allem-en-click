import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      nodePolyfills({
        include: ['buffer', 'process', 'events', 'stream', 'util'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      })
    ],
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      global: 'window',
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react/') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('react-router')) {
                return 'react-vendor';
              }
              if (id.includes('framer-motion') || id.includes('motion')) {
                return 'framer-motion';
              }
              if (id.includes('lucide')) {
                return 'lucide-icons';
              }
              if (id.includes('recharts') || id.includes('d3')) {
                return 'recharts';
              }
              if (id.includes('firebase')) {
                return 'firebase';
              }
              if (id.includes('i18next') || id.includes('react-i18next')) {
                return 'i18n';
              }
              if (id.includes('@stripe') || id.includes('stripe')) {
                return 'stripe';
              }
              if (id.includes('leaflet') || id.includes('react-leaflet')) {
                return 'leaflet';
              }
              if (id.includes('uuid')) {
                return 'uuid';
              }
              return 'vendor';
            }
          }
        }
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
