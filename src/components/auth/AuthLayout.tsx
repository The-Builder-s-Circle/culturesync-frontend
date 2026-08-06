import React from 'react'
import type { ReactNode } from 'react'

export interface AuthLayoutProps {
  title: string
  subtitle?: string
  headerBadge?: ReactNode
  children: ReactNode
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  headerBadge,
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
            C
          </div>
          <span className="font-bold text-2xl text-slate-900 tracking-tight">CultureSync</span>
        </div>

        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
        {headerBadge && <div className="mt-3">{headerBadge}</div>}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">{children}</div>
    </div>
  )
}
