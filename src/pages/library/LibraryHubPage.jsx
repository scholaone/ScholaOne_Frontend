import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FiBook,
  FiBookOpen,
  FiClock,
  FiFileText,
  FiRepeat,
  FiUsers,
} from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { HubPageShell, HubStatGrid, HubLinkCard, HubInfoCard } from '@/components/hub/HubWidgets'
import { PageLoader } from '@/components/ui/Feedback'
import { libraryService } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'
import { unwrapData } from '@/api/client'

const QUICK_LINKS = [
  { label: 'Book Catalog', path: '/library/books', icon: FiBookOpen, desc: 'Add titles, ISBN, copies & shelf locations' },
  { label: 'Issue & Return', path: '/library/circulation', icon: FiRepeat, desc: 'Lend books, track due dates & fines' },
  { label: 'Issued & Returned Report', path: '/library/reports/issued-returned', icon: FiFileText, desc: 'Filter and export circulation history' },
  { label: 'Members', path: '/library/members', icon: FiUsers, desc: 'Library cards, limits & outstanding fines' },
]

export default function LibraryHubPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined

  const dashQuery = useQuery({
    queryKey: ['library-dashboard', schoolId],
    queryFn: () => libraryService.dashboard(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const dash = unwrapData(dashQuery.data) || {}

  if (dashQuery.isLoading && (schoolId || user?.is_super_admin)) {
    return <PageLoader label="Loading library dashboard…" />
  }

  return (
    <HubPageShell className="space-y-8">
      <Breadcrumb items={[{ label: 'Library' }]} />
      <PageHeader
        title="Library"
        subtitle="Catalog, circulation, members & fines — same polished experience as LMS modules"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/library/books/new"><Button variant="secondary"><FiBookOpen /> Add Book</Button></Link>
            <Link to="/library/circulation"><Button><FiRepeat /> Issue Book</Button></Link>
          </div>
        }
      />

      <HubStatGrid
        stats={[
          { label: 'Titles in Catalog', value: dash.total_books ?? '—' },
          { label: 'Copies Available', value: dash.available_copies ?? '—' },
          { label: 'Currently Issued', value: dash.active_issues ?? '—' },
          { label: 'Overdue', value: dash.overdue_issues ?? '—' },
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
        <HubInfoCard title="Circulation at a glance">
          <ul className="space-y-2">
            <li className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2"><FiBook className="text-[var(--clay-teal)]" /> Total copies</span>
              <strong>{dash.total_copies ?? '—'}</strong>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2"><FiRepeat className="text-[var(--clay-teal)]" /> Issued copies</span>
              <strong>{dash.issued_copies ?? '—'}</strong>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2"><FiUsers className="text-[var(--clay-teal)]" /> Members with books</span>
              <strong>{dash.members_with_books ?? '—'}</strong>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2"><FiClock className="text-[var(--clay-teal)]" /> Outstanding fines</span>
              <strong>{dash.outstanding_fines != null ? `₹${dash.outstanding_fines}` : '—'}</strong>
            </li>
          </ul>
        </HubInfoCard>
        <HubInfoCard title="Workflow tips">
          Set issue limits per member, block accounts with pending fines, and return books from the circulation desk.
          Overdue items are flagged automatically — fines accrue per day until return.
        </HubInfoCard>
      </div>
    </HubPageShell>
  )
}
