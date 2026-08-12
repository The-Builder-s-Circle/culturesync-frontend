import React, { useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './AuthContextObject'
import type { User, RegisterPayload, LoginPayload } from './AuthContextObject'
import { authApi, STORAGE_TOKEN_KEY } from '../api'

const STORAGE_USER_KEY = 'culturesync_auth_user'
const STORAGE_OTP_EMAIL_KEY = 'culturesync_pending_otp_email'

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_TOKEN_KEY)
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
        // Extract token & user info from API response data if returned, else set active user state
        const apiData = res.data as { token?: string; user?: User } | undefined
        const authToken = apiData?.token || `token_${Date.now()}`

        const loggedInUser: User = apiData?.user || {
          id: user?.id || `user_${Date.now()}`,
          fullName: user?.fullName || 'Admin User',
          email: payload.email,
          companyName: user?.companyName || 'Organization',
          role: 'admin',
          isVerified: true,
        }

        setUser(loggedInUser)
        setToken(authToken)

        if (payload.rememberMe !== false) {
          localStorage.setItem(STORAGE_TOKEN_KEY, authToken)
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
    setPendingOtpEmail(null)
    localStorage.removeItem(STORAGE_TOKEN_KEY)
    localStorage.removeItem(STORAGE_USER_KEY)
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
