import { Link } from 'react-router-dom'
import { FiBell, FiFileText, FiMail, FiMessageSquare, FiSend } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { HubPageShell, HubLinkCard, HubSectionTitle, HubInfoCard } from '@/components/hub/HubWidgets'
import Card from '@/components/ui/Card'

const QUICK_LINKS = [
  { label: 'Announcements', path: '/announcements', icon: FiBell, desc: 'School-wide announcements' },
  { label: 'Circulars', path: '/circulars', icon: FiFileText, desc: 'Official circulars & notices' },
  { label: 'Notifications', path: '/communications/notifications', icon: FiMessageSquare, desc: 'Targeted notifications' },
  { label: 'Templates', path: '/communications/templates', icon: FiMail, desc: 'Reusable email, SMS & push templates' },
  { label: 'All Messages', path: '/communications/messages', icon: FiSend, desc: 'Schedule, send & track delivery' },
]

const CHANNELS = [
  { label: 'Email', desc: 'SMTP delivery via school settings' },
  { label: 'SMS', desc: 'Twilio / SMS provider integration' },
  { label: 'WhatsApp', desc: 'WhatsApp messaging (stub ready)' },
  { label: 'Push', desc: 'In-app notifications for users' },
]

export default function CommunicationsHubPage() {
  return (
    <HubPageShell className="space-y-8">
      <Breadcrumb items={[{ label: 'Communications' }]} />
      <PageHeader
        title="Communications"
        subtitle="Announcements, circulars, multi-channel messaging, templates & delivery reports"
        actions={
          <Link to="/communications/messages/new"><Button><FiSend /> Compose Message</Button></Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map((item) => (
          <HubLinkCard key={item.path} to={item.path} icon={item.icon} label={item.label} description={item.desc} />
        ))}
      </div>

      <div>
        <HubSectionTitle title="Supported Channels" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map((ch) => (
            <Card key={ch.label} className="p-4">
              <p className="font-medium text-[var(--clay-primary)]">{ch.label}</p>
              <p className="mt-1 text-xs text-[var(--clay-primary-soft)]">{ch.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <HubInfoCard title="Audience targeting">
        Send to Students, Teachers, Parents, Staff, or all school users. Optionally filter by class section.
        Parent communication preferences are respected for email, SMS, and push channels.
      </HubInfoCard>
    </HubPageShell>
  )
}
