import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { dashboardService } from '@/api/services'
import { unwrapData } from '@/api/client'
import { getPostLoginPath, isTeacherPortalUser } from '@/utils/authRoles'
import DashboardNotificationsPanel from '@/components/notifications/DashboardNotificationsPanel'
import {
  TeacherActivitiesPanel,
  TeacherCalendarPanel,
  TeacherPerformancePanel,
  TeacherQuickAccessPanel,
  TeacherStatCards,
  TeacherTopScorersPanel,
} from '@/components/dashboard/teacher/TeacherDashboardPanels'
import '@/styles/teacher-dashboard.css'

export default function TeacherDashboardView() {
  const { user } = useAuth()
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['dashboard', 'teacher', 'summary'],
    queryFn: () => dashboardService.teacherSummary(),
    staleTime: 90_000,
    retry: 0,
    enabled: isTeacherPortalUser(user),
    refetchInterval: (query) => (query.state.data ? 120_000 : false),
    throwOnError: false,
  })

  if (!isTeacherPortalUser(user)) {
    return <Navigate to={getPostLoginPath(user)} replace />
  }

  const dashboard = unwrapData(data) || {}
  const profile = dashboard.profile || {}
  const statistics = dashboard.statistics || {}
  const quickLinks = dashboard.quick_links || []
  const classPerformance = dashboard.class_performance || []
  const recentActivities = dashboard.recent_activities || []
  const topScorers = dashboard.top_scorers || []

  const userName =
    profile.full_name
    || user?.full_name
    || `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
    || user?.email

  const subtitle = [profile.designation, profile.department, profile.school_name]
    .filter(Boolean)
    .join(' · ')

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="teacher-dash w-full min-w-0 max-w-full pb-4">
      <header className="teacher-dash__welcome">
        <div>
          <h1>Welcome, {userName?.split(' ')[0] || 'Teacher'}</h1>
          <p>{subtitle || 'Your teaching dashboard at a glance'}</p>
        </div>
        <p className="text-sm text-[var(--td-muted)]">{todayLabel}</p>
      </header>

      <TeacherStatCards statistics={statistics} loading={isLoading && !data} />

      {isFetching && data ? (
        <p className="mb-4 text-center text-xs text-[var(--td-muted)]">Refreshing dashboard…</p>
      ) : null}

      <div className="teacher-dash__grid">
        <div className="space-y-5">
          <DashboardNotificationsPanel title="Notifications" variant="teacher" />
          <TeacherCalendarPanel enabled={isTeacherPortalUser(user)} />
          <TeacherActivitiesPanel activities={recentActivities} quickLinks={quickLinks} />
        </div>

        <div className="space-y-5">
          <TeacherPerformancePanel data={classPerformance} />
          <TeacherTopScorersPanel scorers={topScorers} schoolName={profile.school_name} />
        </div>
      </div>

      <TeacherQuickAccessPanel links={quickLinks} />
    </div>
  )
}
