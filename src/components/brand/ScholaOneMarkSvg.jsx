/** Inline ScholaOne emblem — crisp at any size. */
import { useId } from 'react'
import { BRAND_NAME } from '@/config/brand'

export default function ScholaOneMarkSvg({ className, title = BRAND_NAME }) {
  const uid = useId().replace(/:/g, '')
  const blueId = `so-blue-${uid}`
  const greenId = `so-green-${uid}`
  const capId = `so-cap-${uid}`

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      fill="none"
      role="img"
      aria-label={title}
      className={className}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={blueId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id={greenId} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id={capId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
      </defs>
      <path
        d="M22 58c6-22 24-34 38-34s32 12 38 34c-4 18-18 30-38 30S26 76 22 58Z"
        fill={`url(#${blueId})`}
        opacity="0.92"
      />
      <path
        d="M98 58c-6-22-24-34-38-34S28 36 22 58c4 18 18 30 38 30s34-12 38-30Z"
        fill={`url(#${greenId})`}
        opacity="0.92"
      />
      <ellipse cx="60" cy="58" rx="22" ry="18" fill="#ffffff" opacity="0.95" />
      <path d="M60 18 26 34l34 16 34-16-34-16Z" fill={`url(#${capId})`} />
      <path
        d="M86 36v12c0 5-11.6 9-26 9S34 53 34 48V36"
        stroke={`url(#${capId})`}
        strokeWidth="2.8"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M90 34v7" stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="90" cy="43" r="2.2" fill="#fbbf24" />
      <path
        d="M36 86c7-3 14-3 24 0 10-3 17-3 24 0v10c-7-3-14-3-24 0-10-3-17-3-24 0V86Z"
        fill="#e2e8f0"
      />
      <path
        d="M36 86c7 3 14 3 24 0"
        stroke={`url(#${blueId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M84 86c-7 3-14 3-24 0"
        stroke={`url(#${greenId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M60 86v10" stroke="#94a3b8" strokeWidth="1.4" />
    </svg>
  )
}
