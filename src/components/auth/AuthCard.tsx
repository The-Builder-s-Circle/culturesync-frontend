import React from 'react'
import type { ReactNode } from 'react'

export interface AuthCardProps {
  children: ReactNode
  className?: string
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10 ${className}`.trim()}
    >
      {children}
    </div>
  )
}
