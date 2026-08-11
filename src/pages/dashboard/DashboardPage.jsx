import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { dashboardService } from '@/api/services'
import { unwrapData } from '@/api/client'
import { Card, PageHeader } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/utils/format'
import SchoolDashboardView from '@/pages/dashboard/SchoolDashboardView'
import {
  ClayInsightBanner,
  ClayStatGrid,
  ClayBarChartPanel,
  ClayDonutPanel,
  ClayLineChartPanel,
  ClayRecentList,
  ClayAnalyticsSection,
  formatStatValue,
  mapGrowthChart,
  mapDistribution,
  FiBriefcase,
  FiBook,
  FiUsers,
  FiFileText,
} from '@/components/dashboard/clay/ClayWidgets'

function SuperAdminDashboardView() {
  const { user } = useAuth()
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['dashboard', 'super-admin'],
    queryFn: () => dashboardService.superAdmin({ limit: 10, months: 6 }),
    refetchInterval: 60000,
    staleTime: 60_000,
    retry: 1,
    throwOnError: false,
  })

  const dashboard = unwrapData(data) || {}
  const statistics = dashboard.statistics || {}
  const charts = dashboard.charts || {}
  const recentActivity = dashboard.live_activities || dashboard.recent_activity || []
  const recentOrgs = dashboard.recent_organizations || []
  const showDashboardLoading = isLoading && !data

  const userName =
    user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email

  const stats = [
    {
      title: 'Organizations',
      value: formatNumber(statistics.total_organizations ?? 0),
      icon: FiBriefcase,
      trend: '+8% growth',
    },
    {
      title: 'Schools',
      value: formatNumber(statistics.total_schools ?? 0),
      icon: FiBook,
      trend: '+5% active',
    },
    {
      title: 'Users',
      value: formatNumber(statistics.total_users ?? 0),
      icon: FiUsers,
      trend: `+${statistics.active_users ?? 0} active`,
    },
    {
      title: 'Pending',
      value: formatStatValue(statistics.pending_approval_count ?? 0),
      icon: FiFileText,
    },
  ]

  const recentItems = [
    ...recentOrgs.slice(0, 4).map((org) => ({
      id: org.organization_id || org.id,
      title: org.organization_name || org.name,
      subtitle: org.organization_code || org.code,
      path: `/organizations/${org.organization_id || org.id}`,
    })),
    ...recentActivity.slice(0, 4).map((item) => ({
      id: item.id,
      title: item.title || item.action,
      subtitle: item.description,
      path: null,
    })),
  ]

  const growthData = mapGrowthChart(charts)
  const donutData = mapDistribution(charts)

  const platformBarData = [
    { label: 'Orgs', value: statistics.total_organizations ?? 0 },
    { label: 'Schools', value: statistics.total_schools ?? 0 },
    { label: 'Users', value: statistics.total_users ?? 0 },
    { label: 'Active', value: statistics.active_users ?? 0 },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full">
      <PageHeader title="Dashboard" description="Platform growth, distribution, and live activity" />
      <ClayInsightBanner
        userName={userName}
        message="Welcome back — here is your latest overview"
      />

      <div className={cn(showDashboardLoading && 'animate-pulse opacity-70')}>
        <ClayStatGrid stats={stats} />

        <ClayAnalyticsSection title="Analytics">
          <div className="lms-grid-charts">
            <ClayBarChartPanel
              title="Platform Snapshot"
              data={platformBarData.length ? platformBarData : growthData}
            />
            <ClayDonutPanel title="User Distribution" data={donutData} />
            <ClayLineChartPanel title="Growth Trend" data={growthData} />
          </div>
        </ClayAnalyticsSection>

        <ClayRecentList title="Recent Activity" items={recentItems} emptyMessage="No data found" />
      </div>

      {isFetching && data ? (
        <p className="text-center text-xs text-muted-foreground">Refreshing dashboard…</p>
      ) : null}
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
