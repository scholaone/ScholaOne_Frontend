import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import TeacherPhotoField, { formatClassTeacherLabel } from '@/components/teachers/TeacherPhotoField'
import { useTeacherPhotoUpload } from '@/components/teachers/useTeacherPhotoUpload'
import { teacherService } from '@/api/services'
import { unwrapData } from '@/api/client'
import { resolveMediaUrl } from '@/utils/format'
import { ACADEMIC_STAFF_ROLE_OPTIONS, TEACHER_STATUS_OPTIONS } from '@/config/constants'

const fields = [
  { name: 'first_name', label: 'First Name', type: 'text', required: true },
  { name: 'middle_name', label: 'Middle Name', type: 'text' },
  { name: 'last_name', label: 'Last Name', type: 'text' },
  { name: 'preferred_name', label: 'Preferred Name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'mobile_number', label: 'Mobile', type: 'text', required: true },
  { name: 'employee_id', label: 'Employee ID', type: 'text', help: 'Leave blank to auto-generate' },
  { name: 'teacher_code', label: 'Teacher Code', type: 'text', help: 'Leave blank to auto-generate' },
  {
    name: 'academic_role',
    label: 'Academic Role',
    type: 'select',
    options: ACADEMIC_STAFF_ROLE_OPTIONS,
  },
  { name: 'custom_role_label', label: 'Custom Role Label', type: 'text', help: 'Used when role is Custom' },
  { name: 'designation', label: 'Designation', type: 'text' },
  { name: 'department', label: 'Department', type: 'text' },
  { name: 'specialization', label: 'Specialization', type: 'text' },
  { name: 'qualification_summary', label: 'Qualification Summary', type: 'text' },
  {
    name: 'total_experience_years',
    label: 'Total Experience (Years)',
    type: 'number',
    disabled: true,
    help: 'Auto-calculated from experience records on the teacher profile Experience tab.',
  },
  { name: 'joining_date', label: 'Joining Date', type: 'date' },
  { name: 'confirmation_date', label: 'Confirmation Date', type: 'date' },
  { name: 'date_of_birth', label: 'Date of Birth', type: 'date' },
  {
    name: 'gender',
    label: 'Gender',
    type: 'select',
    options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Other', value: 'other' },
    ],
  },
  { name: 'blood_group', label: 'Blood Group', type: 'text' },
  { name: 'nationality', label: 'Nationality', type: 'text' },
  { name: 'religion', label: 'Religion', type: 'text' },
  { name: 'languages_known', label: 'Languages Known', type: 'text', help: 'Comma-separated' },
  { name: 'address', label: 'Address', type: 'textarea', fullWidth: true },
  { name: 'city', label: 'City', type: 'text' },
  { name: 'state', label: 'State', type: 'text' },
  { name: 'pincode', label: 'Pincode', type: 'text' },
  { name: 'bio', label: 'Bio', type: 'textarea', fullWidth: true },
  { name: 'emergency_contact_name', label: 'Emergency Contact', type: 'text' },
  { name: 'emergency_contact_phone', label: 'Emergency Phone', type: 'text' },
  { name: 'status', label: 'Status', type: 'select', options: TEACHER_STATUS_OPTIONS },
  { name: 'portal_access', label: 'Portal Access', type: 'checkbox' },
  { name: 'mobile_app_access', label: 'Mobile App Access', type: 'checkbox' },
  { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
  { name: 'send_credentials', label: 'Send login credentials on create', type: 'checkbox' },
]

function mapTeacherLoad(item) {
  return {
    first_name: item.first_name || item.full_name?.split(' ')[0] || '',
    middle_name: item.middle_name || '',
    last_name: item.last_name || item.full_name?.split(' ').slice(1).join(' ') || '',
    preferred_name: item.preferred_name || '',
    email: item.email || '',
    mobile_number: item.mobile_number || '',
    employee_id: item.employee_id || '',
    teacher_code: item.teacher_code || '',
    academic_role: item.academic_role || 'teacher',
    custom_role_label: item.custom_role_label || '',
    designation: item.designation || '',
    department: item.department || '',
    specialization: item.specialization || '',
    qualification_summary: item.qualification_summary || '',
    total_experience_years: item.total_experience_years ?? '',
    joining_date: item.joining_date || '',
    confirmation_date: item.confirmation_date || '',
    date_of_birth: item.date_of_birth || '',
    gender: item.gender || '',
    blood_group: item.blood_group || '',
    nationality: item.nationality || '',
    religion: item.religion || '',
    languages_known: Array.isArray(item.languages_known)
      ? item.languages_known.join(', ')
      : (item.languages_known || ''),
    address: item.address || '',
    city: item.city || '',
    state: item.state || '',
    pincode: item.pincode || '',
    bio: item.bio || '',
    emergency_contact_name: item.emergency_contact_name || '',
    emergency_contact_phone: item.emergency_contact_phone || '',
    status: item.status || 'active',
    portal_access: Boolean(item.portal_access ?? true),
    mobile_app_access: Boolean(item.mobile_app_access ?? true),
    notes: item.notes || '',
  }
}

export default function TeacherForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [loadedPhotoUrl, setLoadedPhotoUrl] = useState('')
  const photoSeedRef = useRef(null)

  const photoUpload = useTeacherPhotoUpload({
    teacherId: isEdit ? id : null,
    initialUrl: loadedPhotoUrl,
    onUploaded: (url) => setLoadedPhotoUrl(url),
  })

  return (
    <ResourceFormPage
      title="Academic Staff"
      queryKey="teachers"
      getFn={teacherService.get}
      createFn={teacherService.create}
      updateFn={teacherService.update}
      basePath="/teachers"
      fields={fields}
      transformLoad={(item) => {
        const recordId = item.teacher_id || item.id
        if (photoSeedRef.current !== recordId) {
          photoSeedRef.current = recordId
          setLoadedPhotoUrl(resolveMediaUrl(item.photo_url) || '')
        }
        photoUpload.setPendingPhotoFile(null)
        return mapTeacherLoad(item)
      }}
      transformSubmit={(values) => {
        const payload = {
          ...values,
          languages_known: typeof values.languages_known === 'string'
            ? values.languages_known.split(',').map((s) => s.trim()).filter(Boolean)
            : values.languages_known,
          send_credentials: Boolean(values.send_credentials),
          portal_access: Boolean(values.portal_access),
          mobile_app_access: Boolean(values.mobile_app_access),
        }
        delete payload.total_experience_years
        return payload
      }}
      onSuccess={async ({ response }) => {
        if (photoUpload.pendingPhotoFile) {
          const saved = unwrapData(response)
          const teacherId = saved?.teacher_id || saved?.id
          if (teacherId) {
            await photoUpload.uploadPendingPhoto(teacherId)
          }
        }
      }}
      renderTop={({ item }) => (
        <TeacherPhotoField
          {...photoUpload.photoFieldProps}
          name={item?.full_name || photoUpload.photoFieldProps.name}
          email={item?.email}
          employeeId={item?.employee_id}
          designation={item?.designation}
          roleLabel={item?.academic_role_display || item?.academic_role}
          classLabel={formatClassTeacherLabel(item?.class_teacher_mappings)}
        />
      )}
    />
  )
}
