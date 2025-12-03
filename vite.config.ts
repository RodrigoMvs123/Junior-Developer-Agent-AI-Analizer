import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cast process to any to resolve TS error 'Property cwd does not exist on type Process'
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    // Defines process.env.API_KEY globally so existing code using process.env works in the browser
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    // Sets base to relative path for generic deployment (e.g. GitHub Pages)
    base: './', 
    server: {
      port: 3000
    }
  }
})