import { useEffect, useState } from 'react'
import ProfilePhotoFrame from '@/components/common/ProfilePhotoFrame'

export default function TeacherPhotoField({
  name = 'Teacher',
  currentUrl,
  pendingFile,
  uploading = false,
  onFileChange,
  onClearPending,
}) {
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (!pendingFile) {
      setPreview(null)
      return undefined
    }
    const objectUrl = URL.createObjectURL(pendingFile)
    setPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [pendingFile])

  const displayUrl = preview || currentUrl || null

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5">
      <p className="mb-4 text-sm font-semibold text-foreground">Profile photo</p>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <ProfilePhotoFrame
          src={displayUrl}
          alt={name}
          frameClassName="ring-2 ring-border shadow-sm shrink-0"
        />
        <div className="min-w-0 flex-1 space-y-3">
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              onFileChange(e.target.files?.[0] || null)
              e.target.value = ''
            }}
            className="block w-full max-w-md text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary disabled:opacity-60"
          />
          <p className="text-xs leading-relaxed text-muted">
            {uploading
              ? 'Uploading…'
              : 'Saved under staging/Orgs/your-org/Orgs_Teacher on Cloudflare R2. Large images are compressed before upload.'}
          </p>
          {pendingFile ? (
            <button
              type="button"
              className="text-xs font-medium text-destructive hover:underline"
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
