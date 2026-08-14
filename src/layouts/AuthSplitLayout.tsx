import React from 'react'
import type { ReactNode } from 'react'
import { Logo } from '../components/ui/Logo'
import { AuthSidebar } from '../components/auth/AuthSidebar'

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
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans">
      {/* Left Column: Form & Navigation (70%) */}
      <div className="w-full lg:w-[70%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 min-h-screen">
        {/* Top Header Logo */}
        <div>
          <Logo />
        </div>

        {/* Centered Children Container */}
        <div className="my-auto w-full max-w-md mx-auto py-8">{children}</div>

        {/* Bottom Footer */}
        <div className="text-center text-xs text-slate-400 py-2">
          © 2025 CultureSync · <a href="#privacy" className="hover:underline">Privacy</a> · <a href="#terms" className="hover:underline">Terms</a>
        </div>
      </div>

      {/* Right Column: Dark Sidebar Panel (30%) */}
      <div className="hidden lg:flex lg:w-[30%]">
        <AuthSidebar variant={sidebarVariant} targetEmail={targetEmail} />
      </div>
    </div>
  )
}
