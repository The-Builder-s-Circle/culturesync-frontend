import { normalizeStepIds } from './onboardingUtils'
import { tenantApi } from '../api'

export interface ProgressSyncHandlers {
  /** Called when the active tenant id is (re)resolved server-side */
  onTenant: (tenantId: string) => void
  /** Receives server-derived completed steps; caller merges into state + persists */
  onSteps: (fromServer: string[], activeTenantId: string | null) => void
}

/**
 * Shared onboarding-progress sync used by the provider's mount effect and by
 * manual refreshes. Contains NO React state updates - results are delivered
 * through handlers so callers decide how and when to apply them.
 *
 * Resolves with the server-derived step list and resolved tenant id, or null
 * when the backend was unreachable or responded with a failure.
 */
export async function runProgressSync(
  handlers: ProgressSyncHandlers
): Promise<{ resolvedTenantId: string | null; fromServer: string[] } | null> {
  try {
    const resolvedTenantId = await tenantApi.resolveActiveTenantId()
    if (resolvedTenantId) handlers.onTenant(resolvedTenantId)

    const progressRes = await tenantApi.getOnboardingProgress()
    if (!(progressRes.isSuccess || progressRes.succeeded)) return null

    const raw = progressRes.data as
      | {
          completedSteps?: unknown[]
          currentStep?: string | number
          completionPercentage?: number
          percentageComplete?: number
          percentage?: number
        }
      | undefined
    const pct = raw?.completionPercentage ?? raw?.percentageComplete ?? raw?.percentage ?? 0
    const fromServer = normalizeStepIds(raw?.completedSteps, pct, raw?.currentStep)

    handlers.onSteps(fromServer, resolvedTenantId)
    return { resolvedTenantId, fromServer }
  } catch (err: unknown) {
    console.warn('Progress sync from backend deferred:', err)
    return null
  }
}
