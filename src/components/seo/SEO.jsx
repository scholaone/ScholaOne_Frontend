import usePageMeta from '@/hooks/usePageMeta'
import {
  SEO_HOME_DESCRIPTION,
  SEO_HOME_TITLE,
  SEO_ROBOTS_INDEX,
  SEO_ROBOTS_NOINDEX,
  SITE_URL,
} from '@/config/seo'

/**
 * Centralized route-level SEO for the React SPA.
 * Homepage metadata lives in index.html; use this on routed pages only.
 */
export default function SEO({
  title = SEO_HOME_TITLE,
  description = SEO_HOME_DESCRIPTION,
  robots = SEO_ROBOTS_INDEX,
  canonical = SITE_URL,
  noIndex = false,
}) {
  usePageMeta({
    title,
    description: noIndex ? undefined : description,
    robots: noIndex ? SEO_ROBOTS_NOINDEX : robots,
    canonical: noIndex ? null : canonical,
    removeCanonical: noIndex,
  })

  return null
}
