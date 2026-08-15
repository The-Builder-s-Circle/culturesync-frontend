import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import { IconUpload } from '@tabler/icons-react'

export interface LogoUploadProps {
  label?: string
  helperText?: string
  previewUrl: string | null
  onFileSelect: (file: File) => void
}

export function LogoUpload({
  label = 'Company logo',
  helperText = 'PNG, JPG or SVG · Max 2MB',
  previewUrl,
  onFileSelect,
}: LogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  return (
    <div>
      {label && <p className="text-sm font-medium text-slate-700">{label}</p>}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="mt-2 flex size-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 bg-white text-slate-500 transition-colors hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none"
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Company logo preview"
            className="size-24 rounded-2xl object-cover"
          />
        ) : (
          <>
            <IconUpload className="size-5" aria-hidden="true" />
            <span className="text-xs font-medium">Upload</span>
          </>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="hidden"
        onChange={handleChange}
      />
      {helperText && <p className="mt-2 text-xs text-slate-500">{helperText}</p>}
    </div>
  )
}
