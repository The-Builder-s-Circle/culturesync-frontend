import React, { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, TextInput, CustomCheckbox } from '../ui'
import { PasswordInput } from './PasswordInput'
import { calculatePasswordScore } from './passwordUtils'
import { useAuth } from '../../store'

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate()
  const { register, isLoading } = useAuth()

  const [fullName, setFullName] = useState('')
  const [workEmail, setWorkEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullName || !workEmail || !companyName || !password || !confirmPassword) {
      setError('Please fill in all required fields.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirm password field.')
      return
    }

    const strengthScore = calculatePasswordScore(password)
    if (strengthScore < 3) {
      setError('Password is too weak. Must achieve "Good" or "Strong" rating (min. 8 characters with letters, numbers & symbols) to proceed.')
      return
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.')
      return
    }

    const success = await register({
      fullName,
      workEmail,
      companyName,
      password,
    })

    if (success) {
      navigate('/auth/verify-otp')
    } else {
      setError('Registration failed. Please try again.')
    }
  }

  const userIcon = (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )

  const mailIcon = (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )

  const buildingIcon = (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0V5" />
    </svg>
  )

  const passwordMismatch = Boolean(confirmPassword && confirmPassword !== password)

  return (
    <div>
      <div className="mb-2 sm:mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Create your account</h2>
        <p className="text-[11px] sm:text-xs text-slate-500">Start your 14-day free trial — no credit card required</p>
      </div>

      {error && (
        <div className="mb-2 p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <form className="space-y-2" onSubmit={handleSubmit}>
        <TextInput
          label="Full name *"
          placeholder="Oriolowo Mustapha"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={userIcon}
          required
        />

        <TextInput
          label="Work email *"
          type="email"
          placeholder="you@company.com"
          value={workEmail}
          onChange={(e) => setWorkEmail(e.target.value)}
          leftIcon={mailIcon}
          required
        />

        <TextInput
          label="Company name *"
          placeholder="Apha-Base"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          leftIcon={buildingIcon}
          required
        />

        <PasswordInput
          label="Password *"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showStrengthMeter
          required
        />

        <PasswordInput
          label="Confirm password *"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={passwordMismatch ? 'Passwords do not match' : undefined}
          required
        />

        <div className="pt-0.5">
          <CustomCheckbox
            id="terms"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            label={
              <span className="text-[11px] text-slate-600">
                I agree to CultureSync's{' '}
                <a href="#terms" className="text-indigo-600 font-medium hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" className="text-indigo-600 font-medium hover:underline">
                  Privacy Policy
                </a>
              </span>
            }
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          className="w-full mt-1.5"
          isLoading={isLoading}
        >
          Create account
        </Button>
      </form>

      <p className="mt-2 text-center text-xs text-slate-600">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Sign in
        </Link>
      </p>
    </div>
  )
}
