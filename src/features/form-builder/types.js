/** @typedef {'draft' | 'published' | 'archived'} FormStatus */

/**
 * @typedef {Object} FormFieldOption
 * @property {string} label
 * @property {string} value
 */

/**
 * @typedef {Object} FormField
 * @property {string} id
 * @property {string} type
 * @property {string} label
 * @property {string} [placeholder]
 * @property {string} [helpText]
 * @property {boolean} [required]
 * @property {string} [defaultValue]
 * @property {FormFieldOption[]} [options]
 * @property {number} [width] 1-12 grid cols
 * @property {string} [content] for layout blocks
 * @property {string} [imageUrl]
 * @property {string} [buttonVariant]
 * @property {string} [accept] file input accept
 */

/**
 * @typedef {Object} FormDefinition
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} [description]
 * @property {FormStatus} status
 * @property {string} [schoolName]
 * @property {string} [logoUrl]
 * @property {string} [headerSubtitle]
 * @property {FormField[]} fields
 * @property {Object} settings
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} [publishedAt]
 */

/**
 * @typedef {Object} FormSubmission
 * @property {string} id
 * @property {string} formId
 * @property {Record<string, unknown>} data
 * @property {string} submittedAt
 */

export const FORM_STORAGE_KEY = 'scholaone-form-builder-forms'
export const SUBMISSION_STORAGE_KEY = 'scholaone-form-builder-submissions'
