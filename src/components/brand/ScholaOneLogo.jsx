import { cn } from '@/lib/utils'
import { BRAND_NAME, LOGO_FULL_PATH } from '@/config/brand'

const FULL_SIZES = {
  sm: 'max-h-12',
  md: 'max-h-16',
  lg: 'max-h-20',
  xl: 'max-h-28',
  '2xl': 'max-h-36',
  '3xl': 'max-h-44',
  hero: 'max-h-48 sm:max-h-56 lg:max-h-64 xl:max-h-72',
}

const ICON_SIZES = {
  xs: 'h-8 w-8',
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
}

/**
 * ScholaOne logo image — use everywhere (auth, header, sidebar, landing).
 * @param {'icon'|'full'} variant — icon: emblem crop; full: complete logo with wordmark
 */
export default function ScholaOneLogo({
  size = 'md',
  variant = 'icon',
  className,
  imageClassName,
  alt = `${BRAND_NAME} logo`,
}) {
  const isIcon = variant === 'icon'
  const sizeClass = isIcon
    ? (ICON_SIZES[size] ?? ICON_SIZES.md)
    : (FULL_SIZES[size] ?? FULL_SIZES.md)

  return (
    <div className={cn('inline-flex shrink-0 items-center', className)}>
      <img
        src={LOGO_FULL_PATH}
        alt={alt}
        draggable={false}
        className={cn(
          'w-auto object-contain',
          isIcon ? cn(sizeClass, 'object-top object-cover') : cn(sizeClass, 'object-center'),
          imageClassName,
        )}
      />
    </div>
  )
}
