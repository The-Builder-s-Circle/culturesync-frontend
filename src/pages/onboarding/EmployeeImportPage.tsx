import { useState } from 'react'
import { Button, FileDropZone, TextInput } from '../../components/ui'
import { StepFooter } from '../../components/onboarding/StepFooter'
import {
  IconCheck,
  IconDownload,
  IconFileSpreadsheet,
  IconPlus,
  IconTrash,
  IconUser,
} from '@tabler/icons-react'

type Mode = 'upload' | 'manual'

interface ManualRow {
  id: string
  fullName: string
  email: string
  department: string
  jobTitle: string
}

const SAMPLE_CSV = 'first_name,last_name,email,department,job_title\nJane,Doe,jane@example.com,Engineering,Software Engineer\nJohn,Smith,john@example.com,Marketing,Marketing Manager'

export default function EmployeeImportPage() {
  const [mode, setMode] = useState<Mode>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [rows, setRows] = useState<ManualRow[]>([
    { id: 'row-1', fullName: '', email: '', department: '', jobTitle: '' },
  ])

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { id: `row-${Date.now()}`, fullName: '', email: '', department: '', jobTitle: '' },
    ])

  const updateRow = (id: string, field: keyof ManualRow, value: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))

  const removeRow = (id: string) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev))

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employee-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const manualCount = rows.filter((r) => r.fullName.trim() || r.email.trim()).length

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Employee Import
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
        Bring your roster into CultureSync. Upload a spreadsheet or enter employees
        manually — you can always add more later.
      </p>

      {/* Mode toggle */}
      <div className="mt-8 inline-flex rounded-xl border border-slate-200 bg-white p-1">
        {(['upload', 'manual'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === m ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {m === 'upload' ? 'Upload CSV' : 'Enter manually'}
          </button>
        ))}
      </div>

      {mode === 'upload' ? (
        <div className="mt-6">
          {!selectedFile ? (
            <>
              <FileDropZone
                accept=".csv,.xlsx"
                label="Drop your roster file here or click to browse"
                helperText="Supports .csv, .xlsx • Max 10MB"
                onFileDrop={(file) => setSelectedFile(file)}
              />
              <button
                type="button"
                onClick={downloadTemplate}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                <IconDownload className="size-4" aria-hidden="true" />
                Download CSV template
              </button>
            </>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <IconFileSpreadsheet className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Ready to import
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    <IconCheck className="size-3.5" aria-hidden="true" />
                    Ready
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                  Change file
                </Button>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">Required columns</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['First name', 'Last name', 'Work email', 'Department', 'Job title'].map(
                    (col) => (
                      <span
                        key={col}
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-mono text-[11px] text-slate-600"
                      >
                        {col}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="hidden grid-cols-[1.2fr_1.2fr_1fr_1fr_48px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5 sm:grid">
            {['Full name', 'Work email', 'Department', 'Job title', ''].map((h, i) => (
              <span key={i} className="text-xs font-semibold text-slate-500">
                {h}
              </span>
            ))}
          </div>
          <div className="divide-y divide-slate-100">
            {rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-[1.2fr_1.2fr_1fr_1fr_48px] sm:items-center"
              >
                <TextInput
                  placeholder="Full name"
                  value={row.fullName}
                  onChange={(e) => updateRow(row.id, 'fullName', e.target.value)}
                />
                <TextInput
                  placeholder="name@company.com"
                  value={row.email}
                  onChange={(e) => updateRow(row.id, 'email', e.target.value)}
                />
                <TextInput
                  placeholder="Department"
                  value={row.department}
                  onChange={(e) => updateRow(row.id, 'department', e.target.value)}
                />
                <TextInput
                  placeholder="Job title"
                  value={row.jobTitle}
                  onChange={(e) => updateRow(row.id, 'jobTitle', e.target.value)}
                />
                <div className="flex justify-end sm:justify-center">
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length <= 1}
                    aria-label="Remove row"
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                  >
                    <IconTrash className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 px-4 py-3">
            <Button variant="ghost" size="sm" onClick={addRow}>
              <IconPlus className="size-4" aria-hidden="true" />
              Add row
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
        <IconUser className="size-4 shrink-0" aria-hidden="true" />
        {mode === 'upload'
          ? selectedFile
            ? `"${selectedFile.name}" is ready for import.`
            : 'No file selected yet — importing is optional, you can skip this step.'
          : `${manualCount} employee${manualCount === 1 ? '' : 's'} entered.`}
      </div>

      <StepFooter backTo="/onboarding/job-titles" continueTo="/onboarding/invite" />
    </div>
  )
}
