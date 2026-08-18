import { apiClient } from './client'
import type { BaseApiResponse } from './auth'

export interface RoleDto {
  id: string
  name: string
  description?: string | null
  isDefault?: boolean
}

export const roleApi = {
  /**
   * Get all tenant/system roles (GET /api/Role/list)
   */
  getRoles: async (): Promise<BaseApiResponse<RoleDto[]>> => {
    const response = await apiClient.get<BaseApiResponse<RoleDto[]>>('/api/Role/list')
    return response.data
  },
}
