import { useEffect } from 'react'

function upsertMeta(attr, key, content) {
  if (content == null || content === '') return null

  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }

  el.setAttribute('content', content)
  return el
}

function upsertLink(rel, href) {
  if (!href) return null

  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }

  el.setAttribute('href', href)
  return el
}

/**
 * Lightweight per-route meta updates without adding react-helmet.
 * Restores previous values on unmount.
 */
export default function usePageMeta({
  title,
  description,
  robots,
  canonical,
  removeCanonical = false,
} = {}) {
  useEffect(() => {
    const canonicalEl = document.head.querySelector('link[rel="canonical"]')
    const previous = {
      title: document.title,
      description: document.head.querySelector('meta[name="description"]')?.getAttribute('content') ?? null,
      robots: document.head.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null,
      canonical: canonicalEl?.getAttribute('href') ?? null,
      hadCanonical: Boolean(canonicalEl),
    }

    if (title) document.title = title
    if (description != null) upsertMeta('name', 'description', description)
    if (robots != null) upsertMeta('name', 'robots', robots)

    if (removeCanonical || canonical === null) {
      canonicalEl?.remove()
    } else if (canonical != null) {
      upsertLink('canonical', canonical)
    }

    return () => {
      document.title = previous.title

      if (previous.description != null) upsertMeta('name', 'description', previous.description)
      else document.head.querySelector('meta[name="description"]')?.remove()

      if (previous.robots != null) upsertMeta('name', 'robots', previous.robots)
      else document.head.querySelector('meta[name="robots"]')?.remove()

      if (previous.hadCanonical) {
        if (previous.canonical != null) upsertLink('canonical', previous.canonical)
      } else {
        document.head.querySelector('link[rel="canonical"]')?.remove()
      }
    }
  }, [title, description, robots, canonical, removeCanonical])
}
