import emailjs from '@emailjs/browser'
import { nexusMailService } from '@/api/services'
import { unwrapData, getErrorMessage } from '@/api/client'
import {
  EMAILJS_PUBLIC_KEY,
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  NEXUS_MAIL_FROM_EMAIL,
  NEXUS_MAIL_FROM_NAME,
  NEXUS_MAIL_SEND_MODE,
  getFrontendDeliveryMethod,
  isEmailJsConfigured,
} from '@/config/mail'

function splitAddresses(value) {
  return String(value || '')
    .split(/[,;]/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function validateRecipients(payload) {
  const to = splitAddresses(payload.to)
  const cc = splitAddresses(payload.cc)
  const bcc = splitAddresses(payload.bcc)
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!to.length) {
    throw new Error('At least one recipient is required.')
  }

  for (const address of [...to, ...cc, ...bcc]) {
    if (!emailPattern.test(address)) {
      throw new Error(`Invalid email address: ${address}`)
    }
  }

  return { to, cc, bcc }
}

async function sendViaEmailJs(payload, recipients) {
  const templateParams = {
    to_email: recipients.to.join(', '),
    to_name: recipients.to[0]?.split('@')[0] || 'Recipient',
    from_email: NEXUS_MAIL_FROM_EMAIL,
    from_name: NEXUS_MAIL_FROM_NAME,
    reply_to: NEXUS_MAIL_FROM_EMAIL,
    subject: (payload.subject || '').trim() || '(No subject)',
    message: payload.body || '',
    cc: recipients.cc.join(', '),
    bcc: recipients.bcc.join(', '),
  }

  await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, {
    publicKey: EMAILJS_PUBLIC_KEY,
  })

  return {
    mode: 'emailjs',
    ...recipients,
    subject: templateParams.subject,
    body: payload.body || '',
    sentAt: new Date().toISOString(),
  }
}

function sendViaMailto(payload, recipients) {
  const params = new URLSearchParams()
  if (payload.subject) params.set('subject', payload.subject)
  if (payload.body) params.set('body', payload.body)
  if (recipients.cc.length) params.set('cc', recipients.cc.join(','))
  if (recipients.bcc.length) params.set('bcc', recipients.bcc.join(','))

  const query = params.toString()
  const mailto = `mailto:${recipients.to.join(',')}${query ? `?${query}` : ''}`
  window.location.href = mailto

  return {
    mode: 'mailto',
    ...recipients,
    subject: (payload.subject || '').trim() || '(No subject)',
    body: payload.body || '',
    sentAt: new Date().toISOString(),
  }
}

async function sendViaLocalQueue(payload, recipients) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return {
    mode: 'local',
    ...recipients,
    subject: (payload.subject || '').trim() || '(No subject)',
    body: payload.body || '',
    sentAt: new Date().toISOString(),
  }
}

async function sendViaFrontend(payload) {
  const recipients = validateRecipients(payload)
  const method = getFrontendDeliveryMethod()

  if (method === 'emailjs') {
    return sendViaEmailJs(payload, recipients)
  }
  if (method === 'mailto') {
    return sendViaMailto(payload, recipients)
  }
  return sendViaLocalQueue(payload, recipients)
}

async function sendViaBackend(payload) {
  validateRecipients(payload)

  const response = await nexusMailService.send({
    to: payload.to,
    cc: payload.cc || '',
    bcc: payload.bcc || '',
    subject: payload.subject || '',
    body: payload.body || '',
    html_body: payload.html_body || '',
  })

  return {
    mode: 'backend',
    ...(unwrapData(response) || {}),
    sentAt: new Date().toISOString(),
  }
}

export function getSendFailureMessage(error) {
  const message = getErrorMessage(error, 'Failed to send message')
  if (error?.response?.status === 404) {
    return 'Mail API not found. Use frontend mode or deploy the backend mail endpoint.'
  }
  if (/smtp|email is not configured|app password/i.test(message)) {
    return `${message} Or switch to frontend EmailJS delivery in .env.`
  }
  return message
}

export function getSendSuccessMessage(mode) {
  switch (mode) {
    case 'emailjs':
      return 'Message delivered via ScholaOne Post'
    case 'mailto':
      return 'Opening your mail app — complete send there to deliver'
    case 'backend':
      return 'Message delivered via ScholaOne Post'
    default:
      return 'Message saved to Sent (configure EmailJS for real delivery)'
  }
}

export async function sendNexusMail(payload) {
  if (NEXUS_MAIL_SEND_MODE === 'backend') {
    return sendViaBackend(payload)
  }
  return sendViaFrontend(payload)
}

export { NEXUS_MAIL_SEND_MODE, isEmailJsConfigured, getFrontendDeliveryMethod }
