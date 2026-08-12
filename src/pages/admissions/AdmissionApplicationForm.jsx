import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { admissionService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import { GENDERS, GENDER_LABELS, GRADES, INDIAN_STATES } from '@/features/admissions/types'
import {
  APPLICATION_FORM_SECTIONS,
  BLOOD_GROUPS,
  BOARDS,
  DOCUMENT_CHECKLIST_LABELS,
  ageFromDob,
  emptyApplicationFormDraft,
  emptySibling,
  getEnquiryPrefillSummary,
  hydrateDraftFromApplication,
} from '@/features/admissions/utils/applicationFormDraft'
import { cn } from '@/lib/utils'
import PhotoUploadField from '@/components/common/PhotoUploadField'
import {
  sanitizeByKind,
  validateByKind,
  getFieldError,
  handleFormInvalid,
  focusFormField,
} from '@/utils/validation'
import FormValidationSummary from '@/components/ui/FormValidationSummary'

function Field({ label, required, children, className, error }) {
  return (
    <label className={cn('lms-field block space-y-1.5', className)}>
      <span className="block text-sm font-normal text-black" style={{ fontWeight: 500 }}>
        {label}
        {required ? <span className="ml-1 font-normal text-danger">*</span> : null}
      </span>
      {children}
      {error ? <span className="block text-xs text-danger">{error}</span> : null}
    </label>
  )
}

function collectApplicationFieldErrors(draft) {
  const errors = {}
  const check = (key, value, kind, label) => {
    const result = validateByKind(kind, value, { required: false, label })
    if (result !== true) errors[key] = result
  }

  check('student.aadhaar_number', draft.student?.aadhaar_number, 'aadhaar', 'Aadhaar number')
  check('father.mobile', draft.father?.mobile, 'mobile', 'Father mobile')
  check('father.email', draft.father?.email, 'email', 'Father email')
  check('mother.mobile', draft.mother?.mobile, 'mobile', 'Mother mobile')
  check('mother.email', draft.mother?.email, 'email', 'Mother email')
  if (draft.guardian?.applicable) {
    check('guardian.mobile', draft.guardian?.mobile, 'mobile', 'Guardian mobile')
  }
  check('address.pincode', draft.address?.pincode, 'pincode', 'PIN code')
  if (!draft.address?.permanent_same_as_communication) {
    check('address.permanent_pincode', draft.address?.permanent_pincode, 'pincode', 'Permanent PIN code')
  }
  check('emergency_contact.mobile', draft.emergency_contact?.mobile, 'mobile', 'Emergency mobile')
  check('emergency_contact.alternate_number', draft.emergency_contact?.alternate_number, 'mobile', 'Alternate number')
  return errors
}

function SubHeading({ children, className }) {
  return (
    <p className={cn('text-sm text-black', className)} style={{ fontWeight: 600 }}>
      {children}
    </p>
  )
}

function Grid({ children }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}

function Section({ id, title, hint, children }) {
  return (
    <section id={`form-section-${id}`} className="scroll-mt-24 space-y-4">
      <div>
        <h2 className="text-base font-bold text-black">{title}</h2>
        {hint ? <p className="mt-1 text-sm font-normal text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </section>
  )
}

function setPath(obj, path, value) {
  const next = structuredClone(obj)
  const parts = path.split('.')
  let cur = next
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i]
    if (cur[key] == null || typeof cur[key] !== 'object') cur[key] = {}
    cur = cur[key]
  }
  cur[parts[parts.length - 1]] = value
  return next
}

export default function AdmissionApplicationForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState(() => emptyApplicationFormDraft())
  const [activeSection, setActiveSection] = useState(APPLICATION_FORM_SECTIONS[0].id)
  const [notes, setNotes] = useState('')
  const [meta, setMeta] = useState({ applicationNumber: '', status: '', academicYearName: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  const { data, isLoading, error } = useQuery({
    queryKey: ['admission-applications', id],
    queryFn: () => admissionService.applications.get(id),
    enabled: isEdit,
    staleTime: 0,
    refetchOnMount: 'always',
  })

  useEffect(() => {
    if (!data || !isEdit) return
    const app = unwrapData(data)
    setDraft(hydrateDraftFromApplication(app))
    setNotes(app?.notes || '')
    setMeta({
      applicationNumber: app?.application_number || '',
      status: app?.status_display || app?.status || '',
      academicYearName: app?.academic_year_name || '',
      admissionNumber: app?.admission_number || '',
      schoolId: app?.school || app?.school_id || '',
    })
  }, [data, isEdit])

  const prefillSummary = useMemo(() => getEnquiryPrefillSummary(draft), [draft])

  const update = (path, value, kind, meta = {}) => {
    const nextValue = kind ? sanitizeByKind(kind, value) : value
    setDraft((prev) => setPath(prev, path, nextValue))
    setFieldErrors((prev) => {
      // Live re-check once the field already showed an error
      if (!prev[path] && !meta.forceValidate) return prev
      if (!kind && !meta.required) {
        const next = { ...prev }
        delete next[path]
        return next
      }
      const message = kind
        ? getFieldError(kind, nextValue, {
            required: meta.required,
            label: meta.label,
          })
        : nextValue || !meta.required
          ? null
          : `${meta.label || 'Field'} is required`
      if (!message) {
        const next = { ...prev }
        delete next[path]
        return next
      }
      return { ...prev, [path]: message }
    })
  }

  const blurField = (path, value, kind, meta = {}) => {
    if (!kind && !meta.required) return
    const message = kind
      ? getFieldError(kind, value, { required: meta.required, label: meta.label })
      : (String(value || '').trim() || !meta.required
          ? null
          : `${meta.label || 'Field'} is required`)
    setFieldErrors((prev) => {
      if (!message) {
        if (!prev[path]) return prev
        const next = { ...prev }
        delete next[path]
        return next
      }
      return { ...prev, [path]: message }
    })
  }

  const runFieldValidation = ({ submit }) => {
    const errors = collectApplicationFieldErrors(draft)
    if (submit && !draft.student?.first_name?.trim()) {
      errors['student.first_name'] = 'Student first name is required'
    }
    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      handleFormInvalid(errors, { toastFn: toast.error })
      focusFormField(Object.keys(errors)[0])
      return false
    }
    return true
  }

  const updateStudentDob = (value) => {
    setDraft((prev) => {
      const next = setPath(prev, 'student.date_of_birth', value)
      next.student.age = ageFromDob(value)
      return next
    })
  }

  const syncTransportFlags = (transportRequired) => {
    setDraft((prev) => {
      const next = structuredClone(prev)
      next.academic.transport_required = transportRequired
      next.transport.transport_required = transportRequired
      return next
    })
  }

  const saveMutation = useMutation({
    mutationFn: async ({ submit }) => {
      const payload = {
        form_draft: draft,
        form_step: APPLICATION_FORM_SECTIONS.findIndex((s) => s.id === activeSection) + 1,
        is_draft: !submit,
        notes,
      }
      if (isEdit) {
        const updated = await admissionService.applications.update(id, payload)
        if (submit) {
          await admissionService.applications.submitApplication(id)
        }
        return updated
      }
      const created = await admissionService.applications.create({
        ...payload,
        first_name: draft.student.first_name || 'Student',
        last_name: draft.student.last_name || '',
        mobile_number: draft.father.mobile || draft.mother.mobile || draft.guardian.mobile || '',
        email: draft.father.email || draft.mother.email || '',
      })
      const createdApp = unwrapData(created)
      const createdId = createdApp?.application_id || createdApp?.id
      if (submit && createdId) {
        await admissionService.applications.submitApplication(createdId)
      }
      return created
    },
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admission-applications'] })
      queryClient.invalidateQueries({ queryKey: ['admission-leads'] })
      toast.success(vars.submit ? 'Application submitted' : 'Application saved as draft')
      navigate('/admissions/applications/internal')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const prefilledHint = useMemo(() => {
    if (!isEdit) return 'Fill the full application form.'
    return 'Enquiry details are pre-filled where available — review and complete the remaining sections.'
  }, [isEdit])

  if (isEdit && isLoading) return <PageLoader />
  if (isEdit && error) return <ErrorState message={getErrorMessage(error)} />

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Admissions', to: '/admissions' },
          { label: 'Applications', to: '/admissions/applications/internal' },
          { label: isEdit ? 'Edit Application Form' : 'New Application Form' },
        ]}
      />
      <PageHeader
        title="Application Form"
        description={prefilledHint}
        actions={
          <div className="flex flex-wrap gap-2">
            {isEdit ? (
              <Link to={`/admissions/applications/${id}`}>
                <Button variant="outline" type="button">Back to application</Button>
              </Link>
            ) : null}
            <Button
              type="button"
              variant="outline"
              disabled={saveMutation.isPending}
              onClick={() => {
                if (!runFieldValidation({ submit: false })) return
                saveMutation.mutate({ submit: false })
              }}
            >
              Save draft
            </Button>
            <Button
              type="button"
              disabled={saveMutation.isPending || !draft.student.first_name?.trim()}
              onClick={() => {
                if (!runFieldValidation({ submit: true })) return
                saveMutation.mutate({ submit: true })
              }}
            >
              Submit application
            </Button>
          </div>
        }
      />

      {(meta.applicationNumber || meta.admissionNumber || meta.academicYearName) && (
        <div className="flex flex-wrap gap-3 text-sm font-normal text-muted-foreground">
          {meta.applicationNumber ? <span>Application No: <span className="font-normal text-black" style={{ fontWeight: 500 }}>{meta.applicationNumber}</span></span> : null}
          {meta.admissionNumber ? <span>Admission No: <span className="font-normal text-black" style={{ fontWeight: 500 }}>{meta.admissionNumber}</span></span> : null}
          {meta.academicYearName ? <span>Year: <span className="font-normal text-black" style={{ fontWeight: 500 }}>{meta.academicYearName}</span></span> : null}
          {meta.status ? <span>Status: <span className="font-normal text-black" style={{ fontWeight: 500 }}>{meta.status}</span></span> : null}
        </div>
      )}

      <FormValidationSummary errors={fieldErrors} className="mb-2" />

      {prefillSummary.length > 0 ? (
        <div className="rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3">
          <p className="text-sm font-semibold text-brand-900">Loaded from enquiry</p>
          <p className="mt-0.5 text-xs font-normal text-muted-foreground">
            These fields came from the enquiry. Open Parent Details, Address, Previous School, and Academic for the rest.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {prefillSummary.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-1 rounded-md border border-brand-100 bg-white px-2.5 py-1 text-xs font-normal text-black"
              >
                <span className="text-muted-foreground">{item.label}:</span>
                <span style={{ fontWeight: 500 }}>{item.value}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="lg:sticky lg:top-20 lg:self-start">
          <Card padding className="space-y-1 p-3">
            {APPLICATION_FORM_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className={cn(
                  'block w-full rounded-md px-3 py-2 text-left text-sm transition font-normal',
                  activeSection === section.id
                    ? 'bg-brand-50 text-brand-800'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-black',
                )}
                style={activeSection === section.id ? { fontWeight: 600 } : undefined}
                onClick={() => {
                  setActiveSection(section.id)
                  document.getElementById(`form-section-${section.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                {section.label}
              </button>
            ))}
          </Card>
        </nav>

        <Card className="space-y-10">
          <Section id="student" title="Student Information" hint="Basic student identity. Admission number is generated after confirmation.">
            <Grid>
              <Field label="First Name" required error={fieldErrors['student.first_name']}>
                <input
                  className="lms-input w-full"
                  data-field-path="student.first_name"
                  value={draft.student.first_name}
                  onChange={(e) => update('student.first_name', e.target.value, null, { required: true, label: 'Student first name' })}
                  onBlur={(e) => blurField('student.first_name', e.target.value, null, { required: true, label: 'Student first name' })}
                />
              </Field>
              <Field label="Middle Name">
                <input className="lms-input w-full" value={draft.student.middle_name} onChange={(e) => update('student.middle_name', e.target.value)} />
              </Field>
              <Field label="Last Name">
                <input className="lms-input w-full" value={draft.student.last_name} onChange={(e) => update('student.last_name', e.target.value)} />
              </Field>
              <Field label="Admission Number (after admission)">
                <input className="lms-input w-full" value={draft.student.admission_number || meta.admissionNumber || ''} disabled readOnly />
              </Field>
              <Field label="Gender" required>
                <select className="lms-select w-full" value={draft.student.gender} onChange={(e) => update('student.gender', e.target.value)}>
                  <option value="">Select</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{GENDER_LABELS[g]}</option>
                  ))}
                </select>
              </Field>
              <Field label="Date of Birth" required>
                <input className="lms-input w-full" type="date" value={draft.student.date_of_birth} onChange={(e) => updateStudentDob(e.target.value)} />
              </Field>
              <Field label="Age">
                <input className="lms-input w-full" value={draft.student.age} readOnly disabled />
              </Field>
              <Field label="Blood Group">
                <select
                  className="lms-select w-full"
                  value={draft.student.blood_group}
                  onChange={(e) => {
                    const value = e.target.value
                    setDraft((prev) => {
                      const next = structuredClone(prev)
                      next.student.blood_group = value
                      next.medical.blood_group = value
                      return next
                    })
                  }}
                >
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </Field>
              <Field label="Nationality">
                <input className="lms-input w-full" value={draft.student.nationality} onChange={(e) => update('student.nationality', e.target.value)} />
              </Field>
              <Field label="Religion">
                <input className="lms-input w-full" value={draft.student.religion} onChange={(e) => update('student.religion', e.target.value)} />
              </Field>
              <Field label="Caste / Category">
                <input className="lms-input w-full" value={draft.student.caste_category} onChange={(e) => update('student.caste_category', e.target.value)} />
              </Field>
              <Field label="Aadhaar Number" error={fieldErrors['student.aadhaar_number']}>
                <input
                  className="lms-input w-full"
                  data-field-path="student.aadhaar_number"
                  inputMode="numeric"
                  maxLength={12}
                  value={draft.student.aadhaar_number}
                  onChange={(e) => update('student.aadhaar_number', e.target.value, 'aadhaar', { label: 'Aadhaar number' })}
                  onBlur={(e) => blurField('student.aadhaar_number', e.target.value, 'aadhaar', { label: 'Aadhaar number' })}
                  placeholder="12-digit Aadhaar"
                />
              </Field>
              <Field label="Student Photo" className="sm:col-span-2">
                <PhotoUploadField
                  label=""
                  currentUrl={draft.student.photo_url}
                  folder="admission_photo"
                  subfolder="student"
                  schoolId={meta.schoolId}
                  onUploaded={({ url, path }) => {
                    update('student.photo_url', url)
                    update('student.photo_path', path)
                    update('documents_checklist.student_photograph', true)
                  }}
                  onClear={() => {
                    update('student.photo_url', '')
                    update('student.photo_path', '')
                    update('documents_checklist.student_photograph', false)
                  }}
                />
              </Field>
            </Grid>
          </Section>

          <Section id="parents" title="Parent Details">
            <SubHeading>Father</SubHeading>
            <Grid>
              <Field label="Name"><input className="lms-input w-full" value={draft.father.name} onChange={(e) => update('father.name', e.target.value)} /></Field>
              <Field label="Qualification"><input className="lms-input w-full" value={draft.father.qualification} onChange={(e) => update('father.qualification', e.target.value)} /></Field>
              <Field label="Occupation"><input className="lms-input w-full" value={draft.father.occupation} onChange={(e) => update('father.occupation', e.target.value)} /></Field>
              <Field label="Company Name"><input className="lms-input w-full" value={draft.father.company_name} onChange={(e) => update('father.company_name', e.target.value)} /></Field>
              <Field label="Annual Income"><input className="lms-input w-full" value={draft.father.annual_income} onChange={(e) => update('father.annual_income', e.target.value)} /></Field>
              <Field label="Mobile Number" error={fieldErrors['father.mobile']}>
                <input className="lms-input w-full" data-field-path="father.mobile" type="tel" inputMode="numeric" maxLength={10} value={draft.father.mobile} onChange={(e) => update('father.mobile', e.target.value, 'mobile', { label: 'Father mobile' })} onBlur={(e) => blurField('father.mobile', e.target.value, 'mobile', { label: 'Father mobile' })} placeholder="10-digit mobile" />
              </Field>
              <Field label="Email" error={fieldErrors['father.email']}>
                <input className="lms-input w-full" data-field-path="father.email" type="email" value={draft.father.email} onChange={(e) => update('father.email', e.target.value, 'email', { label: 'Father email' })} onBlur={(e) => blurField('father.email', e.target.value, 'email', { label: 'Father email' })} />
              </Field>
              <Field label="Father Photo" className="sm:col-span-2">
                <PhotoUploadField
                  label=""
                  currentUrl={draft.father.photo_url}
                  folder="admission_photo"
                  subfolder="father"
                  schoolId={meta.schoolId}
                  onUploaded={({ url, path }) => {
                    update('father.photo_url', url)
                    update('father.photo_path', path)
                  }}
                  onClear={() => {
                    update('father.photo_url', '')
                    update('father.photo_path', '')
                  }}
                />
              </Field>
            </Grid>

            <SubHeading className="pt-4">Mother</SubHeading>
            <Grid>
              <Field label="Name"><input className="lms-input w-full" value={draft.mother.name} onChange={(e) => update('mother.name', e.target.value)} /></Field>
              <Field label="Qualification"><input className="lms-input w-full" value={draft.mother.qualification} onChange={(e) => update('mother.qualification', e.target.value)} /></Field>
              <Field label="Occupation"><input className="lms-input w-full" value={draft.mother.occupation} onChange={(e) => update('mother.occupation', e.target.value)} /></Field>
              <Field label="Company Name"><input className="lms-input w-full" value={draft.mother.company_name} onChange={(e) => update('mother.company_name', e.target.value)} /></Field>
              <Field label="Annual Income"><input className="lms-input w-full" value={draft.mother.annual_income} onChange={(e) => update('mother.annual_income', e.target.value)} /></Field>
              <Field label="Mobile Number" error={fieldErrors['mother.mobile']}>
                <input className="lms-input w-full" data-field-path="mother.mobile" type="tel" inputMode="numeric" maxLength={10} value={draft.mother.mobile} onChange={(e) => update('mother.mobile', e.target.value, 'mobile', { label: 'Mother mobile' })} onBlur={(e) => blurField('mother.mobile', e.target.value, 'mobile', { label: 'Mother mobile' })} placeholder="10-digit mobile" />
              </Field>
              <Field label="Email" error={fieldErrors['mother.email']}>
                <input className="lms-input w-full" data-field-path="mother.email" type="email" value={draft.mother.email} onChange={(e) => update('mother.email', e.target.value, 'email', { label: 'Mother email' })} onBlur={(e) => blurField('mother.email', e.target.value, 'email', { label: 'Mother email' })} />
              </Field>
              <Field label="Mother Photo" className="sm:col-span-2">
                <PhotoUploadField
                  label=""
                  currentUrl={draft.mother.photo_url}
                  folder="admission_photo"
                  subfolder="mother"
                  schoolId={meta.schoolId}
                  onUploaded={({ url, path }) => {
                    update('mother.photo_url', url)
                    update('mother.photo_path', path)
                  }}
                  onClear={() => {
                    update('mother.photo_url', '')
                    update('mother.photo_path', '')
                  }}
                />
              </Field>
            </Grid>

            <div className="flex items-center gap-2 pt-4">
              <input
                id="guardian-applicable"
                type="checkbox"
                checked={Boolean(draft.guardian.applicable)}
                onChange={(e) => update('guardian.applicable', e.target.checked)}
              />
              <label htmlFor="guardian-applicable" className="text-sm font-normal text-black" style={{ fontWeight: 500 }}>Guardian (if applicable)</label>
            </div>
            {draft.guardian.applicable ? (
              <Grid>
                <Field label="Name"><input className="lms-input w-full" value={draft.guardian.name} onChange={(e) => update('guardian.name', e.target.value)} /></Field>
                <Field label="Relationship"><input className="lms-input w-full" value={draft.guardian.relationship} onChange={(e) => update('guardian.relationship', e.target.value)} /></Field>
                <Field label="Mobile Number" error={fieldErrors['guardian.mobile']}>
                  <input className="lms-input w-full" data-field-path="guardian.mobile" type="tel" inputMode="numeric" maxLength={10} value={draft.guardian.mobile} onChange={(e) => update('guardian.mobile', e.target.value, 'mobile', { label: 'Guardian mobile' })} onBlur={(e) => blurField('guardian.mobile', e.target.value, 'mobile', { label: 'Guardian mobile' })} placeholder="10-digit mobile" />
                </Field>
                <Field label="Guardian Photo" className="sm:col-span-2">
                  <PhotoUploadField
                    label=""
                    currentUrl={draft.guardian.photo_url}
                    folder="admission_photo"
                    subfolder="guardian"
                    schoolId={meta.schoolId}
                    onUploaded={({ url, path }) => {
                      update('guardian.photo_url', url)
                      update('guardian.photo_path', path)
                    }}
                    onClear={() => {
                      update('guardian.photo_url', '')
                      update('guardian.photo_path', '')
                    }}
                  />
                </Field>
              </Grid>
            ) : null}
          </Section>

          <Section id="address" title="Address">
            <SubHeading>Communication Address</SubHeading>
            <Grid>
              <Field label="Door / House No."><input className="lms-input w-full" value={draft.address.door_no} onChange={(e) => update('address.door_no', e.target.value)} /></Field>
              <Field label="Street"><input className="lms-input w-full" value={draft.address.street} onChange={(e) => update('address.street', e.target.value)} /></Field>
              <Field label="Area"><input className="lms-input w-full" value={draft.address.area} onChange={(e) => update('address.area', e.target.value)} /></Field>
              <Field label="City"><input className="lms-input w-full" value={draft.address.city} onChange={(e) => update('address.city', e.target.value)} /></Field>
              <Field label="District"><input className="lms-input w-full" value={draft.address.district} onChange={(e) => update('address.district', e.target.value)} /></Field>
              <Field label="State">
                <select className="lms-select w-full" value={draft.address.state} onChange={(e) => update('address.state', e.target.value)}>
                  <option value="">Select</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Country"><input className="lms-input w-full" value={draft.address.country} onChange={(e) => update('address.country', e.target.value)} /></Field>
              <Field label="PIN Code" error={fieldErrors['address.pincode']}>
                <input className="lms-input w-full" data-field-path="address.pincode" inputMode="numeric" maxLength={6} value={draft.address.pincode} onChange={(e) => update('address.pincode', e.target.value, 'pincode', { label: 'PIN code' })} onBlur={(e) => blurField('address.pincode', e.target.value, 'pincode', { label: 'PIN code' })} placeholder="6-digit PIN" />
              </Field>
            </Grid>

            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm font-normal text-black" style={{ fontWeight: 500 }}>Permanent address same as communication?</span>
              <label className="flex items-center gap-1 text-sm font-normal">
                <input
                  type="radio"
                  checked={draft.address.permanent_same_as_communication === true}
                  onChange={() => update('address.permanent_same_as_communication', true)}
                />
                Yes
              </label>
              <label className="flex items-center gap-1 text-sm font-normal">
                <input
                  type="radio"
                  checked={draft.address.permanent_same_as_communication === false}
                  onChange={() => update('address.permanent_same_as_communication', false)}
                />
                No
              </label>
            </div>

            {!draft.address.permanent_same_as_communication ? (
              <>
                <SubHeading className="pt-2">Permanent Address</SubHeading>
                <Grid>
                  <Field label="Door / House No."><input className="lms-input w-full" value={draft.address.permanent_door_no} onChange={(e) => update('address.permanent_door_no', e.target.value)} /></Field>
                  <Field label="Street"><input className="lms-input w-full" value={draft.address.permanent_street} onChange={(e) => update('address.permanent_street', e.target.value)} /></Field>
                  <Field label="Area"><input className="lms-input w-full" value={draft.address.permanent_area} onChange={(e) => update('address.permanent_area', e.target.value)} /></Field>
                  <Field label="City"><input className="lms-input w-full" value={draft.address.permanent_city} onChange={(e) => update('address.permanent_city', e.target.value)} /></Field>
                  <Field label="District"><input className="lms-input w-full" value={draft.address.permanent_district} onChange={(e) => update('address.permanent_district', e.target.value)} /></Field>
                  <Field label="State"><input className="lms-input w-full" value={draft.address.permanent_state} onChange={(e) => update('address.permanent_state', e.target.value)} /></Field>
                  <Field label="Country"><input className="lms-input w-full" value={draft.address.permanent_country} onChange={(e) => update('address.permanent_country', e.target.value)} /></Field>
                  <Field label="PIN Code" error={fieldErrors['address.permanent_pincode']}>
                    <input className="lms-input w-full" data-field-path="address.permanent_pincode" inputMode="numeric" maxLength={6} value={draft.address.permanent_pincode} onChange={(e) => update('address.permanent_pincode', e.target.value, 'pincode', { label: 'Permanent PIN code' })} onBlur={(e) => blurField('address.permanent_pincode', e.target.value, 'pincode', { label: 'Permanent PIN code' })} placeholder="6-digit PIN" />
                  </Field>
                </Grid>
              </>
            ) : null}
          </Section>

          <Section id="previous_school" title="Previous School Details">
            <Grid>
              <Field label="School Name"><input className="lms-input w-full" value={draft.previous_school.school_name} onChange={(e) => update('previous_school.school_name', e.target.value)} /></Field>
              <Field label="Board">
                <select className="lms-select w-full" value={draft.previous_school.board} onChange={(e) => update('previous_school.board', e.target.value)}>
                  <option value="">Select</option>
                  {BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Grade Studied">
                <select className="lms-select w-full" value={draft.previous_school.grade_studied} onChange={(e) => update('previous_school.grade_studied', e.target.value)}>
                  <option value="">Select</option>
                  {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Academic Year"><input className="lms-input w-full" value={draft.previous_school.academic_year} onChange={(e) => update('previous_school.academic_year', e.target.value)} /></Field>
              <Field label="Medium of Instruction"><input className="lms-input w-full" value={draft.previous_school.medium} onChange={(e) => update('previous_school.medium', e.target.value)} /></Field>
              <Field label="Percentage / Grade"><input className="lms-input w-full" value={draft.previous_school.percentage_grade} onChange={(e) => update('previous_school.percentage_grade', e.target.value)} /></Field>
              <Field label="TC Number"><input className="lms-input w-full" value={draft.previous_school.tc_number} onChange={(e) => update('previous_school.tc_number', e.target.value)} /></Field>
              <Field label="EMIS / Student ID"><input className="lms-input w-full" value={draft.previous_school.emis_student_id} onChange={(e) => update('previous_school.emis_student_id', e.target.value)} /></Field>
            </Grid>
          </Section>

          <Section id="academic" title="Academic Details">
            <Grid>
              <Field label="Applying For Grade" required>
                <select className="lms-select w-full" value={draft.academic.applying_for_grade} onChange={(e) => update('academic.applying_for_grade', e.target.value)}>
                  <option value="">Select</option>
                  {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Academic Year"><input className="lms-input w-full" value={draft.academic.academic_year} onChange={(e) => update('academic.academic_year', e.target.value)} /></Field>
              <Field label="Stream (if applicable)"><input className="lms-input w-full" value={draft.academic.stream} onChange={(e) => update('academic.stream', e.target.value)} /></Field>
              <Field label="Second Language"><input className="lms-input w-full" value={draft.academic.second_language} onChange={(e) => update('academic.second_language', e.target.value)} /></Field>
              <Field label="Third Language"><input className="lms-input w-full" value={draft.academic.third_language} onChange={(e) => update('academic.third_language', e.target.value)} /></Field>
              <Field label="Elective Subjects" className="sm:col-span-2"><input className="lms-input w-full" value={draft.academic.elective_subjects} onChange={(e) => update('academic.elective_subjects', e.target.value)} /></Field>
              <Field label="Day Scholar / Hosteller">
                <select
                  className="lms-select w-full"
                  value={draft.academic.day_scholar_or_hosteller}
                  onChange={(e) => {
                    const value = e.target.value
                    setDraft((prev) => {
                      const next = structuredClone(prev)
                      next.academic.day_scholar_or_hosteller = value
                      next.academic.hostel_required = value === 'hosteller'
                      return next
                    })
                  }}
                >
                  <option value="day_scholar">Day Scholar</option>
                  <option value="hosteller">Hosteller</option>
                </select>
              </Field>
              <label className="flex items-center gap-2 self-end pb-2 text-sm font-normal" style={{ fontWeight: 500 }}>
                <input type="checkbox" checked={Boolean(draft.academic.transport_required)} onChange={(e) => syncTransportFlags(e.target.checked)} />
                Transport Required
              </label>
              <label className="flex items-center gap-2 self-end pb-2 text-sm font-normal" style={{ fontWeight: 500 }}>
                <input type="checkbox" checked={Boolean(draft.academic.hostel_required)} onChange={(e) => update('academic.hostel_required', e.target.checked)} />
                Hostel Required
              </label>
            </Grid>
          </Section>

          <Section id="medical" title="Medical Details">
            <Grid>
              <Field label="Blood Group">
                <select
                  className="lms-select w-full"
                  value={draft.medical.blood_group}
                  onChange={(e) => {
                    const value = e.target.value
                    setDraft((prev) => {
                      const next = structuredClone(prev)
                      next.medical.blood_group = value
                      next.student.blood_group = value
                      return next
                    })
                  }}
                >
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </Field>
              <Field label="Allergies"><input className="lms-input w-full" value={draft.medical.allergies} onChange={(e) => update('medical.allergies', e.target.value)} /></Field>
              <Field label="Existing Medical Conditions"><input className="lms-input w-full" value={draft.medical.medical_conditions} onChange={(e) => update('medical.medical_conditions', e.target.value)} /></Field>
              <Field label="Disabilities / Special Needs"><input className="lms-input w-full" value={draft.medical.disabilities_special_needs} onChange={(e) => update('medical.disabilities_special_needs', e.target.value)} /></Field>
              <Field label="Regular Medication"><input className="lms-input w-full" value={draft.medical.regular_medication} onChange={(e) => update('medical.regular_medication', e.target.value)} /></Field>
              <Field label="Emergency Contact Person"><input className="lms-input w-full" value={draft.medical.emergency_contact_person} onChange={(e) => update('medical.emergency_contact_person', e.target.value)} /></Field>
              <Field label="Emergency Contact Number"><input className="lms-input w-full" value={draft.medical.emergency_contact_number} onChange={(e) => update('medical.emergency_contact_number', e.target.value)} /></Field>
              <Field label="Family Doctor Details" className="sm:col-span-2"><input className="lms-input w-full" value={draft.medical.family_doctor_details} onChange={(e) => update('medical.family_doctor_details', e.target.value)} /></Field>
            </Grid>
          </Section>

          <Section id="siblings" title="Sibling Details">
            <div className="space-y-4">
              {(draft.siblings || []).map((sib, index) => (
                <div key={index} className="rounded-lg border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-normal" style={{ fontWeight: 500 }}>Sibling {index + 1}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDraft((prev) => ({
                        ...prev,
                        siblings: prev.siblings.filter((_, i) => i !== index),
                      }))}
                    >
                      Remove
                    </Button>
                  </div>
                  <Grid>
                    <Field label="Sibling Name">
                      <input
                        className="lms-input w-full"
                        value={sib.name}
                        onChange={(e) => {
                          const siblings = [...draft.siblings]
                          siblings[index] = { ...siblings[index], name: e.target.value }
                          update('siblings', siblings)
                        }}
                      />
                    </Field>
                    <label className="flex items-center gap-2 self-end pb-2 text-sm font-normal" style={{ fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={Boolean(sib.same_school)}
                        onChange={(e) => {
                          const siblings = [...draft.siblings]
                          siblings[index] = { ...siblings[index], same_school: e.target.checked }
                          update('siblings', siblings)
                        }}
                      />
                      Studying in Same School?
                    </label>
                    <Field label="Admission Number">
                      <input
                        className="lms-input w-full"
                        value={sib.admission_number}
                        onChange={(e) => {
                          const siblings = [...draft.siblings]
                          siblings[index] = { ...siblings[index], admission_number: e.target.value }
                          update('siblings', siblings)
                        }}
                      />
                    </Field>
                    <Field label="Grade">
                      <select
                        className="lms-select w-full"
                        value={sib.grade}
                        onChange={(e) => {
                          const siblings = [...draft.siblings]
                          siblings[index] = { ...siblings[index], grade: e.target.value }
                          update('siblings', siblings)
                        }}
                      >
                        <option value="">Select</option>
                        {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </Field>
                    <Field label="Section">
                      <input
                        className="lms-input w-full"
                        value={sib.section}
                        onChange={(e) => {
                          const siblings = [...draft.siblings]
                          siblings[index] = { ...siblings[index], section: e.target.value }
                          update('siblings', siblings)
                        }}
                      />
                    </Field>
                  </Grid>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => setDraft((prev) => ({
                  ...prev,
                  siblings: [...(prev.siblings || []), emptySibling()],
                }))}
              >
                Add sibling
              </Button>
            </div>
          </Section>

          <Section id="transport" title="Transport Details">
            <Grid>
              <label className="flex items-center gap-2 self-end pb-2 text-sm font-normal sm:col-span-3" style={{ fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={Boolean(draft.transport.transport_required)}
                  onChange={(e) => syncTransportFlags(e.target.checked)}
                />
                Transport Required
              </label>
              {draft.transport.transport_required ? (
                <>
                  <Field label="Pickup Location"><input className="lms-input w-full" value={draft.transport.pickup_location} onChange={(e) => update('transport.pickup_location', e.target.value)} /></Field>
                  <Field label="Drop Location"><input className="lms-input w-full" value={draft.transport.drop_location} onChange={(e) => update('transport.drop_location', e.target.value)} /></Field>
                  <Field label="Route"><input className="lms-input w-full" value={draft.transport.route} onChange={(e) => update('transport.route', e.target.value)} /></Field>
                  <Field label="Stop Name"><input className="lms-input w-full" value={draft.transport.stop_name} onChange={(e) => update('transport.stop_name', e.target.value)} /></Field>
                </>
              ) : null}
            </Grid>
          </Section>

          <Section id="documents" title="Documents Checklist" hint="Mark which documents are available. File upload is on the application detail page.">
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(DOCUMENT_CHECKLIST_LABELS).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm font-normal" style={{ fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={Boolean(draft.documents_checklist[key])}
                    onChange={(e) => update(`documents_checklist.${key}`, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </Section>

          <Section id="fee" title="Fee & Scholarship">
            <Grid>
              <label className="flex items-center gap-2 self-end pb-2 text-sm font-normal" style={{ fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={Boolean(draft.fee_scholarship.scholarship_applied)}
                  onChange={(e) => update('fee_scholarship.scholarship_applied', e.target.checked)}
                />
                Scholarship Applied
              </label>
              <Field label="Scholarship Category"><input className="lms-input w-full" value={draft.fee_scholarship.scholarship_category} onChange={(e) => update('fee_scholarship.scholarship_category', e.target.value)} /></Field>
              <Field label="Fee Concession"><input className="lms-input w-full" value={draft.fee_scholarship.fee_concession} onChange={(e) => update('fee_scholarship.fee_concession', e.target.value)} /></Field>
              <Field label="Payment Plan"><input className="lms-input w-full" value={draft.fee_scholarship.payment_plan} onChange={(e) => update('fee_scholarship.payment_plan', e.target.value)} /></Field>
              <label className="flex items-center gap-2 self-end pb-2 text-sm font-normal" style={{ fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={Boolean(draft.fee_scholarship.application_fee_paid)}
                  onChange={(e) => update('fee_scholarship.application_fee_paid', e.target.checked)}
                />
                Application Fee Payment Done
              </label>
            </Grid>
          </Section>

          <Section id="emergency" title="Emergency Contact">
            <Grid>
              <Field label="Contact Person"><input className="lms-input w-full" value={draft.emergency_contact.contact_person} onChange={(e) => update('emergency_contact.contact_person', e.target.value)} /></Field>
              <Field label="Relationship"><input className="lms-input w-full" value={draft.emergency_contact.relationship} onChange={(e) => update('emergency_contact.relationship', e.target.value)} /></Field>
              <Field label="Mobile Number" error={fieldErrors['emergency_contact.mobile']}>
                <input className="lms-input w-full" data-field-path="emergency_contact.mobile" type="tel" inputMode="numeric" maxLength={10} value={draft.emergency_contact.mobile} onChange={(e) => update('emergency_contact.mobile', e.target.value, 'mobile', { label: 'Emergency mobile' })} onBlur={(e) => blurField('emergency_contact.mobile', e.target.value, 'mobile', { label: 'Emergency mobile' })} placeholder="10-digit mobile" />
              </Field>
              <Field label="Alternate Number" error={fieldErrors['emergency_contact.alternate_number']}>
                <input className="lms-input w-full" data-field-path="emergency_contact.alternate_number" type="tel" inputMode="numeric" maxLength={10} value={draft.emergency_contact.alternate_number} onChange={(e) => update('emergency_contact.alternate_number', e.target.value, 'mobile', { label: 'Alternate number' })} onBlur={(e) => blurField('emergency_contact.alternate_number', e.target.value, 'mobile', { label: 'Alternate number' })} placeholder="10-digit mobile" />
              </Field>
            </Grid>
          </Section>

          <Section id="declaration" title="Declaration">
            <div className="space-y-4">
              <label className="flex items-start gap-2 text-sm font-normal" style={{ fontWeight: 500 }}>
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={Boolean(draft.declaration.parent_declaration)}
                  onChange={(e) => update('declaration.parent_declaration', e.target.checked)}
                />
                <span>Parent Declaration — I confirm that the information provided is true and complete.</span>
              </label>
              <label className="flex items-start gap-2 text-sm font-normal" style={{ fontWeight: 500 }}>
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={Boolean(draft.declaration.student_declaration)}
                  onChange={(e) => update('declaration.student_declaration', e.target.checked)}
                />
                <span>Student Declaration (if applicable)</span>
              </label>
              <Grid>
                <Field label="Digital Signature (type full name)">
                  <input className="lms-input w-full" value={draft.declaration.digital_signature} onChange={(e) => update('declaration.digital_signature', e.target.value)} />
                </Field>
                <Field label="Date">
                  <input className="lms-input w-full" type="date" value={draft.declaration.declaration_date} onChange={(e) => update('declaration.declaration_date', e.target.value)} />
                </Field>
              </Grid>
              <Field label="Internal notes">
                <textarea className="lms-input min-h-[80px] w-full" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </Field>
            </div>
          </Section>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-6">
            <Button
              type="button"
              variant="outline"
              disabled={saveMutation.isPending}
              onClick={() => {
                if (!runFieldValidation({ submit: false })) return
                saveMutation.mutate({ submit: false })
              }}
            >
              Save draft
            </Button>
            <Button
              type="button"
              disabled={saveMutation.isPending || !draft.student.first_name?.trim()}
              onClick={() => {
                if (!runFieldValidation({ submit: true })) return
                saveMutation.mutate({ submit: true })
              }}
            >
              Submit application
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
