import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { PageHeader, Card } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import Button from '@/components/ui/Button'
import Input, { Textarea, SelectField, CheckboxField, PasswordInput } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { getErrorMessage, unwrapData } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { buildScopedPayload, getScopedCreateDefaults } from '@/utils/scopePayload'
import {
  getInputConstraints,
  getRhfRules,
  resolveFieldKind,
  sanitizeByKind,
  RHF_VALIDATION_MODE,
  applyApiFieldErrors,
  handleFormInvalid,
  formFieldId,
} from '@/utils/validation'
import FormValidationSummaryRhf from '@/components/ui/FormValidationSummary'

export default function ResourceFormPage({
  title,
  breadcrumb,
  queryKey,
  getFn,
  createFn,
  updateFn,
  basePath,
  fields,
  transformSubmit,
  transformLoad,
  onSuccess,
  renderExtra,
  renderTop,
  getCreateDefaults,
  applyScope = true,
}) {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isSuperAdmin } = useAuth()

  const scopeDefaults = useMemo(() => {
    if (!applyScope || isEdit) return {}
    const auto = getScopedCreateDefaults(user, fields, { isSuperAdmin })
    const custom = getCreateDefaults?.() || {}
    return { ...auto, ...custom }
  }, [applyScope, isEdit, user, fields, isSuperAdmin, getCreateDefaults])

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch, setError } = useForm({
    ...RHF_VALIDATION_MODE,
    defaultValues: scopeDefaults,
  })
  const formValues = watch()

  const { data, isLoading, error } = useQuery({
    queryKey: [queryKey, id],
    queryFn: () => getFn(id),
    enabled: isEdit,
  })

  useEffect(() => {
    if (data && isEdit) {
      const item = unwrapData(data)
      const values = transformLoad ? transformLoad(item) : item
      reset(values)
    }
  }, [data, isEdit, reset, transformLoad])

  // Clear dependent fields when their parent select changes
  useEffect(() => {
    const subscription = watch((_values, { name, type }) => {
      if (!name || (type && type !== 'change')) return
      fields.forEach((field) => {
        const parents = Array.isArray(field.dependsOn)
          ? field.dependsOn
          : field.dependsOn
            ? [field.dependsOn]
            : []
        if (parents.includes(name)) {
          setValue(field.name, '')
        }
      })
    })
    return () => subscription.unsubscribe()
  }, [watch, setValue, fields])

  const mutation = useMutation({
    mutationFn: (formData) => {
      let payload = formData
      if (applyScope) {
        payload = buildScopedPayload(formData, user, fields, { isSuperAdmin })
      }
      if (transformSubmit) {
        payload = transformSubmit(payload)
      }
      return isEdit ? updateFn(id, payload) : createFn(payload)
    },
    onSuccess: (response, formData) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      onSuccess?.({ response, formData, isEdit })
      toast.success(isEdit ? 'Updated successfully' : 'Created successfully')
      navigate(basePath)
    },
    onError: (err) => {
      const apiErrors = applyApiFieldErrors(setError, err)
      if (Object.keys(apiErrors).length) {
        handleFormInvalid(apiErrors, { toastFn: toast.error })
        return
      }
      toast.error(getErrorMessage(err))
    },
  })

  const onInvalid = (invalidErrors) => {
    handleFormInvalid(invalidErrors, { toastFn: toast.error })
  }

  const registerField = (field) => {
    const kind = resolveFieldKind(field.name, field.type)
    const rules = {
      ...getRhfRules(field.name, {
        required: field.required,
        label: field.label,
        type: field.type,
      }),
      valueAsNumber: field.type === 'number',
    }
    const { onChange, onBlur, name, ref } = register(field.name, rules)
    const constraints = getInputConstraints(field.name, field.type)

    return {
      id: formFieldId(field.name),
      name,
      ref,
      onBlur,
      ...constraints,
      placeholder: field.placeholder || constraints.placeholder,
      onChange: (e) => {
        if (kind) {
          const next = sanitizeByKind(kind, e.target.value)
          if (next !== e.target.value) e.target.value = next
        }
        return onChange(e)
      },
    }
  }

  const renderField = (field) => {
    const isDisabled =
      (isEdit && field.readOnlyOnEdit) ||
      (typeof field.disabled === 'function' ? field.disabled(formValues) : Boolean(field.disabled))

    const common = {
      key: field.name,
      label: field.label,
      error: errors[field.name]?.message,
      required: field.required,
      disabled: isDisabled,
      ...registerField(field),
    }

    switch (field.type) {
      case 'textarea':
        return <Textarea {...common} placeholder={field.placeholder} />
      case 'select': {
        const options =
          typeof field.getOptions === 'function'
            ? field.getOptions(formValues)
            : (field.options || [])
        return (
          <SelectField
            {...common}
            options={options}
            placeholder={field.placeholder}
          />
        )
      }
      case 'checkbox':
        return <CheckboxField label={field.label} {...register(field.name)} />
      case 'password':
        return <PasswordInput {...common} type="password" />
      case 'email':
        return <Input {...common} type="email" />
      case 'date':
        return <Input {...common} type="date" />
      case 'number':
        return <Input {...common} type="number" />
      default:
        return <Input {...common} type={common.type || 'text'} />
    }
  }

  if (isEdit && isLoading) return <PageLoader />
  if (isEdit && error) return <ErrorState message={getErrorMessage(error)} />

  return (
    <div className="lms-page w-full">
      <Breadcrumb items={breadcrumb || [{ label: title, href: basePath }, { label: isEdit ? 'Edit' : 'New' }]} />
      <PageHeader title={isEdit ? `Edit ${title}` : `New ${title}`} />

      <Card className="w-full lms-form-card">
        <form
          noValidate
          onSubmit={handleSubmit((d) => mutation.mutate(d), onInvalid)}
          className="grid gap-4 p-1 [grid-template-columns:minmax(0,1fr)] sm:[grid-template-columns:repeat(2,minmax(0,1fr))] lg:[grid-template-columns:repeat(3,minmax(0,1fr))]"
        >
          <FormValidationSummaryRhf
            errors={errors}
            className="sm:col-span-2 lg:col-span-3"
          />
          {renderTop ? (
            <div className="sm:col-span-2 lg:col-span-3">
              {renderTop({
                isEdit,
                item: isEdit && data ? unwrapData(data) : null,
              })}
            </div>
          ) : null}
          {fields.map((field) => (
            <div key={field.name} className={field.fullWidth ? 'sm:col-span-2 lg:col-span-3' : ''}>
              {renderField(field)}
            </div>
          ))}
          {renderExtra ? (
            <div className="sm:col-span-2 lg:col-span-3">
              {renderExtra({
                isEdit,
                item: isEdit && data ? unwrapData(data) : null,
              })}
            </div>
          ) : null}
          <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-3 pt-4 border-t border-[var(--clay-border)]">
            <Button type="submit" variant="primary" loading={mutation.isPending}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="cancel" onClick={() => navigate(basePath)}>
              Cancel
            </Button>
            <Button type="button" variant="ghost" onClick={() => reset()}>
              Reset
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export function ResourceDetailPage({
  title,
  breadcrumb,
  queryKey,
  getFn,
  basePath,
  fields,
  actions,
  renderExtra,
  renderTop,
}) {
  const { id } = useParams()
  const { data, isLoading, error } = useQuery({
    queryKey: [queryKey, id],
    queryFn: () => getFn(id),
  })

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message={getErrorMessage(error)} />

  const item = unwrapData(data)

  return (
    <div className="lms-page w-full">
      <Breadcrumb items={breadcrumb || [{ label: title, href: basePath }, { label: 'Details' }]} />
      <PageHeader
        title={`${title} Details`}
        actions={
          <>
            {actions?.(item)}
            <Button variant="back" onClick={() => window.history.back()}>Back</Button>
          </>
        }
      />
      <Card className="w-full">
        {renderTop?.(item)}
        <dl className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${renderTop ? 'mt-6 border-t border-border pt-6' : ''}`}>
          {fields.map((f) => (
            <div key={f.key}>
              <dt className="text-xs font-medium uppercase tracking-wider text-[var(--clay-primary-soft)]">{f.label}</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--clay-primary)]">
                {f.render ? f.render(item) : item[f.key] ?? '—'}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
      {renderExtra?.(item)}
    </div>
  )
}
