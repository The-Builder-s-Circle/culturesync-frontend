import React from 'react'
import { AuthSplitLayout, ForgotPasswordForm } from '../../components/auth'

export const ForgotPasswordPage: React.FC = () => {
  return (
    <AuthSplitLayout sidebarVariant="login">
      <ForgotPasswordForm />
    </AuthSplitLayout>
  )
}
