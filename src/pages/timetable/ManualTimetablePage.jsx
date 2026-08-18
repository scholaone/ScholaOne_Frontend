import ManualTimetableEditor from '@/components/timetable/ManualTimetableEditor'
import { TimetablePageShell } from '@/components/timetable/TimetableLayout'

export default function ManualTimetablePage() {
  return (
    <TimetablePageShell
      title="Manual Timetable Creator"
      description="Click any cell in the weekly grid to assign subject, teacher, and room"
    >
      <ManualTimetableEditor />
    </TimetablePageShell>
  )
}
