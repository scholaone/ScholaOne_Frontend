import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { PageLoader } from '@/components/ui/Feedback'
import { getPostLoginPath } from '@/utils/authRoles'

export default function HomeRedirect() {
  const { isAuthenticated, isHydrated, user, getDashboardPath } = useAuth()

  if (!isHydrated) return <PageLoader />

  return (
    <Navigate
      to={isAuthenticated ? (getDashboardPath?.() || getPostLoginPath(user) || '/dashboard') : '/login'}
      replace
    />
  )
}
