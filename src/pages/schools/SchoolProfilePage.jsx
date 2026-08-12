import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiRefreshCw, FiSave } from 'react-icons/fi'
import { masterServices, schoolService } from '@/api/services'
import { getErrorMessage, unwrapData, unwrapList } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import Breadcrumb from '@/components/layout/Breadcrumb'
import Button from '@/components/ui/Button'
import Input, { SelectField, Textarea } from '@/components/ui/Input'
import { PageHeader, Card } from '@/components/ui/Card'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { resolveMediaUrl } from '@/utils/format'
import { sanitizeByKind, validateFields, getFieldError, handleFormInvalid } from '@/utils/validation'
import FormValidationSummary from '@/components/ui/FormValidationSummary'

const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'en' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Telugu', value: 'te' },
  { label: 'Kannada', value: 'kn' },
  { label: 'Malayalam', value: 'ml' },
  { label: 'Marathi', value: 'mr' },
  { label: 'Bengali', value: 'bn' },
  { label: 'Gujarati', value: 'gu' },
  { label: 'Punjabi', value: 'pa' },
]

function ImagePreview({ label, url, file, onChange }) {
  const preview = file ? URL.createObjectURL(file) : resolveMediaUrl(url)
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-text">{label}</p>
      <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-border bg-slate-50/80 p-3">
        {preview ? (
          <img src={preview} alt={label} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-xs text-muted">No image</span>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="block w-full text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary"
      />
    </div>
  )
}

function ProfileField({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-text">{value || '—'}</dd>
    </div>
  )
}

export default function SchoolProfilePage() {
  const { id: routeSchoolId } = useParams()
  const { isSchoolAdmin, user } = useAuth()
  const queryClient = useQueryClient()
  const schoolId = routeSchoolId || (isSchoolAdmin ? user?.school_id : null)
  const [tab, setTab] = useState('profile')
  const [form, setForm] = useState({})
  const [files, setFiles] = useState({})

  const profileQuery = useQuery({
    queryKey: ['school-profile', schoolId || 'mine'],
    queryFn: () => schoolService.getProfile(schoolId),
  })

  const countriesQuery = useQuery({
    queryKey: ['masters', 'countries', 'profile'],
    queryFn: () => masterServices.countries.list({ page_size: 200 }),
  })
  const boardsQuery = useQuery({
    queryKey: ['masters', 'boards', 'profile'],
    queryFn: () => masterServices.boards.list({ page_size: 200 }),
  })

  const profile = unwrapData(profileQuery.data)
  const resolvedSchoolId = schoolId || profile?.school_id

  const statesQuery = useQuery({
    queryKey: ['masters', 'states', form.country_id],
    queryFn: () => masterServices.states.list({ page_size: 200, country: form.country_id }),
    enabled: Boolean(form.country_id),
  })
  const citiesQuery = useQuery({
    queryKey: ['masters', 'cities', form.state_id],
    queryFn: () => masterServices.cities.list({ page_size: 200, state: form.state_id }),
    enabled: Boolean(form.state_id),
  })
  const academicYearsQuery = useQuery({
    queryKey: ['academic-years', resolvedSchoolId],
    queryFn: () => masterServices.academicYears.list({ page_size: 50, school: resolvedSchoolId }),
    enabled: Boolean(resolvedSchoolId),
  })

  useEffect(() => {
    if (!profile) return
    setForm({
      school_name: profile.school_name || '',
      address: profile.address || '',
      pincode: profile.pincode || '',
      country_id: profile.country_id ? String(profile.country_id) : '',
      state_id: profile.state_id ? String(profile.state_id) : '',
      city_id: profile.city_id ? String(profile.city_id) : '',
      email: profile.email || '',
      phone: profile.phone || '',
      website: profile.website || '',
      principal_name: profile.principal_name || '',
      affiliation_number: profile.affiliation_number || '',
      board_id: profile.board_id ? String(profile.board_id) : '',
      academic_year_id: profile.academic_year_id ? String(profile.academic_year_id) : '',
      academic_start_month: profile.academic_start_month ?? '',
      timezone: profile.timezone || '',
      currency: profile.currency || '',
      language: profile.language || 'en',
    })
  }, [profile])

  const countryOptions = useMemo(() => {
    const { results } = unwrapList(countriesQuery.data)
    return results.map((item) => ({ label: item.name, value: String(item.id) }))
  }, [countriesQuery.data])

  const stateOptions = useMemo(() => {
    const { results } = unwrapList(statesQuery.data)
    return results.map((item) => ({ label: item.name, value: String(item.id) }))
  }, [statesQuery.data])

  const cityOptions = useMemo(() => {
    const { results } = unwrapList(citiesQuery.data)
    return results.map((item) => ({ label: item.name, value: String(item.id) }))
  }, [citiesQuery.data])

  const boardOptions = useMemo(() => {
    const { results } = unwrapList(boardsQuery.data)
    return results.map((item) => ({ label: item.name, value: String(item.id) }))
  }, [boardsQuery.data])

  const academicYearOptions = useMemo(() => {
    const { results } = unwrapList(academicYearsQuery.data)
    return results.map((item) => ({ label: item.name, value: String(item.id) }))
  }, [academicYearsQuery.data])

  const updateMutation = useMutation({
    mutationFn: (payload) => schoolService.updateProfile(schoolId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-profile'] })
      toast.success('School profile updated')
      setFiles({})
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const qrMutation = useMutation({
    mutationFn: () => schoolService.regenerateQr(resolvedSchoolId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-profile'] })
      toast.success('QR code regenerated')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const [fieldErrors, setFieldErrors] = useState({})

  const setField = (name, value) => {
    const kind = ['email', 'phone', 'pincode', 'website'].includes(name)
      ? (name === 'phone' ? 'mobile' : name)
      : null
    const nextValue = kind ? sanitizeByKind(kind, value) : value
    setForm((prev) => ({ ...prev, [name]: nextValue }))
    setFieldErrors((prev) => {
      if (!prev[name]) return prev
      const message = kind
        ? getFieldError(kind, nextValue, { label: name })
        : null
      if (!message) {
        const next = { ...prev }
        delete next[name]
        return next
      }
      return { ...prev, [name]: message }
    })
  }

  const blurProfileField = (name, meta = {}) => {
    const kind = ['email', 'phone', 'pincode', 'website'].includes(name)
      ? (name === 'phone' ? 'mobile' : name)
      : null
    const label =
      meta.label ||
      (name === 'phone' ? 'Phone' : name === 'school_name' ? 'School name' : name.charAt(0).toUpperCase() + name.slice(1))

    let message = null
    if (kind) {
      message = getFieldError(kind, form[name], { ...meta, label })
    } else if (meta.required && !String(form[name] || '').trim()) {
      message = `${label} is required`
    }

    setFieldErrors((prev) => {
      if (!message) {
        if (!prev[name]) return prev
        const next = { ...prev }
        delete next[name]
        return next
      }
      return { ...prev, [name]: message }
    })
  }

  const handleSaveProfile = () => {
    const errors = validateFields(form, [
      { name: 'school_name', label: 'School name', required: true },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'mobile', required: true },
      { name: 'pincode', label: 'Pincode', type: 'pincode' },
      { name: 'website', label: 'Website', type: 'website' },
    ])
    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      handleFormInvalid(errors, { toastFn: toast.error })
      return
    }

    const payload = { ...form }
    Object.entries(payload).forEach(([key, value]) => {
      if (value === '') delete payload[key]
    })
    if (payload.academic_start_month !== undefined && payload.academic_start_month !== '') {
      payload.academic_start_month = Number(payload.academic_start_month)
    }
    updateMutation.mutate(payload)
  }

  const handleSaveBranding = () => {
    const formData = new FormData()
    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.append(key, file)
    })
    if ([...formData.keys()].length === 0) {
      toast.error('Select at least one image to upload')
      return
    }
    updateMutation.mutate(formData)
  }

  if (profileQuery.isLoading) return <PageLoader />
  if (profileQuery.error) {
    return <ErrorState message={getErrorMessage(profileQuery.error)} onRetry={profileQuery.refetch} />
  }

  return (
    <div className="w-full">
      <Breadcrumb items={[{ label: 'School Profile' }]} />
      <PageHeader
        title="School Profile"
        subtitle={profile?.organization_name ? `${profile.school_name} · ${profile.organization_name}` : profile?.school_name}
        actions={
          <>
            <Button variant="secondary" onClick={() => profileQuery.refetch()}>
              <FiRefreshCw className="h-4 w-4" /> Refresh
            </Button>
            {resolvedSchoolId ? (
              <Button variant="outline" loading={qrMutation.isPending} onClick={() => qrMutation.mutate()}>
                Regenerate QR
              </Button>
            ) : null}
          </>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {['profile', 'branding', 'view'].map((key) => (
          <Button
            key={key}
            size="sm"
            variant={tab === key ? 'primary' : 'secondary'}
            onClick={() => setTab(key)}
          >
            {key === 'profile' ? 'Edit Profile' : key === 'branding' ? 'Branding' : 'View Profile'}
          </Button>
        ))}
      </div>

      {tab === 'view' && (
        <Card>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ProfileField label="School Name" value={profile.school_name} />
            <ProfileField label="Code" value={profile.school_code} />
            <ProfileField label="Principal" value={profile.principal_name} />
            <ProfileField label="Affiliation No." value={profile.affiliation_number} />
            <ProfileField label="Board" value={profile.board_name} />
            <ProfileField label="Academic Year" value={profile.academic_year_name} />
            <ProfileField label="Email" value={profile.email} />
            <ProfileField label="Phone" value={profile.phone} />
            <ProfileField label="Website" value={profile.website} />
            <ProfileField label="Address" value={profile.address} />
            <ProfileField label="Country" value={profile.country_name} />
            <ProfileField label="State" value={profile.state_name} />
            <ProfileField label="City" value={profile.city_name} />
            <ProfileField label="Pincode" value={profile.pincode} />
            <ProfileField label="Timezone" value={profile.timezone} />
            <ProfileField label="Currency" value={profile.currency} />
            <ProfileField label="Language" value={profile.language} />
          </dl>
        </Card>
      )}

      {tab === 'profile' && (
        <Card>
          <FormValidationSummary errors={fieldErrors} className="mb-5" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="School Name" required error={fieldErrors.school_name} value={form.school_name} onChange={(e) => setField('school_name', e.target.value)} onBlur={() => blurProfileField('school_name', { required: true, label: 'School name' })} />
            <Input label="Pincode" required={false} inputMode="numeric" maxLength={6} error={fieldErrors.pincode} value={form.pincode} onChange={(e) => setField('pincode', e.target.value)} onBlur={() => blurProfileField('pincode')} />
            <Input label="Email" required type="email" error={fieldErrors.email} value={form.email} onChange={(e) => setField('email', e.target.value)} onBlur={() => blurProfileField('email')} />
            <Input label="Phone" required type="tel" inputMode="numeric" maxLength={10} error={fieldErrors.phone} value={form.phone} onChange={(e) => setField('phone', e.target.value)} onBlur={() => blurProfileField('phone')} />
            <Input label="Website" error={fieldErrors.website} value={form.website} onChange={(e) => setField('website', e.target.value)} onBlur={() => blurProfileField('website')} />
            <Input label="Principal Name" value={form.principal_name} onChange={(e) => setField('principal_name', e.target.value)} />
            <Input label="Affiliation Number" value={form.affiliation_number} onChange={(e) => setField('affiliation_number', e.target.value)} />
            <SelectField label="Country" options={countryOptions} value={form.country_id} onChange={(e) => setField('country_id', e.target.value)} placeholder="Select country" />
            <SelectField label="State" options={stateOptions} value={form.state_id} onChange={(e) => setField('state_id', e.target.value)} placeholder="Select state" />
            <SelectField label="City" options={cityOptions} value={form.city_id} onChange={(e) => setField('city_id', e.target.value)} placeholder="Select city" />
            <SelectField label="Board" options={boardOptions} value={form.board_id} onChange={(e) => setField('board_id', e.target.value)} placeholder="Select board" />
            <SelectField label="Academic Year" options={academicYearOptions} value={form.academic_year_id} onChange={(e) => setField('academic_year_id', e.target.value)} placeholder="Select year" />
            <Input label="Academic Start Month" type="number" min={1} max={12} value={form.academic_start_month} onChange={(e) => setField('academic_start_month', e.target.value)} />
            <Input label="Timezone" value={form.timezone} onChange={(e) => setField('timezone', e.target.value)} />
            <Input label="Currency" value={form.currency} onChange={(e) => setField('currency', e.target.value)} />
            <SelectField label="Language" options={LANGUAGE_OPTIONS} value={form.language} onChange={(e) => setField('language', e.target.value)} />
            <div className="sm:col-span-2 lg:col-span-3">
              <Textarea label="Address" value={form.address} onChange={(e) => setField('address', e.target.value)} />
            </div>
          </div>
          <div className="mt-6 flex gap-3 border-t border-border pt-4">
            <Button loading={updateMutation.isPending} onClick={handleSaveProfile}>
              <FiSave className="h-4 w-4" /> Save Profile
            </Button>
          </div>
        </Card>
      )}

      {tab === 'branding' && (
        <Card>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ImagePreview label="Logo" url={profile.logo_url} file={files.logo} onChange={(f) => setFiles((p) => ({ ...p, logo: f }))} />
            <ImagePreview label="School Branding" url={profile.branding_url} file={files.branding} onChange={(f) => setFiles((p) => ({ ...p, branding: f }))} />
            <ImagePreview label="Signature" url={profile.signature_url} file={files.signature} onChange={(f) => setFiles((p) => ({ ...p, signature: f }))} />
            <ImagePreview label="Stamp" url={profile.stamp_url} file={files.stamp} onChange={(f) => setFiles((p) => ({ ...p, stamp: f }))} />
            <ImagePreview label="QR Code" url={profile.qr_code_url} file={null} onChange={() => {}} />
          </div>
          <p className="mt-4 text-xs text-muted">QR code is auto-generated on save. Use Regenerate QR to create a new code.</p>
          <div className="mt-6 flex gap-3 border-t border-border pt-4">
            <Button loading={updateMutation.isPending} onClick={handleSaveBranding}>
              <FiSave className="h-4 w-4" /> Save Branding
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
