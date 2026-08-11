import { getUserOrganizationId, getUserSchoolId } from '@/utils/schoolScope'

/** User-facing tenant label from login/auth user — no extra API call. */
export function getAuthenticatedTenantLabel(user) {
  if (!user) return ''

  const schoolName = user.school_name || user.school?.school_name
  if (schoolName) return schoolName

  if (user.is_school_admin && getUserSchoolId(user)) {
    return 'My School'
  }

  if (user.organization_name) return user.organization_name

  if (getUserOrganizationId(user) && user.is_org_admin) {
    return user.organization_name || 'Organization'
  }

  return ''
}
