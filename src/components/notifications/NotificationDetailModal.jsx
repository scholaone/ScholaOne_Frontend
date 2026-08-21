import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { formatDateTime, fromNow } from '@/utils/format'

export default function NotificationDetailModal({
  notification,
  open,
  onClose,
  onOpenLink,
}) {
  if (!notification) return null

  const linkLabel = onOpenLink ? 'View full message' : null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={notification.title || 'Notification'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {linkLabel ? (
            <Button onClick={() => onOpenLink(notification)}>
              {linkLabel}
            </Button>
          ) : null}
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {notification.notification_type ? (
            <span className="rounded-full bg-muted px-2 py-0.5 capitalize">
              {notification.notification_type}
            </span>
          ) : null}
          <span>{fromNow(notification.created_at)}</span>
          {notification.created_at ? (
            <span className="text-muted-foreground/80">· {formatDateTime(notification.created_at)}</span>
          ) : null}
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {notification.message}
        </p>
      </div>
    </Modal>
  )
}
