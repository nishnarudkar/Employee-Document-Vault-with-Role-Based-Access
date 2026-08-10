import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // amazon-cognito-identity-js references the Node.js `global` object.
  // Vite does not define it in browser bundles by default.
  // This tells Vite to replace any reference to `global` with `globalThis`,
  // which is the cross-environment standard supported in all modern browsers.
  define: {
    global: 'globalThis',
  },
})

