import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FiFileText, FiImage, FiUpload } from 'react-icons/fi'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { organizationService, schoolService } from '@/api/services'
import { getErrorMessage, unwrapData, unwrapList } from '@/api/client'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn, resolveMediaUrl } from '@/utils/format'
import {
  SchoolDocumentsList,
  SchoolDocumentsUploader,
  useSchoolDocumentDelete,
} from './SchoolDocumentsModal'

const IMAGE_ACCEPT = 'image/png,image/jpeg,image/jpg,image/webp,image/gif'
const IMAGE_MAX_BYTES = 5 * 1024 * 1024

const SCHOOL_TYPE_OPTIONS = [
  { label: 'CBSE', value: 'cbse' },
  { label: 'ICSE', value: 'icse' },
  { label: 'ISC', value: 'isc' },
  { label: 'State Board', value: 'state_board' },
  { label: 'IGCSE', value: 'igcse' },
  { label: 'IB', value: 'ib' },
  { label: 'Cambridge', value: 'cambridge' },
  { label: 'PU College', value: 'pu_college' },
  { label: 'Degree College', value: 'degree_college' },
  { label: 'Training Institute', value: 'training_institute' },
  { label: 'Kindergarten', value: 'kindergarten' },
  { label: 'Play School', value: 'play_school' },
  { label: 'University', value: 'university' },
  { label: 'Coaching Institute', value: 'coaching_institute' },
  { label: 'Other', value: 'other' },
]

const SCHOOL_FIELDS = [
  {
    name: 'school_name',
    label: 'School Name',
    type: 'text',
    required: true,
    validate: (value) => {
      const trimmed = String(value ?? '').trim()
      if (trimmed.length < 2) return 'School name must be at least 2 characters'
      return true
    },
  },
  { name: 'school_code', label: 'School Code', type: 'text', required: true, readOnlyOnEdit: true },
  { name: 'short_name', label: 'Short Name', type: 'text' },
  { name: 'legal_name', label: 'Legal Name', type: 'text' },
  { name: 'affiliation_number', label: 'Affiliation Number', type: 'text' },
  { name: 'school_type', label: 'School Type', type: 'select', options: SCHOOL_TYPE_OPTIONS },
  {
    name: 'medium',
    label: 'Medium',
    type: 'select',
    options: [
      { label: 'English', value: 'english' },
      { label: 'Hindi', value: 'hindi' },
      { label: 'Regional', value: 'regional' },
      { label: 'Bilingual', value: 'bilingual' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    name: 'school_category',
    label: 'Category',
    type: 'select',
    options: [
      { label: 'Co-Educational', value: 'coed' },
      { label: 'Boys', value: 'boys' },
      { label: 'Girls', value: 'girls' },
    ],
  },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'alternate_phone', label: 'Alternate Phone', type: 'text' },
  { name: 'website', label: 'Website', type: 'text' },
  { name: 'principal_name', label: 'Principal', type: 'text' },
  { name: 'vice_principal_name', label: 'Vice Principal', type: 'text' },
  { name: 'head_office_contact', label: 'Head Office Contact', type: 'text' },
  { name: 'address', label: 'Address', type: 'textarea', fullWidth: true },
  { name: 'pincode', label: 'Pincode', type: 'text' },
  { name: 'latitude', label: 'Latitude', type: 'text' },
  { name: 'longitude', label: 'Longitude', type: 'text' },
  { name: 'google_map_url', label: 'Google Map URL', type: 'text', fullWidth: true },
  { name: 'motto', label: 'Motto', type: 'text', fullWidth: true },
  { name: 'mission', label: 'Mission', type: 'textarea', fullWidth: true },
  { name: 'vision', label: 'Vision', type: 'textarea', fullWidth: true },
  { name: 'established_date', label: 'Established Date', type: 'date' },
  { name: 'recognition_details', label: 'Recognition Details', type: 'textarea', fullWidth: true },
  { name: 'registration_details', label: 'Registration Details', type: 'textarea', fullWidth: true },
  { name: 'academic_start_month', label: 'Academic Start Month', type: 'number', validate: (value) => {
    if (value === '' || value == null || Number.isNaN(Number(value))) return true
    const month = Number(value)
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return 'Academic start month must be between 1 and 12'
    }
    return true
  } },
  { name: 'academic_calendar', label: 'Academic Calendar', type: 'text' },
  { name: 'language', label: 'Language', type: 'text', placeholder: 'en' },
  { name: 'timezone', label: 'Timezone', type: 'text', placeholder: 'Asia/Kolkata' },
  { name: 'currency', label: 'Currency', type: 'text', placeholder: 'INR' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Suspended', value: 'suspended' },
    ],
  },
]

function transformSchoolLoad(item) {
  return {
    organization_id: item.organization_id ? String(item.organization_id) : '',
    school_name: item.school_name || '',
    school_code: item.school_code || '',
    short_name: item.short_name || '',
    legal_name: item.legal_name || '',
    affiliation_number: item.affiliation_number || '',
    school_type: item.school_type || 'other',
    medium: item.medium || 'english',
    school_category: item.school_category || 'coed',
    email: item.email || '',
    phone: item.phone || '',
    alternate_phone: item.alternate_phone || '',
    website: item.website || '',
    principal_name: item.principal_name || '',
    vice_principal_name: item.vice_principal_name || '',
    head_office_contact: item.head_office_contact || '',
    address: item.address || '',
    pincode: item.pincode || '',
    latitude: item.latitude ?? '',
    longitude: item.longitude ?? '',
    google_map_url: item.google_map_url || '',
    motto: item.motto || '',
    mission: item.mission || '',
    vision: item.vision || '',
    established_date: item.established_date || '',
    recognition_details: item.recognition_details || '',
    registration_details: item.registration_details || '',
    academic_start_month: item.academic_start_month ?? '',
    academic_calendar: item.academic_calendar || '',
    language: item.language || 'en',
    timezone: item.timezone || '',
    currency: item.currency || '',
    status: item.status || 'active',
  }
}

function buildSchoolPayload(values, { logoFile, brandingFile }) {
  const cleaned = { ...values }
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined || cleaned[key] === null) delete cleaned[key]
  })

  if (!logoFile && !brandingFile) return cleaned

  const fd = new FormData()
  Object.entries(cleaned).forEach(([key, value]) => {
    if (value === '' || value === undefined || value === null) return
    fd.append(key, value)
  })
  if (logoFile) fd.append('logo', logoFile)
  if (brandingFile) fd.append('branding', brandingFile)
  return fd
}

function schoolImageUrl(item, kind = 'logo') {
  if (!item) return null
  if (kind === 'banner') {
    return resolveMediaUrl(item.branding_url || item.branding)
  }
  return resolveMediaUrl(item.logo_url || item.logo)
}

function ImageUploadField({
  label,
  hint,
  previewUrl,
  onSelect,
  onClear,
  error,
  previewClassName = 'h-24 w-24',
}) {
  const inputRef = useRef(null)

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text">{label}</label>
      <p className="text-sm text-muted">{hint || 'PNG, JPG, WebP or GIF. Max 5 MB.'}</p>
      <div className="flex flex-col gap-4 rounded-xl border border-dashed border-border bg-slate-50/50 p-4 sm:flex-row sm:items-center">
        <div
          className={cn(
            'flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-white',
            previewClassName,
          )}
        >
          {previewUrl ? (
            <img src={previewUrl} alt={`${label} preview`} className="h-full w-full object-cover" />
          ) : (
            <FiImage className="h-8 w-8 text-muted" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
              <FiUpload className="h-4 w-4" />
              {previewUrl ? `Change ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
            </Button>
            {previewUrl ? (
              <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                Remove
              </Button>
            ) : null}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onSelect(file)
              e.target.value = ''
            }}
          />
        </div>
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  )
}

function SchoolBrandingUploadSection({
  logoPreview,
  bannerPreview,
  logoError,
  bannerError,
  onLogoSelect,
  onBannerSelect,
  onLogoClear,
  onBannerClear,
}) {
  return (
    <div className="rounded-xl border border-border bg-slate-50/40 p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text">Logo & Banner</h3>
        <p className="mt-0.5 text-xs text-muted">
          Upload a school logo and banner image. These appear on school profiles, forms, and reports.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ImageUploadField
          label="School Logo"
          hint="Square logo works best. PNG, JPG, WebP or GIF. Max 5 MB."
          previewUrl={logoPreview}
          onSelect={onLogoSelect}
          onClear={onLogoClear}
          error={logoError}
          previewClassName="h-28 w-28"
        />
        <ImageUploadField
          label="Banner"
          hint="Wide banner for headers and branding. PNG, JPG, WebP or GIF. Max 5 MB."
          previewUrl={bannerPreview}
          onSelect={onBannerSelect}
          onClear={onBannerClear}
          error={bannerError}
          previewClassName="h-28 w-full max-w-md"
        />
      </div>
    </div>
  )
}

function SchoolDocumentsEditSection({ schoolId }) {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['schools', schoolId],
    queryFn: () => schoolService.get(schoolId),
    enabled: Boolean(schoolId),
  })
  const school = unwrapData(data)
  const documents = school?.documents || []
  const { deleteDocument, deletingId } = useSchoolDocumentDelete(schoolId, [
    'schools',
    ['schools', schoolId],
  ])

  return (
    <Card className="w-full p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FiFileText className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text">Documents</h2>
          <p className="text-sm text-muted">Upload multiple files or remove existing ones</p>
        </div>
      </div>

      <div className="space-y-6">
        <SchoolDocumentsUploader
          schoolId={schoolId}
          onUploaded={() => {
            queryClient.invalidateQueries({ queryKey: ['schools'] })
            queryClient.invalidateQueries({ queryKey: ['schools', schoolId] })
          }}
        />
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">Uploaded documents</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-muted">
              {documents.length}
            </span>
          </div>
          <SchoolDocumentsList
            documents={documents}
            allowDownload
            allowDelete
            onDelete={deleteDocument}
            deletingId={deletingId}
          />
        </div>
      </div>
    </Card>
  )
}

function validateImageFile(file) {
  if (!file) return 'Please choose an image file'
  if (!file.type?.startsWith('image/')) return 'Please choose an image file (PNG, JPG, WebP or GIF)'
  if (file.size > IMAGE_MAX_BYTES) return 'Image must be 5 MB or smaller'
  return ''
}

export default function SchoolForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [logoFile, setLogoFile] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [logoError, setLogoError] = useState('')
  const [bannerError, setBannerError] = useState('')
  const logoPreviewRef = useRef(null)
  const bannerPreviewRef = useRef(null)

  const {
    data: orgData,
    isLoading: orgsLoading,
    error: orgsError,
    refetch: refetchOrgs,
  } = useQuery({
    queryKey: ['organizations', 'school-form-options'],
    queryFn: () => organizationService.list({ page_size: 500, ordering: 'organization_name' }),
  })

  const orgOptions = useMemo(() => {
    const { results } = unwrapList(orgData)
    return results.map((org) => ({
      label: `${org.organization_name} (${org.organization_code})`,
      value: String(org.organization_id || org.id),
    }))
  }, [orgData])

  const fields = useMemo(
    () => [
      {
        name: 'organization_id',
        label: 'Organization',
        type: 'select',
        required: true,
        readOnlyOnEdit: true,
        fullWidth: true,
        options: orgOptions,
      },
      ...SCHOOL_FIELDS,
    ],
    [orgOptions],
  )

  const revokeBlob = (url) => {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
  }

  const handleLogoSelect = useCallback((file) => {
    const error = validateImageFile(file)
    setLogoError(error)
    if (error) return
    revokeBlob(logoPreviewRef.current)
    const url = URL.createObjectURL(file)
    logoPreviewRef.current = url
    setLogoFile(file)
    setLogoPreview(url)
  }, [])

  const handleBannerSelect = useCallback((file) => {
    const error = validateImageFile(file)
    setBannerError(error)
    if (error) return
    revokeBlob(bannerPreviewRef.current)
    const url = URL.createObjectURL(file)
    bannerPreviewRef.current = url
    setBannerFile(file)
    setBannerPreview(url)
  }, [])

  const handleLogoClear = useCallback(() => {
    revokeBlob(logoPreviewRef.current)
    logoPreviewRef.current = null
    setLogoFile(null)
    setLogoPreview(null)
    setLogoError('')
  }, [])

  const handleBannerClear = useCallback(() => {
    revokeBlob(bannerPreviewRef.current)
    bannerPreviewRef.current = null
    setBannerFile(null)
    setBannerPreview(null)
    setBannerError('')
  }, [])

  const { data: schoolEditData } = useQuery({
    queryKey: ['schools', id],
    queryFn: () => schoolService.get(id),
    enabled: isEdit,
  })

  useEffect(() => {
    if (!isEdit || !schoolEditData) return
    if (logoFile || bannerFile) return
    const item = unwrapData(schoolEditData)
    const nextLogo = schoolImageUrl(item, 'logo')
    const nextBanner = schoolImageUrl(item, 'banner')
    setLogoPreview((prev) => (prev?.startsWith('blob:') ? prev : nextLogo))
    setBannerPreview((prev) => (prev?.startsWith('blob:') ? prev : nextBanner))
  }, [isEdit, schoolEditData, logoFile, bannerFile])

  const transformSubmit = useCallback(
    (values) => buildSchoolPayload(values, { logoFile, brandingFile: bannerFile }),
    [logoFile, bannerFile],
  )

  const validateBeforeSubmit = useCallback(() => {
    const errors = {}
    if (logoFile) {
      const err = validateImageFile(logoFile)
      if (err) {
        setLogoError(err)
        errors.logo = err
      }
    }
    if (bannerFile) {
      const err = validateImageFile(bannerFile)
      if (err) {
        setBannerError(err)
        errors.banner = err
      }
    }
    if (logoError) errors.logo = logoError
    if (bannerError) errors.banner = bannerError
    return errors
  }, [logoFile, bannerFile, logoError, bannerError])

  useEffect(() => {
    return () => {
      revokeBlob(logoPreviewRef.current)
      revokeBlob(bannerPreviewRef.current)
    }
  }, [])

  if (orgsLoading) return <PageLoader />
  if (orgsError) {
    return <ErrorState message={getErrorMessage(orgsError, 'Failed to load organizations')} onRetry={refetchOrgs} />
  }

  if (orgOptions.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-16 text-center">
        <h3 className="text-lg font-semibold text-text">No organizations yet</h3>
        <p className="mt-2 max-w-md text-sm text-muted">
          Create an organization first, then you can add schools under it.
        </p>
        <Link to="/organizations/new" className="mt-6">
          <Button>Add Organization</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ResourceFormPage
        title="School"
        queryKey="schools"
        getFn={schoolService.get}
        createFn={schoolService.create}
        updateFn={schoolService.update}
        basePath="/schools"
        fields={fields}
        transformLoad={transformSchoolLoad}
        transformSubmit={transformSubmit}
        validateBeforeSubmit={validateBeforeSubmit}
        renderTop={() => (
          <SchoolBrandingUploadSection
            logoPreview={logoPreview}
            bannerPreview={bannerPreview}
            logoError={logoError}
            bannerError={bannerError}
            onLogoSelect={handleLogoSelect}
            onBannerSelect={handleBannerSelect}
            onLogoClear={handleLogoClear}
            onBannerClear={handleBannerClear}
          />
        )}
      />
      {isEdit && <SchoolDocumentsEditSection schoolId={id} />}
    </div>
  )
}
