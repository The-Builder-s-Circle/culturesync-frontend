import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Button, TextInput } from '../../components/ui'
import { StepFooter } from '../../components/onboarding/StepFooter'
import {
  IconSettings,
  IconPalette,
  IconChartLine,
  IconSpeakerphone,
  IconUsers,
  IconCreditCard,
  IconHeartHandshake,
  IconScale,
  IconTool,
  IconBuildingSkyscraper,
  IconChartBar,
  IconShield,
  IconDeviceDesktop,
  IconMicroscope,
  IconWorld,
  IconCheck,
  IconPlus,
  IconTrash,
  IconBuilding,
} from '@tabler/icons-react'
import { useOnboarding, useAuth } from '../../store'
import { departmentApi, tenantApi } from '../../api'

interface PredefinedDept {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
  iconBg: string
  iconColor: string
}

const STORAGE_SELECTED_DEPTS_KEY = 'culturesync_selected_departments'
const STORAGE_CUSTOM_DEPTS_KEY = 'culturesync_custom_departments'

const PREDEFINED_DEPARTMENTS: PredefinedDept[] = [
  { id: 'eng', name: 'Engineering', icon: IconSettings, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  { id: 'prod', name: 'Product & Design', icon: IconPalette, iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
  { id: 'sales', name: 'Sales & Revenue', icon: IconChartLine, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { id: 'mkt', name: 'Marketing', icon: IconSpeakerphone, iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
  { id: 'hr', name: 'Human Resources', icon: IconUsers, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { id: 'fin', name: 'Finance & Accounting', icon: IconCreditCard, iconBg: 'bg-cyan-100', iconColor: 'text-cyan-700' },
  { id: 'cs', name: 'Customer Success', icon: IconHeartHandshake, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { id: 'legal', name: 'Legal & Compliance', icon: IconScale, iconBg: 'bg-amber-100', iconColor: 'text-amber-700' },
  { id: 'ops', name: 'Operations', icon: IconTool, iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
  { id: 'exec', name: 'Executive', icon: IconBuildingSkyscraper, iconBg: 'bg-slate-100', iconColor: 'text-slate-700' },
  { id: 'data', name: 'Data & Analytics', icon: IconChartBar, iconBg: 'bg-pink-100', iconColor: 'text-pink-600' },
  { id: 'sec', name: 'Security', icon: IconShield, iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
  { id: 'it', name: 'IT & Infrastructure', icon: IconDeviceDesktop, iconBg: 'bg-sky-100', iconColor: 'text-sky-600' },
  { id: 'rd', name: 'Research & Development', icon: IconMicroscope, iconBg: 'bg-purple-100', iconColor: 'text-purple-700' },
  { id: 'biz', name: 'Business Development', icon: IconWorld, iconBg: 'bg-teal-100', iconColor: 'text-teal-600' },
]

export default function DepartmentsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { tenantId, setTenantId, markStepComplete } = useOnboarding()

  // Selected predefined departments (defaults to 0 selected or restores from localStorage)
  const [selectedPredefined, setSelectedPredefined] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SELECTED_DEPTS_KEY)
      return stored ? (JSON.parse(stored) as string[]) : []
    } catch {
      return []
    }
  })

  // Custom user-created departments (restores from localStorage)
  const [customDepartments, setCustomDepartments] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_CUSTOM_DEPTS_KEY)
      return stored ? (JSON.parse(stored) as string[]) : []
    } catch {
      return []
    }
  })

  const [draftName, setDraftName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const togglePredefined = (id: string) => {
    setSelectedPredefined((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      try {
        localStorage.setItem(STORAGE_SELECTED_DEPTS_KEY, JSON.stringify(next))
      } catch (e) {
        console.warn('Failed to save selected departments', e)
      }
      return next
    })
  }

  const handleAddCustom = (e?: FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = draftName.trim()
    if (!trimmed) return

    // Check if matches an existing predefined department name
    const match = PREDEFINED_DEPARTMENTS.find(
      (d) => d.name.toLowerCase() === trimmed.toLowerCase()
    )
    if (match) {
      if (!selectedPredefined.includes(match.id)) {
        setSelectedPredefined((prev) => {
          const next = [...prev, match.id]
          localStorage.setItem(STORAGE_SELECTED_DEPTS_KEY, JSON.stringify(next))
          return next
        })
      }
      setDraftName('')
      return
    }

    if (customDepartments.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
      setDraftName('')
      return
    }

    setCustomDepartments((prev) => {
      const next = [...prev, trimmed]
      try {
        localStorage.setItem(STORAGE_CUSTOM_DEPTS_KEY, JSON.stringify(next))
      } catch (e) {
        console.warn('Failed to save custom departments', e)
      }
      return next
    })
    setDraftName('')
  }

  const removeCustom = (name: string) => {
    setCustomDepartments((prev) => {
      const next = prev.filter((d) => d !== name)
      try {
        localStorage.setItem(STORAGE_CUSTOM_DEPTS_KEY, JSON.stringify(next))
      } catch (e) {
        console.warn('Failed to update custom departments', e)
      }
      return next
    })
  }

  const totalSelectedCount = selectedPredefined.length + customDepartments.length

  const handleContinue = async () => {
    setError(null)
    if (totalSelectedCount === 0) {
      setError('Please select or add at least one department.')
      return
    }

    setIsSubmitting(true)
    try {
      // Resolve tenantId if missing
      let activeTenantId: string | null = tenantId || user?.tenantId || null
      if (!activeTenantId) {
        const lookup = await tenantApi.lookup()
        const lookupData = lookup.data as { tenantId?: string; id?: string } | undefined
        const resolvedId = lookupData?.tenantId || lookupData?.id || null
        if (resolvedId) {
          activeTenantId = resolvedId
          setTenantId(resolvedId)
        }
      }

      if (!activeTenantId) {
        throw new Error('Tenant identifier not found. Please complete the organization step first.')
      }

      const defaultDepartmentsPayload = PREDEFINED_DEPARTMENTS.filter((d) =>
        selectedPredefined.includes(d.id)
      ).map((d) => ({
        name: d.name,
        description: null,
        managerId: null,
      }))

      const customDepartmentsPayload = customDepartments.map((name) => ({
        name,
        description: null,
        managerId: null,
      }))

      const payload = {
        defaultDepartments: defaultDepartmentsPayload,
        customDepartments: customDepartmentsPayload,
      }

      const res = await departmentApi.createDepartments(activeTenantId, payload)
      const isOk = Boolean(res.succeeded || res.isSuccess)

      if (isOk) {
        if (res.data && Array.isArray(res.data)) {
          localStorage.setItem('culturesync_department_ids', JSON.stringify(res.data))
        }
        markStepComplete('departments')
        navigate('/onboarding/job-titles')
      } else {
        const msg =
          (res.messages && res.messages.join('. ')) ||
          res.message ||
          'Failed to save departments. Please try again.'
        setError(msg)
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save departments. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Departments
          </h2>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Select the departments in your organization. You can add more later.
          </p>
        </div>
        <div className="shrink-0">
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {totalSelectedCount} selected
          </span>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 sm:text-sm">
          {error}
        </div>
      )}

      {/* Grid of predefined departments */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PREDEFINED_DEPARTMENTS.map((dept) => {
          const isSelected = selectedPredefined.includes(dept.id)
          const Icon = dept.icon

          return (
            <button
              key={dept.id}
              type="button"
              onClick={() => togglePredefined(dept.id)}
              className={`group flex items-center justify-between rounded-2xl p-3.5 text-left transition-all duration-150 ${
                isSelected
                  ? 'border-2 border-indigo-600 bg-indigo-50/40 shadow-xs'
                  : 'border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ${dept.iconBg} ${dept.iconColor}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <span
                  className={`truncate text-sm font-semibold transition-colors ${
                    isSelected ? 'text-indigo-600' : 'text-slate-800'
                  }`}
                >
                  {dept.name}
                </span>
              </div>

              {isSelected && (
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xs">
                  <IconCheck className="size-3.5 stroke-[3]" aria-hidden="true" />
                </div>
              )}
            </button>
          )
        })}

        {/* Custom departments rendered alongside */}
        {customDepartments.map((name) => (
          <div
            key={name}
            className="group flex items-center justify-between rounded-2xl border-2 border-indigo-600 bg-indigo-50/40 p-3.5 shadow-xs"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <IconBuilding className="size-5" aria-hidden="true" />
              </div>
              <span className="truncate text-sm font-semibold text-indigo-600">{name}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xs">
                <IconCheck className="size-3.5 stroke-[3]" aria-hidden="true" />
              </div>
              <button
                type="button"
                onClick={() => removeCustom(name)}
                aria-label={`Remove ${name}`}
                className="rounded-lg p-1 text-slate-400 opacity-70 transition-colors hover:bg-red-100 hover:text-red-600 hover:opacity-100"
              >
                <IconTrash className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add custom department input */}
      <form onSubmit={handleAddCustom} className="mt-4 flex items-center gap-2">
        <div className="flex-1">
          <TextInput
            placeholder="Add custom department..."
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          variant="secondary"
          disabled={!draftName.trim()}
          className="shrink-0"
        >
          <IconPlus className="size-4" aria-hidden="true" />
          Add
        </Button>
      </form>

      {/* Footer navigation */}
      <StepFooter
        backTo="/onboarding/organization"
        onContinue={handleContinue}
        continueDisabled={totalSelectedCount === 0}
        isLoading={isSubmitting}
      />
    </div>
  )
}
