import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Prevent Vite from pre-bundling onnxruntime-web so its internal
    // WASM file references (loaded via fetch at runtime) are not
    // renamed/hashed — ORT must be able to find them at well-known paths.
    exclude: ['onnxruntime-web'],
  },
})
