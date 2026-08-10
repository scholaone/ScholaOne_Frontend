/** ScholaOne AI — frontend configuration (optional OpenAI-compatible API). */

export const AI_API_KEY = import.meta.env.VITE_AI_API_KEY?.trim() || ''
export const AI_API_BASE = (import.meta.env.VITE_AI_API_BASE?.trim() || 'https://api.openai.com/v1').replace(/\/+$/, '')
export const AI_MODEL = import.meta.env.VITE_AI_MODEL?.trim() || 'gpt-4o-mini'

export const AI_IS_LIVE = Boolean(AI_API_KEY)

export const LMS_AI_SYSTEM_PROMPT = `You are ScholaOne AI, the intelligent assistant for ScholaOne LMS — a school ERP platform.
Help admins with organizations, schools, users, roles, permissions, masters, audit logs, and ScholaOne Post mail.
Be concise, practical, and step-by-step. If unsure, suggest which menu path to use in the app.
Never invent API endpoints. Current modules: Dashboard, Organizations, Schools, Users, Roles, Permissions, Masters, Audit Logs, ScholaOne Post, Settings.`

export const AI_QUICK_PROMPTS = [
  'How do I onboard a new organization and school?',
  'Explain roles vs permissions in ScholaOne',
  'Write a welcome email for a new school admin',
  'What should I check in audit logs weekly?',
  'Steps to add a user and assign a role',
]
