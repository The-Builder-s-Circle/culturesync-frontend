import { useState, useEffect } from 'react'
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
  IconLoader2,
  IconPlus,
  IconCheck,
} from '@tabler/icons-react'
import { useOnboarding, useAuth, getTenantSelectedDeptsKey, getTenantCustomDeptsKey } from '../../store'
import { departmentApi, tenantApi, getTenantLookup } from '../../api'
import type { LookupOption } from '../../api'

type DeptIcon = React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>

interface PredefinedDept {
  id: string
  name: string
  icon: DeptIcon
  iconBg: string
  iconColor: string
}

const DEPT_STYLE_BY_NAME: Record<string, { icon: DeptIcon; iconBg: string; iconColor: string }> = {
  Engineering: { icon: IconSettings, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  'Human Resources': { icon: IconUsers, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  'Sales & Revenue': { icon: IconChartLine, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  Marketing: { icon: IconSpeakerphone, iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
  'Finance & Accounting': { icon: IconCreditCard, iconBg: 'bg-cyan-100', iconColor: 'text-cyan-700' },
  'Customer Support': { icon: IconHeartHandshake, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  Operations: { icon: IconTool, iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
  'Business Development': { icon: IconWorld, iconBg: 'bg-teal-100', iconColor: 'text-teal-600' },
  'Legal & Compliance': { icon: IconScale, iconBg: 'bg-amber-100', iconColor: 'text-amber-700' },
  Executive: { icon: IconBuildingSkyscraper, iconBg: 'bg-slate-100', iconColor: 'text-slate-700' },
  'Data & Analytics': { icon: IconChartBar, iconBg: 'bg-pink-100', iconColor: 'text-pink-600' },
  Security: { icon: IconShield, iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
  'IT & Infrastructure': { icon: IconDeviceDesktop, iconBg: 'bg-sky-100', iconColor: 'text-sky-600' },
  'Research & Development': { icon: IconMicroscope, iconBg: 'bg-purple-100', iconColor: 'text-purple-700' },
}

const DEFAULT_DEPT_STYLE = { icon: IconPalette, iconBg: 'bg-slate-100', iconColor: 'text-slate-600' }

function toPredefinedDepts(options: LookupOption[]): PredefinedDept[] {
  return options.map((option) => ({
    id: option.value,
    name: option.label || option.value,
    ...(DEPT_STYLE_BY_NAME[option.value] ?? DEFAULT_DEPT_STYLE),
  }))
}

export default function DepartmentsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { tenantId, setTenantId, markStepComplete } = useOnboarding()

  const activeTenantId = tenantId || user?.tenantId || null
  const selectedDeptsKey = getTenantSelectedDeptsKey(activeTenantId)
  const customDeptsKey = getTenantCustomDeptsKey(activeTenantId)

  const [predefinedDepartments, setPredefinedDepartments] = useState<PredefinedDept[]>([])
  const [isLoadingLookup, setIsLoadingLookup] = useState(true)

  useEffect(() => {
    let cancelled = false
    getTenantLookup()
      .then((res) => {
        if (!cancelled && (res.isSuccess || res.succeeded) && Array.isArray(res.data?.departments)) {
          setPredefinedDepartments(toPredefinedDepts(res.data!.departments!))
        }
      })
      .catch(() => {
        // Lookup offline - custom departments remain available
      })
      .finally(() => {
        if (!cancelled) setIsLoadingLookup(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

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
  const [isSaved, setIsSaved] = useState(false)
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
    const match = predefinedDepartments.find(
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

  const handleSave = async () => {
    setError(null)
    if (totalSelectedCount === 0) {
      setError('Please select or add at least one department.')
      return
    }

    setIsSubmitting(true)
    try {
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

      const defaultDepartmentsPayload = predefinedDepartments
        .filter((d) => selectedPredefined.includes(d.id))
        .map((d) => ({
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
        setIsSaved(true)
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

  const handleContinue = () => {
    markStepComplete('departments')
    navigate('/onboarding/job-titles')
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
        {isLoadingLookup && (
          <div className="col-span-full flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            <IconLoader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading departments...
          </div>
        )}

        {predefinedDepartments.map((dept) => (
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

      <div className="mt-6">
        <Button
          variant="secondary"
          disabled={totalSelectedCount === 0 || isSaved}
          isLoading={isSubmitting}
          onClick={handleSave}
          className="w-full sm:w-auto"
        >
          {isSaved ? (
            <>
              <IconCheck className="size-4" aria-hidden="true" />
              Departments saved
            </>
          ) : (
            'Save departments'
          )}
        </Button>
      </div>

      {/* Footer navigation */}
      <StepFooter
        backTo="/onboarding/organization"
        onContinue={handleContinue}
        continueDisabled={!isSaved}
      />
    </div>
  )
}
