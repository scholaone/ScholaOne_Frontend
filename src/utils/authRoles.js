/**
 * Resolve post-login dashboard path and portal role helpers from auth user payload.
 */

const TEACHER_ROLES = new Set(['teacher', 'class_teacher', 'academic_coordinator', 'vice_principal', 'sports_coach'])

export function getUserPrimaryRole(user) {
  if (!user) return null
  if (user.primary_role) return user.primary_role
  if (user.is_super_admin) return 'super_admin'
  if (user.is_org_admin) return 'org_admin'
  if (user.is_school_admin) return 'school_admin'
  const roles = user.roles || []
  if (roles.some((r) => TEACHER_ROLES.has(r)) || user.teacher_profile_id) return 'teacher'
  if (roles.includes('student') || user.student_profile_id) return 'student'
  return roles[0] || null
}

export function isStudentPortalUser(user) {
  return getUserPrimaryRole(user) === 'student'
}

export function isTeacherPortalUser(user) {
  return getUserPrimaryRole(user) === 'teacher'
}

export function isAdminPortalUser(user) {
  return Boolean(user?.is_super_admin || user?.is_org_admin || user?.is_school_admin)
}

/** Default landing route after login for the current user. */
export function getPostLoginPath(user) {
  if (!user) return '/login'
  if (user.is_super_admin || user.is_org_admin || user.is_school_admin) return '/dashboard'
  const role = getUserPrimaryRole(user)
  if (role === 'student') return '/dashboard/student'
  if (role === 'teacher') return '/dashboard/teacher'
  return '/dashboard'
}

export function usesDynamicSchoolMenus(user) {
  if (!user) return false
  if (user.is_super_admin || user.is_org_admin) return false
  return Boolean(
    user.is_school_admin
    || user.school_id
    || user.school
    || isStudentPortalUser(user)
    || isTeacherPortalUser(user),
  )
}
