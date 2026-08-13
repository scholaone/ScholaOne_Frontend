import { API_ENDPOINTS } from '@/config/endpoints'
import { getStoredUser } from '@/utils/storage'
import {
  apiGet,
  apiPost,
  apiPatch,
  apiPut,
  apiPostForm,
  apiPatchForm,
  apiDelete,
  apiGetPaginated,
  apiGetBlob,
  buildQuery,
} from './client'

export const authService = {
  login: (payload) => apiPost(API_ENDPOINTS.AUTH.LOGIN, payload, { skipAuthRefresh: true }),
  refresh: (refreshToken) =>
    apiPost(API_ENDPOINTS.AUTH.REFRESH, { refresh: refreshToken }, { skipAuthRefresh: true }),
  logout: (refresh, accessToken) =>
    apiPost(
      API_ENDPOINTS.AUTH.LOGOUT,
      { refresh },
      {
        skipAuthRefresh: true,
        timeout: 8000,
        ...(accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {}),
      },
    ),
  profile: () => apiGet(API_ENDPOINTS.AUTH.PROFILE),
  changePassword: (payload) => apiPost(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, payload),
}

export const dashboardService = {
  superAdmin: (params) => apiGet(API_ENDPOINTS.DASHBOARD.SUPER_ADMIN, params),
  superAdminSummary: () => apiGet(API_ENDPOINTS.DASHBOARD.SUPER_ADMIN_SUMMARY),
  schoolAdmin: (params) => apiGet(API_ENDPOINTS.DASHBOARD.SCHOOL_ADMIN, params),
  schoolAdminSummary: (params) => apiGet(API_ENDPOINTS.DASHBOARD.SCHOOL_ADMIN_SUMMARY, params),
  studentSummary: () => apiGet(API_ENDPOINTS.DASHBOARD.STUDENT_SUMMARY),
  studentCalendar: (params) => apiGet(API_ENDPOINTS.DASHBOARD.STUDENT_CALENDAR, params),
  teacherSummary: () => apiGet(API_ENDPOINTS.DASHBOARD.TEACHER_SUMMARY),
  teacherCalendar: (params) => apiGet(API_ENDPOINTS.DASHBOARD.TEACHER_CALENDAR, params),
}

export const organizationService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.ORGANIZATIONS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.ORGANIZATIONS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.ORGANIZATIONS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.ORGANIZATIONS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.ORGANIZATIONS.DETAIL(id)),
  activate: (id) => apiPost(API_ENDPOINTS.ORGANIZATIONS.ACTIVATE(id)),
  deactivate: (id) => apiPost(API_ENDPOINTS.ORGANIZATIONS.DEACTIVATE(id)),
  suspend: (id) => apiPost(API_ENDPOINTS.ORGANIZATIONS.SUSPEND(id)),
  uploadDocuments: (id, formData) => apiPostForm(API_ENDPOINTS.ORGANIZATIONS.UPLOAD_DOCUMENTS(id), formData),
  deleteDocument: (id, documentId) => apiDelete(API_ENDPOINTS.ORGANIZATIONS.DELETE_DOCUMENT(id, documentId)),
  getSettings: (id) => apiGet(API_ENDPOINTS.ORGANIZATIONS.SETTINGS(id)),
  updateSettings: (id, payload) => apiPatch(API_ENDPOINTS.ORGANIZATIONS.SETTINGS(id), payload),
  getBranding: (id) => apiGet(API_ENDPOINTS.ORGANIZATIONS.BRANDING(id)),
  updateBranding: (id, data) => {
    const isForm = typeof FormData !== 'undefined' && data instanceof FormData
    return isForm
      ? apiPatchForm(API_ENDPOINTS.ORGANIZATIONS.BRANDING(id), data)
      : apiPatch(API_ENDPOINTS.ORGANIZATIONS.BRANDING(id), data)
  },
  getSubscription: (id) => apiGet(API_ENDPOINTS.ORGANIZATIONS.SUBSCRIPTION(id)),
  assignSubscription: (id, payload) => apiPost(API_ENDPOINTS.ORGANIZATIONS.ASSIGN_SUBSCRIPTION(id), payload),
  getFeatures: (id) => apiGet(API_ENDPOINTS.ORGANIZATIONS.FEATURES(id)),
  setFeature: (id, payload) => apiPost(API_ENDPOINTS.ORGANIZATIONS.FEATURES(id), payload),
  getDomains: (id) => apiGet(API_ENDPOINTS.ORGANIZATIONS.DOMAINS(id)),
  addDomain: (id, payload) => apiPost(API_ENDPOINTS.ORGANIZATIONS.DOMAINS(id), payload),
  getUsage: (id) => apiGet(API_ENDPOINTS.ORGANIZATIONS.USAGE(id)),
  getBackups: (id) => apiGet(API_ENDPOINTS.ORGANIZATIONS.BACKUPS(id)),
  requestBackup: (id) => apiPost(API_ENDPOINTS.ORGANIZATIONS.BACKUPS(id)),
  getSaasOverview: (id) => apiGet(API_ENDPOINTS.ORGANIZATIONS.SAAS_OVERVIEW(id)),
  clone: (id, payload) => apiPost(API_ENDPOINTS.ORGANIZATIONS.CLONE(id), payload),
  analytics: () => apiGet(API_ENDPOINTS.ORGANIZATIONS.ANALYTICS),
}

export const subscriptionPlanService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.SUBSCRIPTION_PLANS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.SUBSCRIPTION_PLANS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.SUBSCRIPTION_PLANS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.SUBSCRIPTION_PLANS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.SUBSCRIPTION_PLANS.DETAIL(id)),
}

function schoolWrite(url, data, method = 'post') {
  const isForm = typeof FormData !== 'undefined' && data instanceof FormData
  if (method === 'patch') {
    return isForm ? apiPatchForm(url, data) : apiPatch(url, data)
  }
  return isForm ? apiPostForm(url, data) : apiPost(url, data)
}

export const schoolService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.SCHOOLS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.SCHOOLS.DETAIL(id)),
  create: (data) => schoolWrite(API_ENDPOINTS.SCHOOLS.LIST, data, 'post'),
  update: (id, data) => schoolWrite(API_ENDPOINTS.SCHOOLS.DETAIL(id), data, 'patch'),
  delete: (id) => apiDelete(API_ENDPOINTS.SCHOOLS.DETAIL(id)),
  getProfile: (id) => apiGet(id ? API_ENDPOINTS.SCHOOLS.PROFILE(id) : API_ENDPOINTS.SCHOOL_PROFILE),
  updateProfile: (id, data) => {
    const isForm = typeof FormData !== 'undefined' && data instanceof FormData
    const url = id ? API_ENDPOINTS.SCHOOLS.PROFILE(id) : API_ENDPOINTS.SCHOOL_PROFILE
    return isForm ? apiPatchForm(url, data) : apiPatch(url, data)
  },
  regenerateQr: (id) => apiPost(API_ENDPOINTS.SCHOOLS.PROFILE_REGENERATE_QR(id)),
  uploadDocuments: (id, formData) => apiPostForm(API_ENDPOINTS.SCHOOLS.UPLOAD_DOCUMENTS(id), formData),
  deleteDocument: (id, documentId) => apiDelete(API_ENDPOINTS.SCHOOLS.DELETE_DOCUMENT(id, documentId)),
  activate: (id) => apiPost(API_ENDPOINTS.SCHOOLS.ACTIVATE(id)),
  deactivate: (id) => apiPost(API_ENDPOINTS.SCHOOLS.DEACTIVATE(id)),
  suspend: (id) => apiPost(API_ENDPOINTS.SCHOOLS.SUSPEND(id)),
  getBranding: (id) => apiGet(API_ENDPOINTS.SCHOOLS.BRANDING(id)),
  updateBranding: (id, data) => {
    const isForm = typeof FormData !== 'undefined' && data instanceof FormData
    return isForm
      ? apiPatchForm(API_ENDPOINTS.SCHOOLS.BRANDING(id), data)
      : apiPatch(API_ENDPOINTS.SCHOOLS.BRANDING(id), data)
  },
  getFeatures: (id) => apiGet(API_ENDPOINTS.SCHOOLS.FEATURES(id)),
  setFeature: (id, payload) => apiPost(API_ENDPOINTS.SCHOOLS.FEATURES(id), payload),
  getAcademicConfig: (id) => apiGet(API_ENDPOINTS.SCHOOLS.ACADEMIC_CONFIG(id)),
  updateAcademicConfig: (id, payload) => apiPatch(API_ENDPOINTS.SCHOOLS.ACADEMIC_CONFIG(id), payload),
  getAnalytics: (id) => apiGet(API_ENDPOINTS.SCHOOLS.ANALYTICS(id)),
  getSaasOverview: (id) => apiGet(API_ENDPOINTS.SCHOOLS.SAAS_OVERVIEW(id)),
  clone: (id, payload) => apiPost(API_ENDPOINTS.SCHOOLS.CLONE(id), payload),
  export: (params) => apiGetBlob(API_ENDPOINTS.SCHOOLS.EXPORT, params),
  import: (payload) => apiPost(API_ENDPOINTS.SCHOOLS.IMPORT, payload),
  listInfrastructure: (id, params) => apiGet(API_ENDPOINTS.SCHOOLS.INFRASTRUCTURE(id), params),
  createInfrastructure: (id, payload) => apiPost(API_ENDPOINTS.SCHOOLS.INFRASTRUCTURE(id), payload),
  updateInfrastructure: (id, infraId, payload) => apiPatch(API_ENDPOINTS.SCHOOLS.INFRASTRUCTURE_DETAIL(id, infraId), payload),
  deleteInfrastructure: (id, infraId) => apiDelete(API_ENDPOINTS.SCHOOLS.INFRASTRUCTURE_DETAIL(id, infraId)),
  getCalendar: (id, params) => apiGet(API_ENDPOINTS.SCHOOLS.CALENDAR(id), params),
  saveCalendarDay: (id, payload) => apiPost(API_ENDPOINTS.SCHOOLS.CALENDAR(id), payload),
  getTimings: (id) => apiGet(API_ENDPOINTS.SCHOOLS.TIMINGS(id)),
  updateTimings: (id, payload) => apiPut(API_ENDPOINTS.SCHOOLS.TIMINGS(id), payload),
  getIntegrations: (id) => apiGet(API_ENDPOINTS.SCHOOLS.INTEGRATIONS(id)),
  saveIntegration: (id, payload) => apiPost(API_ENDPOINTS.SCHOOLS.INTEGRATIONS(id), payload),
  getStaffAssignments: (id) => apiGet(API_ENDPOINTS.SCHOOLS.STAFF_ASSIGNMENTS(id)),
  saveStaffAssignment: (id, payload) => apiPost(API_ENDPOINTS.SCHOOLS.STAFF_ASSIGNMENTS(id), payload),
}

export const userService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.USERS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.USERS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.USERS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.USERS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.USERS.DETAIL(id)),
  activate: (id) => apiPost(API_ENDPOINTS.USERS.ACTIVATE(id)),
  deactivate: (id) => apiPost(API_ENDPOINTS.USERS.DEACTIVATE(id)),
  resetPassword: (id, newPassword) =>
    apiPost(API_ENDPOINTS.USERS.RESET_PASSWORD(id), { new_password: newPassword }),
  bulkAction: (userIds, action) =>
    apiPost(API_ENDPOINTS.USERS.BULK_ACTION, { user_ids: userIds, action }),
  export: (params) => apiGetBlob(API_ENDPOINTS.USERS.EXPORT, params),
}

function schoolUserWrite(url, data, method = 'post') {
  const isForm = typeof FormData !== 'undefined' && data instanceof FormData
  if (method === 'post') {
    return isForm ? apiPostForm(url, data) : apiPost(url, data)
  }
  return isForm ? apiPatchForm(url, data) : apiPatch(url, data)
}

export const schoolUserService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.SCHOOL_USERS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.SCHOOL_USERS.DETAIL(id)),
  create: (data) => schoolUserWrite(API_ENDPOINTS.SCHOOL_USERS.LIST, data, 'post'),
  update: (id, data) => schoolUserWrite(API_ENDPOINTS.SCHOOL_USERS.DETAIL(id), data, 'patch'),
  delete: (id) => apiDelete(API_ENDPOINTS.SCHOOL_USERS.DETAIL(id)),
  activate: (id) => apiPost(API_ENDPOINTS.SCHOOL_USERS.ACTIVATE(id)),
  deactivate: (id) => apiPost(API_ENDPOINTS.SCHOOL_USERS.DEACTIVATE(id)),
  resetPassword: (id, payload = {}) =>
    apiPost(API_ENDPOINTS.SCHOOL_USERS.RESET_PASSWORD(id), payload),
  sendCredentials: (id, payload = {}) =>
    apiPost(API_ENDPOINTS.SCHOOL_USERS.SEND_CREDENTIALS(id), payload),
  loginHistory: (id) => apiGet(API_ENDPOINTS.SCHOOL_USERS.LOGIN_HISTORY(id)),
  devices: (id) => apiGet(API_ENDPOINTS.SCHOOL_USERS.DEVICES(id)),
  staffRoles: () => apiGet(API_ENDPOINTS.SCHOOL_USERS.STAFF_ROLES),
}

export const admissionService = {
  setup: {
    list: (params, config) => apiGet(API_ENDPOINTS.ADMISSIONS.SETUP, params, config),
    get: (id, config) => apiGet(API_ENDPOINTS.ADMISSIONS.SETUP_DETAIL(id), undefined, config),
    create: (data, config) => apiPost(API_ENDPOINTS.ADMISSIONS.SETUP, data, config),
    update: (id, data, config) => apiPatch(API_ENDPOINTS.ADMISSIONS.SETUP_DETAIL(id), data, config),
    delete: (id, config) => apiDelete(API_ENDPOINTS.ADMISSIONS.SETUP_DETAIL(id), config),
    getEmailSettings: (params, config) =>
      apiGet(API_ENDPOINTS.ADMISSIONS.SETUP_EMAIL, params, config),
    updateEmailSettings: (data, config) =>
      apiPatch(API_ENDPOINTS.ADMISSIONS.SETUP_EMAIL, data, config),
  },
  leads: {
    list: (params) => apiGetPaginated(API_ENDPOINTS.ADMISSIONS.LEADS, params),
    get: (id) => apiGet(API_ENDPOINTS.ADMISSIONS.LEAD_DETAIL(id)),
    create: (data) => apiPost(API_ENDPOINTS.ADMISSIONS.LEADS, data),
    update: (id, data) => apiPatch(API_ENDPOINTS.ADMISSIONS.LEAD_DETAIL(id), data),
    delete: (id) => apiDelete(API_ENDPOINTS.ADMISSIONS.LEAD_DETAIL(id)),
    convert: (id) => apiPost(API_ENDPOINTS.ADMISSIONS.LEAD_CONVERT(id)),
    followUps: (id) => apiGet(API_ENDPOINTS.ADMISSIONS.LEAD_FOLLOW_UPS(id)),
    addFollowUp: (id, data) => apiPost(API_ENDPOINTS.ADMISSIONS.LEAD_FOLLOW_UPS(id), data),
  },
  applications: {
    list: (params) => apiGetPaginated(API_ENDPOINTS.ADMISSIONS.APPLICATIONS, params),
    get: (id) => apiGet(API_ENDPOINTS.ADMISSIONS.APPLICATION_DETAIL(id)),
    create: (data) => apiPost(API_ENDPOINTS.ADMISSIONS.APPLICATIONS, data),
    update: (id, data) => apiPatch(API_ENDPOINTS.ADMISSIONS.APPLICATION_DETAIL(id), data),
    delete: (id) => apiDelete(API_ENDPOINTS.ADMISSIONS.APPLICATION_DETAIL(id)),
    pipelineStats: () => apiGet(API_ENDPOINTS.ADMISSIONS.PIPELINE_STATS),
    submitApplication: (id) => apiPost(API_ENDPOINTS.ADMISSIONS.SUBMIT_APPLICATION(id)),
    uploadDocument: (id, formData) => apiPostForm(API_ENDPOINTS.ADMISSIONS.UPLOAD_DOCUMENT(id), formData),
    verifyDocuments: (id, payload = {}) => apiPost(API_ENDPOINTS.ADMISSIONS.VERIFY_DOCUMENTS(id), payload),
    entranceTest: (id, data) => apiPost(API_ENDPOINTS.ADMISSIONS.ENTRANCE_TEST(id), data),
    interview: (id, data) => apiPost(API_ENDPOINTS.ADMISSIONS.INTERVIEW(id), data),
    submitApproval: (id) => apiPost(API_ENDPOINTS.ADMISSIONS.SUBMIT_APPROVAL(id)),
    approve: (id, data) => apiPost(API_ENDPOINTS.ADMISSIONS.APPROVE(id), data),
    reject: (id, data) => apiPost(API_ENDPOINTS.ADMISSIONS.REJECT(id), data),
    collectFee: (id, data) => apiPost(API_ENDPOINTS.ADMISSIONS.COLLECT_FEE(id), data),
    confirm: (id) => apiPost(API_ENDPOINTS.ADMISSIONS.CONFIRM(id)),
    enroll: (id, data = {}) => apiPost(API_ENDPOINTS.ADMISSIONS.ENROLL(id), data),
    prepareConversion: (id) => apiPost(API_ENDPOINTS.ADMISSIONS.PREPARE_CONVERSION(id)),
    workflow: (id) => apiGet(API_ENDPOINTS.ADMISSIONS.WORKFLOW(id)),
    lockSeat: (id, data, action = 'lock') =>
      apiPost(`${API_ENDPOINTS.ADMISSIONS.SEATS(id)}?action=${action}`, data),
    receipt: (id) => apiGet(API_ENDPOINTS.ADMISSIONS.RECEIPT(id)),
    followUps: (id) => apiGet(API_ENDPOINTS.ADMISSIONS.FOLLOW_UPS(id)),
    addFollowUp: (id, data) => apiPost(API_ENDPOINTS.ADMISSIONS.FOLLOW_UPS(id), data),
  },
  analyticsFunnel: (params) => apiGet(API_ENDPOINTS.ADMISSIONS.ANALYTICS_FUNNEL, params),
  bulkAction: (payload) => apiPost(API_ENDPOINTS.ADMISSIONS.BULK_ACTION, payload),
  portalStatus: (token) => apiGet(API_ENDPOINTS.ADMISSIONS.PORTAL(token)),
}

export const studentService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.STUDENTS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.STUDENTS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.STUDENTS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.STUDENTS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.STUDENTS.DETAIL(id)),
  bulkImport: (items, config) => apiPost(API_ENDPOINTS.STUDENTS.BULK_IMPORT, { items }, config),
  bulkPromote: (data) => apiPost(API_ENDPOINTS.STUDENTS.BULK_PROMOTE, data),
  bulkShuffle: (data, config) => apiPost(API_ENDPOINTS.STUDENTS.BULK_SHUFFLE, data, config),
  export: (params) => apiGetBlob(API_ENDPOINTS.STUDENTS.EXPORT, params),
  dashboard: (params) => apiGet(API_ENDPOINTS.STUDENTS.DASHBOARD, params),
  search: (params) => apiGet(API_ENDPOINTS.STUDENTS.SEARCH, params),
  nextAdmissionNumber: (params, config) =>
    apiGet(API_ENDPOINTS.STUDENTS.NEXT_ADMISSION_NUMBER, params, config),
  getSisSettings: (params) => apiGet(API_ENDPOINTS.STUDENTS.SIS_SETTINGS, params),
  updateSisSettings: (data, params) => apiPatch(API_ENDPOINTS.STUDENTS.SIS_SETTINGS, data, { params }),
  regenerateQr: (id) => apiPost(API_ENDPOINTS.STUDENTS.REGENERATE_QR(id)),
  idCard: (id) => apiGet(API_ENDPOINTS.STUDENTS.ID_CARD(id)),
  updateStatus: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.UPDATE_STATUS(id), data),
  updateTransport: (id, data) => apiPatch(API_ENDPOINTS.STUDENTS.TRANSPORT(id), data),
  updateHostel: (id, data) => apiPatch(API_ENDPOINTS.STUDENTS.HOSTEL(id), data),
  updateMedical: (id, data) => apiPatch(API_ENDPOINTS.STUDENTS.MEDICAL(id), data),
  uploadDocument: (id, formData) => apiPostForm(API_ENDPOINTS.STUDENTS.UPLOAD_DOCUMENT(id), formData),
  uploadPhoto: (id, formData) => apiPostForm(API_ENDPOINTS.STUDENTS.UPLOAD_PHOTO(id), formData),
  verifyDocument: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.VERIFY_DOCUMENT(id), data),
  addAchievement: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.ACHIEVEMENTS(id), data),
  addDiscipline: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.DISCIPLINE(id), data),
  addSibling: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.SIBLINGS(id), data),
  promote: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.PROMOTE(id), data),
  transfer: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.TRANSFER(id), data),
  graduate: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.GRADUATE(id), data),
  alumni: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.ALUMNI(id), data),
  generateRfid: (id) => apiPost(API_ENDPOINTS.STUDENTS.GENERATE_RFID(id)),
}

export const teacherService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.TEACHERS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.TEACHERS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.TEACHERS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.TEACHERS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.TEACHERS.DETAIL(id)),
  export: (params) => apiGetBlob(API_ENDPOINTS.TEACHERS.EXPORT, params),
  dashboard: (params) => apiGet(API_ENDPOINTS.TEACHERS.DASHBOARD, params),
  search: (params) => apiGet(API_ENDPOINTS.TEACHERS.SEARCH, params),
  getTeacherSettings: (params) => apiGet(API_ENDPOINTS.TEACHERS.TEACHER_SETTINGS, params),
  updateTeacherSettings: (data, params) => apiPatch(API_ENDPOINTS.TEACHERS.TEACHER_SETTINGS, data, { params }),
  sendCredentials: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.SEND_CREDENTIALS(id), data),
  addQualification: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.QUALIFICATIONS(id), data),
  addExperience: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.EXPERIENCE(id), data),
  assignSubject: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.ASSIGN_SUBJECT(id), data),
  academicAssign: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.ACADEMIC_ASSIGNMENTS(id), data),
  workload: (id, params) => apiGet(API_ENDPOINTS.TEACHERS.WORKLOAD(id), params),
  recalculateWorkload: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.WORKLOAD(id), data),
  setAvailability: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.AVAILABILITY(id), data),
  addProfessionalCert: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.PROFESSIONAL_CERTS(id), data),
  getPerformanceFoundation: (id, params) => apiGet(API_ENDPOINTS.TEACHERS.PERFORMANCE_FOUNDATION(id), params),
  updatePerformanceFoundation: (id, data) => apiPatch(API_ENDPOINTS.TEACHERS.PERFORMANCE_FOUNDATION(id), data),
  deactivate: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.DEACTIVATE(id), data),
  assignClassTeacher: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.CLASS_TEACHER(id), data),
  recordAttendance: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.ATTENDANCE(id), data),
  requestLeave: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.LEAVE(id), data),
  approveLeave: (id, leaveId) => apiPost(API_ENDPOINTS.TEACHERS.APPROVE_LEAVE(id, leaveId)),
  updatePayroll: (id, data) => apiPatch(API_ENDPOINTS.TEACHERS.PAYROLL(id), data),
  uploadDocument: (id, formData) => apiPostForm(API_ENDPOINTS.TEACHERS.UPLOAD_DOCUMENT(id), formData),
  addCertificate: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.CERTIFICATES(id), data),
  addTimetable: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.TIMETABLE(id), data),
  addLessonPlan: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.LESSON_PLANS(id), data),
  addHomework: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.HOMEWORK(id), data),
  addOnlineClass: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.ONLINE_CLASSES(id), data),
  addPerformanceReview: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.PERFORMANCE_REVIEWS(id), data),
}

export const staffService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.STAFF.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.STAFF.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.STAFF.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.STAFF.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.STAFF.DETAIL(id)),
  export: (params) => apiGetBlob(API_ENDPOINTS.STAFF.EXPORT, params),
  dashboard: (params) => apiGet(API_ENDPOINTS.STAFF.DASHBOARD, params),
  search: (params) => apiGet(API_ENDPOINTS.STAFF.SEARCH, params),
  orgChart: (params) => apiGet(API_ENDPOINTS.STAFF.ORG_CHART, params),
  getHrSettings: (params) => apiGet(API_ENDPOINTS.STAFF.HR_SETTINGS, params),
  updateHrSettings: (data, params) => apiPatch(API_ENDPOINTS.STAFF.HR_SETTINGS, data, { params }),
  sendCredentials: (id, data) => apiPost(API_ENDPOINTS.STAFF.SEND_CREDENTIALS(id), data),
  resetPassword: (id, data) => apiPost(API_ENDPOINTS.STAFF.RESET_PASSWORD(id), data),
  updateEmergencyContact: (id, data) => apiPatch(API_ENDPOINTS.STAFF.EMERGENCY_CONTACT(id), data),
  addExperience: (id, data) => apiPost(API_ENDPOINTS.STAFF.EXPERIENCE(id), data),
  addSkill: (id, data) => apiPost(API_ENDPOINTS.STAFF.SKILLS(id), data),
  addShift: (id, data) => apiPost(API_ENDPOINTS.STAFF.SHIFT(id), data),
  recordAttendance: (id, data) => apiPost(API_ENDPOINTS.STAFF.ATTENDANCE(id), data),
  requestLeave: (id, data) => apiPost(API_ENDPOINTS.STAFF.LEAVE(id), data),
  approveLeave: (id, leaveId) => apiPost(API_ENDPOINTS.STAFF.APPROVE_LEAVE(id, leaveId)),
  updatePayroll: (id, data) => apiPatch(API_ENDPOINTS.STAFF.PAYROLL(id), data),
  uploadDocument: (id, formData) => apiPostForm(API_ENDPOINTS.STAFF.UPLOAD_DOCUMENT(id), formData),
  auditLogs: (id, params) => apiGet(API_ENDPOINTS.STAFF.AUDIT_LOGS(id), params),
  startOnboarding: (id) => apiPost(API_ENDPOINTS.STAFF.ONBOARDING_START(id)),
  completeOnboardingStep: (id, data) => apiPost(API_ENDPOINTS.STAFF.ONBOARDING_STEP(id), data),
  transfer: (id, data) => apiPost(API_ENDPOINTS.STAFF.TRANSFER(id), data),
  promote: (id, data) => apiPost(API_ENDPOINTS.STAFF.PROMOTE(id), data),
  exit: (id, data) => apiPost(API_ENDPOINTS.STAFF.EXIT(id), data),
  assignAsset: (id, data) => apiPost(API_ENDPOINTS.STAFF.ASSETS(id), data),
  confirm: (id, data) => apiPost(API_ENDPOINTS.STAFF.CONFIRM(id), data),
  transitionStatus: (id, data) => apiPost(API_ENDPOINTS.STAFF.TRANSITION_STATUS(id), data),
}

// HRMS alias — same Employee SoT as staffService
export const employeeService = staffService

export const attendanceService = {
  list: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.ATTENDANCE.DETAIL(id)),
  dashboard: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.DASHBOARD, params),
  search: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.SEARCH, params),
  getSettings: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.SETTINGS, params),
  updateSettings: (data, params) => apiPatch(API_ENDPOINTS.ATTENDANCE.SETTINGS, data, { params }),
  calendarDay: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.CALENDAR_DAY, params),
  mark: (data) => apiPost(API_ENDPOINTS.ATTENDANCE.MARK, data),
  bulkMark: (data) => apiPost(API_ENDPOINTS.ATTENDANCE.BULK_MARK, data),
  correct: (id, data) => apiPost(API_ENDPOINTS.ATTENDANCE.CORRECT(id), data),
  approve: (id) => apiPost(API_ENDPOINTS.ATTENDANCE.APPROVE(id)),
  employeePunch: (data) => apiPost(API_ENDPOINTS.ATTENDANCE.EMPLOYEE_PUNCH, data),
  reportDaily: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.REPORT_DAILY, params),
  reportPercentage: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.REPORT_PERCENTAGE, params),
  defaulters: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.DEFAULTERS, params),
  policies: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.POLICIES, params),
  savePolicy: (data) => apiPost(API_ENDPOINTS.ATTENDANCE.POLICIES, data),
  importCsv: (formData) => apiPostForm(API_ENDPOINTS.ATTENDANCE.IMPORT, formData),
  export: (params) => apiGetBlob(API_ENDPOINTS.ATTENDANCE.EXPORT, params),
  biometricDevices: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.BIOMETRIC_DEVICES, params),
  registerDevice: (data) => apiPost(API_ENDPOINTS.ATTENDANCE.BIOMETRIC_DEVICES, data),
  biometricIngest: (data) => apiPost(API_ENDPOINTS.ATTENDANCE.BIOMETRIC_INGEST, data),
  leaveLink: (data) => apiPost(API_ENDPOINTS.ATTENDANCE.LEAVE_LINK, data),
  sessions: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.SESSIONS, params),
}

export const timetableService = {
  list: (params) => apiGet(API_ENDPOINTS.TIMETABLE.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.TIMETABLE.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.TIMETABLE.LIST, data),
  dashboard: (params) => apiGet(API_ENDPOINTS.TIMETABLE.DASHBOARD, params),
  search: (params) => apiGet(API_ENDPOINTS.TIMETABLE.SEARCH, params),
  getSettings: (params) => apiGet(API_ENDPOINTS.TIMETABLE.SETTINGS, params),
  updateSettings: (data, params) => apiPatch(API_ENDPOINTS.TIMETABLE.SETTINGS, data, { params }),
  versions: (id, params) => apiGet(API_ENDPOINTS.TIMETABLE.VERSIONS(id), params),
  publish: (versionId, data = {}) => apiPost(API_ENDPOINTS.TIMETABLE.PUBLISH(versionId), data),
  clone: (versionId, data = {}) => apiPost(API_ENDPOINTS.TIMETABLE.CLONE(versionId), data),
  rollback: (versionId, data = {}) => apiPost(API_ENDPOINTS.TIMETABLE.ROLLBACK(versionId), data),
  slots: (versionId, params) => apiGet(API_ENDPOINTS.TIMETABLE.SLOTS(versionId), params),
  createSlot: (versionId, data) => apiPost(API_ENDPOINTS.TIMETABLE.SLOTS(versionId), data),
  bulkSlots: (versionId, data) => apiPost(API_ENDPOINTS.TIMETABLE.SLOTS_BULK(versionId), data),
  teacherSchedule: (params) => apiGet(API_ENDPOINTS.TIMETABLE.TEACHER_SCHEDULE, params),
  studentSchedule: (params) => apiGet(API_ENDPOINTS.TIMETABLE.STUDENT_SCHEDULE, params),
  roomSchedule: (params) => apiGet(API_ENDPOINTS.TIMETABLE.ROOM_SCHEDULE, params),
  conflicts: (versionId, params) => apiGet(API_ENDPOINTS.TIMETABLE.CONFLICTS(versionId), params),
  detectConflicts: (versionId, data = {}) => apiPost(API_ENDPOINTS.TIMETABLE.CONFLICTS(versionId), data),
  resolveConflict: (id, data) => apiPost(API_ENDPOINTS.TIMETABLE.RESOLVE_CONFLICT(id), data),
  substitutions: (params) => apiGet(API_ENDPOINTS.TIMETABLE.SUBSTITUTIONS, params),
  createSubstitution: (data) => apiPost(API_ENDPOINTS.TIMETABLE.SUBSTITUTIONS, data),
  approveSubstitution: (id, data = {}) => apiPost(API_ENDPOINTS.TIMETABLE.APPROVE_SUBSTITUTION(id), data),
  suggestSubstitutes: (params) => apiGet(API_ENDPOINTS.TIMETABLE.SUGGEST_SUBSTITUTES, params),
  resources: (params) => apiGet(API_ENDPOINTS.TIMETABLE.RESOURCES, params),
  createResource: (data) => apiPost(API_ENDPOINTS.TIMETABLE.RESOURCES, data),
  bookResource: (data) => apiPost(API_ENDPOINTS.TIMETABLE.RESOURCE_BOOKINGS, data),
  facilityRooms: (params) => apiGet(API_ENDPOINTS.TIMETABLE.FACILITY_ROOMS, params),
  createFacilityRoom: (data) => apiPost(API_ENDPOINTS.TIMETABLE.FACILITY_ROOMS, data),
  events: (params) => apiGet(API_ENDPOINTS.TIMETABLE.EVENTS, params),
  createEvent: (data) => apiPost(API_ENDPOINTS.TIMETABLE.EVENTS, data),
  meetings: (params) => apiGet(API_ENDPOINTS.TIMETABLE.MEETINGS, params),
  createMeeting: (data) => apiPost(API_ENDPOINTS.TIMETABLE.MEETINGS, data),
  roomUtilization: (versionId, params) => apiGet(API_ENDPOINTS.TIMETABLE.ROOM_UTILIZATION(versionId), params),
  export: (versionId, params) => apiGetBlob(API_ENDPOINTS.TIMETABLE.EXPORT(versionId), params),
  importCsv: (versionId, formData) => apiPostForm(API_ENDPOINTS.TIMETABLE.IMPORT(versionId), formData),
  enqueueAiJob: (versionId, data) => apiPost(API_ENDPOINTS.TIMETABLE.AI_JOBS(versionId), data),
  templates: (params) => apiGet(API_ENDPOINTS.TIMETABLE.TEMPLATES, params),
  createTemplate: (data) => apiPost(API_ENDPOINTS.TIMETABLE.TEMPLATES, data),
}

export const feesService = {
  dashboard: (params, config) => apiGet(API_ENDPOINTS.FEES.DASHBOARD, params, config),
  search: (params, config) => apiGet(API_ENDPOINTS.FEES.SEARCH, params, config),
  getSettings: (params, config) => apiGet(API_ENDPOINTS.FEES.SETTINGS, params, config),
  updateSettings: (data, params, config) => apiPatch(API_ENDPOINTS.FEES.SETTINGS, data, { params, ...config }),
  categories: (params, config) => apiGetPaginated(API_ENDPOINTS.FEES.CATEGORIES, params, config),
  getCategory: (id, config) => apiGet(API_ENDPOINTS.FEES.CATEGORY_DETAIL(id), config),
  createCategory: (data, config) => apiPost(API_ENDPOINTS.FEES.CATEGORIES, data, config),
  updateCategory: (id, data, config) => apiPatch(API_ENDPOINTS.FEES.CATEGORY_DETAIL(id), data, config),
  deleteCategory: (id, config) => apiDelete(API_ENDPOINTS.FEES.CATEGORY_DETAIL(id), config),
  categoriesBulkUpload: (items, config) => apiPost(API_ENDPOINTS.FEES.CATEGORIES_BULK_UPLOAD, { items }, config),
  formats: (params, config) => apiGetPaginated(API_ENDPOINTS.FEES.FORMATS, params, config),
  getFormat: (id, config) => apiGet(API_ENDPOINTS.FEES.FORMAT_DETAIL(id), config),
  createFormat: (data, config) => apiPost(API_ENDPOINTS.FEES.FORMATS, data, config),
  updateFormat: (id, data, config) => apiPatch(API_ENDPOINTS.FEES.FORMAT_DETAIL(id), data, config),
  deleteFormat: (id, config) => apiDelete(API_ENDPOINTS.FEES.FORMAT_DETAIL(id), config),
  formatsBulkUpload: (items, config) => apiPost(API_ENDPOINTS.FEES.FORMATS_BULK_UPLOAD, { items }, config),
  components: (params, config) => apiGetPaginated(API_ENDPOINTS.FEES.COMPONENTS, params, config),
  getComponent: (id, config) => apiGet(API_ENDPOINTS.FEES.COMPONENT_DETAIL(id), config),
  createComponent: (data, config) => apiPost(API_ENDPOINTS.FEES.COMPONENTS, data, config),
  updateComponent: (id, data, config) => apiPatch(API_ENDPOINTS.FEES.COMPONENT_DETAIL(id), data, config),
  deleteComponent: (id, config) => apiDelete(API_ENDPOINTS.FEES.COMPONENT_DETAIL(id), config),
  componentsBulkUpload: (items, config) => apiPost(API_ENDPOINTS.FEES.COMPONENTS_BULK_UPLOAD, { items }, config),
  heads: (params, config) => apiGetPaginated(API_ENDPOINTS.FEES.HEADS, params, config),
  getHead: (id, config) => apiGet(API_ENDPOINTS.FEES.HEAD_DETAIL(id), config),
  createHead: (data, config) => apiPost(API_ENDPOINTS.FEES.HEADS, data, config),
  updateHead: (id, data, config) => apiPatch(API_ENDPOINTS.FEES.HEAD_DETAIL(id), data, config),
  deleteHead: (id, config) => apiDelete(API_ENDPOINTS.FEES.HEAD_DETAIL(id), config),
  headsBulkUpload: (items, config) => {
    const { params: configParams, ...restConfig } = config ?? {}
    const schoolId = configParams?.school || restConfig?.params?.school
    return apiPost(
      API_ENDPOINTS.FEES.HEADS_BULK_UPLOAD,
      { items, ...(schoolId ? { school_id: schoolId } : {}) },
      config,
    )
  },
  ledgerCodes: (params, config) => apiGetPaginated(API_ENDPOINTS.FEES.LEDGER_CODES, params, config),
  getLedgerCode: (id, config) => apiGet(API_ENDPOINTS.FEES.LEDGER_CODE_DETAIL(id), config),
  createLedgerCode: (data, config) => apiPost(API_ENDPOINTS.FEES.LEDGER_CODES, data, config),
  updateLedgerCode: (id, data, config) => apiPatch(API_ENDPOINTS.FEES.LEDGER_CODE_DETAIL(id), data, config),
  deleteLedgerCode: (id, config) => apiDelete(API_ENDPOINTS.FEES.LEDGER_CODE_DETAIL(id), config),
  ledgerCodesBulkUpload: (items, config) => apiPost(API_ENDPOINTS.FEES.LEDGER_CODES_BULK_UPLOAD, { items }, config),
  templates: (params, config) => apiGetPaginated(API_ENDPOINTS.FEES.TEMPLATES, params, config),
  createTemplate: (data, config) => apiPost(API_ENDPOINTS.FEES.TEMPLATES, data, config),
  assignments: (params, config) => apiGet(API_ENDPOINTS.FEES.ASSIGNMENTS, params, config),
  assign: (data, config) => apiPost(API_ENDPOINTS.FEES.ASSIGNMENTS, data, config),
  studentProfile: (params, config) => apiGet(API_ENDPOINTS.FEES.STUDENT_PROFILE, params, config),
  studentLedger: (params, config) => apiGet(API_ENDPOINTS.FEES.STUDENT_LEDGER, params, config),
  invoices: (params, config) => apiGet(API_ENDPOINTS.FEES.INVOICES, params, config),
  invoiceDetail: (id, params, config) => apiGet(API_ENDPOINTS.FEES.INVOICE_DETAIL(id), params, config),
  generateInvoice: (data, config) => apiPost(API_ENDPOINTS.FEES.GENERATE_INVOICE, data, config),
  payments: (params, config) => apiGet(API_ENDPOINTS.FEES.PAYMENTS, params, config),
  recordPayment: (data, config) => apiPost(API_ENDPOINTS.FEES.RECORD_PAYMENT, data, config),
  studentFeeItems: (params, config) => apiGet(API_ENDPOINTS.FEES.STUDENT_FEE_ITEMS, params, config),
  classCollectRoster: (params, config) => apiGet(API_ENDPOINTS.FEES.CLASS_COLLECT_ROSTER, params, config),
  collectItems: (data, config) => apiPost(API_ENDPOINTS.FEES.COLLECT_ITEMS, data, config),
  receipts: (params, config) => apiGet(API_ENDPOINTS.FEES.RECEIPTS, params, config),
  receiptDetail: (id, params, config) => apiGet(API_ENDPOINTS.FEES.RECEIPT_DETAIL(id), params, config),
  receiptPdf: (id, params, config) => apiGetBlob(API_ENDPOINTS.FEES.RECEIPT_PDF(id), params, config),
  structureInvoices: (params, config) => apiGet(API_ENDPOINTS.FEES.STRUCTURE_INVOICES, params, config),
  generateStructureInvoice: (data, config) => apiPost(API_ENDPOINTS.FEES.GENERATE_STRUCTURE_INVOICE, data, config),
  structureInvoiceDetail: (id, params, config) => apiGet(API_ENDPOINTS.FEES.STRUCTURE_INVOICE_DETAIL(id), params, config),
  structureInvoicePdf: (id, params, config) => apiGetBlob(API_ENDPOINTS.FEES.STRUCTURE_INVOICE_PDF(id), params, config),
  gatewayIntent: (data) => apiPost(API_ENDPOINTS.FEES.GATEWAY_INTENT, data),
  concessionRules: (params, config) => apiGetPaginated(API_ENDPOINTS.FEES.CONCESSION_RULES, params, config),
  getConcessionRule: (id, config) => apiGet(API_ENDPOINTS.FEES.CONCESSION_RULE_DETAIL(id), config),
  createConcessionRule: (data, config) => apiPost(API_ENDPOINTS.FEES.CONCESSION_RULES, data, config),
  updateConcessionRule: (id, data, config) => apiPatch(API_ENDPOINTS.FEES.CONCESSION_RULE_DETAIL(id), data, config),
  deleteConcessionRule: (id, config) => apiDelete(API_ENDPOINTS.FEES.CONCESSION_RULE_DETAIL(id), config),
  applyConcession: (data) => apiPost(API_ENDPOINTS.FEES.APPLY_CONCESSION, data),
  appliedConcessions: (params, config) => apiGet(API_ENDPOINTS.FEES.APPLIED_CONCESSIONS, params, config),
  refreshConcessionQueue: (config) => apiPost(API_ENDPOINTS.FEES.REFRESH_CONCESSION_QUEUE, {}, config),
  approveConcession: (id, data, config) => apiPost(API_ENDPOINTS.FEES.APPROVE_CONCESSION(id), data, config),
  scholarshipPrograms: (params) => apiGet(API_ENDPOINTS.FEES.SCHOLARSHIP_PROGRAMS, params),
  scholarshipAwards: (params) => apiGet(API_ENDPOINTS.FEES.SCHOLARSHIP_AWARDS, params),
  approveScholarship: (id, data) => apiPost(API_ENDPOINTS.FEES.APPROVE_SCHOLARSHIP(id), data),
  refunds: (params) => apiGet(API_ENDPOINTS.FEES.REFUNDS, params),
  approveRefund: (id, data) => apiPost(API_ENDPOINTS.FEES.APPROVE_REFUND(id), data),
  integrationCharge: (data) => apiPost(API_ENDPOINTS.FEES.INTEGRATION_CHARGE, data),
  defaulters: (params, config) => apiGet(API_ENDPOINTS.FEES.DEFAULTERS, params, config),
  classWiseFeePaid: (params, config) => apiGet(API_ENDPOINTS.FEES.CLASS_WISE_PAID, params, config),
  staffChildrenReport: (params, config) => apiGet(API_ENDPOINTS.FEES.STAFF_CHILDREN_REPORT, params, config),
  paymentMethods: (params) => apiGet(API_ENDPOINTS.FEES.PAYMENT_METHODS, params),
  exportCollections: (params) => apiGetBlob(API_ENDPOINTS.FEES.EXPORT_COLLECTIONS, params),
  importPayments: (formData) => apiPostForm(API_ENDPOINTS.FEES.IMPORT_PAYMENTS, formData),
  lateFeeRules: (params) => apiGet(API_ENDPOINTS.FEES.LATE_FEE_RULES, params),
  createLateFeeRule: (data, config) => apiPost(API_ENDPOINTS.FEES.LATE_FEE_RULES, data, config),
  runLateFees: (data) => apiPost(API_ENDPOINTS.FEES.RUN_LATE_FEES, data),
  subCategories: (params, config) => apiGetPaginated(API_ENDPOINTS.FEES.SUB_CATEGORIES, params, config),
  getSubCategory: (id, config) => apiGet(API_ENDPOINTS.FEES.SUB_CATEGORY_DETAIL(id), config),
  createSubCategory: (data, config) => apiPost(API_ENDPOINTS.FEES.SUB_CATEGORIES, data, config),
  updateSubCategory: (id, data, config) => apiPatch(API_ENDPOINTS.FEES.SUB_CATEGORY_DETAIL(id), data, config),
  deleteSubCategory: (id, config) => apiDelete(API_ENDPOINTS.FEES.SUB_CATEGORY_DETAIL(id), config),
  discountRules: (params, config) => apiGetPaginated(API_ENDPOINTS.FEES.DISCOUNT_RULES, params, config),
  getDiscountRule: (id, config) => apiGet(API_ENDPOINTS.FEES.DISCOUNT_RULE_DETAIL(id), config),
  createDiscountRule: (data, config) => apiPost(API_ENDPOINTS.FEES.DISCOUNT_RULES, data, config),
  updateDiscountRule: (id, data, config) => apiPatch(API_ENDPOINTS.FEES.DISCOUNT_RULE_DETAIL(id), data, config),
  deleteDiscountRule: (id, config) => apiDelete(API_ENDPOINTS.FEES.DISCOUNT_RULE_DETAIL(id), config),
  appliedDiscounts: (params, config) => apiGet(API_ENDPOINTS.FEES.APPLIED_DISCOUNTS, params, config),
  applyDiscount: (data, config) => apiPost(API_ENDPOINTS.FEES.APPLY_DISCOUNT, data, config),
  approveDiscount: (id, data, config) => apiPost(API_ENDPOINTS.FEES.APPROVE_DISCOUNT(id), data, config),
  paymentPlans: (params, config) => apiGet(API_ENDPOINTS.FEES.PAYMENT_PLANS, params, config),
  paymentPlanDetail: (id, config) => apiGet(API_ENDPOINTS.FEES.PAYMENT_PLAN_DETAIL(id), config),
  createPaymentPlan: (data, config) => apiPost(API_ENDPOINTS.FEES.PAYMENT_PLANS, data, config),
  wallets: (params, config) => apiGet(API_ENDPOINTS.FEES.WALLETS, params, config),
  walletCredit: (data, config) => apiPost(API_ENDPOINTS.FEES.WALLET_CREDIT, data, config),
  studentOverrides: (data, config) => apiPost(API_ENDPOINTS.FEES.STUDENT_OVERRIDES, data, config),
  openingBalances: (data, config) => apiPost(API_ENDPOINTS.FEES.OPENING_BALANCES, data, config),
  collectionCounters: (params, config) => apiGetPaginated(API_ENDPOINTS.FEES.COLLECTION_COUNTERS, params, config),
  getCollectionCounter: (id, config) => apiGet(API_ENDPOINTS.FEES.COLLECTION_COUNTER_DETAIL(id), config),
  createCollectionCounter: (data, config) => apiPost(API_ENDPOINTS.FEES.COLLECTION_COUNTERS, data, config),
  updateCollectionCounter: (id, data, config) => apiPatch(API_ENDPOINTS.FEES.COLLECTION_COUNTER_DETAIL(id), data, config),
  deleteCollectionCounter: (id, config) => apiDelete(API_ENDPOINTS.FEES.COLLECTION_COUNTER_DETAIL(id), config),
  dailyClosings: (params, config) => apiGet(API_ENDPOINTS.FEES.DAILY_CLOSINGS, params, config),
  createDailyClosing: (data, config) => apiPost(API_ENDPOINTS.FEES.DAILY_CLOSINGS, data, config),
  transportStructures: (params, config) => apiGetPaginated(API_ENDPOINTS.FEES.TRANSPORT_STRUCTURES, params, config),
  createTransportStructure: (data, config) => apiPost(API_ENDPOINTS.FEES.TRANSPORT_STRUCTURES, data, config),
  hostelStructures: (params, config) => apiGetPaginated(API_ENDPOINTS.FEES.HOSTEL_STRUCTURES, params, config),
  createHostelStructure: (data, config) => apiPost(API_ENDPOINTS.FEES.HOSTEL_STRUCTURES, data, config),
  buildTemplate: (data, config) => apiPost(API_ENDPOINTS.FEES.TEMPLATE_BUILD, data, config),
  templateDetail: (id, config) => apiGet(API_ENDPOINTS.FEES.TEMPLATE_DETAIL(id), config),
  dailyCollectionReport: (params, config) => apiGet(API_ENDPOINTS.FEES.DAILY_COLLECTION_REPORT, params, config),
  outstandingReport: (params, config) => apiGet(API_ENDPOINTS.FEES.OUTSTANDING_REPORT, params, config),
  collectionSummary: (params, config) => apiGet(API_ENDPOINTS.FEES.COLLECTION_SUMMARY, params, config),
}

export const assessmentsService = {
  dashboard: (params) => apiGet(API_ENDPOINTS.ASSESSMENTS.DASHBOARD, params),
  search: (params) => apiGet(API_ENDPOINTS.ASSESSMENTS.SEARCH, params),
  getSettings: (params) => apiGet(API_ENDPOINTS.ASSESSMENTS.SETTINGS, params),
  updateSettings: (data, params) => apiPatch(API_ENDPOINTS.ASSESSMENTS.SETTINGS, data, { params }),
  examGroups: (params) => apiGet(API_ENDPOINTS.ASSESSMENTS.EXAM_GROUPS, params),
  createExamGroup: (data) => apiPost(API_ENDPOINTS.ASSESSMENTS.EXAM_GROUPS, data),
  exams: (params) => apiGet(API_ENDPOINTS.ASSESSMENTS.EXAMS, params),
  createExam: (data) => apiPost(API_ENDPOINTS.ASSESSMENTS.EXAMS, data),
  examDetail: (id, params) => apiGet(API_ENDPOINTS.ASSESSMENTS.EXAM_DETAIL(id), params),
  publishExam: (id, data = {}) => apiPost(API_ENDPOINTS.ASSESSMENTS.EXAM_PUBLISH(id), data),
  openMarks: (id, data = {}) => apiPost(API_ENDPOINTS.ASSESSMENTS.EXAM_OPEN_MARKS(id), data),
  components: (id, params) => apiGet(API_ENDPOINTS.ASSESSMENTS.EXAM_COMPONENTS(id), params),
  createComponent: (id, data) => apiPost(API_ENDPOINTS.ASSESSMENTS.EXAM_COMPONENTS(id), data),
  subjectConfigs: (id, params) => apiGet(API_ENDPOINTS.ASSESSMENTS.EXAM_SUBJECT_CONFIGS(id), params),
  createSubjectConfig: (id, data) => apiPost(API_ENDPOINTS.ASSESSMENTS.EXAM_SUBJECT_CONFIGS(id), data),
  passingRules: (id, params) => apiGet(API_ENDPOINTS.ASSESSMENTS.EXAM_PASSING_RULES(id), params),
  schedule: (id, params) => apiGet(API_ENDPOINTS.ASSESSMENTS.EXAM_SCHEDULE(id), params),
  createSchedule: (id, data) => apiPost(API_ENDPOINTS.ASSESSMENTS.EXAM_SCHEDULE(id), data),
  detectConflicts: (id, data = {}) => apiPost(API_ENDPOINTS.ASSESSMENTS.EXAM_DETECT_CONFLICTS(id), data),
  marks: (params) => apiGet(API_ENDPOINTS.ASSESSMENTS.MARKS, params),
  enterMarks: (data) => apiPost(API_ENDPOINTS.ASSESSMENTS.MARKS_ENTER, data),
  submitMarks: (id, data = {}) => apiPost(API_ENDPOINTS.ASSESSMENTS.MARKS_SUBMIT(id), data),
  approveMarks: (id, data = {}) => apiPost(API_ENDPOINTS.ASSESSMENTS.MARKS_APPROVE(id), data),
  moderateMarks: (id, data) => apiPost(API_ENDPOINTS.ASSESSMENTS.MARKS_MODERATE(id), data),
  processResults: (id, data = {}) => apiPost(API_ENDPOINTS.ASSESSMENTS.EXAM_PROCESS(id), data),
  publishResults: (id, data = {}) => apiPost(API_ENDPOINTS.ASSESSMENTS.EXAM_PUBLISH_RESULTS(id), data),
  examResults: (id, params) => apiGet(API_ENDPOINTS.ASSESSMENTS.EXAM_RESULTS(id), params),
  publishedSnapshots: (params) => apiGet(API_ENDPOINTS.ASSESSMENTS.PUBLISHED_SNAPSHOTS, params),
  passPercentage: (params) => apiGet(API_ENDPOINTS.ASSESSMENTS.PASS_PERCENTAGE, params),
  subjectAnalysis: (params) => apiGet(API_ENDPOINTS.ASSESSMENTS.SUBJECT_ANALYSIS, params),
  failureAnalysis: (params) => apiGet(API_ENDPOINTS.ASSESSMENTS.FAILURE_ANALYSIS, params),
  exportMarks: (params) => apiGetBlob(API_ENDPOINTS.ASSESSMENTS.EXPORT_MARKS, params),
  importMarks: (formData) => apiPostForm(API_ENDPOINTS.ASSESSMENTS.IMPORT_MARKS, formData),
  blueprints: (params) => apiGet(API_ENDPOINTS.ASSESSMENTS.BLUEPRINTS, params),
  enqueueAiJob: (data) => apiPost(API_ENDPOINTS.ASSESSMENTS.AI_JOBS, data),
}

export const documentsService = {
  dashboard: (params) => apiGet(API_ENDPOINTS.DOCUMENTS.DASHBOARD, params),
  search: (params) => apiGet(API_ENDPOINTS.DOCUMENTS.SEARCH, params),
  getSettings: (params) => apiGet(API_ENDPOINTS.DOCUMENTS.SETTINGS, params),
  updateSettings: (data, params) => apiPatch(API_ENDPOINTS.DOCUMENTS.SETTINGS, data, { params }),
  templates: (params) => apiGet(API_ENDPOINTS.DOCUMENTS.TEMPLATES, params),
  createTemplate: (data) => apiPost(API_ENDPOINTS.DOCUMENTS.TEMPLATES, data),
  templateDetail: (id, params) => apiGet(API_ENDPOINTS.DOCUMENTS.TEMPLATE_DETAIL(id), params),
  updateTemplate: (id, data, params) => apiPatch(API_ENDPOINTS.DOCUMENTS.TEMPLATE_DETAIL(id), data, { params }),
  publishTemplate: (id, data = {}) => apiPost(API_ENDPOINTS.DOCUMENTS.TEMPLATE_PUBLISH(id), data),
  rollbackTemplate: (id, data) => apiPost(API_ENDPOINTS.DOCUMENTS.TEMPLATE_ROLLBACK(id), data),
  exportTemplate: (id, params) => apiGetBlob(API_ENDPOINTS.DOCUMENTS.TEMPLATE_EXPORT(id), params),
  importTemplate: (formData) => apiPostForm(API_ENDPOINTS.DOCUMENTS.TEMPLATE_IMPORT, formData),
  generateReportCard: (data) => apiPost(API_ENDPOINTS.DOCUMENTS.GENERATE_REPORT_CARD, data),
  bulkReportCards: (data) => apiPost(API_ENDPOINTS.DOCUMENTS.BULK_REPORT_CARDS, data),
  certificates: (params) => apiGet(API_ENDPOINTS.DOCUMENTS.CERTIFICATES, params),
  issueCertificate: (data) => apiPost(API_ENDPOINTS.DOCUMENTS.CERTIFICATES, data),
  generateTranscript: (data) => apiPost(API_ENDPOINTS.DOCUMENTS.GENERATE_TRANSCRIPT, data),
  documentDetail: (id, params) => apiGet(API_ENDPOINTS.DOCUMENTS.DOCUMENT_DETAIL(id), params),
  publishDocument: (id, data = {}) => apiPost(API_ENDPOINTS.DOCUMENTS.PUBLISH_DOCUMENT(id), data),
  downloadPdf: (id, params) => apiGetBlob(API_ENDPOINTS.DOCUMENTS.DOWNLOAD_PDF(id), params),
  bulkZip: (data) => apiPost(API_ENDPOINTS.DOCUMENTS.BULK_ZIP, data),
  verify: (code) => apiGet(API_ENDPOINTS.DOCUMENTS.VERIFY(code)),
  preview: (data) => apiPost(API_ENDPOINTS.DOCUMENTS.PREVIEW, data),
}

export const libraryService = {
  books: {
    list: (params) => apiGetPaginated(API_ENDPOINTS.LIBRARY.BOOKS, params),
    get: (id) => apiGet(API_ENDPOINTS.LIBRARY.BOOK_DETAIL(id)),
    create: (data) => apiPost(API_ENDPOINTS.LIBRARY.BOOKS, data),
    update: (id, data) => apiPatch(API_ENDPOINTS.LIBRARY.BOOK_DETAIL(id), data),
    delete: (id) => apiDelete(API_ENDPOINTS.LIBRARY.BOOK_DETAIL(id)),
  },
}

export const lmsService = {
  dashboard: (params) => apiGet(API_ENDPOINTS.LMS.DASHBOARD, params),
  studentDashboard: (params) => apiGet(API_ENDPOINTS.LMS.STUDENT_DASHBOARD, params),
  teacherDashboard: (params) => apiGet(API_ENDPOINTS.LMS.TEACHER_DASHBOARD, params),
  parentDashboard: (params) => apiGet(API_ENDPOINTS.LMS.PARENT_DASHBOARD, params),
  search: (params) => apiGet(API_ENDPOINTS.LMS.SEARCH, params),
  getSettings: (params) => apiGet(API_ENDPOINTS.LMS.SETTINGS, params),
  updateSettings: (data, params) => apiPatch(API_ENDPOINTS.LMS.SETTINGS, data, { params }),
  courses: (params) => apiGet(API_ENDPOINTS.LMS.COURSES, params),
  createCourse: (data) => apiPost(API_ENDPOINTS.LMS.COURSES, data),
  courseDetail: (id, params) => apiGet(API_ENDPOINTS.LMS.COURSE_DETAIL(id), params),
  updateCourse: (id, data, params) => apiPatch(API_ENDPOINTS.LMS.COURSE_DETAIL(id), data, { params }),
  publishCourse: (id, data = {}) => apiPost(API_ENDPOINTS.LMS.COURSE_PUBLISH(id), data),
  enrollCourse: (id, data) => apiPost(API_ENDPOINTS.LMS.COURSE_ENROLL(id), data),
  courseNodes: (id, params) => apiGet(API_ENDPOINTS.LMS.COURSE_NODES(id), params),
  addCourseNode: (id, data) => apiPost(API_ENDPOINTS.LMS.COURSE_NODES(id), data),
  publishNode: (id, data = {}) => apiPost(API_ENDPOINTS.LMS.NODE_PUBLISH(id), data),
  recordProgress: (id, data) => apiPost(API_ENDPOINTS.LMS.NODE_PROGRESS(id), data),
  lessonPlans: (params) => apiGet(API_ENDPOINTS.LMS.LESSON_PLANS, params),
  createLessonPlan: (data) => apiPost(API_ENDPOINTS.LMS.LESSON_PLANS, data),
  submitLessonPlan: (id, data = {}) => apiPost(API_ENDPOINTS.LMS.LESSON_PLAN_SUBMIT(id), data),
  approveLessonPlan: (id, data = {}) => apiPost(API_ENDPOINTS.LMS.LESSON_PLAN_APPROVE(id), data),
  publishLessonPlan: (id, data = {}) => apiPost(API_ENDPOINTS.LMS.LESSON_PLAN_PUBLISH(id), data),
  assignments: (params) => apiGet(API_ENDPOINTS.LMS.ASSIGNMENTS, params),
  createAssignment: (data) => apiPost(API_ENDPOINTS.LMS.ASSIGNMENTS, data),
  homework: (params) => apiGet(API_ENDPOINTS.LMS.HOMEWORK, params),
  createHomework: (data) => apiPost(API_ENDPOINTS.LMS.HOMEWORK, data),
  assignToStudents: (id, data) => apiPost(API_ENDPOINTS.LMS.ASSIGNMENT_ASSIGN(id), data),
  submitWork: (id, data) => apiPost(API_ENDPOINTS.LMS.SUBMISSION_SUBMIT(id), data),
  reviewSubmission: (id, data) => apiPost(API_ENDPOINTS.LMS.SUBMISSION_REVIEW(id), data),
  returnSubmission: (id, data) => apiPost(API_ENDPOINTS.LMS.SUBMISSION_RETURN(id), data),
  quizzes: (params) => apiGet(API_ENDPOINTS.LMS.QUIZZES, params),
  createQuiz: (data) => apiPost(API_ENDPOINTS.LMS.QUIZZES, data),
  addQuizQuestion: (id, data) => apiPost(API_ENDPOINTS.LMS.QUIZ_QUESTIONS(id), data),
  quizAttempt: (id, data) => apiPost(API_ENDPOINTS.LMS.QUIZ_ATTEMPT(id), data),
  content: (params) => apiGet(API_ENDPOINTS.LMS.CONTENT, params),
  uploadContent: (formData) => apiPostForm(API_ENDPOINTS.LMS.CONTENT, formData),
  liveClasses: (params) => apiGet(API_ENDPOINTS.LMS.LIVE_CLASSES, params),
  scheduleLiveClass: (data) => apiPost(API_ENDPOINTS.LMS.LIVE_CLASSES, data),
  forums: (params) => apiGet(API_ENDPOINTS.LMS.FORUMS, params),
  createForum: (data) => apiPost(API_ENDPOINTS.LMS.FORUMS, data),
  forumPosts: (id, data) => apiPost(API_ENDPOINTS.LMS.FORUM_POSTS(id), data),
  feed: (params) => apiGet(API_ENDPOINTS.LMS.FEED, params),
  postFeed: (data) => apiPost(API_ENDPOINTS.LMS.FEED, data),
  enqueueAiJob: (data) => apiPost(API_ENDPOINTS.LMS.AI_JOBS, data),
}

export const parentService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.PARENTS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.PARENTS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.PARENTS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.PARENTS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.PARENTS.DETAIL(id)),
  export: (params) => apiGetBlob(API_ENDPOINTS.PARENTS.EXPORT, params),
  dashboard: (params) => apiGet(API_ENDPOINTS.PARENTS.DASHBOARD, params),
  search: (params) => apiGet(API_ENDPOINTS.PARENTS.SEARCH, params),
  getGuardianSettings: (params) => apiGet(API_ENDPOINTS.PARENTS.GUARDIAN_SETTINGS, params),
  updateGuardianSettings: (data, params) => apiPatch(API_ENDPOINTS.PARENTS.GUARDIAN_SETTINGS, data, { params }),
  portal: (id) => apiGet(API_ENDPOINTS.PARENTS.PORTAL(id)),
  invitePortal: (id) => apiPost(API_ENDPOINTS.PARENTS.INVITE_PORTAL(id)),
  sendCredentials: (id, data) => apiPost(API_ENDPOINTS.PARENTS.SEND_CREDENTIALS(id), data),
  resetPassword: (id, data) => apiPost(API_ENDPOINTS.PARENTS.RESET_PASSWORD(id), data),
  linkStudent: (id, data) => apiPost(API_ENDPOINTS.PARENTS.LINK_STUDENT(id), data),
  unlinkStudent: (id, data) => apiPost(API_ENDPOINTS.PARENTS.UNLINK_STUDENT(id), data),
  updateCommunication: (id, data) => apiPatch(API_ENDPOINTS.PARENTS.COMMUNICATION(id), data),
  updateEmergencyContact: (id, data) => apiPatch(API_ENDPOINTS.PARENTS.EMERGENCY_CONTACT(id), data),
  updateGuardian: (id, data) => apiPatch(API_ENDPOINTS.PARENTS.GUARDIAN(id), data),
  setMobileAppAccess: (id, data) => apiPost(API_ENDPOINTS.PARENTS.MOBILE_APP_ACCESS(id), data),
  uploadPhoto: (id, formData) => apiPostForm(API_ENDPOINTS.PARENTS.UPLOAD_PHOTO(id), formData),
}

export const householdService = {
  list: (params) => apiGet(API_ENDPOINTS.HOUSEHOLDS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.HOUSEHOLDS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.HOUSEHOLDS.LIST, data),
  addMember: (id, data) => apiPost(API_ENDPOINTS.HOUSEHOLDS.ADD_MEMBER(id), data),
  addEmergencyContact: (id, data) => apiPost(API_ENDPOINTS.HOUSEHOLDS.EMERGENCY_CONTACTS(id), data),
}

export const pickupService = {
  list: (params) => apiGet(API_ENDPOINTS.PICKUPS.LIST, params),
  authorize: (data) => apiPost(API_ENDPOINTS.PICKUPS.LIST, data),
  verify: (data) => apiPost(API_ENDPOINTS.PICKUPS.VERIFY, data),
  history: (params) => apiGet(API_ENDPOINTS.PICKUPS.HISTORY, params),
}

export const communicationService = {
  templates: {
    list: (params) => apiGetPaginated(API_ENDPOINTS.COMMUNICATIONS.TEMPLATES, params),
    get: (id) => apiGet(API_ENDPOINTS.COMMUNICATIONS.TEMPLATE_DETAIL(id)),
    create: (data) => apiPost(API_ENDPOINTS.COMMUNICATIONS.TEMPLATES, data),
    update: (id, data) => apiPatch(API_ENDPOINTS.COMMUNICATIONS.TEMPLATE_DETAIL(id), data),
    delete: (id) => apiDelete(API_ENDPOINTS.COMMUNICATIONS.TEMPLATE_DETAIL(id)),
  },
  messages: {
    list: (params) => apiGetPaginated(API_ENDPOINTS.COMMUNICATIONS.MESSAGES, params),
    get: (id) => apiGet(API_ENDPOINTS.COMMUNICATIONS.MESSAGE_DETAIL(id)),
    create: (data) => apiPost(API_ENDPOINTS.COMMUNICATIONS.MESSAGES, data),
    update: (id, data) => apiPatch(API_ENDPOINTS.COMMUNICATIONS.MESSAGE_DETAIL(id), data),
    delete: (id) => apiDelete(API_ENDPOINTS.COMMUNICATIONS.MESSAGE_DETAIL(id)),
    previewAudience: (data) => apiPost(API_ENDPOINTS.COMMUNICATIONS.PREVIEW_AUDIENCE, data),
    send: (id) => apiPost(API_ENDPOINTS.COMMUNICATIONS.SEND(id)),
    schedule: (id, data) => apiPost(API_ENDPOINTS.COMMUNICATIONS.SCHEDULE(id), data),
    cancel: (id) => apiPost(API_ENDPOINTS.COMMUNICATIONS.CANCEL(id)),
    deliveryReport: (id) => apiGet(API_ENDPOINTS.COMMUNICATIONS.DELIVERY_REPORT(id)),
    readReceipts: (id) => apiGet(API_ENDPOINTS.COMMUNICATIONS.READ_RECEIPTS(id)),
    processScheduled: () => apiPost(API_ENDPOINTS.COMMUNICATIONS.PROCESS_SCHEDULED),
  },
  deliveries: {
    list: (params) => apiGetPaginated(API_ENDPOINTS.COMMUNICATIONS.DELIVERIES, params),
    markRead: (id) => apiPost(API_ENDPOINTS.COMMUNICATIONS.MARK_READ(id)),
  },
}

export const roleService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.ROLES.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.ROLES.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.ROLES.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.ROLES.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.ROLES.DETAIL(id)),
  getPermissions: (id) => apiGet(API_ENDPOINTS.ROLES.PERMISSIONS(id)),
  syncPermissions: (id, permissionIds) =>
    apiPost(API_ENDPOINTS.ROLES.SYNC_PERMISSIONS(id), { permission_ids: permissionIds }),
  getMenus: (id) => apiGet(API_ENDPOINTS.ROLES.MENUS(id)),
  syncMenus: (id, menuIds) => apiPost(API_ENDPOINTS.ROLES.SYNC_MENUS(id), { menu_ids: menuIds }),
}

export const permissionService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.PERMISSIONS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.PERMISSIONS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.PERMISSIONS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.PERMISSIONS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.PERMISSIONS.DETAIL(id)),
  matrix: (params) => apiGet(API_ENDPOINTS.PERMISSIONS.MATRIX, params),
}

export const menuService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.MENUS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.MENUS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.MENUS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.MENUS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.MENUS.DETAIL(id)),
  myMenus: () => apiGet(API_ENDPOINTS.MENUS.MY_MENUS),
  tree: (params) => apiGet(API_ENDPOINTS.MENUS.TREE, params),
  schoolAdminTree: (params) => apiGet(API_ENDPOINTS.MENUS.SCHOOL_ADMIN_TREE, params),
  updateSchoolMapping: (data) => {
    const { organization, ...body } = data
    return apiPatch(
      API_ENDPOINTS.MENUS.SCHOOL_MAPPING,
      body,
      organization ? { params: { organization } } : undefined,
    )
  },
  updateSchoolModule: (data) => {
    const { organization, ...body } = data
    return apiPatch(
      API_ENDPOINTS.MENUS.SCHOOL_MODULE,
      body,
      organization ? { params: { organization } } : undefined,
    )
  },
  portalRoles: (params) => apiGet(API_ENDPOINTS.MENUS.PORTAL_ROLES, params),
  schoolRoleTree: (params) => apiGet(API_ENDPOINTS.MENUS.SCHOOL_ROLE_TREE, params),
  updateSchoolRoleMapping: (data) => {
    const { organization, ...body } = data
    return apiPatch(
      API_ENDPOINTS.MENUS.SCHOOL_ROLE_MAPPING,
      body,
      organization ? { params: { organization } } : undefined,
    )
  },
  updateSchoolRoleModule: (data) => {
    const { organization, ...body } = data
    return apiPatch(
      API_ENDPOINTS.MENUS.SCHOOL_ROLE_MODULE,
      body,
      organization ? { params: { organization } } : undefined,
    )
  },
  reorder: (items) => apiPost(API_ENDPOINTS.MENUS.REORDER, { items }),
}

export const moduleService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.MODULES.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.MODULES.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.MODULES.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.MODULES.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.MODULES.DETAIL(id)),
  reorder: (items) => apiPost(API_ENDPOINTS.MODULES.REORDER, { items }),
}

export const membershipService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.MEMBERSHIPS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.MEMBERSHIPS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.MEMBERSHIPS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.MEMBERSHIPS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.MEMBERSHIPS.DETAIL(id)),
}

export const userRoleService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.USER_ROLES.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.USER_ROLES.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.USER_ROLES.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.USER_ROLES.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.USER_ROLES.DETAIL(id)),
}

export const auditLogService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.AUDIT_LOGS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.AUDIT_LOGS.DETAIL(id)),
  filterOptions: () => apiGet(API_ENDPOINTS.AUDIT_LOGS.FILTER_OPTIONS),
}

export const settingsService = {
  get: (section) => apiGet(API_ENDPOINTS.SETTINGS.SECTION(section)),
  update: (section, data) => apiPatch(API_ENDPOINTS.SETTINGS.SECTION(section), data),
}

export const schoolSettingsService = {
  getSections: () => apiGet(API_ENDPOINTS.SCHOOL_SETTINGS.SECTIONS),
  getAll: () => apiGet(API_ENDPOINTS.SCHOOL_SETTINGS.ALL),
  getEffectiveAll: (params) => apiGet(API_ENDPOINTS.SCHOOL_SETTINGS.EFFECTIVE_ALL, params),
  get: (section) => apiGet(API_ENDPOINTS.SCHOOL_SETTINGS.SECTION(section)),
  getEffective: (section, params) => apiGet(API_ENDPOINTS.SCHOOL_SETTINGS.EFFECTIVE_SECTION(section), params),
  update: (section, data) => apiPatch(API_ENDPOINTS.SCHOOL_SETTINGS.SECTION(section), data),
  previewNumber: (data) => apiPost(API_ENDPOINTS.SCHOOL_SETTINGS.PREVIEW_NUMBER, data),
}

export const notificationService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.NOTIFICATIONS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.NOTIFICATIONS.DETAIL(id)),
  markRead: (id) => apiPost(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)),
  markAllRead: () => apiPost(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ),
  unreadCount: () => apiGet(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT),
}

export const nexusMailService = {
  send: (data) => apiPost(API_ENDPOINTS.NEXUS_MAIL.SEND, data),
}

export function createMasterService(apiPath) {
  const detail = (id) => (apiPath.endsWith('/') ? `${apiPath}${id}/` : `${apiPath}/${id}/`)
  return {
    list: (params, config) => apiGetPaginated(apiPath, params, config),
    get: (id) => apiGet(detail(id)),
    create: (data) => apiPost(apiPath, data),
    update: (id, data, config) => apiPatch(detail(id), data, config),
    delete: (id, config) => apiDelete(detail(id), config),
    bulkImport: (items, config) => apiPost(`${apiPath}bulk-import/`, { items }, config),
    bulkUpdate: (items) => apiPatch(`${apiPath}bulk-update/`, { items }),
    export: (params) => apiGetBlob(`${apiPath}export/`, params),
  }
}

export function createAcademicService(apiPath) {
  const detail = (id) => (apiPath.endsWith('/') ? `${apiPath}${id}/` : `${apiPath}/${id}/`)
  return {
    list: (params) => apiGetPaginated(apiPath, params),
    get: (id) => apiGet(detail(id)),
    create: (data) => apiPost(apiPath, data),
    update: (id, data) => apiPatch(detail(id), data),
    delete: (id) => apiDelete(detail(id)),
    bulkUpload: (items, config) => apiPost(`${apiPath}bulk-upload/`, { items }, config),
    bulkUpdate: (items) => apiPatch(`${apiPath}bulk-update/`, { items }),
  }
}

export function createSchoolMasterService(masterType) {
  const apiPath = API_ENDPOINTS.SCHOOL_MASTERS.LIST(masterType)
  const detail = (id) => API_ENDPOINTS.SCHOOL_MASTERS.DETAIL(masterType, id)
  return {
    list: (params) => apiGetPaginated(apiPath, params),
    get: (id) => apiGet(detail(id)),
    create: (data) => apiPost(apiPath, data),
    update: (id, data) => apiPatch(detail(id), data),
    delete: (id) => apiDelete(detail(id)),
    bulkImport: (items) => apiPost(API_ENDPOINTS.SCHOOL_MASTERS.BULK_IMPORT(masterType), { items }),
    export: (params) => apiGetBlob(API_ENDPOINTS.SCHOOL_MASTERS.EXPORT(masterType), params),
  }
}

export const schoolMasterService = {
  getTypes: () => apiGet(API_ENDPOINTS.SCHOOL_MASTERS.TYPES),
  forType: (masterType) => createSchoolMasterService(masterType),
}

export const masterServices = {
  countries: createMasterService(API_ENDPOINTS.MASTERS.COUNTRIES),
  states: createMasterService(API_ENDPOINTS.MASTERS.STATES),
  cities: createMasterService(API_ENDPOINTS.MASTERS.CITIES),
  boards: createMasterService(API_ENDPOINTS.MASTERS.BOARDS),
  classes: createMasterService(API_ENDPOINTS.MASTERS.CLASSES),
  sections: createMasterService(API_ENDPOINTS.MASTERS.SECTIONS),
  subjects: createMasterService(API_ENDPOINTS.MASTERS.SUBJECTS),
  streams: createMasterService(API_ENDPOINTS.MASTERS.STREAMS),
  subjectGroups: createMasterService(API_ENDPOINTS.MASTERS.SUBJECT_GROUPS),
  departments: createMasterService(API_ENDPOINTS.MASTERS.DEPARTMENTS),
  designations: createMasterService(API_ENDPOINTS.MASTERS.DESIGNATIONS),
  categories: createMasterService(API_ENDPOINTS.MASTERS.CATEGORIES),
  academicYears: createMasterService(API_ENDPOINTS.ACADEMIC_YEARS.LIST),
}

export const academicYearService = {
  list: (params, config) => apiGetPaginated(API_ENDPOINTS.ACADEMIC_YEARS.LIST, params, config),
  get: (id) => apiGet(API_ENDPOINTS.ACADEMIC_YEARS.DETAIL(id)),
  create: (data, config) => apiPost(API_ENDPOINTS.ACADEMIC_YEARS.LIST, data, config),
  update: (id, data) => apiPatch(API_ENDPOINTS.ACADEMIC_YEARS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.ACADEMIC_YEARS.DETAIL(id)),
  setCurrent: (id) => apiPost(API_ENDPOINTS.ACADEMIC_YEARS.SET_CURRENT(id)),
  freeze: (id) => apiPost(API_ENDPOINTS.ACADEMIC_YEARS.FREEZE(id)),
  unfreeze: (id) => apiPost(API_ENDPOINTS.ACADEMIC_YEARS.UNFREEZE(id)),
  lock: (id) => apiPost(API_ENDPOINTS.ACADEMIC_YEARS.LOCK(id)),
  unlock: (id) => apiPost(API_ENDPOINTS.ACADEMIC_YEARS.UNLOCK(id)),
  close: (id) => apiPost(API_ENDPOINTS.ACADEMIC_YEARS.CLOSE(id)),
  archive: (id) => apiPost(API_ENDPOINTS.ACADEMIC_YEARS.ARCHIVE(id)),
  clone: (id, payload) => apiPost(API_ENDPOINTS.ACADEMIC_YEARS.CLONE(id), payload),
  generateCalendar: (id) => apiPost(API_ENDPOINTS.ACADEMIC_YEARS.GENERATE_CALENDAR(id)),
  getSettings: (id, params) => apiGet(API_ENDPOINTS.ACADEMIC_YEARS.SETTINGS(id), params),
  updateSettings: (id, payload) => apiPatch(API_ENDPOINTS.ACADEMIC_YEARS.SETTINGS(id), payload),
  clearSettingsSection: (id, section) =>
    apiDelete(`${API_ENDPOINTS.ACADEMIC_YEARS.SETTINGS(id)}?section=${encodeURIComponent(section)}`),
}

export const academicServices = {
  academicYears: academicYearService,
  terms: createAcademicService(API_ENDPOINTS.ACADEMICS.TERMS),
  classSections: {
    ...createAcademicService(API_ENDPOINTS.ACADEMICS.CLASS_SECTIONS),
    list: (params, config) =>
      apiGet(
        API_ENDPOINTS.ACADEMICS.CLASS_SECTIONS,
        {
          ordering: 'school_class__sequence,school_class__name,section__sequence,section__name',
          ...(params ?? {}),
        },
        config,
      ),
    applyMaps: (payload) => apiPost(API_ENDPOINTS.ACADEMICS.CLASS_SECTIONS_APPLY_MAPS, payload),
  },
  classSectionMaps: createAcademicService(API_ENDPOINTS.ACADEMICS.CLASS_SECTION_MAPS),
  curriculums: createAcademicService(API_ENDPOINTS.ACADEMICS.CURRICULUMS),
  curriculumSubjects: createAcademicService(API_ENDPOINTS.ACADEMICS.CURRICULUM_SUBJECTS),
  electiveSubjects: createAcademicService(API_ENDPOINTS.ACADEMICS.ELECTIVE_SUBJECTS),
  classTeachers: createAcademicService(API_ENDPOINTS.ACADEMICS.CLASS_TEACHERS),
  calendarEvents: createAcademicService(API_ENDPOINTS.ACADEMICS.CALENDAR_EVENTS),
  classTimings: createAcademicService(API_ENDPOINTS.ACADEMICS.CLASS_TIMINGS),
  periods: createAcademicService(API_ENDPOINTS.ACADEMICS.PERIODS),
  workingDays: createAcademicService(API_ENDPOINTS.ACADEMICS.WORKING_DAYS),
  holidays: createAcademicService(API_ENDPOINTS.ACADEMICS.HOLIDAYS),
  gradingSchemes: createAcademicService(API_ENDPOINTS.ACADEMICS.GRADING_SCHEMES),
  gradeBands: createAcademicService(API_ENDPOINTS.ACADEMICS.GRADE_BANDS),
  assessmentCategories: createAcademicService(API_ENDPOINTS.ACADEMICS.ASSESSMENT_CATEGORIES),
  examTypes: createAcademicService(API_ENDPOINTS.ACADEMICS.EXAM_TYPES),
  assessmentTemplates: createAcademicService(API_ENDPOINTS.ACADEMICS.ASSESSMENT_TEMPLATES),
  policies: createAcademicService(API_ENDPOINTS.ACADEMICS.POLICIES),
  rooms: createAcademicService(API_ENDPOINTS.ACADEMICS.ROOMS),
  teacherAvailability: createAcademicService(API_ENDPOINTS.ACADEMICS.TEACHER_AVAILABILITY),
  classSectionSubjects: createAcademicService(API_ENDPOINTS.ACADEMICS.CLASS_SECTION_SUBJECTS),
  subjectTree: (params) => apiGet(API_ENDPOINTS.ACADEMICS.SUBJECT_TREE, params),
}

export const mdmService = {
  getContract: () => apiGet(API_ENDPOINTS.MDM.CONTRACT),
  catalogSummary: () => apiGet(API_ENDPOINTS.MDM.CATALOG),
  listBoards: (params) => apiGet(API_ENDPOINTS.MDM.BOARDS, params),
  listSubjects: (params) => apiGet(API_ENDPOINTS.MDM.SUBJECTS, params),
  listCurriculums: (params) => apiGet(API_ENDPOINTS.MDM.CURRICULUMS, params),
  listGradingSchemes: (params) => apiGet(API_ENDPOINTS.MDM.GRADING_SCHEMES, params),
  listCalendars: (params) => apiGet(API_ENDPOINTS.MDM.CALENDARS, params),
  adoptBoard: (payload) => apiPost(API_ENDPOINTS.MDM.ADOPT_BOARD, payload),
  adoptSubject: (payload) => apiPost(API_ENDPOINTS.MDM.ADOPT_SUBJECT, payload),
  adoptGrading: (payload) => apiPost(API_ENDPOINTS.MDM.ADOPT_GRADING, payload),
  adoptCalendar: (payload) => apiPost(API_ENDPOINTS.MDM.ADOPT_CALENDAR, payload),
  adoptCurriculum: (payload) => apiPost(API_ENDPOINTS.MDM.ADOPT_CURRICULUM, payload),
  adoptPack: (payload) => apiPost(API_ENDPOINTS.MDM.ADOPT_PACK, payload),
  resolveOrg: (params) => apiGet(API_ENDPOINTS.MDM.RESOLVE_ORG, params),
  resolveSchoolYear: (params) => apiGet(API_ENDPOINTS.MDM.RESOLVE_SCHOOL_YEAR, params),
  listAdoptions: (params) => apiGet(API_ENDPOINTS.MDM.ADOPTIONS, params),
}

// Attach enterprise admission catalogs after createAcademicService is defined
Object.assign(admissionService, {
  cycles: createAcademicService(API_ENDPOINTS.ADMISSIONS.CYCLES),
  categories: createAcademicService(API_ENDPOINTS.ADMISSIONS.CATEGORIES),
  seatMatrices: createAcademicService(API_ENDPOINTS.ADMISSIONS.SEAT_MATRICES),
  seatAllocations: {
    list: (params) => apiGetPaginated(API_ENDPOINTS.ADMISSIONS.SEAT_ALLOCATIONS, params),
    allocate: (id) => apiPost(`${API_ENDPOINTS.ADMISSIONS.SEAT_ALLOCATIONS}${id}/allocate/`),
    release: (id) => apiPost(`${API_ENDPOINTS.ADMISSIONS.SEAT_ALLOCATIONS}${id}/release/`),
  },
  workflowConfigs: createAcademicService(API_ENDPOINTS.ADMISSIONS.WORKFLOW_CONFIGS),
  scholarshipTypes: createAcademicService(API_ENDPOINTS.ADMISSIONS.SCHOLARSHIP_TYPES),
  feeIntents: createAcademicService(API_ENDPOINTS.ADMISSIONS.FEE_INTENTS),
  numberSequences: createAcademicService(API_ENDPOINTS.ADMISSIONS.NUMBER_SEQUENCES),
})

/**
 * Shared media upload to Cloudflare R2 (via backend).
 *
 * @param {File|Blob} file
 * @param {string} folder - STORAGE_FOLDERS key, e.g. STORAGE_FOLDERS.STUDENT_PROFILE
 * @param {{ subfolder?: string, schoolId?: string }} [options]
 */
export const storageService = {
  listFolders: () => apiGet(API_ENDPOINTS.STORAGE.FOLDERS),
  folders: () => apiGet(API_ENDPOINTS.STORAGE.FOLDERS),

  upload: (file, folder, options = {}) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    if (options.subfolder) formData.append('subfolder', options.subfolder)
    if (options.schoolId || options.school) formData.append('school', options.schoolId || options.school)
    return apiPostForm(API_ENDPOINTS.STORAGE.UPLOAD, formData)
  },

  delete: (path) => apiDelete(API_ENDPOINTS.STORAGE.DELETE, { data: { path } }),
}

function resolveSchoolId(explicitSchoolId) {
  if (explicitSchoolId) return explicitSchoolId
  const user = getStoredUser()
  return user?.school_id || user?.school?.id || user?.school || null
}

export const formService = {
  list: (params) => apiGet(API_ENDPOINTS.FORMS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.FORMS.DETAIL(id)),
  create: (payload, schoolId) => {
    const body = { ...payload }
    const sid = resolveSchoolId(schoolId)
    if (sid) body.school = sid
    return apiPost(API_ENDPOINTS.FORMS.LIST, body)
  },
  save: (id, payload, schoolId) => {
    const body = { ...payload }
    const sid = resolveSchoolId(schoolId)
    if (sid) body.school = sid
    return apiPatch(API_ENDPOINTS.FORMS.DETAIL(id), body)
  },
  delete: (id) => apiDelete(API_ENDPOINTS.FORMS.DETAIL(id)),
  publish: (id) => apiPost(API_ENDPOINTS.FORMS.PUBLISH(id)),
  unpublish: (id) => apiPost(API_ENDPOINTS.FORMS.UNPUBLISH(id)),
  duplicate: (id) => apiPost(API_ENDPOINTS.FORMS.DUPLICATE(id)),
  listSubmissions: (id) => apiGet(API_ENDPOINTS.FORMS.SUBMISSIONS(id)),
  getPublic: (slug) => apiGet(API_ENDPOINTS.FORMS.PUBLIC(slug), undefined, { skipAuthRefresh: true }),
  submitPublic: (slug, data) =>
    apiPost(API_ENDPOINTS.FORMS.PUBLIC_SUBMIT(slug), { data }, { skipAuthRefresh: true }),
}
