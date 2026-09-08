import { apiClient, buildPaginatedQuery } from './client'
import type { PaginatedQuery, PaginatedResult } from './client'
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

// Tolerant item shape: the swagger spec reuses ListOfJobPostingsResponse
// for this endpoint, but real job titles carry name/gradeLevel/description.
export interface JobTitleListItem {
  id?: string
  name?: string
  gradeLevel?: string | null
  description?: string | null
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

  /**
   * List job titles with pagination + search (GET /api/tenants/{tenantId}/job-titles/paginated)
   */
  getJobTitlesPaginated: async (
    tenantId: string,
    query: PaginatedQuery = {}
  ): Promise<PaginatedResult<JobTitleListItem>> => {
    const response = await apiClient.get<PaginatedResult<JobTitleListItem>>(
      `/api/tenants/${encodeURIComponent(tenantId)}/job-titles/paginated`,
      { params: buildPaginatedQuery(query) }
    )
    return response.data
  },
}
