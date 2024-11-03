// vite.config.js
import { defineConfig } from 'vite';


// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		minify: 'terser',
		cssMinify: true,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom'],
					ui: ['framer-motion', 'react-markdown']
				}
			}
		}
	}
});
