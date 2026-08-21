import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { menuService } from '@/api/services'
import { unwrapData } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { usesDynamicSchoolMenus } from '@/utils/authRoles'
import {
  collectMenuPathsFromPayload,
  isPathAllowedByMenus,
} from '@/utils/menuAccess'
import { PageLoader } from '@/components/ui/Feedback'

export default function MenuAccessRoute() {
  const location = useLocation()
  const { user, isSuperAdmin, isOrgAdmin } = useAuth()
  const usesDynamicMenus = usesDynamicSchoolMenus(user)

  const menusQuery = useQuery({
    queryKey: ['menus', 'my-menus', user?.id, user?.school_id || user?.school],
    queryFn: () => menuService.myMenus(),
    enabled: Boolean(user && usesDynamicMenus && !isSuperAdmin && !isOrgAdmin),
    staleTime: 60_000,
  })

  if (isSuperAdmin || isOrgAdmin || !usesDynamicMenus) {
    return <Outlet />
  }

  if (menusQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <PageLoader />
      </div>
    )
  }

  if (menusQuery.isError) {
    return <Outlet />
  }

  const allowedPaths = collectMenuPathsFromPayload(unwrapData(menusQuery.data))
  if (isPathAllowedByMenus(location.pathname, allowedPaths)) {
    return <Outlet />
  }

  return <Navigate to="/dashboard" replace state={{ menuAccessDenied: true, from: location.pathname }} />
}
