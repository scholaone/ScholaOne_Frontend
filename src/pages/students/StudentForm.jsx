import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { PageHeader, Card } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import Button from '@/components/ui/Button'
import Input, { Textarea, SelectField } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { academicYearService, studentService } from '@/api/services'
import { listActiveClassSections } from '@/api/activeClassSections'
import { mapClassSectionOptions } from '@/utils/classSections'
import { getErrorMessage, unwrapData, unwrapList } from '@/api/client'
import { STUDENT_STATUS_OPTIONS } from '@/config/constants'
import ProfilePhotoFrame from '@/components/common/ProfilePhotoFrame'
import { compressImageFile } from '@/utils/imageCompress'
import { registerValidated, RHF_VALIDATION_MODE, handleFormInvalid } from '@/utils/validation'
import FormValidationSummaryRhf from '@/components/ui/FormValidationSummary'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
]

const defaultValues = {
  first_name: '',
  last_name: '',
  email: '',
  mobile_number: '',
  admission_number: '',
  academic_year_id: '',
  class_section: '',
  roll_number: '',
  date_of_birth: '',
  gender: '',
  blood_group: '',
  address: '',
  city: '',
  pincode: '',
  previous_school: '',
  previous_class: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  status: 'active',
  is_staff_child: false,
  notes: '',
}

function StudentPhotoField({ currentUrl, pendingFile, uploading, onFileChange, onClearPending }) {
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (pendingFile) {
      const objectUrl = URL.createObjectURL(pendingFile)
      setPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
    setPreview(null)
    return undefined
  }, [pendingFile])

  return (
    <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-border bg-slate-50/60 p-4">
      <label className="block text-sm font-medium text-text mb-3">Student Photo</label>
      <div className="flex flex-wrap items-start gap-5">
        {preview ? (
          <img
            src={preview}
            alt="Student preview"
            className="h-48 w-36 sm:h-56 sm:w-44 shrink-0 border border-border bg-white object-contain rounded-none shadow-sm"
          />
        ) : (
          <ProfilePhotoFrame src={currentUrl} alt="Student photo" />
        )}
        <div className="space-y-1.5 min-w-[220px]">
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              onFileChange(e.target.files?.[0] || null)
              e.target.value = ''
            }}
            className="block w-full max-w-xs text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary disabled:opacity-60"
          />
          <p className="text-xs text-muted">
            {uploading
              ? 'Uploading…'
              : 'Large photos are compressed in your browser first for faster upload'}
          </p>
          {pendingFile ? (
            <button
              type="button"
              className="text-xs font-medium text-danger hover:underline"
              onClick={onClearPending}
            >
              Clear selected photo
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function StudentForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const schoolScope = useSchoolScopedSelection()
  const [photoUrl, setPhotoUrl] = useState('')
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null)
  const [photoUploading, setPhotoUploading] = useState(false)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues,
    ...RHF_VALIDATION_MODE,
  })

  const academicYearId = watch('academic_year_id')
  const prevAcademicYearRef = useRef('')

  const yearsQuery = useQuery({
    queryKey: ['academic-years-student-form', schoolScope.schoolId],
    queryFn: () =>
      academicYearService.list({
        school: schoolScope.schoolId,
        page_size: 100,
        ordering: '-start_date',
      }),
    enabled: Boolean(schoolScope.schoolId),
  })

  const yearOptions = useMemo(() => {
    const { results } = unwrapList(yearsQuery.data)
    return (results || []).map((year) => ({
      label: year.is_current ? `${year.name} (current)` : year.name,
      value: String(year.id),
    }))
  }, [yearsQuery.data])

  const classSectionsQuery = useQuery({
    queryKey: ['class-sections-student-form', schoolScope.schoolId, academicYearId],
    queryFn: async () => {
      const primary = await listActiveClassSections({
        schoolId: schoolScope.schoolId,
        academicYearId,
      })
      if ((primary.results || []).length > 0 || !schoolScope.schoolId || !academicYearId) {
        return primary
      }
      return listActiveClassSections({ schoolId: schoolScope.schoolId })
    },
    enabled: Boolean(schoolScope.schoolId),
  })

  const classSectionOptions = useMemo(() => {
    const { results } = unwrapList(classSectionsQuery.data)
    return mapClassSectionOptions(results)
  }, [classSectionsQuery.data])

  const nextAdmQuery = useQuery({
    queryKey: ['students', 'next-admission-number', academicYearId],
    queryFn: async () =>
      unwrapData(
        await studentService.nextAdmissionNumber(
          academicYearId ? { academic_year: academicYearId } : {},
        ),
      ),
    enabled: !isEdit && Boolean(academicYearId),
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['students', id],
    queryFn: () => studentService.get(id),
    enabled: isEdit,
  })

  useEffect(() => {
    if (isEdit) return
    if (prevAcademicYearRef.current && prevAcademicYearRef.current !== academicYearId) {
      reset((current) => ({ ...current, class_section: '' }))
    }
    prevAcademicYearRef.current = academicYearId || ''
  }, [academicYearId, isEdit, reset])

  useEffect(() => {
    if (isEdit || yearOptions.length === 0) return
    const currentYear = yearOptions.find((year) => year.label.includes('(current)'))
    const nextYearId = currentYear?.value || yearOptions[0]?.value || ''
    if (!nextYearId) return
    reset((current) => (current.academic_year_id ? current : { ...current, academic_year_id: nextYearId }))
  }, [isEdit, yearOptions, reset])

  useEffect(() => {
    if (isEdit || !nextAdmQuery.data?.admission_number) return
    reset((current) => ({
      ...current,
      admission_number: nextAdmQuery.data.admission_number,
    }))
  }, [isEdit, nextAdmQuery.data, reset])

  useEffect(() => {
    if (!data || !isEdit) return
    const item = unwrapData(data)
    const enrollment = item.current_enrollment || {}
    reset({
      first_name: item.full_name?.split(' ')[0] || '',
      last_name: item.full_name?.split(' ').slice(1).join(' ') || '',
      email: item.email || '',
      mobile_number: item.mobile_number || '',
      admission_number: item.admission_number || '',
      academic_year_id: enrollment.academic_year ? String(enrollment.academic_year) : '',
      class_section: enrollment.class_section ? String(enrollment.class_section) : '',
      roll_number: enrollment.roll_number || item.roll_number || '',
      date_of_birth: item.date_of_birth || '',
      gender: item.gender || '',
      blood_group: item.blood_group || '',
      address: item.address || '',
      city: item.city || '',
      pincode: item.pincode || '',
      previous_school: item.previous_school || '',
      previous_class: item.previous_class || '',
      emergency_contact_name: item.emergency_contact_name || '',
      emergency_contact_phone: item.emergency_contact_phone || '',
      status: item.status || 'active',
      is_staff_child: Boolean(item.is_staff_child),
      notes: item.notes || '',
    })
    setPhotoUrl(item.photo_url || '')
    setPendingPhotoFile(null)
  }, [data, isEdit, reset])

  const uploadPhotoForStudent = async (studentId, file) => {
    const fd = new FormData()
    fd.append('file', file)
    const response = await studentService.uploadPhoto(studentId, fd)
    const payload = unwrapData(response) || {}
    return payload.photo_url || payload.url || payload.student?.photo_url || ''
  }

  const handlePhotoSelected = async (file) => {
    if (!file) return
    if (!file.type?.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image must be 15 MB or smaller')
      return
    }

    let uploadFile = file
    try {
      uploadFile = await compressImageFile(file)
      if (!uploadFile) {
        toast.error('Could not process this image. Try a JPG or PNG under 15 MB.')
        return
      }
    } catch {
      uploadFile = file
    }

    if (isEdit) {
      setPhotoUploading(true)
      try {
        const url = await uploadPhotoForStudent(id, uploadFile)
        setPhotoUrl(url || photoUrl)
        setPendingPhotoFile(null)
        queryClient.invalidateQueries({ queryKey: ['students', id] })
        toast.success('Photo uploaded')
      } catch (err) {
        toast.error(getErrorMessage(err))
      } finally {
        setPhotoUploading(false)
      }
      return
    }

    setPendingPhotoFile(uploadFile)
  }

  const mutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        ...values,
        class_section: values.class_section || null,
      }
      const response = isEdit
        ? await studentService.update(id, payload)
        : await studentService.create(payload)

      const saved = unwrapData(response)
      const studentId = saved?.student_id || saved?.id || id

      if (pendingPhotoFile && studentId) {
        await uploadPhotoForStudent(studentId, pendingPhotoFile)
      }

      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      toast.success(isEdit ? 'Student updated' : 'Student created')
      navigate('/students')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  if (isEdit && isLoading) return <PageLoader />
  if (isEdit && error) return <ErrorState message={getErrorMessage(error)} />

  return (
    <div className="lms-page w-full">
      <Breadcrumb items={[{ label: 'Students', href: '/students' }, { label: isEdit ? 'Edit' : 'New' }]} />
      <PageHeader title={isEdit ? 'Edit Student' : 'New Student'} />

      <Card className="w-full lms-form-card">
        <form
          noValidate
          onSubmit={handleSubmit(
            (values) => mutation.mutate(values),
            (invalidErrors) => handleFormInvalid(invalidErrors, { toastFn: toast.error }),
          )}
          className="grid gap-4 p-1 [grid-template-columns:minmax(0,1fr)] sm:[grid-template-columns:repeat(2,minmax(0,1fr))] lg:[grid-template-columns:repeat(3,minmax(0,1fr))]"
        >
          <FormValidationSummaryRhf errors={errors} className="sm:col-span-2 lg:col-span-3" />
          <StudentPhotoField
            currentUrl={photoUrl}
            pendingFile={pendingPhotoFile}
            uploading={photoUploading || mutation.isPending}
            onFileChange={handlePhotoSelected}
            onClearPending={() => setPendingPhotoFile(null)}
          />

          <div className="sm:col-span-2 lg:col-span-3 rounded-lg border border-border/70 bg-muted/20 px-4 py-3">
            <p className="text-sm font-medium text-foreground">Enrollment</p>
            <p className="text-xs text-muted">Academic year and class section for this student.</p>
          </div>

          <SelectField
            label="Academic Year"
            required
            options={yearOptions}
            placeholder={yearsQuery.isLoading ? 'Loading years…' : 'Select academic year'}
            error={errors.academic_year_id?.message}
            {...register('academic_year_id', { required: 'Academic year is required' })}
          />
          <SelectField
            label="Class & Section"
            required
            options={classSectionOptions}
            error={errors.class_section?.message}
            placeholder={
              classSectionsQuery.isLoading
                ? 'Loading classes…'
                : academicYearId
                  ? 'Select class section'
                  : 'Select academic year first'
            }
            {...register('class_section', { required: 'Class & section is required' })}
          />
          <Input label="Roll Number" {...register('roll_number')} />

          <Input label="First Name" required error={errors.first_name?.message} {...register('first_name', { required: 'First name is required' })} />
          <Input label="Last Name" error={errors.last_name?.message} {...register('last_name')} />
          <Input label="Email" error={errors.email?.message} {...registerValidated(register, 'email', { label: 'Email', type: 'email' })} />
          <Input label="Mobile" required error={errors.mobile_number?.message} {...registerValidated(register, 'mobile_number', { required: true, label: 'Mobile number' })} />
          <Input
            label="Admission Number"
            readOnly={!isEdit}
            hint={!isEdit ? 'Auto-generated from the last admission number for the selected year' : undefined}
            {...register('admission_number')}
          />
          <Input label="Date of Birth" type="date" {...register('date_of_birth')} />
          <SelectField label="Gender" options={GENDER_OPTIONS} placeholder="Select gender" {...register('gender')} />
          <Input label="Blood Group" {...register('blood_group')} />
          <div className="sm:col-span-2 lg:col-span-3">
            <Textarea label="Address" {...register('address')} />
          </div>
          <Input label="City" {...register('city')} />
          <Input label="Pincode" error={errors.pincode?.message} {...registerValidated(register, 'pincode', { label: 'Pincode' })} />
          <Input label="Previous School" {...register('previous_school')} />
          <Input label="Previous Class" {...register('previous_class')} />
          <Input label="Emergency Contact" {...register('emergency_contact_name')} />
          <Input label="Emergency Phone" error={errors.emergency_contact_phone?.message} {...registerValidated(register, 'emergency_contact_phone', { label: 'Emergency phone' })} />
          <SelectField label="Status" options={STUDENT_STATUS_OPTIONS} {...register('status')} />
          <div className="sm:col-span-2 lg:col-span-3">
            <Checkbox
              label="Staff child"
              description="Mark this student as a staff child for fee concessions and reporting."
              {...register('is_staff_child')}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <Textarea label="Notes" {...register('notes')} />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-3 pt-4 border-t border-[var(--clay-border)]">
            <Button type="submit" variant="primary" loading={mutation.isPending}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="cancel" onClick={() => navigate('/students')}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={async () => {
                if (isEdit) {
                  const item = unwrapData(data)
                  const enrollment = item?.current_enrollment || {}
                  reset({
                    first_name: item?.full_name?.split(' ')[0] || '',
                    last_name: item?.full_name?.split(' ').slice(1).join(' ') || '',
                    email: item?.email || '',
                    mobile_number: item?.mobile_number || '',
                    admission_number: item?.admission_number || '',
                    academic_year_id: enrollment.academic_year ? String(enrollment.academic_year) : '',
                    class_section: enrollment.class_section ? String(enrollment.class_section) : '',
                    roll_number: enrollment.roll_number || item?.roll_number || '',
                    date_of_birth: item?.date_of_birth || '',
                    gender: item?.gender || '',
                    blood_group: item?.blood_group || '',
                    address: item?.address || '',
                    city: item?.city || '',
                    pincode: item?.pincode || '',
                    previous_school: item?.previous_school || '',
                    previous_class: item?.previous_class || '',
                    emergency_contact_name: item?.emergency_contact_name || '',
                    emergency_contact_phone: item?.emergency_contact_phone || '',
                    status: item?.status || 'active',
                    is_staff_child: Boolean(item?.is_staff_child),
                    notes: item?.notes || '',
                  })
                  setPendingPhotoFile(null)
                  setPhotoUrl(item?.photo_url || '')
                  return
                }
                setPendingPhotoFile(null)
                setPhotoUrl('')
                const currentYear = yearOptions.find((year) => year.label.includes('(current)'))
                const defaultYearId = currentYear?.value || yearOptions[0]?.value || ''
                const { data: nextData } = await nextAdmQuery.refetch()
                reset({
                  ...defaultValues,
                  academic_year_id: defaultYearId,
                  admission_number: nextData?.admission_number || '',
                })
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
