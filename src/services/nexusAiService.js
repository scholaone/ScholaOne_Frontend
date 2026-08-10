import { AI_API_BASE, AI_API_KEY, AI_IS_LIVE, AI_MODEL, LMS_AI_SYSTEM_PROMPT } from '@/config/ai'

function lastUserMessage(messages) {
  return [...messages].reverse().find((m) => m.role === 'user')?.content || ''
}

function mockAssistantReply(messages) {
  const q = lastUserMessage(messages).toLowerCase()

  if (/organization|org|tenant/.test(q)) {
    return `To manage organizations in ScholaOne:
1. Go to **Management → Organizations**
2. Click **Add New** for the guided wizard (Identity → Contact → Location → Review)
3. Enable **Organization details are same for school** to create a matching school in one step
4. Use **Edit** later to sync school details if you forgot during create

Need help with a specific field? Ask me about organization codes or logos.`
  }

  if (/school/.test(q)) {
    return `Schools belong to an organization. Path: **Management → Schools → Add New**.
Pick the organization from the dropdown, then fill school name, code, and contact details.
School code is locked after creation. Use the eye icon on the list to preview details in a popup.`
  }

  if (/role|permission/.test(q)) {
    return `**Roles** define job functions; **Permissions** define what actions are allowed.
Flow: create permissions → assign to roles under **Access Control → Roles → Permissions** → assign roles to users via **User Roles**.
Use the permission matrix for a bird's-eye view.`
  }

  if (/mail|email|post/.test(q)) {
    return `Use **ScholaOne Post** (mail icon in the top bar or System → ScholaOne Post).
Compose sends from sharanreddy26372@gmail.com. With EmailJS configured in \`.env\`, delivery is one-click; otherwise your mail app opens pre-filled.`
  }

  if (/automation|automate/.test(q)) {
    return `Open **AI Hub → Automations** to enable workflow templates:
- Welcome email drafts
- Onboarding reminders
- Audit log review nudges
- AI dashboard tips

Automations run in the browser — no backend required. Toggle templates on/off and click **Run now** anytime.`
  }

  if (/audit/.test(q)) {
    return `Audit logs track who changed what. Find them under **System → Audit Logs**.
Click the eye icon to see old/new JSON data. Filter and export from the list page.`
  }

  if (/welcome|email template/.test(q)) {
    return `Subject: Welcome to ScholaOne LMS

Dear {{name}},

Your organization has been onboarded to ScholaOne. You can now add schools, users, and roles.

Login: use the credentials provided by your administrator.

Best regards,
ScholaOne Team`
  }

  return 'Ask about organizations, schools, roles, permissions, masters, audit logs, or automations.'
}

function mockAiTip(context) {
  const tips = {
    dashboard: 'Review recent organizations and audit logs from the sidebar to stay on top of platform changes.',
    audit: 'Check audit logs weekly for permission and role changes across your schools.',
    onboarding: 'Use Management → Organizations → Add New to onboard a tenant and optional school in one flow.',
  }
  return tips[context] || tips.dashboard
}

export async function chatWithNexusAi(messages) {
  if (!AI_IS_LIVE) {
    await new Promise((r) => setTimeout(r, 600))
    return {
      role: 'assistant',
      content: mockAssistantReply(messages),
      mode: 'local',
    }
  }

  const response = await fetch(`${AI_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [{ role: 'system', content: LMS_AI_SYSTEM_PROMPT }, ...messages],
      temperature: 0.6,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(err || 'AI request failed')
  }

  const data = await response.json()
  return {
    role: 'assistant',
    content: data.choices?.[0]?.message?.content || 'No response from AI.',
    mode: 'live',
  }
}

export async function generateAiTip(context = 'dashboard') {
  if (!AI_IS_LIVE) {
    await new Promise((r) => setTimeout(r, 400))
    return { role: 'assistant', content: mockAiTip(context), mode: 'local' }
  }

  const prompts = {
    dashboard: 'Give one short actionable tip for an ScholaOne LMS super admin reviewing their dashboard today.',
    audit: 'Give one sentence about why reviewing audit logs matters in a school ERP.',
    onboarding: 'Give one tip for onboarding a new organization in ScholaOne.',
  }
  return chatWithNexusAi([{ role: 'user', content: prompts[context] || prompts.dashboard }])
}
