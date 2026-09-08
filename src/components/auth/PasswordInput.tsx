import { useState, forwardRef } from 'react'
import { TextInput } from '../ui'
import type { TextInputProps } from '../ui'
import { PasswordStrength } from './PasswordStrength'

export interface PasswordInputProps extends Omit<TextInputProps, 'type'> {
  showStrengthMeter?: boolean
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ value = '', showStrengthMeter = false, label = 'Password', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    const stringValue = typeof value === 'string' ? value : String(value || '')

    const toggleIcon = (
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="text-slate-400 hover:text-slate-600 p-1 focus:outline-none transition-colors"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? (
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
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a9.98 9.98 0 014.122-.963c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18"
            />
          </svg>
        ) : (
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        )}
      </button>
    )

    const lockIcon = (
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
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    )

    return (
      <div className="w-full">
        <TextInput
          ref={ref}
          label={label}
          type={showPassword ? 'text' : 'password'}
          value={value}
          leftIcon={lockIcon}
          rightIcon={toggleIcon}
          {...props}
        />
        {showStrengthMeter && <PasswordStrength value={stringValue} />}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
