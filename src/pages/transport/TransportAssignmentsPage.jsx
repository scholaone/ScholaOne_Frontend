import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import ResourceListPage from '@/components/crud/ResourceListPage'
import { transportService, studentService } from '@/api/services'
import { unwrapList } from '@/api/client'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'
import { resolveRecordId } from '@/utils/record'

const columns = [
  { accessorKey: 'student_name', header: 'Student' },
  { accessorKey: 'admission_number', header: 'Admission No.' },
  { accessorKey: 'route_name', header: 'Route' },
  { accessorKey: 'stop_name', header: 'Stop' },
  { accessorKey: 'vehicle_number', header: 'Vehicle' },
  {
    accessorKey: 'monthly_fee',
    header: 'Monthly Fee',
    cell: ({ getValue }) => (getValue() != null ? `₹${getValue()}` : '—'),
  },
]

export default function TransportAssignmentsPage() {
  const navigate = useNavigate()

  return (
    <ResourceListPage
      title="Student Transport Assignments"
      subtitle="Assign learners to routes, pickup stops and vehicles"
      breadcrumb={[
        { label: 'Transport', href: '/transport' },
        { label: 'Assignments' },
      ]}
      queryKey="transport-assignments"
      listFn={transportService.assignments.list}
      deleteFn={transportService.assignments.delete}
      basePath="/transport/assignments"
      columns={columns}
      onView={(item, id) => navigate(`/transport/assignments/${resolveRecordId(item) || id}/edit`)}
    />
  )
}

export function TransportAssignmentForm() {
  const { schoolId } = useSchoolScopedSelection()

  const routesQuery = useQuery({
    queryKey: ['transport-routes-select', schoolId],
    queryFn: () => transportService.routes.list({ school: schoolId, page_size: 200 }),
    enabled: Boolean(schoolId),
  })
  const studentsQuery = useQuery({
    queryKey: ['transport-students-select', schoolId],
    queryFn: () => studentService.list({ school: schoolId, page_size: 200, status: 'active' }),
    enabled: Boolean(schoolId),
  })

  const routes = useMemo(
    () => unwrapList(routesQuery.data).results || [],
    [routesQuery.data],
  )
  const routeOptions = routes.map((r) => ({ label: `${r.name} (${r.code})`, value: r.route_id || r.id }))

  const fields = useMemo(() => [
    {
      name: 'student',
      label: 'Student',
      type: 'select',
      required: true,
      options: (unwrapList(studentsQuery.data).results || []).map((s) => ({
        label: `${s.full_name || s.student_name || 'Student'} (${s.admission_number || s.id})`,
        value: s.student_id || s.id,
      })),
    },
    { name: 'route', label: 'Route', type: 'select', required: true, options: routeOptions },
    { name: 'monthly_fee', label: 'Monthly Fee (₹)', type: 'number' },
    { name: 'effective_from', label: 'Effective From', type: 'date' },
    { name: 'effective_to', label: 'Effective To', type: 'date' },
    { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
    { name: 'is_active', label: 'Active', type: 'checkbox' },
  ], [routeOptions, studentsQuery.data])

  return (
    <ResourceFormPage
      title="Assignment"
      breadcrumb={[
        { label: 'Transport', href: '/transport' },
        { label: 'Assignments', href: '/transport/assignments' },
      ]}
      queryKey="transport-assignments"
      getFn={transportService.assignments.get}
      createFn={transportService.assignments.create}
      updateFn={transportService.assignments.update}
      basePath="/transport/assignments"
      fields={fields}
      transformLoad={(item) => ({
        student: item.student || '',
        route: item.route || '',
        stop: item.stop || '',
        vehicle: item.vehicle || '',
        monthly_fee: item.monthly_fee ?? '',
        effective_from: item.effective_from || '',
        effective_to: item.effective_to || '',
        notes: item.notes || '',
        is_active: item.is_active ?? true,
      })}
      transformSubmit={(values) => ({
        ...values,
        monthly_fee: values.monthly_fee === '' ? 0 : Number(values.monthly_fee),
        stop: values.stop || null,
        vehicle: values.vehicle || null,
        effective_from: values.effective_from || null,
        effective_to: values.effective_to || null,
        is_active: values.is_active !== false && values.is_active !== 'false',
      })}
    />
  )
}
