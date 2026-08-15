import type { ComponentType } from 'react'
import { IconCheck, IconTrash, IconBuilding } from '@tabler/icons-react'

export interface DepartmentCardProps {
  id: string
  name: string
  icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
  iconBg?: string
  iconColor?: string
  isSelected: boolean
  isCustom?: boolean
  onToggle: () => void
  onRemove?: () => void
}

export function DepartmentCard({
  name,
  icon: Icon = IconBuilding,
  iconBg = 'bg-indigo-100',
  iconColor = 'text-indigo-600',
  isSelected,
  isCustom = false,
  onToggle,
  onRemove,
}: DepartmentCardProps) {
  return (
    <div
      onClick={onToggle}
      className={`group flex cursor-pointer items-center justify-between rounded-2xl p-3.5 text-left transition-all duration-150 ${
        isSelected
          ? 'border-2 border-indigo-600 bg-indigo-50/40 shadow-xs'
          : 'border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ${iconBg} ${iconColor}`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <span
          className={`truncate text-sm font-semibold transition-colors ${
            isSelected ? 'text-indigo-600' : 'text-slate-800'
          }`}
        >
          {name}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {isSelected && (
          <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xs">
            <IconCheck className="size-3.5 stroke-[3]" aria-hidden="true" />
          </div>
        )}

        {isCustom && onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            aria-label={`Remove ${name}`}
            className="rounded-lg p-1 text-slate-400 opacity-70 transition-colors hover:bg-red-100 hover:text-red-600 hover:opacity-100"
          >
            <IconTrash className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}
