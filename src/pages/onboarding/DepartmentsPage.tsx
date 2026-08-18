import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Button, TextInput } from '../../components/ui'
import { StepFooter, StepHeader, DepartmentCard } from '../../components/onboarding'
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
  IconPlus,
} from '@tabler/icons-react'
import { useOnboarding, useAuth, getTenantSelectedDeptsKey, getTenantCustomDeptsKey } from '../../store'
import { departmentApi, tenantApi } from '../../api'

interface PredefinedDept {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
  iconBg: string
  iconColor: string
}

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

  const activeTenantId = tenantId || user?.tenantId || null
  const selectedDeptsKey = getTenantSelectedDeptsKey(activeTenantId)
  const customDeptsKey = getTenantCustomDeptsKey(activeTenantId)

  // Selected predefined departments (strictly tenant-scoped, defaults to empty)
  const [selectedPredefined, setSelectedPredefined] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(selectedDeptsKey)
      return stored ? (JSON.parse(stored) as string[]) : []
    } catch {
      return []
    }
  })

  // Custom user-created departments (strictly tenant-scoped, defaults to empty)
  const [customDepartments, setCustomDepartments] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(customDeptsKey)
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
        localStorage.setItem(selectedDeptsKey, JSON.stringify(next))
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
          localStorage.setItem(selectedDeptsKey, JSON.stringify(next))
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
        localStorage.setItem(customDeptsKey, JSON.stringify(next))
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
        localStorage.setItem(customDeptsKey, JSON.stringify(next))
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
      // Resolve tenantId
      let activeTenantId = tenantId || user?.tenantId || null
      if (!activeTenantId) {
        activeTenantId = await tenantApi.resolveActiveTenantId()
        if (activeTenantId) {
          setTenantId(activeTenantId)
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
      {/* Step Header component */}
      <StepHeader
        title="Departments"
        description="Select the departments in your organization. You can add more later."
        badge={`${totalSelectedCount} selected`}
      />

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 sm:text-sm">
          {error}
        </div>
      )}

      {/* Grid of predefined & custom department cards */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PREDEFINED_DEPARTMENTS.map((dept) => (
          <DepartmentCard
            key={dept.id}
            id={dept.id}
            name={dept.name}
            icon={dept.icon}
            iconBg={dept.iconBg}
            iconColor={dept.iconColor}
            isSelected={selectedPredefined.includes(dept.id)}
            onToggle={() => togglePredefined(dept.id)}
          />
        ))}

        {customDepartments.map((name) => (
          <DepartmentCard
            key={name}
            id={`custom-${name}`}
            name={name}
            isSelected={true}
            isCustom={true}
            onToggle={() => {}}
            onRemove={() => removeCustom(name)}
          />
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
