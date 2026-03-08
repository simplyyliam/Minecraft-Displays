import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@ui/core": path.resolve(__dirname, "../ui/src"),
    },
  },
  optimizeDeps: {
    include: ["@ui/core"],
  },
})
