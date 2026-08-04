import React, { forwardRef } from 'react'
import type { ReactNode } from 'react'

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      className = '',
      type = 'text',
      disabled = false,
      required = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    const baseInputClasses =
      'w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed'

    const errorClasses = error
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
      : ''

    const leftIconPadding = leftIcon ? 'pl-10' : ''
    const rightIconPadding = rightIcon ? 'pr-10' : ''

    const combinedInputClassName = `${baseInputClasses} ${errorClasses} ${leftIconPadding} ${rightIconPadding} ${className}`.trim()

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700 flex items-center justify-between"
          >
            <span>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center justify-center text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            required={required}
            className={combinedInputClassName}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 flex items-center justify-center text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-sm text-slate-500">{helperText}</p>}
      </div>
    )
  }
)

TextInput.displayName = 'TextInput'
