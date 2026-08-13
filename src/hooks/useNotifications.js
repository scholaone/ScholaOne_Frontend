import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { notificationService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import {
  ensureBrowserNotificationPermission,
  getNotificationListFromResponse,
  getUnreadCountFromResponse,
  showBrowserNotification,
} from '@/utils/notifications'

const POLL_MS = 10_000
const SEEN_STORAGE_KEY = 'scholaone_seen_notification_ids'

function readSeenIds() {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = sessionStorage.getItem(SEEN_STORAGE_KEY)
    return new Set(Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function writeSeenId(id) {
  if (typeof window === 'undefined' || !id) return
  const seen = readSeenIds()
  seen.add(id)
  const trimmed = [...seen].slice(-200)
  sessionStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(trimmed))
}

function patchNotificationListCache(queryClient, mapper) {
  queryClient.setQueryData(['notifications', 'list'], (current) => {
    if (!current) return current

    const patchResults = (results) => (Array.isArray(results) ? results.map(mapper) : results)

    if (Array.isArray(current.results)) {
      return { ...current, results: patchResults(current.results) }
    }

    if (current.data?.results) {
      return {
        ...current,
        data: {
          ...current.data,
          results: patchResults(current.data.results),
        },
      }
    }

    if (Array.isArray(current.data)) {
      return { ...current, data: patchResults(current.data) }
    }

    return current
  })
}

function setUnreadCountCache(queryClient, count) {
  queryClient.setQueryData(['notifications', 'unread-count'], (current) => {
    if (!current) return { success: true, count }
    if (typeof current.count === 'number') return { ...current, count }
    if (current.data && typeof current.data.count === 'number') {
      return { ...current, data: { ...current.data, count } }
    }
    return { ...current, count }
  })
}

export function useNotifications({
  enabled = true,
  pollList = false,
  enableBrowserAlerts = false,
  onBrowserNotificationClick,
} = {}) {
  const queryClient = useQueryClient()
  const seededRef = useRef(false)
  const onBrowserClickRef = useRef(onBrowserNotificationClick)
  onBrowserClickRef.current = onBrowserNotificationClick

  const unreadQuery = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.unreadCount(),
    enabled,
    refetchInterval: enabled ? POLL_MS : false,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  })

  const listQuery = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationService.list({ page_size: 20 }),
    enabled: enabled && pollList,
    refetchInterval: enabled && pollList ? POLL_MS : false,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  })

  const unreadCount = getUnreadCountFromResponse(unreadQuery.data)
  const notifications = getNotificationListFromResponse(listQuery.data)

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationService.markRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      const previous = {
        list: queryClient.getQueryData(['notifications', 'list']),
        count: queryClient.getQueryData(['notifications', 'unread-count']),
      }

      patchNotificationListCache(queryClient, (item) => (
        item.id === id ? { ...item, is_read: true } : item
      ))

      const currentCount = getUnreadCountFromResponse(previous.count)
      if (currentCount > 0) {
        setUnreadCountCache(queryClient, currentCount - 1)
      }

      return previous
    },
    onError: (error, _id, previous) => {
      if (previous?.list) queryClient.setQueryData(['notifications', 'list'], previous.list)
      if (previous?.count) queryClient.setQueryData(['notifications', 'unread-count'], previous.count)
      toast.error(getErrorMessage(error, 'Failed to mark as read'))
    },
    onSettled: invalidateAll,
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      const previous = {
        list: queryClient.getQueryData(['notifications', 'list']),
        count: queryClient.getQueryData(['notifications', 'unread-count']),
      }

      patchNotificationListCache(queryClient, (item) => (
        item.is_read ? item : { ...item, is_read: true }
      ))
      setUnreadCountCache(queryClient, 0)

      return previous
    },
    onSuccess: () => {
      toast.success('All notifications marked as read')
    },
    onError: (error, _vars, previous) => {
      if (previous?.list) queryClient.setQueryData(['notifications', 'list'], previous.list)
      if (previous?.count) queryClient.setQueryData(['notifications', 'unread-count'], previous.count)
      toast.error(getErrorMessage(error, 'Failed to mark all as read'))
    },
    onSettled: invalidateAll,
  })

  useEffect(() => {
    if (!enabled || !pollList || !listQuery.data) return

    const items = getNotificationListFromResponse(listQuery.data)
    const seenIds = readSeenIds()

    if (!seededRef.current) {
      items.forEach((item) => {
        if (item.id) writeSeenId(item.id)
      })
      seededRef.current = true
      return
    }

    if (!enableBrowserAlerts) return

    for (const item of items) {
      if (!item.id || item.is_read || seenIds.has(item.id)) continue

      showBrowserNotification(item.title, {
        body: item.message,
        tag: String(item.id),
        onClick: () => onBrowserClickRef.current?.(item),
      })
      writeSeenId(item.id)
    }
  }, [enabled, pollList, enableBrowserAlerts, listQuery.data])

  useEffect(() => {
    if (!enabled || !enableBrowserAlerts) return undefined

    let cancelled = false
    ensureBrowserNotificationPermission().then((permission) => {
      if (!cancelled && permission === 'granted' && pollList) {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      }
    })

    return () => {
      cancelled = true
    }
  }, [enabled, enableBrowserAlerts, pollList, queryClient])

  return {
    unreadCount,
    notifications,
    isLoadingList: listQuery.isLoading,
    isFetchingList: listQuery.isFetching,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
    isMarkingAllRead: markAllReadMutation.isPending,
    isMarkingRead: markReadMutation.isPending,
    refetchNotifications: () => {
      unreadQuery.refetch()
      if (pollList) listQuery.refetch()
    },
    requestBrowserPermission: ensureBrowserNotificationPermission,
  }
}
