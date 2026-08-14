import React, { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router'
import { Button, TextInput, CustomCheckbox } from '../ui'
import { PasswordInput } from './PasswordInput'
import { useAuth } from '../../store'
import { PasswordResetModal } from './PasswordResetModal'
import { tenantApi } from '../../api'

export const SignInForm: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    try {
      const success = await login({ email, password, rememberMe })
      if (success) {
        // Check onboarding completion before deciding redirect
        setIsRedirecting(true)
        try {
          const progressRes = await tenantApi.getOnboardingProgress()
          const progressData = progressRes.data as
            | { isCompleted?: boolean; percentageComplete?: number; percentage?: number }
            | undefined

          const pct = progressData?.percentageComplete ?? progressData?.percentage ?? 0
          if (progressData?.isCompleted === true || pct >= 100) {
            navigate('/dashboard')
          } else {
            navigate('/onboarding')
          }
        } catch {
          // If progress check fails (e.g. cold start), default to onboarding
          // The onboarding resume flow will handle routing to the correct step
          navigate('/onboarding')
        }
      } else {
        setError('Invalid email or password.')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid email or password.'
      setError(message)
    } finally {
      setIsRedirecting(false)
    }
  }

  const mailIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to CultureSync</h2>
        <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-md">
          <span>Demo credentials: any email +</span>
          <span className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-bold">demo1234</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextInput
          label="Work email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={mailIcon}
          required
        />

        <div className="relative">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium text-slate-700">Password *</span>
            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
            >
              Forgot password?
            </button>
          </div>
          <PasswordInput
            label=""
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="pt-1">
          <CustomCheckbox
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            label={<span className="text-xs text-slate-600">Remember me for 30 days</span>}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-4"
          isLoading={isLoading || isRedirecting}
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <Link to="/auth/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Create one free
        </Link>
      </p>

      <PasswordResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />
    </div>
  )
}
