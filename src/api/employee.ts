import { apiClient } from './client'
import type { BaseApiResponse } from './auth'

export interface EmployeeImportDto {
  rowNumber?: number
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  department?: string | null
  jobTitle?: string | null
  phoneNumber?: string | null
  employeeNumber?: string | null
  managerEmail?: string | null
  hireDate?: string | null
}

/**
 * Row-level validation result returned by validate-import.
 * Matches CultureSync.Application.Commands.Employees.ValidateEmployeeImport.EmployeeImportRow
 */
export interface EmployeeImportRow {
  employee?: EmployeeImportDto
  isValid?: boolean
  errors?: string[]
}

/**
 * Matches CultureSync.Application.Commands.Employees.ValidateEmployeeImport.ValidateEmployeeImportResponse
 */
export interface ValidateEmployeeImportResponse {
  totalRows?: number
  validRows?: number
  invalidRows?: number
  rows?: EmployeeImportRow[]
}

export interface ConfirmEmployeeImportCommand {
  employees: EmployeeImportDto[]
}

export interface InviteEmployeeCommand {
  email: string
  roleId?: string
}

export const employeeApi = {
  /**
   * Validate roster file import (POST /api/tenants/{tenantId}/employees/validate-import)
   */
  validateImport: async (
    tenantId: string,
    file: File
  ): Promise<BaseApiResponse<ValidateEmployeeImportResponse>> => {
    const formData = new FormData()
    formData.append('File', file)

    const response = await apiClient.post<BaseApiResponse<ValidateEmployeeImportResponse>>(
      `/api/tenants/${encodeURIComponent(tenantId)}/employees/validate-import`,
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
   * Confirm roster batch import (POST /api/tenants/{tenantId}/employees/confirm-import)
   */
  confirmImport: async (
    tenantId: string,
    employees: EmployeeImportDto[]
  ): Promise<BaseApiResponse> => {
    const payload: ConfirmEmployeeImportCommand = { employees }
    const response = await apiClient.post<BaseApiResponse>(
      `/api/tenants/${encodeURIComponent(tenantId)}/employees/confirm-import`,
      payload
    )
    return response.data
  },

  /**
   * Invite single employee (POST /api/tenants/{tenantId}/employees/invite)
   */
  inviteEmployee: async (
    tenantId: string,
    payload: InviteEmployeeCommand
  ): Promise<BaseApiResponse> => {
    const response = await apiClient.post<BaseApiResponse>(
      `/api/tenants/${encodeURIComponent(tenantId)}/employees/invite`,
      payload
    )
    return response.data
  },
}
