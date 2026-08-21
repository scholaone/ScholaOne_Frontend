import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiSend, FiXCircle } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { communicationService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import { COMMUNICATION_CATEGORY_OPTIONS, COMMUNICATION_STATUS_OPTIONS } from '@/config/constants'
import { formatDateTime, datetimeLocalToISO, isoToDatetimeLocal } from '@/utils/format'

const STATUS_LABELS = Object.fromEntries(COMMUNICATION_STATUS_OPTIONS.map((o) => [o.value, o.label]))
const CATEGORY_LABELS = Object.fromEntries(COMMUNICATION_CATEGORY_OPTIONS.map((o) => [o.value, o.label]))

const TABS = [
  { key: 'content', label: 'Content' },
  { key: 'delivery', label: 'Delivery Report' },
  { key: 'receipts', label: 'Read Receipts' },
]

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm font-medium text-text">{value || '—'}</dd>
    </div>
  )
}

export default function CommunicationMessageDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('content')
  const [scheduleAt, setScheduleAt] = useState('')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['communication-messages', id],
    queryFn: () => communicationService.messages.get(id),
    refetchInterval: (query) => {
      const item = query.state.data ? unwrapData(query.state.data) : null
      return item?.status === 'scheduled' ? 15000 : false
    },
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['communication-messages', id] })
    refetch()
  }

  const sendMut = useMutation({
    mutationFn: () => communicationService.messages.send(id),
    onSuccess: () => { invalidate(); toast.success('Message sent') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const scheduleMut = useMutation({
    mutationFn: () => communicationService.messages.schedule(id, {
      scheduled_at: datetimeLocalToISO(scheduleAt),
    }),
    onSuccess: () => { invalidate(); toast.success('Message scheduled') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const cancelMut = useMutation({
    mutationFn: () => communicationService.messages.cancel(id),
    onSuccess: () => { invalidate(); toast.success('Message cancelled') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const reportQuery = useQuery({
    queryKey: ['communication-messages', id, 'delivery-report'],
    queryFn: () => communicationService.messages.deliveryReport(id),
    enabled: tab === 'delivery',
  })

  const receiptsQuery = useQuery({
    queryKey: ['communication-messages', id, 'read-receipts'],
    queryFn: () => communicationService.messages.readReceipts(id),
    enabled: tab === 'receipts',
  })

  const message = data ? unwrapData(data) : null

  useEffect(() => {
    if (message?.scheduled_at) {
      setScheduleAt(isoToDatetimeLocal(message.scheduled_at))
    }
  }, [message?.scheduled_at, message?.message_id])

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
  if (!message) return <ErrorState message="Message not found." onRetry={refetch} />

  const report = unwrapData(reportQuery.data)?.data || unwrapData(reportQuery.data) || message.delivery_report || {}
  const receipts = unwrapData(receiptsQuery.data)?.data?.results || unwrapData(receiptsQuery.data)?.results || []

  const canSend = ['draft', 'scheduled'].includes(message.status)
  const canCancel = ['draft', 'scheduled'].includes(message.status)

  return (
    <div className="w-full space-y-6">
      <Breadcrumb items={[
        { label: 'Communications', href: '/communications' },
        { label: 'Messages', href: '/communications/messages' },
        { label: message.title },
      ]} />
      <PageHeader
        title={message.title}
        subtitle={`${CATEGORY_LABELS[message.category] || message.category} · ${STATUS_LABELS[message.status] || message.status}`}
        actions={
          <>
            {canSend && (
              <Button loading={sendMut.isPending} onClick={() => sendMut.mutate()}>
                <FiSend className="h-4 w-4" /> Send Now
              </Button>
            )}
            {canCancel && (
              <Button variant="outline" loading={cancelMut.isPending} onClick={() => cancelMut.mutate()}>
                <FiXCircle className="h-4 w-4" /> Cancel
              </Button>
            )}
            <Link to={`/communications/messages/${id}/edit`}><Button variant="edit">Edit</Button></Link>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${tab === t.key ? 'bg-primary text-white' : 'bg-slate-100 text-muted'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'content' && (
        <Card>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <Field label="Subject" value={message.subject} />
            <Field label="Channels" value={(message.channels || []).join(', ')} />
            <Field label="Audience" value={(message.audiences || []).join(', ')} />
            <Field label="Scheduled" value={message.scheduled_at ? formatDateTime(message.scheduled_at) : '—'} />
            <Field label="Sent At" value={message.sent_at ? formatDateTime(message.sent_at) : '—'} />
            <Field label="Recipients" value={message.total_recipients} />
            <Field label="Sent / Failed / Read" value={`${message.sent_count} / ${message.failed_count} / ${message.read_count}`} />
          </dl>
          {message.status === 'scheduled' && message.scheduled_at ? (
            <p className="mb-4 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs text-brand-800">
              Scheduled for {formatDateTime(message.scheduled_at)}. The server sends this automatically
              within about 30 seconds of that time — you do not need to keep this page open.
            </p>
          ) : null}
          <div className="rounded-lg border border-border bg-slate-50 p-4 text-sm whitespace-pre-wrap">{message.body}</div>

          {canSend && (
            <div className="mt-6 flex flex-wrap items-end gap-2 max-w-md">
              <Input
                label="Schedule for later"
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
              />
              <Button
                variant="secondary"
                disabled={!scheduleAt}
                loading={scheduleMut.isPending}
                onClick={() => scheduleMut.mutate()}
              >
                Schedule
              </Button>
            </div>
          )}
        </Card>
      )}

      {tab === 'delivery' && (
        <Card>
          {reportQuery.isLoading ? <PageLoader /> : (
            <>
              <div className="mb-4 grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg border p-3"><p className="text-xs text-muted">Total</p><p className="text-xl font-bold">{report.total_recipients ?? 0}</p></div>
                <div className="rounded-lg border p-3"><p className="text-xs text-muted">Sent</p><p className="text-xl font-bold text-green-600">{report.sent_count ?? 0}</p></div>
                <div className="rounded-lg border p-3"><p className="text-xs text-muted">Failed</p><p className="text-xl font-bold text-red-600">{report.failed_count ?? 0}</p></div>
                <div className="rounded-lg border p-3"><p className="text-xs text-muted">Read</p><p className="text-xl font-bold">{report.read_count ?? 0}</p></div>
              </div>
              <h3 className="mb-2 font-semibold text-sm">By Channel</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(report.by_channel || {}).map(([channel, stats]) => (
                  <div key={channel} className="rounded-lg border px-3 py-2 text-sm">
                    <p className="font-medium capitalize">{channel}</p>
                    <p className="text-muted">Sent: {stats.sent} · Failed: {stats.failed} · Read: {stats.read}</p>
                  </div>
                ))}
              </div>
              <h3 className="mt-6 mb-2 font-semibold text-sm">Recent Deliveries</h3>
              <ul className="space-y-1 text-sm max-h-64 overflow-y-auto">
                {(message.deliveries || []).slice(0, 50).map((d) => (
                  <li key={d.delivery_id} className="flex justify-between rounded border px-2 py-1">
                    <span>{d.recipient_name} ({d.channel})</span>
                    <span className={d.status === 'failed' ? 'text-red-600' : 'text-muted'}>{d.status}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      )}

      {tab === 'receipts' && (
        <Card>
          {receiptsQuery.isLoading ? <PageLoader /> : (
            <ul className="space-y-2 text-sm">
              {receipts.length === 0 && <p className="text-muted">No read receipts yet.</p>}
              {receipts.map((r) => (
                <li key={r.delivery_id} className="rounded-lg border px-3 py-2 flex justify-between">
                  <span>{r.recipient_name} — {r.channel}</span>
                  <span className="text-muted">{r.read_at ? formatDateTime(r.read_at) : '—'}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  )
}
