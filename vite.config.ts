import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // CRITICAL: This ensures Electron can find your assets inside the .exe
  base: './', 
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
