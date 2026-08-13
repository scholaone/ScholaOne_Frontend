import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ResourceListPage from '@/components/crud/ResourceListPage'
import { SelectField } from '@/components/ui/Input'
import { communicationService } from '@/api/services'
import { COMMUNICATION_CATEGORY_OPTIONS, COMMUNICATION_STATUS_OPTIONS } from '@/config/constants'

const STATUS_LABELS = Object.fromEntries(COMMUNICATION_STATUS_OPTIONS.map((o) => [o.value, o.label]))
const CATEGORY_LABELS = Object.fromEntries(COMMUNICATION_CATEGORY_OPTIONS.map((o) => [o.value, o.label]))

export default function CommunicationMessageList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''
  const status = searchParams.get('status') || ''

  const listParams = useMemo(() => {
    const p = {}
    if (category) p.category = category
    if (status) p.status = status
    return p
  }, [category, status])

  const title = category
    ? CATEGORY_LABELS[category] || 'Messages'
    : 'All Messages'

  const columns = [
    { accessorKey: 'title', header: 'Title' },
    {
      accessorKey: 'category',
      header: 'Type',
      cell: ({ getValue }) => CATEGORY_LABELS[getValue()] || getValue(),
    },
    {
      accessorKey: 'channels',
      header: 'Channels',
      cell: ({ getValue }) => (Array.isArray(getValue()) ? getValue().join(', ') : '—'),
    },
    {
      accessorKey: 'audiences',
      header: 'Audience',
      cell: ({ getValue }) => (Array.isArray(getValue()) ? getValue().join(', ') : '—'),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => STATUS_LABELS[getValue()] || getValue(),
    },
    { accessorKey: 'sent_count', header: 'Sent' },
    { accessorKey: 'read_count', header: 'Read' },
    { accessorKey: 'scheduled_at', header: 'Scheduled' },
  ]

  return (
    <ResourceListPage
      key={`${category || 'all'}-${status || 'all'}`}
      title={title}
      subtitle="Compose, schedule, and track multi-channel communications"
      queryKey={['communication-messages', category, status]}
      listFn={communicationService.messages.list}
      listParams={listParams}
      deleteFn={communicationService.messages.delete}
      basePath="/communications/messages"
      hideCreate
      columns={columns}
      filters={
        <>
          <SelectField
            value={category}
            placeholder="All types"
            onChange={(e) => {
              const next = new URLSearchParams(searchParams)
              if (e.target.value) next.set('category', e.target.value)
              else next.delete('category')
              setSearchParams(next)
            }}
            options={COMMUNICATION_CATEGORY_OPTIONS}
            className="min-w-[140px]"
          />
          <SelectField
            value={status}
            placeholder="All statuses"
            onChange={(e) => {
              const next = new URLSearchParams(searchParams)
              if (e.target.value) next.set('status', e.target.value)
              else next.delete('status')
              setSearchParams(next)
            }}
            options={COMMUNICATION_STATUS_OPTIONS}
            className="min-w-[140px]"
          />
        </>
      }
    />
  )
}
