import { useNavigate } from 'react-router-dom'
import ResourceListPage from '@/components/crud/ResourceListPage'
import { transportService } from '@/api/services'
import { resolveRecordId } from '@/utils/record'

const TYPE_LABELS = { bus: 'Bus', van: 'Van', car: 'Car', other: 'Other' }

const columns = [
  { accessorKey: 'vehicle_number', header: 'Vehicle No.' },
  {
    accessorKey: 'vehicle_type',
    header: 'Type',
    cell: ({ getValue }) => TYPE_LABELS[getValue()] || getValue(),
  },
  { accessorKey: 'make_model', header: 'Make / Model' },
  { accessorKey: 'capacity', header: 'Capacity' },
  { accessorKey: 'driver_name', header: 'Driver' },
  { accessorKey: 'driver_phone', header: 'Phone' },
  { accessorKey: 'route_name', header: 'Route' },
]

export default function TransportVehiclesPage() {
  const navigate = useNavigate()

  return (
    <ResourceListPage
      title="Fleet & Vehicles"
      subtitle="Register buses, vans, drivers and link vehicles to routes"
      breadcrumb={[
        { label: 'Transport', href: '/transport' },
        { label: 'Vehicles' },
      ]}
      queryKey="transport-vehicles"
      listFn={transportService.vehicles.list}
      deleteFn={transportService.vehicles.delete}
      basePath="/transport/vehicles"
      columns={columns}
      onView={(item, id) => navigate(`/transport/vehicles/${resolveRecordId(item) || id}/edit`)}
    />
  )
}
