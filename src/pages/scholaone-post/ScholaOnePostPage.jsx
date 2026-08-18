import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiEdit3,
  FiInbox,
  FiMail,
  FiMoreVertical,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiStar,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import { sendNexusMail, getSendFailureMessage, getSendSuccessMessage, getFrontendDeliveryMethod } from '@/services/nexusMailSender'
import { NEXUS_MAIL_FROM_EMAIL, NEXUS_MAIL_IS_FRONTEND, isEmailJsConfigured } from '@/config/mail'
import { getErrorMessage } from '@/api/client'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/format'
import {
  createMailId,
  deleteMailMessage,
  formatMailListTime,
  getMailMessage,
  listMailMessages,
  saveMailMessage,
  toggleMailStar,
} from '@/utils/mailStorage'

const FOLDERS = [
  { id: 'inbox', label: 'Inbox', icon: FiInbox },
  { id: 'sent', label: 'Sent', icon: FiSend },
  { id: 'drafts', label: 'Drafts', icon: FiEdit3 },
  { id: 'starred', label: 'Starred', icon: FiStar },
]

const EMPTY_COMPOSE = {
  to: '',
  cc: '',
  bcc: '',
  subject: '',
  body: '',
}

function parseRecipients(value) {
  return value
    .split(/[,;]/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function getDeliveryHint() {
  if (!NEXUS_MAIL_IS_FRONTEND) {
    return 'Server mode: messages are sent through the ScholaOne backend SMTP.'
  }
  const method = getFrontendDeliveryMethod()
  if (method === 'emailjs') {
    return 'EmailJS mode: messages are delivered from the browser using your configured Gmail service.'
  }
  if (method === 'mailto') {
    return 'Mail app mode: Send opens your default email app (Outlook/Gmail) with the message pre-filled.'
  }
  return 'Add EmailJS keys in .env for automatic delivery, or use the mail app fallback.'
}

function MailSidebar({ folder, onFolderChange, onCompose, counts, deliveryHint, composeHint }) {
  return (
    <aside className="flex w-[220px] shrink-0 flex-col gap-2 px-3 py-4">
      <button
        type="button"
        onClick={onCompose}
        className="mb-3 inline-flex items-center gap-3 rounded-2xl bg-[#c2e7ff] px-5 py-3.5 text-sm font-medium text-[#001d35] shadow-sm transition hover:bg-[#a8daff] hover:shadow-md"
      >
        <FiEdit3 className="h-5 w-5" />
        Compose
      </button>

      <nav className="space-y-0.5">
        {FOLDERS.map((item) => {
          const Icon = item.icon
          const active = folder === item.id
          const count = counts[item.id] || 0
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onFolderChange(item.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-r-full px-4 py-2 text-sm font-medium transition',
                active ? 'bg-[#d3e3fd] text-[#001d35]' : 'text-[#444746] hover:bg-[#eceff1]',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {count > 0 && <span className="text-xs font-semibold">{count}</span>}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-[#dadce0] bg-white p-4 text-xs text-[#5f6368]">
        <p className="font-semibold text-[#1f1f1f]">ScholaOne Post</p>
        <p className="mt-1">{deliveryHint}</p>
        {!isEmailJsConfigured() && NEXUS_MAIL_IS_FRONTEND && (
          <p className="mt-2 rounded-lg bg-[#fef7e0] px-2 py-1.5 text-[11px] text-[#8a6d00]">
            Tip: Add VITE_EMAILJS_* keys in .env for one-click delivery from info@scholaone.in@gmail.com
          </p>
        )}
      </div>
    </aside>
  )
}

function ComposePanel({ open, draft, onChange, onClose, onSend, onSaveDraft, sending, showCcBcc, onToggleCcBcc, composeHint, fromEmail }) {
  if (!open) return null

  return (
    <div className="fixed bottom-10 right-8 z-50 flex max-h-[min(720px,calc(100vh-5rem))] w-[min(640px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-[#dadce0] bg-white shadow-[0_8px_28px_rgba(60,64,67,0.28)] sm:bottom-14 sm:right-10">
      <div className="flex items-center justify-between bg-[#f2f6fc] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-[#041e49]">New Message — ScholaOne Post</p>
          {composeHint && (
            <p className="text-[11px] text-[#5f6368]">{composeHint}</p>
          )}
        </div>
        <button type="button" onClick={onClose} className="rounded-full p-1.5 text-[#444746] hover:bg-[#e8eaed]">
          <FiX className="h-4 w-4" />
        </button>
      </div>

      <div className="border-b border-[#eceff1] px-4 py-2 text-sm">
        <div className="flex items-center gap-4 border-b border-[#eceff1] py-2.5">
          <span className="w-16 shrink-0 text-[#5f6368]">From</span>
          <span className="min-w-0 flex-1 truncate text-[#1f1f1f]">{fromEmail}</span>
        </div>
        <div className="flex items-center gap-4 border-b border-[#eceff1] py-2.5">
          <span className="w-16 shrink-0 text-[#5f6368]">To</span>
          <input
            value={draft.to}
            onChange={(e) => onChange({ ...draft, to: e.target.value })}
            placeholder="Recipients"
            className="min-w-0 flex-1 bg-transparent outline-none"
          />
          {!showCcBcc && (
            <button type="button" onClick={onToggleCcBcc} className="text-xs font-medium text-[#1a73e8]">
              Cc Bcc
            </button>
          )}
        </div>

        {showCcBcc && (
          <>
            <div className="flex items-center gap-4 border-b border-[#eceff1] py-2.5">
              <span className="w-16 shrink-0 text-[#5f6368]">Cc</span>
              <input
                value={draft.cc}
                onChange={(e) => onChange({ ...draft, cc: e.target.value })}
                className="min-w-0 flex-1 bg-transparent outline-none"
              />
            </div>
            <div className="flex items-center gap-4 border-b border-[#eceff1] py-2.5">
              <span className="w-16 shrink-0 text-[#5f6368]">Bcc</span>
              <input
                value={draft.bcc}
                onChange={(e) => onChange({ ...draft, bcc: e.target.value })}
                className="min-w-0 flex-1 bg-transparent outline-none"
              />
            </div>
          </>
        )}

        <div className="flex items-center gap-4 py-3">
          <span className="w-16 shrink-0 text-[#5f6368]">Subject</span>
          <input
            value={draft.subject}
            onChange={(e) => onChange({ ...draft, subject: e.target.value })}
            placeholder="Enter subject"
            className="min-w-0 flex-1 bg-transparent outline-none"
          />
        </div>
      </div>

      <textarea
        value={draft.body}
        onChange={(e) => onChange({ ...draft, body: e.target.value })}
        placeholder="Write your message..."
        className="min-h-[260px] flex-1 resize-none px-4 py-3 text-sm outline-none"
      />

      <div className="flex items-center justify-between border-t border-[#eceff1] px-4 py-3">
        <Button onClick={onSend} loading={sending} className="rounded-full px-6">
          <FiSend className="h-4 w-4" />
          Send
        </Button>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onSaveDraft} className="rounded-full p-2 text-[#444746] hover:bg-[#f1f3f4]" title="Save draft">
            <FiEdit3 className="h-4 w-4" />
          </button>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[#444746] hover:bg-[#f1f3f4]" title="Discard">
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ScholaOnePostPage() {
  const location = useLocation()
  const fromAddress = NEXUS_MAIL_FROM_EMAIL
  const deliveryHint = getDeliveryHint()
  const composeHint = NEXUS_MAIL_IS_FRONTEND
    ? getFrontendDeliveryMethod() === 'mailto'
      ? 'Opens your mail app to complete delivery'
      : getFrontendDeliveryMethod() === 'emailjs'
        ? 'Sends directly via EmailJS'
        : 'Saved locally until EmailJS is configured'
    : 'Delivered via server SMTP'
  const [folder, setFolder] = useState('sent')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeDraft, setComposeDraft] = useState(EMPTY_COMPOSE)
  const [composeDraftId, setComposeDraftId] = useState(null)
  const [showCcBcc, setShowCcBcc] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!location.state?.compose) return
    const draft = location.state.draft || {}
    setComposeDraft({
      to: draft.to || '',
      cc: draft.cc || '',
      bcc: draft.bcc || '',
      subject: draft.subject || '',
      body: draft.body || '',
    })
    setComposeOpen(true)
    setComposeDraftId(null)
    window.history.replaceState({}, document.title)
  }, [location.state])

  const allMessages = useMemo(() => {
    void refreshKey
    if (folder === 'starred') {
      return listMailMessages('sent')
        .concat(listMailMessages('drafts'))
        .concat(listMailMessages('inbox'))
        .filter((msg) => msg.starred)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
    return listMailMessages(folder)
  }, [folder, refreshKey])

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return allMessages
    return allMessages.filter((msg) =>
      [msg.to, msg.subject, msg.body, msg.fromEmail].some((field) =>
        String(field || '').toLowerCase().includes(query),
      ),
    )
  }, [allMessages, search])

  const activeMessage = activeId ? getMailMessage(activeId) : null

  const counts = useMemo(() => ({
    inbox: listMailMessages('inbox').length,
    sent: listMailMessages('sent').length,
    drafts: listMailMessages('drafts').length,
    starred: listMailMessages('sent').concat(listMailMessages('drafts')).filter((m) => m.starred).length,
  }), [refreshKey])

  const sendMutation = useMutation({
    mutationFn: sendNexusMail,
    onSuccess: (result, variables) => {
      saveMailMessage({
        id: variables.localId,
        folder: 'sent',
        to: variables.to,
        cc: variables.cc,
        bcc: variables.bcc,
        subject: variables.subject,
        body: variables.body,
        fromEmail: fromAddress,
        deliveryMode: result?.mode || (NEXUS_MAIL_IS_FRONTEND ? 'frontend' : 'backend'),
        starred: false,
        isRead: true,
        createdAt: result?.sentAt || new Date().toISOString(),
      })
      if (composeDraftId) {
        deleteMailMessage(composeDraftId)
      }
      setComposeOpen(false)
      setComposeDraft(EMPTY_COMPOSE)
      setComposeDraftId(null)
      setShowCcBcc(false)
      setFolder('sent')
      setRefreshKey((k) => k + 1)
      toast.success(getSendSuccessMessage(result?.mode))
    },
    onError: (err) => toast.error(getSendFailureMessage(err)),
  })

  const openCompose = (draftMessage = null) => {
    if (draftMessage) {
      setComposeDraft({
        to: draftMessage.to || '',
        cc: draftMessage.cc || '',
        bcc: draftMessage.bcc || '',
        subject: draftMessage.subject || '',
        body: draftMessage.body || '',
      })
      setComposeDraftId(draftMessage.id)
      setShowCcBcc(Boolean(draftMessage.cc || draftMessage.bcc))
    } else {
      setComposeDraft(EMPTY_COMPOSE)
      setComposeDraftId(null)
      setShowCcBcc(false)
    }
    setComposeOpen(true)
  }

  const handleSaveDraft = () => {
    const id = composeDraftId || createMailId()
    saveMailMessage({
      id,
      folder: 'drafts',
      ...composeDraft,
      fromEmail: fromAddress,
      starred: false,
      isRead: true,
      createdAt: new Date().toISOString(),
    })
    setComposeDraftId(id)
    setRefreshKey((k) => k + 1)
    toast.success('Draft saved')
  }

  const handleSend = () => {
    if (!parseRecipients(composeDraft.to).length) {
      toast.error('Add at least one recipient')
      return
    }
    sendMutation.mutate({
      localId: createMailId(),
      to: composeDraft.to,
      cc: composeDraft.cc,
      bcc: composeDraft.bcc,
      subject: composeDraft.subject,
      body: composeDraft.body,
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMessages.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredMessages.map((msg) => msg.id))
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleDeleteSelected = () => {
    selectedIds.forEach(deleteMailMessage)
    setSelectedIds([])
    if (activeId && selectedIds.includes(activeId)) setActiveId(null)
    setRefreshKey((k) => k + 1)
    toast.success('Deleted')
  }

  const folderLabel = FOLDERS.find((item) => item.id === folder)?.label || 'Mail'

  return (
    <div className="-mx-4 -my-6 flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-[#f6f8fc] lg:-mx-8 lg:-my-8">
      <header className="flex shrink-0 items-center gap-3 border-b border-[#dadce0] bg-white px-4 py-3">
        <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm text-[#444746] hover:bg-[#f1f3f4]">
          <FiArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white">
            <FiMail className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#1f1f1f]">ScholaOne Post</h1>
            <p className="text-xs text-[#5f6368]">Send mail from ScholaOne</p>
          </div>
        </div>
        <div className="ml-auto flex min-w-0 flex-1 max-w-2xl items-center gap-2 rounded-full bg-[#eaf1fb] px-4 py-2.5">
          <FiSearch className="h-4 w-4 shrink-0 text-[#5f6368]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search in ${folderLabel}`}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#5f6368]"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="text-[#5f6368]">
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <MailSidebar
          folder={folder}
          onFolderChange={(next) => {
            setFolder(next)
            setActiveId(null)
            setSelectedIds([])
          }}
          onCompose={() => openCompose()}
          counts={counts}
          deliveryHint={deliveryHint}
        />

        <section className="flex min-w-0 flex-1 flex-col pr-3 py-3">
          <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#dadce0] bg-white shadow-sm">
            <div className={cn('flex min-w-0 flex-col border-[#eceff1]', activeMessage ? 'w-[42%] border-r' : 'flex-1')}>
              <div className="flex items-center gap-2 border-b border-[#eceff1] px-3 py-2 text-[#444746]">
                <input
                  type="checkbox"
                  checked={filteredMessages.length > 0 && selectedIds.length === filteredMessages.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-[#dadce0]"
                />
                <button type="button" onClick={() => setRefreshKey((k) => k + 1)} className="rounded-full p-2 hover:bg-[#f1f3f4]">
                  <FiRefreshCw className="h-4 w-4" />
                </button>
                {selectedIds.length > 0 && (
                  <button type="button" onClick={handleDeleteSelected} className="rounded-full p-2 hover:bg-[#f1f3f4]">
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                )}
                <div className="ml-auto flex items-center gap-1 text-xs text-[#5f6368]">
                  <span>{filteredMessages.length ? `1-${filteredMessages.length} of ${filteredMessages.length}` : '0 messages'}</span>
                  <button type="button" className="rounded-full p-1 hover:bg-[#f1f3f4]"><FiChevronLeft className="h-4 w-4" /></button>
                  <button type="button" className="rounded-full p-1 hover:bg-[#f1f3f4]"><FiChevronRight className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center px-6 text-center text-sm text-[#5f6368]">
                    <FiMail className="mb-3 h-10 w-10 text-[#c4c7c5]" />
                    <p className="font-medium text-[#1f1f1f]">No messages in {folderLabel}</p>
                    <p className="mt-1">Use Compose to send your first message with ScholaOne Post.</p>
                    <Button className="mt-4 rounded-full" onClick={() => openCompose()}>
                      <FiEdit3 className="h-4 w-4" />
                      Compose
                    </Button>
                  </div>
                ) : (
                  filteredMessages.map((msg) => {
                    const selected = activeId === msg.id
                    return (
                      <button
                        key={msg.id}
                        type="button"
                        onClick={() => setActiveId(msg.id)}
                        className={cn(
                          'grid w-full grid-cols-[auto_auto_1fr_auto] items-center gap-3 border-b border-[#f1f3f4] px-3 py-3 text-left transition hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,.3),0_1px_3px_1px_rgba(60,64,67,.15)]',
                          selected && 'bg-[#d3e3fd]/40',
                          !msg.isRead && 'font-semibold',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(msg.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            toggleSelect(msg.id)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded border-[#dadce0]"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleMailStar(msg.id)
                            setRefreshKey((k) => k + 1)
                          }}
                          className={cn('rounded-full p-1', msg.starred ? 'text-[#f4b400]' : 'text-[#c4c7c5] hover:text-[#5f6368]')}
                        >
                          <FiStar className={cn('h-4 w-4', msg.starred && 'fill-current')} />
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm text-[#1f1f1f]">
                              {folder === 'sent' ? `To: ${msg.to}` : msg.fromEmail || msg.to}
                            </span>
                            {msg.folder === 'drafts' && (
                              <span className="rounded bg-[#fce8e6] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#d93025]">
                                Draft
                              </span>
                            )}
                          </div>
                          <p className="truncate text-sm text-[#3c4043]">
                            <span>{msg.subject || '(no subject)'}</span>
                            <span className="font-normal text-[#5f6368]"> — {msg.body?.slice(0, 80)}</span>
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-[#5f6368]">{formatMailListTime(msg.createdAt)}</span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {activeMessage && (
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between border-b border-[#eceff1] px-5 py-4">
                  <div className="min-w-0">
                    <h2 className="text-xl text-[#1f1f1f]">{activeMessage.subject || '(no subject)'}</h2>
                    <p className="mt-2 text-sm text-[#5f6368]">
                      <span className="font-medium text-[#1f1f1f]">From:</span> {activeMessage.fromEmail || fromAddress}
                    </p>
                    <p className="text-sm text-[#5f6368]">
                      <span className="font-medium text-[#1f1f1f]">To:</span> {activeMessage.to}
                    </p>
                    {activeMessage.cc && (
                      <p className="text-sm text-[#5f6368]"><span className="font-medium text-[#1f1f1f]">Cc:</span> {activeMessage.cc}</p>
                    )}
                    <p className="mt-1 text-xs text-[#5f6368]">{formatMailListTime(activeMessage.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {activeMessage.folder === 'drafts' && (
                      <Button size="sm" variant="secondary" onClick={() => openCompose(activeMessage)}>
                        Edit draft
                      </Button>
                    )}
                    <button type="button" className="rounded-full p-2 hover:bg-[#f1f3f4]">
                      <FiMoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto whitespace-pre-wrap px-5 py-4 text-sm leading-7 text-[#1f1f1f]">
                  {activeMessage.body || 'No message body.'}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <ComposePanel
        open={composeOpen}
        draft={composeDraft}
        onChange={setComposeDraft}
        onClose={() => {
          setComposeOpen(false)
          setComposeDraft(EMPTY_COMPOSE)
          setComposeDraftId(null)
        }}
        onSend={handleSend}
        onSaveDraft={handleSaveDraft}
        sending={sendMutation.isPending}
        showCcBcc={showCcBcc}
        onToggleCcBcc={() => setShowCcBcc(true)}
        composeHint={composeHint}
        fromEmail={fromAddress}
      />
    </div>
  )
}
