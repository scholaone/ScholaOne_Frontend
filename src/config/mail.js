/**
 * ScholaOne Post — frontend-only mail configuration.
 *
 * Real delivery uses EmailJS (no backend required).
 * Optional later: VITE_NEXUS_MAIL_MODE=backend for Django SMTP API.
 */
export const NEXUS_MAIL_SEND_MODE =
  import.meta.env.VITE_NEXUS_MAIL_MODE === 'backend' ? 'backend' : 'frontend'

export const NEXUS_MAIL_IS_FRONTEND = NEXUS_MAIL_SEND_MODE === 'frontend'

export const NEXUS_MAIL_FROM_EMAIL =
  import.meta.env.VITE_NEXUS_MAIL_FROM?.trim() || 'info@scholaone.in@gmail.com'

export const NEXUS_MAIL_FROM_NAME =
  import.meta.env.VITE_NEXUS_MAIL_FROM_NAME?.trim() || 'ScholaOne Post'

export const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim() || ''
export const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim() || ''
export const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim() || ''

export const NEXUS_MAIL_USE_MAILTO_FALLBACK =
  import.meta.env.VITE_NEXUS_MAIL_USE_MAILTO !== 'false'

export function isEmailJsConfigured() {
  return Boolean(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY)
}

export function getNexusMailFromLabel() {
  return `${NEXUS_MAIL_FROM_NAME} <${NEXUS_MAIL_FROM_EMAIL}>`
}

export function getFrontendDeliveryMethod() {
  if (isEmailJsConfigured()) return 'emailjs'
  if (NEXUS_MAIL_USE_MAILTO_FALLBACK) return 'mailto'
  return 'local'
}
