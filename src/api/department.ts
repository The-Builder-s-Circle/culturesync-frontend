import { apiClient } from './client'

/**
 * Shared department item shape for both default and custom departments.
 * Matches: SelectDefaultDepartment & CreateCustomDepartment schemas.
 */
export interface DepartmentItem {
  name: string
  description?: string | null
  managerId?: string | null
}

/**
 * Refactored CreateDepartmentCommand payload.
 * Backend distinguishes between pre-seeded defaults the user selects
 * and custom ones the user types in.
 */
export interface CreateDepartmentCommand {
  defaultDepartments?: DepartmentItem[] | null
  customDepartments?: DepartmentItem[] | null
}

export interface UpdateDepartmentPayload {
  name: string
  description?: string | null
  parentDepartmentId?: string | null
  managerId?: string | null
}

export interface ResultResponse<T = unknown> {
  succeeded?: boolean
  isSuccess?: boolean
  messages?: string[]
  message?: string
  data?: T
}

export const departmentApi = {
  /**
   * Batch create departments for tenant (POST /api/tenants/{tenantId}/departments/create)
   *
   * Payload splits departments into two lists:
   *  - defaultDepartments: pre-seeded names the user kept
   *  - customDepartments: user-created departments
   */
  createDepartments: async (
    tenantId: string,
    payload: CreateDepartmentCommand
  ): Promise<ResultResponse<string[]>> => {
    const response = await apiClient.post<ResultResponse<string[]>>(
      `/api/tenants/${encodeURIComponent(tenantId)}/departments/create`,
      payload
    )
    return response.data
  },

  /**
   * Update department by ID (PUT /api/tenants/{tenantId}/departments/{id})
   */
  updateDepartment: async (
    tenantId: string,
    id: string,
    payload: UpdateDepartmentPayload
  ): Promise<ResultResponse> => {
    const response = await apiClient.put<ResultResponse>(
      `/api/tenants/${encodeURIComponent(tenantId)}/departments/${encodeURIComponent(id)}`,
      payload
    )
    return response.data
  },
}
