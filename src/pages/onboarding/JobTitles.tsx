import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../../components/ui'
import { StepFooter, StepHeader, JobTitleAccordion } from '../../components/onboarding'
import { IconCheck } from '@tabler/icons-react'
import {
  useOnboarding,
  useAuth,
  getTenantSelectedDeptsKey,
  getTenantCustomDeptsKey,
  getTenantJobTitlesKey,
} from '../../store'
import { jobTitleApi, tenantApi, getTenantLookup } from '../../api'

interface StoredDeptTitles {
  titles: string[]
  defaultTitles: string[]
  customTitles: string[]
}

export default function JobTitles() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { tenantId, setTenantId, markStepComplete } = useOnboarding()

  const activeTenantId = tenantId || user?.tenantId || null
  const selectedDeptsKey = getTenantSelectedDeptsKey(activeTenantId)
  const customDeptsKey = getTenantCustomDeptsKey(activeTenantId)
  const jobTitlesKey = getTenantJobTitlesKey(activeTenantId)

  // Canonical job titles come from the backend lookup - never hardcoded
  const [canonicalJobTitles, setCanonicalJobTitles] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    getTenantLookup()
      .then((res) => {
        if (!cancelled && (res.isSuccess || res.succeeded)) {
          const values = (res.data?.jobTitles ?? []).map((option) => option.value)
          if (values.length > 0) setCanonicalJobTitles(values)
        }
      })
      .catch(() => {
        // Lookup offline - suggestions stay hidden, manual entry still works
      })
    return () => {
      cancelled = true
    }
  }, [])

  // 1. Resolve departments chosen by user in previous onboarding step
  // (ids stored by DepartmentsPage are the canonical department names)
  const activeDepartments = useMemo<string[]>(() => {
    try {
      const storedPredefined = localStorage.getItem(selectedDeptsKey)
      const storedCustom = localStorage.getItem(customDeptsKey)

      const predefinedNames = storedPredefined
        ? (JSON.parse(storedPredefined) as string[])
        : []
      const customDepts = storedCustom ? (JSON.parse(storedCustom) as string[]) : []

      const merged = Array.from(new Set([...predefinedNames, ...customDepts]))
      if (merged.length > 0) return merged
    } catch {
      // fallback
    }
    return []
  }, [selectedDeptsKey, customDeptsKey])

  // 2. Department titles state (strictly tenant-scoped)
  const [deptTitles, setDeptTitles] = useState<Record<string, StoredDeptTitles>>(() => {
    try {
      const stored = localStorage.getItem(jobTitlesKey)
      if (stored) return JSON.parse(stored)
    } catch {
      // fallback
    }
    return {}
  })

  // 3. Open/collapsed accordion state
  const [openDepts, setOpenDepts] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    activeDepartments.forEach((dept, i) => {
      initial[dept] = i === 1 || activeDepartments.length === 1
    })
    return initial
  })

  // 4. Draft custom input per department
  const [draftInputs, setDraftInputs] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedTitlesCount, setSavedTitlesCount] = useState<number | null>(null)

  // Load already-saved titles from the backend so returning users see their progress
  useEffect(() => {
    let cancelled = false

    const loadExistingTitles = async () => {
      const resolvedTenantId = tenantId || user?.tenantId
      if (!resolvedTenantId) return

      try {
        const res = await jobTitleApi.getJobTitlesPaginated(resolvedTenantId, {
          pageNumber: 1,
          pageSize: 100,
        })
        if (!cancelled && Boolean(res.isSuccess || res.succeeded) && Array.isArray(res.data)) {
          setSavedTitlesCount(res.data.length)
        }
      } catch {
        // Non-blocking: onboarding continues with local state
      }
    }

    loadExistingTitles()
    return () => {
      cancelled = true
    }
  }, [tenantId, user?.tenantId])

  const toggleAccordion = (dept: string) => {
    setOpenDepts((prev) => ({ ...prev, [dept]: !prev[dept] }))
  }

  const persistTitles = useCallback(
    (next: Record<string, StoredDeptTitles>) => {
      try {
        localStorage.setItem(jobTitlesKey, JSON.stringify(next))
      } catch (e) {
        console.warn('Failed to persist job titles', e)
      }
    },
    [jobTitlesKey]
  )

  const addSuggestion = (dept: string, title: string) => {
    setDeptTitles((prev) => {
      const current = prev[dept] || { titles: [], defaultTitles: [], customTitles: [] }
      if (current.titles.includes(title)) return prev

      const next = {
        ...prev,
        [dept]: {
          titles: [...current.titles, title],
          defaultTitles: [...current.defaultTitles, title],
          customTitles: current.customTitles,
        },
      }
      persistTitles(next)
      return next
    })
  }

  const addCustomTitle = (dept: string) => {
    const trimmed = (draftInputs[dept] || '').trim()
    if (!trimmed) return

    setDeptTitles((prev) => {
      const current = prev[dept] || { titles: [], defaultTitles: [], customTitles: [] }
      if (current.titles.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
        return prev
      }

      const isStandard = canonicalJobTitles.some(
        (s) => s.toLowerCase() === trimmed.toLowerCase()
      )

      const next = {
        ...prev,
        [dept]: {
          titles: [...current.titles, trimmed],
          defaultTitles: isStandard
            ? [...current.defaultTitles, trimmed]
            : current.defaultTitles,
          customTitles: isStandard
            ? current.customTitles
            : [...current.customTitles, trimmed],
        },
      }
      persistTitles(next)
      return next
    })

    setDraftInputs((prev) => ({ ...prev, [dept]: '' }))
  }

  const removeTitle = (dept: string, title: string) => {
    setDeptTitles((prev) => {
      const current = prev[dept]
      if (!current) return prev

      const next = {
        ...prev,
        [dept]: {
          titles: current.titles.filter((t) => t !== title),
          defaultTitles: current.defaultTitles.filter((t) => t !== title),
          customTitles: current.customTitles.filter((t) => t !== title),
        },
      }
      persistTitles(next)
      return next
    })
  }

  const totalTitlesCount = useMemo(() => {
    return Object.values(deptTitles).reduce((sum, item) => sum + (item.titles?.length || 0), 0)
  }, [deptTitles])

  const handleSave = async () => {
    setError(null)
    if (totalTitlesCount === 0) {
      setError('Please add at least one job title to continue.')
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
        throw new Error('Tenant identifier not found. Please complete previous setup steps.')
      }

      const allDefaultTitles: string[] = []
      const allCustomTitles: string[] = []

      Object.values(deptTitles).forEach((d) => {
        d.defaultTitles?.forEach((t) => {
          if (!allDefaultTitles.includes(t)) allDefaultTitles.push(t)
        })
        d.customTitles?.forEach((t) => {
          if (!allCustomTitles.includes(t)) allCustomTitles.push(t)
        })
      })

      const payload = {
        defaultJobTitles: allDefaultTitles.map((name) => ({
          name,
          gradeLevel: null,
          description: null,
        })),
        customJobTitles: allCustomTitles.map((name) => ({
          name,
          gradeLevel: null,
          description: null,
        })),
      }

      const res = await jobTitleApi.createJobTitles(activeTenantId, payload)
      const isOk = Boolean(res.isSuccess || res.succeeded)

      if (isOk) {
        setIsSaved(true)
      } else {
        const msg =
          res.message ||
          res.messages?.join('. ') ||
          (Array.isArray(res.errors) && res.errors.length > 0
            ? res.errors.join('. ')
            : undefined) ||
          'Failed to save job titles. Please try again.'
        setError(msg)
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save job titles. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinue = () => {
    markStepComplete('job-titles')
    navigate('/onboarding/import')
  }

  return (
    <div>
      {/* Header */}
      <StepHeader
        title="Job titles"
        description="Add job titles for each department. We pre-populated suggestions you can customize."
      />

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 sm:text-sm">
          {error}
        </div>
      )}

      {savedTitlesCount !== null && savedTitlesCount > 0 && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 sm:text-sm">
          You have {savedTitlesCount} job title{savedTitlesCount === 1 ? '' : 's'} already
          saved. Review and update them below before continuing.
        </div>
      )}

      {/* Accordion List for each user-selected Department */}
      {activeDepartments.length === 0 ? (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 sm:text-sm">
          No departments selected yet. Go back to the departments step and pick at least one
          before adding job titles.
        </div>
      ) : (
        <div className="mt-8 space-y-3.5">
          {activeDepartments.map((dept) => {
          const isOpen = Boolean(openDepts[dept])
          const currentTitles = deptTitles[dept]?.titles || []
          const suggestions = canonicalJobTitles.filter((s) => !currentTitles.includes(s))

          return (
            <JobTitleAccordion
              key={dept}
              department={dept}
              titles={currentTitles}
              suggestions={suggestions}
              isOpen={isOpen}
              draftInput={draftInputs[dept] || ''}
              onToggle={() => toggleAccordion(dept)}
              onAddSuggestion={(s) => addSuggestion(dept, s)}
              onAddCustom={() => addCustomTitle(dept)}
              onDraftChange={(val) =>
                setDraftInputs((prev) => ({ ...prev, [dept]: val }))
              }
              onRemoveTitle={(t) => removeTitle(dept, t)}
            />
          )
        })}
        </div>
      )}

      <div className="mt-6">
        <Button
          variant="secondary"
          disabled={totalTitlesCount === 0 || isSaved}
          isLoading={isSubmitting}
          onClick={handleSave}
          className="w-full sm:w-auto"
        >
          {isSaved ? (
            <>
              <IconCheck className="size-4" aria-hidden="true" />
              Job titles saved
            </>
          ) : (
            'Save job titles'
          )}
        </Button>
      </div>

      {/* Footer Navigation */}
      <StepFooter
        backTo="/onboarding/departments"
        onContinue={handleContinue}
        continueDisabled={!isSaved}
      />
    </div>
  )
}
