import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiGrid, FiLayers, FiMenu, FiPlus, FiSearch, FiChevronDown, FiChevronUp, FiEdit2, FiTrash2, FiEye, FiArrowUp, FiArrowDown, FiLink } from 'react-icons/fi'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'

export function NavAdminHeader({ activeTab = 'menus', actions }) {
  const tabs = [
    { id: 'menus', label: 'Menus', to: '/menus', icon: FiMenu },
    { id: 'modules', label: 'Modules', to: '/modules', icon: FiLayers },
  ]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-white px-6 py-6 text-foreground shadow-sm sm:px-8">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-brand-50 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-emerald-50 blur-2xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-100">
            <FiGrid className="h-3.5 w-3.5" />
            Navigation Builder
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">School Admin Navigation</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Design modules and menus per organization and school. Control visibility and display order with a live preview of the school admin sidebar.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <Link
                  key={tab.id}
                  to={tab.to}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              )
            })}
          </nav>
        </div>
        {actions ? <div className="relative flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}

export function NavScopeBar({ children, hint }) {
  return (
    <Card className="border-border/70 bg-card/95 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-4 sm:grid-cols-2">{children}</div>
        {hint ? (
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground lg:text-right">{hint}</p>
        ) : null}
      </div>
    </Card>
  )
}

export function NavStatPill({ label, value, tone = 'default' }) {
  const tones = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-50 text-emerald-700',
    muted: 'bg-amber-50 text-amber-800',
  }
  return (
    <div className={cn('rounded-xl px-4 py-3', tones[tone] || tones.default)}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-0.5 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  )
}

export function ToggleSwitch({ checked, disabled, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-all duration-200',
        'disabled:cursor-not-allowed disabled:opacity-40',
        checked ? 'border-brand-500 bg-brand-500 shadow-inner' : 'border-slate-300 bg-slate-200',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-[1.35rem]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

export function StatusBadge({ active, size = 'sm' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        active
          ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/60'
          : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/60',
      )}
    >
      <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-slate-400')} />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

export function SequenceStepper({ value, disabled, onSave, onMoveUp, onMoveDown, canMoveUp, canMoveDown }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-muted/30 p-0.5">
      <button
        type="button"
        disabled={disabled || !canMoveUp}
        onClick={onMoveUp}
        className="rounded-md p-1.5 text-muted-foreground transition hover:bg-white hover:text-foreground disabled:opacity-30"
        title="Move up"
      >
        <FiArrowUp className="h-3.5 w-3.5" />
      </button>
      <SequenceInput value={value} disabled={disabled} onSave={onSave} />
      <button
        type="button"
        disabled={disabled || !canMoveDown}
        onClick={onMoveDown}
        className="rounded-md p-1.5 text-muted-foreground transition hover:bg-white hover:text-foreground disabled:opacity-30"
        title="Move down"
      >
        <FiArrowDown className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function SequenceInput({ value, disabled, onSave }) {
  const [local, setLocal] = useState(String(value ?? 0))

  useEffect(() => {
    setLocal(String(value ?? 0))
  }, [value])

  const commit = () => {
    const next = Number.parseInt(local, 10)
    if (Number.isNaN(next) || next < 0) {
      setLocal(String(value ?? 0))
      return
    }
    if (next !== value) onSave(next)
  }

  return (
    <input
      type="number"
      min={0}
      disabled={disabled}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          commit()
        }
      }}
      className="h-7 w-12 rounded-md border-0 bg-white text-center text-xs font-semibold tabular-nums text-foreground shadow-sm ring-1 ring-border/60 focus:ring-2 focus:ring-brand-500/30 disabled:opacity-50"
      title="Display order"
    />
  )
}

export function NavPageShell({ breadcrumb, children }) {
  return (
    <div className="lms-page w-full space-y-5 pb-8">
      <Breadcrumb items={breadcrumb} />
      {children}
    </div>
  )
}

export function SearchField({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative min-w-[200px] flex-1 max-w-md">
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
    </div>
  )
}

export function IconActionLink({ to, variant = 'ghost', children, title }) {
  const variants = {
    ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
    primary: 'text-brand-600 hover:bg-brand-50',
    danger: 'text-red-600 hover:bg-red-50',
  }
  return (
    <Link
      to={to}
      title={title}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
        variants[variant] || variants.ghost,
      )}
    >
      {children}
    </Link>
  )
}

export function EmptyNavState({ title, description, action }) {
  return (
    <Card className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <FiMenu className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  )
}

export { FiPlus, FiEdit2, FiTrash2, FiEye, FiChevronDown, FiChevronUp, FiLink, Button, SelectField, Link }
