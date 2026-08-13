import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { transportService } from '@/api/services'
import { unwrapList } from '@/api/client'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'

export default function TransportVehicleForm() {
  const { schoolId } = useSchoolScopedSelection()

  const routesQuery = useQuery({
    queryKey: ['transport-routes-select', schoolId],
    queryFn: () => transportService.routes.list({ school: schoolId, page_size: 200, status: 'active' }),
    enabled: Boolean(schoolId),
  })

  const routeOptions = useMemo(
    () => (unwrapList(routesQuery.data).results || []).map((r) => ({
      label: `${r.name} (${r.code})`,
      value: r.route_id || r.id,
    })),
    [routesQuery.data],
  )

  const fields = useMemo(() => [
    { name: 'vehicle_number', label: 'Vehicle Number', type: 'text', required: true },
    {
      name: 'vehicle_type',
      label: 'Vehicle Type',
      type: 'select',
      options: [
        { label: 'Bus', value: 'bus' },
        { label: 'Van', value: 'van' },
        { label: 'Car', value: 'car' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'make_model', label: 'Make / Model', type: 'text' },
    { name: 'capacity', label: 'Seating Capacity', type: 'number', required: true },
    { name: 'driver_name', label: 'Driver Name', type: 'text' },
    { name: 'driver_phone', label: 'Driver Phone', type: 'text' },
    { name: 'conductor_name', label: 'Conductor Name', type: 'text' },
    { name: 'conductor_phone', label: 'Conductor Phone', type: 'text' },
    { name: 'gps_device_id', label: 'GPS Device ID', type: 'text' },
    { name: 'route', label: 'Assigned Route', type: 'select', options: routeOptions, placeholder: 'Optional route' },
    { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
    { name: 'is_active', label: 'Active', type: 'checkbox' },
  ], [routeOptions])

  return (
    <ResourceFormPage
      title="Vehicle"
      breadcrumb={[
        { label: 'Transport', href: '/transport' },
        { label: 'Vehicles', href: '/transport/vehicles' },
      ]}
      queryKey="transport-vehicles"
      getFn={transportService.vehicles.get}
      createFn={transportService.vehicles.create}
      updateFn={transportService.vehicles.update}
      basePath="/transport/vehicles"
      fields={fields}
      transformLoad={(item) => ({
        vehicle_number: item.vehicle_number || '',
        vehicle_type: item.vehicle_type || 'bus',
        make_model: item.make_model || '',
        capacity: item.capacity ?? 40,
        driver_name: item.driver_name || '',
        driver_phone: item.driver_phone || '',
        conductor_name: item.conductor_name || '',
        conductor_phone: item.conductor_phone || '',
        gps_device_id: item.gps_device_id || '',
        route: item.route || '',
        notes: item.notes || '',
        is_active: item.is_active ?? true,
      })}
      transformSubmit={(values) => ({
        ...values,
        capacity: Number(values.capacity) || 40,
        route: values.route || null,
        is_active: values.is_active !== false && values.is_active !== 'false',
      })}
    />
  )
}
