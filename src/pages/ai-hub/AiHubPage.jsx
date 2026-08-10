import { Link } from 'react-router-dom'
import { FiCpu, FiMail, FiMessageSquare, FiZap } from 'react-icons/fi'
import AiHubLayout from '@/layouts/AiHubLayout'
import HubFeatureCard from '@/components/ai/HubFeatureCard'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { AI_QUICK_PROMPTS } from '@/config/ai'
import { listAutomations } from '@/utils/automationStorage'
import { formatDateTime } from '@/utils/format'

export default function AiHubPage() {
  const automations = listAutomations()
  const enabledCount = automations.filter((a) => a.enabled).length

  return (
    <AiHubLayout
      title="AI & Automation Center"
      subtitle="Intelligent assistant, workflow automations, and smart tools — all running from the frontend."
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-8">
        <HubFeatureCard
          to="/ai-hub/assistant"
          icon={FiMessageSquare}
          title="ScholaOne AI Assistant"
          description="Ask questions about organizations, schools, roles, and get LMS guidance instantly."
          accent="sage"
        />
        <HubFeatureCard
          to="/ai-hub/automations"
          icon={FiZap}
          title="Automations"
          description={`${enabledCount} active workflow${enabledCount === 1 ? '' : 's'} — onboarding, reminders, and AI tips.`}
          accent="forest"
        />
        <HubFeatureCard
          to="/scholaone-post"
          icon={FiMail}
          title="ScholaOne Post"
          description="Send mail from the browser with Gmail-style compose and sent history."
          accent="mint"
        />
        <HubFeatureCard
          to="/ai-hub/assistant"
          icon={FiCpu}
          title="AI Studio"
          description="Get LMS guidance, tips, and workflow help."
          accent="primary"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Quick AI prompts</h3>
          <div className="flex flex-wrap gap-2">
            {AI_QUICK_PROMPTS.map((prompt) => (
              <Link
                key={prompt}
                to="/ai-hub/assistant"
                state={{ initialPrompt: prompt }}
                className="rounded-full border border-[var(--clay-glass-edge)] bg-white/90 px-3 py-1.5 text-xs font-semibold text-[var(--clay-text-sharp)] backdrop-blur-md hover:border-[var(--clay-accent)] hover:bg-white"
              >
                {prompt}
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent automations</h3>
            <Link to="/ai-hub/automations">
              <Button variant="secondary" size="sm">Manage</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {automations.slice(0, 4).map((auto) => (
              <div key={auto.id} className="clay-list-item clay-list-item-3d flex items-start justify-between gap-3 p-3">
                <div>
                  <p className="text-sm font-medium">{auto.name}</p>
                  <p className="text-xs text-muted mt-0.5">{auto.description}</p>
                </div>
                <span className={`shrink-0 text-xs font-semibold ${auto.enabled ? 'text-success' : 'text-muted'}`}>
                  {auto.enabled ? 'On' : 'Off'}
                </span>
              </div>
            ))}
          </div>
          {automations.some((a) => a.lastRun) && (
            <p className="mt-3 text-xs text-muted">
              Last run: {formatDateTime(automations.find((a) => a.lastRun)?.lastRun)}
            </p>
          )}
        </Card>
      </div>
    </AiHubLayout>
  )
}
