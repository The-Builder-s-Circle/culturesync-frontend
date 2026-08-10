import { useState } from 'react'
import { Button, SelectDropdown, TextInput } from '../../components/ui'
import { StepFooter } from '../../components/onboarding/StepFooter'
import { IconPlus, IconTrash, IconX } from '@tabler/icons-react'

const DEPARTMENTS = [
  'Engineering',
  'Product & Design',
  'Marketing',
  'Sales',
  'People & Culture',
  'Finance',
  'Operations',
  'Customer Success',
]

const DEFAULT_TITLES: Record<string, string[]> = {
  Engineering: ['Software Engineer', 'Senior Software Engineer', 'Engineering Manager'],
  'Product & Design': ['Product Designer', 'Product Manager'],
  Marketing: ['Marketing Manager'],
  Sales: ['Account Executive'],
  'People & Culture': ['HR Business Partner'],
  Finance: ['Accountant'],
  Operations: ['Operations Manager'],
  'Customer Success': ['Customer Success Manager'],
}

export default function JobTitles() {
  const [titles, setTitles] = useState<Record<string, string[]>>(DEFAULT_TITLES)
  const [draftDepartment, setDraftDepartment] = useState('')
  const [draftTitle, setDraftTitle] = useState('')

  const addTitle = () => {
    const dept = draftDepartment
    const title = draftTitle.trim()
    if (!dept || !title) return
    setTitles((prev) => ({ ...prev, [dept]: [...(prev[dept] ?? []), title] }))
    setDraftTitle('')
  }

  const removeTitle = (dept: string, title: string) =>
    setTitles((prev) => ({
      ...prev,
      [dept]: (prev[dept] ?? []).filter((t) => t !== title),
    }))

  const totalTitles = Object.values(titles).reduce((sum, list) => sum + list.length, 0)

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Job Titles
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
        Define the job titles used across your organization. Titles help route
        approvals, reviews, and permissions.
      </p>

      {/* Add title */}
      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
        <SelectDropdown
          label="Department"
          placeholder="Select department"
          options={DEPARTMENTS.map((d) => ({ label: d, value: d }))}
          value={draftDepartment}
          onChange={(e) => setDraftDepartment(e.target.value)}
          className="sm:max-w-[240px]"
        />
        <TextInput
          label="Job title"
          placeholder="e.g. Staff Engineer"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTitle()
            }
          }}
        />
        <div className="flex items-end">
          <Button
            variant="secondary"
            onClick={addTitle}
            disabled={!draftDepartment || !draftTitle.trim()}
          >
            <IconPlus className="size-4" aria-hidden="true" />
            Add title
          </Button>
        </div>
      </div>

      {/* Title groups */}
      <div className="mt-8 space-y-6">
        {Object.entries(titles)
          .filter(([, list]) => list.length > 0)
          .map(([dept, list]) => (
            <div key={dept}>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                {dept} · {list.length}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {list.map((title) => (
                  <span
                    key={title}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-1.5 pl-3 pr-2 text-sm font-medium text-slate-700"
                  >
                    {title}
                    <button
                      type="button"
                      onClick={() => removeTitle(dept, title)}
                      aria-label={`Remove ${title}`}
                      className="rounded-full p-0.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <IconX className="size-3.5" aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
      </div>

      {totalTitles > 0 && (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
          <IconTrash className="size-4 shrink-0" aria-hidden="true" />
          {totalTitles} job title{totalTitles === 1 ? '' : 's'} across your departments.
        </div>
      )}

      <StepFooter backTo="/onboarding/departments" continueTo="/onboarding/import" />
    </div>
  )
}
