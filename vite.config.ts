import { defineConfig } from 'vite'
import reactSwc from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

export default defineConfig({
  plugins: [reactSwc()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
