import ResourceListPage from '@/components/crud/ResourceListPage'
import { communicationService } from '@/api/services'
import { COMMUNICATION_STATUS_OPTIONS } from '@/config/constants'
import {
  COMMUNICATION_CATEGORY_META,
  getCommunicationComposePath,
  getCommunicationListPath,
} from '@/utils/communicationRoutes'

const STATUS_LABELS = Object.fromEntries(COMMUNICATION_STATUS_OPTIONS.map((o) => [o.value, o.label]))

const columns = [
  { accessorKey: 'title', header: 'Title' },
  {
    accessorKey: 'audiences',
    header: 'Audience',
    cell: ({ getValue }) => (Array.isArray(getValue()) ? getValue().join(', ') : '—'),
  },
  {
    accessorKey: 'channels',
    header: 'Channels',
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

export default function CommunicationCategoryListPage({ category }) {
  const meta = COMMUNICATION_CATEGORY_META[category]
  const listPath = getCommunicationListPath(category)

  if (!meta) return null

  return (
    <ResourceListPage
      title={meta.title}
      subtitle={meta.subtitle}
      breadcrumb={[
        { label: 'Communications', href: '/communications' },
        { label: meta.title, href: listPath },
      ]}
      queryKey={meta.queryKey}
      listFn={communicationService.messages.list}
      listParams={{ category }}
      deleteFn={communicationService.messages.delete}
      basePath="/communications/messages"
      createPath={getCommunicationComposePath(category)}
      columns={columns}
    />
  )
}
