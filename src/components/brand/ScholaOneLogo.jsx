import { cn } from '@/lib/utils'
import { BRAND_NAME, LOGO_FULL_PATH } from '@/config/brand'

const FULL_SIZES = {
  sm: 'max-h-14',
  md: 'max-h-20',
  lg: 'max-h-24',
  xl: 'max-h-32',
  '2xl': 'max-h-40',
  '3xl': 'max-h-48',
  hero: 'max-h-60 sm:max-h-72 lg:max-h-[22rem] xl:max-h-[24rem]',
}

const ICON_SIZES = {
  xs: 'h-9 w-9',
  sm: 'h-10 w-10',
  md: 'h-11 w-11',
  lg: 'h-12 w-12',
}

/**
 * ScholaOne logo — transparent PNG with full wordmark + tagline.
 * @param {'icon'|'full'} variant — icon: emblem crop; full: complete logo
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
    <div className={cn('scholaone-logo inline-flex shrink-0 items-center bg-transparent', className)}>
      <img
        src={LOGO_FULL_PATH}
        alt={alt}
        draggable={false}
        className={cn(
          'w-auto select-none bg-transparent',
          isIcon
            ? cn(sizeClass, 'object-cover object-top')
            : cn(sizeClass, 'object-contain object-center'),
          imageClassName,
        )}
      />
    </div>
  )
}
