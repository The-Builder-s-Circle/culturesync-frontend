import { useState } from 'react'
import { Button, TextInput } from '../../components/ui'
import { StepFooter } from '../../components/onboarding/StepFooter'
import { IconPlus, IconTrash, IconUsersGroup } from '@tabler/icons-react'

interface Department {
  id: string
  name: string
  color: string
}

const COLORS = [
  'bg-indigo-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-sky-500',
  'bg-teal-500',
  'bg-pink-500',
]

const DEFAULTS: Department[] = [
  { id: 'dept-1', name: 'Engineering', color: 'bg-indigo-500' },
  { id: 'dept-2', name: 'Product & Design', color: 'bg-violet-500' },
  { id: 'dept-3', name: 'Marketing', color: 'bg-emerald-500' },
  { id: 'dept-4', name: 'Sales', color: 'bg-amber-500' },
  { id: 'dept-5', name: 'People & Culture', color: 'bg-rose-500' },
  { id: 'dept-6', name: 'Finance', color: 'bg-sky-500' },
  { id: 'dept-7', name: 'Operations', color: 'bg-teal-500' },
  { id: 'dept-8', name: 'Customer Success', color: 'bg-pink-500' },
]

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>(DEFAULTS)
  const [draftName, setDraftName] = useState('')

  const addDepartment = () => {
    const name = draftName.trim()
    if (!name) return
    const color = COLORS[departments.length % COLORS.length]
    setDepartments((prev) => [...prev, { id: `dept-${Date.now()}`, name, color }])
    setDraftName('')
  }

  const removeDepartment = (id: string) =>
    setDepartments((prev) => prev.filter((d) => d.id !== id))

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Departments
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
        Add the departments that make up your organization. You can manage these
        later from Settings.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="dept-card flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className={`size-2.5 shrink-0 rounded-full ${dept.color}`} />
              <span className="truncate text-sm font-semibold text-slate-800">
                {dept.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeDepartment(dept.id)}
              aria-label={`Remove ${dept.name}`}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <IconTrash className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))}

        {/* Add department */}
        <div className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white p-3">
          <TextInput
            placeholder="Add a department"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addDepartment()
              }
            }}
          />
          <Button variant="secondary" onClick={addDepartment} disabled={!draftName.trim()}>
            <IconPlus className="size-4" aria-hidden="true" />
            Add
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
        <IconUsersGroup className="size-4 shrink-0" aria-hidden="true" />
        {departments.length} department{departments.length === 1 ? '' : 's'} configured.
        You can always add more later.
      </div>

      <StepFooter backTo="/onboarding/organization" continueTo="/onboarding/job-titles" />
    </div>
  )
}
