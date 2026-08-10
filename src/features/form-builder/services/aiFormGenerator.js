import { FIELD_PALETTE } from '../constants/fieldPalette'
import { createId } from '../utils/createId'

function field(type, overrides = {}) {
  const palette = FIELD_PALETTE.find((p) => p.type === type)
  return {
    id: createId('fld'),
    type,
    ...(palette?.defaults || {}),
    ...overrides,
  }
}

const TEMPLATES = [
  {
    keywords: ['admission', 'enquiry', 'enroll', 'student application', 'apply'],
    build: (prompt, schoolName) => [
      field('logo', { imageUrl: '' }),
      field('school-name', { content: schoolName }),
      field('heading', { content: prompt.toLowerCase().includes('enquiry') ? 'Admission Enquiry' : 'Admission Application Form' }),
      field('paragraph', { content: 'Please fill in accurate details. Fields marked * are required.' }),
      field('divider'),
      field('text', { label: 'Student Full Name', required: true }),
      field('date', { label: 'Date of Birth', required: true }),
      field('select', { label: 'Gender', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }, { label: 'Other', value: 'other' }], required: true }),
      field('select', { label: 'Class Applying For', options: ['Nursery', 'LKG', 'UKG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'].map((g) => ({ label: g, value: g })), required: true }),
      field('text', { label: 'Parent / Guardian Name', required: true }),
      field('tel', { label: 'Mobile Number', required: true }),
      field('email', { label: 'Email Address', required: true }),
      field('text', { label: 'City' }),
      field('textarea', { label: 'Additional Notes' }),
      field('checkbox', { label: 'I confirm the information provided is correct', required: true }),
      field('submit', { label: 'Submit Application' }),
    ],
  },
  {
    keywords: ['contact', 'feedback', 'support', 'message us'],
    build: () => [
      field('heading', { content: 'Contact Us' }),
      field('paragraph', { content: 'We would love to hear from you.' }),
      field('text', { label: 'Your Name', required: true }),
      field('email', { label: 'Email', required: true }),
      field('tel', { label: 'Phone' }),
      field('select', { label: 'Subject', options: [{ label: 'General', value: 'general' }, { label: 'Admissions', value: 'admissions' }, { label: 'Fees', value: 'fees' }] }),
      field('textarea', { label: 'Message', required: true }),
      field('submit', { label: 'Send Message' }),
    ],
  },
  {
    keywords: ['event', 'registration', 'workshop', 'seminar'],
    build: () => [
      field('heading', { content: 'Event Registration' }),
      field('text', { label: 'Participant Name', required: true }),
      field('email', { label: 'Email', required: true }),
      field('tel', { label: 'Phone', required: true }),
      field('select', { label: 'Session', options: [{ label: 'Morning', value: 'am' }, { label: 'Afternoon', value: 'pm' }] }),
      field('number', { label: 'Number of Attendees', defaultValue: '1' }),
      field('submit', { label: 'Register' }),
    ],
  },
  {
    keywords: ['survey', 'poll', 'feedback form'],
    build: () => [
      field('heading', { content: 'Survey' }),
      field('radio', { label: 'How satisfied are you?', options: [{ label: 'Very Satisfied', value: '5' }, { label: 'Satisfied', value: '4' }, { label: 'Neutral', value: '3' }, { label: 'Unsatisfied', value: '2' }] }),
      field('checkbox-group', { label: 'What did you like?', options: [{ label: 'Teaching', value: 'teaching' }, { label: 'Facilities', value: 'facilities' }, { label: 'Communication', value: 'communication' }] }),
      field('textarea', { label: 'Suggestions' }),
      field('submit', { label: 'Submit Survey' }),
    ],
  },
  {
    keywords: ['fee', 'payment', 'invoice'],
    build: () => [
      field('heading', { content: 'Fee Payment Form' }),
      field('text', { label: 'Student Name', required: true }),
      field('text', { label: 'Admission / Roll Number', required: true }),
      field('select', { label: 'Fee Type', options: [{ label: 'Tuition', value: 'tuition' }, { label: 'Transport', value: 'transport' }, { label: 'Other', value: 'other' }] }),
      field('number', { label: 'Amount (INR)', required: true }),
      field('file', { label: 'Payment Receipt', accept: '.pdf,.jpg,.png' }),
      field('submit', { label: 'Submit Payment Details' }),
    ],
  },
  {
    keywords: ['parent', 'pta', 'meeting'],
    build: () => [
      field('heading', { content: 'Parent Meeting RSVP' }),
      field('text', { label: 'Parent Name', required: true }),
      field('text', { label: 'Student Name & Class', required: true }),
      field('radio', { label: 'Will you attend?', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] }),
      field('textarea', { label: 'Questions for the school' }),
      field('submit', { label: 'RSVP' }),
    ],
  },
]

function extractTitle(prompt) {
  const cleaned = prompt.trim()
  if (cleaned.length <= 60) return cleaned.replace(/^(create|build|make|design)\s+(an?\s+)?/i, '').replace(/\s+form$/i, '') || 'Custom Form'
  return cleaned.slice(0, 57) + '...'
}

/**
 * Rule-based AI form generator (frontend only — swap with API later).
 */
export function generateFormFromPrompt(prompt, { schoolName = 'ScholaOne School' } = {}) {
  const lower = prompt.toLowerCase()
  let fields = null

  for (const template of TEMPLATES) {
    if (template.keywords.some((kw) => lower.includes(kw))) {
      fields = template.build(prompt, schoolName)
      break
    }
  }

  if (!fields) {
    fields = [
      field('logo'),
      field('school-name', { content: schoolName }),
      field('heading', { content: extractTitle(prompt) }),
      field('paragraph', { content: `Generated from: "${prompt.slice(0, 120)}${prompt.length > 120 ? '...' : ''}"` }),
      field('divider'),
      field('text', { label: 'Full Name', required: true }),
      field('email', { label: 'Email', required: true }),
      field('tel', { label: 'Phone' }),
      field('textarea', { label: 'Details', required: true }),
      field('submit', { label: 'Submit' }),
    ]
  }

  return {
    title: extractTitle(prompt) || 'AI Generated Form',
    description: `AI-generated form based on your prompt.`,
    schoolName,
    fields,
    settings: {
      thankYouMessage: 'Thank you for your submission!',
      submitLabel: 'Submit',
      showBranding: true,
      aiGenerated: true,
      aiPrompt: prompt,
    },
  }
}
