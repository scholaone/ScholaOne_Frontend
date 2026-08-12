import { focusFormField } from '@/utils/validation'

function normalizeErrors(errors) {
  if (!errors || typeof errors !== 'object') return []
  return Object.entries(errors)
    .filter(([, message]) => Boolean(message))
    .map(([name, message]) => ({
      name,
      message: typeof message === 'string' ? message : String(message),
    }))
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
  const items = []
  const walk = (node, prefix = '') => {
    if (!node || typeof node !== 'object') return
    Object.entries(node).forEach(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key
      if (value?.message) {
        items.push({ name: path, message: String(value.message) })
        return
      }
      walk(value, path)
    })
  }
  walk(errors)

  const map = Object.fromEntries(items.map((item) => [item.name, item.message]))
  return <FormValidationSummary errors={map} title={title} className={className} />
}

export default FormValidationSummary
