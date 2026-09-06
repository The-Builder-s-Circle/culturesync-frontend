import React, { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button, Logo } from '../ui'
import { PasswordInput } from './PasswordInput'
import { calculatePasswordScore } from './passwordUtils'
import { authApi } from '../../api'

export const ForgotPasswordForm: React.FC = () => {
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from the current password.')
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
      const res = await authApi.changePassword({
        currentPassword,
        newPasswordHash: newPassword,
        confirmPassword,
      })

      if (res.isSuccess || res.succeeded) {
        setSuccessMessage(
          res.message || res.messages?.join('. ') || 'Password changed successfully.'
        )
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          navigate('/auth/login')
        }, 2000)
      } else {
        setError(
          res.message ||
            res.messages?.join('. ') ||
            (Array.isArray(res.errors) && res.errors.length > 0
              ? res.errors.join('. ')
              : undefined) ||
            'Failed to change password. Please try again.'
        )
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to change password. Please try again.'
      setError(message)
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

      <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reset your password</h2>
      <p className="mt-0.5 text-xs text-slate-600">
        Set a new password for your account.
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
          <PasswordInput
            label="Current password"
            placeholder="Enter your current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

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
            Update password
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
