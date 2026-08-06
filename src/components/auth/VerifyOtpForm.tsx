import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, OTPInput } from '../ui'
import { useAuth } from '../../store'

export const VerifyOtpForm: React.FC = () => {
  const navigate = useNavigate()
  const { pendingOtpEmail, user, verifyOtp, resendOtp, isLoading } = useAuth()

  const [otpCode, setOtpCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // 5-minute countdown timer (300 seconds)
  const [expirySeconds, setExpirySeconds] = useState(300)
  const [resendCooldown, setResendCooldown] = useState(60)

  const targetEmail = pendingOtpEmail || user?.email || 'oriolowomustapha@gmail.com'
  const canResend = resendCooldown === 0

  useEffect(() => {
    if (expirySeconds <= 0) return
    const timer = setInterval(() => {
      setExpirySeconds((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [expirySeconds])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleVerify = async () => {
    setError(null)
    if (otpCode.length < 6) {
      setError('Please enter all 6 digits of the verification code.')
      return
    }

    const success = await verifyOtp(otpCode)
    if (success) {
      navigate('/onboarding')
    } else {
      setError('Invalid verification code. Use 123456 in this demo.')
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    setError(null)
    setSuccessMessage(null)

    const success = await resendOtp()
    if (success) {
      setSuccessMessage('New code sent! Check your inbox.')
      setResendCooldown(60)
      setExpirySeconds(300)
    }
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remainder = secs % 60
    return `${mins}:${remainder.toString().padStart(2, '0')}`
  }

  return (
    <div>
      <Link
        to="/auth/register"
        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors mb-6"
      >
        <span>‹</span> Back to register
      </Link>

      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Verify your email</h2>
      <p className="mt-1 text-sm text-slate-600">
        Enter the 6-digit code sent to <br />
        <span className="font-semibold text-slate-900">{targetEmail}</span>
      </p>

      {error && (
        <div className="mt-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mt-6 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="py-6">
        <OTPInput value={otpCode} onChange={setOtpCode} disabled={isLoading} />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
        <span>Expires in</span>
        <span className="font-mono font-medium text-amber-600">{formatTime(expirySeconds)}</span>
      </div>

      <Button
        type="button"
        variant="primary"
        size="lg"
        className="w-full"
        onClick={handleVerify}
        isLoading={isLoading}
      >
        Verify email
      </Button>

      <div className="mt-6 text-center text-sm text-slate-500">
        <span>Didn't receive it? </span>
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors focus:outline-none"
          >
            Resend code
          </button>
        ) : (
          <span className="text-slate-400">Resend code in {resendCooldown}s</span>
        )}
      </div>
    </div>
  )
}
