import { createContext } from 'react'

export interface User {
  id: string
  fullName: string
  email: string
  companyName: string
  tenantId?: string
  role: 'admin' | 'hr_manager' | 'employee'
  isVerified: boolean
}

export interface RegisterPayload {
  fullName: string
  workEmail: string
  phoneNumber?: string
  companyName: string
  password?: string
}

export interface LoginPayload {
  email: string
  password?: string
  rememberMe?: boolean
}

export interface AuthContextType {
  user: User | null
  token: string | null
  tenantId: string | null
  pendingOtpEmail: string | null
  isAuthenticated: boolean
  isLoading: boolean
  register: (payload: RegisterPayload) => Promise<boolean>
  verifyOtp: (code: string) => Promise<boolean>
  login: (payload: LoginPayload) => Promise<boolean>
  logout: () => void
  resendOtp: () => Promise<boolean>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
