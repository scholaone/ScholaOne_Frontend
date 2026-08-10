import { cn } from '@/lib/utils'
import { BRAND_TAGLINE } from '@/config/brand'

const TEXT_SIZES = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
  '2xl': 'text-4xl sm:text-5xl',
  hero: 'text-4xl sm:text-5xl lg:text-6xl',
}

export default function ScholaOneWordmark({
  size = 'md',
  showTagline = false,
  tagline = BRAND_TAGLINE,
  className,
  nameClassName,
}) {
  return (
    <div className={cn('leading-tight', className)}>
      <span
        className={cn(
          'whitespace-nowrap font-extrabold tracking-tight',
          TEXT_SIZES[size] ?? TEXT_SIZES.md,
          nameClassName,
        )}
      >
        <span className="text-[#1e3a5f]">Schola</span>
        <span className="bg-gradient-to-r from-[#059669] to-[#10b981] bg-clip-text text-transparent">One</span>
      </span>
      {showTagline && tagline ? (
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 sm:text-xs">
          {tagline}
        </p>
      ) : null}
    </div>
  )
}
