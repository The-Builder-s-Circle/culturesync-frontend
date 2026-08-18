import React, { useState, useEffect, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { OnboardingContext } from './OnboardingContextObject'
import { ONBOARDING_STEPS } from '../pages/onboarding/steps'
import { tenantApi, extractTenantId } from '../api'
import {
  STORAGE_TENANT_ID_KEY,
  getTenantProgressStorageKey,
  normalizeStepIds,
} from './onboardingUtils'

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
      const activeTenant = localStorage.getItem(STORAGE_TENANT_ID_KEY)
      if (!activeTenant) return []
      const key = getTenantProgressStorageKey(activeTenant)
      const stored = localStorage.getItem(key)
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
      // Hydrate tenant-scoped progress strictly for this tenant
      try {
        const key = getTenantProgressStorageKey(id)
        const stored = localStorage.getItem(key)
        if (stored) {
          setCompletedSteps(JSON.parse(stored) as string[])
        } else {
          setCompletedSteps([])
        }
      } catch {
        setCompletedSteps([])
      }
    } else {
      localStorage.removeItem(STORAGE_TENANT_ID_KEY)
      setCompletedSteps([])
    }
  }, [])

  const markStepComplete = useCallback(
    (stepId: string) => {
      setCompletedSteps((prev) => {
        if (prev.includes(stepId)) return prev
        const next = [...prev, stepId]
        try {
          const key = getTenantProgressStorageKey(tenantId)
          localStorage.setItem(key, JSON.stringify(next))
        } catch (e) {
          console.warn('Failed to save onboarding progress to localStorage', e)
        }
        return next
      })
    },
    [tenantId]
  )

  const fetchProgress = useCallback(async () => {
    setIsLoadingProgress(true)
    try {
      // 1. Resolve active tenant ID
      const resolvedTenantId = await tenantApi.resolveActiveTenantId()
      if (resolvedTenantId && resolvedTenantId !== tenantId) {
        setTenantId(resolvedTenantId)
      }

      // 2. Fetch authoritative onboarding progress from backend
      const progressRes = await tenantApi.getOnboardingProgress()
      if (progressRes.isSuccess || progressRes.succeeded) {
        const raw = progressRes.data as
          | {
              completedSteps?: unknown[]
              currentStep?: string | number
              completionPercentage?: number
              percentageComplete?: number
              percentage?: number
            }
          | undefined

        const pct =
          raw?.completionPercentage ?? raw?.percentageComplete ?? raw?.percentage ?? 0

        const normalizedFromApi = normalizeStepIds(
          raw?.completedSteps,
          pct,
          raw?.currentStep
        )

        // Directly apply authoritative server response
        setCompletedSteps(normalizedFromApi)

        const activeId = resolvedTenantId || tenantId
        if (activeId) {
          try {
            const key = getTenantProgressStorageKey(activeId)
            localStorage.setItem(key, JSON.stringify(normalizedFromApi))
          } catch (e) {
            console.warn('Storage write failed', e)
          }
        }
      }
    } catch (err: unknown) {
      console.warn('Progress sync from backend deferred:', err)
    } finally {
      setIsLoadingProgress(false)
    }
  }, [setTenantId, tenantId])

  // Sync progress on initial mount and whenever tenantId changes
  useEffect(() => {
    let ignore = false
    const syncInitialProgress = async () => {
      try {
        const lookupRes = await tenantApi.lookup()
        if (!ignore && (lookupRes.isSuccess || lookupRes.succeeded)) {
          const resolvedId = extractTenantId(lookupRes)
          if (resolvedId && resolvedId !== tenantId) {
            setTenantId(resolvedId)
          }
        }

        const progressRes = await tenantApi.getOnboardingProgress()
        if (!ignore && (progressRes.isSuccess || progressRes.succeeded)) {
          const raw = progressRes.data as
            | {
                completedSteps?: unknown[]
                currentStep?: string | number
                completionPercentage?: number
                percentageComplete?: number
                percentage?: number
              }
            | undefined

          const pct =
            raw?.completionPercentage ?? raw?.percentageComplete ?? raw?.percentage ?? 0

          const normalizedFromApi = normalizeStepIds(
            raw?.completedSteps,
            pct,
            raw?.currentStep
          )

          setCompletedSteps(normalizedFromApi)

          const activeId = localStorage.getItem(STORAGE_TENANT_ID_KEY)
          if (activeId) {
            try {
              const key = getTenantProgressStorageKey(activeId)
              localStorage.setItem(key, JSON.stringify(normalizedFromApi))
            } catch (e) {
              console.warn('Storage write failed', e)
            }
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
  }, [setTenantId, tenantId])

  const totalSteps = ONBOARDING_STEPS.length

  const percentageComplete = useMemo(() => {
    if (completedSteps.length === 0) return 0
    return Math.min(Math.round((completedSteps.length / totalSteps) * 100), 100)
  }, [completedSteps, totalSteps])

  const isStepComplete = useCallback(
    (stepId: string): boolean => {
      return completedSteps.includes(stepId)
    },
    [completedSteps]
  )

  const getResumeRoute = useCallback((): string => {
    const firstIncomplete = ONBOARDING_STEPS.find((step) => !completedSteps.includes(step.id))
    return firstIncomplete ? firstIncomplete.path : '/dashboard'
  }, [completedSteps])

  const currentStepId =
    ONBOARDING_STEPS.find((step) => !completedSteps.includes(step.id))?.id || 'complete'
  const isComplete = completedSteps.length >= totalSteps

  const value = useMemo(
    () => ({
      tenantId,
      completedSteps,
      currentStepId,
      percentageComplete,
      percentComplete: percentageComplete,
      isLoadingProgress,
      error,
      setTenantId,
      markStepComplete,
      fetchProgress,
      isStepComplete,
      getResumeRoute,
      isComplete,
    }),
    [
      tenantId,
      completedSteps,
      currentStepId,
      percentageComplete,
      isLoadingProgress,
      error,
      setTenantId,
      markStepComplete,
      fetchProgress,
      isStepComplete,
      getResumeRoute,
      isComplete,
    ]
  )

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}
