import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { cn } from '@/utils/format'
import { formFieldId } from '@/utils/validation'

const fieldWrap = 'lms-field space-y-1.5'
const inputClass =
  'lms-input disabled:cursor-not-allowed disabled:bg-[var(--clay-mint-light,#f4f8f6)] disabled:text-muted'
const errorClass = 'lms-input--error'

export function RequiredMark({ className = '' }) {
  return (
    <span className={cn('ml-1 text-danger', className)} aria-hidden="true">
      *
    </span>
  )
}

function resolveFieldId(id, name) {
  return id || (name ? formFieldId(name) : undefined)
}

export function PasswordInput({
  label,
  error,
  hint,
  className,
  containerClassName,
  required,
  id,
  name,
  value,
  onChange,
  ...props
}) {
  const [visible, setVisible] = useState(false)
  const inputId = resolveFieldId(id, name)
  const errorId = inputId ? `${inputId}-error` : undefined

  return (
    <div className={cn(fieldWrap, containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-black">
          {label}
          {required ? <RequiredMark /> : null}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-required={required ? 'true' : undefined}
          className={cn(inputClass, 'pr-11', error && errorClass, className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-black transition hover:bg-[var(--clay-mint-light,#f4f8f6)]"
          title={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
        </button>
      </div>
      {error && (
        <p id={errorId} className="text-xs font-normal text-danger" role="alert">
          {error}
        </p>
      )}
      {hint && !error && <p className="text-xs font-normal text-black">{hint}</p>}
    </div>
  )
}

export default function Input({
  label,
  error,
  hint,
  className,
  containerClassName,
  required,
  id,
  name,
  ...props
}) {
  const inputId = resolveFieldId(id, name)
  const errorId = inputId ? `${inputId}-error` : undefined

  return (
    <div className={cn(fieldWrap, containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-black">
          {label}
          {required ? <RequiredMark /> : null}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-required={required ? 'true' : undefined}
        className={cn(inputClass, error && errorClass, className)}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-xs font-normal text-danger" role="alert">
          {error}
        </p>
      )}
      {hint && !error && <p className="text-xs font-normal text-black">{hint}</p>}
    </div>
  )
}

export function Textarea({ label, error, className, required, id, name, ...props }) {
  const inputId = resolveFieldId(id, name)
  const errorId = inputId ? `${inputId}-error` : undefined

  return (
    <div className={fieldWrap}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-black">
          {label}
          {required ? <RequiredMark /> : null}
        </label>
      )}
      <textarea
        id={inputId}
        name={name}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-required={required ? 'true' : undefined}
        className={cn('lms-textarea', error && errorClass, className)}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-xs font-normal text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function SelectField({ label, error, options = [], required, className, id, name, placeholder = 'Select...', ...props }) {
  const inputId = resolveFieldId(id, name)
  const errorId = inputId ? `${inputId}-error` : undefined

  return (
    <div className={fieldWrap}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-black">
          {label}
          {required ? <RequiredMark /> : null}
        </label>
      )}
      <select
        id={inputId}
        name={name}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-required={required ? 'true' : undefined}
        className={cn('lms-select', error && errorClass, className)}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="text-xs font-normal text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function CheckboxField({ label, error, required, id, name, ...props }) {
  const inputId = resolveFieldId(id, name)
  const errorId = inputId ? `${inputId}-error` : undefined

  return (
    <div className={fieldWrap}>
      <label htmlFor={inputId} className="flex cursor-pointer items-start gap-2">
        <input
          id={inputId}
          name={name}
          type="checkbox"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-required={required ? 'true' : undefined}
          className="mt-0.5 h-4 w-4 rounded border-[var(--clay-border,#e2ebe6)] text-[var(--clay-sidebar,#8fb5a0)] focus:ring-[var(--clay-sidebar,#8fb5a0)]/20"
          {...props}
        />
        <span className="text-sm font-normal text-black">
          {label}
          {required ? <RequiredMark /> : null}
        </span>
      </label>
      {error && (
        <p id={errorId} className="text-xs font-normal text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
