import React, { useState } from 'react'
import type { FormEvent } from 'react'
import { Modal, TextInput, Button } from '../ui'

export interface PasswordResetModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [resetEmail, setResetEmail] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!resetEmail) return

    setResetLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setResetLoading(false)
    setResetSuccess(true)

    setTimeout(() => {
      onClose()
      setResetSuccess(false)
      setResetEmail('')
    }, 2500)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reset your password" size="sm">
      {resetSuccess ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            ✓
          </div>
          <p className="text-sm font-medium text-slate-900">
            Password reset link sent to your email.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Check your inbox to complete the process.
          </p>
        </div>
      ) : (
        <form onSubmit={handleResetSubmit} className="space-y-4 pt-2">
          <p className="text-sm text-slate-600">
            Enter your work email address and we'll send you a link to reset your password.
          </p>
          <TextInput
            label="Work email"
            type="email"
            placeholder="you@company.com"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            isLoading={resetLoading}
          >
            Send reset link
          </Button>
        </form>
      )}
    </Modal>
  )
}
