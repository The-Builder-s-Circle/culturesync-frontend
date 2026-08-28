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
   * Get all tenant/system roles (GET /api/Role/list).
   * Backend wraps the list as Result<ListOfRolesQueryResponse>:
   *   { succeeded, messages, data: { roles: [{ id, name }] } }
   * Normalized here so callers always receive a flat RoleDto[].
   * Single-flight cached: concurrent callers (e.g. StrictMode double-mount)
   * share one HTTP request.
   */
  getRoles: ((): (() => Promise<BaseApiResponse<RoleDto[]>>) => {
    let inflight: Promise<BaseApiResponse<RoleDto[]>> | null = null
    return () => {
      if (!inflight) {
        inflight = apiClient
          .get<BaseApiResponse<RoleDto[] | { roles?: RoleDto[] }>>('/api/Role/list')
          .then((response) => {
            const body = response.data
            const raw = body.data
            const roles = Array.isArray(raw) ? raw : (raw?.roles ?? [])
            return { ...body, data: roles } as BaseApiResponse<RoleDto[]>
          })
          .catch((err) => {
            inflight = null
            throw err
          })
      }
      return inflight
    }
  })(),
}
