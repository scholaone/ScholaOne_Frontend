import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiEdit2, FiKey, FiSend, FiTrash2 } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { teacherService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import { TEACHER_LEAVE_TYPE_OPTIONS, TEACHER_STATUS_OPTIONS } from '@/config/constants'
import { resolveMediaUrl } from '@/utils/format'
import ExperienceSummary from '@/components/teachers/ExperienceSummary'
import {
  buildExperiencePayload,
  EMPTY_EXPERIENCE_FORM,
  formatTotalExperienceYears,
  experienceToForm,
  validateExperienceForm,
} from '@/utils/teacherExperience'
import TeacherPhotoField, { formatClassTeacherLabel } from '@/components/teachers/TeacherPhotoField'
import { TeacherProfileDetailsGrid } from '@/components/teachers/TeacherProfileSections'
import TeacherCredentialsModal from '@/components/teachers/TeacherCredentialsModal'
import { useTeacherPhotoUpload } from '@/components/teachers/useTeacherPhotoUpload'

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'qualifications', label: 'Qualifications' },
  { key: 'experience', label: 'Experience' },
  { key: 'subjects', label: 'Subjects' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'workload', label: 'Workload' },
  { key: 'classTeacher', label: 'Class Teacher' },
  { key: 'documents', label: 'Documents' },
  { key: 'certificates', label: 'Certificates' },
  { key: 'credentials', label: 'Credentials' },
  { key: 'timetable', label: 'Timetable' },
  { key: 'lessonPlans', label: 'Lesson Plans' },
  { key: 'homework', label: 'Homework' },
  { key: 'onlineClasses', label: 'Online Classes' },
  { key: 'reviews', label: 'Performance Foundation' },
]

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm font-medium text-text">{value || '—'}</dd>
    </div>
  )
}

export default function TeacherDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('profile')
  const [credentialsOpen, setCredentialsOpen] = useState(false)

  const [qualForm, setQualForm] = useState({ degree: '', institution: '', year_completed: '' })
  const [expForm, setExpForm] = useState({ ...EMPTY_EXPERIENCE_FORM })
  const [editingExperienceId, setEditingExperienceId] = useState(null)
  const [assignForm, setAssignForm] = useState({
    assignment_type: 'subject',
    academic_year_id: '',
    subject_id: '',
    class_section_id: '',
    periods_per_week: 5,
    title: '',
  })
  const [workloadYear, setWorkloadYear] = useState('')
  const [classTeacherForm, setClassTeacherForm] = useState({ academic_year_id: '', class_section_id: '' })
  const [attendanceForm, setAttendanceForm] = useState({ date: '', status: 'present' })
  const [leaveForm, setLeaveForm] = useState({ leave_type: 'casual', start_date: '', end_date: '', reason: '' })
  const [payrollForm, setPayrollForm] = useState({})
  const [docFile, setDocFile] = useState(null)
  const [certForm, setCertForm] = useState({ certificate_type: 'appointment', certificate_number: '' })
  const [timetableForm, setTimetableForm] = useState({ academic_year: '', weekday: 'monday', period_number: 1, subject: '' })
  const [lessonForm, setLessonForm] = useState({ academic_year: '', plan_date: '', topic: '' })
  const [homeworkForm, setHomeworkForm] = useState({ title: '', assigned_date: '', subject: '' })
  const [onlineForm, setOnlineForm] = useState({ title: '', scheduled_at: '', meeting_link: '' })
  const [reviewForm, setReviewForm] = useState({ review_date: '', rating: '', comments: '' })

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teachers', id],
    queryFn: () => teacherService.get(id),
  })

  const workloadQuery = useQuery({
    queryKey: ['teachers', id, 'workload', workloadYear],
    queryFn: () => teacherService.workload(id, { academic_year: workloadYear }),
    enabled: Boolean(workloadYear),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['teachers', id] })
    refetch()
  }

  const qualMut = useMutation({
    mutationFn: () => teacherService.addQualification(id, qualForm),
    onSuccess: () => { invalidate(); toast.success('Qualification added') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const resetExperienceForm = () => {
    setExpForm({ ...EMPTY_EXPERIENCE_FORM })
    setEditingExperienceId(null)
  }

  const experienceSuccessToast = (response, fallback) => {
    const total = unwrapData(response)?.total_experience_years
    toast.success(
      total != null && total !== ''
        ? `${fallback}. Total experience: ${formatTotalExperienceYears(total)} years`
        : fallback,
    )
  }

  const expMut = useMutation({
    mutationFn: () => teacherService.addExperience(id, buildExperiencePayload(expForm)),
    onSuccess: (response) => {
      invalidate()
      resetExperienceForm()
      experienceSuccessToast(response, 'Experience added')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const expUpdateMut = useMutation({
    mutationFn: () =>
      teacherService.updateExperience(id, editingExperienceId, buildExperiencePayload(expForm)),
    onSuccess: (response) => {
      invalidate()
      resetExperienceForm()
      experienceSuccessToast(response, 'Experience updated')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const expDeleteMut = useMutation({
    mutationFn: (experienceId) => teacherService.deleteExperience(id, experienceId),
    onSuccess: (response) => {
      invalidate()
      if (editingExperienceId) resetExperienceForm()
      experienceSuccessToast(response, 'Experience deleted')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const assignMut = useMutation({
    mutationFn: () => teacherService.academicAssign(id, {
      assignment_type: assignForm.assignment_type,
      academic_year_id: assignForm.academic_year_id,
      subject_id: assignForm.subject_id || undefined,
      class_section_id: assignForm.class_section_id || undefined,
      periods_per_week: Number(assignForm.periods_per_week) || 0,
      remarks: assignForm.title || '',
    }),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['teachers', id, 'workload'] })
      toast.success('Academic assignment added')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const workloadMut = useMutation({
    mutationFn: () => teacherService.recalculateWorkload(id, { academic_year_id: workloadYear }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers', id, 'workload'] })
      toast.success('Workload recalculated')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const classTeacherMut = useMutation({
    mutationFn: () => teacherService.assignClassTeacher(id, classTeacherForm),
    onSuccess: () => { invalidate(); toast.success('Class teacher mapped') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const attendanceMut = useMutation({
    mutationFn: () => teacherService.recordAttendance(id, attendanceForm),
    onSuccess: () => { invalidate(); toast.success('Attendance recorded') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const leaveMut = useMutation({
    mutationFn: () => teacherService.requestLeave(id, leaveForm),
    onSuccess: () => { invalidate(); toast.success('Leave submitted') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const payrollMut = useMutation({
    mutationFn: () => teacherService.updatePayroll(id, payrollForm),
    onSuccess: () => { invalidate(); toast.success('Payroll updated') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const uploadMut = useMutation({
    mutationFn: (fd) => teacherService.uploadDocument(id, fd),
    onSuccess: () => { invalidate(); setDocFile(null); toast.success('Document uploaded') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const certMut = useMutation({
    mutationFn: () => teacherService.addCertificate(id, certForm),
    onSuccess: () => { invalidate(); toast.success('Certificate added') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const timetableMut = useMutation({
    mutationFn: () => teacherService.addTimetable(id, timetableForm),
    onSuccess: () => { invalidate(); toast.success('Timetable entry added') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const lessonMut = useMutation({
    mutationFn: () => teacherService.addLessonPlan(id, lessonForm),
    onSuccess: () => { invalidate(); toast.success('Lesson plan added') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const homeworkMut = useMutation({
    mutationFn: () => teacherService.addHomework(id, homeworkForm),
    onSuccess: () => { invalidate(); toast.success('Homework added') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const onlineMut = useMutation({
    mutationFn: () => teacherService.addOnlineClass(id, onlineForm),
    onSuccess: () => { invalidate(); toast.success('Online class scheduled') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const reviewMut = useMutation({
    mutationFn: () => teacherService.addPerformanceReview(id, reviewForm),
    onSuccess: () => { invalidate(); toast.success('Review added') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const credentialsMut = useMutation({
    mutationFn: () => teacherService.sendCredentials(id, { send_email: true, send_sms: true }),
    onSuccess: () => toast.success('Credentials sent'),
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const approveLeaveMut = useMutation({
    mutationFn: (leaveId) => teacherService.approveLeave(id, leaveId),
    onSuccess: () => { invalidate(); toast.success('Leave approved') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const teacher = data ? unwrapData(data) : null
  const photoUpload = useTeacherPhotoUpload({
    teacherId: id,
    teacherName: teacher?.full_name,
    initialUrl: resolveMediaUrl(teacher?.photo_url),
    onUploaded: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers', id] })
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      refetch()
    },
  })

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
  if (!teacher) return <ErrorState message="Teacher not found" onRetry={refetch} />

  const payroll = teacher.payroll_reference || {}

  return (
    <div className="w-full space-y-6">
      <Breadcrumb items={[
        { label: 'Teachers', href: '/teachers' },
        { label: teacher.full_name },
      ]} />
      <TeacherPhotoField
        {...photoUpload.photoFieldProps}
        name={teacher.full_name}
        email={teacher.email}
        employeeId={teacher.employee_id}
        designation={teacher.designation}
        roleLabel={teacher.academic_role_display || teacher.academic_role}
        classLabel={formatClassTeacherLabel(teacher.class_teacher_mappings)}
        actions={
          <>
            <Link to={`/teachers/${id}/edit`}>
              <Button variant="edit" size="sm">Edit</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => setCredentialsOpen(true)}>
              <FiKey className="h-4 w-4" /> View Creds
            </Button>
            <Button variant="outline" size="sm" onClick={() => credentialsMut.mutate()} loading={credentialsMut.isPending}>
              <FiSend className="h-4 w-4" /> Send Credentials
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${tab === t.key ? 'bg-primary text-white' : 'bg-slate-100 text-muted'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <TeacherProfileDetailsGrid teacher={teacher} />
      )}

      {tab === 'assignments' && (
        <Card>
          <p className="mb-3 text-xs text-muted">Unified academic duties (subject, mentor, exam duty, coordinators, etc.).</p>
          <div className="mb-4 grid gap-2 sm:grid-cols-2 max-w-3xl">
            <Input placeholder="Assignment type (e.g. mentor)" value={assignForm.assignment_type} onChange={(e) => setAssignForm((p) => ({ ...p, assignment_type: e.target.value }))} />
            <Input placeholder="Academic Year UUID" value={assignForm.academic_year_id} onChange={(e) => setAssignForm((p) => ({ ...p, academic_year_id: e.target.value }))} />
            <Input placeholder="Subject UUID (optional)" value={assignForm.subject_id} onChange={(e) => setAssignForm((p) => ({ ...p, subject_id: e.target.value }))} />
            <Input placeholder="Class Section UUID (optional)" value={assignForm.class_section_id} onChange={(e) => setAssignForm((p) => ({ ...p, class_section_id: e.target.value }))} />
            <Input placeholder="Periods / week" type="number" value={assignForm.periods_per_week} onChange={(e) => setAssignForm((p) => ({ ...p, periods_per_week: e.target.value }))} />
            <Input placeholder="Title / notes" value={assignForm.title} onChange={(e) => setAssignForm((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <Button loading={assignMut.isPending} onClick={() => assignMut.mutate()}>Add Academic Assignment</Button>
          <ul className="mt-4 space-y-2 text-sm">
            {(teacher.academic_assignments || []).map((a) => (
              <li key={a.assignment_id || a.id} className="rounded-lg border px-3 py-2">
                {a.assignment_type} — {a.subject_name || a.title || a.class_section_name || '—'}
                {a.periods_per_week ? ` · ${a.periods_per_week} periods` : ''}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'workload' && (
        <Card>
          <div className="mb-4 flex flex-wrap items-end gap-2">
            <Input
              label="Academic Year UUID"
              className="min-w-[280px]"
              value={workloadYear}
              onChange={(e) => setWorkloadYear(e.target.value)}
            />
            <Button loading={workloadMut.isPending} onClick={() => workloadMut.mutate()}>
              Recalculate Workload
            </Button>
          </div>
          {workloadQuery.data ? (
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Periods / Week" value={unwrapData(workloadQuery.data)?.periods_per_week} />
              <Field label="Subjects" value={unwrapData(workloadQuery.data)?.subject_count} />
              <Field label="Sections" value={unwrapData(workloadQuery.data)?.section_count} />
              <Field label="Teaching Hours" value={unwrapData(workloadQuery.data)?.teaching_hours} />
              <Field label="Assessment Load" value={unwrapData(workloadQuery.data)?.assessment_load} />
              <Field label="Mentoring Load" value={unwrapData(workloadQuery.data)?.mentoring_load} />
              <Field label="Extra Activities" value={unwrapData(workloadQuery.data)?.extra_activities} />
              <Field label="Class Strength" value={unwrapData(workloadQuery.data)?.class_strength} />
            </dl>
          ) : (
            <p className="text-sm text-muted">Enter academic year and recalculate to view workload snapshot.</p>
          )}
        </Card>
      )}

      {tab === 'qualifications' && (
        <Card>
          <div className="mb-4 grid gap-2 sm:grid-cols-3 max-w-3xl">
            <Input placeholder="Degree" value={qualForm.degree} onChange={(e) => setQualForm((p) => ({ ...p, degree: e.target.value }))} />
            <Input placeholder="Institution" value={qualForm.institution} onChange={(e) => setQualForm((p) => ({ ...p, institution: e.target.value }))} />
            <Input placeholder="Year" type="number" value={qualForm.year_completed} onChange={(e) => setQualForm((p) => ({ ...p, year_completed: e.target.value }))} />
          </div>
          <Button loading={qualMut.isPending} onClick={() => qualMut.mutate()}>Add Qualification</Button>
          <ul className="mt-4 space-y-2 text-sm">
            {(teacher.qualifications || []).map((q) => (
              <li key={q.qualification_id} className="rounded-lg border px-3 py-2">
                {q.degree} — {q.institution} {q.year_completed ? `(${q.year_completed})` : ''}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'experience' && (
        <Card>
          <p className="mb-4 text-sm text-muted">
            Total experience:{' '}
            <b>{formatTotalExperienceYears(teacher.total_experience_years)} years</b>
            <span className="ml-1 text-xs">(auto-calculated from dates below)</span>
          </p>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl">
            <Input
              label="Organization"
              placeholder="School / company name"
              value={expForm.organization_name}
              onChange={(e) => setExpForm((p) => ({ ...p, organization_name: e.target.value }))}
            />
            <Input
              label="Role"
              placeholder="Designation / subject taught"
              value={expForm.role}
              onChange={(e) => setExpForm((p) => ({ ...p, role: e.target.value }))}
            />
            <Input
              label="From date"
              type="date"
              required
              value={expForm.start_date}
              onChange={(e) => setExpForm((p) => ({ ...p, start_date: e.target.value }))}
            />
            <Input
              label="To date"
              type="date"
              required={!expForm.is_current}
              disabled={expForm.is_current}
              value={expForm.end_date}
              onChange={(e) => setExpForm((p) => ({ ...p, end_date: e.target.value }))}
              hint={expForm.is_current ? 'Not required while Present is selected' : undefined}
            />
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-text">
              <input
                type="checkbox"
                checked={expForm.is_current}
                onChange={(e) => setExpForm((p) => ({
                  ...p,
                  is_current: e.target.checked,
                  end_date: e.target.checked ? '' : p.end_date,
                }))}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              Present (currently working here)
            </label>
            <Input
              label="Notes"
              placeholder="Optional description"
              className="sm:col-span-2 lg:col-span-3"
              value={expForm.description}
              onChange={(e) => setExpForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button
              loading={expMut.isPending || expUpdateMut.isPending}
              onClick={() => {
                const message = validateExperienceForm(expForm)
                if (message) {
                  toast.error(message)
                  return
                }
                if (editingExperienceId) {
                  expUpdateMut.mutate()
                } else {
                  expMut.mutate()
                }
              }}
            >
              {editingExperienceId ? 'Update Experience' : 'Add Experience'}
            </Button>
            {editingExperienceId ? (
              <Button variant="outline" onClick={resetExperienceForm}>
                Cancel
              </Button>
            ) : null}
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {(teacher.experiences || []).map((e) => (
              <li
                key={e.experience_id}
                className={`rounded-lg border px-3 py-2 ${editingExperienceId === e.experience_id ? 'border-primary bg-primary/5' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-medium">{e.organization_name}</span>
                    {e.role ? ` — ${e.role}` : ''}
                    <span className="mt-0.5 block text-xs text-muted">
                      <ExperienceSummary record={e} />
                      {e.is_current ? ' · Current' : ''}
                    </span>
                    {e.description ? <span className="mt-1 block text-xs text-muted">{e.description}</span> : null}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="Edit experience"
                      onClick={() => {
                        setEditingExperienceId(e.experience_id)
                        setExpForm(experienceToForm(e))
                      }}
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="Delete experience"
                      loading={expDeleteMut.isPending}
                      onClick={() => {
                        if (window.confirm('Delete this experience record?')) {
                          expDeleteMut.mutate(e.experience_id)
                        }
                      }}
                    >
                      <FiTrash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'subjects' && (
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              Subject allocations are managed centrally and synced to this profile.
            </p>
            <Link to="/academics/class-section-subjects">
              <Button variant="secondary" size="sm">Open Subject Teacher Mapping</Button>
            </Link>
          </div>
          <ul className="space-y-2 text-sm">
            {(teacher.subject_assignments || []).length === 0 ? (
              <li className="rounded-lg border border-dashed px-3 py-4 text-center text-muted">
                No subject assignments yet. Map this teacher under Class Allocation → Subject Teacher Mapping.
              </li>
            ) : (
              (teacher.subject_assignments || []).map((s) => (
                <li key={s.assignment_id} className="rounded-lg border px-3 py-2">
                  <span className="font-medium">{s.subject_name || 'Subject'}</span>
                  {(s.class_name || s.section_name) ? (
                    <span className="text-muted">
                      {' '}
                      — {[s.class_name, s.section_name].filter(Boolean).join(' ')}
                    </span>
                  ) : null}
                  {s.periods_per_week ? (
                    <span className="ml-1 text-xs text-muted">· {s.periods_per_week} periods/week</span>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </Card>
      )}

      {tab === 'classTeacher' && (
        <Card>
          <div className="mb-4 grid gap-2 sm:grid-cols-2 max-w-xl">
            <Input placeholder="Academic Year UUID" value={classTeacherForm.academic_year_id} onChange={(e) => setClassTeacherForm((p) => ({ ...p, academic_year_id: e.target.value }))} />
            <Input placeholder="Class Section UUID" value={classTeacherForm.class_section_id} onChange={(e) => setClassTeacherForm((p) => ({ ...p, class_section_id: e.target.value }))} />
          </div>
          <Button loading={classTeacherMut.isPending} onClick={() => classTeacherMut.mutate()}>Map Class Teacher</Button>
          <ul className="mt-4 space-y-2 text-sm">
            {(teacher.class_teacher_mappings || []).map((m) => (
              <li key={m.mapping_id} className="rounded-lg border px-3 py-2">
                {m.academic_year} — {m.class_name} {m.section_name} {m.is_primary ? '(Primary)' : ''}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'attendance' && (
        <Card>
          <div className="mb-4 grid gap-2 sm:grid-cols-2 max-w-md">
            <Input type="date" label="Date" value={attendanceForm.date} onChange={(e) => setAttendanceForm((p) => ({ ...p, date: e.target.value }))} />
            <SelectField
              label="Status"
              value={attendanceForm.status}
              options={[
                { label: 'Present', value: 'present' },
                { label: 'Absent', value: 'absent' },
                { label: 'Half Day', value: 'half_day' },
                { label: 'Late', value: 'late' },
                { label: 'On Leave', value: 'on_leave' },
              ]}
              onChange={(e) => setAttendanceForm((p) => ({ ...p, status: e.target.value }))}
            />
          </div>
          <Button loading={attendanceMut.isPending} onClick={() => attendanceMut.mutate()}>Record Attendance</Button>
          <ul className="mt-4 space-y-2 text-sm">
            {(teacher.attendance_records || []).map((a) => (
              <li key={a.record_id} className="rounded-lg border px-3 py-2">
                {a.date} — {a.status}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'leave' && (
        <Card>
          <div className="mb-4 grid gap-2 sm:grid-cols-2 max-w-xl">
            <SelectField label="Type" value={leaveForm.leave_type} options={TEACHER_LEAVE_TYPE_OPTIONS} onChange={(e) => setLeaveForm((p) => ({ ...p, leave_type: e.target.value }))} />
            <Input type="date" label="Start" value={leaveForm.start_date} onChange={(e) => setLeaveForm((p) => ({ ...p, start_date: e.target.value }))} />
            <Input type="date" label="End" value={leaveForm.end_date} onChange={(e) => setLeaveForm((p) => ({ ...p, end_date: e.target.value }))} />
            <Input label="Reason" value={leaveForm.reason} onChange={(e) => setLeaveForm((p) => ({ ...p, reason: e.target.value }))} />
          </div>
          <Button loading={leaveMut.isPending} onClick={() => leaveMut.mutate()}>Submit Leave</Button>
          <ul className="mt-4 space-y-2 text-sm">
            {(teacher.leave_requests || []).map((l) => (
              <li key={l.leave_id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span>{l.leave_type} — {l.start_date} to {l.end_date} ({l.status})</span>
                {l.status === 'pending' && (
                  <Button size="sm" variant="success" loading={approveLeaveMut.isPending} onClick={() => approveLeaveMut.mutate(l.leave_id)}>
                    Approve
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'payroll' && (
        <Card>
          <div className="grid gap-3 sm:grid-cols-2 max-w-2xl">
            <Input label="Payroll Code" defaultValue={payroll.payroll_code} onChange={(e) => setPayrollForm((p) => ({ ...p, payroll_code: e.target.value }))} />
            <Input label="Salary Grade" defaultValue={payroll.salary_grade} onChange={(e) => setPayrollForm((p) => ({ ...p, salary_grade: e.target.value }))} />
            <Input label="Bank Name" defaultValue={payroll.bank_name} onChange={(e) => setPayrollForm((p) => ({ ...p, bank_name: e.target.value }))} />
            <Input label="Bank Account" defaultValue={payroll.bank_account} onChange={(e) => setPayrollForm((p) => ({ ...p, bank_account: e.target.value }))} />
            <Input label="Basic Salary" type="number" defaultValue={payroll.basic_salary} onChange={(e) => setPayrollForm((p) => ({ ...p, basic_salary: e.target.value }))} />
          </div>
          <Button className="mt-4" loading={payrollMut.isPending} onClick={() => payrollMut.mutate()}>Save Payroll Reference</Button>
        </Card>
      )}

      {tab === 'documents' && (
        <Card>
          <div className="mb-4 flex gap-2 items-center">
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
            {(teacher.documents || []).map((d) => (
              <li key={d.document_id} className="flex justify-between rounded-lg border px-3 py-2 text-sm">
                <span>{d.document_type} — {d.title || 'Document'}</span>
                {d.file_url && <a href={d.file_url} target="_blank" rel="noreferrer" className="text-primary">View</a>}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'certificates' && (
        <Card>
          <div className="mb-4 flex gap-2 max-w-xl">
            <Input placeholder="Certificate number" value={certForm.certificate_number} onChange={(e) => setCertForm((p) => ({ ...p, certificate_number: e.target.value }))} />
            <Button loading={certMut.isPending} onClick={() => certMut.mutate()}>Add</Button>
          </div>
          <ul className="space-y-2 text-sm">
            {(teacher.certificates || []).map((c) => (
              <li key={c.certificate_id} className="rounded-lg border px-3 py-2">
                {c.certificate_type} — {c.certificate_number || 'No number'}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'credentials' && (
        <Card>
          <p className="mb-4 text-sm text-muted">
            Portal login details for this academic staff member. Use View Creds to see email and password.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setCredentialsOpen(true)}>
              <FiKey className="h-4 w-4" /> View Creds
            </Button>
            <Button loading={credentialsMut.isPending} onClick={() => credentialsMut.mutate()}>
              <FiSend className="h-4 w-4" /> Send credentials via email/SMS
            </Button>
          </div>
        </Card>
      )}

      {tab === 'timetable' && (
        <Card>
          <div className="mb-4 grid gap-2 sm:grid-cols-2 max-w-xl">
            <Input placeholder="Academic Year UUID" value={timetableForm.academic_year} onChange={(e) => setTimetableForm((p) => ({ ...p, academic_year: e.target.value }))} />
            <Input placeholder="Subject UUID" value={timetableForm.subject} onChange={(e) => setTimetableForm((p) => ({ ...p, subject: e.target.value }))} />
            <Input placeholder="Period" type="number" value={timetableForm.period_number} onChange={(e) => setTimetableForm((p) => ({ ...p, period_number: Number(e.target.value) }))} />
          </div>
          <Button loading={timetableMut.isPending} onClick={() => timetableMut.mutate()}>Add Timetable Entry</Button>
          <ul className="mt-4 space-y-2 text-sm">
            {(teacher.timetable_entries || []).map((t) => (
              <li key={t.entry_id} className="rounded-lg border px-3 py-2">
                {t.weekday} P{t.period_number} — {t.subject_name || 'Subject'}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'lessonPlans' && (
        <Card>
          <div className="mb-4 grid gap-2 sm:grid-cols-2 max-w-xl">
            <Input placeholder="Academic Year UUID" value={lessonForm.academic_year} onChange={(e) => setLessonForm((p) => ({ ...p, academic_year: e.target.value }))} />
            <Input type="date" placeholder="Plan date" value={lessonForm.plan_date} onChange={(e) => setLessonForm((p) => ({ ...p, plan_date: e.target.value }))} />
            <Input placeholder="Topic" value={lessonForm.topic} onChange={(e) => setLessonForm((p) => ({ ...p, topic: e.target.value }))} className="sm:col-span-2" />
          </div>
          <Button loading={lessonMut.isPending} onClick={() => lessonMut.mutate()}>Add Lesson Plan</Button>
          <ul className="mt-4 space-y-2 text-sm">
            {(teacher.lesson_plans || []).map((p) => (
              <li key={p.plan_id} className="rounded-lg border px-3 py-2">{p.plan_date} — {p.topic}</li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'homework' && (
        <Card>
          <div className="mb-4 grid gap-2 sm:grid-cols-2 max-w-xl">
            <Input placeholder="Title" value={homeworkForm.title} onChange={(e) => setHomeworkForm((p) => ({ ...p, title: e.target.value }))} />
            <Input type="date" value={homeworkForm.assigned_date} onChange={(e) => setHomeworkForm((p) => ({ ...p, assigned_date: e.target.value }))} />
          </div>
          <Button loading={homeworkMut.isPending} onClick={() => homeworkMut.mutate()}>Add Homework</Button>
          <ul className="mt-4 space-y-2 text-sm">
            {(teacher.homework_assignments || []).map((h) => (
              <li key={h.homework_id} className="rounded-lg border px-3 py-2">{h.title} — due {h.due_date || '—'}</li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'onlineClasses' && (
        <Card>
          <div className="mb-4 grid gap-2 sm:grid-cols-2 max-w-xl">
            <Input placeholder="Title" value={onlineForm.title} onChange={(e) => setOnlineForm((p) => ({ ...p, title: e.target.value }))} />
            <Input type="datetime-local" value={onlineForm.scheduled_at} onChange={(e) => setOnlineForm((p) => ({ ...p, scheduled_at: e.target.value }))} />
            <Input placeholder="Meeting link" value={onlineForm.meeting_link} onChange={(e) => setOnlineForm((p) => ({ ...p, meeting_link: e.target.value }))} className="sm:col-span-2" />
          </div>
          <Button loading={onlineMut.isPending} onClick={() => onlineMut.mutate()}>Schedule Class</Button>
          <ul className="mt-4 space-y-2 text-sm">
            {(teacher.online_classes || []).map((c) => (
              <li key={c.class_id} className="rounded-lg border px-3 py-2">
                {c.title} — {c.scheduled_at} ({c.status})
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'reviews' && (
        <Card>
          <div className="mb-4 grid gap-2 sm:grid-cols-2 max-w-xl">
            <Input type="date" value={reviewForm.review_date} onChange={(e) => setReviewForm((p) => ({ ...p, review_date: e.target.value }))} />
            <Input type="number" step="0.1" placeholder="Rating" value={reviewForm.rating} onChange={(e) => setReviewForm((p) => ({ ...p, rating: e.target.value }))} />
            <Input placeholder="Comments" value={reviewForm.comments} onChange={(e) => setReviewForm((p) => ({ ...p, comments: e.target.value }))} className="sm:col-span-2" />
          </div>
          <Button loading={reviewMut.isPending} onClick={() => reviewMut.mutate()}>Add Review</Button>
          <ul className="mt-4 space-y-2 text-sm">
            {(teacher.performance_reviews || []).map((r) => (
              <li key={r.review_id} className="rounded-lg border px-3 py-2">
                {r.review_date} — Rating: {r.rating ?? '—'} {r.comments ? `: ${r.comments}` : ''}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <TeacherCredentialsModal
        teacher={teacher}
        open={credentialsOpen}
        onClose={() => setCredentialsOpen(false)}
        loading={isLoading}
      />
    </div>
  )
}
