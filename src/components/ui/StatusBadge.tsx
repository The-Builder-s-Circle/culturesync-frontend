import React from 'react'

export interface StatusBadgeProps {
  variant?: 'active' | 'onboarding' | 'on-leave' | 'terminated'
  label?: string
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant = 'active',
  label,
  className = '',
}) => {
  const badgeConfig = {
    active: {
      bg: 'bg-emerald-50 text-emerald-700',
      dot: 'bg-emerald-500',
      defaultLabel: 'Active',
    },
    onboarding: {
      bg: 'bg-blue-50 text-blue-700',
      dot: 'bg-blue-500',
      defaultLabel: 'Onboarding',
    },
    'on-leave': {
      bg: 'bg-amber-50 text-amber-700',
      dot: 'bg-amber-500',
      defaultLabel: 'On Leave',
    },
    terminated: {
      bg: 'bg-red-50 text-red-700',
      dot: 'bg-red-500',
      defaultLabel: 'Terminated',
    },
  }

  const currentConfig = badgeConfig[variant]
  const displayLabel = label || currentConfig.defaultLabel

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${currentConfig.bg} ${className}`.trim()}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${currentConfig.dot}`} />
      <span>{displayLabel}</span>
    </span>
  )
}
