import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import ResourceListPage from '@/components/crud/ResourceListPage'
import ResourceDetailModal, { useListDetailModal } from '@/components/crud/ResourceDetailModal'
import Button from '@/components/ui/Button'
import { notificationService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { fromNow, formatDateTime } from '@/utils/format'
import { resolveRecordId } from '@/utils/record'
import { resolveNotificationLink } from '@/utils/notifications'
import { useNotificationContext } from '@/contexts/NotificationContext'
import { useAuth } from '@/contexts/AuthContext'
import { isAdminPortalUser } from '@/utils/authRoles'

const columns = [
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'message', header: 'Message' },
  { accessorKey: 'notification_type', header: 'Type' },
  { accessorKey: 'is_read', header: 'Read', cell: ({ getValue }) => (getValue() ? 'Yes' : 'No') },
  { accessorKey: 'created_at', header: 'Time', cell: ({ getValue }) => fromNow(getValue()) },
]

const DETAIL_FIELDS = [
  { key: 'title', label: 'Title' },
  { key: 'notification_type', label: 'Type' },
  { key: 'is_read', label: 'Read', render: (item) => (item.is_read ? 'Yes' : 'No') },
  { key: 'created_at', label: 'Created', render: (item) => formatDateTime(item.created_at) },
  { key: 'message', label: 'Message', fullWidth: true },
]

function NotificationDetailModal({ notificationId, open, onClose }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const markReadMutation = useMutation({
    mutationFn: () => notificationService.markRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Marked as read')
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Failed to mark as read')),
  })

  return (
    <ResourceDetailModal
      recordId={notificationId}
      open={open}
      onClose={onClose}
      queryKey="notifications"
      getFn={notificationService.get}
      getTitle={(item) => item.title}
      fields={DETAIL_FIELDS}
      renderFooter={(item, _id, close) => (
        <>
          <Button variant="secondary" onClick={close}>Close</Button>
          {!item.is_read ? (
            <Button loading={markReadMutation.isPending} onClick={() => markReadMutation.mutate()}>
              Mark as Read
            </Button>
          ) : null}
          <Button
            onClick={() => {
              if (!item.is_read) markReadMutation.mutate()
              const path = resolveNotificationLink(item)
              close()
              if (path) navigate(path)
            }}
          >
            Open
          </Button>
        </>
      )}
    />
  )
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const { markAllRead, isMarkingAllRead, openNotification } = useNotificationContext()
  const { viewId, isOpen, openView, closeView } = useListDetailModal()
  const isAdmin = isAdminPortalUser(user)

  const handleOpen = (item) => {
    if (isAdmin) {
      openView(item, resolveRecordId(item))
      return
    }
    openNotification(item)
  }

  return (
    <>
      <ResourceListPage
        title="Notifications"
        subtitle="Your notification history"
        queryKey="notifications"
        listFn={notificationService.list}
        deleteFn={null}
        basePath="/notifications"
        columns={columns}
        onView={handleOpen}
        onRowClick={handleOpen}
        extraActions={
          <Button variant="secondary" onClick={() => markAllRead()} loading={isMarkingAllRead}>
            Mark All Read
          </Button>
        }
      />

      {isAdmin ? (
        <NotificationDetailModal notificationId={viewId} open={isOpen} onClose={closeView} />
      ) : null}
    </>
  )
}
