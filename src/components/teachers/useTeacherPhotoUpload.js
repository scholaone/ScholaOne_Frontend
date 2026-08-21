import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { teacherService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import { withCacheBust } from '@/utils/format'
import { compressImageFile } from '@/utils/imageCompress'

export function useTeacherPhotoUpload({ teacherId, teacherName, initialUrl = '', onUploaded }) {
  const [photoUrl, setPhotoUrl] = useState(initialUrl)
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const hasLocalPhotoUpdate = useRef(false)

  useEffect(() => {
    hasLocalPhotoUpdate.current = false
  }, [teacherId])

  useEffect(() => {
    if (hasLocalPhotoUpdate.current) return
    setPhotoUrl(initialUrl || '')
  }, [initialUrl])

  const uploadPhoto = async (id, file) => {
    const fd = new FormData()
    fd.append('file', file)
    const response = await teacherService.uploadPhoto(id, fd)
    const payload = unwrapData(response) || {}
    return payload.photo_url || payload.url || payload.teacher?.photo_url || ''
  }

  const applyUploadedUrl = (url) => {
    const nextUrl = withCacheBust(url)
    if (!nextUrl) return ''
    hasLocalPhotoUpdate.current = true
    setPhotoUrl(nextUrl)
    onUploaded?.(nextUrl)
    return nextUrl
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

    if (teacherId) {
      const localPreview = URL.createObjectURL(uploadFile)
      hasLocalPhotoUpdate.current = true
      setPhotoUrl(localPreview)
      setPhotoUploading(true)
      try {
        const url = await uploadPhoto(teacherId, uploadFile)
        applyUploadedUrl(url)
        setPendingPhotoFile(null)
        toast.success('Photo uploaded')
      } catch (err) {
        hasLocalPhotoUpdate.current = false
        setPhotoUrl(initialUrl || '')
        toast.error(getErrorMessage(err))
      } finally {
        URL.revokeObjectURL(localPreview)
        setPhotoUploading(false)
      }
      return
    }

    setPendingPhotoFile(uploadFile)
  }

  return {
    photoUrl,
    pendingPhotoFile,
    photoUploading,
    setPhotoUrl,
    setPendingPhotoFile,
    uploadPendingPhoto: async (id) => {
      if (!pendingPhotoFile || !id) return photoUrl
      const localPreview = URL.createObjectURL(pendingPhotoFile)
      hasLocalPhotoUpdate.current = true
      setPhotoUrl(localPreview)
      setPhotoUploading(true)
      try {
        const url = await uploadPhoto(id, pendingPhotoFile)
        const nextUrl = applyUploadedUrl(url)
        setPendingPhotoFile(null)
        return nextUrl
      } catch (err) {
        hasLocalPhotoUpdate.current = false
        setPhotoUrl(initialUrl || '')
        toast.error(getErrorMessage(err))
        return photoUrl
      } finally {
        URL.revokeObjectURL(localPreview)
        setPhotoUploading(false)
      }
    },
    photoFieldProps: {
      name: teacherName || 'Teacher',
      currentUrl: photoUrl,
      pendingFile: pendingPhotoFile,
      uploading: photoUploading,
      onFileChange: handlePhotoSelected,
      onClearPending: () => setPendingPhotoFile(null),
    },
  }
}
