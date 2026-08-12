import { Link, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiBookOpen, FiCheckCircle, FiClipboard, FiTrendingUp } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'
import { dashboardService } from '@/api/services'
import { unwrapData } from '@/api/client'
import { getPostLoginPath, isStudentPortalUser } from '@/utils/authRoles'
import { Card, PageHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import {
  ClayInsightBanner,
  ClayStatGrid,
  formatStatValue,
} from '@/components/dashboard/clay/ClayWidgets'
import '@/styles/dashboard-clay.css'

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
  const pendingAssignments = dashboard.pending_assignments || []
  const quickLinks = dashboard.quick_links || []

  const userName =
    profile.full_name
    || user?.full_name
    || `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
    || user?.email

  const classLabel = [profile.class_name, profile.section_name].filter(Boolean).join(' · ')

  const stats = [
    {
      title: 'Courses',
      value: formatStatValue(statistics.courses_enrolled ?? 0),
      icon: FiBookOpen,
    },
    {
      title: 'Pending tasks',
      value: formatStatValue(statistics.pending_tasks ?? 0),
      icon: FiClipboard,
    },
    {
      title: 'Progress',
      value: `${statistics.avg_progress ?? 0}%`,
      icon: FiTrendingUp,
    },
    {
      title: 'Attendance',
      value: statistics.attendance_percent != null ? `${statistics.attendance_percent}%` : '—',
      icon: FiCheckCircle,
    },
  ]

  return (
    <div className="clay-app w-full min-w-0 max-w-full space-y-6 pb-4">
      <PageHeader title="Student Dashboard" description="Your classes, tasks, and progress at a glance" />
      <ClayInsightBanner
        userName={userName}
        message={
          classLabel
            ? `${classLabel}${profile.academic_year ? ` · ${profile.academic_year}` : ''}`
            : profile.school_name || 'Welcome to your student portal'
        }
      />

      <ClayStatGrid stats={stats} loading={isLoading && !data} />

      {isFetching && data ? (
        <p className="text-center text-xs text-muted-foreground">Refreshing summary…</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-text">Pending assignments</h3>
          {pendingAssignments.length ? (
            <ul className="space-y-2">
              {pendingAssignments.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-slate-50/60 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-text">{item.title}</span>
                  <span className="text-xs text-muted">{item.due || 'No due date'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No pending assignments right now.</p>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-text">Quick links</h3>
          <div className="flex flex-wrap gap-2">
            {quickLinks.map((link) => (
              <Link key={link.key} to={link.path}>
                <Button variant="secondary" size="sm">
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
