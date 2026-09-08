import React, { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router'
import { Button, Logo, TextInput } from '../ui'
import { authApi } from '../../api'

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await authApi.forgotPassword({ email: email.trim() })

      if (res.isSuccess || res.succeeded) {
        setSuccessMessage(
          res.message ||
            res.messages?.join('. ') ||
            'If an account exists with that email, you will receive a password reset link shortly.'
        )
      } else {
        setSuccessMessage(
          'If an account exists with that email, you will receive a password reset link shortly.'
        )
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setSuccessMessage(
        'If an account exists with that email, you will receive a password reset link shortly.'
      )
      console.warn('Forgot password request failed:', message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Logo />
      </div>

      <Link
        to="/auth/login"
        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors mb-4"
      >
        <span>‹</span> Back to sign in
      </Link>

      <h2 className="text-xl font-bold text-slate-900 tracking-tight">Forgot your password?</h2>
      <p className="mt-0.5 text-xs text-slate-600">
        Enter your email and we'll send you a link to reset your password.
      </p>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      {successMessage ? (
        <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
          {successMessage}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <TextInput
            label="Email address"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isSubmitting}
          >
            Send reset link
          </Button>

          <p className="text-center text-xs text-slate-500">
            Remembered it?{' '}
            <Link
              to="/auth/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  )
}
