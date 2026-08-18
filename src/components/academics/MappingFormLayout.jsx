import { cn } from '@/lib/utils'

export function MappingFormCard({ title, icon: Icon, description, children, footer }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-gradient-to-r from-primary/5 to-transparent px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          {Icon ? (
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
          ) : null}
          <div>
            <h3 className="text-base font-semibold text-text">{title}</h3>
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">{children}</div>

      {footer ? (
        <div className="flex flex-col gap-3 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          {footer}
        </div>
      ) : null}
    </div>
  )
}

export function ScopeFilterCard({ children, footer }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="space-y-4 p-5 sm:p-6">{children}</div>

      {footer ? (
        <div className="flex flex-col gap-3 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          {footer}
        </div>
      ) : null}
    </div>
  )
}

export function MappingListCard({ title, count, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4 sm:px-6">
        <h3 className="text-base font-semibold text-text">{title}</h3>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {count} mapped
        </span>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  )
}

export function MappingEmptyState({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/10 px-6 py-10 text-center">
      <p className="text-sm text-muted">{message}</p>
    </div>
  )
}

export function MappingTableWrap({ children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">{children}</div>
  )
}

export function statusBadgeClass(isActive) {
  return cn(
    'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
    isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600',
  )
}
