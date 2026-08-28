import { createContext } from 'react'

export interface OnboardingContextType {
  tenantId: string | null
  setTenantId: (id: string | null) => void
  currentStepId: string
  completedSteps: string[]
  skippedSteps: string[]
  isLoadingProgress: boolean
  error: string | null
  percentComplete: number
  fetchProgress: () => Promise<void>
  markStepComplete: (stepId: string) => void
  skipStep: (stepId: string) => void
  isStepUnlocked: (stepId: string) => boolean
  getResumeRoute: () => string
}

export const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)
