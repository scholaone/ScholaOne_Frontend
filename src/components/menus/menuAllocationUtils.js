export function countMenus(menus = []) {
  return menus.reduce((acc, menu) => acc + 1 + countMenus(menu.children), 0)
}

export function walkMenus(menus = [], visitor, depth = 0) {
  menus.forEach((menu) => {
    visitor(menu, depth)
    if (menu.children?.length) walkMenus(menu.children, visitor, depth + 1)
  })
}

export function cloneModules(modules = []) {
  return modules.map((module) => ({
    ...module,
    menus: cloneMenus(module.menus),
  }))
}

function cloneMenus(menus = []) {
  return (menus || []).map((menu) => ({
    ...menu,
    children: cloneMenus(menu.children),
  }))
}

export function collectMenuStates(modules = []) {
  const menus = []
  modules.forEach((module) => {
    walkMenus(module.menus, (menu) => {
      menus.push({
        menu_id: menu.menu_id || menu.id,
        is_enabled: menu.is_enabled !== false && menu.in_school_scope !== false,
      })
    })
  })
  return menus
}

export function collectModuleStates(modules = []) {
  return modules.map((module) => ({
    module_id: module.module_id || module.id,
    is_enabled: module.is_enabled !== false,
  }))
}

export function buildSyncPayload(modules = []) {
  return {
    modules: collectModuleStates(modules),
    menus: collectMenuStates(modules),
  }
}

export function getModuleCheckState(module) {
  const enabled = []
  const disabled = []
  walkMenus(module.menus, (menu) => {
    if (menu.in_school_scope === false) return
    if (menu.is_enabled !== false) enabled.push(menu)
    else disabled.push(menu)
  })

  if (!enabled.length && !disabled.length) {
    return module.is_enabled !== false ? 'checked' : 'unchecked'
  }
  if (enabled.length && !disabled.length) return 'checked'
  if (!enabled.length && disabled.length) return 'unchecked'
  return 'indeterminate'
}

export function setModuleEnabled(module, enabled) {
  module.is_enabled = enabled
  walkMenus(module.menus, (menu) => {
    if (menu.in_school_scope === false) return
    menu.is_enabled = enabled
  })
}

export function setMenuEnabled(menu, enabled) {
  menu.is_enabled = enabled
}

export function recomputeModuleEnabled(module) {
  let anyEnabled = false
  walkMenus(module.menus, (menu) => {
    if (menu.in_school_scope === false) return
    if (menu.is_enabled !== false) anyEnabled = true
  })
  module.is_enabled = anyEnabled
}
