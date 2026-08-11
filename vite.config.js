import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = (env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000').replace(/\/+$/, '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/media': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              if (id.includes('/pages/fees/')) return 'module-fees'
              if (id.includes('/pages/students/')) return 'module-students'
              if (id.includes('/pages/teachers/')) return 'module-teachers'
              if (id.includes('/pages/admissions/')) return 'module-admissions'
              if (id.includes('/pages/attendance/')) return 'module-attendance'
              if (id.includes('/pages/lms/')) return 'module-lms'
              if (id.includes('/pages/documents/')) return 'module-documents'
              if (id.includes('/pages/assessments/')) return 'module-assessments'
              if (id.includes('/pages/organizations/')) return 'module-orgs'
              if (id.includes('/features/form-builder/')) return 'module-forms'
              return undefined
            }
            if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts'
            if (id.includes('framer-motion')) return 'vendor-motion'
            if (id.includes('@tanstack')) return 'vendor-query'
            if (id.includes('react-dom') || id.includes('react-router')) return 'vendor-react'
            if (id.includes('axios')) return 'vendor-http'
            return undefined
          },
        },
      },
    },
  }
})
