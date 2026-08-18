import { formatExperienceDate, formatExperienceDuration } from '@/utils/teacherExperience'

/** Experience date range with bold dd/mm/yy dates and optional duration. */
export default function ExperienceSummary({ record, className }) {
  if (!record) return '—'

  const from = formatExperienceDate(record.start_date)
  const isPresent = record.is_current || !record.end_date
  const to = isPresent ? 'Present' : formatExperienceDate(record.end_date)
  const duration = formatExperienceDuration(record)

  return (
    <span className={className}>
      <strong>{from}</strong>
      {' to '}
      {isPresent ? to : <strong>{to}</strong>}
      {duration ? (
        <>
          {' · '}
          <b>{duration}</b>
        </>
      ) : null}
    </span>
  )
}
