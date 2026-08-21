import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getPostLoginPath } from '@/utils/authRoles'
import { hasValidStoredAccessToken } from '@/utils/authSession'

export default function ProtectedRoute({
  requireSuperAdmin = false,
  requireOrgOrSuperAdmin = false,
  requireSchoolAdmin = false,
  requireMenuAllocator = false,
}) {
  const { isAuthenticated, isSuperAdmin, isOrgAdmin, isSchoolAdmin, isHydrated, user } = useAuth()
  const hasStoredSession = hasValidStoredAccessToken()

  if (!isHydrated && !hasStoredSession) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Restoring session…
      </div>
    )
  }

  if (!isAuthenticated && !hasStoredSession) {
    return <Navigate to="/login" replace />
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  if (requireOrgOrSuperAdmin && !isSuperAdmin && !isOrgAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  if (requireSchoolAdmin && !isSchoolAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  if (requireMenuAllocator && !isSuperAdmin && !isOrgAdmin && !isSchoolAdmin) {
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
