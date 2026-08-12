import {
  BarChart,
  Bar,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  CHART_SERIES_COLORS,
  Chart3DDefs,
  Bar3DShape,
  Dot3DShape,
  ActiveDot3DShape,
} from '@/components/dashboard/clay/chart3d'
import {
  CHART_THEME,
  chartTooltipStyle,
  chartTooltipWrapperStyle,
  chartTickStyle,
  getChartColor,
} from '@/utils/chartTheme'

const CHART_COLORS = CHART_SERIES_COLORS
const CHART_TICK = chartTickStyle
const CHART_GRID = CHART_THEME.grid

export function ClayBarChartPanel({ title, data = [], dataKey = 'value', labelKey = 'label' }) {
  return (
    <div className="clay-app clay-card clay-card-white clay-chart-panel h-full min-w-0 p-5">
      <h3 className="chart-panel-title mb-3 flex items-center">
        <span className="chart-panel-accent" aria-hidden />
        {title}
      </h3>
      {data.length === 0 ? (
        <p className="py-14 text-center text-sm text-[var(--clay-primary-soft)]">No data found</p>
      ) : (
        <div className="chart-3d-stage">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} barCategoryGap="22%" margin={{ top: 28, right: 16, left: 0, bottom: 0 }}>
              <Chart3DDefs />
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey={labelKey} tick={CHART_TICK} tickLine={false} axisLine={false} />
              <YAxis tick={CHART_TICK} tickLine={false} axisLine={false} />
              <Bar dataKey={dataKey} shape={(props) => <Bar3DShape {...props} />} />
              <Tooltip
                contentStyle={chartTooltipStyle}
                wrapperStyle={chartTooltipWrapperStyle}
                cursor={{ fill: CHART_THEME.cursor }}
                offset={12}
                allowEscapeViewBox={{ x: false, y: true }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export function ClayLineChartPanel({ title, data = [], dataKey = 'value', labelKey = 'label' }) {
  return (
    <div className="clay-app clay-card clay-card-white clay-chart-panel h-full min-w-0 p-5">
      <h3 className="chart-panel-title mb-3 flex items-center">
        <span className="chart-panel-accent" aria-hidden />
        {title}
      </h3>
      {data.length === 0 ? (
        <p className="py-14 text-center text-sm text-[var(--clay-primary-soft)]">No data found</p>
      ) : (
        <div className="chart-3d-stage">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 28, right: 16, left: 0, bottom: 0 }}>
              <Chart3DDefs />
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey={labelKey} tick={CHART_TICK} tickLine={false} axisLine={false} />
              <YAxis tick={CHART_TICK} tickLine={false} axisLine={false} />
              <Area type="monotone" dataKey={dataKey} stroke="none" fill="url(#line3d-area-grad)" fillOpacity={1} />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="url(#line3d-stroke-grad)"
                strokeWidth={4}
                dot={(props) => <Dot3DShape {...props} />}
                activeDot={(props) => <ActiveDot3DShape {...props} />}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                wrapperStyle={chartTooltipWrapperStyle}
                offset={12}
                allowEscapeViewBox={{ x: false, y: true }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export function ClayDonutPanel({ title, data = [] }) {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0) || 1

  return (
    <div className="clay-app clay-card clay-card-white clay-chart-panel h-full min-w-0 p-5">
      <h3 className="chart-panel-title mb-3 flex items-center">
        <span className="chart-panel-accent" aria-hidden />
        {title}
      </h3>
      {data.length === 0 ? (
        <p className="py-14 text-center text-sm text-[var(--clay-primary-soft)]">No data found</p>
      ) : (
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <div className="chart-donut-3d relative w-full">
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Chart3DDefs />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={3}
                  stroke={CHART_THEME.donutStroke}
                  strokeWidth={CHART_THEME.donutStrokeWidth}
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={`url(#pie3d-grad-${index % CHART_COLORS.length})`} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  wrapperStyle={chartTooltipWrapperStyle}
                  offset={12}
                  allowEscapeViewBox={{ x: true, y: true }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-donut-hub pointer-events-none absolute inset-0 flex flex-col items-center justify-center" aria-hidden>
              <span className="text-lg font-bold text-[var(--clay-text-sharp)]">
                {total > 999 ? `${Math.round(total / 1000)}k` : total}
              </span>
              <small className="text-[10px] font-bold uppercase tracking-wide text-[var(--clay-primary-soft)]">Total</small>
            </div>
          </div>
          <div className="w-full space-y-2 md:w-36">
            {data.map((item, i) => (
              <div key={item.label} className="clay-legend-3d flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-[var(--clay-text-sharp)]">
                  <span className="clay-legend-swatch h-3 w-3 rounded-sm" style={{ background: getChartColor(i) }} />
                  {item.label}
                </span>
                <span className="font-bold text-[var(--clay-text-sharp)]">
                  {Math.round((item.value / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
