import { dashboardService, menuService } from '@/api/services'

function usesDynamicSchoolNav(user) {
  return Boolean(
    user?.is_school_admin || (user?.school_id && !user?.is_super_admin && !user?.is_org_admin),
  )
}

/** Warm the fast summary query so /dashboard stat cards render quickly. */
export function prefetchDashboardForUser(queryClient, user) {
  if (!queryClient || !user) return Promise.resolve()

  if (user.is_super_admin) {
    return queryClient.prefetchQuery({
      queryKey: ['dashboard', 'super-admin', 'summary'],
      queryFn: () => dashboardService.superAdminSummary(),
      staleTime: 90_000,
    })
  }

  if (user.is_school_admin) {
    return queryClient.prefetchQuery({
      queryKey: ['dashboard', 'school-admin', 'summary'],
      queryFn: () => dashboardService.schoolAdminSummary(),
      staleTime: 90_000,
    })
  }

  return Promise.resolve()
}

/** Warm sidebar menus for school-scoped users. */
export function prefetchMenusForUser(queryClient, user) {
  if (!queryClient || !user?.id || !usesDynamicSchoolNav(user)) {
    return Promise.resolve()
  }

  const schoolKey = user.school_id || user.school
  return queryClient.prefetchQuery({
    queryKey: ['menus', 'my-menus', user.id, schoolKey],
    queryFn: () => menuService.myMenus(),
    staleTime: 30_000,
  })
}

/** Prefetch summary + sidebar in parallel — non-blocking after login. */
export function prefetchPostLoginData(queryClient, user) {
  void prefetchDashboardForUser(queryClient, user)
  void prefetchMenusForUser(queryClient, user)
  return Promise.resolve()
}
