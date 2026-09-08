import { apiClient, buildPaginatedQuery } from './client'
import type { PaginatedQuery, PaginatedResult } from './client'
import type { BaseApiResponse } from './auth'

export interface CreateJobPostingCommand {
  jobTitleId: string
  minimumSalary: number
  maximumSalary: number
}

// Matches CultureSync.Application.Queries.JobPostings.GetJobPostingsQuery.ListOfJobPostingsResponse
export interface JobPostingListItem {
  id?: string
  minimumSalary?: number
  maximumSalary?: number
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

  /**
   * List job postings with pagination + search (GET /api/tenants/{tenantId}/job-postings/paginated)
   */
  getJobPostingsPaginated: async (
    tenantId: string,
    query: PaginatedQuery = {}
  ): Promise<PaginatedResult<JobPostingListItem>> => {
    const response = await apiClient.get<PaginatedResult<JobPostingListItem>>(
      `/api/tenants/${encodeURIComponent(tenantId)}/job-postings/paginated`,
      { params: buildPaginatedQuery(query) }
    )
    return response.data
  },
}
