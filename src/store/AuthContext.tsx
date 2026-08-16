import React, { useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './AuthContextObject'
import type { User, RegisterPayload, LoginPayload } from './AuthContextObject'
import { authApi, tenantApi, STORAGE_TOKEN_KEY, extractTenantId, getTenantIdFromJwt } from '../api'

const STORAGE_USER_KEY = 'culturesync_auth_user'
const STORAGE_OTP_EMAIL_KEY = 'culturesync_pending_otp_email'
const STORAGE_TENANT_ID_KEY = 'culturesync_tenant_id'

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_TOKEN_KEY)
    } catch {
      return null
    }
  })

  const [tenantId, setTenantId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_TENANT_ID_KEY)
    } catch {
      return null
    }
  })

  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_USER_KEY)
      return storedUser ? (JSON.parse(storedUser) as User) : null
    } catch {
      return null
    }
  })

  const [pendingOtpEmail, setPendingOtpEmail] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(STORAGE_OTP_EMAIL_KEY)
    } catch {
      return null
    }
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const register = async (payload: RegisterPayload): Promise<boolean> => {
    setIsLoading(true)
    try {
      const password = payload.password || ''
      const res = await authApi.signUpAdmin({
        adminWorkEmail: payload.workEmail,
        fullName: payload.fullName,
        phoneNumber: payload.phoneNumber || '',
        companyName: payload.companyName,
        passwordHash: password,
        confirmPassword: password,
      })

      const isSuccessful = Boolean(res.isSuccess || res.succeeded)
      if (isSuccessful) {
        setPendingOtpEmail(payload.workEmail)
        sessionStorage.setItem(STORAGE_OTP_EMAIL_KEY, payload.workEmail)

        const tempUser: User = {
          id: `user_${Date.now()}`,
          fullName: payload.fullName,
          email: payload.workEmail,
          companyName: payload.companyName,
          role: 'admin',
          isVerified: false,
        }
        setUser(tempUser)
        return true
      }
      return false
    } catch (e) {
      console.error('Registration failed', e)
      throw e
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOtp = async (code: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const activeEmail = pendingOtpEmail || user?.email || ''
      if (!activeEmail) {
        throw new Error('No pending email found for verification.')
      }

      const res = await authApi.verifyOtp(activeEmail, code)
      const isSuccessful = Boolean(res.isSuccess || res.succeeded)

      if (isSuccessful) {
        const verifiedUser: User = {
          id: user?.id || `user_${Date.now()}`,
          fullName: user?.fullName || 'Admin User',
          email: activeEmail,
          companyName: user?.companyName || 'Organization',
          role: 'admin',
          isVerified: true,
        }

        setUser(verifiedUser)
        setPendingOtpEmail(null)
        sessionStorage.removeItem(STORAGE_OTP_EMAIL_KEY)
        return true
      }
      return false
    } catch (e) {
      console.error('OTP verification failed', e)
      throw e
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (payload: LoginPayload): Promise<boolean> => {
    setIsLoading(true)
    try {
      const res = await authApi.login({
        workEmail: payload.email,
        password: payload.password || '',
      })

      const isSuccessful = Boolean(res.isSuccess || res.succeeded)
      if (isSuccessful) {
        // 1. Extract authentication token
        const rawData = res.data
        let authToken = ''
        if (typeof rawData === 'string') {
          authToken = rawData
        } else if (rawData && typeof rawData === 'object') {
          const dataObj = rawData as Record<string, unknown>
          authToken = (dataObj.token || dataObj.accessToken || dataObj.jwt || '') as string
        }

        if (!authToken) {
          authToken = `token_${Date.now()}`
        }

        // Store token immediately so subsequent requests are authenticated
        setToken(authToken)
        localStorage.setItem(STORAGE_TOKEN_KEY, authToken)

        // 2. Extract tenant ID from response, JWT claims, or live lookup
        let resolvedTenantId =
          extractTenantId(res.data) ||
          extractTenantId(res) ||
          getTenantIdFromJwt(authToken)

        if (!resolvedTenantId && authToken) {
          try {
            const lookupRes = await tenantApi.lookup()
            resolvedTenantId = extractTenantId(lookupRes)
          } catch (lookupErr) {
            console.warn('Post-login tenant lookup deferred:', lookupErr)
          }
        }

        if (resolvedTenantId) {
          setTenantId(resolvedTenantId)
          localStorage.setItem(STORAGE_TENANT_ID_KEY, resolvedTenantId)
        }

        const apiUser =
          rawData && typeof rawData === 'object'
            ? ((rawData as Record<string, unknown>).user as User | undefined)
            : undefined

        const loggedInUser: User = apiUser || {
          id: user?.id || `user_${Date.now()}`,
          fullName: user?.fullName || 'Admin User',
          email: payload.email,
          companyName: user?.companyName || 'Organization',
          tenantId: resolvedTenantId || undefined,
          role: 'admin',
          isVerified: true,
        }

        setUser(loggedInUser)

        if (payload.rememberMe !== false) {
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(loggedInUser))
        }

        return true
      }
      return false
    } catch (e) {
      console.error('Login failed', e)
      throw e
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setTenantId(null)
    setPendingOtpEmail(null)
    localStorage.removeItem(STORAGE_TOKEN_KEY)
    localStorage.removeItem(STORAGE_USER_KEY)
    localStorage.removeItem(STORAGE_TENANT_ID_KEY)
    sessionStorage.removeItem(STORAGE_OTP_EMAIL_KEY)
  }

  const resendOtp = async (): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return true
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        tenantId,
        pendingOtpEmail,
        isAuthenticated: Boolean(token && user?.isVerified),
        isLoading,
        register,
        verifyOtp,
        login,
        logout,
        resendOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
