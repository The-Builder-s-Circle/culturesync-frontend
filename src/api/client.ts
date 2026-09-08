import axios from 'axios'
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://culturesync-api.onrender.com'
export const STORAGE_TOKEN_KEY = 'culturesync_auth_token'
export const STORAGE_USER_KEY = 'culturesync_auth_user'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Inject Bearer token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const token = localStorage.getItem(STORAGE_TOKEN_KEY)
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (e) {
      console.warn('Failed to retrieve token from localStorage', e)
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

export interface ApiValidationErrorItem {
  field?: string
  message?: string
}

export interface ApiErrorResponseData {
  isSuccess?: boolean
  succeeded?: boolean
  message?: string
  messages?: string[]
  errors?: string[]
  data?: ApiValidationErrorItem[] | unknown
}

// Matches CultureSync.Domain.Wrapper.PaginatedResult<T>
export interface PaginatedResult<T = unknown> {
  succeeded?: boolean
  isSuccess?: boolean
  messages?: string[] | null
  message?: string | null
  errors?: string[] | null
  currentPage?: number
  totalPages?: number
  totalCount?: number
  pageSize?: number
  hasPreviousPage?: boolean
  hasNextPage?: boolean
  data?: T[] | null
}

// Query params for the /paginated endpoints (PageNumber, PageSize,
// OrderBy[], AdvancedSearch.Fields[], AdvancedSearch.Keyword, Keyword)
export interface PaginatedQuery {
  pageNumber?: number
  pageSize?: number
  orderBy?: string[]
  searchFields?: string[]
  searchKeyword?: string
  keyword?: string
}

// Builds a flat query object using indexed keys so ASP.NET Core binds
// the arrays correctly (axios' default OrderBy[]= form does not).
export function buildPaginatedQuery(params: PaginatedQuery): Record<string, string> {
  const query: Record<string, string> = {}
  if (params.pageNumber != null) query.PageNumber = String(params.pageNumber)
  if (params.pageSize != null) query.PageSize = String(params.pageSize)
  params.orderBy?.forEach((value, i) => {
    query[`OrderBy[${i}]`] = value
  })
  params.searchFields?.forEach((value, i) => {
    query[`AdvancedSearch.Fields[${i}]`] = value
  })
  if (params.searchKeyword) query['AdvancedSearch.Keyword'] = params.searchKeyword
  if (params.keyword) query.Keyword = params.keyword
  return query
}

function extractApiErrorMessage(data?: ApiErrorResponseData | null): string | null {
  if (!data) return null
  if (typeof data.message === 'string' && data.message.trim()) return data.message
  if (Array.isArray(data.messages) && data.messages.length > 0) {
    const joined = data.messages
      .filter((m) => typeof m === 'string' && m.trim())
      .join('. ')
    if (joined) return joined
  }
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const joined = data.errors
      .filter((m) => typeof m === 'string' && m.trim())
      .join('. ')
    if (joined) return joined
  }
  const problemDetails = data as Record<string, unknown>
  if (typeof problemDetails.detail === 'string' && problemDetails.detail.trim()) {
    return problemDetails.detail
  }
  if (typeof problemDetails.title === 'string' && problemDetails.title.trim()) {
    return problemDetails.title
  }
  return null
}

// Response Interceptor: Explicit Status Code Handling (200, 400, 401)
apiClient.interceptors.response.use(
  (response) => {
    // HTTP 200 OK: Check business logic success flags (isSuccess / succeeded)
    const responseData = response.data as ApiErrorResponseData | undefined
    if (responseData) {
      if (responseData.isSuccess === false || responseData.succeeded === false) {
        const errorMsg =
          extractApiErrorMessage(responseData) ?? 'Request completed with errors.'
        return Promise.reject(new Error(errorMsg))
      }
    }
    return response
  },
  (error: AxiosError<ApiErrorResponseData>) => {
    // Handle Network Errors / Server Cold Starts
    if (!error.response) {
      return Promise.reject(
        new Error('Network error or server warming up. Please try again in a few seconds.')
      )
    }

    const { status, data } = error.response
    let extractedMessage: string

    // HTTP 400 Bad Request (Validation Result Model)
    if (status === 400) {
      if (data) {
        if (Array.isArray(data.data) && data.data.length > 0) {
          extractedMessage = data.data
            .map((item) => item.message || item.field)
            .filter(Boolean)
            .join('. ')
        } else {
          extractedMessage =
            extractApiErrorMessage(data) ??
            'Validation failed. Please check your inputs.'
        }
      } else {
        extractedMessage = 'Bad Request. Please verify your form fields.'
      }
    }
    // HTTP 401 Unauthorized (Invalid Credentials or Expired Bearer Token)
    else if (status === 401) {
      try {
        localStorage.removeItem(STORAGE_TOKEN_KEY)
        localStorage.removeItem(STORAGE_USER_KEY)
      } catch {
        // Ignore storage access errors
      }

      extractedMessage =
        extractApiErrorMessage(data) ??
        'Session expired or invalid credentials. Please sign in again.'

      // Automatically redirect to login page if unauthorized on a protected route
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login'
      }
    }
    // Fallback for other status codes (403, 404, 500, etc.)
    else {
      extractedMessage =
        extractApiErrorMessage(data) ??
        'An unexpected error occurred. Please try again.'
    }

    return Promise.reject(new Error(extractedMessage))
  }
)
