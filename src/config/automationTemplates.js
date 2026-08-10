export const AUTOMATION_TRIGGERS = [
  { id: 'manual', label: 'Manual run', description: 'Run only when you click Run now' },
  { id: 'app_load', label: 'On app open', description: 'Once each browser session' },
  { id: 'interval', label: 'Scheduled interval', description: 'Repeats while app is open' },
]

export const AUTOMATION_ACTIONS = [
  { id: 'toast', label: 'Show notification' },
  { id: 'navigate', label: 'Open page' },
  { id: 'ai_tip', label: 'Generate AI tip' },
  { id: 'compose_mail', label: 'Open ScholaOne Post compose' },
]

export const AUTOMATION_TEMPLATES = [
  {
    id: 'welcome_mail',
    name: 'Welcome email draft',
    description: 'Opens ScholaOne Post with a welcome message template for new school admins.',
    trigger: { type: 'manual' },
    actions: [
      {
        type: 'compose_mail',
        payload: {
          subject: 'Welcome to ScholaOne',
          body: 'Dear Admin,\n\nWelcome to ScholaOne LMS! Your organization is now set up.\n\nBest regards,\nScholaOne Team',
        },
      },
    ],
  },
  {
    id: 'org_onboarding',
    name: 'Organization onboarding checklist',
    description: 'Reminds you to create an organization when the app loads.',
    trigger: { type: 'app_load' },
    actions: [
      {
        type: 'toast',
        payload: { message: 'Tip: Start by adding an organization under Management → Organizations' },
      },
      { type: 'navigate', payload: { path: '/organizations/new' } },
    ],
  },
  {
    id: 'weekly_audit',
    name: 'Weekly audit review',
    description: 'Every 60 minutes (while app is open), nudge to review audit logs.',
    trigger: { type: 'interval', minutes: 60 },
    actions: [
      {
        type: 'toast',
        payload: { message: 'Automation: Review recent audit logs for security changes' },
      },
      { type: 'navigate', payload: { path: '/audit-logs' } },
    ],
  },
  {
    id: 'ai_dashboard_tip',
    name: 'AI dashboard insight',
    description: 'Generates an AI tip when you open the dashboard.',
    trigger: { type: 'app_load' },
    actions: [{ type: 'ai_tip', payload: { context: 'dashboard' } }],
  },
  {
    id: 'masters_setup',
    name: 'Master data setup reminder',
    description: 'Navigate to Masters Hub to configure countries, boards, and classes.',
    trigger: { type: 'manual' },
    actions: [
      {
        type: 'toast',
        payload: { message: 'Configure master data before adding schools and users' },
      },
      { type: 'navigate', payload: { path: '/masters' } },
    ],
  },
]
