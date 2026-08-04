import React, { useRef, useState } from 'react'
import type { DragEvent, ChangeEvent } from 'react'

export interface FileDropZoneProps {
  accept?: string
  maxSizeMB?: number
  onFileDrop: (file: File) => void
  label?: string
  helperText?: string
  disabled?: boolean
  className?: string
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  accept = '.csv,.xlsx',
  maxSizeMB = 10,
  onFileDrop,
  label = 'Drop your CSV here or click to browse',
  helperText = 'Supports .csv, .xlsx • Max 10MB',
  disabled = false,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const validateAndProcessFile = (file: File) => {
    setError(null)
    const maxSizeBytes = maxSizeMB * 1024 * 1024

    if (file.size > maxSizeBytes) {
      setError(`File size exceeds maximum allowed size of ${maxSizeMB}MB`)
      return
    }

    onFileDrop(file)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      validateAndProcessFile(files[0])
    }
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      validateAndProcessFile(files[0])
    }
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`drop-zone p-8 flex flex-col items-center justify-center text-center cursor-pointer select-none ${
          isDragOver ? 'active' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`.trim()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="w-12 h-12 mb-3 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <p className="text-sm font-medium text-slate-800 mb-1">{label}</p>
        <p className="text-xs text-slate-500">{helperText}</p>
      </div>

      {error && <p className="text-sm text-red-600 font-medium text-center">{error}</p>}
    </div>
  )
}
