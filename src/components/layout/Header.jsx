import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMenu, FiBell, FiMail, FiSearch, FiUser, FiLogOut, FiKey, FiChevronDown, FiZap, FiBook } from 'react-icons/fi'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import { schoolService } from '@/api/services'
import { unwrapData } from '@/api/client'
import { Drawer } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Feedback'
import { resolveMediaUrl, fromNow } from '@/utils/format'
import { getAuthenticatedTenantLabel } from '@/utils/tenantDisplay'
import { getUserSchoolId } from '@/utils/schoolScope'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useNotificationContext } from '@/contexts/NotificationContext'

export default function Header() {
  const { user, logout, isSchoolAdmin } = useAuth()
  const { setMobileSidebarOpen } = useUI()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [deferSecondaryQueries, setDeferSecondaryQueries] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setDeferSecondaryQueries(true), 1500)
    return () => window.clearTimeout(timer)
  }, [])

  const {
    unreadCount,
    notifications,
    markAllRead,
    isMarkingAllRead,
    openNotification,
    requestBrowserPermission,
  } = useNotificationContext()

  const handleLogout = async () => {
    if (isLoggingOut) return

    setProfileOpen(false)
    setIsLoggingOut(true)
    try {
      await logout()
      navigate('/login', { replace: true })
      toast.success('Logged out successfully')
    } catch {
      navigate('/login', { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const displayName = user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email
  const tenantLabel = getAuthenticatedTenantLabel(user)
  const schoolId = getUserSchoolId(user)
  const hasSchoolContext = Boolean(
    schoolId || user?.school_name || user?.school?.school_name || isSchoolAdmin,
  )

  const { data: schoolProfile } = useQuery({
    queryKey: ['school-profile', schoolId || 'mine', 'header'],
    queryFn: () => schoolService.getProfile(schoolId || undefined),
    enabled: deferSecondaryQueries && hasSchoolContext,
    staleTime: 300_000,
    select: (response) => unwrapData(response),
  })

  const tenantLogo = resolveMediaUrl(
    schoolProfile?.logo_url || schoolProfile?.logo || user?.school_logo_url || user?.school?.logo_url,
  )
  const showTenantLogo = Boolean(tenantLabel && hasSchoolContext)

  const handleOpenDrawer = () => {
    setNotifOpen(true)
    requestBrowserPermission()
  }

  return (
    <>
      <header className="sticky top-0 z-30 grid h-16 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-border bg-card/80 px-4 backdrop-blur-md lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 justify-self-start">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Open menu"
          >
            <FiMenu className="h-5 w-5" />
          </button>

          <div className="hidden min-w-0 flex-1 md:block lg:max-w-md xl:max-w-lg">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <FiSearch className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search modules, users, schools..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {tenantLabel ? (
          <div className="flex min-w-0 max-w-[min(100vw-12rem,28rem)] items-center justify-center gap-2.5 justify-self-center px-1">
            {showTenantLogo ? (
              tenantLogo ? (
                <img
                  src={tenantLogo}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-lg border border-border bg-white object-contain p-0.5 shadow-sm"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-xs font-bold uppercase text-muted-foreground">
                  {tenantLabel.slice(0, 1)}
                </div>
              )
            ) : null}
            <p
              className="truncate text-sm font-semibold text-foreground sm:text-base"
              title={tenantLabel}
            >
              {tenantLabel}
            </p>
          </div>
        ) : (
          <span className="justify-self-center" aria-hidden />
        )}

        <div className="flex min-w-0 items-center justify-end gap-1 justify-self-end">
          <button
            type="button"
            onClick={() => {}}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            aria-label="Search"
          >
            <FiSearch className="h-5 w-5" />
          </button>
          {!isSchoolAdmin ? (
            <>
              <Link
                to="/ai-hub"
                title="AI Hub"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <FiZap className="h-5 w-5" />
              </Link>
              <Link
                to="/scholaone-post"
                title="ScholaOne Mailer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <FiMail className="h-5 w-5" />
              </Link>
            </>
          ) : null}

          <button
            type="button"
            onClick={handleOpenDrawer}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Notifications"
          >
            <FiBell className="h-5 w-5" />
            {unreadCount > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </button>

          <div className="relative ml-1">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="inline-flex items-center gap-2 rounded-lg p-1.5 pr-2 transition-colors hover:bg-muted"
            >
              <Avatar name={displayName} src={user?.profile_image} size="sm" />
              <div className="hidden text-left md:block">
                <p className="max-w-[120px] truncate text-sm font-medium leading-none text-foreground">{displayName}</p>
                <p className="max-w-[120px] truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <FiChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
            </button>

            {profileOpen ? (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-card py-2 shadow-[var(--shadow-elevated)]">
                  <div className="border-b border-border px-4 py-2">
                    <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <FiUser className="h-4 w-4" /> Profile
                  </Link>
                  {isSchoolAdmin ? (
                    <Link
                      to="/school-profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <FiBook className="h-4 w-4" /> School Profile
                    </Link>
                  ) : null}
                  <Link
                    to="/change-password"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <FiKey className="h-4 w-4" /> Change Password
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoggingOut ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-destructive/30 border-t-destructive" />
                        Logging out…
                      </>
                    ) : (
                      <>
                        <FiLogOut className="h-4 w-4" /> Logout
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <Drawer open={notifOpen} onClose={() => setNotifOpen(false)} title="Notifications">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
          <div className="flex items-center gap-3">
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => markAllRead()}
                disabled={isMarkingAllRead}
                className="text-sm font-medium text-brand-600 hover:underline disabled:opacity-50"
              >
                Mark all read
              </button>
            ) : null}
            <Link to="/notifications" onClick={() => setNotifOpen(false)} className="text-sm font-medium text-brand-600 hover:underline">
              View all
            </Link>
          </div>
        </div>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No notifications</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  setNotifOpen(false)
                  openNotification(n)
                }}
                className={cn(
                  'w-full rounded-xl border p-4 text-left transition hover:border-brand-200 hover:bg-brand-50/40',
                  n.is_read ? 'border-border bg-card' : 'border-brand-200 bg-brand-50/50',
                )}
              >
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{fromNow(n.created_at)}</p>
              </button>
            ))
          )}
        </div>
      </Drawer>
    </>
  )
}
