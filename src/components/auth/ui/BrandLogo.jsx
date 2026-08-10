import { cn } from '@/utils/format'
import { BRAND_NAME } from '@/config/brand'
import ScholaOneLogo from '@/components/brand/ScholaOneLogo'

export default function BrandLogo({
  size = 'md',
  variant = 'icon',
  showName = false,
  subtitle,
  className,
  imageClassName,
}) {
  const logo = (
    <ScholaOneLogo
      size={size}
      variant={variant === 'full' ? 'full' : 'icon'}
      className={className}
      imageClassName={imageClassName}
    />
  )

  if (!showName) return logo

  return (
    <div className="flex items-center gap-3">
      {logo}
      {variant !== 'full' && (
        <div>
          <span className="block text-lg font-bold text-[var(--clay-primary)]">{BRAND_NAME}</span>
          {subtitle && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--clay-teal)]">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
