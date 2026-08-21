import React, { useState } from 'react'
import type { FormEvent } from 'react'
import { Modal, Button } from '../ui'
import { PasswordInput } from './PasswordInput'
import { calculatePasswordScore } from './passwordUtils'
import { authApi } from '../../api'

export interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError(null)
    setSuccessMessage(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

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

      const isOk = Boolean(res.isSuccess || res.succeeded)
      if (isOk) {
        setSuccessMessage(
          res.message || res.messages?.join('. ') || 'Password changed successfully.'
        )
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          handleClose()
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Change your password" size="sm">
      {successMessage ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-900">{successMessage}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <p className="text-xs text-slate-500">
            Choose a strong password you haven't used before.
          </p>

          {error && (
            <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

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
            size="md"
            className="w-full mt-1"
            isLoading={isSubmitting}
          >
            Update password
          </Button>
        </form>
      )}
    </Modal>
  )
}
