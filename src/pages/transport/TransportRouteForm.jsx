import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { transportService } from '@/api/services'

const FIELDS = [
  { name: 'name', label: 'Route Name', type: 'text', required: true, fullWidth: true },
  { name: 'code', label: 'Route Code', type: 'text', required: true, readOnlyOnEdit: true },
  { name: 'start_point', label: 'Start Point', type: 'text' },
  { name: 'end_point', label: 'End Point', type: 'text' },
  { name: 'distance_km', label: 'Distance (km)', type: 'number' },
  { name: 'monthly_fee', label: 'Monthly Fee (₹)', type: 'number' },
    { name: 'morning_pickup_time', label: 'Morning Pickup (HH:MM)', type: 'text', placeholder: '07:30' },
    { name: 'evening_drop_time', label: 'Evening Drop (HH:MM)', type: 'text', placeholder: '15:30' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
  { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
  { name: 'is_active', label: 'Active', type: 'checkbox' },
]

export default function TransportRouteForm() {
  return (
    <ResourceFormPage
      title="Route"
      breadcrumb={[
        { label: 'Transport', href: '/transport' },
        { label: 'Routes', href: '/transport/routes' },
      ]}
      queryKey="transport-routes"
      getFn={transportService.routes.get}
      createFn={transportService.routes.create}
      updateFn={transportService.routes.update}
      basePath="/transport/routes"
      fields={FIELDS}
      transformLoad={(item) => ({
        name: item.name || '',
        code: item.code || '',
        start_point: item.start_point || '',
        end_point: item.end_point || '',
        distance_km: item.distance_km ?? '',
        monthly_fee: item.monthly_fee ?? 0,
        morning_pickup_time: item.morning_pickup_time || '',
        evening_drop_time: item.evening_drop_time || '',
        status: item.status || 'active',
        description: item.description || '',
        is_active: item.is_active ?? true,
      })}
      transformSubmit={(values) => ({
        ...values,
        distance_km: values.distance_km === '' ? null : Number(values.distance_km),
        monthly_fee: Number(values.monthly_fee) || 0,
        is_active: values.is_active !== false && values.is_active !== 'false',
      })}
    />
  )
}
