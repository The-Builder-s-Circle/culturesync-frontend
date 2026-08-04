import React, { forwardRef } from 'react'

export interface SelectOption {
  label: string
  value: string
}

export interface SelectDropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  error?: string
  helperText?: string
  placeholder?: string
}

export const SelectDropdown = forwardRef<HTMLSelectElement, SelectDropdownProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      placeholder = 'Select an option',
      id,
      className = '',
      disabled = false,
      required = false,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    const baseSelectClasses =
      'w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 appearance-none cursor-pointer pr-10 transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed'

    const errorClasses = error
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
      : ''

    const combinedSelectClassName = `${baseSelectClasses} ${errorClasses} ${className}`.trim()

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-slate-700"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            value={value}
            onChange={onChange}
            className={combinedSelectClassName}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden={required}>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3.5 pointer-events-none text-slate-400 flex items-center justify-center">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-sm text-slate-500">{helperText}</p>}
      </div>
    )
  }
)

SelectDropdown.displayName = 'SelectDropdown'
