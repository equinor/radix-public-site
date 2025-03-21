import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
        output: {
            format: 'es',
            globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
            },
            manualChunks(id) {
                if (/environmentVariables.ts/.test(id)) {
                    return 'environmentVariables'
                }
            },
        },
    }
  }
})
