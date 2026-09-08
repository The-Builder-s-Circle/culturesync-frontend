import React from 'react'
import { AuthSplitLayout, ResetPasswordForm } from '../../components/auth'

export const ResetPasswordPage: React.FC = () => {
  return (
    <AuthSplitLayout sidebarVariant="login">
      <ResetPasswordForm />
    </AuthSplitLayout>
  )
}
