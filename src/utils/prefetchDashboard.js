import { dashboardService } from '@/api/services'

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
