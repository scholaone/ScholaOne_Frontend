import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiMenu, FiBell, FiMail, FiSearch, FiUser, FiLogOut, FiKey, FiChevronDown, FiZap, FiBook, FiShield } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import { notificationService, schoolService } from '@/api/services'
import { unwrapData } from '@/api/client'
import { getAuthenticatedTenantLabel } from '@/utils/tenantDisplay'
import { getUserSchoolId } from '@/utils/schoolScope'
import { getUserRoleDisplayLabel } from '@/utils/authRoles'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Drawer } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Feedback'
import { formatDateTime, fromNow, resolveMediaUrl } from '@/utils/format'

export default function Header() {
  const { user, logout, isSchoolAdmin } = useAuth()
  const { setMobileSidebarOpen } = useUI()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [deferSecondaryQueries, setDeferSecondaryQueries] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setDeferSecondaryQueries(true), 1500)
    return () => window.clearTimeout(timer)
  }, [])

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.unreadCount(),
    enabled: deferSecondaryQueries && Boolean(user?.id),
    refetchInterval: 30000,
    staleTime: 60_000,
  })

  const { data: notifData } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationService.list({ page_size: 20 }),
    enabled: notifOpen,
  })

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('All notifications marked as read')
    },
  })

  const unreadCount = unreadData?.data?.count ?? unreadData?.count ?? 0
  const notifications = notifData?.results ?? notifData?.data?.results ?? []

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
  const roleLabel = getUserRoleDisplayLabel(user)
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
  const orgSubtitle = user?.organization_name && tenantLabel !== user.organization_name
    ? user.organization_name
    : null

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/90 px-3 backdrop-blur-md sm:px-4 lg:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Open menu"
          >
            <FiMenu className="h-5 w-5" />
          </button>

          {tenantLabel ? (
            <div className="flex min-w-0 items-center gap-2.5 border-l border-border/70 pl-2 sm:gap-3 sm:pl-3 lg:pl-4">
              {showTenantLogo ? (
                tenantLogo ? (
                  <img
                    src={tenantLogo}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-xl border border-border bg-white object-contain p-0.5 shadow-sm"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-brand-50 text-xs font-bold uppercase text-brand-700">
                    {tenantLabel.slice(0, 1)}
                  </div>
                )
              ) : null}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground sm:text-base" title={tenantLabel}>
                  {tenantLabel}
                </p>
                {orgSubtitle ? (
                  <p className="truncate text-[11px] text-muted-foreground sm:text-xs" title={orgSubtitle}>
                    {orgSubtitle}
                  </p>
                ) : (
                  <p className="hidden text-[11px] text-muted-foreground sm:block sm:text-xs">School portal</p>
                )}
              </div>
            </div>
          ) : user?.organization_name ? (
            <div className="min-w-0 border-l border-border/70 pl-2 sm:pl-3 lg:pl-4">
              <p className="truncate text-sm font-semibold text-foreground sm:text-base" title={user.organization_name}>
                {user.organization_name}
              </p>
              <p className="text-[11px] text-muted-foreground sm:text-xs">Organization portal</p>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {!isSchoolAdmin ? (
            <>
              <Link
                to="/ai-hub"
                title="AI Hub"
                className="hidden h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
              >
                <FiZap className="h-5 w-5" />
              </Link>
              <Link
                to="/scholaone-post"
                title="ScholaOne Mailer"
                className="hidden h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
              >
                <FiMail className="h-5 w-5" />
              </Link>
            </>
          ) : null}

          <button
            type="button"
            onClick={() => setNotifOpen(true)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Notifications"
          >
            <FiBell className="h-5 w-5" />
            {unreadCount > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </button>

          <div className="hidden items-center md:flex">
            <div className="flex h-10 w-44 items-center gap-2 rounded-xl border border-border bg-background/80 px-3 lg:w-52 xl:w-60">
              <FiSearch className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            aria-label="Search"
            aria-expanded={searchOpen}
          >
            <FiSearch className="h-5 w-5" />
          </button>

          <div className="relative ml-0.5 sm:ml-1">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border border-transparent p-1 pr-2 transition-colors hover:border-border hover:bg-muted/70',
                profileOpen && 'border-border bg-muted/70',
              )}
            >
              <Avatar name={displayName} src={user?.profile_image} size="sm" />
              <div className="hidden text-left lg:block">
                <p className="max-w-[108px] truncate text-sm font-medium leading-none text-foreground">{displayName}</p>
                <p className="mt-0.5 max-w-[108px] truncate text-[11px] text-muted-foreground">{roleLabel}</p>
              </div>
              <FiChevronDown className={cn('hidden h-4 w-4 text-muted-foreground transition-transform sm:block', profileOpen && 'rotate-180')} />
            </button>

            {profileOpen ? (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-border bg-card py-2 shadow-[var(--shadow-elevated)]">
                  <div className="border-b border-border px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={displayName} src={user?.profile_image} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
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

                  <div className="mx-3 my-2 flex items-center gap-2.5 rounded-xl bg-brand-50/80 px-3 py-2.5 ring-1 ring-brand-100">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
                      <FiShield className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-700/80">
                        User type
                      </p>
                      <p className="truncate text-sm font-semibold text-foreground">{roleLabel}</p>
                    </div>
                  </div>

                  <div className="mt-1 border-t border-border pt-1">
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
                </div>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {searchOpen ? (
        <div className="border-b border-border bg-card px-3 py-2 md:hidden">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
            <FiSearch className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              autoFocus
              placeholder="Search modules, users, schools..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      ) : null}

      <Drawer open={notifOpen} onClose={() => setNotifOpen(false)} title="Notifications">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => markAllMutation.mutate()}
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              Mark all read
            </button>
          ) : null}
        </div>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  'rounded-xl border p-4',
                  n.is_read ? 'border-border bg-card' : 'border-brand-200 bg-brand-50/50',
                )}
              >
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{fromNow(n.created_at)}</p>
              </div>
            ))
          )}
        </div>
      </Drawer>
    </>
  )
}
