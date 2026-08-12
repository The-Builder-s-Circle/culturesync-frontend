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

// Response Interceptor: Explicit Status Code Handling (200, 400, 401)
apiClient.interceptors.response.use(
  (response) => {
    // HTTP 200 OK: Check business logic success flags (isSuccess / succeeded)
    const responseData = response.data as ApiErrorResponseData | undefined
    if (responseData) {
      if (responseData.isSuccess === false || responseData.succeeded === false) {
        const errorMsg =
          responseData.message ||
          (responseData.errors && responseData.errors.join('. ')) ||
          (responseData.messages && responseData.messages.join('. ')) ||
          'Request completed with errors.'
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
    let extractedMessage = 'An unexpected error occurred. Please try again.'

    // HTTP 400 Bad Request (Validation Result Model)
    if (status === 400) {
      if (data) {
        if (Array.isArray(data.data) && data.data.length > 0) {
          extractedMessage = data.data
            .map((item) => item.message || item.field)
            .filter(Boolean)
            .join('. ')
        } else if (Array.isArray(data.errors) && data.errors.length > 0) {
          extractedMessage = data.errors.join('. ')
        } else if (data.message) {
          extractedMessage = data.message
        } else {
          extractedMessage = 'Validation failed. Please check your inputs.'
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

      if (data?.message) {
        extractedMessage = data.message
      } else if (Array.isArray(data?.errors) && data.errors.length > 0) {
        extractedMessage = data.errors.join('. ')
      } else {
        extractedMessage = 'Session expired or invalid credentials. Please sign in again.'
      }

      // Automatically redirect to login page if unauthorized on a protected route
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login'
      }
    }
    // Fallback for other status codes (403, 404, 500, etc.)
    else if (data?.message) {
      extractedMessage = data.message
    } else if (Array.isArray(data?.errors) && data.errors.length > 0) {
      extractedMessage = data.errors.join('. ')
    }

    return Promise.reject(new Error(extractedMessage))
  }
)
