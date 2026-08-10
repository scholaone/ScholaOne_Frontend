// Local (npm run dev): http://127.0.0.1:8000
// Live (npm run build): https://edunexusbackend-production.up.railway.app
const LOCAL_API_URL = 'http://127.0.0.1:8000'
const PRODUCTION_API_URL = 'https://edunexusbackend-production.up.railway.app'

function normalizeBaseUrl(url) {
  return (url || '').trim().replace(/\/+$/, '')
}

function resolveApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL || import.meta.env.NEXT_PUBLIC_API_BASE_URL

  // Explicit override (skip empty / proxy sentinel values)
  if (fromEnv && fromEnv !== 'proxy' && fromEnv !== '/api') {
    return normalizeBaseUrl(fromEnv)
  }

  // Vite: import.meta.env.DEV === true when running `npm run dev`
  if (import.meta.env.DEV) {
    return LOCAL_API_URL
  }

  return PRODUCTION_API_URL
}

export const APP_NAME =
  import.meta.env.VITE_APP_NAME || import.meta.env.NEXT_PUBLIC_APP_NAME || 'ScholaOne ERP'

export const API_BASE_URL = resolveApiBaseUrl()

export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT || 30000)
export const DEFAULT_PAGE_SIZE = 20
export const AUTH_STORAGE_KEY = 'scholaone-auth'
export const AUTH_REVISION_KEY = 'scholaone-auth-rev'
export const AUTH_LOGOUT_KEY = 'scholaone-auth-logout'
export const TENANT_STORAGE_KEY = 'scholaone-tenant'

export const ROLE_TYPES = [
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'Organization Admin', value: 'org_admin' },
  { label: 'School Admin', value: 'school_admin' },
  { label: 'User', value: 'user' },
]

export const SCHOOL_STAFF_ROLES = [
  { label: 'Teacher', value: 'teacher' },
  { label: 'Parent', value: 'parent' },
  { label: 'Student', value: 'student' },
  { label: 'Staff', value: 'staff' },
  { label: 'Receptionist', value: 'receptionist' },
  { label: 'Librarian', value: 'librarian' },
  { label: 'Transport Manager', value: 'transport_manager' },
  { label: 'Accountant', value: 'accountant' },
  { label: 'Nurse', value: 'nurse' },
  { label: 'HR Manager', value: 'hr_manager' },
  { label: 'Sports Coach', value: 'sports_coach' },
]

export const ADMISSION_STATUS_OPTIONS = [
  { label: 'Enquiry', value: 'enquiry' },
  { label: 'Application Draft', value: 'lead' },
  { label: 'Application Submitted', value: 'application' },
  { label: 'Document Verification', value: 'documents' },
  { label: 'Entrance Test', value: 'entrance_test' },
  { label: 'Interview', value: 'interview' },
  { label: 'Pending Approval', value: 'approval' },
  { label: 'Fee Payment', value: 'fee' },
  { label: 'Admission Confirmed', value: 'confirmed' },
  { label: 'Ready for SIS', value: 'ready_for_sis' },
  { label: 'Student Activated', value: 'enrolled' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Withdrawn', value: 'withdrawn' },
  { label: 'Cancelled', value: 'cancelled' },
]

export const LEAD_SOURCE_OPTIONS = [
  { label: 'Walk-in', value: 'walk_in' },
  { label: 'Website', value: 'website' },
  { label: 'Mobile App', value: 'mobile_app' },
  { label: 'Phone', value: 'phone' },
  { label: 'Email', value: 'email' },
  { label: 'Referral', value: 'referral' },
  { label: 'Campaign', value: 'campaign' },
  { label: 'Education Fair', value: 'education_fair' },
  { label: 'Social Media / Google', value: 'social_media' },
  { label: 'Imported', value: 'import' },
  { label: 'Other', value: 'other' },
]

export const STUDENT_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Promoted', value: 'promoted' },
  { label: 'Transferred', value: 'transferred' },
  { label: 'Graduated', value: 'graduated' },
  { label: 'Alumni', value: 'alumni' },
  { label: 'Archived', value: 'archived' },
]

export const STAFF_STATUS_OPTIONS = [
  { label: 'Candidate', value: 'candidate' },
  { label: 'Interview', value: 'interview' },
  { label: 'Selected', value: 'selected' },
  { label: 'Offer Released', value: 'offer_released' },
  { label: 'Offer Accepted', value: 'offer_accepted' },
  { label: 'Onboarding', value: 'onboarding' },
  { label: 'Active', value: 'active' },
  { label: 'Probation', value: 'probation' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Transferred', value: 'transferred' },
  { label: 'Promoted', value: 'promoted' },
  { label: 'On Leave', value: 'on_leave' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Resigned', value: 'resigned' },
  { label: 'Retired', value: 'retired' },
  { label: 'Terminated', value: 'terminated' },
  { label: 'Alumni', value: 'alumni' },
]

export const EMPLOYMENT_TYPE_OPTIONS = [
  { label: 'Permanent', value: 'permanent' },
  { label: 'Contract', value: 'contract' },
  { label: 'Temporary', value: 'temporary' },
  { label: 'Consultant', value: 'consultant' },
  { label: 'Intern', value: 'intern' },
  { label: 'Visiting Faculty', value: 'visiting_faculty' },
  { label: 'Volunteer', value: 'volunteer' },
]

export const STAFF_ROLE_OPTIONS = SCHOOL_STAFF_ROLES.filter(
  (r) => !['parent', 'student'].includes(r.value),
)

export const STAFF_SKILL_LEVEL_OPTIONS = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
  { label: 'Expert', value: 'expert' },
]

export const TEACHER_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'On Leave', value: 'on_leave' },
  { label: 'Transferred', value: 'transferred' },
  { label: 'Resigned', value: 'resigned' },
  { label: 'Archived', value: 'archived' },
]

export const ACADEMIC_STAFF_ROLE_OPTIONS = [
  { label: 'Principal', value: 'principal' },
  { label: 'Vice Principal', value: 'vice_principal' },
  { label: 'Academic Director', value: 'academic_director' },
  { label: 'Dean', value: 'dean' },
  { label: 'Academic Coordinator', value: 'academic_coordinator' },
  { label: 'Head Of Department', value: 'hod' },
  { label: 'Senior Teacher', value: 'senior_teacher' },
  { label: 'Teacher', value: 'teacher' },
  { label: 'Assistant Teacher', value: 'assistant_teacher' },
  { label: 'Special Educator', value: 'special_educator' },
  { label: 'Lab Instructor', value: 'lab_instructor' },
  { label: 'Sports Coach', value: 'sports_coach' },
  { label: 'Music Teacher', value: 'music_teacher' },
  { label: 'Dance Teacher', value: 'dance_teacher' },
  { label: 'Art Teacher', value: 'art_teacher' },
  { label: 'Librarian', value: 'librarian' },
  { label: 'Counsellor', value: 'counsellor' },
  { label: 'Wellness Officer', value: 'wellness_officer' },
  { label: 'Custom Role', value: 'custom' },
]

export const TEACHER_LEAVE_TYPE_OPTIONS = [
  { label: 'Casual Leave', value: 'casual' },
  { label: 'Sick Leave', value: 'sick' },
  { label: 'Earned Leave', value: 'earned' },
  { label: 'Maternity Leave', value: 'maternity' },
  { label: 'Paternity Leave', value: 'paternity' },
  { label: 'Unpaid Leave', value: 'unpaid' },
  { label: 'Other', value: 'other' },
]

export const PARENT_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Archived', value: 'archived' },
]

export const PARENT_INCOME_RANGE_OPTIONS = [
  { label: 'Below 2 Lakhs', value: 'below_2l' },
  { label: '2–5 Lakhs', value: '2l_5l' },
  { label: '5–10 Lakhs', value: '5l_10l' },
  { label: '10–20 Lakhs', value: '10l_20l' },
  { label: 'Above 20 Lakhs', value: 'above_20l' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
]

export const PARENT_EDUCATION_OPTIONS = [
  { label: 'Primary', value: 'primary' },
  { label: 'Secondary', value: 'secondary' },
  { label: 'Graduate', value: 'graduate' },
  { label: 'Post Graduate', value: 'postgraduate' },
  { label: 'Doctorate', value: 'doctorate' },
  { label: 'Other', value: 'other' },
]

export const PARENT_COMMUNICATION_OPTIONS = [
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'Push Notification', value: 'push' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'All Channels', value: 'all' },
]

export const COMMUNICATION_CATEGORY_OPTIONS = [
  { label: 'Announcement', value: 'announcement' },
  { label: 'Circular', value: 'circular' },
  { label: 'Notification', value: 'notification' },
]

export const COMMUNICATION_CHANNEL_OPTIONS = [
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Push Notification', value: 'push' },
]

export const COMMUNICATION_AUDIENCE_OPTIONS = [
  { label: 'Students', value: 'students' },
  { label: 'Teachers', value: 'teachers' },
  { label: 'Parents', value: 'parents' },
  { label: 'Staff', value: 'staff' },
  { label: 'All School Users', value: 'all' },
]

export const COMMUNICATION_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Sending', value: 'sending' },
  { label: 'Sent', value: 'sent' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export const COMMUNICATION_TEMPLATE_CATEGORY_OPTIONS = [
  { label: 'General', value: 'general' },
  { label: 'Announcement', value: 'announcement' },
  { label: 'Circular', value: 'circular' },
  { label: 'Fee Reminder', value: 'fee_reminder' },
  { label: 'Event', value: 'event' },
  { label: 'Exam', value: 'exam' },
]

export const SETTINGS_SECTIONS = [
  { key: 'general', label: 'General', icon: 'FiSettings' },
  { key: 'email', label: 'Email', icon: 'FiMail' },
  { key: 'sms', label: 'SMS', icon: 'FiMessageSquare' },
  { key: 'storage', label: 'Storage', icon: 'FiHardDrive' },
  { key: 'jwt', label: 'JWT', icon: 'FiKey' },
  { key: 'security', label: 'Security', icon: 'FiShield' },
  { key: 'theme', label: 'Theme', icon: 'FiDroplet' },
  { key: 'notifications', label: 'Notifications', icon: 'FiBell' },
]

export const SCHOOL_SETTINGS_SECTIONS = [
  { key: 'number_formats', label: 'Number Formats' },
  { key: 'academic', label: 'Academic Year & Session' },
  { key: 'school_timing', label: 'School Timing' },
  { key: 'attendance_rules', label: 'Attendance Rules' },
  { key: 'grading_rules', label: 'Grading Rules' },
  { key: 'promotion_rules', label: 'Promotion Rules' },
  { key: 'fee_settings', label: 'Fee Settings' },
  { key: 'notification_settings', label: 'Notification Settings' },
  { key: 'email_settings', label: 'Email Settings' },
  { key: 'sms_settings', label: 'SMS Settings' },
  { key: 'whatsapp_settings', label: 'WhatsApp Settings' },
  { key: 'document_settings', label: 'Document Settings' },
]

export const SCHOOL_SETTINGS_FIELDS = {
  number_formats: [
    { key: 'admission_number_format', label: 'Admission Number Format', help: 'Tokens: {SCHOOL_CODE}, {YEAR}, {SEQ:4}' },
    { key: 'student_id_format', label: 'Student ID Format' },
    { key: 'employee_id_format', label: 'Employee ID Format' },
    { key: 'receipt_number_format', label: 'Receipt Number Format' },
    { key: 'certificate_number_format', label: 'Certificate Number Format' },
    { key: 'auto_increment', label: 'Auto Increment', type: 'boolean' },
    { key: 'reset_sequence_yearly', label: 'Reset Sequence Yearly', type: 'boolean' },
  ],
  academic: [
    { key: 'current_academic_year_id', label: 'Current Academic Year' },
    { key: 'current_session', label: 'Current Session', placeholder: '2026-27' },
    { key: 'session_start_month', label: 'Session Start Month', type: 'number' },
    { key: 'terms_per_year', label: 'Terms Per Year', type: 'number' },
    { key: 'default_grading_term', label: 'Default Grading Term' },
  ],
  school_timing: [
    { key: 'school_start_time', label: 'School Start Time', placeholder: '08:00' },
    { key: 'school_end_time', label: 'School End Time', placeholder: '15:00' },
    { key: 'period_duration_minutes', label: 'Period Duration (minutes)', type: 'number' },
    { key: 'late_mark_after_minutes', label: 'Late Mark After (minutes)', type: 'number' },
    { key: 'assembly_start_time', label: 'Assembly Start Time' },
    { key: 'lunch_start_time', label: 'Lunch Start Time' },
    { key: 'lunch_duration_minutes', label: 'Lunch Duration (minutes)', type: 'number' },
  ],
  attendance_rules: [
    { key: 'minimum_attendance_percent', label: 'Minimum Attendance %', type: 'number' },
    { key: 'half_day_threshold_minutes', label: 'Half Day Threshold (min)', type: 'number' },
    { key: 'mark_absent_after_minutes', label: 'Mark Absent After (min)', type: 'number' },
    { key: 'low_attendance_threshold_percent', label: 'Low Attendance Alert %', type: 'number' },
    { key: 'allow_parent_leave_request', label: 'Allow Parent Leave Request', type: 'boolean' },
    { key: 'auto_notify_low_attendance', label: 'Auto Notify Low Attendance', type: 'boolean' },
    { key: 'student_biometric_required', label: 'Student Biometric Required', type: 'boolean' },
    { key: 'staff_biometric_required', label: 'Staff Biometric Required', type: 'boolean' },
  ],
  grading_rules: [
    { key: 'grading_system', label: 'Grading System', placeholder: 'percentage / gpa / letter' },
    { key: 'passing_percentage', label: 'Passing Percentage', type: 'number' },
    { key: 'max_marks_default', label: 'Default Max Marks', type: 'number' },
    { key: 'round_off_decimals', label: 'Round Off Decimals', type: 'number' },
    { key: 'grade_scale_json', label: 'Grade Scale (JSON)', fullWidth: true },
    { key: 'allow_revaluation', label: 'Allow Revaluation', type: 'boolean' },
  ],
  promotion_rules: [
    { key: 'auto_promote_on_pass', label: 'Auto Promote On Pass', type: 'boolean' },
    { key: 'require_attendance_for_promotion', label: 'Require Attendance For Promotion', type: 'boolean' },
    { key: 'minimum_attendance_for_promotion', label: 'Min Attendance For Promotion %', type: 'number' },
    { key: 'allow_manual_promotion', label: 'Allow Manual Promotion', type: 'boolean' },
    { key: 'promotion_requires_fee_clearance', label: 'Promotion Requires Fee Clearance', type: 'boolean' },
  ],
  fee_settings: [
    { key: 'currency', label: 'Currency' },
    { key: 'currency_symbol', label: 'Currency Symbol' },
    { key: 'fee_due_day', label: 'Fee Due Day of Month', type: 'number' },
    { key: 'late_fee_percent', label: 'Late Fee %', type: 'number' },
    { key: 'grace_period_days', label: 'Grace Period (days)', type: 'number' },
    { key: 'late_fee_enabled', label: 'Late Fee Enabled', type: 'boolean' },
    { key: 'allow_partial_payment', label: 'Allow Partial Payment', type: 'boolean' },
    { key: 'generate_receipt_on_payment', label: 'Generate Receipt On Payment', type: 'boolean' },
  ],
  notification_settings: [
    { key: 'email_enabled', label: 'Email Enabled', type: 'boolean' },
    { key: 'sms_enabled', label: 'SMS Enabled', type: 'boolean' },
    { key: 'push_enabled', label: 'Push Enabled', type: 'boolean' },
    { key: 'whatsapp_enabled', label: 'WhatsApp Enabled', type: 'boolean' },
    { key: 'notify_on_admission', label: 'Notify On Admission', type: 'boolean' },
    { key: 'notify_on_fee_due', label: 'Notify On Fee Due', type: 'boolean' },
    { key: 'notify_on_attendance', label: 'Notify On Attendance', type: 'boolean' },
    { key: 'notify_on_exam_results', label: 'Notify On Exam Results', type: 'boolean' },
    { key: 'digest_frequency', label: 'Digest Frequency', placeholder: 'daily / weekly' },
  ],
  email_settings: [
    { key: 'use_platform_defaults', label: 'Use Platform Email Defaults', type: 'boolean' },
    { key: 'from_name', label: 'From Name' },
    { key: 'from_email', label: 'From Email' },
    { key: 'reply_to', label: 'Reply To' },
    { key: 'footer_text', label: 'Footer Text', fullWidth: true },
  ],
  sms_settings: [
    { key: 'use_platform_defaults', label: 'Use Platform SMS Defaults', type: 'boolean' },
    { key: 'sender_id', label: 'Sender ID' },
    { key: 'dlt_template_id', label: 'DLT Template ID' },
  ],
  whatsapp_settings: [
    { key: 'enabled', label: 'WhatsApp Enabled', type: 'boolean' },
    { key: 'use_platform_defaults', label: 'Use Platform Defaults', type: 'boolean' },
    { key: 'business_number', label: 'Business Number' },
    { key: 'api_key', label: 'API Key', type: 'password' },
    { key: 'template_namespace', label: 'Template Namespace' },
  ],
  document_settings: [
    { key: 'max_upload_size_mb', label: 'Max Upload Size (MB)', type: 'number' },
    { key: 'allowed_extensions', label: 'Allowed Extensions', placeholder: 'pdf,jpg,png' },
    { key: 'retention_days', label: 'Retention Days', type: 'number' },
    { key: 'student_id_card_template', label: 'ID Card Template' },
    { key: 'require_document_verification', label: 'Require Document Verification', type: 'boolean' },
    { key: 'watermark_enabled', label: 'Watermark Enabled', type: 'boolean' },
  ],
}
