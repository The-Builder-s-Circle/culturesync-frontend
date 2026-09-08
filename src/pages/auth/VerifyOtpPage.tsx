import React from 'react'
import { AuthSplitLayout, VerifyOtpForm } from '../../components/auth'
import { useAuth } from '../../store'

export const VerifyOtpPage: React.FC = () => {
  const { pendingOtpEmail, user } = useAuth()
  const targetEmail = pendingOtpEmail || user?.email || 'oriolowomustapha@gmail.com'

  return (
    <AuthSplitLayout sidebarVariant="verify-otp" targetEmail={targetEmail}>
      <VerifyOtpForm />
    </AuthSplitLayout>
  )
}
