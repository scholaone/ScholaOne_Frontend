/** Resolve human-readable page title from the current route. */
const ROUTE_TITLES = [
  { pattern: /^\/dashboard$/, title: 'Dashboard' },
  { pattern: /^\/profile$/, title: 'Profile' },
  { pattern: /^\/change-password$/, title: 'Change Password' },
  { pattern: /^\/school-profile$/, title: 'School Profile' },
  { pattern: /^\/school-settings/, title: 'School Settings' },
  { pattern: /^\/school-masters/, title: 'School Masters' },
  { pattern: /^\/organizations\/new$/, title: 'New Organization' },
  { pattern: /^\/organizations\/[^/]+\/edit$/, title: 'Edit Organization' },
  { pattern: /^\/organizations\/[^/]+$/, title: 'Organization Details' },
  { pattern: /^\/organizations$/, title: 'Organizations' },
  { pattern: /^\/schools\/new$/, title: 'New School' },
  { pattern: /^\/schools\/[^/]+\/profile$/, title: 'School Profile' },
  { pattern: /^\/schools\/[^/]+\/edit$/, title: 'Edit School' },
  { pattern: /^\/schools\/[^/]+$/, title: 'School Details' },
  { pattern: /^\/schools$/, title: 'Schools' },
  { pattern: /^\/students\/new$/, title: 'New Student' },
  { pattern: /^\/students\/[^/]+\/edit$/, title: 'Edit Student' },
  { pattern: /^\/students\/[^/]+$/, title: 'Student Details' },
  { pattern: /^\/students$/, title: 'Students' },
  { pattern: /^\/teachers\/new$/, title: 'New Teacher' },
  { pattern: /^\/teachers\/[^/]+\/edit$/, title: 'Edit Teacher' },
  { pattern: /^\/teachers\/[^/]+$/, title: 'Teacher Details' },
  { pattern: /^\/teachers\/roster$/, title: 'Teacher Roster' },
  { pattern: /^\/teachers$/, title: 'Academic Staff' },
  { pattern: /^\/parents\/new$/, title: 'New Parent' },
  { pattern: /^\/parents\/[^/]+\/edit$/, title: 'Edit Parent' },
  { pattern: /^\/parents\/[^/]+$/, title: 'Parent Details' },
  { pattern: /^\/parents$/, title: 'Parents' },
  { pattern: /^\/staff\/roster$/, title: 'Employee Roster' },
  { pattern: /^\/staff\/new$/, title: 'New Employee' },
  { pattern: /^\/staff\/[^/]+\/edit$/, title: 'Edit Employee' },
  { pattern: /^\/staff\/[^/]+$/, title: 'Employee Details' },
  { pattern: /^\/staff$/, title: 'HRMS' },
  { pattern: /^\/admissions\/setup$/, title: 'Admission Setup' },
  { pattern: /^\/admissions\/enquiries$/, title: 'Enquiries' },
  { pattern: /^\/admissions\/pipeline$/, title: 'Pipeline' },
  { pattern: /^\/admissions\/follow-ups$/, title: 'Follow-ups' },
  { pattern: /^\/admissions\/applications\/internal$/, title: 'Internal Applications' },
  { pattern: /^\/admissions\/applications\/external$/, title: 'External Applications' },
  { pattern: /^\/admissions\/conversion$/, title: 'Student Conversion' },
  { pattern: /^\/admissions/, title: 'Admissions' },
  { pattern: /^\/lms\/courses/, title: 'LMS Courses' },
  { pattern: /^\/lms\/assignments/, title: 'LMS Assignments' },
  { pattern: /^\/attendance\/mark$/, title: 'Mark Attendance' },
  { pattern: /^\/attendance\/reports$/, title: 'Attendance Reports' },
  { pattern: /^\/attendance/, title: 'Attendance Engine' },
  { pattern: /^\/timetable/, title: 'Timetable' },
  { pattern: /^\/homework/, title: 'Homework' },
  { pattern: /^\/announcements/, title: 'Announcements' },
  { pattern: /^\/examinations/, title: 'Examinations' },
  { pattern: /^\/fees/, title: 'Fees' },
  { pattern: /^\/transport/, title: 'Transport' },
  { pattern: /^\/library/, title: 'Library' },
  { pattern: /^\/documents/, title: 'Documents' },
  { pattern: /^\/reports\/staff-children$/, title: 'Staff Children Report' },
  { pattern: /^\/reports/, title: 'Reports' },
  { pattern: /^\/communications/, title: 'Communications' },
  { pattern: /^\/users\/new$/, title: 'New User' },
  { pattern: /^\/users\/[^/]+\/edit$/, title: 'Edit User' },
  { pattern: /^\/users\/[^/]+$/, title: 'User Details' },
  { pattern: /^\/users$/, title: 'Users' },
  { pattern: /^\/roles\/new$/, title: 'New Role' },
  { pattern: /^\/roles\/[^/]+\/permissions$/, title: 'Role Permissions' },
  { pattern: /^\/roles\/[^/]+\/edit$/, title: 'Edit Role' },
  { pattern: /^\/roles$/, title: 'Roles' },
  { pattern: /^\/permissions\/matrix$/, title: 'Permission Matrix' },
  { pattern: /^\/permissions\/new$/, title: 'New Permission' },
  { pattern: /^\/permissions\/[^/]+\/edit$/, title: 'Edit Permission' },
  { pattern: /^\/permissions$/, title: 'Permissions' },
  { pattern: /^\/menus/, title: 'Menus' },
  { pattern: /^\/modules/, title: 'Modules' },
  { pattern: /^\/memberships/, title: 'Memberships' },
  { pattern: /^\/user-roles/, title: 'User Roles' },
  { pattern: /^\/masters/, title: 'Masters Hub' },
  { pattern: /^\/academics/, title: 'Academic Structure' },
  { pattern: /^\/audit-logs\/[^/]+$/, title: 'Audit Log Details' },
  { pattern: /^\/audit-logs$/, title: 'Audit Logs' },
  { pattern: /^\/notifications$/, title: 'Notifications' },
  { pattern: /^\/settings/, title: 'Settings' },
  { pattern: /^\/school-users/, title: 'School Users' },
  { pattern: /^\/scholaone-post$/, title: 'ScholaOne Post' },
  { pattern: /^\/edu-nexus-post$/, title: 'ScholaOne Post' },
  { pattern: /^\/ai-hub\/assistant$/, title: 'ScholaOne AI Assistant' },
  { pattern: /^\/ai-hub\/automations$/, title: 'Automations' },
  { pattern: /^\/ai-hub$/, title: 'AI Hub' },
]

function formatSegment(segment) {
  if (!segment) return 'Dashboard'
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function resolvePageTitle(pathname = '') {
  const path = (pathname || '/dashboard').replace(/\/$/, '') || '/dashboard'

  for (const { pattern, title } of ROUTE_TITLES) {
    if (pattern.test(path)) return title
  }

  const segment = path.split('/').filter(Boolean)[0]
  return formatSegment(segment)
}
