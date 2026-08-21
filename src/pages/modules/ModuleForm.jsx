import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { moduleService } from '@/api/services'

const FIELDS = [
  { name: 'module_name', label: 'Module Name', type: 'text', required: true },
  { name: 'module_code', label: 'Module Code', type: 'text', required: true, readOnlyOnEdit: true },
  { name: 'icon', label: 'Icon', type: 'text' },
  { name: 'sequence', label: 'Sequence', type: 'number' },
  { name: 'is_active', label: 'Active', type: 'checkbox' },
]

function transformModuleLoad(item) {
  return {
    module_name: item.module_name || '',
    module_code: item.module_code || '',
    icon: item.icon || '',
    sequence: item.sequence ?? '',
    is_active: item.is_active ?? true,
  }
}

export default function ModuleForm() {
  return (
    <ResourceFormPage
      title="Module"
      queryKey="modules"
      getFn={moduleService.get}
      createFn={(data) => moduleService.create(data)}
      updateFn={moduleService.update}
      basePath="/modules"
      fields={FIELDS}
      transformLoad={transformModuleLoad}
      getCreateDefaults={() => ({ is_active: true })}
      renderTop={() => (
        <p className="text-sm text-muted-foreground">
          Modules belong to the ERP master catalog. School and organization assignment happens only in School Menu Allocation.
        </p>
      )}
    />
  )
}
