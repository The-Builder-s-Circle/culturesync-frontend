import React, { useRef, useEffect } from 'react'
import type { ChangeEvent, KeyboardEvent, ClipboardEvent } from 'react'

export interface OTPInputProps {
  length?: number
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value = '',
  onChange,
  disabled = false,
  className = '',
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length)
  }, [length])

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value
    if (!/^\d*$/.test(val)) return

    const lastChar = val.slice(-1)
    const newValues = value.split('')
    newValues[index] = lastChar

    const updatedOtp = newValues.join('')
    onChange(updatedOtp)

    if (lastChar && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, length)
    if (pastedData) {
      onChange(pastedData)
      const nextFocusIndex = Math.min(pastedData.length, length - 1)
      inputRefs.current[nextFocusIndex]?.focus()
    }
  }

  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-3 ${className}`.trim()}>
      {Array.from({ length }).map((_, index) => {
        const char = value[index] || ''
        const isFilled = Boolean(char)

        return (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={char}
            disabled={disabled}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className={`otp-input ${isFilled ? 'filled' : ''}`}
            aria-label={`Digit ${index + 1} of ${length}`}
          />
        )
      })}
    </div>
  )
}
