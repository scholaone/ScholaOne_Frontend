import { cn } from '@/lib/utils'
import {
  buildSlotLookup,
  buildTimetableColumns,
  formatTimetableTimeRange,
  getSlotForCell,
  TIMETABLE_WEEKDAYS,
} from '@/utils/timetableGrid'

function TimetableCellContent({ slot, mode = 'class', compact = false }) {
  if (!slot) return null

  if (slot.period_kind === 'free' || slot.status === 'cancelled') {
    return <span className="text-xs font-semibold uppercase tracking-wide text-muted">Free</span>
  }

  const subject = slot.subject_name || slot.title || '—'
  const teacher = slot.teacher_name || ''
  const section = slot.section_name || ''
  const room = slot.room_name || slot.room_label || ''
  const time = formatTimetableTimeRange(slot.start_time, slot.end_time)

  if (mode === 'teacher') {
    return (
      <div className={cn('space-y-0.5', compact && 'text-[11px]')}>
        <div className="font-semibold leading-tight text-text">{section || subject}</div>
        {section ? <div className="text-muted">{subject}</div> : null}
        {room ? <div className="text-muted">{room}</div> : null}
        {time ? <div className="text-[10px] text-muted">{time}</div> : null}
      </div>
    )
  }

  return (
    <div className={cn('space-y-0.5', compact && 'text-[11px]')}>
      <div className="font-semibold leading-tight text-text">{subject}</div>
      {teacher ? <div className="text-muted">{teacher}</div> : null}
      {room ? <div className="text-muted">{room}</div> : null}
      {time ? <div className="text-[10px] text-muted">{time}</div> : null}
    </div>
  )
}

export default function TimetableWeekGrid({
  slots = [],
  periods = [],
  mode = 'class',
  freePeriods = [],
  className,
  interactive = false,
  onCellClick,
}) {
  const columns = buildTimetableColumns(periods, slots)
  const lookup = buildSlotLookup(slots)
  const freeLookup = new Set(
    (freePeriods || []).map((item) => `${item.weekday}:${item.period_number}`),
  )

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-card shadow-sm', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="sticky left-0 z-20 min-w-[100px] border-r border-border bg-muted/40 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                Day
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'min-w-[130px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide',
                    column.isLunch ? 'bg-amber-50/80 text-amber-800' : 'text-muted',
                  )}
                >
                  <div>{column.isLunch ? 'Lunch' : column.label}</div>
                  {!column.isLunch && column.start_time && column.end_time ? (
                    <div className="mt-1 text-[10px] font-normal normal-case text-muted">
                      {formatTimetableTimeRange(column.start_time, column.end_time)}
                    </div>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIMETABLE_WEEKDAYS.map((day, rowIndex) => (
              <tr
                key={day.value}
                className={cn(
                  'border-b border-border last:border-b-0',
                  rowIndex % 2 === 0 ? 'bg-card' : 'bg-muted/10',
                )}
              >
                <td className="sticky left-0 z-10 border-r border-border bg-inherit px-4 py-3 font-semibold text-text">
                  <span className="hidden sm:inline">{day.label}</span>
                  <span className="sm:hidden">{day.short}</span>
                </td>
                {columns.map((column) => {
                  if (column.isLunch) {
                    return (
                      <td
                        key={`${day.value}-${column.key}`}
                        className="bg-amber-50/50 px-2 py-3 text-center"
                      >
                        <span className="text-xs font-medium text-amber-800">Break</span>
                      </td>
                    )
                  }

                  const slot = getSlotForCell(lookup, day.value, column)
                  const isFree = !slot && freeLookup.has(`${day.value}:${column.period_number}`)
                  const CellTag = interactive ? 'button' : 'div'

                  return (
                    <td key={`${day.value}-${column.key}`} className="p-1.5 align-top">
                      <CellTag
                        type={interactive ? 'button' : undefined}
                        className={cn(
                          'min-h-[76px] w-full rounded-xl border p-2.5 text-left transition',
                          slot
                            ? 'border-primary/15 bg-primary/[0.04] hover:bg-primary/[0.07]'
                            : isFree
                              ? 'border-dashed border-border bg-muted/20'
                              : interactive
                                ? 'border-dashed border-border/80 bg-card hover:border-primary/40 hover:bg-primary/[0.03]'
                                : 'border-transparent bg-transparent',
                        )}
                        onClick={
                          interactive && onCellClick
                            ? () => onCellClick(day.value, column, slot)
                            : undefined
                        }
                      >
                        {slot ? (
                          <TimetableCellContent slot={slot} mode={mode} compact />
                        ) : isFree ? (
                          <span className="text-xs font-medium text-muted">Free period</span>
                        ) : interactive ? (
                          <span className="flex h-full min-h-[52px] items-center justify-center text-muted">
                            <span className="rounded-full border border-dashed border-border px-2 py-1 text-xs">
                              Add
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </CellTag>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
