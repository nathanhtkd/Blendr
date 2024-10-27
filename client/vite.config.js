// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor'; // Separate dependencies into a 'vendor' chunk
          }
        },
      },
    },
    chunkSizeWarningLimit: 800, // Adjust as needed
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development')
  }
}));
