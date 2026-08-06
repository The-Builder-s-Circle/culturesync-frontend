import React, { useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './AuthContextObject'
import type { User, RegisterPayload, LoginPayload } from './AuthContextObject'

const STORAGE_TOKEN_KEY = 'culturesync_auth_token'
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
      await new Promise((resolve) => setTimeout(resolve, 600))
      
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
    } catch (e) {
      console.error('Registration failed', e)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOtp = async (code: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (code === '123456' || code.length === 6) {
        const activeEmail = pendingOtpEmail || user?.email || 'alex@company.com'
        const verifiedUser: User = {
          id: user?.id || `user_${Date.now()}`,
          fullName: user?.fullName || 'Alexandra Morgan',
          email: activeEmail,
          companyName: user?.companyName || 'Acme Corp',
          role: 'admin',
          isVerified: true,
        }

        const mockToken = `jwt_mock_${Date.now()}`
        setUser(verifiedUser)
        setToken(mockToken)
        setPendingOtpEmail(null)

        localStorage.setItem(STORAGE_TOKEN_KEY, mockToken)
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(verifiedUser))
        sessionStorage.removeItem(STORAGE_OTP_EMAIL_KEY)

        return true
      }
      return false
    } catch (e) {
      console.error('OTP verification failed', e)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (payload: LoginPayload): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))

      const loggedInUser: User = {
        id: 'user_demo_123',
        fullName: 'Alexandra Morgan',
        email: payload.email,
        companyName: 'Acme Corp',
        role: 'admin',
        isVerified: true,
      }

      const mockToken = `jwt_mock_${Date.now()}`
      setUser(loggedInUser)
      setToken(mockToken)

      if (payload.rememberMe !== false) {
        localStorage.setItem(STORAGE_TOKEN_KEY, mockToken)
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(loggedInUser))
      }

      return true
    } catch (e) {
      console.error('Login failed', e)
      return false
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
