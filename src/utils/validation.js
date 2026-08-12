/** Shared client-side field validation for ScholaOne forms (India-focused). */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
const MOBILE_RE = /^[6-9]\d{9}$/
const AADHAAR_RE = /^\d{12}$/
const PINCODE_RE = /^\d{6}$/
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const GST_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/
const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i

export const FIELD_LIMITS = {
  mobile: 10,
  aadhaar: 12,
  pincode: 6,
  pan: 10,
  gst: 15,
  ifsc: 11,
}

/** Strip everything except digits. */
export function digitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '')
}

/** Uppercase alphanumeric only. */
export function alnumUpper(value) {
  return String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
}

/**
 * Infer validation kind from field name / input type.
 * @returns {'email'|'mobile'|'aadhaar'|'pincode'|'pan'|'gst'|'ifsc'|'website'|null}
 */
export function resolveFieldKind(fieldName = '', fieldType = '') {
  const name = String(fieldName).toLowerCase()
  const type = String(fieldType || '').toLowerCase()

  if (type === 'email' || name === 'email' || name.endsWith('_email') || name.includes('email')) {
    return 'email'
  }
  if (
    name.includes('aadhaar') ||
    name.includes('aadhar')
  ) {
    return 'aadhaar'
  }
  if (
    name === 'pincode' ||
    name === 'postal_code' ||
    name === 'zip_code' ||
    name.endsWith('_pincode') ||
    name.endsWith('_postal_code')
  ) {
    return 'pincode'
  }
  if (name.includes('pan_number') || name === 'pan') {
    return 'pan'
  }
  if (name.includes('gst_number') || name === 'gst') {
    return 'gst'
  }
  if (name.includes('ifsc')) {
    return 'ifsc'
  }
  if (
    name === 'website' ||
    name.endsWith('_url') ||
    name.includes('website')
  ) {
    return 'website'
  }
  if (
    name === 'phone' ||
    name === 'mobile' ||
    name.endsWith('_phone') ||
    name.endsWith('_mobile') ||
    name.includes('mobile_number') ||
    name.includes('whatsapp') ||
    (name.includes('phone') && !name.includes('microphone'))
  ) {
    return 'mobile'
  }
  return null
}

function labelOr(kind, label) {
  return label || {
    email: 'Email',
    mobile: 'Mobile number',
    aadhaar: 'Aadhaar number',
    pincode: 'PIN code',
    pan: 'PAN',
    gst: 'GST number',
    ifsc: 'IFSC',
    website: 'Website',
  }[kind] || 'Field'
}

/**
 * Validate a value for a known kind. Empty is OK unless required.
 * @returns {true|string} true if valid, else error message
 */
export function validateByKind(kind, value, { required = false, label } = {}) {
  const raw = value == null ? '' : String(value).trim()
  const fieldLabel = labelOr(kind, label)

  if (!raw) {
    return required ? `${fieldLabel} is required` : true
  }

  switch (kind) {
    case 'email':
      return EMAIL_RE.test(raw) ? true : 'Enter a valid email address'
    case 'mobile': {
      const digits = digitsOnly(raw)
      if (digits.length !== 10) return 'Enter a valid 10-digit mobile number'
      if (!MOBILE_RE.test(digits)) return 'Mobile number must start with 6, 7, 8, or 9'
      return true
    }
    case 'aadhaar': {
      const digits = digitsOnly(raw)
      return AADHAAR_RE.test(digits) ? true : 'Aadhaar must be exactly 12 digits'
    }
    case 'pincode': {
      const digits = digitsOnly(raw)
      return PINCODE_RE.test(digits) ? true : 'PIN code must be exactly 6 digits'
    }
    case 'pan': {
      const pan = alnumUpper(raw)
      return PAN_RE.test(pan) ? true : 'Enter a valid PAN (e.g. ABCDE1234F)'
    }
    case 'gst': {
      const gst = alnumUpper(raw)
      return GST_RE.test(gst) ? true : 'Enter a valid 15-character GSTIN'
    }
    case 'ifsc': {
      const ifsc = alnumUpper(raw)
      return IFSC_RE.test(ifsc) ? true : 'Enter a valid IFSC (e.g. SBIN0001234)'
    }
    case 'website':
      return URL_RE.test(raw) ? true : 'Enter a valid website URL'
    default:
      return true
  }
}

/**
 * Sanitize live input for a field kind (blocks alphabets on mobile, etc.).
 */
export function sanitizeByKind(kind, value) {
  switch (kind) {
    case 'mobile':
      return digitsOnly(value).slice(0, FIELD_LIMITS.mobile)
    case 'aadhaar':
      return digitsOnly(value).slice(0, FIELD_LIMITS.aadhaar)
    case 'pincode':
      return digitsOnly(value).slice(0, FIELD_LIMITS.pincode)
    case 'pan':
      return alnumUpper(value).slice(0, FIELD_LIMITS.pan)
    case 'gst':
      return alnumUpper(value).slice(0, FIELD_LIMITS.gst)
    case 'ifsc':
      return alnumUpper(value).slice(0, FIELD_LIMITS.ifsc)
    case 'email':
      return String(value ?? '').replace(/\s/g, '')
    default:
      return value
  }
}

/** Native input constraints for a field. */
export function getInputConstraints(fieldName, fieldType) {
  const kind = resolveFieldKind(fieldName, fieldType)
  if (!kind) return {}

  switch (kind) {
    case 'email':
      return { type: 'email', inputMode: 'email', autoComplete: 'email' }
    case 'mobile':
      return {
        type: 'tel',
        inputMode: 'numeric',
        maxLength: FIELD_LIMITS.mobile,
        autoComplete: 'tel',
        pattern: '[0-9]{10}',
        placeholder: '10-digit mobile',
      }
    case 'aadhaar':
      return {
        type: 'text',
        inputMode: 'numeric',
        maxLength: FIELD_LIMITS.aadhaar,
        pattern: '[0-9]{12}',
        placeholder: '12-digit Aadhaar',
      }
    case 'pincode':
      return {
        type: 'text',
        inputMode: 'numeric',
        maxLength: FIELD_LIMITS.pincode,
        pattern: '[0-9]{6}',
        placeholder: '6-digit PIN',
      }
    case 'pan':
      return {
        type: 'text',
        maxLength: FIELD_LIMITS.pan,
        placeholder: 'ABCDE1234F',
        style: { textTransform: 'uppercase' },
      }
    case 'gst':
      return {
        type: 'text',
        maxLength: FIELD_LIMITS.gst,
        placeholder: '29AAAAA0000A1Z5',
        style: { textTransform: 'uppercase' },
      }
    case 'ifsc':
      return {
        type: 'text',
        maxLength: FIELD_LIMITS.ifsc,
        placeholder: 'SBIN0001234',
        style: { textTransform: 'uppercase' },
      }
    case 'website':
      return { type: 'text', inputMode: 'url', placeholder: 'https://example.com' }
    default:
      return {}
  }
}

/**
 * Build react-hook-form register rules from field name/type.
 */
export function getRhfRules(fieldName, { required = false, label, type } = {}) {
  const kind = resolveFieldKind(fieldName, type)
  const rules = {}

  if (required) {
    rules.required = `${label || fieldName} is required`
  }

  if (!kind) return rules

  rules.validate = (value) => validateByKind(kind, value, { required, label })
  return rules
}

/**
 * Merge RHF register() with digit filtering + constraints.
 * Usage: <Input {...registerValidated(register, 'mobile_number', { required: true, label: 'Mobile' })} />
 */
export function registerValidated(register, fieldName, options = {}) {
  const { required = false, label, type } = options
  const kind = resolveFieldKind(fieldName, type)
  const rules = getRhfRules(fieldName, { required, label, type })
  const { onChange, onBlur, name, ref } = register(fieldName, rules)
  const constraints = getInputConstraints(fieldName, type)

  return {
    name,
    ref,
    onBlur,
    ...constraints,
    // Prefer text+inputMode over type=url/email when constraints conflict with RHF
    type: constraints.type || type || 'text',
    onChange: (e) => {
      if (kind) {
        const next = sanitizeByKind(kind, e.target.value)
        if (next !== e.target.value) {
          e.target.value = next
        }
      }
      return onChange(e)
    },
  }
}

/**
 * Validate a plain object of values against field kinds.
 * @param {Record<string, any>} values
 * @param {Array<{ name: string, label?: string, required?: boolean, type?: string }>} fields
 * @returns {Record<string, string>} map of fieldName → error message
 */
export function validateFields(values, fields) {
  const errors = {}
  for (const field of fields) {
    const kind = resolveFieldKind(field.name, field.type)
    if (!kind && !field.required) continue
    const result = kind
      ? validateByKind(kind, values[field.name], {
          required: field.required,
          label: field.label,
        })
      : values[field.name] || !field.required
        ? true
        : `${field.label || field.name} is required`
    if (result !== true) errors[field.name] = result
  }
  return errors
}

/** Convenience validators for non-RHF forms. */
export function isValidEmail(value, { required = false } = {}) {
  return validateByKind('email', value, { required }) === true
}

export function isValidMobile(value, { required = false } = {}) {
  return validateByKind('mobile', value, { required }) === true
}

export function isValidAadhaar(value, { required = false } = {}) {
  return validateByKind('aadhaar', value, { required }) === true
}

export function isValidPincode(value, { required = false } = {}) {
  return validateByKind('pincode', value, { required }) === true
}

/**
 * Single-field error for onBlur / live re-check in non-RHF forms.
 * @returns {string|null} error message or null when valid
 */
export function getFieldError(kindOrName, value, { required = false, label, type } = {}) {
  const known = ['email', 'mobile', 'aadhaar', 'pincode', 'pan', 'gst', 'ifsc', 'website']
  const kind = known.includes(kindOrName)
    ? kindOrName
    : resolveFieldKind(kindOrName, type)
  if (!kind && !required) return null
  if (!kind && required) {
    const raw = value == null ? '' : String(value).trim()
    return raw ? null : `${label || kindOrName || 'Field'} is required`
  }
  const result = validateByKind(kind, value, { required, label })
  return result === true ? null : result
}

/** Default react-hook-form options: validate on blur, then live-fix on change. */
export const RHF_VALIDATION_MODE = {
  mode: 'onBlur',
  reValidateMode: 'onChange',
  shouldFocusError: true,
}

/** Stable DOM id for scrolling/focusing invalid fields. */
export function formFieldId(name) {
  if (!name) return undefined
  return `field-${String(name).replace(/\./g, '-')}`
}

/** Focus and scroll to a form field by name or id. */
export function focusFormField(nameOrId) {
  if (!nameOrId) return false
  const id = String(nameOrId).startsWith('field-') ? nameOrId : formFieldId(nameOrId)
  const el =
    document.getElementById(id) ||
    document.querySelector(`[name="${nameOrId}"]`) ||
    document.querySelector(`[data-field-path="${nameOrId}"]`)
  if (!el) return false
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  if (typeof el.focus === 'function') el.focus({ preventScroll: true })
  return true
}

/** Flatten react-hook-form errors into { name, message }[]. */
export function collectRhfErrors(errors = {}) {
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
  return items
}

/** Extract serializer field errors from an API error response. */
export function extractApiFieldErrors(error) {
  const data = error?.response?.data
  if (!data || typeof data !== 'object') return {}

  const out = {}
  const absorb = (source) => {
    if (!source || typeof source !== 'object' || Array.isArray(source)) return
    Object.entries(source).forEach(([key, val]) => {
      if (['message', 'status', 'success', 'error', 'errors', 'detail'].includes(key)) return
      if (Array.isArray(val) && val[0]) out[key] = String(val[0])
      else if (typeof val === 'string' && val.trim()) out[key] = val
    })
  }

  absorb(data)
  absorb(data.data)
  if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
    absorb(data.errors)
  }

  return out
}

/** Apply API field errors to react-hook-form via setError. */
export function applyApiFieldErrors(setError, error) {
  const fieldErrors = extractApiFieldErrors(error)
  Object.entries(fieldErrors).forEach(([name, message]) => {
    setError(name, { type: 'server', message })
  })
  return fieldErrors
}

/**
 * RHF onInvalid handler — toast + scroll to first invalid field.
 * Works with plain error maps too: handleFormInvalid({ email: 'Email is required' })
 */
export function handleFormInvalid(errors, options = {}) {
  const {
    toastFn,
    toastPrefix = 'Please fix the highlighted fields below',
  } = options

  const items = Array.isArray(errors)
    ? errors
    : errors?.message
      ? [{ name: '', message: errors.message }]
      : typeof errors === 'object' && errors !== null && !errors.root
        ? Object.entries(errors).some(([, v]) => v?.message)
          ? collectRhfErrors(errors)
          : Object.entries(errors).map(([name, message]) => ({
              name,
              message: typeof message === 'string' ? message : String(message),
            }))
        : collectRhfErrors(errors)

  if (!items.length) {
    toastFn?.('Please check the form for errors')
    return
  }

  const preview = items
    .slice(0, 3)
    .map((item) => item.message)
    .join(' · ')
  const suffix = items.length > 3 ? ` (+${items.length - 3} more)` : ''
  toastFn?.(`${toastPrefix}: ${preview}${suffix}`)

  focusFormField(items[0].name)
}
