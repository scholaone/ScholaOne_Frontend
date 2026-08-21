/** Resolve primary key from list row objects across modules. */
const ENTITY_PK_PRIORITY = [
  'student_id',
  'teacher_id',
  'staff_id',
  'parent_id',
  'lead_id',
  'application_id',
  'book_id',
  'route_id',
  'vehicle_id',
  'assignment_id',
  'user_id',
  'school_id',
  'role_id',
  'permission_id',
  'menu_id',
  'module_id',
  'organization_id',
  'audit_log_id',
  'country_id',
  'state_id',
  'city_id',
  'board_id',
  'class_id',
  'section_id',
  'subject_id',
  'department_id',
  'designation_id',
  'category_id',
]

export function resolveRecordId(item) {
  if (!item) return null

  // Prefer canonical UUID primary key when present (before FK fields like school_id).
  if (item.id) return item.id

  for (const key of ENTITY_PK_PRIORITY) {
    if (item[key]) return item[key]
  }

  const dynamicIdKey = Object.keys(item).find((key) => key.endsWith('_id') && item[key])
  return dynamicIdKey ? item[dynamicIdKey] : null
}
