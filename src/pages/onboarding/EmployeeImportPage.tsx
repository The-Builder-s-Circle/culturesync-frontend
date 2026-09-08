import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, TextInput, SelectDropdown } from '../../components/ui'
import type { SelectOption } from '../../components/ui'
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
  IconCheck,
} from '@tabler/icons-react'
import { useOnboarding, useAuth } from '../../store'
import { employeeApi, tenantApi, getTenantLookup } from '../../api'
import type { EmployeeImportDto } from '../../api'

type Mode = 'upload' | 'manual'

interface ManualRow {
  id: string
  fullName: string
  email: string
  department: string
  jobTitle: string
}

const SAMPLE_CSV = [
  'first_name,last_name,email,department,job_title,phone_number,employee_number,manager_email,hire_date',
  'Alexandra,Morgan,alex@company.com,Engineering,Software Engineer,,EMP001,,2025-01-15',
  'Marcus,Williams,marcus@company.com,Sales & Revenue,Sales Executive,,EMP002,alex@company.com,2025-02-01',
  'Priya,Patel,priya@company.com,Marketing,Marketing Manager,,EMP003,alex@company.com,2025-02-15',
].join('\n')

export default function EmployeeImportPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { tenantId, setTenantId, markStepComplete, skipStep } = useOnboarding()

  const [mode, setMode] = useState<Mode>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validatedRows, setValidatedRows] = useState<EmployeeImportDto[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)

  const applyErrorHint = (message: string) => {
    if (/does not exist/i.test(message)) {
      setHint(
        'Departments and job titles must be created in earlier setup steps, and a manager must already be an employee before others can report to them. Import managers first (leave their Manager Email empty), then import their reports.'
      )
    } else {
      setHint(null)
    }
  }

  // Manual entry rows state (defaults to 3 empty rows matching screenshot)
  const [rows, setRows] = useState<ManualRow[]>([
    { id: 'row-1', fullName: '', email: '', department: '', jobTitle: '' },
    { id: 'row-2', fullName: '', email: '', department: '', jobTitle: '' },
    { id: 'row-3', fullName: '', email: '', department: '', jobTitle: '' },
  ])

  const [lookupDepartments, setLookupDepartments] = useState<SelectOption[]>([])
  const [lookupJobTitles, setLookupJobTitles] = useState<SelectOption[]>([])

  useEffect(() => {
    let cancelled = false
    getTenantLookup()
      .then((res) => {
        if (cancelled || !res.data) return
        setLookupDepartments((res.data.departments ?? []).map((o) => ({ value: o.value, label: o.label })))
        setLookupJobTitles((res.data.jobTitles ?? []).map((o) => ({ value: o.value, label: o.label })))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

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
    setHint(null)
    setSelectedFile(file)
    setIsValidating(true)

    try {
      let activeTenantId = tenantId || user?.tenantId || null
      if (!activeTenantId) {
        activeTenantId = await tenantApi.resolveActiveTenantId()
        if (activeTenantId) {
          setTenantId(activeTenantId)
        }
      }

      if (!activeTenantId) {
        throw new Error('Tenant identifier not found. Please complete previous setup steps.')
      }

      const res = await employeeApi.validateImport(activeTenantId, file)
      if ((res.isSuccess || res.succeeded) && res.data) {
        const employees = (res.data.rows ?? [])
          .map((row) => row.employee)
          .filter((emp): emp is EmployeeImportDto => Boolean(emp))
        setValidatedRows(employees)
      } else {
        const message = res.message || 'Validation failed. Please check the file formatting.'
        setError(message)
        applyErrorHint(message)
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to validate file. Please try again.'
      setError(message)
      applyErrorHint(message)
    } finally {
      setIsValidating(false)
    }
  }

  const handleSkip = () => {
    skipStep('import')
    navigate('/onboarding/invite')
  }

  const handleConfirmImport = async () => {
    setError(null)
    setHint(null)
    setIsSubmitting(true)

    try {
      let activeTenantId = tenantId || user?.tenantId || null
      if (!activeTenantId) {
        activeTenantId = await tenantApi.resolveActiveTenantId()
        if (activeTenantId) {
          setTenantId(activeTenantId)
        }
      }

      if (!activeTenantId) {
        throw new Error('Tenant identifier not found.')
      }

      let payload: EmployeeImportDto[]

      if (mode === 'upload') {
        payload = validatedRows
      } else {
        const filledRows = rows.filter((r) => r.fullName.trim() || r.email.trim())
        payload = filledRows.map((r, idx) => {
          const parts = r.fullName.trim().split(' ')
          const firstName = parts[0] || ''
          const lastName = parts.slice(1).join(' ') || ''
          return {
            rowNumber: idx + 1,
            firstName,
            lastName,
            email: r.email.trim(),
            department: r.department.trim(),
            jobTitle: r.jobTitle.trim(),
          }
        })
      }

      const res = await employeeApi.confirmImport(activeTenantId, payload)
      if (res.isSuccess || res.succeeded) {
        setIsSaved(true)
      } else {
        const message = res.message || 'Failed to import employees. Please try again.'
        setError(message)
        applyErrorHint(message)
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to import employees. Please try again.'
      setError(message)
      applyErrorHint(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinue = () => {
    markStepComplete('import')
    navigate('/onboarding/invite')
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
          {error.includes('\n') ? (
            <>
              <p className="font-semibold">Some rows have problems:</p>
              <ul className="mt-1.5 max-h-44 list-disc space-y-1 overflow-y-auto pl-4">
                {error
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
              </ul>
            </>
          ) : (
            error
          )}
        </div>
      )}

      {hint && !error?.includes('\n') && (
        <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 sm:text-sm">
          <p className="font-semibold">How to fix this</p>
          <p className="mt-1">{hint}</p>
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
              <div className="mt-3">
                <Button
                  variant="secondary"
                  disabled={isSaved}
                  isLoading={isSubmitting}
                  onClick={handleConfirmImport}
                  className="w-full sm:w-auto"
                >
                  {isSaved ? (
                    <>
                      <IconCheck className="size-4" aria-hidden="true" />
                      Import confirmed
                    </>
                  ) : (
                    'Confirm import'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Expected column format table */}
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-600">
              {validatedRows.length > 0
                ? 'Imported employee records:'
                : 'Expected column format:'}
            </p>
            <div className="max-h-80 overflow-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 border-b border-slate-100 bg-slate-50/60 font-semibold text-slate-700">
                  <tr>
                    <th className="p-3">First Name</th>
                    <th className="p-3">Last Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Job Title</th>
                    <th className="p-3">Employee Number</th>
                    <th className="p-3">Manager Email</th>
                    <th className="p-3">Hire Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                  {validatedRows.length > 0 ? (
                    validatedRows.map((emp, i) => (
                      <tr key={i}>
                        <td className="p-3">{emp.firstName ?? ''}</td>
                        <td className="p-3">{emp.lastName ?? ''}</td>
                        <td className="p-3">{emp.email ?? ''}</td>
                        <td className="p-3">{emp.department ?? ''}</td>
                        <td className="p-3">{emp.jobTitle ?? ''}</td>
                        <td className="p-3">{emp.employeeNumber ?? ''}</td>
                        <td className="p-3">{emp.managerEmail ?? ''}</td>
                        <td className="p-3">{emp.hireDate ?? ''}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-3 text-center font-sans text-xs text-slate-400">
                        Upload a valid file to preview your employee records here.
                      </td>
                    </tr>
                  )}
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

            <p className="mt-2 text-xs text-slate-500">
              Tip: departments and job titles must already exist (create them in the previous
              steps). For managers, list them in an earlier row than their reports — or leave{' '}
              <span className="font-mono">manager_email</span> empty and re-import later.
            </p>
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
                    <SelectDropdown
                      placeholder="Select department..."
                      options={lookupDepartments}
                      value={row.department}
                      onChange={(e) => updateRow(row.id, 'department', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3 flex items-center gap-1.5">
                    <div className="flex-1">
                      <SelectDropdown
                        placeholder="Select job title..."
                        options={lookupJobTitles}
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

          {rows.some((r) => r.fullName.trim() || r.email.trim()) && (
            <div className="flex justify-start">
              <Button
                variant="secondary"
                disabled={isSaved}
                isLoading={isSubmitting}
                onClick={handleConfirmImport}
                className="w-full sm:w-auto"
              >
                {isSaved ? (
                  <>
                    <IconCheck className="size-4" aria-hidden="true" />
                    Employees imported
                  </>
                ) : (
                  'Import employees'
                )}
              </Button>
            </div>
          )}
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
          continueDisabled={!isSaved}
        />
      </div>
    </div>
  )
}
