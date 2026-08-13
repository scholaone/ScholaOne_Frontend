import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/hooks/useNotifications'
import NotificationDetailModal from '@/components/notifications/NotificationDetailModal'
import { isAdminPortalUser } from '@/utils/authRoles'
import { resolveNotificationLink } from '@/utils/notifications'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const openHandlerRef = useRef(null)

  const {
    markRead,
    ...notificationState
  } = useNotifications({
    enabled: isAuthenticated && Boolean(user?.id),
    pollList: true,
    enableBrowserAlerts: true,
    onBrowserNotificationClick: (item) => openHandlerRef.current?.(item),
  })

  const openNotification = useCallback((notification) => {
    if (!notification) return

    if (!notification.is_read && notification.id) {
      markRead(notification.id)
    }

    const link = resolveNotificationLink(notification)
    if (link && isAdminPortalUser(user)) {
      navigate(link)
      return
    }

    setSelected(notification)
  }, [markRead, navigate, user])

  openHandlerRef.current = openNotification

  const closeNotification = useCallback(() => setSelected(null), [])

  const openSelectedLink = useCallback((notification) => {
    const path = resolveNotificationLink(notification)
    setSelected(null)
    if (path) navigate(path)
  }, [navigate])

  const value = {
    ...notificationState,
    markRead,
    openNotification,
    closeNotification,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationDetailModal
        notification={selected}
        open={Boolean(selected)}
        onClose={closeNotification}
        onOpenLink={isAdminPortalUser(user) ? openSelectedLink : undefined}
      />
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider')
  }
  return context
}
