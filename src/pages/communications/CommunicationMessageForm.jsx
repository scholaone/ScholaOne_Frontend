import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  FiBell,
  FiBookOpen,
  FiBriefcase,
  FiChevronLeft,
  FiFileText,
  FiGlobe,
  FiMail,
  FiMessageSquare,
  FiSend,
  FiUsers,
} from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField, Textarea } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { communicationService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import {
  COMMUNICATION_AUDIENCE_OPTIONS,
  COMMUNICATION_CATEGORY_OPTIONS,
  COMMUNICATION_CHANNEL_OPTIONS,
} from '@/config/constants'
import { COMMUNICATION_CATEGORY_META, getCommunicationListPath } from '@/utils/communicationRoutes'
import { cn } from '@/lib/utils'

const CHANNEL_META = {
  email: { icon: FiMail, label: 'Email', hint: 'Deliver to inbox' },
  sms: { icon: FiMessageSquare, label: 'SMS', hint: 'Text message' },
  whatsapp: { icon: FiMessageSquare, label: 'WhatsApp', hint: 'WhatsApp message' },
  push: { icon: FiBell, label: 'Push', hint: 'In-app notification' },
}

const AUDIENCE_META = {
  students: { icon: FiBookOpen, label: 'Students', tone: 'bg-sky-50 text-sky-700 border-sky-200' },
  teachers: { icon: FiUsers, label: 'Teachers', tone: 'bg-violet-50 text-violet-700 border-violet-200' },
  parents: { icon: FiUsers, label: 'Parents', tone: 'bg-rose-50 text-rose-700 border-rose-200' },
  staff: { icon: FiBriefcase, label: 'Staff', tone: 'bg-amber-50 text-amber-800 border-amber-200' },
  all: { icon: FiGlobe, label: 'Everyone', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
}

const CATEGORY_ICONS = {
  announcement: FiBell,
  circular: FiFileText,
  notification: FiMessageSquare,
}

const CATEGORY_LABELS = Object.fromEntries(
  COMMUNICATION_CATEGORY_OPTIONS.map((o) => [o.value, o.label]),
)

function getComposeCopy(category) {
  return COMMUNICATION_CATEGORY_META[category]?.compose || DEFAULT_COMPOSE_COPY
}

const ALL_AUDIENCE_VALUES = ['students', 'teachers', 'parents', 'staff']
const AUDIENCE_EVERYONE = 'all'

function isEveryoneSelected(audiences) {
  return audiences.includes(AUDIENCE_EVERYONE)
    || ALL_AUDIENCE_VALUES.every((value) => audiences.includes(value))
}

function getAudienceDisplayLabels(audiences) {
  if (isEveryoneSelected(audiences)) {
    return [AUDIENCE_META[AUDIENCE_EVERYONE]?.label || 'Everyone']
  }
  return audiences.map((a) => AUDIENCE_META[a]?.label || a)
}

function toggleAudienceSelection(current, value) {
  if (value === AUDIENCE_EVERYONE) {
    if (isEveryoneSelected(current)) {
      return current.includes('students') ? ['students'] : [ALL_AUDIENCE_VALUES[0]]
    }
    return [...ALL_AUDIENCE_VALUES, AUDIENCE_EVERYONE]
  }

  if (current.includes(value)) {
    if (current.filter((v) => v !== AUDIENCE_EVERYONE).length <= 1) {
      return current
    }
    const next = current.filter((v) => v !== value && v !== AUDIENCE_EVERYONE)
    return next.length ? next : ['students']
  }

  const next = [...current.filter((v) => v !== AUDIENCE_EVERYONE), value]
  if (ALL_AUDIENCE_VALUES.every((v) => next.includes(v))) {
    return [...ALL_AUDIENCE_VALUES, AUDIENCE_EVERYONE]
  }
  return next
}

function isAudienceChipActive(values, value) {
  if (value === AUDIENCE_EVERYONE) {
    return isEveryoneSelected(values)
  }
  return values.includes(value) || isEveryoneSelected(values)
}

function SectionCard({ icon: Icon, title, description, children, className }) {
  return (
    <Card className={cn('overflow-hidden p-0', className)}>
      <div className="border-b border-border bg-gradient-to-r from-slate-50/80 to-white px-5 py-4">
        <div className="flex items-start gap-3">
          {Icon ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="h-5 w-5" />
            </div>
          ) : null}
          <div>
            <h2 className="text-base font-bold text-black">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </Card>
  )
}

function OptionChip({ active, icon: Icon, label, hint, onClick, tone }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex min-w-[8.5rem] flex-1 flex-col items-start rounded-xl border px-3.5 py-3 text-left transition',
        active
          ? cn('border-brand-500 bg-brand-50/70 shadow-sm ring-1 ring-brand-500/30', tone)
          : 'border-border bg-white hover:border-brand-200 hover:bg-slate-50',
      )}
    >
      <span className="flex items-center gap-2">
        {Icon ? (
          <Icon className={cn('h-4 w-4', active ? 'text-brand-600' : 'text-muted-foreground')} />
        ) : null}
        <span className={cn('text-sm font-semibold', active ? 'text-black' : 'text-black/80')}>
          {label}
        </span>
      </span>
      {hint ? (
        <span className="mt-1 text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </button>
  )
}

function AudienceChipGroup({ options, meta, values, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const info = meta[opt.value] || { label: opt.label }
        return (
          <OptionChip
            key={opt.value}
            active={isAudienceChipActive(values, opt.value)}
            icon={info.icon}
            label={info.label || opt.label}
            hint={info.hint}
            tone={info.tone}
            onClick={() => onChange(toggleAudienceSelection(values, opt.value))}
          />
        )
      })}
    </div>
  )
}

function ToggleChipGroup({ options, meta, values, onChange }) {
  const toggle = (value) => {
    if (values.includes(value)) {
      if (values.length > 1) onChange(values.filter((v) => v !== value))
    } else {
      onChange([...values, value])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const info = meta[opt.value] || { label: opt.label }
        return (
          <OptionChip
            key={opt.value}
            active={values.includes(opt.value)}
            icon={info.icon}
            label={info.label || opt.label}
            hint={info.hint}
            tone={info.tone}
            onClick={() => toggle(opt.value)}
          />
        )
      })}
    </div>
  )
}

function ReachPreviewContent({ preview, loading, onPreview }) {
  const sample = preview?.sample || []

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="secondary"
          size="sm"
          loading={loading}
          onClick={onPreview}
        >
          Preview audience
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Calculating recipients…</p>
      ) : preview ? (
        <div>
          <p className="text-2xl font-bold text-black">
            {preview.count ?? 0}
            <span className="ml-1 text-sm font-normal text-muted-foreground">recipients</span>
          </p>

          {sample.length > 0 ? (
            <div className="mt-3 max-h-52 overflow-y-auto rounded-lg border border-border bg-slate-50/80 pr-1 scrollbar-thin">
              <ul className="space-y-2 p-2">
                {sample.map((s) => (
                  <li
                    key={s.user_id}
                    className="flex items-center gap-2 rounded-lg border border-white bg-white px-3 py-2 text-sm"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      {(s.full_name || '?').charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      <span className="font-medium text-black">{s.full_name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {s.email || s.mobile || '—'}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">No sample recipients returned.</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Click preview audience to see recipient count and sample users.
        </p>
      )}
    </div>
  )
}

function MessageLivePreview({ title, body, category, channels, audiences, composeCopy }) {
  const channelLabels = channels.map(
    (c) => CHANNEL_META[c]?.label || c,
  )
  const audienceLabels = getAudienceDisplayLabels(audiences)
  const CategoryIcon = CATEGORY_ICONS[category] || FiBell

  return (
    <div className="rounded-xl border border-dashed border-brand-200 bg-gradient-to-br from-brand-50/40 via-white to-slate-50 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
          <CategoryIcon className="h-3 w-3" />
          {CATEGORY_LABELS[category] || 'Message'}
        </span>
        <span className="text-xs text-muted-foreground">Live preview</span>
      </div>
      <h3 className="text-lg font-bold text-black">
        {title.trim() || composeCopy.emptyTitle}
      </h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-black/70">
        {body.trim() || composeCopy.emptyBody}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {channelLabels.map((label) => (
          <span
            key={label}
            className="rounded-full border border-border bg-white px-2.5 py-1 text-xs font-medium text-black/70"
          >
            {label}
          </span>
        ))}
        {audienceLabels.map((label) => (
          <span
            key={label}
            className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function CommunicationMessageForm() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const initialCategory = searchParams.get('category') || 'announcement'
  const lockedCategory = Boolean(searchParams.get('category')) && !isEdit

  const [form, setForm] = useState({
    category: initialCategory,
    title: '',
    subject: '',
    body: '',
    channels: ['push'],
    audiences: ['students'],
  })
  const [preview, setPreview] = useState(null)

  const listPath = getCommunicationListPath(form.category)
  const categoryMeta = COMMUNICATION_CATEGORY_META[form.category]
  const composeCopy = getComposeCopy(form.category)
  const CategoryIcon = CATEGORY_ICONS[form.category] || FiSend
  const showTypeSelector = !lockedCategory

  const { data, isLoading, error } = useQuery({
    queryKey: ['communication-messages', id],
    queryFn: () => communicationService.messages.get(id),
    enabled: isEdit,
  })

  useEffect(() => {
    if (data && isEdit) {
      const item = unwrapData(data)
      setForm({
        category: item.category || 'announcement',
        title: item.title || '',
        subject: item.subject || '',
        body: item.body || '',
        channels: item.channels || ['push'],
        audiences: item.audiences || ['students'],
      })
    }
  }, [data, isEdit])

  const saveMut = useMutation({
    mutationFn: () => (isEdit
      ? communicationService.messages.update(id, form)
      : communicationService.messages.create(form)),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['communication-messages'] })
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      queryClient.invalidateQueries({ queryKey: ['circulars'] })
      queryClient.invalidateQueries({ queryKey: ['communication-notifications'] })
      toast.success(isEdit ? 'Message updated' : 'Message created')
      const saved = unwrapData(res)
      navigate(`/communications/messages/${saved.message_id || saved.id || id}`)
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const previewMut = useMutation({
    mutationFn: () => communicationService.messages.previewAudience({
      audiences: form.audiences,
    }),
    onSuccess: (res) => setPreview(unwrapData(res)?.data || unwrapData(res)),
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const breadcrumbItems = useMemo(() => {
    if (!isEdit && categoryMeta) {
      return [
        { label: 'Communications', href: '/communications' },
        { label: categoryMeta.title, href: listPath },
        { label: `New ${CATEGORY_LABELS[form.category]?.toLowerCase() || 'message'}` },
      ]
    }
    return [
      { label: 'Communications', href: '/communications' },
      { label: 'Messages', href: '/communications/messages' },
      { label: isEdit ? 'Edit' : 'Compose' },
    ]
  }, [categoryMeta, form.category, isEdit, listPath])

  const pageTitle = useMemo(() => {
    if (isEdit) return composeCopy.pageTitleEdit
    return composeCopy.pageTitle
  }, [composeCopy, isEdit])

  const pageSubtitle = composeCopy.pageSubtitle

  if (isEdit && isLoading) return <PageLoader />
  if (isEdit && error) return <ErrorState message={getErrorMessage(error)} />

  return (
    <div className="lms-page w-full space-y-6 pb-4">
      <Breadcrumb items={breadcrumbItems} />

      <div className={cn(
        'relative overflow-hidden rounded-2xl border px-5 py-6 sm:px-6',
        'border-brand-200/80 bg-gradient-to-br from-brand-50 via-white to-sky-50/50',
      )}
      >
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-100/60 blur-2xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
              <CategoryIcon className="h-6 w-6" />
            </div>
            <div>
              <PageHeader
                title={pageTitle}
                subtitle={pageSubtitle}
                className="mb-0"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to={listPath}>
              <Button variant="outline" size="sm">
                <FiChevronLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <SectionCard
            icon={CategoryIcon}
            title={composeCopy.contentTitle}
            description={composeCopy.contentDescription}
          >
            {showTypeSelector ? (
              <SelectField
                label="Type"
                value={form.category}
                options={COMMUNICATION_CATEGORY_OPTIONS}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              />
            ) : null}
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
              placeholder={composeCopy.titlePlaceholder}
            />
            <Input
              label="Email subject"
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              placeholder="Optional — used when email channel is selected"
              hint={form.channels.includes('email') ? 'Recommended when sending via email' : undefined}
            />
            <Textarea
              label="Message body"
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              rows={8}
              required
              placeholder={composeCopy.bodyPlaceholder}
            />
            <p className="text-xs text-muted-foreground">
              {form.body.length} characters
            </p>
          </SectionCard>

          <SectionCard
            icon={CategoryIcon}
            title={composeCopy.livePreviewTitle}
            description={composeCopy.livePreviewDescription}
          >
            <MessageLivePreview
              title={form.title}
              body={form.body}
              category={form.category}
              channels={form.channels}
              audiences={form.audiences}
              composeCopy={composeCopy}
            />
          </SectionCard>

          <SectionCard
            icon={FiUsers}
            title="Reach preview"
            description={composeCopy.reachDescription}
          >
            <ReachPreviewContent
              preview={preview}
              loading={previewMut.isPending}
              onPreview={() => previewMut.mutate()}
            />
          </SectionCard>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <SectionCard
            icon={FiUsers}
            title="Delivery settings"
            description="Choose who receives this and how."
          >
            <div className="space-y-2">
              <p className="text-sm font-medium text-black">Channels</p>
              <ToggleChipGroup
                options={COMMUNICATION_CHANNEL_OPTIONS}
                meta={CHANNEL_META}
                values={form.channels}
                onChange={(channels) => setForm((p) => ({ ...p, channels }))}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-black">Audience</p>
              <AudienceChipGroup
                options={COMMUNICATION_AUDIENCE_OPTIONS}
                meta={AUDIENCE_META}
                values={form.audiences}
                onChange={(audiences) => setForm((p) => ({ ...p, audiences }))}
              />
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-2 border-t border-border bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 lg:-mx-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {form.channels.length} channel{form.channels.length === 1 ? '' : 's'}
            {' · '}
            {isEveryoneSelected(form.audiences)
              ? 'Everyone'
              : `${form.audiences.filter((a) => a !== AUDIENCE_EVERYONE).length} audience group${form.audiences.filter((a) => a !== AUDIENCE_EVERYONE).length === 1 ? '' : 's'}`}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(listPath)}
            >
              Cancel
            </Button>
            <Button loading={saveMut.isPending} onClick={() => saveMut.mutate()}>
              <FiSend className="h-4 w-4" />
              {isEdit ? 'Save changes' : 'Save draft'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
