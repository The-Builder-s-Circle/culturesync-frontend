import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { AuthSplitLayout } from '../../components/auth'
import { Button, Logo } from '../../components/ui'
import { authApi } from '../../api'

export const VerifyEmployeePage: React.FC = () => {
  const { token } = useParams<{ token: string }>()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(() =>
    token ? 'loading' : 'error'
  )
  const [message, setMessage] = useState(() =>
    token ? '' : 'Invalid verification link. No token provided.'
  )

  useEffect(() => {
    if (!token) return

    const verify = async () => {
      try {
        const res = await authApi.verifyEmployee(token)
        if (res.isSuccess || res.succeeded) {
          setStatus('success')
          setMessage(res.message || res.messages?.join('. ') || 'Employee verified successfully.')
        } else {
          setStatus('error')
          setMessage(
            res.message ||
              res.messages?.join('. ') ||
              (Array.isArray(res.errors) && res.errors.length > 0
                ? res.errors.join('. ')
                : undefined) ||
              'Verification failed. The link may have expired.'
          )
        }
      } catch (err: unknown) {
        setStatus('error')
        setMessage(
          err instanceof Error
            ? err.message
            : 'Verification failed. Please try again or contact your HR admin.'
        )
      }
    }

    verify()
  }, [token])

  return (
    <AuthSplitLayout sidebarVariant="login">
      <div>
        <div className="mb-6">
          <Logo />
        </div>

        {status === 'loading' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Verifying your invitation...
            </h2>
            <p className="text-xs text-slate-600">
              Please wait while we verify your employee invitation.
            </p>
            <div className="flex justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mx-auto">
              <svg
                className="w-6 h-6 text-emerald-600"
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
            <h2 className="text-xl font-bold text-slate-900 tracking-tight text-center">
              You're verified!
            </h2>
            <p className="text-xs text-slate-600 text-center">{message}</p>
            <div className="pt-4">
              <Link to="/auth/login">
                <Button variant="primary" size="lg" className="w-full">
                  Sign in to your account
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight text-center">
              Verification failed
            </h2>
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {message}
            </div>
            <div className="pt-2 space-y-2">
              <Link to="/auth/login">
                <Button variant="secondary" size="lg" className="w-full">
                  Back to sign in
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthSplitLayout>
  )
}
