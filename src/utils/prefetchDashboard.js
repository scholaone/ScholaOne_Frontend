import { dashboardService, menuService } from '@/api/services'

function usesDynamicSchoolNav(user) {
  return Boolean(
    user?.is_school_admin || (user?.school_id && !user?.is_super_admin && !user?.is_org_admin),
  )
}

/** Warm the dashboard query for the signed-in user so /dashboard renders faster. */
export function prefetchDashboardForUser(queryClient, user) {
  if (!queryClient || !user) return Promise.resolve()

  if (user.is_super_admin) {
    return queryClient.prefetchQuery({
      queryKey: ['dashboard', 'super-admin'],
      queryFn: () => dashboardService.superAdmin({ limit: 10, months: 6 }),
      staleTime: 60_000,
    })
  }

  if (user.is_school_admin) {
    return queryClient.prefetchQuery({
      queryKey: ['dashboard', 'school-admin'],
      queryFn: () => dashboardService.schoolAdmin({ limit: 10 }),
      staleTime: 60_000,
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

/** Prefetch dashboard + sidebar data in parallel before leaving the login screen. */
export async function prefetchPostLoginData(queryClient, user) {
  await Promise.all([
    prefetchDashboardForUser(queryClient, user),
    prefetchMenusForUser(queryClient, user),
  ])
}
