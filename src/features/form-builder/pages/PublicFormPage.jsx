import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiCheckCircle } from 'react-icons/fi'
import FieldRenderer from '../components/FieldRenderer'
import RichTextContent from '../components/RichTextContent'
import { getFormBySlug, saveSubmission } from '../services/formStorage'
import { isInputField } from '../utils/fieldFactory'
import { getErrorMessage } from '@/api/client'
import NotFoundPage from '@/pages/NotFoundPage'
import { validateByKind } from '@/utils/validation'
import SEO from '@/components/seo/SEO'

function buildInitialValues(fields) {
  const initial = {}
  fields.forEach((f) => {
    if (!isInputField(f.type) && f.type !== 'hidden') return
    if (f.type === 'checkbox') {
      initial[f.id] = false
    } else if (f.type === 'checkbox-group') {
      initial[f.id] = []
    } else if (f.type === 'hidden') {
      initial[f.id] = f.defaultValue ?? ''
    } else if (f.defaultValue !== undefined && f.defaultValue !== '') {
      initial[f.id] = f.defaultValue
    }
  })
  return initial
}

function resolvePublicFormSlug(params) {
  const fromParams = params?.slug
  if (fromParams) return decodeURIComponent(String(fromParams))

  if (typeof window === 'undefined') return ''

  const parts = window.location.pathname.split('/').filter(Boolean)
  if (parts[0] === 'f' && parts[1]) return decodeURIComponent(parts[1])
  return ''
}

export default function PublicFormPage() {
  const params = useParams()
  const slug = resolvePublicFormSlug(params)
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      const row = await getFormBySlug(slug)
      if (active) {
        setForm(row)
        setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [slug])

  const initialValues = useMemo(
    () => (form ? buildInitialValues(form.fields) : {}),
    [form?.id, form?.fields],
  )

  useEffect(() => {
    setValues(initialValues)
    setErrors({})
    setSubmitted(false)
  }, [initialValues])

  if (loading) {
    return (
      <>
        <SEO title="Form | ScholaOne" noIndex />
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-sm text-muted-foreground">
          Loading form…
        </div>
      </>
    )
  }

  if (!form) return <NotFoundPage />

  const inputFields = form.fields.filter((f) => isInputField(f.type) && f.type !== 'hidden')

  const validate = () => {
    const next = {}
    inputFields.forEach((f) => {
      const v = values[f.id]
      if (f.type === 'checkbox') {
        if (f.required && !v) next[f.id] = 'This field is required'
        return
      }
      if (f.required && (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length))) {
        next[f.id] = 'This field is required'
        return
      }
      if (v === undefined || v === null || v === '') return

      const label = String(f.label || '').toLowerCase()
      const type = String(f.type || '').toLowerCase()
      let kind = null
      if (type === 'email' || label.includes('email')) kind = 'email'
      else if (type === 'tel' || label.includes('mobile') || label.includes('phone') || label.includes('whatsapp')) kind = 'mobile'
      else if (label.includes('aadhaar') || label.includes('aadhar')) kind = 'aadhaar'
      else if (label.includes('pincode') || label.includes('pin code') || label.includes('postal')) kind = 'pincode'
      else if (/\bpan\b/.test(label)) kind = 'pan'

      if (kind) {
        const result = validateByKind(kind, v, { label: f.label || 'Field' })
        if (result !== true) next[f.id] = result
      }
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate() || submitting) return
    const payload = { ...buildInitialValues(form.fields), ...values }
    form.fields
      .filter((f) => f.type === 'hidden')
      .forEach((f) => {
        payload[f.id] = f.defaultValue ?? values[f.id] ?? ''
      })
    setSubmitting(true)
    try {
      await saveSubmission(form.id, payload, form.slug)
      setSubmitted(true)
    } catch (error) {
      setErrors({ _form: getErrorMessage(error, 'Submission failed. Please try again.') })
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <>
        <SEO title={`${form.title} | ScholaOne`} noIndex />
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 text-center shadow-lg">
          <FiCheckCircle className="mx-auto h-14 w-14 text-green-500" />
          <h1 className="mt-4 text-xl font-bold">Submission received</h1>
          <RichTextContent
            html={form.settings?.thankYouMessage}
            fallback="Thank you for your submission!"
            className="mt-2 text-sm text-muted-foreground"
            as="div"
          />
        </div>
      </div>
      </>
    )
  }

  return (
    <>
      <SEO title={`${form.title} | ScholaOne`} noIndex />
      <div className="min-h-screen bg-[#f8fafc] py-8 px-4">
      <div className="mx-auto max-w-xl">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
          {errors._form ? (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors._form}</p>
          ) : null}
          <div className="space-y-5">
            {form.fields.map((field) => {
              if (field.type === 'submit') {
                return <FieldRenderer key={field.id} field={field} mode="fill" />
              }
              if (field.type === 'reset') {
                return (
                  <button
                    key={field.id}
                    type="button"
                    onClick={() => {
                      setValues(buildInitialValues(form.fields))
                      setErrors({})
                    }}
                    className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted"
                  >
                    {field.label}
                  </button>
                )
              }
              if (field.type === 'button') {
                return <FieldRenderer key={field.id} field={field} mode="fill" />
              }
              if (!isInputField(field.type) && field.type !== 'hidden') {
                return (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    mode="fill"
                    schoolName={form.schoolName}
                    logoUrl={form.logoUrl}
                  />
                )
              }
              if (field.type === 'hidden') {
                return <FieldRenderer key={field.id} field={field} mode="fill" />
              }
              return (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  mode="fill"
                  value={values[field.id]}
                  onChange={(v) => setValues((prev) => ({ ...prev, [field.id]: v }))}
                  error={errors[field.id]}
                  schoolName={form.schoolName}
                  logoUrl={form.logoUrl}
                />
              )
            })}
          </div>
          {!form.fields.some((f) => f.type === 'submit') ? (
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-lg bg-brand-600 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : (form.settings?.submitLabel || 'Submit')}
            </button>
          ) : null}
        </form>
        {form.settings?.showBranding !== false ? (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Powered by ScholaOne Form Builder
          </p>
        ) : null}
      </div>
    </div>
    </>
  )
}
