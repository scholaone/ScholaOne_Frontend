import { lazy, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { dashboardService } from '@/api/services'
import { unwrapData } from '@/api/client'
import { formatNumber } from '@/utils/format'
import {
  ClayInsightBanner,
  ClayStatGrid,
  formatStatValue,
  FiUsers,
  FiBriefcase,
  FiClipboard,
  FiLayers,
} from '@/components/dashboard/clay/ClayWidgets'
import '@/styles/dashboard-clay.css'

const SchoolDashboardExtras = lazy(() => import('@/pages/dashboard/SchoolDashboardExtras'))

export default function SchoolDashboardView() {
  const { user } = useAuth()
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['dashboard', 'school-admin', 'summary'],
    queryFn: async () => {
      try {
        return await dashboardService.schoolAdminSummary()
      } catch (error) {
        if (error?.response?.status !== 404) throw error
        const full = await dashboardService.schoolAdmin({ limit: 10 })
        const payload = full?.data ?? full
        return {
          school: payload?.school ?? {},
          statistics: payload?.statistics ?? {},
          generated_at: payload?.generated_at,
        }
      }
    },
    staleTime: 90_000,
    retry: 0,
    refetchInterval: (query) => (query.state.data ? 120_000 : false),
    throwOnError: false,
  })

  const dashboard = unwrapData(data) || {}
  const school = dashboard.school || {}
  const statistics = dashboard.statistics || {}

  const userName =
    user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email

  const schoolLabel = user?.school_name
    ? `${user.school_name} — enrollment overview`
    : school.school_name
      ? `${school.school_name} — enrollment overview`
      : 'School enrollment overview'

  const stats = [
    {
      title: 'Students',
      value: formatNumber(statistics.total_students ?? 0),
      icon: FiUsers,
      trend: statistics.admissions_this_month ? `+${statistics.admissions_this_month} this month` : null,
    },
    {
      title: 'Teachers',
      value: formatNumber(statistics.total_teachers ?? 0),
      icon: FiBriefcase,
    },
    {
      title: 'Classes',
      value: formatStatValue(statistics.total_classes ?? 0),
      icon: FiLayers,
    },
    {
      title: 'Admissions',
      value: formatNumber(statistics.pending_admissions ?? statistics.admissions_this_month ?? 0),
      icon: FiClipboard,
      trend: statistics.admissions_today ? `+${statistics.admissions_today} today` : null,
    },
  ]

  return (
    <div className="clay-app w-full min-w-0 max-w-full pb-4">
      <ClayInsightBanner userName={userName} message={schoolLabel} />

      <ClayStatGrid stats={stats} loading={isLoading && !data} />

      {isFetching && data ? (
        <p className="text-center text-xs text-muted-foreground">Refreshing summary…</p>
      ) : null}

      <Suspense fallback={null}>
        <SchoolDashboardExtras />
      </Suspense>
    </div>
  )
}
