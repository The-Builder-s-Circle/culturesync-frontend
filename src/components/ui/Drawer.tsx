import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'

export interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  position?: 'right' | 'left'
  className?: string
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const positionClasses = {
    right: 'right-0 animate-slide-in',
    left: 'left-0 animate-slide-in',
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`fixed top-0 h-full w-96 max-w-full bg-white shadow-lg flex flex-col ${positionClasses[position]} ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          {title ? (
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close drawer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>,
    document.body
  )
}
