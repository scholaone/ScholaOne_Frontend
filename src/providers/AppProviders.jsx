import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { TenantProvider } from '@/contexts/TenantContext'
import { UIProvider } from '@/contexts/UIContext'
import AppRoutes from '@/routes/AppRoutes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // Prefer empty UI over hard crash screens for failed list/dashboard loads
      throwOnError: false,
    },
  },
})

export default function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TenantProvider>
            <UIProvider>
              {children || <AppRoutes />}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    borderRadius: '12px',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #e2e8f0',
                    boxShadow: 'var(--shadow-elevated)',
                    fontWeight: 500,
                  },
                }}
              />
            </UIProvider>
          </TenantProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
