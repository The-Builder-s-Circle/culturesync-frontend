import React from 'react'

export interface StepDotProps {
  step: number
  status?: 'pending' | 'active' | 'complete'
  className?: string
}

export const StepDot: React.FC<StepDotProps> = ({
  step,
  status = 'pending',
  className = '',
}) => {
  return (
    <div className={`step-dot ${status} ${className}`.trim()}>
      {status === 'complete' ? (
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        step
      )}
    </div>
  )
}
