import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FiUsers,
  FiBookOpen,
  FiUserPlus,
  FiCalendar,
  FiActivity,
  FiSettings,
} from 'react-icons/fi'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, StatCard } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { teacherService } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

const QUICK_LINKS = [
  { to: '/teachers/roster', label: 'Teacher Roster', icon: FiUsers, desc: 'Profiles & academic roles' },
  { to: '/teachers/new', label: 'Add Teacher', icon: FiUserPlus, desc: 'Create academic staff login' },
  { to: '/academic', label: 'Academic Foundation', icon: FiBookOpen, desc: 'Years, subjects, sections' },
]

export default function TeachersHubPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined

  const dashQuery = useQuery({
    queryKey: ['teacher-dashboard', schoolId],
    queryFn: () => teacherService.dashboard(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const dash = useMemo(() => unwrap(dashQuery.data), [dashQuery.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Staff Management"
        description="Single source of truth for teachers — foundation for timetable, assessment & LMS"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/teachers/roster">
              <Button variant="primary"><FiUsers className="h-4 w-4" /> Roster</Button>
            </Link>
            <Link to="/teachers/new">
              <Button variant="secondary"><FiUserPlus className="h-4 w-4" /> New Teacher</Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Teachers" value={String(dash.total_teachers ?? '—')} icon={FiUsers} />
        <StatCard title="Active" value={String(dash.active ?? '—')} icon={FiActivity} color="success" />
        <StatCard title="Subject Assignments" value={String(dash.subject_assignments ?? '—')} icon={FiBookOpen} />
        <StatCard title="Class Teachers" value={String(dash.class_teachers ?? '—')} icon={FiCalendar} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Multi-School Engagements" value={String(dash.multi_school_engagements ?? '—')} icon={FiSettings} />
        {Object.entries(dash.by_role || {}).slice(0, 3).map(([role, count]) => (
          <StatCard key={role} title={role.replace(/_/g, ' ')} value={String(count)} icon={FiUsers} />
        ))}
      </div>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">Quick links</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="rounded-xl border border-border p-4 transition hover:border-primary/40 hover:bg-muted/40"
            >
              <item.icon className="mb-2 h-5 w-5 text-primary" />
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-muted">{item.desc}</div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}
