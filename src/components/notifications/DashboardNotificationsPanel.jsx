import { Link } from 'react-router-dom'
import { FiBell, FiExternalLink } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import { fromNow } from '@/utils/format'
import { cn } from '@/lib/utils'
import { useNotificationContext } from '@/contexts/NotificationContext'

export default function DashboardNotificationsPanel({
  title = 'Notifications',
  className,
  variant = 'card',
}) {
  const {
    unreadCount,
    notifications,
    isLoadingList,
    markAllRead,
    isMarkingAllRead,
    openNotification,
    requestBrowserPermission,
  } = useNotificationContext()

  const shellClass = variant === 'teacher'
    ? 'teacher-panel'
    : cn('p-5', className)

  return (
    <div className={shellClass}>
      <div className={variant === 'teacher' ? 'teacher-panel__head' : 'mb-3 flex items-start justify-between gap-3'}>
        <div>
          <h2 className={variant === 'teacher' ? 'teacher-panel__title' : 'text-sm font-semibold text-text'}>
            {title}
            {unreadCount > 0 ? (
              <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </h2>
          {variant === 'teacher' ? null : (
            <p className="mt-1 text-xs text-muted-foreground">Updates every 10 seconds</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => markAllRead()}
              disabled={isMarkingAllRead}
              className="text-xs font-medium text-brand-600 hover:underline disabled:opacity-50"
            >
              Mark all read
            </button>
          ) : null}
          <Link to="/notifications" className={variant === 'teacher' ? 'teacher-panel__action' : 'text-xs font-medium text-brand-600 hover:underline'}>
            View all
          </Link>
        </div>
      </div>

      <div className="mb-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => requestBrowserPermission()}
        >
          Enable browser alerts
        </Button>
      </div>

      {isLoadingList ? (
        <p className="text-sm text-muted-foreground">Loading notifications…</p>
      ) : notifications.length === 0 ? (
        <p className={variant === 'teacher' ? 'teacher-empty' : 'text-sm text-muted'}>No notifications yet.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.slice(0, 8).map((notification) => (
            <li key={notification.id}>
              <button
                type="button"
                onClick={() => openNotification(notification)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition hover:border-brand-200 hover:bg-brand-50/40',
                  notification.is_read
                    ? 'border-border bg-white'
                    : 'border-brand-200 bg-brand-50/60',
                )}
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <FiBell className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-text">{notification.title}</span>
                    <FiExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </span>
                  <span className="mt-1 block line-clamp-2 text-xs text-muted-foreground">
                    {notification.message}
                  </span>
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    {fromNow(notification.created_at)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
