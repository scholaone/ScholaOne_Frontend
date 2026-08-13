import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { dashboardService } from '@/api/services'
import { unwrapData } from '@/api/client'
import { getPostLoginPath, isStudentPortalUser } from '@/utils/authRoles'
import {
  StudentAttendanceChartPanel,
  StudentCalendarPanel,
  StudentExamSchedulePanel,
  StudentNoticesPanel,
  StudentStatCards,
  StudentTimetablePanel,
} from '@/components/dashboard/student/StudentDashboardPanels'
import { DashboardWelcomeHeader } from '@/components/dashboard/clay/ClayWidgets'
import '@/styles/teacher-dashboard.css'
import '@/styles/student-dashboard.css'

export default function StudentDashboardView() {
  const { user } = useAuth()
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['dashboard', 'student', 'summary'],
    queryFn: () => dashboardService.studentSummary(),
    staleTime: 90_000,
    retry: 0,
    enabled: isStudentPortalUser(user),
    refetchInterval: (query) => (query.state.data ? 120_000 : false),
    throwOnError: false,
  })

  if (!isStudentPortalUser(user)) {
    return <Navigate to={getPostLoginPath(user)} replace />
  }

  const dashboard = unwrapData(data) || {}
  const profile = dashboard.profile || {}
  const statistics = dashboard.statistics || {}
  const attendanceMonthly = dashboard.attendance_monthly || []
  const timetableToday = dashboard.timetable_today || []
  const examSchedule = dashboard.exam_schedule || []
  const notices = dashboard.notices || []

  const userName =
    profile.full_name
    || user?.full_name
    || `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
    || user?.email

  const classLabel = [profile.class_name, profile.section_name].filter(Boolean).join(' · ')

  return (
    <div className="teacher-dash student-dash w-full min-w-0 max-w-full pb-4">
      <DashboardWelcomeHeader
        userName={userName}
        subtitle={
          classLabel
            ? `${classLabel}${profile.academic_year ? ` · ${profile.academic_year}` : ''}`
            : profile.school_name || 'Your learning dashboard'
        }
        fallbackName="Student"
      />

      <StudentStatCards statistics={statistics} loading={isLoading && !data} />

      {isFetching && data ? (
        <p className="mb-4 text-center text-xs text-[var(--td-muted)]">Refreshing dashboard…</p>
      ) : null}

      <div className="teacher-dash__grid student-dash__grid">
        <div className="space-y-5">
          <StudentAttendanceChartPanel data={attendanceMonthly} loading={isLoading && !data} />
          <StudentExamSchedulePanel exams={examSchedule} />
        </div>

        <div className="space-y-5">
          <StudentCalendarPanel enabled={isStudentPortalUser(user)} />
          <StudentTimetablePanel slots={timetableToday} classLabel={classLabel} />
          <StudentNoticesPanel notices={notices} />
        </div>
      </div>
    </div>
  )
}
