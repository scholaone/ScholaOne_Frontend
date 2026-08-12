import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getPostLoginPath } from '@/utils/authRoles'

export default function ProtectedRoute({ requireSuperAdmin = false, requireSchoolAdmin = false }) {
  const { isAuthenticated, isSuperAdmin, isSchoolAdmin, isHydrated, user } = useAuth()

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Restoring session…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  if (requireSchoolAdmin && !isSchoolAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export function PublicRoute() {
  const { isAuthenticated, isHydrated, user, getDashboardPath } = useAuth()

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath?.() || getPostLoginPath(user) || '/dashboard'} replace />
  }

  return <Outlet />
}
