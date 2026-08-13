import { useNavigate } from 'react-router-dom'
import ResourceListPage from '@/components/crud/ResourceListPage'
import { transportService } from '@/api/services'
import { resolveRecordId } from '@/utils/record'

const STATUS_LABELS = { active: 'Active', inactive: 'Inactive' }

const columns = [
  { accessorKey: 'name', header: 'Route Name' },
  { accessorKey: 'code', header: 'Code' },
  { accessorKey: 'start_point', header: 'Start' },
  { accessorKey: 'end_point', header: 'End' },
  { accessorKey: 'stops_count', header: 'Stops' },
  { accessorKey: 'vehicles_count', header: 'Vehicles' },
  { accessorKey: 'students_assigned', header: 'Students' },
  {
    accessorKey: 'monthly_fee',
    header: 'Monthly Fee',
    cell: ({ getValue }) => {
      const val = getValue()
      return val != null ? `₹${val}` : '—'
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => STATUS_LABELS[getValue()] || getValue(),
  },
]

export default function TransportRoutesPage() {
  const navigate = useNavigate()

  return (
    <ResourceListPage
      title="Transport Routes"
      subtitle="Route master with timings, distance, fees and capacity planning"
      breadcrumb={[
        { label: 'Transport', href: '/transport' },
        { label: 'Routes' },
      ]}
      queryKey="transport-routes"
      listFn={transportService.routes.list}
      deleteFn={transportService.routes.delete}
      basePath="/transport/routes"
      columns={columns}
      onView={(item, id) => navigate(`/transport/routes/${resolveRecordId(item) || id}/edit`)}
    />
  )
}
