import { FEE_REPORT_LINKS } from './feeDefinitions'

/** Sidebar + hub entries for the main Reports module. */
export const REPORT_MENU_ITEMS = [
  {
    id: 'reports-overview',
    label: 'Overview',
    path: '/reports',
    desc: 'All school reports in one place',
    module: 'Hub',
  },
  {
    id: 'staff-children',
    label: 'Staff Children',
    path: '/reports/staff-children',
    desc: 'Students marked or identified as staff children',
    module: 'Students',
  },
  {
    id: 'class-wise-students',
    label: 'Class-wise Students',
    path: '/students/reports/class-wise',
    desc: 'Enrollment by class and section',
    module: 'Students',
  },
  ...FEE_REPORT_LINKS.map((report) => ({
    id: `fee-${report.key}`,
    label: report.label,
    path: report.path,
    desc: 'Fee module report',
    module: 'Fees',
  })),
  {
    id: 'attendance-reports',
    label: 'Attendance Reports',
    path: '/attendance/reports',
    desc: 'Daily registers and attendance percentages',
    module: 'Attendance',
  },
  {
    id: 'library-issued-returned',
    label: 'Library Issued & Returned',
    path: '/library/reports/issued-returned',
    desc: 'School-wide issue, return, overdue and fine report',
    module: 'Library',
  },
]

/** Report links for the hub page (excludes overview). */
export const MAIN_REPORT_LINKS = REPORT_MENU_ITEMS.filter(
  (item) => item.id !== 'reports-overview',
)
