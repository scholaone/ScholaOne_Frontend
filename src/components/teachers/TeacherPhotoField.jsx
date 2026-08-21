import { useEffect, useMemo, useRef, useState } from 'react'
import { FiCamera } from 'react-icons/fi'
import { resolveMediaUrl } from '@/utils/format'

function teacherInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    || '?'
}

export function formatClassTeacherLabel(mappings = []) {
  if (!mappings?.length) return ''
  return mappings
    .map((mapping) => {
      const classLabel = [mapping.class_name, mapping.section_name].filter(Boolean).join(' ').trim()
      if (classLabel && mapping.academic_year) return `${classLabel} (${mapping.academic_year})`
      return classLabel || mapping.academic_year || ''
    })
    .filter(Boolean)
    .join(' · ')
}

export default function TeacherPhotoField({
  name = 'Teacher',
  designation = '',
  roleLabel = '',
  classLabel = '',
  email = '',
  employeeId = '',
  currentUrl,
  pendingFile,
  uploading = false,
  editable = true,
  actions = null,
  onFileChange,
  onClearPending,
}) {
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    if (!pendingFile) {
      setPreview(null)
      return undefined
    }
    const objectUrl = URL.createObjectURL(pendingFile)
    setPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [pendingFile])

  useEffect(() => {
    setImageFailed(false)
  }, [currentUrl, preview])

  const displayUrl = useMemo(
    () => preview || resolveMediaUrl(currentUrl) || null,
    [preview, currentUrl],
  )

  const metaItems = [
    designation ? { label: 'Designation', value: designation } : null,
    classLabel ? { label: 'Class', value: classLabel } : null,
    roleLabel ? { label: 'User type', value: roleLabel } : null,
  ].filter(Boolean)

  const handleFilePick = (file) => {
    if (!file || uploading) return
    onFileChange?.(file)
  }

  return (
    <div className="teacher-profile-head rounded-xl border border-border bg-gradient-to-br from-slate-50/80 via-white to-brand-50/30 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="relative mx-auto shrink-0 sm:mx-0">
          <div className="relative h-44 w-44 overflow-hidden rounded-none border border-border/80 bg-white shadow-md sm:h-52 sm:w-52">
            {displayUrl && !imageFailed ? (
              <img
                src={displayUrl}
                alt={name}
                className="h-full w-full object-contain object-center"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-indigo-100 text-3xl font-bold text-brand-700">
                {teacherInitials(name)}
              </div>
            )}
            {uploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                <span className="text-xs font-medium text-white">Uploading…</span>
              </div>
            ) : null}
          </div>

          {editable ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={uploading}
                onChange={(event) => {
                  handleFilePick(event.target.files?.[0] || null)
                  event.target.value = ''
                }}
              />
              <button
                type="button"
                aria-label="Change profile photo"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 left-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-lg transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiCamera className="h-4 w-4" aria-hidden />
              </button>
            </>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{name}</h2>
          {email ? <p className="mt-0.5 text-sm text-muted">{email}</p> : null}
          {employeeId ? (
            <p className="mt-0.5 text-sm font-medium text-foreground">
              <span className="text-muted">Employee ID:</span> {employeeId}
            </p>
          ) : null}

          {metaItems.length || actions ? (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {metaItems.map((item) => (
                <div
                  key={item.label}
                  className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-border/80 bg-white/90 px-3 py-1.5 text-xs shadow-sm"
                >
                  <dt className="font-semibold text-muted">{item.label}</dt>
                  <dd className="truncate font-semibold text-foreground">{item.value}</dd>
                </div>
              ))}
              {actions ? (
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  {actions}
                </div>
              ) : null}
            </div>
          ) : null}

          {pendingFile ? (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="text-xs font-medium text-amber-700">Photo selected — save the form to upload</span>
              <button
                type="button"
                className="text-xs font-semibold text-destructive hover:underline"
                onClick={onClearPending}
              >
                Remove
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
