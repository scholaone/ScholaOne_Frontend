import { Drawer } from '@/components/ui/Modal'

/** Side panel — LMS_School Sheet API mapped onto ScholaOne Drawer. */
export function Sheet({ open, onClose, title, description, children, maxWidth = 'xl' }) {
  return (
    <Drawer open={open} onClose={onClose} title={title} maxWidth={maxWidth}>
      {description ? <p className="page-description mb-4 -mt-2 text-sm font-normal text-black">{description}</p> : null}
      {children}
    </Drawer>
  )
}
