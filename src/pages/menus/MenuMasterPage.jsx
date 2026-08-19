import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiChevronDown, FiChevronRight, FiEdit2, FiLink, FiPlus } from 'react-icons/fi'
import { menuService } from '@/api/services'
import { unwrapData } from '@/api/client'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ErrorState, PageLoader } from '@/components/ui/Feedback'
import { resolveNavIcon } from '@/utils/navFromApi'
import { cn } from '@/lib/utils'
import {
  NavAdminHeader,
  NavPageShell,
  NavScopeBar,
  NavStatPill,
  EmptyNavState,
} from '@/components/navigation/NavAdminUi'
import { countMenus } from '@/components/menus/menuAllocationUtils'

function MasterMenuRows({ menus, depth = 0 }) {
  if (!menus?.length) return null
  return (
    <div>
      {menus.map((menu) => {
        const menuId = menu.menu_id || menu.id
        const Icon = resolveNavIcon(menu.icon)
        return (
          <div key={menuId || menu.menu_code}>
            <div
              className="flex flex-wrap items-center gap-3 border-b border-border/40 px-4 py-2.5"
              style={{ paddingLeft: `${16 + depth * 24}px` }}
            >
              <Icon className="h-4 w-4 text-brand-600" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{menu.menu_name}</div>
                <div className="text-xs text-muted-foreground">{menu.menu_code}</div>
                {menu.url ? (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FiLink className="h-3 w-3" />
                    {menu.url}
                  </div>
                ) : null}
              </div>
              <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', menu.is_active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-muted text-muted-foreground')}>
                {menu.is_active !== false ? 'Active' : 'Inactive'}
              </span>
              <Link to={`/menus/${menuId}/edit`}>
                <Button variant="ghost" size="sm"><FiEdit2 className="h-4 w-4" /></Button>
              </Link>
            </div>
            <MasterMenuRows menus={menu.children} depth={depth + 1} />
          </div>
        )
      })}
    </div>
  )
}

function MasterModuleSection({ module }) {
  const [open, setOpen] = useState(true)
  const Icon = resolveNavIcon(module.icon)
  const moduleId = module.module_id || module.id

  return (
    <Card className="overflow-hidden border-border/70">
      <div className="flex flex-wrap items-center gap-3 border-b border-border/60 bg-muted/20 px-4 py-3">
        <button type="button" className="rounded-md p-1 hover:bg-muted" onClick={() => setOpen((v) => !v)}>
          {open ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
        </button>
        <Icon className="h-5 w-5 text-brand-600" />
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{module.module_name}</div>
          <div className="text-xs text-muted-foreground">{module.module_code}</div>
        </div>
        <Link to={`/modules/${moduleId}/edit`}>
          <Button variant="ghost" size="sm"><FiEdit2 className="h-4 w-4" /></Button>
        </Link>
        <Link to={`/menus/new?module=${moduleId}`}>
          <Button variant="outline" size="sm"><FiPlus className="mr-1 h-4 w-4" />Menu</Button>
        </Link>
      </div>
      {open ? <MasterMenuRows menus={module.menus} /> : null}
    </Card>
  )
}

export default function MenuMasterPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['menus', 'master-tree', 'platform'],
    queryFn: () => menuService.masterTree(),
  })

  const payload = unwrapData(data)
  const modules = payload?.modules || []
  const stats = useMemo(() => ({
    modules: modules.length,
    menus: modules.reduce((acc, module) => acc + countMenus(module.menus), 0),
  }), [modules])

  return (
    <NavPageShell>
      <NavAdminHeader
        activeTab="master"
        actions={(
          <>
            <Link to="/modules/new"><Button variant="outline"><FiPlus className="mr-2 h-4 w-4" />Module</Button></Link>
            <Link to="/menus/new"><Button><FiPlus className="mr-2 h-4 w-4" />Menu</Button></Link>
          </>
        )}
      />

      <NavScopeBar hint="Menu Master is the ERP-wide navigation catalog. It is independent of schools and tenant organizations. Use School Menu Allocation to grant menus to schools.">
        <div className="flex flex-wrap gap-2">
          <NavStatPill label="Modules" value={stats.modules} />
          <NavStatPill label="Menus" value={stats.menus} tone="success" />
        </div>
      </NavScopeBar>

      {isLoading ? <PageLoader /> : null}
      {isError ? <ErrorState onRetry={refetch} /> : null}
      {!isLoading && !isError && !modules.length ? (
        <EmptyNavState title="No menu master data yet" description="Create your first module to begin building the ERP navigation catalog." />
      ) : null}
      {!isLoading && !isError && modules.length ? (
        <div className="space-y-4">
          {modules.map((module) => (
            <MasterModuleSection key={module.module_id || module.id} module={module} />
          ))}
        </div>
      ) : null}
    </NavPageShell>
  )
}
