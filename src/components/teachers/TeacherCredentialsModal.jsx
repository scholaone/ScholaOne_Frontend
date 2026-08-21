import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/Feedback'
import { getUserPassword } from '@/utils/userPasswordStorage'

export default function TeacherCredentialsModal({ teacher, open, onClose, loading = false }) {
  const password =
    teacher?.viewable_password ||
    getUserPassword(teacher?.user_id, teacher?.email) ||
    ''

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Login Credentials"
      size="md"
      footer={(
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      )}
    >
      {loading ? (
        <div className="flex min-h-[120px] items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">{teacher?.full_name || 'Teacher'}</p>
            {teacher?.teacher_code || teacher?.employee_id ? (
              <p className="mt-0.5 text-xs text-slate-500">
                {[teacher.teacher_code, teacher.employee_id].filter(Boolean).join(' · ')}
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Email</p>
              <p className="rounded-lg border border-sky-100 bg-white px-3 py-2 font-mono text-sm text-slate-800">
                {teacher?.email || '—'}
              </p>
            </div>

            <PasswordInput
              label="Password"
              value={password}
              readOnly
              placeholder={password ? '' : 'No password on record'}
              hint="Shown to admins only. Password is stored when the teacher account is created or reset."
            />
          </div>
        </div>
      )}
    </Modal>
  )
}
