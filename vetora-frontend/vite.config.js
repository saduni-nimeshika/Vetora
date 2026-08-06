import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,         // 💡 Port එක 5173 ට Fix කළා
    strictPort: true,   // 💡 5173 වැඩ නැත්නම් වෙන Port වලට Auto මාරු වෙන්න දෙන්නේ නෑ
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})