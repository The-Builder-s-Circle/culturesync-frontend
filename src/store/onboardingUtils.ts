import { ONBOARDING_STEPS } from '../pages/onboarding/steps'

export const STORAGE_TENANT_ID_KEY = 'culturesync_tenant_id'
export const STORAGE_PROGRESS_PREFIX = 'culturesync_onboarding_progress'
export const STORAGE_SELECTED_DEPTS_PREFIX = 'culturesync_selected_departments'
export const STORAGE_CUSTOM_DEPTS_PREFIX = 'culturesync_custom_departments'
export const STORAGE_JOB_TITLES_PREFIX = 'culturesync_job_titles'

export const STEP_ORDER = [
  'organization',
  'departments',
  'job-titles',
  'import',
  'invite',
  'hr-config',
  'complete',
]

export function getTenantProgressStorageKey(tenantId?: string | null): string {
  return tenantId ? `${STORAGE_PROGRESS_PREFIX}_${tenantId}` : `${STORAGE_PROGRESS_PREFIX}_anonymous`
}

export function getTenantSelectedDeptsKey(tenantId?: string | null): string {
  return tenantId
    ? `${STORAGE_SELECTED_DEPTS_PREFIX}_${tenantId}`
    : `${STORAGE_SELECTED_DEPTS_PREFIX}_anonymous`
}

export function getTenantCustomDeptsKey(tenantId?: string | null): string {
  return tenantId
    ? `${STORAGE_CUSTOM_DEPTS_PREFIX}_${tenantId}`
    : `${STORAGE_CUSTOM_DEPTS_PREFIX}_anonymous`
}

export function getTenantJobTitlesKey(tenantId?: string | null): string {
  return tenantId
    ? `${STORAGE_JOB_TITLES_PREFIX}_${tenantId}`
    : `${STORAGE_JOB_TITLES_PREFIX}_anonymous`
}

export function mapStepNameToId(name: unknown): string | null {
  if (typeof name === 'number') {
    if (name >= 1 && name <= STEP_ORDER.length) {
      return STEP_ORDER[name - 1]
    }
    return null
  }

  if (typeof name !== 'string') return null
  const lower = name.toLowerCase().trim()

  if (lower.includes('org') || lower.includes('company') || lower.includes('profile')) {
    return 'organization'
  }
  if (lower.includes('dept') || lower.includes('department')) {
    return 'departments'
  }
  if (lower.includes('job') || lower.includes('title')) {
    return 'job-titles'
  }
  if (lower.includes('import') || lower.includes('employee') || lower.includes('roster')) {
    return 'import'
  }
  if (lower.includes('invite') || lower.includes('team')) {
    return 'invite'
  }
  if (lower.includes('hr') || lower.includes('config') || lower.includes('polic')) {
    return 'hr-config'
  }
  if (lower.includes('complete') || lower.includes('finish') || lower.includes('done')) {
    return 'complete'
  }

  return null
}

/**
 * Normalizes various backend response formats into standardized completed step IDs.
 */
export function normalizeStepIds(
  rawCompleted?: unknown,
  percentage?: number,
  currentStep?: unknown
): string[] {
  const normalized = new Set<string>()

  // 1. If completedSteps array is provided
  if (Array.isArray(rawCompleted) && rawCompleted.length > 0) {
    for (const item of rawCompleted) {
      const stepId = mapStepNameToId(item)
      if (stepId) {
        normalized.add(stepId)
      }
    }
  }

  // 2. If currentStep is provided (e.g. "HrConfiguration", "EmployeeImport")
  // All steps before currentStep are completed
  const currentStepId = mapStepNameToId(currentStep)
  if (currentStepId) {
    const currentIndex = STEP_ORDER.indexOf(currentStepId)
    if (currentIndex > 0) {
      for (let i = 0; i < currentIndex; i++) {
        normalized.add(STEP_ORDER[i])
      }
    }
  }

  // 3. Infer steps from percentage if provided (14%, 29%, 43%, 57%, 71%, 86%, 100%)
  if (typeof percentage === 'number' && percentage > 0) {
    let stepCount = 0
    if (percentage >= 100) stepCount = 7
    else if (percentage >= 85) stepCount = 6
    else if (percentage >= 70) stepCount = 5
    else if (percentage >= 55) stepCount = 4
    else if (percentage >= 40) stepCount = 3
    else if (percentage >= 25) stepCount = 2
    else if (percentage >= 10) stepCount = 1

    for (let i = 0; i < stepCount; i++) {
      normalized.add(STEP_ORDER[i])
    }
  }

  return Array.from(normalized)
}

/**
 * Evaluates live progress response data and returns the exact target route.
 */
export function getResumeRouteFromProgress(rawProgress: unknown): string {
  if (!rawProgress) return '/onboarding/organization'

  const data = rawProgress as {
    data?: unknown
    isCompleted?: boolean
    succeeded?: boolean
    completionPercentage?: number
    percentageComplete?: number
    percentage?: number
    completedSteps?: unknown[]
    currentStep?: string | number
  }

  // Unnest nested response object if passed { data: { ... } }
  const payload =
    data.data && typeof data.data === 'object'
      ? (data.data as Record<string, unknown>)
      : (data as Record<string, unknown>)

  if (payload.isCompleted === true) return '/dashboard'

  const pct = Number(
    payload.completionPercentage ?? payload.percentageComplete ?? payload.percentage ?? 0
  )
  if (pct >= 100) return '/dashboard'

  // If currentStep is explicitly returned as a string or number
  const currentStepId = mapStepNameToId(payload.currentStep)
  if (currentStepId) {
    const stepDef = ONBOARDING_STEPS.find((s) => s.id === currentStepId)
    if (stepDef) return stepDef.path
  }

  // If completedSteps array is provided
  if (Array.isArray(payload.completedSteps) && payload.completedSteps.length > 0) {
    const steps = normalizeStepIds(payload.completedSteps, pct, payload.currentStep)
    const firstIncomplete = ONBOARDING_STEPS.find((s) => !steps.includes(s.id))
    return firstIncomplete ? firstIncomplete.path : '/dashboard'
  }

  // Percentage threshold mapping
  if (pct < 14) return '/onboarding/organization'
  if (pct < 28) return '/onboarding/departments'
  if (pct < 42) return '/onboarding/job-titles'
  if (pct < 57) return '/onboarding/import'
  if (pct < 71) return '/onboarding/invite'
  if (pct < 85) return '/onboarding/hr-config'
  if (pct < 100) return '/onboarding/complete'
  return '/dashboard'
}
