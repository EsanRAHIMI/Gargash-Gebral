// /frontend/vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // بارگذاری .env
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',                // دسترسی از بیرون
      port: Number(env.PORT) || 3000,
    },
    preview: {
      host: '0.0.0.0',                // برای Vite preview
      port: Number(env.PORT) || 3000,
      allowedHosts: ['gebral.com'],   // دامنه‌ی خودت
    },
    define: {
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL),
      'import.meta.env.VITE_CHAT_URL':    JSON.stringify(env.VITE_CHAT_URL),
      'import.meta.env.VITE_AUTH_URL':    JSON.stringify(env.VITE_AUTH_URL),
    },
  }
})
