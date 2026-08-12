import { lazy, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { dashboardService } from '@/api/services'
import { unwrapData } from '@/api/client'
import { Card, PageHeader } from '@/components/ui/Card'
import { formatNumber } from '@/utils/format'
import SchoolDashboardView from '@/pages/dashboard/SchoolDashboardView'
import {
  ClayInsightBanner,
  ClayStatGrid,
  formatStatValue,
  FiBriefcase,
  FiBook,
  FiUsers,
  FiFileText,
} from '@/components/dashboard/clay/ClayWidgets'

const SuperAdminDashboardExtras = lazy(() => import('@/pages/dashboard/SuperAdminDashboardExtras'))

function SuperAdminDashboardView() {
  const { user } = useAuth()
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['dashboard', 'super-admin', 'summary'],
    queryFn: async () => {
      try {
        return await dashboardService.superAdminSummary()
      } catch (error) {
        if (error?.response?.status !== 404) throw error
        const full = await dashboardService.superAdmin({ limit: 10, months: 6 })
        const payload = full?.data ?? full
        return { statistics: payload?.statistics ?? {}, generated_at: payload?.generated_at }
      }
    },
    staleTime: 90_000,
    retry: 0,
    refetchInterval: (query) => (query.state.data ? 120_000 : false),
    throwOnError: false,
  })

  const dashboard = unwrapData(data) || {}
  const statistics = dashboard.statistics || {}

  const userName =
    user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email

  const stats = [
    {
      title: 'Organizations',
      value: formatNumber(statistics.total_organizations ?? 0),
      icon: FiBriefcase,
      trend: statistics.active_organizations
        ? `${formatNumber(statistics.active_organizations)} active`
        : null,
    },
    {
      title: 'Schools',
      value: formatNumber(statistics.total_schools ?? 0),
      icon: FiBook,
      trend: statistics.active_schools ? `${formatNumber(statistics.active_schools)} active` : null,
    },
    {
      title: 'Users',
      value: formatNumber(statistics.total_users ?? 0),
      icon: FiUsers,
      trend: statistics.active_users ? `${formatNumber(statistics.active_users)} active` : null,
    },
    {
      title: 'Pending',
      value: formatStatValue(statistics.pending_approval_count ?? 0),
      icon: FiFileText,
    },
  ]

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full">
      <PageHeader title="Dashboard" description="Platform growth, distribution, and live activity" />
      <ClayInsightBanner userName={userName} message="Welcome back — here is your latest overview" />

      <ClayStatGrid stats={stats} loading={isLoading && !data} />

      {isFetching && data ? (
        <p className="text-center text-xs text-muted-foreground">Refreshing summary…</p>
      ) : null}

      <Suspense fallback={null}>
        <SuperAdminDashboardExtras />
      </Suspense>
    </div>
  )
}

function DefaultDashboardView() {
  const { user } = useAuth()
  const userName =
    user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email

  return (
    <div className="space-y-6 w-full">
      <ClayInsightBanner userName={userName} message="Welcome to ScholaOne." />
      <Card>
        <p className="text-sm text-muted-foreground">
          Your account does not have a dashboard for this role yet. Use the sidebar to open modules available to you.
        </p>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  const { isSuperAdmin, isSchoolAdmin } = useAuth()

  if (isSuperAdmin) {
    return <SuperAdminDashboardView />
  }

  if (isSchoolAdmin) {
    return <SchoolDashboardView />
  }

  return <DefaultDashboardView />
}
