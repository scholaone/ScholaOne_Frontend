import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { FiSend, FiTrash2, FiUser } from 'react-icons/fi'
import AiHubLayout from '@/layouts/AiHubLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { AI_QUICK_PROMPTS } from '@/config/ai'
import { BRAND_AI_NAME } from '@/config/brand'
import { chatWithNexusAi } from '@/services/nexusAiService'
import { cn } from '@/utils/format'

const STORAGE_KEY = 'scholaone-ai-chat'

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(messages) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)))
}

export default function AiAssistantPage() {
  const location = useLocation()
  const [messages, setMessages] = useState(loadHistory)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (location.state?.initialPrompt) {
      setInput(location.state.initialPrompt)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  useEffect(() => {
    saveHistory(messages)
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const chatMutation = useMutation({
    mutationFn: (history) => chatWithNexusAi(history),
    onSuccess: (reply) => {
      setMessages((prev) => [...prev, reply])
    },
  })

  const sendMessage = (text) => {
    const content = (text || input).trim()
    if (!content || chatMutation.isPending) return

    const userMsg = { role: 'user', content }
    const nextHistory = [...messages, userMsg]
    setMessages(nextHistory)
    setInput('')
    chatMutation.mutate(nextHistory)
  }

  return (
    <AiHubLayout
      title="ScholaOne AI Assistant"
      subtitle="Your intelligent assistant for ScholaOne LMS."
      actions={
        <Button variant="secondary" size="sm" onClick={() => { setMessages([]); localStorage.removeItem(STORAGE_KEY) }}>
          <FiTrash2 className="h-4 w-4" /> Clear chat
        </Button>
      }
    >
      <Card padding={false} className="flex h-[calc(100vh-18rem)] min-h-[480px] flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="mx-auto max-w-lg text-center py-12">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-white text-xl font-bold">
                AI
              </div>
              <h3 className="text-lg font-semibold">How can {BRAND_AI_NAME} help?</h3>
              <p className="mt-2 text-sm text-muted">Ask about onboarding, roles, mail, or automations.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {AI_QUICK_PROMPTS.slice(0, 3).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => sendMessage(p)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-slate-50"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  AI
                </div>
              )}
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-primary text-white'
                    : 'border border-border bg-slate-50 text-text',
                )}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-muted">
                  <FiUser className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">AI</div>
              <div className="rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm text-muted animate-pulse">
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${BRAND_AI_NAME} anything about ScholaOne...`}
              className="flex-1 rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
            <Button type="submit" loading={chatMutation.isPending} disabled={!input.trim()}>
              <FiSend className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </AiHubLayout>
  )
}
