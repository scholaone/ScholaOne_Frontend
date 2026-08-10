import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute, { PublicRoute } from './ProtectedRoute'
import LandingPage from '@/website/LandingPage'
import DashboardLayout from '@/layouts/DashboardLayout'
import NotFoundPage from '@/pages/NotFoundPage'

import LoginPage from '@/pages/auth/LoginPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ChangePasswordPage from '@/pages/auth/ChangePasswordPage'
import ProfilePage from '@/pages/auth/ProfilePage'
import DashboardPage from '@/pages/dashboard/DashboardPage'

import OrganizationList from '@/pages/organizations/OrganizationList'
import OrganizationForm from '@/pages/organizations/OrganizationForm'
import OrganizationDetail from '@/pages/organizations/OrganizationDetail'

import SchoolList from '@/pages/schools/SchoolList'
import SchoolForm from '@/pages/schools/SchoolForm'
import SchoolDetail from '@/pages/schools/SchoolDetail'
import SchoolProfilePage from '@/pages/schools/SchoolProfilePage'

import SchoolUserList from '@/pages/school-users/SchoolUserList'
import SchoolUserForm from '@/pages/school-users/SchoolUserForm'
import SchoolUserDetail from '@/pages/school-users/SchoolUserDetail'

import StudentList from '@/pages/students/StudentList'
import StudentForm from '@/pages/students/StudentForm'
import StudentDetail from '@/pages/students/StudentDetail'
import StudentsHubPage from '@/pages/students/StudentsHubPage'
import ClassWiseStudentsReportPage from '@/pages/students/ClassWiseStudentsReportPage'
import StudentShufflePage from '@/pages/students/StudentShufflePage'
import TeacherList from '@/pages/teachers/TeacherList'
import TeacherForm from '@/pages/teachers/TeacherForm'
import TeacherDetail from '@/pages/teachers/TeacherDetail'
import TeachersHubPage from '@/pages/teachers/TeachersHubPage'
import ParentList from '@/pages/parents/ParentList'
import ParentForm from '@/pages/parents/ParentForm'
import ParentDetail from '@/pages/parents/ParentDetail'
import ParentsHubPage from '@/pages/parents/ParentsHubPage'
import HouseholdsPage from '@/pages/parents/HouseholdsPage'
import StaffList from '@/pages/staff/StaffList'
import StaffForm from '@/pages/staff/StaffForm'
import StaffDetail from '@/pages/staff/StaffDetail'
import StaffHubPage from '@/pages/staff/StaffHubPage'
import CommunicationsHubPage from '@/pages/communications/CommunicationsHubPage'
import CommunicationTemplateList from '@/pages/communications/CommunicationTemplateList'
import CommunicationTemplateForm from '@/pages/communications/CommunicationTemplateForm'
import CommunicationMessageList from '@/pages/communications/CommunicationMessageList'
import CommunicationMessageForm from '@/pages/communications/CommunicationMessageForm'
import CommunicationMessageDetail from '@/pages/communications/CommunicationMessageDetail'

import AdmissionsHubPage from '@/pages/admissions/AdmissionsHubPage'
import AdmissionLeadForm from '@/pages/admissions/AdmissionLeadForm'
import AdmissionApplicationForm from '@/pages/admissions/AdmissionApplicationForm'
import AdmissionApplicationDetail from '@/pages/admissions/AdmissionApplicationDetail'
import AdmissionSetupPage from '@/features/admissions/pages/AdmissionSetupPage'
import {
  EnquiriesPage,
  PipelinePage,
  FollowUpsPage,
  InternalApplicationsPage,
  ExternalApplicationsPage,
  ConfirmedApplicationsPage,
  ConversionPage,
  AdmissionsLeadsRedirect,
  AdmissionsApplicationsRedirect,
} from '@/pages/admissions/AdmissionsLmsPages'
import {
  TransportPage,
} from '@/pages/school-ops/SchoolOpsPages'
import AnnouncementsPage from '@/pages/announcements/AnnouncementsPage'
import LibraryPage from '@/pages/library/LibraryPage'
import LibraryBookForm from '@/pages/library/LibraryBookForm'
import AttendanceHubPage, { AttendanceReportsPage } from '@/pages/attendance/AttendanceHubPage'
import MarkAttendancePage from '@/pages/attendance/MarkAttendancePage'
import TimetableHubPage, {
  TimetableBuilderPage,
  TimetableSubstitutionsPage,
} from '@/pages/timetable/TimetableHubPage'
import FeesHubPage from '@/pages/fees/FeesHubPage'
import {
  FeesCollectPage,
  FeesGeneratePage,
  FeesDefaultersPage,
  FeesLedgerPage,
} from '@/pages/fees/FeesOperationsPages'
import { FeeMasterList, FeeMasterForm, FeeMasterDetail, FeeModulePlaceholder } from '@/pages/fees/FeeMasterList'
import ClassWiseFeePaidReportPage from '@/pages/fees/ClassWiseFeePaidReportPage'
import StaffChildrenReportPage from '@/pages/fees/StaffChildrenReportPage'
import ReportsHubPage from '@/pages/reports/ReportsHubPage'
import {
  FeeSettingsPage,
  FeeStructureBuilderPage,
  FeePaymentPlansPage,
  FeeDiscountConcessionPage,
  FeeDailyClosingPage,
  FeeReportsHubPage,
  FeeDailyCollectionReportPage,
  FeeOutstandingReportPage,
  FeeCollectionSummaryPage,
  FeePaymentMethodsReportPage,
  FeeMastersNavPage,
} from '@/pages/fees/FeeEnterprisePages'
import AssessmentsHubPage, {
  AssessmentsMarksPage,
  AssessmentsResultsPage,
} from '@/pages/assessments/AssessmentsHubPage'
import DocumentsHubPage, {
  DocumentDesignerPage,
  DocumentGeneratePage,
  DocumentCertificatesPage,
  DocumentVerifyPage,
} from '@/pages/documents/DocumentsHubPage'
import LmsHubPage, {
  LmsCoursesPage,
  LmsAssignmentsPage,
  LmsLessonPlansPage,
  LmsQuizzesPage,
} from '@/pages/lms/LmsHubPage'

import UserList from '@/pages/users/UserList'
import UserForm from '@/pages/users/UserForm'
import UserDetail from '@/pages/users/UserDetail'

import RoleList from '@/pages/roles/RoleList'
import RoleForm from '@/pages/roles/RoleForm'
import RolePermissions from '@/pages/roles/RolePermissions'

import PermissionList from '@/pages/permissions/PermissionList'
import PermissionForm from '@/pages/permissions/PermissionForm'
import PermissionMatrix from '@/pages/permissions/PermissionMatrix'

import MenuList from '@/pages/menus/MenuList'
import MenuForm from '@/pages/menus/MenuForm'
import ModuleList from '@/pages/modules/ModuleList'
import ModuleForm from '@/pages/modules/ModuleForm'

import MembershipList from '@/pages/memberships/MembershipList'
import MembershipForm from '@/pages/memberships/MembershipForm'
import UserRoleList from '@/pages/user-roles/UserRoleList'
import UserRoleForm from '@/pages/user-roles/UserRoleForm'

import MastersHubPage from '@/pages/masters/MastersHubPage'
import MasterList from '@/pages/masters/MasterList'
import MasterForm from '@/pages/masters/MasterForm'
import {
  SchoolStandardsSetupPage,
  SchoolSectionsSetupPage,
  SchoolClassMapSetupPage,
} from '@/pages/masters/SchoolClassSetupPages'
import SchoolMastersHubPage from '@/pages/school-masters/SchoolMastersHubPage'
import SchoolMasterList from '@/pages/school-masters/SchoolMasterList'
import SchoolMasterForm from '@/pages/school-masters/SchoolMasterForm'

import AcademicsHubPage from '@/pages/academics/AcademicsHubPage'
import AcademicSetupViewPage from '@/pages/academics/AcademicSetupViewPage'
import { AcademicList, AcademicForm } from '@/pages/academics/AcademicList'
import MdmHubPage from '@/pages/mdm/MdmHubPage'

import AuditLogList from '@/pages/audit-logs/AuditLogList'
import AuditLogDetail from '@/pages/audit-logs/AuditLogDetail'

import SettingsPage from '@/pages/settings/SettingsPage'
import SchoolSettingsPage from '@/pages/school-settings/SchoolSettingsPage'
import NotificationsPage from '@/pages/notifications/NotificationsPage'
import ScholaOnePostPage from '@/pages/scholaone-post/ScholaOnePostPage'
import AiHubPage from '@/pages/ai-hub/AiHubPage'
import AiAssistantPage from '@/pages/ai-hub/AiAssistantPage'
import AutomationsPage from '@/pages/ai-hub/AutomationsPage'
import FormBuilderListPage from '@/features/form-builder/pages/FormBuilderListPage'
import FormBuilderNewPage from '@/features/form-builder/pages/FormBuilderNewPage'
import FormDesignerPage from '@/features/form-builder/pages/FormDesignerPage'
import FormPreviewPage from '@/features/form-builder/pages/FormPreviewPage'
import FormResponsesPage from '@/features/form-builder/pages/FormResponsesPage'
import PublicFormPage from '@/features/form-builder/pages/PublicFormPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route path="/f/:slug" element={<PublicFormPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/scholaone-post" element={<ScholaOnePostPage />} />
          <Route path="/edu-nexus-post" element={<Navigate to="/scholaone-post" replace />} />
          <Route path="/ai-hub" element={<AiHubPage />} />
          <Route path="/ai-hub/assistant" element={<AiAssistantPage />} />
          <Route path="/ai-hub/automations" element={<AutomationsPage />} />

          <Route path="/form-builder" element={<FormBuilderListPage />} />
          <Route path="/form-builder/new" element={<FormBuilderNewPage />} />
          <Route path="/form-builder/:id/edit" element={<FormDesignerPage />} />
          <Route path="/form-builder/:id/preview" element={<FormPreviewPage />} />
          <Route path="/form-builder/:id/responses" element={<FormResponsesPage />} />

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />

          <Route path="/organizations" element={<OrganizationList />} />
          <Route path="/organizations/new" element={<OrganizationForm />} />
          <Route path="/organizations/:id" element={<OrganizationDetail />} />
          <Route path="/organizations/:id/edit" element={<OrganizationForm />} />

          <Route path="/schools" element={<SchoolList />} />
          <Route path="/schools/new" element={<SchoolForm />} />
          <Route path="/schools/:id" element={<SchoolDetail />} />
          <Route path="/schools/:id/edit" element={<SchoolForm />} />
          <Route path="/schools/:id/profile" element={<SchoolProfilePage />} />
          <Route path="/school-profile" element={<SchoolProfilePage />} />

          <Route path="/school-settings" element={<SchoolSettingsPage />} />
          <Route path="/school-settings/:section" element={<SchoolSettingsPage />} />

          <Route path="/students" element={<StudentsHubPage />} />
          <Route path="/students/roster" element={<StudentList />} />
          <Route path="/students/reports/class-wise" element={<ClassWiseStudentsReportPage />} />
          <Route path="/students/shuffle" element={<StudentShufflePage />} />
          <Route path="/students/new" element={<StudentForm />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/students/:id/edit" element={<StudentForm />} />

          <Route path="/teachers" element={<TeachersHubPage />} />
          <Route path="/teachers/roster" element={<TeacherList />} />
          <Route path="/teachers/new" element={<TeacherForm />} />
          <Route path="/teachers/:id" element={<TeacherDetail />} />
          <Route path="/teachers/:id/edit" element={<TeacherForm />} />

          <Route path="/parents" element={<ParentsHubPage />} />
          <Route path="/parents/roster" element={<ParentList />} />
          <Route path="/parents/households" element={<HouseholdsPage />} />
          <Route path="/parents/new" element={<ParentForm />} />
          <Route path="/parents/:id" element={<ParentDetail />} />
          <Route path="/parents/:id/edit" element={<ParentForm />} />

          <Route path="/staff" element={<StaffHubPage />} />
          <Route path="/staff/roster" element={<StaffList />} />
          <Route path="/staff/new" element={<StaffForm />} />
          <Route path="/staff/:id" element={<StaffDetail />} />
          <Route path="/staff/:id/edit" element={<StaffForm />} />

          <Route path="/communications" element={<CommunicationsHubPage />} />
          <Route path="/communications/templates" element={<CommunicationTemplateList />} />
          <Route path="/communications/templates/new" element={<CommunicationTemplateForm />} />
          <Route path="/communications/templates/:id/edit" element={<CommunicationTemplateForm />} />
          <Route path="/communications/messages" element={<CommunicationMessageList />} />
          <Route path="/communications/messages/new" element={<CommunicationMessageForm />} />
          <Route path="/communications/messages/:id" element={<CommunicationMessageDetail />} />
          <Route path="/communications/messages/:id/edit" element={<CommunicationMessageForm />} />

          <Route path="/admissions" element={<AdmissionsHubPage />} />
          <Route path="/admissions/setup" element={<AdmissionSetupPage />} />
          <Route path="/admissions/enquiries" element={<EnquiriesPage />} />
          <Route path="/admissions/pipeline" element={<PipelinePage />} />
          <Route path="/admissions/follow-ups" element={<FollowUpsPage />} />
          <Route path="/admissions/applications/internal" element={<InternalApplicationsPage />} />
          <Route path="/admissions/applications/external" element={<ExternalApplicationsPage />} />
          <Route path="/admissions/confirmed" element={<ConfirmedApplicationsPage />} />
          <Route path="/admissions/conversion" element={<ConversionPage />} />
          <Route path="/admissions/leads" element={<AdmissionsLeadsRedirect />} />
          <Route path="/admissions/leads/new" element={<AdmissionLeadForm />} />
          <Route path="/admissions/leads/:id/edit" element={<AdmissionLeadForm />} />
          <Route path="/admissions/applications" element={<AdmissionsApplicationsRedirect />} />
          <Route path="/admissions/applications/new" element={<AdmissionApplicationForm />} />
          <Route path="/admissions/applications/:id" element={<AdmissionApplicationDetail />} />
          <Route path="/admissions/applications/:id/edit" element={<AdmissionApplicationForm />} />

          <Route path="/lms" element={<LmsHubPage />} />
          <Route path="/lms/courses" element={<LmsCoursesPage />} />
          <Route path="/lms/assignments" element={<LmsAssignmentsPage />} />
          <Route path="/lms/lesson-plans" element={<LmsLessonPlansPage />} />
          <Route path="/lms/quizzes" element={<LmsQuizzesPage />} />
          <Route path="/attendance" element={<AttendanceHubPage />} />
          <Route path="/attendance/mark" element={<MarkAttendancePage />} />
          <Route path="/attendance/reports" element={<AttendanceReportsPage />} />
          <Route path="/timetable" element={<TimetableHubPage />} />
          <Route path="/timetable/builder" element={<TimetableBuilderPage />} />
          <Route path="/timetable/substitutions" element={<TimetableSubstitutionsPage />} />
          <Route path="/homework" element={<Navigate to="/lms/assignments?kind=homework" replace />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/examinations" element={<AssessmentsHubPage />} />
          <Route path="/examinations/marks" element={<AssessmentsMarksPage />} />
          <Route path="/examinations/results" element={<AssessmentsResultsPage />} />
          <Route path="/documents" element={<DocumentsHubPage />} />
          <Route path="/documents/designer" element={<DocumentDesignerPage />} />
          <Route path="/documents/generate" element={<DocumentGeneratePage />} />
          <Route path="/documents/certificates" element={<DocumentCertificatesPage />} />
          <Route path="/documents/verify" element={<DocumentVerifyPage />} />
          <Route path="/fees" element={<FeesHubPage />} />
          <Route path="/fees/masters/:entityKey" element={<FeeMasterList />} />
          <Route path="/fees/masters/:entityKey/new" element={<FeeMasterForm />} />
          <Route path="/fees/masters/:entityKey/:id/edit" element={<FeeMasterForm />} />
          <Route path="/fees/masters/:entityKey/:id" element={<FeeMasterDetail />} />
          <Route path="/fees/collect" element={<FeesCollectPage />} />
          <Route path="/fees/ledger" element={<FeesLedgerPage />} />
          <Route path="/fees/generate" element={<FeesGeneratePage />} />
          <Route path="/fees/assign" element={<FeesGeneratePage />} />
          <Route path="/fees/defaulters" element={<FeesDefaultersPage />} />
          <Route path="/fees/masters" element={<FeeMastersNavPage />} />
          <Route path="/fees/structure" element={<FeeStructureBuilderPage />} />
          <Route path="/fees/payment-plans" element={<FeePaymentPlansPage />} />
          <Route path="/fees/discounts" element={<FeeDiscountConcessionPage />} />
          <Route path="/fees/settings" element={<FeeSettingsPage />} />
          <Route path="/fees/daily-closing" element={<FeeDailyClosingPage />} />
          <Route path="/fees/reports" element={<FeeReportsHubPage />} />
          <Route path="/fees/reports/daily-collection" element={<FeeDailyCollectionReportPage />} />
          <Route path="/fees/reports/outstanding" element={<FeeOutstandingReportPage />} />
          <Route path="/fees/reports/collection-summary" element={<FeeCollectionSummaryPage />} />
          <Route path="/fees/reports/payment-methods" element={<FeePaymentMethodsReportPage />} />
          <Route path="/fees/reports/class-wise-paid" element={<ClassWiseFeePaidReportPage />} />
          <Route path="/fees/reports/staff-children" element={<Navigate to="/reports/staff-children" replace />} />
          <Route path="/fees/:moduleKey" element={<FeeModulePlaceholder />} />
          <Route path="/transport" element={<TransportPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/new" element={<LibraryBookForm />} />
          <Route path="/library/:id/edit" element={<LibraryBookForm />} />
          <Route path="/reports" element={<ReportsHubPage />} />
          <Route path="/reports/staff-children" element={<StaffChildrenReportPage />} />

          <Route path="/school-users" element={<SchoolUserList />} />
          <Route path="/school-users/new" element={<SchoolUserForm />} />
          <Route path="/school-users/:id" element={<SchoolUserDetail />} />
          <Route path="/school-users/:id/edit" element={<SchoolUserForm />} />

          <Route path="/users" element={<UserList />} />
          <Route path="/users/new" element={<UserForm />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/users/:id/edit" element={<UserForm />} />

          <Route path="/roles" element={<RoleList />} />
          <Route path="/roles/new" element={<RoleForm />} />
          <Route path="/roles/:id/edit" element={<RoleForm />} />
          <Route path="/roles/:id/permissions" element={<RolePermissions />} />

          <Route path="/permissions" element={<PermissionList />} />
          <Route path="/permissions/new" element={<PermissionForm />} />
          <Route path="/permissions/:id/edit" element={<PermissionForm />} />
          <Route path="/permissions/matrix" element={<PermissionMatrix />} />

          <Route path="/menus" element={<MenuList />} />
          <Route path="/menus/new" element={<MenuForm />} />
          <Route path="/menus/:id/edit" element={<MenuForm />} />

          <Route path="/modules" element={<ModuleList />} />
          <Route path="/modules/new" element={<ModuleForm />} />
          <Route path="/modules/:id/edit" element={<ModuleForm />} />

          <Route path="/memberships" element={<MembershipList />} />
          <Route path="/memberships/new" element={<MembershipForm />} />
          <Route path="/memberships/:id/edit" element={<MembershipForm />} />

          <Route path="/user-roles" element={<UserRoleList />} />
          <Route path="/user-roles/new" element={<UserRoleForm />} />
          <Route path="/user-roles/:id/edit" element={<UserRoleForm />} />

          <Route path="/masters" element={<MastersHubPage />} />
          <Route path="/masters/setup/standards" element={<SchoolStandardsSetupPage />} />
          <Route path="/masters/setup/sections" element={<SchoolSectionsSetupPage />} />
          <Route path="/masters/setup/map" element={<SchoolClassMapSetupPage />} />
          <Route path="/masters/:masterKey" element={<MasterList />} />
          <Route path="/masters/:masterKey/new" element={<MasterForm />} />
          <Route path="/masters/:masterKey/:id/edit" element={<MasterForm />} />

          <Route path="/school-masters" element={<SchoolMastersHubPage />} />
          <Route path="/school-masters/:masterKey" element={<SchoolMasterList />} />
          <Route path="/school-masters/:masterKey/new" element={<SchoolMasterForm />} />
          <Route path="/school-masters/:masterKey/:id/edit" element={<SchoolMasterForm />} />

          <Route path="/academics" element={<AcademicsHubPage />} />
          <Route path="/academics/admission-setup" element={<AcademicSetupViewPage />} />
          <Route path="/academics/:entityKey" element={<AcademicList />} />
          <Route path="/academics/:entityKey/new" element={<AcademicForm />} />
          <Route path="/academics/:entityKey/:id/edit" element={<AcademicForm />} />

          <Route path="/mdm" element={<MdmHubPage />} />

          <Route path="/audit-logs" element={<AuditLogList />} />
          <Route path="/audit-logs/:id" element={<AuditLogDetail />} />

          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute requireSuperAdmin />}>
        <Route element={<DashboardLayout />}>
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/:section" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
