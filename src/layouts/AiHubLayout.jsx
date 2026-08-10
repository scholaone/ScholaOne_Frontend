import { NavLink } from 'react-router-dom'
import { BRAND_AI_NAME } from '@/config/brand'
import { FiArrowLeft, FiCpu, FiMessageSquare, FiZap } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { cn } from '@/lib/utils'

const NAV = [
  { path: '/ai-hub', label: 'Overview', icon: FiCpu, end: true },
  { path: '/ai-hub/assistant', label: BRAND_AI_NAME, icon: FiMessageSquare },
  { path: '/ai-hub/automations', label: 'Automations', icon: FiZap },
]

export default function AiHubLayout({ title, subtitle, children, actions }) {
  return (
    <div className="lms-page w-full min-w-0 space-y-6">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'AI Hub' }, { label: title }]} />

      <div className="flex flex-wrap items-center gap-3">
        <NavLink
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <FiArrowLeft className="h-4 w-4" />
          Dashboard
        </NavLink>
        <span className="inline-flex items-center rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
          {BRAND_AI_NAME}
        </span>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">ScholaOne AI Hub</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {actions}
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border">
        {NAV.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors -mb-px',
                  isActive
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )
        })}
      </div>

      {children}
    </div>
  )
}
