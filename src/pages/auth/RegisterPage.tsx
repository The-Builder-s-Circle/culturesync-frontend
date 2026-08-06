import React from 'react'
import { AuthSplitLayout, RegisterForm, SsoButtons } from '../../components/auth'

export const RegisterPage: React.FC = () => {
  return (
    <AuthSplitLayout sidebarVariant="register">
      <RegisterForm />
      <SsoButtons />
    </AuthSplitLayout>
  )
}
