import '@/styles/teacher-profile.css'

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiBookOpen,
  FiBriefcase,
  FiCamera,
  FiClock,
  FiKey,
  FiMail,
  FiPhone,
  FiRefreshCw,
  FiShield,
  FiUsers,
} from 'react-icons/fi'
import Button from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/Feedback'
import { formatClassTeacherLabel } from '@/components/teachers/TeacherPhotoField'
import TeacherAttendanceDots from '@/components/teachers/portal/TeacherAttendanceDots'
import { formatExperiencePeriod } from '@/utils/teacherExperience'
import { cn, formatDate, formatDateTime, fromNow, resolveMediaUrl } from '@/utils/format'

const DETAIL_TABS = [
  { key: 'personal', label: 'Personal' },
  { key: 'qualifications', label: 'Qualifications' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'account', label: 'Account' },
]

function DetailRow({ label, value }) {
  return (
    <div className="tp-detail-row">
      <dt>{label}</dt>
      <dd>{value || '—'}</dd>
    </div>
  )
}

function MiniStat({ icon: Icon, label, value, tone = 'mint' }) {
  return (
    <div className={cn('tp-mini-stat', `tp-mini-stat--${tone}`)}>
      <span className="tp-mini-stat__icon">
        <Icon aria-hidden />
      </span>
      <div>
        <p className="tp-mini-stat__label">{label}</p>
        <p className="tp-mini-stat__value">{value || '—'}</p>
      </div>
    </div>
  )
}

function ListBlock({ title, items, renderItem, empty }) {
  return (
    <div className="tp-list-block">
      <h4>{title}</h4>
      {items?.length ? (
        <ul>
          {items.map((item) => (
            <li key={item.id || item.qualification_id || item.experience_id || item.assignment_id}>
              {renderItem(item)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="tp-list-block__empty">{empty}</p>
      )}
    </div>
  )
}

export default function TeacherPortalProfile({
  teacher,
  profile,
  roleLabel,
  photoUpload,
  onRefresh,
  refreshing = false,
  error = null,
  onRetry,
}) {
  const [tab, setTab] = useState('personal')
  const [imageFailed, setImageFailed] = useState(false)

  const displayName = teacher?.full_name || profile?.full_name || 'Teacher'
  const email = teacher?.email || profile?.email
  const employeeId = teacher?.employee_id || profile?.employee_id
  const designation = teacher?.designation || teacher?.academic_role_display || roleLabel
  const classLabel = formatClassTeacherLabel(teacher?.class_teacher_mappings)
  const photoUrl = photoUpload?.photoFieldProps?.currentUrl || resolveMediaUrl(teacher?.photo_url)

  const languages = useMemo(() => {
    if (Array.isArray(teacher?.languages_known)) return teacher.languages_known.join(', ')
    return teacher?.languages_known || ''
  }, [teacher?.languages_known])

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />
  }

  if (!teacher) {
    return <div className="tp-skeleton" aria-hidden />
  }

  const pendingLeave = (teacher.leave_requests || []).filter((l) => l.status === 'pending').length
  const subjectCount = teacher.subject_assignments?.length || 0

  return (
    <div className="teacher-profile-portal">
      <div className="tp-toolbar">
        <div>
          <p className="tp-toolbar__crumb">Portal · Profile</p>
          <h1 className="tp-toolbar__title">Hello, {profile?.first_name || displayName.split(' ')[0] || 'Teacher'} 👋</h1>
        </div>
        <div className="tp-toolbar__actions">
          <Button variant="secondary" size="sm" onClick={onRefresh} loading={refreshing}>
            <FiRefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Link to="/change-password">
            <Button variant="outline" size="sm">
              <FiKey className="h-4 w-4" />
              Password
            </Button>
          </Link>
        </div>
      </div>

      <div className="tp-hero-grid">
        {/* Profile card */}
        <div className="tp-profile-card">
          <div className="tp-profile-card__media">
            {photoUrl && !imageFailed ? (
              <img src={photoUrl} alt={displayName} onError={() => setImageFailed(true)} />
            ) : (
              <div className="tp-profile-card__fallback">
                {displayName
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0]?.toUpperCase())
                  .join('') || 'T'}
              </div>
            )}
            {photoUpload?.photoFieldProps?.editable !== false ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  id="tp-photo-input"
                  disabled={photoUpload?.photoFieldProps?.uploading}
                  onChange={(e) => {
                    photoUpload?.photoFieldProps?.onFileChange?.(e.target.files?.[0] || null)
                    e.target.value = ''
                  }}
                />
                <label htmlFor="tp-photo-input" className="tp-profile-card__camera" aria-label="Change photo">
                  <FiCamera />
                </label>
              </>
            ) : null}
          </div>
          <div className="tp-profile-card__footer">
            <div>
              <h2>{displayName}</h2>
              <p>{designation}</p>
              {email ? <p className="tp-profile-card__email">{email}</p> : null}
              {employeeId ? (
                <p className="tp-profile-card__emp">
                  <span>Employee ID</span> {employeeId}
                </p>
              ) : null}
            </div>
            <div className="tp-profile-card__actions">
              {teacher.mobile_number ? (
                <a href={`tel:${teacher.mobile_number}`} className="tp-icon-btn" aria-label="Call">
                  <FiPhone />
                </a>
              ) : null}
              {email ? (
                <a href={`mailto:${email}`} className="tp-icon-btn" aria-label="Email">
                  <FiMail />
                </a>
              ) : null}
            </div>
          </div>
          {(classLabel || roleLabel) && (
            <div className="tp-profile-card__tags">
              {classLabel ? <span className="tp-tag">{classLabel}</span> : null}
              {roleLabel ? <span className="tp-tag tp-tag--soft">{roleLabel}</span> : null}
            </div>
          )}
        </div>

        {/* Attendance dots */}
        <TeacherAttendanceDots attendanceRecords={teacher.attendance_records || []} />

        {/* Side stats */}
        <div className="tp-side-stack">
          <MiniStat icon={FiBookOpen} label="Subjects assigned" value={subjectCount} tone="teal" />
          <MiniStat
            icon={FiUsers}
            label="Class teacher"
            value={classLabel || 'Not assigned'}
            tone="mint"
          />
          <MiniStat icon={FiBriefcase} label="School" value={teacher.school_name} tone="slate" />
          <MiniStat icon={FiClock} label="Pending leave" value={pendingLeave} tone="amber" />

          <div className="tp-account-card">
            <p className="tp-account-card__title">Account</p>
            <div className="tp-account-card__rows">
              <div>
                <span>Status</span>
                <strong className={profile?.is_active ? 'tp-text-ok' : 'tp-text-muted'}>
                  {profile?.is_active ? 'Active' : 'Inactive'}
                </strong>
              </div>
              <div>
                <span>Last login</span>
                <strong>{profile?.last_login ? fromNow(profile.last_login) : '—'}</strong>
              </div>
              <div>
                <span>Member since</span>
                <strong>{profile?.created_at ? formatDate(profile.created_at, 'MMM YYYY') : '—'}</strong>
              </div>
              {profile?.email_verified ? (
                <div className="tp-verified">
                  <FiShield aria-hidden />
                  Email verified
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Details tabs */}
      <div className="tp-details">
        <div className="tp-tabs">
          {DETAIL_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={cn('tp-tab', tab === t.key && 'tp-tab--active')}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="tp-details__body">
          {tab === 'personal' && (
            <dl className="tp-details-grid">
              <DetailRow label="Employee ID" value={teacher.employee_id} />
              <DetailRow label="Teacher Code" value={teacher.teacher_code} />
              <DetailRow label="Status" value={teacher.status_display || teacher.status} />
              <DetailRow label="Academic Role" value={teacher.academic_role_display || teacher.academic_role} />
              <DetailRow label="Department" value={teacher.department} />
              <DetailRow label="Mobile" value={teacher.mobile_number} />
              <DetailRow label="Specialization" value={teacher.specialization} />
              <DetailRow label="Qualification Summary" value={teacher.qualification_summary} />
              <DetailRow label="Joining Date" value={teacher.joining_date} />
              <DetailRow label="Date of Birth" value={teacher.date_of_birth} />
              <DetailRow label="Gender" value={teacher.gender} />
              <DetailRow label="Blood Group" value={teacher.blood_group} />
              <DetailRow label="Nationality" value={teacher.nationality} />
              <DetailRow label="Languages" value={languages} />
              <DetailRow label="Address" value={[teacher.address, teacher.city, teacher.state].filter(Boolean).join(', ')} />
              <DetailRow label="Emergency Contact" value={[teacher.emergency_contact_name, teacher.emergency_contact_phone].filter(Boolean).join(' · ')} />
              <DetailRow label="Bio" value={teacher.bio} />
            </dl>
          )}

          {tab === 'qualifications' && (
            <div className="tp-qualifications-stack">
              <ListBlock
                title="Qualifications"
                items={teacher.qualifications}
                empty="No qualifications recorded yet."
                renderItem={(q) => (
                  <>
                    <strong>{q.degree}</strong> — {q.institution}
                    {q.year_completed ? ` (${q.year_completed})` : ''}
                  </>
                )}
              />
              <ListBlock
                title="Experience"
                items={teacher.experiences}
                empty="No experience records yet."
                  renderItem={(e) => (
                    <>
                      <strong>{e.organization_name}</strong>
                      {e.role ? ` — ${e.role}` : ''}
                      <span className="tp-list-meta">
                        {formatExperiencePeriod(e)}
                        {e.is_current ? ' · Current' : ''}
                      </span>
                      {e.description ? <span className="tp-list-meta">{e.description}</span> : null}
                    </>
                  )}
              />
            </div>
          )}

          {tab === 'assignments' && (
            <div className="tp-split">
              <ListBlock
                title="Subject Assignments"
                items={teacher.subject_assignments}
                empty="No subject assignments yet."
                renderItem={(s) => (
                  <>
                    {[s.subject_name, s.class_name, s.section_name].filter(Boolean).join(' · ')}
                    {s.academic_year ? ` · ${s.academic_year}` : ''}
                  </>
                )}
              />
              <ListBlock
                title="Class Teacher"
                items={teacher.class_teacher_mappings}
                empty="Not assigned as class teacher."
                renderItem={(m) => (
                  <>
                    {[m.class_name, m.section_name].filter(Boolean).join(' ')}
                    {m.academic_year ? ` (${m.academic_year})` : ''}
                  </>
                )}
              />
              <ListBlock
                title="Academic Duties"
                items={teacher.academic_assignments}
                empty="No academic assignments yet."
                renderItem={(a) => (
                  <>
                    {a.assignment_type} — {a.subject_name || a.title || a.class_section_name || '—'}
                    {a.periods_per_week ? ` · ${a.periods_per_week} periods/week` : ''}
                  </>
                )}
              />
            </div>
          )}

          {tab === 'account' && (
            <dl className="tp-details-grid">
              <DetailRow label="Username" value={profile?.username || teacher.username} />
              <DetailRow label="Primary Email" value={profile?.primary_email || email} />
              <DetailRow label="Organization" value={profile?.organization_name} />
              <DetailRow label="Portal Access" value={teacher.portal_access ? 'Yes' : 'No'} />
              <DetailRow label="Mobile App" value={teacher.mobile_app_access ? 'Yes' : 'No'} />
              <DetailRow label="Last Login" value={formatDateTime(profile?.last_login)} />
              <DetailRow label="Last Activity" value={formatDateTime(profile?.last_activity_at)} />
              <DetailRow label="Last Device" value={profile?.last_device_label} />
              <DetailRow label="Two-Factor Auth" value={profile?.mfa_enabled ? 'Enabled' : 'Not enabled'} />
            </dl>
          )}
        </div>
      </div>
    </div>
  )
}
