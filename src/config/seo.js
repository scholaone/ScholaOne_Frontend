/**
 * Production SEO constants — https://scholaone.in/
 * Keep index.html in sync with these homepage values.
 */

export const SITE_URL = 'https://scholaone.in/'
export const SITE_ORIGIN = 'https://scholaone.in'

export const SEO_HOME_TITLE = 'ScholaOne | School Management & Learning Management System'

export const SEO_HOME_DESCRIPTION =
  'ScholaOne is a modern school management and learning management platform for schools, teachers, students, parents, and administrators—covering attendance, academics, fees, examinations, and daily operations.'

export const SEO_OG_TITLE = SEO_HOME_TITLE

export const SEO_OG_DESCRIPTION =
  'Modern school management and learning management software for schools, teachers, students, parents, and administrators.'

export const SEO_TWITTER_DESCRIPTION = SEO_OG_DESCRIPTION

/** Replace with /og-image.png (1200x630) when a dedicated social image is added. */
export const SEO_OG_IMAGE = `${SITE_ORIGIN}/scholaone-logo.png`

export const SEO_OG_IMAGE_ALT = 'ScholaOne — School Management & Learning Management System'

export const SEO_THEME_COLOR = '#2563EB'

export const SEO_AUTHOR = 'ScholaOne'

export const SEO_ROBOTS_INDEX = 'index, follow'

export const SEO_ROBOTS_NOINDEX = 'noindex, nofollow'

export const SEO_STRUCTURED_DESCRIPTION =
  'ScholaOne is a school management and learning management platform for schools, teachers, students, parents, and administrators.'

/** Public routes that should appear in sitemap.xml */
export const SITEMAP_PUBLIC_PATHS = ['/']

export const NOINDEX_ROUTES = ['/login', '/forgot-password', '/f/:slug']
