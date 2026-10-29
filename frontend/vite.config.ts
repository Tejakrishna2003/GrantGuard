import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        timeout: 120000,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            // Log proxy disconnects gracefully without crashing dev server
          });
        }
      },
      '/uploads': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-aggrid': ['ag-grid-community', 'ag-grid-react'],
          'vendor-icons': ['lucide-react']
        }
      }
    }
  }
});
