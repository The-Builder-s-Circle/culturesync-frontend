import { apiClient } from './client'
import type { BaseApiResponse } from './auth'

export interface JobTitleItem {
  name: string
  gradeLevel?: string | null
  description?: string | null
}

export interface CreateJobTitleCommand {
  defaultJobTitles?: JobTitleItem[] | null
  customJobTitles?: JobTitleItem[] | null
}

export const jobTitleApi = {
  /**
   * Batch create job titles for a tenant (POST /api/tenants/{tenantId}/job-titles/create)
   */
  createJobTitles: async (
    tenantId: string,
    payload: CreateJobTitleCommand
  ): Promise<BaseApiResponse> => {
    const response = await apiClient.post<BaseApiResponse>(
      `/api/tenants/${encodeURIComponent(tenantId)}/job-titles/create`,
      payload
    )
    return response.data
  },
}
