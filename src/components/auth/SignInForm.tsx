import React, { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router'
import { Button, TextInput, CustomCheckbox, Logo } from '../ui'
import { PasswordInput } from './PasswordInput'
import { useAuth, getResumeRouteFromProgress } from '../../store'
import { tenantApi } from '../../api'

export const SignInForm: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

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
        setIsRedirecting(true)
        try {
          const progressRes = await tenantApi.getOnboardingProgress()
          const targetRoute = getResumeRouteFromProgress(progressRes.data || progressRes)
          navigate(targetRoute)
        } catch {
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
        <Logo />
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
            <Link
              to="/auth/forgot-password"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Forgot password?
            </Link>
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
    </div>
  )
}
