import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { FiMessageSquare } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { Sheet } from '@/components/ui/Sheet'
import Button from '@/components/ui/Button'
import { schoolUserService } from '@/api/services'
import { unwrapList } from '@/api/client'
import { resolveRecordId } from '@/utils/record'
import {
  sanitizeByKind,
  validateByKind,
  getFieldError,
  handleFormInvalid,
  focusFormField,
} from '@/utils/validation'
import FormValidationSummary from '@/components/ui/FormValidationSummary'
import {
  ENQUIRY_SOURCE_LABELS,
  ENQUIRY_STATUS_LABELS,
  GENDERS,
  GENDER_LABELS,
  GRADES,
  INDIAN_STATES,
  PARENT_RELATIONSHIP_LABELS,
} from '../types'

function counsellorLabel(user) {
  return (
    user?.full_name ||
    `${user?.first_name || ''} ${user?.last_name || ''}`.trim() ||
    user?.username ||
    user?.email ||
    'User'
  )
}

const emptyForm = (academicYear) => ({
  studentName: '',
  dateOfBirth: '',
  gender: '',
  gradeApplying: 'Grade 1',
  academicYear,
  parentName: '',
  parentRelationship: 'father',
  phone: '',
  email: '',
  city: '',
  state: '',
  currentSchool: '',
  source: 'website',
  assignedTo: '',
})

export function EnquiryFormSheet({
  open,
  onClose,
  defaultAcademicYear,
  sendApplicationLinkOnSave,
  onSubmit,
  loading,
}) {
  const [form, setForm] = useState(() => emptyForm(defaultAcademicYear))
  const [trackingStatus, setTrackingStatus] = useState('new')
  const [errors, setErrors] = useState({})

  const counsellorsQuery = useQuery({
    queryKey: ['admission-counsellors'],
    queryFn: () => schoolUserService.list({ page_size: 100, is_active: true }),
    enabled: open,
  })

  const counsellors = useMemo(() => {
    const list = unwrapList(counsellorsQuery.data)
    return (list.results || []).map((u) => ({
      id: String(resolveRecordId(u) || u.id || ''),
      label: counsellorLabel(u),
    })).filter((u) => u.id)
  }, [counsellorsQuery.data])

  useEffect(() => {
    if (open) {
      setForm(emptyForm(defaultAcademicYear))
      setTrackingStatus('new')
      setErrors({})
    }
  }, [open, defaultAcademicYear])

  const update = (patch) => {
    setForm((f) => ({ ...f, ...patch }))
    setErrors((prev) => {
      const next = { ...prev }
      Object.entries(patch).forEach(([key, value]) => {
        // Live re-check only after the field already has an error
        if (!prev[key]) {
          delete next[key]
          return
        }
        if (key === 'phone') {
          const msg = getFieldError('mobile', value, { required: true, label: 'Mobile number' })
          if (msg) next.phone = msg
          else delete next.phone
        } else if (key === 'email') {
          const msg = getFieldError('email', value, {
            required: Boolean(sendApplicationLinkOnSave),
            label: 'Email',
          })
          if (msg) next.email = msg
          else delete next.email
        } else if (!value || (typeof value === 'string' && !value.trim())) {
          // keep required error until blur/submit for empty required fields
        } else {
          delete next[key]
        }
      })
      return next
    })
  }

  const updatePhone = (value) => update({ phone: sanitizeByKind('mobile', value) })
  const updateEmail = (value) => update({ email: sanitizeByKind('email', value) })

  const blurField = (key, value, kind, meta = {}) => {
    let message = null
    if (kind) {
      message = getFieldError(kind, value, meta)
    } else if (meta.required && !String(value || '').trim()) {
      message = `${meta.label || 'Field'} is required`
    }
    setErrors((prev) => {
      if (!message) {
        if (!prev[key]) return prev
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: message }
    })
  }

  const validate = () => {
    const next = {}
    if (!form.studentName.trim()) next.studentName = 'Student name is required'
    if (!form.dateOfBirth) next.dateOfBirth = 'Date of birth is required'
    if (!form.gender) next.gender = 'Gender is required'
    if (!form.parentName.trim()) next.parentName = 'Parent name is required'
    if (!form.city.trim()) next.city = 'City is required'
    if (!form.state) next.state = 'State is required'

    const phoneResult = validateByKind('mobile', form.phone, { required: true, label: 'Mobile number' })
    if (phoneResult !== true) next.phone = phoneResult

    const emailRequired = Boolean(sendApplicationLinkOnSave)
    const emailResult = validateByKind('email', form.email, {
      required: emailRequired,
      label: 'Email',
    })
    if (emailResult !== true) next.email = emailResult

    setErrors(next)
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length) {
      handleFormInvalid(validationErrors, { toastFn: toast.error })
      focusFormField(Object.keys(validationErrors)[0])
      return
    }
    await onSubmit({ ...form, enquiryStatus: trackingStatus })
    setForm(emptyForm(defaultAcademicYear))
    setTrackingStatus('new')
    setErrors({})
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="New Enquiry"
      description="Step 1 — collect minimal details only. Full application comes later."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50/50 px-4 py-3">
          <FiMessageSquare className="h-5 w-5 shrink-0 text-brand-600" />
          <p className="text-sm text-muted-foreground">
            Keep it short — parents are not overwhelmed. Enquiry number is auto-generated on save.
            {sendApplicationLinkOnSave
              ? ' When you enter the parent email, the online application link can be sent after submit.'
              : null}
          </p>
        </div>

        <FormValidationSummary errors={errors} />

        <FormBlock title="Student Information">
          <Grid>
            <Field label="Student Name" required error={errors.studentName}>
              <input
                className="lms-input w-full"
                value={form.studentName}
                onChange={(e) => update({ studentName: e.target.value })}
                onBlur={(e) => blurField('studentName', e.target.value, null, { required: true, label: 'Student name' })}
              />
            </Field>
            <Field label="Date of Birth" required error={errors.dateOfBirth}>
              <input
                className="lms-input w-full"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => update({ dateOfBirth: e.target.value })}
                onBlur={(e) => blurField('dateOfBirth', e.target.value, null, { required: true, label: 'Date of birth' })}
              />
            </Field>
            <Field label="Gender" required error={errors.gender}>
              <select
                className="lms-select w-full"
                value={form.gender}
                onChange={(e) => update({ gender: e.target.value })}
                onBlur={(e) => blurField('gender', e.target.value, null, { required: true, label: 'Gender' })}
              >
                <option value="">Select</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{GENDER_LABELS[g]}</option>
                ))}
              </select>
            </Field>
            <Field label="Class Applying For" required>
              <select className="lms-select w-full" value={form.gradeApplying} onChange={(e) => update({ gradeApplying: e.target.value })}>
                {GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </Field>
            <Field label="Academic Year Applying For" required>
              <input className="lms-input w-full" value={form.academicYear} onChange={(e) => update({ academicYear: e.target.value })} />
            </Field>
          </Grid>
        </FormBlock>

        <FormBlock title="Parent Information">
          <Grid>
            <Field label="Parent / Guardian Name" required error={errors.parentName}>
              <input
                className="lms-input w-full"
                value={form.parentName}
                onChange={(e) => update({ parentName: e.target.value })}
                onBlur={(e) => blurField('parentName', e.target.value, null, { required: true, label: 'Parent name' })}
              />
            </Field>
            <Field label="Relationship">
              <select className="lms-select w-full" value={form.parentRelationship} onChange={(e) => update({ parentRelationship: e.target.value })}>
                {Object.entries(PARENT_RELATIONSHIP_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Mobile Number" required error={errors.phone}>
              <input
                className="lms-input w-full"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={(e) => updatePhone(e.target.value)}
                onBlur={(e) => blurField('phone', e.target.value, 'mobile', { required: true, label: 'Mobile number' })}
                placeholder="10-digit mobile"
              />
            </Field>
            <Field
              label="Email Address"
              required={sendApplicationLinkOnSave}
              error={errors.email}
            >
              <input
                className="lms-input w-full"
                type="email"
                inputMode="email"
                value={form.email}
                onChange={(e) => updateEmail(e.target.value)}
                onBlur={(e) => blurField('email', e.target.value, 'email', {
                  required: Boolean(sendApplicationLinkOnSave),
                  label: 'Email',
                })}
              />
            </Field>
          </Grid>
        </FormBlock>

        <FormBlock title="Address Information">
          <Grid>
            <Field label="City" required error={errors.city}>
              <input
                className="lms-input w-full"
                value={form.city}
                onChange={(e) => update({ city: e.target.value })}
                onBlur={(e) => blurField('city', e.target.value, null, { required: true, label: 'City' })}
              />
            </Field>
            <Field label="State" required error={errors.state}>
              <select
                className="lms-select w-full"
                value={form.state}
                onChange={(e) => update({ state: e.target.value })}
                onBlur={(e) => blurField('state', e.target.value, null, { required: true, label: 'State' })}
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </Grid>
        </FormBlock>

        <FormBlock title="Additional Information">
          <Grid>
            <Field label="Current School Name">
              <input className="lms-input w-full" value={form.currentSchool} onChange={(e) => update({ currentSchool: e.target.value })} />
            </Field>
            <Field label="How did you hear about us?">
              <select className="lms-select w-full" value={form.source} onChange={(e) => update({ source: e.target.value })}>
                {Object.entries(ENQUIRY_SOURCE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
          </Grid>
        </FormBlock>

        <FormBlock title="Admission Team Tracking">
          <Grid>
            <Field label="Enquiry Date">
              <input className="lms-input w-full bg-muted" value={dayjs().format('YYYY-MM-DD')} readOnly />
            </Field>
            <Field label="Enquiry Number">
              <input className="lms-input w-full bg-muted font-mono text-xs" value="Auto on save" readOnly />
            </Field>
            <Field label="Counsellor Assigned">
              <select
                className="lms-select w-full"
                value={form.assignedTo}
                onChange={(e) => update({ assignedTo: e.target.value })}
                disabled={counsellorsQuery.isLoading}
              >
                <option value="">Unassigned</option>
                {counsellors.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select className="lms-select w-full" value={trackingStatus} onChange={(e) => setTrackingStatus(e.target.value)}>
                {Object.entries(ENQUIRY_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
          </Grid>
        </FormBlock>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="create" loading={loading}>
            Submit Enquiry
          </Button>
        </div>
      </form>
    </Sheet>
  )
}

function FormBlock({ title, children }) {
  return (
    <section className="rounded-xl border border-border p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  )
}

function Grid({ children }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  )
}
