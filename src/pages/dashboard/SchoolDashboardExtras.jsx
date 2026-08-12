import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/api/services'
import { unwrapData } from '@/api/client'
import DashboardChartSection from '@/components/dashboard/clay/DashboardChartSection'
import { ClayRecentList, mapSchoolEnrollment } from '@/components/dashboard/clay/ClayWidgets'

const DEFER_MS = 600

export default function SchoolDashboardExtras() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setEnabled(true), DEFER_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const { data } = useQuery({
    queryKey: ['dashboard', 'school-admin', 'full'],
    queryFn: () => dashboardService.schoolAdmin({ limit: 10 }),
    enabled,
    staleTime: 90_000,
    retry: 0,
    throwOnError: false,
  })

  if (!enabled || !data) return null

  const dashboard = unwrapData(data) || {}
  const statistics = dashboard.statistics || {}
  const recentActivities = dashboard.recent_activities || []
  const recentAdmissions = dashboard.recent_admissions || []

  const barData = mapSchoolEnrollment(statistics)
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
    <div className="space-y-6">
      <DashboardChartSection
        barTitle="Enrollment by Role"
        barData={barData}
        donutTitle="Population Mix"
        donutData={barData}
        lineTitle="Headcount Summary"
        lineData={lineData}
      />
      <ClayRecentList title="Recent Activity" items={recentItems} emptyMessage="No data found" />
    </div>
  )
}
