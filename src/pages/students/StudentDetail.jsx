import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  FiCreditCard,
  FiDownload,
  FiKey,
  FiMail,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiUser,
} from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { PageLoader, ErrorState, Avatar, StatusBadge } from '@/components/ui/Feedback'
import { ApplicationFormReadonly } from '@/features/admissions/components/ApplicationFormReadonly'
import { studentService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import { STUDENT_STATUS_OPTIONS } from '@/config/constants'
import { resolveMediaUrl } from '@/utils/format'
import { cn } from '@/lib/utils'
import ProfilePhotoFrame from '@/components/common/ProfilePhotoFrame'
import StudentCredentialsModal from '@/components/students/StudentCredentialsModal'
import { compressImageFile } from '@/utils/imageCompress'

const PRIMARY_TABS = [
  { key: 'overview', label: 'Profile' },
  { key: 'family', label: 'Family' },
  { key: 'admission', label: 'Full Application' },
  { key: 'academic', label: 'Academic' },
  { key: 'medical', label: 'Medical' },
  { key: 'transport', label: 'Transport' },
  { key: 'hostel', label: 'Hostel' },
  { key: 'documents', label: 'Documents' },
  { key: 'more', label: 'More' },
]

const MORE_TABS = [
  { key: 'achievements', label: 'Achievements' },
  { key: 'discipline', label: 'Discipline' },
  { key: 'siblings', label: 'Siblings' },
  { key: 'promotion', label: 'Promotion' },
  { key: 'certificates', label: 'Certificates' },
  { key: 'idcard', label: 'ID Card' },
]

function display(value) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  if (value == null || value === '') return '—'
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—'
  return String(value)
}

function Field({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg bg-sky-50/60 px-3 py-2.5">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-slate-800">{display(value)}</dd>
    </div>
  )
}

function Section({ title, children, className, action, hint }) {
  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-sky-100 pb-2">
        <div>
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function Grid({ children, cols = 'default' }) {
  return (
    <dl
      className={cn(
        'grid gap-3',
        cols === '2' ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3',
      )}
    >
      {children}
    </dl>
  )
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-sky-800 ring-1 ring-sky-100">
      {children}
    </span>
  )
}

function SoftCard({ children, className }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_1px_2px_rgba(14,165,233,0.06)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

function PersonCard({ name, photo, subtitle, relation, email, mobile, badges = [], meta = [] }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/40 p-4">
      <Avatar name={name || 'Person'} src={photo} size="xl" className="ring-sky-100" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-slate-800">{name || '—'}</p>
            {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
            {relation ? (
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-teal-700">
                {relation}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-1">
            {badges.map((b) => (
              <span
                key={b}
                className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700 ring-1 ring-teal-100"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
          {mobile ? (
            <span className="inline-flex items-center gap-1.5">
              <FiPhone className="h-3.5 w-3.5 shrink-0 text-sky-500" />
              {mobile}
            </span>
          ) : null}
          {email ? (
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <FiMail className="h-3.5 w-3.5 shrink-0 text-sky-500" />
              <span className="truncate">{email}</span>
            </span>
          ) : null}
        </div>
        {meta.length > 0 ? (
          <dl className="grid gap-2 sm:grid-cols-2">
            {meta.map((m) => (
              <Field key={m.label} label={m.label} value={m.value} />
            ))}
          </dl>
        ) : null}
      </div>
    </div>
  )
}

function GuardianFromDraft({ title, person, linkedPhoto }) {
  if (!person?.name && !person?.mobile && !person?.email) return null
  return (
    <PersonCard
      name={person.name}
      photo={linkedPhoto}
      relation={title}
      email={person.email}
      mobile={person.mobile}
      meta={[
        { label: 'Qualification', value: person.qualification },
        { label: 'Occupation', value: person.occupation },
        { label: 'Company', value: person.company_name },
        { label: 'Annual Income', value: person.annual_income },
      ]}
    />
  )
}

function matchParentPhoto(links, person = {}) {
  const email = (person.email || '').trim().toLowerCase()
  const mobile = (person.mobile || '').trim()
  const name = (person.name || '').trim().toLowerCase()
  const hit =
    links.find((l) => email && (l.parent_email || '').toLowerCase() === email) ||
    links.find((l) => mobile && (l.parent_mobile || '') === mobile) ||
    links.find((l) => name && (l.parent_name || '').toLowerCase() === name)
  return resolveMediaUrl(hit?.photo_url)
}

export default function StudentDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('overview')
  const [credentialsOpen, setCredentialsOpen] = useState(false)
  const [transportForm, setTransportForm] = useState({})
  const [hostelForm, setHostelForm] = useState({})
  const [medicalForm, setMedicalForm] = useState({})
  const [achievementForm, setAchievementForm] = useState({ title: '', category: '' })
  const [docFile, setDocFile] = useState(null)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['students', id],
    queryFn: () => studentService.get(id),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['students', id] })
    refetch()
  }

  const qrMutation = useMutation({
    mutationFn: () => studentService.regenerateQr(id),
    onSuccess: () => {
      invalidate()
      toast.success('QR code regenerated')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const idCardQuery = useQuery({
    queryKey: ['students', id, 'id-card'],
    queryFn: () => studentService.idCard(id),
    enabled: tab === 'idcard',
  })

  const statusMutation = useMutation({
    mutationFn: (payload) => studentService.updateStatus(id, payload),
    onSuccess: () => {
      invalidate()
      toast.success('Status updated')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const transportMut = useMutation({
    mutationFn: () => studentService.updateTransport(id, transportForm),
    onSuccess: () => {
      invalidate()
      toast.success('Transport saved')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const hostelMut = useMutation({
    mutationFn: () => studentService.updateHostel(id, hostelForm),
    onSuccess: () => {
      invalidate()
      toast.success('Hostel saved')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const medicalMut = useMutation({
    mutationFn: () => studentService.updateMedical(id, medicalForm),
    onSuccess: () => {
      invalidate()
      toast.success('Medical saved')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const achievementMut = useMutation({
    mutationFn: () => studentService.addAchievement(id, achievementForm),
    onSuccess: () => {
      invalidate()
      setAchievementForm({ title: '', category: '' })
      toast.success('Achievement added')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const uploadMut = useMutation({
    mutationFn: (fd) => studentService.uploadDocument(id, fd),
    onSuccess: () => {
      invalidate()
      setDocFile(null)
      toast.success('Document uploaded')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const photoMut = useMutation({
    mutationFn: (fd) => studentService.uploadPhoto(id, fd),
    onSuccess: () => {
      invalidate()
      toast.success('Photo uploaded')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const student = unwrapData(data)
  const parentLinks = useMemo(() => student?.parent_links || [], [student?.parent_links])
  const admission = student?.admission_details
  const draft = admission?.form_draft || {}
  const address = student?.address_detail || {}
  const studentPhoto = resolveMediaUrl(
    student?.photo_url || admission?.student_photo_url || draft?.student?.photo_url,
  )

  const admissionApplication = useMemo(() => {
    if (!admission) return null
    return {
      ...admission,
      form_draft: admission.form_draft || {},
      first_name: admission.first_name,
      last_name: admission.last_name,
      gender: admission.gender,
      date_of_birth: admission.date_of_birth,
      parent_name: admission.parent_name,
      parent_email: admission.parent_email,
      parent_mobile: admission.parent_mobile,
      parent_relation: admission.parent_relation,
      city: admission.city,
      pincode: admission.pincode,
      previous_school: admission.previous_school,
      admission_number: admission.admission_number,
    }
  }, [admission])

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
  if (!student) return <ErrorState message="Student not found" onRetry={refetch} />

  const idCard = unwrapData(idCardQuery.data)?.data || unwrapData(idCardQuery.data) || student.id_card || {}
  const classLabel = [student.class_name, student.section_name].filter(Boolean).join(' · ')
  const activeTab = MORE_TABS.some((t) => t.key === tab) ? 'more' : tab
  const locationLabel =
    [address.city || student.city, address.state || student.state].filter(Boolean).join(', ') ||
    address.full_address ||
    student.address

  return (
    <div className="w-full space-y-6">
      <Breadcrumb
        items={[
          { label: 'Students', href: '/students' },
          { label: student.full_name },
        ]}
      />

      {/* Light profile hero */}
      <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_1px_3px_rgba(14,165,233,0.08)]">
        <div className="h-28 bg-gradient-to-r from-sky-100 via-cyan-50 to-teal-50 sm:h-32" />
        <div className="relative px-5 pb-5 sm:px-8 sm:pb-6">
          <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative shrink-0">
                <ProfilePhotoFrame
                  src={studentPhoto}
                  alt={student.full_name}
                  frameClassName="ring-4 ring-white shadow-md shadow-sky-100"
                />
                <label className="absolute bottom-2 right-2 cursor-pointer rounded bg-sky-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow hover:bg-sky-700">
                  {photoMut.isPending ? 'Uploading…' : 'Change photo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={photoMut.isPending}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (file.size > 15 * 1024 * 1024) {
                        toast.error('Image must be 15 MB or smaller')
                        e.target.value = ''
                        return
                      }
                      let uploadFile = file
                      try {
                        uploadFile = await compressImageFile(file)
                        if (!uploadFile) {
                          toast.error('Could not process this image. Try a JPG or PNG under 15 MB.')
                          e.target.value = ''
                          return
                        }
                      } catch {
                        uploadFile = file
                      }
                      const fd = new FormData()
                      fd.append('file', uploadFile)
                      photoMut.mutate(fd)
                      e.target.value = ''
                    }}
                  />
                </label>
              </div>
              <div className="min-w-0 space-y-2 pb-1 sm:pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                    {student.full_name}
                  </h1>
                  <StatusBadge status={student.status} label={student.status_display || student.status} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.admission_number ? <Chip>Adm {student.admission_number}</Chip> : null}
                  {student.roll_number ? <Chip>Roll {student.roll_number}</Chip> : null}
                  {classLabel ? <Chip>{classLabel}</Chip> : null}
                  {student.academic_year_name ? <Chip>{student.academic_year_name}</Chip> : null}
                  {student.blood_group ? <Chip>Blood {student.blood_group}</Chip> : null}
                  {student.aadhaar_number ? <Chip>Aadhaar •••• {String(student.aadhaar_number).slice(-4)}</Chip> : null}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                  {student.mobile_number ? (
                    <span className="inline-flex items-center gap-1.5">
                      <FiPhone className="h-3.5 w-3.5 text-sky-500" /> {student.mobile_number}
                    </span>
                  ) : null}
                  {student.email ? (
                    <span className="inline-flex items-center gap-1.5 min-w-0">
                      <FiMail className="h-3.5 w-3.5 text-sky-500" />
                      <span className="truncate">{student.email}</span>
                    </span>
                  ) : null}
                  {locationLabel ? (
                    <span className="inline-flex items-center gap-1.5">
                      <FiMapPin className="h-3.5 w-3.5 text-sky-500" />
                      {locationLabel}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={`/students/${id}/edit`}>
                <Button variant="edit">Edit</Button>
              </Link>
              <Button variant="outline" onClick={() => setCredentialsOpen(true)}>
                <FiKey className="h-4 w-4" /> View Creds
              </Button>
              <Button variant="outline" onClick={() => qrMutation.mutate()} loading={qrMutation.isPending}>
                <FiRefreshCw className="h-4 w-4" /> QR
              </Button>
              <Button variant="outline" onClick={() => setTab('idcard')}>
                <FiCreditCard className="h-4 w-4" /> ID Card
              </Button>
            </div>
          </div>

          {(parentLinks.length > 0 || admission?.father?.name || admission?.mother?.name) && (
            <div className="mt-6 border-t border-sky-100 pt-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800">Family</h2>
                <button
                  type="button"
                  onClick={() => setTab('family')}
                  className="text-xs font-medium text-sky-700 hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {parentLinks.length > 0
                  ? parentLinks.map((link) => (
                      <button
                        key={link.link_id}
                        type="button"
                        onClick={() => setTab('family')}
                        className="flex min-w-[148px] items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-2.5 text-left transition hover:bg-white"
                      >
                        <Avatar
                          name={link.parent_name}
                          src={resolveMediaUrl(link.photo_url)}
                          size="lg"
                          className="ring-sky-100"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">{link.parent_name}</p>
                          <p className="truncate text-xs capitalize text-slate-500">
                            {link.relation || 'Parent'}
                            {link.is_primary ? ' · Primary' : ''}
                          </p>
                        </div>
                      </button>
                    ))
                  : (
                    <>
                      {admission?.father?.name ? (
                        <div className="flex min-w-[148px] items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-2.5">
                          <Avatar
                            name={admission.father.name}
                            src={matchParentPhoto(parentLinks, admission.father)}
                            size="lg"
                            className="ring-sky-100"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">{admission.father.name}</p>
                            <p className="text-xs text-slate-500">Father</p>
                          </div>
                        </div>
                      ) : null}
                      {admission?.mother?.name ? (
                        <div className="flex min-w-[148px] items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-2.5">
                          <Avatar
                            name={admission.mother.name}
                            src={matchParentPhoto(parentLinks, admission.mother)}
                            size="lg"
                            className="ring-sky-100"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">{admission.mother.name}</p>
                            <p className="text-xs text-slate-500">Mother</p>
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRIMARY_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key === 'more' ? 'achievements' : t.key)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
              activeTab === t.key
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-200'
                : 'bg-sky-50 text-sky-800 ring-1 ring-sky-100 hover:bg-sky-100',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(tab === 'more' || MORE_TABS.some((t) => t.key === tab)) && (
        <div className="flex flex-wrap gap-2">
          {MORE_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-medium',
                tab === t.key
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-sky-100',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SoftCard className="bg-gradient-to-br from-sky-50 to-white">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">Identity</p>
              <p className="mt-1 text-sm font-bold text-slate-800">{student.full_name}</p>
              <p className="mt-1 text-xs text-slate-500">
                {display(student.gender)} · DOB {display(student.date_of_birth)}
                {student.age != null && student.age !== '' ? ` · Age ${student.age}` : ''}
              </p>
            </SoftCard>
            <SoftCard className="bg-gradient-to-br from-cyan-50 to-white">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-700">Aadhaar</p>
              <p className="mt-1 text-sm font-bold text-slate-800">{display(student.aadhaar_number)}</p>
              <p className="mt-1 text-xs text-slate-500">Category {display(student.caste_category)}</p>
            </SoftCard>
            <SoftCard className="bg-gradient-to-br from-teal-50 to-white">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">Address</p>
              <p className="mt-1 line-clamp-2 text-sm font-bold text-slate-800">
                {display(address.full_address || student.address)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {[address.city || student.city, address.pincode || student.pincode].filter(Boolean).join(' · ') || '—'}
              </p>
            </SoftCard>
            <SoftCard className="bg-gradient-to-br from-emerald-50 to-white">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Class</p>
              <p className="mt-1 text-sm font-bold text-slate-800">{display(classLabel || 'Not assigned')}</p>
              <p className="mt-1 text-xs text-slate-500">{display(student.academic_year_name)}</p>
            </SoftCard>
          </div>

          <SoftCard>
            <Section
              title="Personal details"
              hint="Merged from student record and admission application"
              action={
                <div className="w-44">
                  <SelectField
                    label=""
                    value={student.status}
                    options={STUDENT_STATUS_OPTIONS}
                    onChange={(e) => statusMutation.mutate({ status: e.target.value })}
                  />
                </div>
              }
            >
              <Grid>
                <Field label="Preferred name" value={student.preferred_name} />
                <Field label="Middle name" value={student.middle_name} />
                <Field label="Username" value={student.username} />
                <Field label="Email" value={student.email} />
                <Field label="Mobile" value={student.mobile_number} />
                <Field label="Date of birth" value={student.date_of_birth} />
                <Field label="Age" value={student.age} />
                <Field label="Gender" value={student.gender} />
                <Field label="Blood group" value={student.blood_group} />
                <Field label="Nationality" value={student.nationality} />
                <Field label="Religion" value={student.religion} />
                <Field label="Caste / category" value={student.caste_category} />
                <Field label="Mother tongue" value={student.mother_tongue} />
                <Field label="Languages known" value={student.languages_known} />
                <Field label="Aadhaar number" value={student.aadhaar_number} />
              </Grid>
            </Section>
          </SoftCard>

          <SoftCard>
            <Section title="Communication address" hint="From admission form when available">
              <Grid>
                <Field label="Door / house no." value={address.door_no} />
                <Field label="Street" value={address.street} />
                <Field label="Area" value={address.area} />
                <Field label="City" value={address.city || student.city} />
                <Field label="District" value={address.district} />
                <Field label="State" value={address.state || student.state} />
                <Field label="Country" value={address.country || student.country} />
                <Field label="PIN code" value={address.pincode || student.pincode} />
                <Field label="Full address" value={address.full_address || student.address} />
              </Grid>
              {address.permanent_same_as_communication === false ? (
                <div className="mt-5">
                  <h4 className="mb-3 text-sm font-bold text-slate-800">Permanent address</h4>
                  <Grid>
                    <Field label="Door / house no." value={address.permanent_door_no} />
                    <Field label="Street" value={address.permanent_street} />
                    <Field label="Area" value={address.permanent_area} />
                    <Field label="City" value={address.permanent_city} />
                    <Field label="District" value={address.permanent_district} />
                    <Field label="State" value={address.permanent_state} />
                    <Field label="Country" value={address.permanent_country} />
                    <Field label="PIN code" value={address.permanent_pincode} />
                  </Grid>
                </div>
              ) : null}
            </Section>
          </SoftCard>

          <div className="grid gap-5 lg:grid-cols-2">
            <SoftCard>
              <Section title="Identity & school IDs">
                <Grid cols="2">
                  <Field label="Admission number" value={student.admission_number} />
                  <Field label="Student code" value={student.student_code} />
                  <Field label="RFID" value={student.rfid_card_number} />
                  <Field label="EMIS" value={student.emis_number} />
                  <Field label="Board registration" value={student.board_registration_number} />
                  <Field label="Passport" value={student.passport_number} />
                  <Field label="Birth certificate" value={student.birth_certificate_number} />
                  <Field label="From admission" value={student.originated_from_admission} />
                  <Field label="Staff child" value={student.is_staff_child} />
                </Grid>
              </Section>
            </SoftCard>
            <SoftCard>
              <Section title="Emergency & previous school">
                <Grid cols="2">
                  <Field label="Emergency contact" value={student.emergency_contact_name} />
                  <Field label="Emergency phone" value={student.emergency_contact_phone} />
                  <Field label="Relation" value={student.emergency_contact_relation} />
                  <Field label="Previous school" value={student.previous_school} />
                  <Field label="Previous board" value={student.previous_school_board} />
                  <Field label="Previous class" value={student.previous_class} />
                  <Field label="Scholarship" value={student.scholarship} />
                  <Field label="Special needs" value={student.special_needs} />
                </Grid>
              </Section>
            </SoftCard>
          </div>

          {admissionApplication ? (
            <SoftCard>
              <Section
                title="Complete admission application"
                hint="Every section filled during the admission process"
                action={
                  <button
                    type="button"
                    onClick={() => setTab('admission')}
                    className="text-xs font-semibold text-sky-700 hover:underline"
                  >
                    Open full view
                  </button>
                }
              >
                <ApplicationFormReadonly application={admissionApplication} />
              </Section>
            </SoftCard>
          ) : null}

          <SoftCard>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  studentService
                    .generateRfid(id)
                    .then(() => {
                      invalidate()
                      toast.success('RFID generated')
                    })
                    .catch((e) => toast.error(getErrorMessage(e)))
                }
              >
                Generate RFID
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  studentService
                    .graduate(id, {})
                    .then(() => {
                      invalidate()
                      toast.success('Graduated')
                    })
                    .catch((e) => toast.error(getErrorMessage(e)))
                }
              >
                Graduate
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  studentService
                    .alumni(id, { passing_year: String(new Date().getFullYear()) })
                    .then(() => {
                      invalidate()
                      toast.success('Alumni converted')
                    })
                    .catch((e) => toast.error(getErrorMessage(e)))
                }
              >
                Convert to Alumni
              </Button>
            </div>
          </SoftCard>
        </div>
      )}

      {tab === 'family' && (
        <div className="space-y-5">
          <SoftCard>
            <Section title="Linked guardians">
              {parentLinks.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No guardian login linked yet. Parent details from admission are shown below when available.
                </p>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {parentLinks.map((link) => (
                    <PersonCard
                      key={link.link_id}
                      name={link.parent_name}
                      photo={resolveMediaUrl(link.photo_url)}
                      relation={link.relation || 'Parent'}
                      email={link.parent_email}
                      mobile={link.parent_mobile}
                      badges={[
                        link.is_primary ? 'Primary' : null,
                        link.is_emergency_contact ? 'Emergency' : null,
                        link.can_pickup ? 'Pickup' : null,
                      ].filter(Boolean)}
                      meta={[
                        { label: 'Occupation', value: link.occupation },
                        { label: 'Education', value: link.education },
                      ]}
                    />
                  ))}
                </div>
              )}
            </Section>
          </SoftCard>

          {(admission?.father || admission?.mother || admission?.guardian) && (
            <SoftCard>
              <Section title="Parents from admission form">
                <div className="grid gap-4 lg:grid-cols-2">
                  <GuardianFromDraft
                    title="Father"
                    person={admission.father}
                    linkedPhoto={matchParentPhoto(parentLinks, admission.father)}
                  />
                  <GuardianFromDraft
                    title="Mother"
                    person={admission.mother}
                    linkedPhoto={matchParentPhoto(parentLinks, admission.mother)}
                  />
                  {admission.guardian?.applicable || admission.guardian?.name ? (
                    <GuardianFromDraft
                      title={admission.guardian.relationship || 'Guardian'}
                      person={admission.guardian}
                      linkedPhoto={matchParentPhoto(parentLinks, admission.guardian)}
                    />
                  ) : null}
                </div>
              </Section>
            </SoftCard>
          )}

          {!parentLinks.length && !admission?.father?.name && !admission?.mother?.name && (
            <SoftCard>
              <div className="flex flex-col items-center py-10 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50">
                  <FiUser className="h-5 w-5 text-sky-500" />
                </div>
                <p className="text-sm font-medium text-slate-800">No family details yet</p>
              </div>
            </SoftCard>
          )}
        </div>
      )}

      {tab === 'admission' && (
        <div className="space-y-5">
          {admission ? (
            <>
              <SoftCard>
                <Section
                  title="Admission summary"
                  action={
                    admission.application_id ? (
                      <Link
                        to={`/admissions/applications/${admission.application_id}`}
                        className="text-xs font-semibold text-sky-700 hover:underline"
                      >
                        Open application
                      </Link>
                    ) : null
                  }
                >
                  <Grid>
                    <Field label="Application number" value={admission.application_number} />
                    <Field label="Admission number" value={admission.admission_number} />
                    <Field label="Status" value={admission.status} />
                    <Field label="Application date" value={admission.application_date} />
                    <Field label="Enrolled at" value={admission.enrolled_at} />
                    <Field label="Fee amount" value={admission.fee_amount} />
                    <Field label="Fee paid" value={admission.fee_paid} />
                    <Field label="Parent on file" value={admission.parent_name} />
                    <Field label="Parent mobile" value={admission.parent_mobile} />
                    <Field label="Parent email" value={admission.parent_email} />
                  </Grid>
                </Section>
              </SoftCard>
              <SoftCard>
                <Section title="Full admission application">
                  <ApplicationFormReadonly application={admissionApplication} />
                </Section>
              </SoftCard>
            </>
          ) : (
            <SoftCard>
              <p className="text-sm text-slate-500">
                This student was not created from an admission application.
              </p>
            </SoftCard>
          )}
        </div>
      )}

      {tab === 'academic' && (
        <SoftCard>
          <Section title="Current enrollment">
            {student.current_enrollment ? (
              <Grid>
                <Field label="Academic year" value={student.current_enrollment.academic_year_name} />
                <Field label="Class" value={student.current_enrollment.class_name} />
                <Field label="Section" value={student.current_enrollment.section_name} />
                <Field label="Roll number" value={student.current_enrollment.roll_number} />
              </Grid>
            ) : (
              <p className="text-sm text-slate-500">No current enrollment.</p>
            )}
          </Section>
          <Section title="Enrollment history" className="mt-8">
            <ul className="space-y-2 text-sm">
              {(student.enrollments || []).map((e) => (
                <li key={e.enrollment_id} className="rounded-xl border border-sky-100 bg-sky-50/50 px-3 py-2">
                  {e.academic_year_name} — {e.class_name} {e.section_name} (Roll: {e.roll_number || '—'})
                </li>
              ))}
            </ul>
          </Section>
        </SoftCard>
      )}

      {tab === 'transport' && (
        <SoftCard>
          <Section title="Transport">
            <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
              <Input label="Route" defaultValue={student.transport_detail?.route_name} onChange={(e) => setTransportForm((p) => ({ ...p, route_name: e.target.value }))} />
              <Input label="Vehicle" defaultValue={student.transport_detail?.vehicle_number} onChange={(e) => setTransportForm((p) => ({ ...p, vehicle_number: e.target.value }))} />
              <Input label="Pickup" defaultValue={student.transport_detail?.pickup_point} onChange={(e) => setTransportForm((p) => ({ ...p, pickup_point: e.target.value }))} />
              <Input label="Drop" defaultValue={student.transport_detail?.drop_point} onChange={(e) => setTransportForm((p) => ({ ...p, drop_point: e.target.value }))} />
            </div>
            <Button className="mt-4" loading={transportMut.isPending} onClick={() => transportMut.mutate()}>Save transport</Button>
          </Section>
        </SoftCard>
      )}

      {tab === 'hostel' && (
        <SoftCard>
          <Section title="Hostel">
            <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
              <Input label="Hostel" defaultValue={student.hostel_detail?.hostel_name} onChange={(e) => setHostelForm((p) => ({ ...p, hostel_name: e.target.value }))} />
              <Input label="Room" defaultValue={student.hostel_detail?.room_number} onChange={(e) => setHostelForm((p) => ({ ...p, room_number: e.target.value }))} />
              <Input label="Block" defaultValue={student.hostel_detail?.block} onChange={(e) => setHostelForm((p) => ({ ...p, block: e.target.value }))} />
            </div>
            <Button className="mt-4" loading={hostelMut.isPending} onClick={() => hostelMut.mutate()}>Save hostel</Button>
          </Section>
        </SoftCard>
      )}

      {tab === 'medical' && (
        <SoftCard>
          <Section title="Medical">
            <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
              <Input label="Allergies" defaultValue={student.medical_detail?.allergies} onChange={(e) => setMedicalForm((p) => ({ ...p, allergies: e.target.value }))} />
              <Input label="Chronic conditions" defaultValue={student.medical_detail?.chronic_conditions} onChange={(e) => setMedicalForm((p) => ({ ...p, chronic_conditions: e.target.value }))} />
              <Input label="Doctor" defaultValue={student.medical_detail?.doctor_name} onChange={(e) => setMedicalForm((p) => ({ ...p, doctor_name: e.target.value }))} />
            </div>
            <Button className="mt-4" loading={medicalMut.isPending} onClick={() => medicalMut.mutate()}>Save medical</Button>
          </Section>
        </SoftCard>
      )}

      {tab === 'documents' && (
        <SoftCard>
          <Section title="Documents">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <input type="file" onChange={(e) => setDocFile(e.target.files?.[0])} className="text-sm" />
              <Button
                variant="outline"
                disabled={!docFile}
                loading={uploadMut.isPending}
                onClick={() => {
                  const fd = new FormData()
                  fd.append('file', docFile)
                  fd.append('document_type', 'other')
                  uploadMut.mutate(fd)
                }}
              >
                Upload
              </Button>
            </div>
            <ul className="space-y-2">
              {(student.documents || []).map((d) => (
                <li key={d.document_id} className="flex justify-between rounded-xl border border-sky-100 bg-sky-50/40 px-3 py-2 text-sm">
                  <span>{d.document_type} — {d.title || 'Document'}</span>
                  {d.file_url ? <a href={d.file_url} target="_blank" rel="noreferrer" className="text-sky-700">View</a> : null}
                </li>
              ))}
            </ul>
          </Section>
        </SoftCard>
      )}

      {tab === 'achievements' && (
        <SoftCard>
          <Section title="Achievements">
            <div className="mb-4 flex max-w-xl gap-2">
              <Input placeholder="Title" value={achievementForm.title} onChange={(e) => setAchievementForm((p) => ({ ...p, title: e.target.value }))} />
              <Button loading={achievementMut.isPending} onClick={() => achievementMut.mutate()}>Add</Button>
            </div>
            <ul className="space-y-2 text-sm">
              {(student.achievements || []).map((a) => (
                <li key={a.achievement_id} className="rounded-xl border border-sky-100 px-3 py-2">
                  {a.title} {a.category ? `(${a.category})` : ''}
                </li>
              ))}
            </ul>
          </Section>
        </SoftCard>
      )}

      {tab === 'discipline' && (
        <SoftCard>
          <Section title="Discipline">
            <ul className="space-y-2 text-sm">
              {(student.discipline_records || []).map((r) => (
                <li key={r.record_id} className="rounded-xl border border-sky-100 px-3 py-2">
                  {r.incident_date} — {r.category} ({r.severity}): {r.description}
                </li>
              ))}
            </ul>
          </Section>
        </SoftCard>
      )}

      {tab === 'siblings' && (
        <SoftCard>
          <Section title="Siblings">
            <ul className="space-y-2 text-sm">
              {(student.sibling_links || []).map((s) => (
                <li key={s.sibling_id} className="rounded-xl border border-sky-100 px-3 py-2">
                  {s.sibling_name} ({s.sibling_admission_number})
                </li>
              ))}
            </ul>
          </Section>
        </SoftCard>
      )}

      {tab === 'promotion' && (
        <SoftCard>
          <Section title="Promotion history">
            <ul className="space-y-2 text-sm">
              {(student.promotion_history || []).map((p) => (
                <li key={p.promotion_id} className="rounded-xl border border-sky-100 px-3 py-2">
                  {p.from_class_name} → {p.to_class_name} ({p.promoted_on || '—'})
                </li>
              ))}
            </ul>
          </Section>
        </SoftCard>
      )}

      {tab === 'certificates' && (
        <SoftCard>
          <Section title="Certificates">
            <ul className="space-y-2 text-sm">
              {(student.certificates || []).map((c) => (
                <li key={c.certificate_id} className="rounded-xl border border-sky-100 px-3 py-2">
                  {c.certificate_type} — {c.certificate_number || 'No number'}
                </li>
              ))}
            </ul>
          </Section>
        </SoftCard>
      )}

      {tab === 'idcard' && (
        <SoftCard>
          <Section title="ID card preview">
            <div className="mx-auto max-w-sm rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-6 shadow-sm">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase text-sky-700">{idCard.school_name}</p>
                <div className="mx-auto my-4 flex justify-center">
                  <Avatar
                    name={idCard.full_name || student.full_name}
                    src={resolveMediaUrl(idCard.photo_url || studentPhoto)}
                    size="xl"
                    className="ring-sky-100"
                  />
                </div>
                <p className="text-lg font-bold text-slate-800">{idCard.full_name || student.full_name}</p>
                <p className="text-xs text-slate-500">
                  {idCard.class_name || student.class_name} {idCard.section_name || student.section_name}
                </p>
                <p className="mt-2 font-mono text-sm">Adm: {idCard.admission_number || student.admission_number}</p>
                <p className="font-mono text-sm">Roll: {idCard.roll_number || student.roll_number}</p>
                {(idCard.qr_code_url || student.qr_code_url) && (
                  <img src={idCard.qr_code_url || student.qr_code_url} alt="QR" className="mx-auto mt-4 h-24 w-24" />
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="print" onClick={() => window.print()}>
                <FiDownload /> Print PDF
              </Button>
            </div>
          </Section>
        </SoftCard>
      )}

      <StudentCredentialsModal
        student={student}
        open={credentialsOpen}
        onClose={() => setCredentialsOpen(false)}
        loading={isLoading}
      />
    </div>
  )
}
