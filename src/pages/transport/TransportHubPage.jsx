import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FiMap,
  FiTruck,
  FiUsers,
} from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { HubPageShell, HubStatGrid, HubLinkCard, HubInfoCard } from '@/components/hub/HubWidgets'
import { PageLoader } from '@/components/ui/Feedback'
import { transportService } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'
import { unwrapData } from '@/api/client'

const QUICK_LINKS = [
  { label: 'Routes', path: '/transport/routes', icon: FiMap, desc: 'Define routes, timings, distance & monthly fees' },
  { label: 'Vehicles', path: '/transport/vehicles', icon: FiTruck, desc: 'Fleet registry with drivers, capacity & GPS IDs' },
  { label: 'Student Assignments', path: '/transport/assignments', icon: FiUsers, desc: 'Assign students to routes, stops & vehicles' },
]

export default function TransportHubPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined

  const dashQuery = useQuery({
    queryKey: ['transport-dashboard', schoolId],
    queryFn: () => transportService.dashboard(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const dash = unwrapData(dashQuery.data) || {}

  if (dashQuery.isLoading && (schoolId || user?.is_super_admin)) {
    return <PageLoader label="Loading transport dashboard…" />
  }

  return (
    <HubPageShell className="space-y-8">
      <Breadcrumb items={[{ label: 'Transport' }]} />
      <PageHeader
        title="Transport"
        subtitle="Routes, fleet, pickup stops and student assignments — enterprise school transport desk"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/transport/routes/new"><Button variant="secondary"><FiMap /> Add Route</Button></Link>
            <Link to="/transport/assignments/new"><Button><FiUsers /> Assign Student</Button></Link>
          </div>
        }
      />

      <HubStatGrid
        stats={[
          { label: 'Active Routes', value: dash.active_routes ?? '—' },
          { label: 'Vehicles', value: dash.total_vehicles ?? '—' },
          { label: 'Students Assigned', value: dash.students_assigned ?? '—' },
          { label: 'Total Capacity', value: dash.total_capacity ?? '—' },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map((item) => (
          <HubLinkCard
            key={item.path}
            to={item.path}
            icon={item.icon}
            label={item.label}
            description={item.desc}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <HubInfoCard title="Network summary">
          <ul className="space-y-2">
            <li className="flex justify-between gap-3"><span>Total routes</span><strong>{dash.total_routes ?? '—'}</strong></li>
            <li className="flex justify-between gap-3"><span>Pickup stops</span><strong>{dash.total_stops ?? '—'}</strong></li>
            <li className="flex justify-between gap-3"><span>Seats available*</span><strong>{dash.unassigned_students_hint ?? '—'}</strong></li>
          </ul>
          <p className="mt-3 text-xs opacity-80">*Estimated spare capacity based on vehicle seats minus assigned students.</p>
        </HubInfoCard>
        <HubInfoCard title="Student SIS sync">
          Assignments automatically update each student&apos;s transport profile (route, stop, vehicle, driver & fee).
          Fee structures for transport billing remain under Fees → Transport structures.
        </HubInfoCard>
      </div>
    </HubPageShell>
  )
}
