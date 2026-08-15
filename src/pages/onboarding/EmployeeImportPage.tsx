import { useState } from 'react'
import { useNavigate } from 'react-router'
import { TextInput } from '../../components/ui'
import { StepFooter, StepHeader } from '../../components/onboarding'
import {
  IconFileSpreadsheet,
  IconPencil,
  IconPlayerTrackNext,
  IconUpload,
  IconInfoCircle,
  IconPlus,
  IconTrash,
  IconFileCheck,
} from '@tabler/icons-react'
import { useOnboarding, useAuth } from '../../store'
import { employeeApi, tenantApi } from '../../api'
import type { EmployeeImportDto } from '../../api'

type Mode = 'upload' | 'manual'

interface ManualRow {
  id: string
  fullName: string
  email: string
  department: string
  jobTitle: string
}

const SAMPLE_CSV = `first_name,last_name,email,department,job_title,hire_date
Alexandra,Morgan,alex@company.com,Engineering,Senior Engineer,2025-01-15
Marcus,Williams,marcus@company.com,Sales,Account Executive,2025-02-01
Priya,Patel,priya@company.com,Product,Product Manager,2025-02-15`

export default function EmployeeImportPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { tenantId, setTenantId, markStepComplete } = useOnboarding()

  const [mode, setMode] = useState<Mode>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validatedRows, setValidatedRows] = useState<EmployeeImportDto[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Manual entry rows state (defaults to 3 empty rows matching screenshot)
  const [rows, setRows] = useState<ManualRow[]>([
    { id: 'row-1', fullName: '', email: '', department: '', jobTitle: '' },
    { id: 'row-2', fullName: '', email: '', department: '', jobTitle: '' },
    { id: 'row-3', fullName: '', email: '', department: '', jobTitle: '' },
  ])

  const addRow = () => {
    if (rows.length >= 20) return
    setRows((prev) => [
      ...prev,
      { id: `row-${Date.now()}`, fullName: '', email: '', department: '', jobTitle: '' },
    ])
  }

  const updateRow = (id: string, field: keyof ManualRow, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const removeRow = (id: string) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev))
  }

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employee-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = async (file: File) => {
    setError(null)
    setSelectedFile(file)
    setIsValidating(true)

    try {
      let activeTenantId: string | null = tenantId || user?.tenantId || null
      if (!activeTenantId) {
        const lookup = await tenantApi.lookup()
        const lookupData = lookup.data as { tenantId?: string; id?: string } | undefined
        const resolvedId = lookupData?.tenantId || lookupData?.id || null
        if (resolvedId) {
          activeTenantId = resolvedId
          setTenantId(resolvedId)
        }
      }

      if (!activeTenantId) {
        throw new Error('Tenant identifier not found. Please complete previous setup steps.')
      }

      const res = await employeeApi.validateImport(activeTenantId, file)
      if ((res.isSuccess || res.succeeded) && res.data) {
        setValidatedRows(res.data)
      } else {
        setError(res.message || 'Validation failed. Please check the file formatting.')
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to validate file. Please try again.'
      setError(message)
    } finally {
      setIsValidating(false)
    }
  }

  const handleSkip = () => {
    markStepComplete('import')
    navigate('/onboarding/invite')
  }

  const handleContinue = async () => {
    setError(null)

    // 1. If in Upload mode with validated rows
    if (mode === 'upload') {
      if (!selectedFile) {
        // Allow skipping if no file selected
        handleSkip()
        return
      }

      setIsSubmitting(true)
      try {
        let activeTenantId: string | null = tenantId || user?.tenantId || null
        if (!activeTenantId) {
          const lookup = await tenantApi.lookup()
          const lookupData = lookup.data as { tenantId?: string; id?: string } | undefined
          activeTenantId = lookupData?.tenantId || lookupData?.id || null
        }

        if (!activeTenantId) {
          throw new Error('Tenant identifier not found.')
        }

        const res = await employeeApi.confirmImport(activeTenantId, validatedRows)
        if (res.isSuccess || res.succeeded) {
          markStepComplete('import')
          navigate('/onboarding/invite')
        } else {
          setError(res.message || 'Failed to import roster. Please try again.')
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to import roster. Please try again.'
        setError(message)
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    // 2. If in Manual mode
    const filledRows = rows.filter((r) => r.fullName.trim() || r.email.trim())
    if (filledRows.length === 0) {
      handleSkip()
      return
    }

    setIsSubmitting(true)
    try {
      let activeTenantId: string | null = tenantId || user?.tenantId || null
      if (!activeTenantId) {
        const lookup = await tenantApi.lookup()
        const lookupData = lookup.data as { tenantId?: string; id?: string } | undefined
        activeTenantId = lookupData?.tenantId || lookupData?.id || null
      }

      if (!activeTenantId) {
        throw new Error('Tenant identifier not found.')
      }

      const employeesPayload: EmployeeImportDto[] = filledRows.map((r, idx) => {
        const parts = r.fullName.trim().split(' ')
        const firstName = parts[0] || ''
        const lastName = parts.slice(1).join(' ') || ''
        return {
          rowNumber: idx + 1,
          firstName,
          lastName,
          email: r.email.trim(),
          department: r.department.trim() || null,
          jobTitle: r.jobTitle.trim() || null,
        }
      })

      const res = await employeeApi.confirmImport(activeTenantId, employeesPayload)
      if (res.isSuccess || res.succeeded) {
        markStepComplete('import')
        navigate('/onboarding/invite')
      } else {
        setError(res.message || 'Failed to import employees. Please try again.')
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to import employees. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Step Header */}
      <StepHeader
        title="Import employees"
        description="Add your existing employees to get started. You can always do this later."
      />

      {/* 3-Option Segmented Tab Navigation */}
      <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center justify-center gap-2 rounded-2xl p-3 text-xs sm:text-sm font-semibold transition-all ${
            mode === 'upload'
              ? 'border-2 border-indigo-600 bg-indigo-50/50 text-indigo-600 shadow-xs'
              : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'
          }`}
        >
          <IconFileSpreadsheet className="size-4" aria-hidden="true" />
          <span>CSV Upload</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex items-center justify-center gap-2 rounded-2xl p-3 text-xs sm:text-sm font-semibold transition-all ${
            mode === 'manual'
              ? 'border-2 border-indigo-600 bg-indigo-50/50 text-indigo-600 shadow-xs'
              : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'
          }`}
        >
          <IconPencil className="size-4" aria-hidden="true" />
          <span>Manual entry</span>
        </button>

        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-xs sm:text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50/50"
        >
          <IconPlayerTrackNext className="size-4 text-blue-600" aria-hidden="true" />
          <span>Skip for now</span>
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 sm:text-sm">
          {error}
        </div>
      )}

      {/* TAB 1: CSV Upload Mode */}
      {mode === 'upload' && (
        <div className="mt-6 space-y-6">
          {/* File Upload Drop Target */}
          <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center transition-colors hover:border-indigo-400">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <IconUpload className="size-6" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-800">
              {selectedFile ? selectedFile.name : 'Drop your CSV here or click to browse'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Supports .csv, .xlsx · Max 10MB
            </p>
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFileUpload(f)
              }}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>

          {isValidating && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 p-4 text-xs font-medium text-slate-600">
              <div className="size-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <span>Validating file formatting...</span>
            </div>
          )}

          {/* Validated preview summary */}
          {validatedRows.length > 0 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <IconFileCheck className="size-4 text-emerald-600" />
                <span>{validatedRows.length} employee records validated and ready to import</span>
              </div>
            </div>
          )}

          {/* Expected column format table */}
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-600">Expected column format:</p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/60 font-semibold text-slate-700">
                  <tr>
                    <th className="p-3">First Name</th>
                    <th className="p-3">Last Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Job Title</th>
                    <th className="p-3">Start Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                  <tr>
                    <td className="p-3">Alexandra</td>
                    <td className="p-3">Morgan</td>
                    <td className="p-3">alex@company.com</td>
                    <td className="p-3">Engineering</td>
                    <td className="p-3">Senior Engineer</td>
                    <td className="p-3">2025-01-15</td>
                  </tr>
                  <tr>
                    <td className="p-3">Marcus</td>
                    <td className="p-3">Williams</td>
                    <td className="p-3">marcus@company.com</td>
                    <td className="p-3">Sales</td>
                    <td className="p-3">Account Executive</td>
                    <td className="p-3">2025-02-01</td>
                  </tr>
                  <tr>
                    <td className="p-3">Priya</td>
                    <td className="p-3">Patel</td>
                    <td className="p-3">priya@company.com</td>
                    <td className="p-3">Product</td>
                    <td className="p-3">Product Manager</td>
                    <td className="p-3">2025-02-15</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={downloadTemplate}
              className="mt-3 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Download CSV template
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Manual Entry Mode */}
      {mode === 'manual' && (
        <div className="mt-6 space-y-4">
          {/* Info Banner */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5 text-xs text-blue-700">
            <IconInfoCircle className="size-4 shrink-0 text-blue-600" aria-hidden="true" />
            <span>Manual entry supports up to 20 employees. For larger teams, use the CSV import.</span>
          </div>

          {/* Editable Rows Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="grid grid-cols-12 gap-2 border-b border-slate-100 bg-slate-50/60 p-3 text-xs font-semibold text-slate-700">
              <span className="col-span-3">Name</span>
              <span className="col-span-3">Email</span>
              <span className="col-span-3">Department</span>
              <span className="col-span-3">Job Title</span>
            </div>

            <div className="divide-y divide-slate-100 p-2 space-y-2">
              {rows.map((row) => (
                <div key={row.id} className="grid grid-cols-12 items-center gap-2 pt-1">
                  <div className="col-span-3">
                    <TextInput
                      placeholder="Enter name..."
                      value={row.fullName}
                      onChange={(e) => updateRow(row.id, 'fullName', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <TextInput
                      type="email"
                      placeholder="email@co.com"
                      value={row.email}
                      onChange={(e) => updateRow(row.id, 'email', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <TextInput
                      placeholder="Enter dept..."
                      value={row.department}
                      onChange={(e) => updateRow(row.id, 'department', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3 flex items-center gap-1.5">
                    <div className="flex-1">
                      <TextInput
                        placeholder="Enter title..."
                        value={row.jobTitle}
                        onChange={(e) => updateRow(row.id, 'jobTitle', e.target.value)}
                      />
                    </div>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <IconTrash className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Row Action */}
            <div className="border-t border-slate-100 p-3">
              <button
                type="button"
                onClick={addRow}
                disabled={rows.length >= 20}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
              >
                <IconPlus className="size-4" />
                <span>Add row</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer with Skip Option */}
      <div className="mt-8">
        <div className="flex items-center justify-center mb-4">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Skip this step
          </button>
        </div>

        <StepFooter
          backTo="/onboarding/job-titles"
          onContinue={handleContinue}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  )
}
