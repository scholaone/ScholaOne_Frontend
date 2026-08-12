import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/api/services'
import { unwrapData } from '@/api/client'
import DashboardChartSection from '@/components/dashboard/clay/DashboardChartSection'
import {
  ClayRecentList,
  mapGrowthChart,
  mapDistribution,
} from '@/components/dashboard/clay/ClayWidgets'

const DEFER_MS = 600

export default function SuperAdminDashboardExtras() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setEnabled(true), DEFER_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const { data } = useQuery({
    queryKey: ['dashboard', 'super-admin', 'full'],
    queryFn: () => dashboardService.superAdmin({ limit: 10, months: 6 }),
    enabled,
    staleTime: 90_000,
    retry: 0,
    throwOnError: false,
  })

  if (!enabled || !data) return null

  const dashboard = unwrapData(data) || {}
  const statistics = dashboard.statistics || {}
  const charts = dashboard.charts || {}
  const recentActivity = dashboard.live_activities || dashboard.recent_activity || []
  const recentOrgs = dashboard.recent_organizations || []

  const growthData = mapGrowthChart(charts)
  const donutData = mapDistribution(charts)
  const platformBarData = [
    { label: 'Orgs', value: statistics.total_organizations ?? 0 },
    { label: 'Schools', value: statistics.total_schools ?? 0 },
    { label: 'Users', value: statistics.total_users ?? 0 },
    { label: 'Active', value: statistics.active_users ?? 0 },
  ].filter((d) => d.value > 0)

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

  return (
    <div className="space-y-6">
      <DashboardChartSection
        barTitle="Platform Snapshot"
        barData={platformBarData.length ? platformBarData : growthData}
        donutTitle="User Distribution"
        donutData={donutData}
        lineTitle="Growth Trend"
        lineData={growthData}
      />
      <ClayRecentList title="Recent Activity" items={recentItems} emptyMessage="No data found" />
    </div>
  )
}
