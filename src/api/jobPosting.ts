import { apiClient } from './client'
import type { BaseApiResponse } from './auth'

export interface CreateJobPostingCommand {
  jobTitleId: string
  minimumSalary: number
  maximumSalary: number
}

export const jobPostingApi = {
  /**
   * Create a job posting / salary band (POST /api/tenants/{tenantId}/job-postings/create)
   */
  createJobPosting: async (
    tenantId: string,
    payload: CreateJobPostingCommand
  ): Promise<BaseApiResponse> => {
    const response = await apiClient.post<BaseApiResponse>(
      `/api/tenants/${encodeURIComponent(tenantId)}/job-postings/create`,
      payload
    )
    return response.data
  },
}
