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

export interface LookupOption {
  value: string
  label: string
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
  industries?: LookupOption[]
  companySizes?: LookupOption[]
  timeZones?: LookupOption[]
  currencies?: LookupOption[]
  jobTitles?: LookupOption[]
  gradeLevels?: LookupOption[]
  departments?: LookupOption[]
}

export interface OnboardingProgressData {
  currentStep?: number | string
  completedSteps?: string[]
  completionPercentage?: number
  percentageComplete?: number
  percentage?: number
  isCompleted?: boolean
}

/**
 * Extracts tenant identifier from JWT token claims
 */
export function getTenantIdFromJwt(token?: string | null): string | null {
  let activeToken = token
  if (!activeToken) {
    try {
      activeToken = localStorage.getItem('culturesync_auth_token')
    } catch {
      return null
    }
  }
  if (!activeToken) return null

  try {
    const parts = activeToken.split('.')
    if (parts.length < 2) return null
    const payload = JSON.parse(atob(parts[1]))
    return (
      payload.tenantId ||
      payload.TenantId ||
      payload.tenant_id ||
      payload.tid ||
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/tenantid'] ||
      payload['tenant'] ||
      payload.id ||
      payload.Id ||
      null
    )
  } catch {
    return null
  }
}

/**
 * Robust extractor for tenant identifier from any response/source object
 */
export function extractTenantId(source: unknown): string | null {
  if (!source) return null

  if (typeof source === 'string') {
    if (source.length >= 10 && !source.includes('{') && !source.includes('.')) {
      return source
    }
    if (source.includes('.')) {
      return getTenantIdFromJwt(source)
    }
  }

  if (typeof source === 'object') {
    const obj = source as Record<string, unknown>
    const id =
      obj.tenantId ||
      obj.TenantId ||
      obj.id ||
      obj.Id ||
      obj.tenant_id ||
      obj.organizationId ||
      obj.OrganizationId

    if (typeof id === 'string' && id.length > 0) return id

    if (obj.data) {
      const nested = extractTenantId(obj.data)
      if (nested) return nested
    }
  }

  return null
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
  lookup: async (): Promise<BaseApiResponse<TenantLookupData>> => {
    const response = await apiClient.get<BaseApiResponse<TenantLookupData>>('/api/Tenant/lookup')
    return response.data
  },

  /**
   * Get tenant onboarding progress (GET /api/Tenant/onboarding-progress)
   */
  getOnboardingProgress: async (): Promise<BaseApiResponse<OnboardingProgressData>> => {
    const response = await apiClient.get<BaseApiResponse<OnboardingProgressData>>(
      '/api/Tenant/onboarding-progress'
    )
    return response.data
  },

  /**
   * Helper that resolves the active tenant ID from storage, JWT claims, or live lookup
   */
  resolveActiveTenantId: async (): Promise<string | null> => {
    try {
      const stored = localStorage.getItem('culturesync_tenant_id')
      if (stored && stored.length > 0) return stored
    } catch {
      // ignore
    }

    const fromJwt = getTenantIdFromJwt()
    if (fromJwt) {
      try {
        localStorage.setItem('culturesync_tenant_id', fromJwt)
      } catch {
        // ignore
      }
      return fromJwt
    }

    try {
      const res = await tenantApi.lookup()
      const extracted = extractTenantId(res)
      if (extracted) {
        try {
          localStorage.setItem('culturesync_tenant_id', extracted)
        } catch {
          // ignore
        }
        return extracted
      }
    } catch {
      // ignore
    }

    return null
  },
}
