import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiMenu, FiBell, FiMail, FiSearch, FiUser, FiLogOut, FiKey, FiChevronDown, FiZap, FiBook } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import { notificationService } from '@/api/services'
import { Drawer } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Feedback'
import { formatDateTime, fromNow } from '@/utils/format'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function Header() {
  const { user, logout, isSchoolAdmin } = useAuth()
  const { setMobileSidebarOpen } = useUI()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
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

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card/80 px-4 backdrop-blur-md lg:px-6">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Open menu"
        >
          <FiMenu className="h-5 w-5" />
        </button>

        <div className="hidden flex-1 md:block">
          <div className="flex max-w-md items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <FiSearch className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search modules, users, schools..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => {}}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          aria-label="Search"
        >
          <FiSearch className="h-5 w-5" />
        </button>

        <div className="ml-auto flex items-center gap-1">
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
            onClick={() => setNotifOpen(true)}
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
