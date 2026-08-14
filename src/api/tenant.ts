import { apiClient } from './client'
import type { BaseApiResponse } from './auth'

export interface SetupProfilePayload {
  image?: File | null
  Industry: string
  CompanySize: string
  HQLocation: string
  TimeZoneId: string
  DefaultCurrency: string
  Slug: string
}

export interface TenantLookupData {
  id?: string
  tenantId?: string
  name?: string
  companyName?: string
  slug?: string
  industry?: string
  companySize?: string
  hqLocation?: string
  timeZoneId?: string
  defaultCurrency?: string
  logoUrl?: string
  isOnboarded?: boolean
}

export interface OnboardingProgressData {
  currentStep?: number | string
  completedSteps?: string[]
  percentageComplete?: number
  isCompleted?: boolean
}

export const tenantApi = {
  /**
   * Setup tenant organization profile (PUT /api/Tenant/setup-profile)
   */
  setupProfile: async (formData: FormData): Promise<BaseApiResponse> => {
    const response = await apiClient.put<BaseApiResponse>(
      '/api/Tenant/setup-profile',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  /**
   * Get tenant lookup metadata (GET /api/Tenant/lookup)
   */
  lookup: async (): Promise<BaseApiResponse> => {
    const response = await apiClient.get<BaseApiResponse>('/api/Tenant/lookup')
    return response.data
  },

  /**
   * Get tenant onboarding progress (GET /api/Tenant/onboarding-progress)
   */
  getOnboardingProgress: async (): Promise<BaseApiResponse> => {
    const response = await apiClient.get<BaseApiResponse>('/api/Tenant/onboarding-progress')
    return response.data
  },
}
