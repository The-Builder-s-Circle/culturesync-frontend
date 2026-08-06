import React from 'react'
import { AuthSplitLayout, SignInForm, SsoButtons } from '../../components/auth'

export const SignInPage: React.FC = () => {
  return (
    <AuthSplitLayout sidebarVariant="login">
      <SignInForm />
      <SsoButtons />
    </AuthSplitLayout>
  )
}
