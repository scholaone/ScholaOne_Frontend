import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import useAutomationRunner from '@/hooks/useAutomationRunner'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { useUI } from '@/contexts/UIContext'
import { cn } from '@/lib/utils'
import '@/styles/dashboard-clay.css'

export default function DashboardLayout() {
  useAutomationRunner()
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUI()

  return (
    <NotificationProvider>
      <div className="flex h-dvh min-h-0 overflow-hidden bg-background">
      <div className="hidden h-full min-h-0 shrink-0 lg:block">
        <Sidebar />
      </div>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden
          />
          <div className={cn('absolute inset-y-0 left-0 z-50 shadow-xl')}>
            <Sidebar mobile onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain scrollbar-thin">
          <div className="mx-auto w-full min-w-0 max-w-full space-y-6 p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
      </div>
    </NotificationProvider>
  )
}
