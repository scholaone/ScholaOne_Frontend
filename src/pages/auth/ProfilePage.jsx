import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiGlobe,
  FiKey,
  FiMail,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiShield,
  FiSmartphone,
  FiUser,
} from 'react-icons/fi'
import { authService } from '@/api/services'
import { unwrapData } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import Breadcrumb from '@/components/layout/Breadcrumb'
import Button from '@/components/ui/Button'
import { Card, PageHeader } from '@/components/ui/Card'
import { Avatar, PageLoader, StatusBadge } from '@/components/ui/Feedback'
import { cn, formatDate, formatDateTime, fromNow, resolveMediaUrl } from '@/utils/format'

function getRoleLabel(user) {
  if (user?.is_super_admin) return 'Super Admin'
  if (user?.is_org_admin) return 'Organization Admin'
  if (user?.is_school_admin) return 'School Admin'
  if (user?.is_staff) return 'Staff'
  return 'User'
}

function getRoleTone(user) {
  if (user?.is_super_admin) return 'bg-violet-100 text-violet-700 ring-violet-200'
  if (user?.is_org_admin) return 'bg-sky-100 text-sky-700 ring-sky-200'
  if (user?.is_school_admin) return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
  return 'bg-slate-100 text-slate-700 ring-slate-200'
}

function InfoTile({ icon: Icon, label, value, className }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/70 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm',
        className,
      )}
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-text">{value || '—'}</dd>
    </div>
  )
}

function SectionCard({ title, description, children, className }) {
  return (
    <Card className={cn('overflow-hidden p-0', className)}>
      <div className="border-b border-border/70 bg-slate-50/60 px-6 py-4">
        <h3 className="text-base font-bold text-text">{title}</h3>
        {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
      </div>
      <div className="p-6">{children}</div>
    </Card>
  )
}

function StatPill({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-brand-100/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-sm font-bold text-text">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
    </div>
  )
}

export default function ProfilePage() {
  const { user: authUser, refreshProfile } = useAuth()

  const profileQuery = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: () => authService.profile(),
    staleTime: 60_000,
  })

  const profile = unwrapData(profileQuery.data)?.user || authUser
  const displayName =
    profile?.full_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || profile?.email
  const profileImage = resolveMediaUrl(profile?.profile_image || profile?.profile_photo)
  const roleLabel = getRoleLabel(profile)

  const handleRefresh = async () => {
    await profileQuery.refetch()
    await refreshProfile?.()
  }

  if (profileQuery.isLoading && !profile) {
    return <PageLoader />
  }

  return (
    <div className="w-full min-w-0 print:text-black">
      <div className="print:hidden">
        <Breadcrumb items={[{ label: 'Profile' }]} />
      </div>

      <PageHeader
        className="print:hidden"
        title="My Profile"
        subtitle="Your account details, access, and activity"
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              loading={profileQuery.isFetching}
            >
              <FiRefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Link to="/change-password">
              <Button variant="outline" size="sm">
                <FiKey className="h-4 w-4" />
                Change Password
              </Button>
            </Link>
          </>
        }
      />

      {/* Hero */}
      <Card padding={false} className="overflow-hidden border-brand-100/60 bg-white print:border print:shadow-none">
        <div className="relative h-32 sm:h-36 bg-gradient-to-br from-brand-50 via-indigo-50/90 to-sky-50 print:h-24 print:bg-white">
          <div
            className="absolute inset-0 opacity-80 print:hidden"
            style={{
              backgroundImage:
                'radial-gradient(circle at 15% 30%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(circle at 85% 10%, rgba(14,165,233,0.06) 0%, transparent 45%)',
            }}
          />
        </div>

        <div className="relative bg-white px-6 pb-6 pt-0 sm:px-8">
          <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between print:mt-4 print:flex-row print:items-center">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
              <div className="relative shrink-0">
                <div className="rounded-full bg-white p-1.5 shadow-md ring-4 ring-white print:shadow-none print:ring-0">
                  <Avatar
                    name={displayName}
                    src={profileImage}
                    size="2xl"
                    className="!h-24 !w-24 sm:!h-28 sm:!w-28 print:!h-20 print:!w-20"
                  />
                </div>
                <span
                  className={cn(
                    'absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white print:hidden',
                    profile?.is_active ? 'bg-emerald-500' : 'bg-slate-400',
                  )}
                  title={profile?.is_active ? 'Active' : 'Inactive'}
                />
              </div>

              <div className="text-center sm:pb-1 sm:text-left">
                <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">{displayName}</h2>
                <p className="mt-1 text-sm text-muted">{profile?.email}</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
                      getRoleTone(profile),
                    )}
                  >
                    {roleLabel}
                  </span>
                  <StatusBadge active={profile?.is_active} />
                  {profile?.email_verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                      <FiShield className="h-3 w-3" />
                      Verified
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="hidden gap-3 sm:grid sm:grid-cols-3 print:hidden">
              <StatPill
                label="Last login"
                value={profile?.last_login ? fromNow(profile.last_login) : '—'}
                hint={profile?.last_login ? formatDateTime(profile.last_login) : undefined}
              />
              <StatPill
                label="Member since"
                value={profile?.created_at ? formatDate(profile.created_at, 'MMM YYYY') : '—'}
                hint={profile?.created_at ? formatDate(profile.created_at) : undefined}
              />
              <StatPill
                label="Username"
                value={profile?.username || '—'}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Mobile stat strip */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:hidden print:hidden">
        <Card className="grid grid-cols-2 gap-3 p-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Last login</p>
            <p className="mt-1 text-sm font-semibold text-text">
              {profile?.last_login ? fromNow(profile.last_login) : '—'}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Member since</p>
            <p className="mt-1 text-sm font-semibold text-text">
              {profile?.created_at ? formatDate(profile.created_at, 'MMM YYYY') : '—'}
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 print:mt-4 print:grid-cols-1 print:gap-4">
        <SectionCard title="Personal information" description="Basic identity details on your account">
          <dl className="grid gap-3 sm:grid-cols-2">
            <InfoTile icon={FiUser} label="Full name" value={displayName} className="sm:col-span-2" />
            <InfoTile icon={FiUser} label="First name" value={profile?.first_name} />
            <InfoTile icon={FiUser} label="Last name" value={profile?.last_name} />
            <InfoTile icon={FiUser} label="Username" value={profile?.username} />
            <InfoTile icon={FiBriefcase} label="Employee ID" value={profile?.employee_id} />
            <InfoTile
              icon={FiGlobe}
              label="Preferred language"
              value={profile?.preferred_language?.toUpperCase?.() || profile?.preferred_language}
            />
            <InfoTile icon={FiMapPin} label="Timezone" value={profile?.timezone_name} />
          </dl>
        </SectionCard>

        <SectionCard title="Contact" description="How we reach you for account updates">
          <dl className="grid gap-3 sm:grid-cols-2">
            <InfoTile icon={FiMail} label="Primary email" value={profile?.primary_email || profile?.email} />
            <InfoTile icon={FiMail} label="Secondary email" value={profile?.secondary_email} />
            <InfoTile icon={FiPhone} label="Primary phone" value={profile?.primary_phone || profile?.mobile_number} />
            <InfoTile icon={FiSmartphone} label="Secondary phone" value={profile?.secondary_phone} />
          </dl>
        </SectionCard>

        <SectionCard title="Work & access" description="Organization context and permissions">
          <dl className="grid gap-3 sm:grid-cols-2">
            <InfoTile icon={FiBriefcase} label="Organization" value={profile?.organization_name} />
            <InfoTile icon={FiBriefcase} label="School" value={profile?.school_name} />
            <InfoTile icon={FiShield} label="Role" value={roleLabel} />
            <InfoTile
              icon={FiShield}
              label="Account status"
              value={profile?.account_status || (profile?.is_active ? 'Active' : 'Inactive')}
            />
          </dl>
        </SectionCard>

        <SectionCard title="Security & activity" description="Recent sign-in and device information">
          <dl className="grid gap-3 sm:grid-cols-2">
            <InfoTile icon={FiClock} label="Last login" value={formatDateTime(profile?.last_login)} />
            <InfoTile icon={FiCalendar} label="Last activity" value={formatDateTime(profile?.last_activity_at)} />
            <InfoTile icon={FiGlobe} label="Last login IP" value={profile?.last_login_ip} />
            <InfoTile icon={FiSmartphone} label="Last device" value={profile?.last_device_label} />
            <InfoTile
              icon={FiShield}
              label="Two-factor auth"
              value={profile?.mfa_enabled ? 'Enabled' : 'Not enabled'}
            />
            <InfoTile
              icon={FiKey}
              label="Password change required"
              value={profile?.must_change_password ? 'Yes' : 'No'}
            />
          </dl>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-border/70 pt-5 print:hidden">
            <Link to="/change-password">
              <Button variant="primary" size="sm">
                <FiKey className="h-4 w-4" />
                Update password
              </Button>
            </Link>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
