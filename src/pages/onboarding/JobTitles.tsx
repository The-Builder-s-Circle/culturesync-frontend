import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { StepFooter, StepHeader, JobTitleAccordion } from '../../components/onboarding'
import {
  useOnboarding,
  useAuth,
  getTenantSelectedDeptsKey,
  getTenantCustomDeptsKey,
  getTenantJobTitlesKey,
} from '../../store'
import { jobTitleApi, tenantApi } from '../../api'

const PREDEFINED_ID_TO_NAME: Record<string, string> = {
  eng: 'Engineering',
  prod: 'Product & Design',
  sales: 'Sales & Revenue',
  mkt: 'Marketing',
  hr: 'Human Resources',
  fin: 'Finance & Accounting',
  cs: 'Customer Success',
  legal: 'Legal & Compliance',
  ops: 'Operations',
  exec: 'Executive',
  data: 'Data & Analytics',
  sec: 'Security',
  it: 'IT & Infrastructure',
  rd: 'Research & Development',
  biz: 'Business Development',
}

const DEPARTMENT_TITLE_SUGGESTIONS: Record<string, string[]> = {
  'Engineering': [
    'Software Engineer',
    'Senior Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'DevOps Engineer',
    'Engineering Manager',
    'QA Engineer',
    'Tech Lead',
    'VP of Engineering',
    'CTO',
  ],
  'Product & Design': [
    'Product Manager',
    'Senior Product Manager',
    'Product Designer',
    'UI/UX Designer',
    'Design Lead',
    'Head of Product',
  ],
  'Sales & Revenue': [
    'Sales Representative',
    'Account Executive',
    'Senior Account Executive',
    'Sales Manager',
    'Business Development Manager',
    'Director of Sales',
    'VP of Sales',
    'Chief Revenue Officer',
  ],
  'Marketing': [
    'Marketing Specialist',
    'Content Strategist',
    'Growth Marketer',
    'SEO Specialist',
    'Marketing Manager',
    'Director of Marketing',
    'CMO',
  ],
  'Human Resources': [
    'HR Specialist',
    'HR Generalist',
    'Talent Acquisition Specialist',
    'People Operations Lead',
    'HR Manager',
    'Head of People',
  ],
  'Finance & Accounting': [
    'Accountant',
    'Financial Analyst',
    'Senior Accountant',
    'Accounting Manager',
    'Finance Director',
    'Controller',
    'CFO',
  ],
  'Customer Success': [
    'Customer Support Specialist',
    'Customer Success Manager',
    'Implementation Specialist',
    'Customer Support Lead',
    'Director of Customer Success',
  ],
  'Legal & Compliance': [
    'Legal Counsel',
    'Compliance Officer',
    'Senior Legal Counsel',
    'Head of Compliance',
    'General Counsel',
  ],
  'Operations': [
    'Operations Coordinator',
    'Operations Manager',
    'Director of Operations',
    'COO',
  ],
  'Executive': [
    'CEO',
    'Chief Operating Officer',
    'Chief Technology Officer',
    'Chief Financial Officer',
    'Managing Director',
  ],
  'Data & Analytics': [
    'Data Analyst',
    'Data Scientist',
    'BI Analyst',
    'Data Engineer',
    'Head of Data',
  ],
  'Security': [
    'Security Analyst',
    'Cybersecurity Engineer',
    'Information Security Manager',
    'CISO',
  ],
  'IT & Infrastructure': [
    'IT Support Specialist',
    'Systems Administrator',
    'Network Engineer',
    'IT Manager',
    'Head of IT',
  ],
  'Research & Development': [
    'R&D Specialist',
    'Research Scientist',
    'R&D Engineer',
    'Head of R&D',
  ],
  'Business Development': [
    'Business Development Representative',
    'Partnership Manager',
    'Strategic Accounts Manager',
    'Director of Business Development',
  ],
}

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

  // 1. Resolve departments chosen by user in previous onboarding step
  const activeDepartments = useMemo<string[]>(() => {
    try {
      const storedPredefined = localStorage.getItem(selectedDeptsKey)
      const storedCustom = localStorage.getItem(customDeptsKey)

      const predefinedIds = storedPredefined ? (JSON.parse(storedPredefined) as string[]) : []
      const customDepts = storedCustom ? (JSON.parse(storedCustom) as string[]) : []

      const predefinedNames = predefinedIds
        .map((id) => PREDEFINED_ID_TO_NAME[id])
        .filter(Boolean)

      const merged = Array.from(new Set([...predefinedNames, ...customDepts]))
      if (merged.length > 0) return merged
    } catch {
      // fallback
    }
    // Fallback if user arrived directly
    return ['Business Development', 'Operations', 'Sales & Revenue']
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

      const standardSuggestions = DEPARTMENT_TITLE_SUGGESTIONS[dept] || []
      const isStandard = standardSuggestions.some(
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

  const handleContinue = async () => {
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
        markStepComplete('job-titles')
        navigate('/onboarding/import')
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
      <div className="mt-8 space-y-3.5">
        {activeDepartments.map((dept) => {
          const isOpen = Boolean(openDepts[dept])
          const currentTitles = deptTitles[dept]?.titles || []
          const suggestions = (DEPARTMENT_TITLE_SUGGESTIONS[dept] || [
            'Manager',
            'Lead',
            'Specialist',
            'Coordinator',
            'Associate',
          ]).filter((s) => !currentTitles.includes(s))

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

      {/* Footer Navigation */}
      <StepFooter
        backTo="/onboarding/departments"
        onContinue={handleContinue}
        continueDisabled={totalTitlesCount === 0}
        isLoading={isSubmitting}
      />
    </div>
  )
}
