import { Link } from 'react-router'
import { Button } from '../ui'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'

export interface StepFooterProps {
  backTo?: string
  backLabel?: string
  onBack?: () => void
  continueTo?: string
  continueLabel?: string
  continueDisabled?: boolean
  onContinue?: () => void
  children?: React.ReactNode
}

export function StepFooter({
  backTo,
  backLabel = 'Back',
  onBack,
  continueTo,
  continueLabel = 'Continue',
  continueDisabled = false,
  onContinue,
  children,
}: StepFooterProps) {
  return (
    <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
      {backTo ? (
        <Link to={backTo}>
          <Button variant="secondary" onClick={onBack}>
            <IconArrowLeft className="size-4" aria-hidden="true" />
            {backLabel}
          </Button>
        </Link>
      ) : (
        <span />
      )}

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {children}
        {continueTo ? (
          <Link to={continueTo} className={continueDisabled ? 'pointer-events-none' : ''}>
            <Button
              variant="primary"
              disabled={continueDisabled}
              onClick={onContinue}
              className="w-full sm:w-auto"
            >
              {continueLabel}
              <IconArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </Link>
        ) : (
          onContinue && (
            <Button
              variant="primary"
              disabled={continueDisabled}
              onClick={onContinue}
              className="w-full sm:w-auto"
            >
              {continueLabel}
              <IconArrowRight className="size-4" aria-hidden="true" />
            </Button>
          )
        )}
      </div>
    </div>
  )
}
