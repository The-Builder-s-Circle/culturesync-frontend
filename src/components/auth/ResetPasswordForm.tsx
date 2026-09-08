import React, { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Button, Logo } from '../ui'
import { PasswordInput } from './PasswordInput'
import { calculatePasswordScore } from './passwordUtils'
import { authApi } from '../../api'

export const ResetPasswordForm: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!token) {
      setError('Invalid or missing reset token. Please request a new link.')
      return
    }

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (calculatePasswordScore(newPassword) < 3) {
      setError(
        'Password is too weak. Must achieve "Good" or "Strong" rating (min. 8 characters with letters, numbers & symbols).'
      )
      return
    }

    setIsSubmitting(true)
    try {
      const res = await authApi.resetPassword(token, {
        password: newPassword,
        confirmPassword,
      })

      if (res.isSuccess || res.succeeded) {
        setSuccessMessage(
          res.message || res.messages?.join('. ') || 'Password reset successfully.'
        )
      } else {
        setError(
          res.message ||
            res.messages?.join('. ') ||
            (Array.isArray(res.errors) && res.errors.length > 0
              ? res.errors.join('. ')
              : undefined) ||
            'Failed to reset password. The link may have expired.'
        )
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to reset password. The link may have expired.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div>
        <div className="mb-6">
          <Logo />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Invalid link</h2>
        <p className="mt-2 text-xs text-slate-600">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          to="/auth/forgot-password"
          className="mt-4 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Request new reset link
        </Link>
      </div>
    )
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

      <h2 className="text-xl font-bold text-slate-900 tracking-tight">Set new password</h2>
      <p className="mt-0.5 text-xs text-slate-600">
        Choose a strong password for your account.
      </p>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      {successMessage ? (
        <div className="mt-4 space-y-4">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
            {successMessage}
          </div>
          <Link
            to="/auth/login"
            className="block text-center text-xs font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Sign in with new password
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <PasswordInput
            label="New password"
            placeholder="Enter a new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            showStrengthMeter
            required
          />

          <PasswordInput
            label="Confirm new password"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={
              confirmPassword && confirmPassword !== newPassword
                ? 'Passwords do not match'
                : undefined
            }
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isSubmitting}
          >
            Reset password
          </Button>
        </form>
      )}
    </div>
  )
}
