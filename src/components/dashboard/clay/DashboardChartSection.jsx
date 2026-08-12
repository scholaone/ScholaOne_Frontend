import { lazy, Suspense } from 'react'
import { ClayAnalyticsSection, ClayChartSkeletonGrid } from '@/components/dashboard/clay/ClayWidgets'

const LazyClayCharts = lazy(() =>
  import('@/components/dashboard/clay/ClayChartPanels').then((module) => ({
    default: function DashboardChartRow({ barTitle, barData, donutTitle, donutData, lineTitle, lineData }) {
      const { ClayBarChartPanel, ClayDonutPanel, ClayLineChartPanel } = module
      return (
        <div className="lms-grid-charts">
          <ClayBarChartPanel title={barTitle} data={barData} />
          <ClayDonutPanel title={donutTitle} data={donutData} />
          <ClayLineChartPanel title={lineTitle} data={lineData} />
        </div>
      )
    },
  })),
)

export default function DashboardChartSection({
  title = 'Analytics',
  barTitle,
  barData,
  donutTitle,
  donutData,
  lineTitle,
  lineData,
}) {
  return (
    <ClayAnalyticsSection title={title}>
      <Suspense fallback={<ClayChartSkeletonGrid />}>
        <LazyClayCharts
          barTitle={barTitle}
          barData={barData}
          donutTitle={donutTitle}
          donutData={donutData}
          lineTitle={lineTitle}
          lineData={lineData}
        />
      </Suspense>
    </ClayAnalyticsSection>
  )
}
