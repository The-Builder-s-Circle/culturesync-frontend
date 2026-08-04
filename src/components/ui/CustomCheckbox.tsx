import React, { forwardRef } from 'react'

export interface CustomCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode
  error?: string
}

export const CustomCheckbox = forwardRef<HTMLInputElement, CustomCheckboxProps>(
  ({ label, id, disabled = false, className = '', error, ...props }, ref) => {
    const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={checkboxId}
          className={`flex items-center gap-2 cursor-pointer select-none text-sm text-slate-700 ${
            disabled ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            disabled={disabled}
            className={`custom-checkbox ${className}`.trim()}
            {...props}
          />
          <span>{label}</span>
        </label>
        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      </div>
    )
  }
)

CustomCheckbox.displayName = 'CustomCheckbox'
