import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { OnboardingContext } from './OnboardingContextObject'
import { ONBOARDING_STEPS } from '../pages/onboarding/steps'
import {
  STORAGE_TENANT_ID_KEY,
  readCompletedStepsCache,
  writeCompletedStepsCache,
  readSkippedStepsCache,
  writeSkippedStepsCache,
  mergeStepLists,
} from './onboardingUtils'
import { runProgressSync } from './progressSync'

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenantId, setTenantIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_TENANT_ID_KEY)
    } catch {
      return null
    }
  })

  // Cache-first hydration: instant paint with the last known progress
  const [completedSteps, setCompletedSteps] = useState<string[]>(() =>
    readCompletedStepsCache(localStorage.getItem(STORAGE_TENANT_ID_KEY))
  )

  // Frontend-only: steps the user explicitly skipped (unlock, never complete)
  const [skippedSteps, setSkippedSteps] = useState<string[]>(() =>
    readSkippedStepsCache(localStorage.getItem(STORAGE_TENANT_ID_KEY))
  )

  const [isLoadingProgress, setIsLoadingProgress] = useState<boolean>(false)
  const [error] = useState<string | null>(null)

  // Prevents overlapping server syncs (mount + tenant change + manual refresh)
  const syncInFlightRef = useRef(false)
  // Latest known tenant id, readable inside async callbacks without stale closures
  const tenantIdRef = useRef(tenantId)

  const setTenantId = useCallback((id: string | null) => {
    tenantIdRef.current = id
    setTenantIdState(id)
    if (id) {
      try {
        localStorage.setItem(STORAGE_TENANT_ID_KEY, id)
      } catch {
        // Non-fatal
      }
      setCompletedSteps(readCompletedStepsCache(id))
      setSkippedSteps(readSkippedStepsCache(id))
    } else {
      try {
        localStorage.removeItem(STORAGE_TENANT_ID_KEY)
      } catch {
        // Non-fatal
      }
      setCompletedSteps([])
      setSkippedSteps([])
    }
  }, [])

  const markStepComplete = useCallback(
    (stepId: string) => {
      setCompletedSteps((prev) => {
        if (prev.includes(stepId)) return prev
        const next = [...prev, stepId]
        writeCompletedStepsCache(tenantIdRef.current, next)
        return next
      })
    },
    []
  )

  /** Records an explicit skip - unlocks later steps without counting as done. */
  const skipStep = useCallback((stepId: string) => {
    setSkippedSteps((prev) => {
      if (prev.includes(stepId)) return prev
      const next = [...prev, stepId]
      writeSkippedStepsCache(tenantIdRef.current, next)
      return next
    })
  }, [])

  /**
   * Union-merge of server-derived steps into current state, persisted on
   * change. The backend's progression can legitimately lag behind steps the
   * user actually completed (silent-skip progression guards), so applying the
   * server list verbatim would regress the local cache - a union never does.
   */
  const mergeServerSteps = useCallback((fromServer: string[], activeTenantId: string | null) => {
    setCompletedSteps((prev) => {
      const merged = mergeStepLists(prev, fromServer)
      if (merged.length === prev.length && merged.every((step, i) => step === prev[i])) {
        return prev
      }
      writeCompletedStepsCache(activeTenantId || tenantIdRef.current, merged)
      return merged
    })
  }, [])

  /**
   * Manual refresh entry point (exposed as fetchProgress). Not referenced by
   * any effect, so it may manage loading state directly.
   */
  const fetchProgress = useCallback(async () => {
    if (syncInFlightRef.current) return
    syncInFlightRef.current = true
    setIsLoadingProgress(true)
    try {
      await runProgressSync({
        onTenant: (resolved) => setTenantId(resolved),
        onSteps: mergeServerSteps,
      })
    } finally {
      syncInFlightRef.current = false
      setIsLoadingProgress(false)
    }
  }, [mergeServerSteps, setTenantId])

  // Initial + tenant-change sync. Every state update happens inside callbacks
  // of awaited promises, never synchronously in the effect body.
  useEffect(() => {
    let cancelled = false

    const sync = async () => {
      if (syncInFlightRef.current) return
      syncInFlightRef.current = true
      try {
        await runProgressSync({
          onTenant: (resolved) => {
            if (cancelled || resolved === tenantIdRef.current) return
            // Tenant switched server-side: adopt it and hydrate its cache.
            // Server steps below will merge on top of the hydrated list.
            tenantIdRef.current = resolved
            setTenantIdState(resolved)
            try {
              localStorage.setItem(STORAGE_TENANT_ID_KEY, resolved)
            } catch {
              // Non-fatal
            }
            setCompletedSteps(readCompletedStepsCache(resolved))
            setSkippedSteps(readSkippedStepsCache(resolved))
          },
          onSteps: (fromServer, activeId) => {
            if (!cancelled) mergeServerSteps(fromServer, activeId)
          },
        })
      } catch {
        // runProgressSync already reports failures via console.warn
      } finally {
        syncInFlightRef.current = false
      }
    }

    void sync()
    return () => {
      cancelled = true
    }
  }, [mergeServerSteps, tenantId])

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

  const doneOrSkipped = useMemo(
    () => new Set([...completedSteps, ...skippedSteps]),
    [completedSteps, skippedSteps]
  )

  const isStepUnlocked = useCallback(
    (stepId: string): boolean => {
      const index = ONBOARDING_STEPS.findIndex((step) => step.id === stepId)
      if (index <= 0) return true
      for (let i = 0; i < index; i++) {
        const prior = ONBOARDING_STEPS[i].id
        if (!doneOrSkipped.has(prior)) return false
      }
      return true
    },
    [doneOrSkipped]
  )

  const getResumeRoute = useCallback((): string => {
    const firstIncomplete = ONBOARDING_STEPS.find((step) => !completedSteps.includes(step.id))
    return firstIncomplete ? firstIncomplete.path : '/dashboard'
  }, [completedSteps])

  const currentStepId =
    ONBOARDING_STEPS.find((step) => !completedSteps.includes(step.id))?.id || 'complete'

  const value = useMemo(
    () => ({
      tenantId,
      completedSteps,
      skippedSteps,
      currentStepId,
      percentageComplete,
      percentComplete: percentageComplete,
      isLoadingProgress,
      error,
      setTenantId,
      markStepComplete,
      skipStep,
      fetchProgress,
      isStepComplete,
      isStepUnlocked,
      getResumeRoute,
    }),
    [
      tenantId,
      completedSteps,
      skippedSteps,
      currentStepId,
      percentageComplete,
      isLoadingProgress,
      error,
      setTenantId,
      markStepComplete,
      skipStep,
      fetchProgress,
      isStepComplete,
      isStepUnlocked,
      getResumeRoute,
    ]
  )

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}
