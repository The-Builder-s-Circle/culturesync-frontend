import { useState } from 'react'
import { Button, SelectDropdown, TextInput } from '../../components/ui'
import { StepFooter } from '../../components/onboarding/StepFooter'
import { IconMail, IconPlus, IconTrash, IconUsersGroup } from '@tabler/icons-react'

interface InviteRow {
  id: string
  email: string
  role: string
}

export default function InviteTeamPage() {
  const [rows, setRows] = useState<InviteRow[]>([
    { id: 'invite-1', email: '', role: '' },
  ])

  const addRow = () =>
    setRows((prev) => [...prev, { id: `invite-${Date.now()}`, email: '', role: '' }])

  const updateRow = (id: string, field: keyof InviteRow, value: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))

  const removeRow = (id: string) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev))

  const validCount = rows.filter((r) => r.email.trim() && r.role).length

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Invite Team
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
        Invite your teammates so they can access CultureSync once you're set up.
        Each person gets a personalized welcome.
      </p>

      <div className="mt-8 space-y-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end"
          >
            <TextInput
              label="Work email"
              placeholder="name@company.com"
              type="email"
              value={row.email}
              onChange={(e) => updateRow(row.id, 'email', e.target.value)}
              className="sm:flex-1"
            />
            <SelectDropdown
              label="Role"
              placeholder="Select role"
              options={[
                { label: 'Admin', value: 'admin' },
                { label: 'HR Manager', value: 'hr-manager' },
                { label: 'Manager', value: 'manager' },
                { label: 'Member', value: 'member' },
              ]}
              value={row.role}
              onChange={(e) => updateRow(row.id, 'role', e.target.value)}
              className="sm:w-48"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                disabled={rows.length <= 1}
                aria-label="Remove invite"
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
              >
                <IconTrash className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Button variant="ghost" onClick={addRow}>
          <IconPlus className="size-4" aria-hidden="true" />
          Add another invite
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
        <IconMail className="size-4 shrink-0" aria-hidden="true" />
        {validCount > 0
          ? `${validCount} invite${validCount === 1 ? '' : 's'} ready to send.`
          : 'No invites yet — you can skip this and invite people later from the dashboard.'}
      </div>

      <div className="mt-8 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
        <IconUsersGroup className="size-4 shrink-0 text-indigo-500" aria-hidden="true" />
        Invites are sent after you complete setup. Admins manage all roles and
        permissions from Settings.
      </div>

      <StepFooter backTo="/onboarding/import" continueTo="/onboarding/hr-config" />
    </div>
  )
}
