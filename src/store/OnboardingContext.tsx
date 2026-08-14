import React, { useState, useEffect, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { OnboardingContext } from './OnboardingContextObject'
import { ONBOARDING_STEPS } from '../pages/onboarding/steps'
import { tenantApi } from '../api'

const STORAGE_TENANT_ID_KEY = 'culturesync_tenant_id'
const STORAGE_PROGRESS_KEY = 'culturesync_onboarding_progress'

const STEP_ORDER = [
  'organization',
  'departments',
  'job-titles',
  'import',
  'invite',
  'hr-config',
  'complete',
]

/**
 * Normalizes various backend response formats into standardized step IDs.
 * Supports:
 * - Number indices (1-7)
 * - Raw string names (any casing/spaces, e.g. "Organization Profile", "Departments")
 * - Percentage thresholds (14%, 29%, 43%, etc.)
 */
function normalizeStepIds(raw: unknown, percentage?: number): string[] {
  const normalized = new Set<string>()

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === 'number' && item >= 1 && item <= STEP_ORDER.length) {
        normalized.add(STEP_ORDER[item - 1])
      } else if (typeof item === 'string') {
        const lower = item.toLowerCase().trim()
        if (lower.includes('org') || lower.includes('company') || lower.includes('profile')) {
          normalized.add('organization')
        } else if (lower.includes('dept') || lower.includes('department')) {
          normalized.add('departments')
        } else if (lower.includes('job') || lower.includes('title')) {
          normalized.add('job-titles')
        } else if (lower.includes('import') || lower.includes('employee') || lower.includes('roster')) {
          normalized.add('import')
        } else if (lower.includes('invite') || lower.includes('team')) {
          normalized.add('invite')
        } else if (lower.includes('hr') || lower.includes('config') || lower.includes('polic')) {
          normalized.add('hr-config')
        } else if (lower.includes('complete') || lower.includes('finish') || lower.includes('done')) {
          normalized.add('complete')
        }
      }
    }
  }

  // Infer steps from percentage if provided (each step represents ~14.28%)
  if (typeof percentage === 'number' && percentage > 0) {
    const stepCount = Math.min(Math.round((percentage / 100) * STEP_ORDER.length), STEP_ORDER.length)
    for (let i = 0; i < stepCount; i++) {
      normalized.add(STEP_ORDER[i])
    }
  }

  return Array.from(normalized)
}

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenantId, setTenantIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_TENANT_ID_KEY)
    } catch {
      return null
    }
  })

  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PROGRESS_KEY)
      return stored ? (JSON.parse(stored) as string[]) : []
    } catch {
      return []
    }
  })

  const [isLoadingProgress, setIsLoadingProgress] = useState<boolean>(false)
  const [error] = useState<string | null>(null)

  const setTenantId = useCallback((id: string | null) => {
    setTenantIdState(id)
    if (id) {
      localStorage.setItem(STORAGE_TENANT_ID_KEY, id)
    } else {
      localStorage.removeItem(STORAGE_TENANT_ID_KEY)
    }
  }, [])

  const markStepComplete = useCallback((stepId: string) => {
    setCompletedSteps((prev) => {
      if (prev.includes(stepId)) return prev
      const next = [...prev, stepId]
      try {
        localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(next))
      } catch (e) {
        console.warn('Failed to save onboarding progress to localStorage', e)
      }
      return next
    })
  }, [])

  const fetchProgress = useCallback(async () => {
    setIsLoadingProgress(true)
    try {
      // 1. Fetch lookup metadata to retrieve tenantId if not already in state
      const lookupRes = await tenantApi.lookup()
      if (lookupRes.isSuccess || lookupRes.succeeded) {
        const lookupData = lookupRes.data as {
          tenantId?: string
          id?: string
          isOnboarded?: boolean
          completedSteps?: unknown
        } | undefined
        const resolvedTenantId = lookupData?.tenantId || lookupData?.id
        if (resolvedTenantId) {
          setTenantId(resolvedTenantId)
        }
      }

      // 2. Fetch onboarding progress from backend
      const progressRes = await tenantApi.getOnboardingProgress()
      if (progressRes.isSuccess || progressRes.succeeded) {
        const data = progressRes.data as
          | {
              completedSteps?: unknown[]
              currentStep?: string | number
              percentageComplete?: number
              percentage?: number
            }
          | undefined

        const normalizedFromApi = normalizeStepIds(
          data?.completedSteps,
          data?.percentageComplete ?? data?.percentage
        )

        if (normalizedFromApi.length > 0) {
          setCompletedSteps((prev) => {
            const merged = Array.from(new Set([...prev, ...normalizedFromApi]))
            try {
              localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(merged))
            } catch (e) {
              console.warn('Storage write failed', e)
            }
            return merged
          })
        }
      }
    } catch (err: unknown) {
      console.warn('Progress sync from backend deferred (using cached progress):', err)
    } finally {
      setIsLoadingProgress(false)
    }
  }, [setTenantId])

  useEffect(() => {
    let ignore = false
    const syncInitialProgress = async () => {
      try {
        const lookupRes = await tenantApi.lookup()
        if (!ignore && (lookupRes.isSuccess || lookupRes.succeeded)) {
          const lookupData = lookupRes.data as { tenantId?: string; id?: string } | undefined
          const resolvedTenantId = lookupData?.tenantId || lookupData?.id
          if (resolvedTenantId) {
            setTenantId(resolvedTenantId)
          }
        }

        const progressRes = await tenantApi.getOnboardingProgress()
        if (!ignore && (progressRes.isSuccess || progressRes.succeeded)) {
          const data = progressRes.data as
            | {
                completedSteps?: unknown[]
                currentStep?: string | number
                percentageComplete?: number
                percentage?: number
              }
            | undefined

          const normalizedFromApi = normalizeStepIds(
            data?.completedSteps,
            data?.percentageComplete ?? data?.percentage
          )

          if (normalizedFromApi.length > 0) {
            setCompletedSteps((prev) => {
              const merged = Array.from(new Set([...prev, ...normalizedFromApi]))
              try {
                localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(merged))
              } catch (e) {
                console.warn('Storage write failed', e)
              }
              return merged
            })
          }
        }
      } catch (err: unknown) {
        console.warn('Initial progress sync deferred:', err)
      }
    }
    syncInitialProgress()
    return () => {
      ignore = true
    }
  }, [setTenantId])

  const percentComplete = useMemo(() => {
    if (ONBOARDING_STEPS.length === 0) return 0
    return Math.round((completedSteps.length / ONBOARDING_STEPS.length) * 100)
  }, [completedSteps])

  const getResumeRoute = useCallback((): string => {
    for (const step of ONBOARDING_STEPS) {
      if (!completedSteps.includes(step.id)) {
        return step.path
      }
    }
    return '/onboarding/complete'
  }, [completedSteps])

  const currentStepId = useMemo(() => {
    for (const step of ONBOARDING_STEPS) {
      if (!completedSteps.includes(step.id)) {
        return step.id
      }
    }
    return 'complete'
  }, [completedSteps])

  return (
    <OnboardingContext.Provider
      value={{
        tenantId,
        setTenantId,
        currentStepId,
        completedSteps,
        isLoadingProgress,
        error,
        percentComplete,
        fetchProgress,
        markStepComplete,
        getResumeRoute,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}
