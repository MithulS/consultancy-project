import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Listen on all addresses
    strictPort: false, // Try other ports if 5173 is busy
    hmr: true, // Let Vite auto-detect the correct HMR port
    proxy: {
      // Proxy API requests to backend (optional - bypasses CORS)
      // Uncomment to use proxy instead of CORS
      // '/api': {
      //   target: 'http://localhost:5000',
      //   changeOrigin: true,
      //   secure: false,
      //   configure: (proxy, options) => {
      //     proxy.on('error', (err, req, res) => {
      //       console.log('❌ Proxy error:', err.message);
      //     });
      //     proxy.on('proxyReq', (proxyReq, req, res) => {
      //       console.log('🔄 Proxying:', req.method, req.url, '→', options.target);
      //     });
      //   }
      // }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor';
          }
        }
      }
    }
  }
})
