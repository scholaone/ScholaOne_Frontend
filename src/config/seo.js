/**
 * Production SEO constants — https://scholaone.in/
 * Keep index.html in sync with these homepage values.
 */

export const SITE_URL = 'https://scholaone.in/'
export const SITE_ORIGIN = 'https://scholaone.in'

export const SEO_HOME_TITLE = 'ScholaOne - Smarter Learning. Simpler School Management.'

export const SEO_HOME_DESCRIPTION =
  'ScholaOne is a modern school LMS and school management platform for schools, teachers, students, parents, and administrators - covering academics, attendance, examinations, fees, classrooms, and daily operations.'

export const SEO_OG_TITLE = SEO_HOME_TITLE

export const SEO_OG_DESCRIPTION = SEO_HOME_DESCRIPTION

export const SEO_TWITTER_DESCRIPTION = SEO_HOME_DESCRIPTION

/** Bump after favicon/logo asset changes to bust CDN cache. */
export const FAVICON_VERSION = '2'

/** Replace with /og-image.png (1200x630) when a dedicated social image is added. */
export const SEO_OG_IMAGE = `${SITE_ORIGIN}/scholaone-logo.png`

export const SEO_OG_IMAGE_ALT = SEO_HOME_TITLE

export const SEO_THEME_COLOR = '#2563EB'

export const SEO_AUTHOR = 'ScholaOne'

export const SEO_ROBOTS_INDEX = 'index, follow'

export const SEO_ROBOTS_NOINDEX = 'noindex, nofollow'

export const SEO_STRUCTURED_DESCRIPTION =
  'ScholaOne is a school management and learning management platform for schools, teachers, students, parents, and administrators.'

/** Public routes that should appear in sitemap.xml */
export const SITEMAP_PUBLIC_PATHS = ['/']

export const NOINDEX_ROUTES = ['/login', '/forgot-password', '/f/:slug']
