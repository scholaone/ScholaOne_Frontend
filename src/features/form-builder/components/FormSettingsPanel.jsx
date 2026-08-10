import { FiSettings } from 'react-icons/fi'
import RichTextEditor from './RichTextEditor'

export default function FormSettingsPanel({ form, onChange, onClose }) {
  const updateSettings = (patch) => {
    onChange({ ...form, settings: { ...form.settings, ...patch } })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiSettings className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-semibold">Form Settings</h3>
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
            Close
          </button>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Submit button label</label>
        <input
          value={form.settings?.submitLabel || 'Submit'}
          onChange={(e) => updateSettings({ submitLabel: e.target.value })}
          className="w-full rounded-lg border border-input px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Thank you message</label>
        <RichTextEditor
          value={form.settings?.thankYouMessage || ''}
          onChange={(html) => updateSettings({ thankYouMessage: html })}
          placeholder="Thank you! Your response has been submitted."
          minHeight={80}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Form description (internal note)</label>
        <textarea
          rows={2}
          value={form.description || ''}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          placeholder="Optional note for admins"
          className="w-full rounded-lg border border-input px-3 py-2 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.settings?.showBranding !== false}
          onChange={(e) => updateSettings({ showBranding: e.target.checked })}
          className="rounded text-brand-600"
        />
        Show &quot;Powered by ScholaOne&quot; on public form
      </label>
    </div>
  )
}
