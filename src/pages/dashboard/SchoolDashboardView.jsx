import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { dashboardService } from '@/api/services'
import { unwrapData } from '@/api/client'
import { PageLoader } from '@/components/ui/Feedback'
import { formatNumber } from '@/utils/format'
import {
  ClayInsightBanner,
  ClayStatGrid,
  ClayBarChartPanel,
  ClayDonutPanel,
  ClayLineChartPanel,
  ClayRecentList,
  ClayAnalyticsSection,
  formatStatValue,
  mapSchoolEnrollment,
  FiUsers,
  FiBriefcase,
  FiClipboard,
  FiLayers,
} from '@/components/dashboard/clay/ClayWidgets'
import '@/styles/dashboard-clay.css'

export default function SchoolDashboardView() {
  const { user } = useAuth()
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['dashboard', 'school-admin'],
    queryFn: () => dashboardService.schoolAdmin({ limit: 10 }),
    refetchInterval: 60000,
    staleTime: 60_000,
    retry: 1,
    throwOnError: false,
  })

  const dashboard = unwrapData(data) || {}
  const school = dashboard.school || {}
  const statistics = dashboard.statistics || {}
  const recentActivities = dashboard.recent_activities || []
  const recentAdmissions = dashboard.recent_admissions || []
  const showDashboardLoading = isLoading && !data

  const userName =
    user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email

  const schoolLabel = school.school_name
    ? `${school.school_name} — enrollment and activity overview`
    : 'School enrollment and activity overview'

  const stats = [
    {
      title: 'Students',
      value: formatNumber(statistics.total_students ?? 0),
      icon: FiUsers,
      trend: statistics.admissions_this_month ? `+${statistics.admissions_this_month} this month` : null,
    },
    {
      title: 'Staff',
      value: formatNumber((statistics.total_staff ?? 0) + (statistics.total_teachers ?? 0)),
      icon: FiBriefcase,
    },
    {
      title: 'Classes',
      value: formatStatValue(statistics.total_classes ?? statistics.total_class_sections ?? 0),
      icon: FiLayers,
      hint: statistics.total_classes == null && statistics.total_class_sections == null ? 'Set up academics' : null,
    },
    {
      title: 'Admissions',
      value: formatNumber(statistics.pending_admissions ?? statistics.admissions_this_month ?? 0),
      icon: FiClipboard,
      trend: statistics.admissions_today ? `+${statistics.admissions_today} today` : null,
    },
  ]

  const barData = mapSchoolEnrollment(statistics)
  // Only show chart series that have values; empty → "No data yet" in chart panels
  const lineData = [
    { label: 'Students', value: statistics.total_students ?? 0 },
    { label: 'Teachers', value: statistics.total_teachers ?? 0 },
    { label: 'Staff', value: statistics.total_staff ?? 0 },
    { label: 'Parents', value: statistics.total_parents ?? 0 },
    { label: 'Pending', value: statistics.pending_admissions ?? 0 },
  ].filter((d) => d.value > 0)

  const recentItems = [
    ...recentActivities.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.description,
      path: null,
    })),
    ...recentAdmissions.map((item) => ({
      id: item.id || item.admission_id,
      title: item.title || item.student_name || 'New admission',
      subtitle: 'Admissions',
      path: '/admissions',
    })),
  ]

  return (
    <div className="clay-app w-full min-w-0 max-w-full pb-4">
      <ClayInsightBanner userName={userName} message={schoolLabel} />

      {showDashboardLoading ? (
        <div className="flex items-center justify-center py-10">
          <PageLoader />
        </div>
      ) : (
        <>
      <ClayStatGrid stats={stats} />

      <ClayAnalyticsSection title="Analytics">
        <div className="lms-grid-charts">
          <ClayBarChartPanel title="Enrollment by Role" data={barData} />
          <ClayDonutPanel title="Population Mix" data={barData} />
          <ClayLineChartPanel title="Headcount Summary" data={lineData} />
        </div>
      </ClayAnalyticsSection>

      <ClayRecentList
        title="Recent Activity"
        items={recentItems}
        emptyMessage="No data found"
      />
        </>
      )}

      {isFetching && data ? (
        <p className="text-center text-xs text-muted-foreground">Refreshing dashboard…</p>
      ) : null}
    </div>
  )
}
