import React from 'react'
import { calculatePasswordScore } from './passwordUtils'

export interface PasswordStrengthProps {
  value: string
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ value }) => {
  if (!value) return null

  const score = calculatePasswordScore(value)

  const strengthConfig = [
    { label: 'Too short', color: 'bg-red-500', text: 'text-red-600', width: 'w-1/4' },
    { label: 'Weak', color: 'bg-red-500', text: 'text-red-600', width: 'w-1/4' },
    { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600', width: 'w-2/4' },
    { label: 'Good', color: 'bg-indigo-600', text: 'text-indigo-600', width: 'w-3/4' },
    { label: 'Strong', color: 'bg-emerald-600', text: 'text-emerald-600', width: 'w-full' },
  ]

  const current = strengthConfig[score] || strengthConfig[1]

  return (
    <div className="mt-2 space-y-1 font-sans">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Password strength</span>
        <span className={`font-medium ${current.text}`}>{current.label}</span>
      </div>

      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${current.color} transition-all duration-300 ${current.width}`}
        />
      </div>
    </div>
  )
}
