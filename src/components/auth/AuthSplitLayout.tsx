import React from 'react'
import type { ReactNode } from 'react'
import { Logo } from '../ui/Logo'
import { AuthSidebar } from './AuthSidebar'

export interface AuthSplitLayoutProps {
  children: ReactNode
  sidebarVariant?: 'register' | 'login' | 'verify-otp'
  targetEmail?: string
}

export const AuthSplitLayout: React.FC<AuthSplitLayoutProps> = ({
  children,
  sidebarVariant = 'register',
  targetEmail,
}) => {
  return (
    <div className="h-screen max-h-screen bg-white flex flex-col lg:flex-row font-sans overflow-hidden">
      {/* Left Column: Form & Navigation (70%) */}
      <div className="w-full lg:w-[70%] h-full flex flex-col justify-between p-4 sm:p-6 lg:px-10 lg:py-5 overflow-y-auto lg:overflow-hidden">
        {/* Top Header Logo */}
        <div className="shrink-0">
          <Logo />
        </div>

        {/* Centered Children Container */}
        <div className="my-auto w-full max-w-md mx-auto py-1 shrink-0">{children}</div>

        {/* Bottom Footer */}
        <div className="text-center text-xs text-slate-400 py-1 shrink-0">
          © 2025 CultureSync · <a href="#privacy" className="hover:underline">Privacy</a> · <a href="#terms" className="hover:underline">Terms</a>
        </div>
      </div>

      {/* Right Column: Dark Sidebar Panel (30%) */}
      <div className="hidden lg:flex lg:w-[30%] h-full">
        <AuthSidebar variant={sidebarVariant} targetEmail={targetEmail} />
      </div>
    </div>
  )
}
