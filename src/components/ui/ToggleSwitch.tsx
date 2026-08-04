import React, { forwardRef } from 'react'

export interface ToggleSwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

export const ToggleSwitch = forwardRef<HTMLInputElement, ToggleSwitchProps>(
  ({ label, description, id, disabled = false, className = '', ...props }, ref) => {
    const toggleId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="flex items-center justify-between gap-4 w-full select-none">
        {(label || description) && (
          <label
            htmlFor={toggleId}
            className={`flex flex-col cursor-pointer ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
            {description && <span className="text-xs text-slate-500">{description}</span>}
          </label>
        )}

        <input
          ref={ref}
          id={toggleId}
          type="checkbox"
          disabled={disabled}
          className={`toggle ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`.trim()}
          {...props}
        />
      </div>
    )
  }
)

ToggleSwitch.displayName = 'ToggleSwitch'
