import { apiClient } from './client'

export interface BaseApiResponse<T = unknown> {
  isSuccess?: boolean
  succeeded?: boolean
  message?: string | null
  messages?: string[] | null
  errors?: string[] | null
  data?: T
}

export interface SignUpAdminPayload {
  adminWorkEmail: string
  fullName: string
  phoneNumber?: string
  companyName: string
  passwordHash: string
  confirmPassword: string
}

export interface LoginPayload {
  workEmail: string
  password: string
}

export interface ChangePasswordRequest {
  currentPassword?: string
  newPasswordHash?: string
  confirmPassword?: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  password: string
  confirmPassword: string
}

export interface CreateEmployeeCommand {
  firstName?: string
  lastName?: string
  workEmail?: string
  phoneNumber?: string
  departmentId: string
  jobTitleId: string
  userId: string
  hireDate: string
  managerEmail?: string
}

export const authApi = {
  /**
   * Sign up organization admin (POST /api/Auth/tenant/signup-admin)
   */
  signUpAdmin: async (payload: SignUpAdminPayload): Promise<BaseApiResponse> => {
    const response = await apiClient.post<BaseApiResponse>(
      '/api/Auth/tenant/signup-admin',
      payload
    )
    return response.data
  },

  /**
   * Login user (POST /api/Auth/login)
   */
  login: async (payload: LoginPayload): Promise<BaseApiResponse> => {
    const response = await apiClient.post<BaseApiResponse>('/api/Auth/login', payload)
    return response.data
  },

  /**
   * Verify OTP code (POST /api/Auth/verify-otp/{email})
   */
  verifyOtp: async (email: string, code: string): Promise<BaseApiResponse> => {
    const encodedEmail = encodeURIComponent(email)
    const response = await apiClient.post<BaseApiResponse>(
      `/api/Auth/verify-otp/${encodedEmail}`,
      JSON.stringify(code),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  },

  /**
   * Change password (POST /api/Auth/change-password)
   */
  changePassword: async (payload: ChangePasswordRequest): Promise<BaseApiResponse> => {
    const response = await apiClient.post<BaseApiResponse>('/api/Auth/change-password', payload)
    return response.data
  },

  /**
   * Forgot password - sends reset email (POST /api/Auth/forgotpassword)
   */
  forgotPassword: async (payload: ForgotPasswordRequest): Promise<BaseApiResponse> => {
    const response = await apiClient.post<BaseApiResponse>(
      '/api/Auth/forgotpassword',
      payload
    )
    return response.data
  },

  /**
   * Reset password with token (POST /api/Auth/passwordreset/{token})
   */
  resetPassword: async (
    token: string,
    payload: ResetPasswordRequest
  ): Promise<BaseApiResponse> => {
    const encodedToken = encodeURIComponent(token)
    const response = await apiClient.post<BaseApiResponse>(
      `/api/Auth/passwordreset/${encodedToken}`,
      payload
    )
    return response.data
  },

  /**
   * Verify invited employee token (POST /api/Auth/verify-employee/{Token})
   */
  verifyEmployee: async (token: string): Promise<BaseApiResponse> => {
    const encodedToken = encodeURIComponent(token)
    const response = await apiClient.post<BaseApiResponse>(
      `/api/Auth/verify-employee/${encodedToken}`
    )
    return response.data
  },

  /**
   * Create employee manually (POST /api/tenants/{tenantId}/employees/create)
   */
  createEmployee: async (
    tenantId: string,
    payload: CreateEmployeeCommand
  ): Promise<BaseApiResponse> => {
    const response = await apiClient.post<BaseApiResponse>(
      `/api/tenants/${encodeURIComponent(tenantId)}/employees/create`,
      payload
    )
    return response.data
  },
}
