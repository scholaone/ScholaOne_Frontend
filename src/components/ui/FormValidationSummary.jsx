import { collectRhfErrors, focusFormField, formatErrorMessage } from '@/utils/validation'

function normalizeErrors(errors) {
  if (!errors || typeof errors !== 'object') return []
  const flat = collectRhfErrors(errors)
  if (flat.length) return flat
  return Object.entries(errors)
    .map(([name, message]) => ({
      name,
      message: formatErrorMessage(message),
    }))
    .filter((item) => item.message)
}

export function FormValidationSummary({
  errors,
  title = 'Please fix the following required or invalid fields:',
  className = '',
}) {
  const items = normalizeErrors(errors)
  if (!items.length) return null

  return (
    <div
      className={`rounded-xl border border-danger/30 bg-red-50/90 px-4 py-3 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <p className="text-sm font-semibold text-danger">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item.name || item.message}>
            <button
              type="button"
              onClick={() => focusFormField(item.name)}
              className="text-left text-sm text-danger hover:underline"
            >
              {item.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function FormValidationSummaryRhf({ errors, title, className }) {
  const items = collectRhfErrors(errors)
  const map = Object.fromEntries(items.map((item) => [item.name, item.message]))
  return <FormValidationSummary errors={map} title={title} className={className} />
}

export default FormValidationSummary
