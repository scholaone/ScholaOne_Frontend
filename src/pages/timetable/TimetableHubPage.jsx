import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiPlus, FiLayers, FiCpu, FiRefreshCw } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { MappingFormCard, MappingListCard } from '@/components/academics/MappingFormLayout'
import ClassTimetablePanel from '@/components/timetable/ClassTimetablePanel'
import ExamTimetablePanel from '@/components/timetable/ExamTimetablePanel'
import TeacherTimetablePanel from '@/components/timetable/TeacherTimetablePanel'
import {
  TimetableActionCard,
  TimetableContentCard,
  TimetableEmptyState,
  TimetablePageShell,
  TimetableStatsRow,
} from '@/components/timetable/TimetableLayout'
import { timetableService, academicYearService } from '@/api/services'
import { getErrorMessage, unwrapList } from '@/api/client'
import { unwrapTimetablePayload } from '@/utils/timetableGrid'
import { useAuth } from '@/contexts/AuthContext'

export default function TimetableHubPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState('class')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [yearId, setYearId] = useState('')

  const dashQuery = useQuery({
    queryKey: ['timetable-dashboard', schoolId],
    queryFn: () => timetableService.dashboard(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const setsQuery = useQuery({
    queryKey: ['timetable-sets', schoolId],
    queryFn: () => timetableService.list({ page_size: 500, ...(schoolId ? { school: schoolId } : {}) }),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const yearsQuery = useQuery({
    queryKey: ['academic-years-tt', schoolId],
    queryFn: () => academicYearService.list(schoolId ? { school: schoolId, page_size: 100 } : {}),
    enabled: Boolean(schoolId),
  })

  const dash = useMemo(() => unwrapTimetablePayload(dashQuery.data), [dashQuery.data])
  const sets = useMemo(() => {
    const { results } = unwrapList(setsQuery.data)
    return results || []
  }, [setsQuery.data])
  const years = useMemo(() => {
    const { results } = unwrapList(yearsQuery.data)
    return Array.isArray(results) ? results : []
  }, [yearsQuery.data])

  const createMut = useMutation({
    mutationFn: () =>
      timetableService.create({
        name,
        code,
        academic_year_id: yearId,
        ...(schoolId ? { school_id: schoolId } : {}),
      }),
    onSuccess: () => {
      toast.success('Timetable set created (draft v1)')
      setName('')
      setCode('')
      qc.invalidateQueries({ queryKey: ['timetable-dashboard'] })
      qc.invalidateQueries({ queryKey: ['timetable-sets'] })
      qc.invalidateQueries({ queryKey: ['timetable-sets-scope'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <TimetablePageShell
      title="Timetable"
      description="View class, teacher, and exam schedules — all powered by one central timetable engine"
    >
      <TimetableStatsRow stats={dash} />

      <div className="grid gap-4 sm:grid-cols-3">
        <TimetableActionCard
          to="/timetable/manual"
          icon={FiLayers}
          title="Manual Creator"
          description="Click the weekly grid to assign subjects, teachers, and rooms"
        />
        <TimetableActionCard
          to="/timetable/ai-generator"
          icon={FiCpu}
          title="AI Generator"
          description="Describe requirements in plain language — OR-Tools builds the schedule"
          accent="violet"
        />
        <TimetableActionCard
          to="/timetable/substitutions"
          icon={FiRefreshCw}
          title="Substitutions"
          description="Manage teacher absence coverage and approvals"
          accent="amber"
        />
      </div>

      <TimetableContentCard tabs activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'class' ? <ClassTimetablePanel /> : null}
        {activeTab === 'teacher' ? <TeacherTimetablePanel /> : null}
        {activeTab === 'exam' ? <ExamTimetablePanel /> : null}
      </TimetableContentCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <MappingFormCard
          title="New timetable set"
          icon={FiPlus}
          description="Admin setup — creates a draft version for manual or AI editing"
          footer={
            <Button
              variant="primary"
              disabled={!name || !code || !yearId || createMut.isPending}
              loading={createMut.isPending}
              onClick={() => createMut.mutate()}
            >
              Create draft
            </Button>
          }
        >
          <SelectField
            label="Academic year"
            value={yearId}
            onChange={(e) => setYearId(e.target.value)}
            options={years.map((y) => ({
              label: y.name || y.year_name || String(y.id),
              value: String(y.id),
            }))}
            placeholder={yearsQuery.isLoading ? 'Loading...' : 'Select year...'}
          />
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Grade 8 — Term 1" />
          <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="G8-T1" />
        </MappingFormCard>

        <MappingListCard title="Timetable sets" count={sets.length}>
          {setsQuery.isLoading ? (
            <p className="text-sm text-muted">Loading...</p>
          ) : !sets.length ? (
            <p className="text-sm text-muted">No timetable sets yet. Create one or use Manual Creator.</p>
          ) : (
            <ul className="divide-y divide-border">
              {sets.slice(0, 10).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                  <div>
                    <p className="font-medium text-text">{s.name}</p>
                    <p className="text-xs text-muted">
                      {s.code}
                      {s.published_version_id ? ' · Published' : ' · Draft only'}
                    </p>
                  </div>
                  <Link
                    to="/timetable/manual"
                    className="shrink-0 text-sm font-medium text-primary hover:underline"
                  >
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </MappingListCard>
      </div>
    </TimetablePageShell>
  )
}

export function TimetableBuilderPage() {
  return (
    <TimetablePageShell
      title="Schedule Builder"
      description="Legacy form-based slot editor"
      actions={
        <Link to="/timetable/manual">
          <Button variant="primary">Use Manual Creator</Button>
        </Link>
      }
    >
      <p className="rounded-2xl border border-dashed border-border bg-muted/10 px-6 py-10 text-center text-sm text-muted">
        The weekly grid editor has replaced this page.{' '}
        <Link to="/timetable/manual" className="font-medium text-primary hover:underline">
          Open Manual Creator
        </Link>
      </p>
    </TimetablePageShell>
  )
}

export function TimetableSubstitutionsPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined

  const listQuery = useQuery({
    queryKey: ['timetable-substitutions', schoolId],
    queryFn: () => timetableService.substitutions(schoolId ? { school: schoolId } : {}),
  })

  const rows = useMemo(() => {
    const d = unwrapTimetablePayload(listQuery.data)
    return d.results || []
  }, [listQuery.data])

  return (
    <TimetablePageShell title="Substitutions" description="Teacher absence coverage with approval workflow">
      {listQuery.isLoading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : !rows.length ? (
        <TimetableEmptyState
          icon={FiRefreshCw}
          title="No substitutions yet"
          description="When teachers are absent, substitution requests will appear here for review and approval."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Absent</th>
              <th className="px-5 py-3 font-semibold">Substitute</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/20">
                <td className="px-5 py-3 text-text">{r.substitution_date}</td>
                <td className="px-5 py-3 text-text">{r.absent_teacher_name || '—'}</td>
                <td className="px-5 py-3 text-text">{r.substitute_teacher_name || '—'}</td>
                <td className="px-5 py-3 text-muted">{r.status}</td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-muted">
                  No substitutions yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        </div>
      )}
    </TimetablePageShell>
  )
}
