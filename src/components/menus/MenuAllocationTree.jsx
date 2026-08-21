import { memo, useMemo, useState } from 'react'
import { FiChevronDown, FiChevronRight, FiLink } from 'react-icons/fi'
import { cn } from '@/lib/utils'
import { resolveNavIcon } from '@/utils/navFromApi'
import { EmptyNavState } from '@/components/navigation/NavAdminUi'
import {
  getModuleCheckState,
  recomputeModuleEnabled,
  setMenuEnabled,
  setModuleEnabled,
  walkMenus,
} from '@/components/menus/menuAllocationUtils'

function TriStateCheckbox({ state, disabled, onChange, label }) {
  return (
    <label className={cn('inline-flex items-center gap-2', disabled ? 'opacity-50' : 'cursor-pointer')}>
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
        checked={state === 'checked'}
        ref={(el) => {
          if (el) el.indeterminate = state === 'indeterminate'
        }}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        aria-label={label}
      />
    </label>
  )
}

const MenuRows = memo(function MenuRows({
  menus,
  depth = 0,
  disabled,
  onMenuToggle,
}) {
  if (!menus?.length) return null

  return (
    <div>
      {menus.map((menu) => {
        const menuId = menu.menu_id || menu.id
        const Icon = resolveNavIcon(menu.icon)
        const outOfScope = menu.in_school_scope === false
        const rowDisabled = disabled || outOfScope

        return (
          <div key={menuId || menu.menu_code}>
            <div
              className={cn(
                'flex flex-wrap items-center gap-3 border-b border-border/40 px-4 py-2.5',
                outOfScope && 'bg-muted/20 text-muted-foreground',
              )}
              style={{ paddingLeft: `${16 + depth * 24}px` }}
            >
              <TriStateCheckbox
                state={menu.is_enabled !== false ? 'checked' : 'unchecked'}
                disabled={rowDisabled}
                label={menu.menu_name}
                onChange={(checked) => onMenuToggle(menu, checked)}
              />
              <Icon className="h-4 w-4 shrink-0 text-brand-600" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{menu.menu_name}</div>
                {menu.url ? (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FiLink className="h-3 w-3" />
                    {menu.url}
                  </div>
                ) : null}
              </div>
              {outOfScope ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">Not granted to school</span>
              ) : null}
            </div>
            <MenuRows
              menus={menu.children}
              depth={depth + 1}
              disabled={disabled}
              onMenuToggle={onMenuToggle}
            />
          </div>
        )
      })}
    </div>
  )
})

const ModuleSection = memo(function ModuleSection({
  module,
  disabled,
  onModuleToggle,
  onMenuToggle,
}) {
  const [open, setOpen] = useState(true)
  const moduleState = getModuleCheckState(module)
  const Icon = resolveNavIcon(module.icon)

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-border/60 bg-muted/20 px-4 py-3">
        <button
          type="button"
          className="rounded-md p-1 hover:bg-muted"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Collapse module' : 'Expand module'}
        >
          {open ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
        </button>
        <TriStateCheckbox
          state={moduleState}
          disabled={disabled}
          label={module.module_name}
          onChange={(checked) => onModuleToggle(module, checked)}
        />
        <Icon className="h-5 w-5 text-brand-600" />
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{module.module_name}</div>
          <div className="text-xs text-muted-foreground">{module.module_code}</div>
        </div>
      </div>
      {open ? (
        <MenuRows
          menus={module.menus}
          disabled={disabled}
          onMenuToggle={onMenuToggle}
        />
      ) : null}
    </div>
  )
})

export default function MenuAllocationTree({
  modules = [],
  onChange,
  disabled = false,
  emptyTitle = 'No modules found',
  emptyDescription = 'Create modules and menus in the Menu Master first.',
}) {
  const moduleList = useMemo(() => modules, [modules])

  if (!moduleList.length) {
    return <EmptyNavState title={emptyTitle} description={emptyDescription} />
  }

  const handleModuleToggle = (module, checked) => {
    setModuleEnabled(module, checked)
    onChange?.([...moduleList])
  }

  const handleMenuToggle = (menu, checked) => {
    setMenuEnabled(menu, checked)
    moduleList.forEach((module) => recomputeModuleEnabled(module))
    onChange?.([...moduleList])
  }

  return (
    <div className="space-y-4">
      {moduleList.map((module) => (
        <ModuleSection
          key={module.module_id || module.id}
          module={module}
          disabled={disabled}
          onModuleToggle={handleModuleToggle}
          onMenuToggle={handleMenuToggle}
        />
      ))}
    </div>
  )
}

export function selectAllModules(modules = [], enabled = true) {
  modules.forEach((module) => setModuleEnabled(module, enabled))
  return [...modules]
}
