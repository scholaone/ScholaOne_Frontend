import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { BRAND_NAME, BRAND_SUBTITLE } from '@/config/brand'
import ScholaOneLogo from './ScholaOneLogo'

/** Logo + optional subtitle — use in header, sidebar, auth. */
export default function BrandLockup({
  to,
  markSize = 'sm',
  wordmarkSize = 'md',
  showTagline = false,
  subtitle = BRAND_SUBTITLE,
  className,
  onDark = false,
  variant = 'full',
}) {
  const logoSize = variant === 'icon' ? markSize : wordmarkSize

  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      <ScholaOneLogo size={logoSize} variant={variant === 'icon' ? 'icon' : 'full'} />
      {subtitle && variant === 'full' && !showTagline ? (
        <p
          className={cn(
            'hidden max-w-[140px] truncate text-[10px] font-semibold leading-tight sm:block sm:text-xs',
            onDark ? 'text-blue-100/80' : 'text-slate-500',
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="inline-flex shrink-0 transition-opacity hover:opacity-90" aria-label={BRAND_NAME}>
        {content}
      </Link>
    )
  }

  return content
}
