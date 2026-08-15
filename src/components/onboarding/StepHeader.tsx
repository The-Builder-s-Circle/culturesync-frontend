import type { ReactNode } from 'react'

export interface StepHeaderProps {
  title: string
  description?: string
  badge?: string
  children?: ReactNode
}

export function StepHeader({ title, description, badge, children }: StepHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            {description}
          </p>
        )}
      </div>

      {badge && (
        <div className="shrink-0">
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {badge}
          </span>
        </div>
      )}

      {children}
    </div>
  )
}
