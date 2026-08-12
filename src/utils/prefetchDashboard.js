import { dashboardService, menuService } from '@/api/services'
import { isStudentPortalUser, isTeacherPortalUser, usesDynamicSchoolMenus } from '@/utils/authRoles'

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

  if (isStudentPortalUser(user)) {
    return queryClient.prefetchQuery({
      queryKey: ['dashboard', 'student', 'summary'],
      queryFn: () => dashboardService.studentSummary(),
      staleTime: 90_000,
    })
  }

  if (isTeacherPortalUser(user)) {
    return queryClient.prefetchQuery({
      queryKey: ['dashboard', 'teacher', 'summary'],
      queryFn: () => dashboardService.teacherSummary(),
      staleTime: 90_000,
    })
  }

  return Promise.resolve()
}

/** Warm sidebar menus for school-scoped users. */
export function prefetchMenusForUser(queryClient, user) {
  if (!queryClient || !user?.id || !usesDynamicSchoolMenus(user)) {
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
