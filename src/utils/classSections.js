/** Shared sort + labels for Class — Section dropdowns. */

export const CLASS_SECTION_ORDERING =
  'school_class__sequence,school_class__name,section__sequence,section__name'

function classSequence(row) {
  const raw =
    row?.class_sequence ??
    row?.school_class_sequence ??
    row?.school_class?.sequence
  return Number.isFinite(Number(raw)) ? Number(raw) : 999999
}

function sectionSequence(row) {
  const raw = row?.section_sequence ?? row?.section?.sequence
  return Number.isFinite(Number(raw)) ? Number(raw) : 999999
}

function compareText(a, b) {
  return String(a || '').localeCompare(String(b || ''), undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

/** Sort class sections: STD sequence → class name → section sequence → section name. */
export function sortClassSections(sections) {
  return [...(sections || [])].sort((a, b) => {
    const seqDiff = classSequence(a) - classSequence(b)
    if (seqDiff !== 0) return seqDiff

    const classDiff = compareText(a.class_name, b.class_name)
    if (classDiff !== 0) return classDiff

    const sectionSeqDiff = sectionSequence(a) - sectionSequence(b)
    if (sectionSeqDiff !== 0) return sectionSeqDiff

    return compareText(a.section_name, b.section_name)
  })
}

export function classSectionLabel(row) {
  if (row?.class_section_label) {
    return row.class_section_label
  }

  const className = String(row?.class_name || '').trim()
  const sectionName = String(row?.section_name || '').trim()

  if (className && sectionName) {
    if (className.toLowerCase().includes(sectionName.toLowerCase())) {
      return className
    }
    return `${className} — ${sectionName}`
  }

  return className || sectionName || 'Class section'
}

/** Standard / grade label only (e.g. LKG, UKG) — no section suffix. */
export function schoolClassLabel(row) {
  return String(row?.class_name || row?.school_class?.name || '').trim() || 'Class'
}

export function getSchoolClassKey(row) {
  const classId = row?.class_id ?? row?.school_class?.id ?? row?.school_class_id
  if (classId) return String(classId)
  return schoolClassLabel(row).toLowerCase()
}

/** Group active class-section rows by standard (school class). */
export function buildSchoolClassGroups(sections) {
  const groups = new Map()

  for (const row of sortClassSections(sections)) {
    const key = getSchoolClassKey(row)
    if (!key) continue

    if (!groups.has(key)) {
      groups.set(key, {
        value: key,
        label: schoolClassLabel(row),
        sequence: classSequence(row),
        sectionIds: [],
      })
    }

    const group = groups.get(key)
    group.sectionIds.push(String(row.id))
  }

  return [...groups.values()].sort((a, b) => {
    const seqDiff = a.sequence - b.sequence
    if (seqDiff !== 0) return seqDiff
    return compareText(a.label, b.label)
  })
}

/** Dropdown / checkbox options grouped by standard (LKG, UKG, …). */
export function mapSchoolClassOptions(sections) {
  return buildSchoolClassGroups(sections).map((group) => ({
    value: group.value,
    label:
      group.sectionIds.length > 1
        ? `${group.label} (${group.sectionIds.length} sections)`
        : group.label,
    sectionIds: group.sectionIds,
  }))
}

/** Expand selected standard keys to all underlying class-section IDs. */
export function resolveSectionIdsFromStandards(standardOptions, selectedKeys) {
  const selected = new Set((selectedKeys || []).map(String))
  if (!selected.size) return []

  return [
    ...new Set(
      (standardOptions || [])
        .filter((option) => selected.has(String(option.value)))
        .flatMap((option) => option.sectionIds || []),
    ),
  ]
}

/** Resolve a single selected standard key to section IDs. */
export function resolveSectionIdsFromStandard(standardOptions, standardKey) {
  if (!standardKey) return []
  return resolveSectionIdsFromStandards(standardOptions, [standardKey])
}

export function mapClassSectionOptions(sections, { includeCount = false, countLabel = '' } = {}) {
  return sortClassSections(sections).map((row) => {
    const count = row.enrolled_count ?? row.strength
    const countText =
      includeCount && count != null
        ? ` (${count}${countLabel ? ` ${countLabel}` : ''})`
        : ''
    return {
      label: `${classSectionLabel(row)}${countText}`,
      value: String(row.id),
    }
  })
}

/** Normalize class labels from spreadsheets (Grade 1, Class 5, STD-1 → comparable tokens). */
export function normalizeClassImportLabel(value) {
  let text = String(value || '').trim().toLowerCase()
  if (!text) return ''
  text = text.replace(/[-_]+/g, ' ')
  text = text.replace(/^(grade|class|std|standard|year)\s*[-.]?\s*/i, '')
  text = text.replace(/\s+/g, ' ').trim()
  return text
}

export function normalizeSectionImportLabel(value) {
  return String(value || '').trim().toLowerCase()
}

function classSectionLookupKeys(className, sectionName, classSequence) {
  const section = normalizeSectionImportLabel(sectionName)
  if (!section) return []

  const rawClass = String(className || '').trim().toLowerCase()
  const normalizedClass = normalizeClassImportLabel(className)
  const keys = new Set()

  if (rawClass) keys.add(`${rawClass}|${section}`)
  if (normalizedClass && normalizedClass !== rawClass) {
    keys.add(`${normalizedClass}|${section}`)
  }
  if (classSequence != null && classSequence !== '') {
    keys.add(`${String(classSequence).trim().toLowerCase()}|${section}`)
  }

  return [...keys]
}

/** Build a lookup map for bulk import class + section resolution. */
export function buildClassSectionImportMap(sections) {
  const map = new Map()

  for (const row of sections || []) {
    const keys = classSectionLookupKeys(
      row.class_name,
      row.section_name,
      row.class_sequence ?? row.school_class?.sequence,
    )
    for (const key of keys) {
      if (!map.has(key)) map.set(key, row.id)
    }
  }

  return map
}

export function resolveClassSectionImportId(map, className, sectionName) {
  const keys = classSectionLookupKeys(className, sectionName)
  for (const key of keys) {
    const id = map.get(key)
    if (id) return id
  }
  return null
}

export function formatClassSectionImportHint(sections, limit = 12) {
  const labels = [...new Set((sections || []).map((row) => classSectionLabel(row)))]
  if (!labels.length) return 'No active class sections for the current academic year.'
  const shown = labels.slice(0, limit).join(', ')
  return labels.length > limit ? `${shown}, …` : shown
}
