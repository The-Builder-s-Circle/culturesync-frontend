import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, SelectDropdown, TextInput, ToggleSwitch } from '../../components/ui'
import { StepFooter, StepHeader } from '../../components/onboarding'
import { IconCheck } from '@tabler/icons-react'
import { useOnboarding, useAuth } from '../../store'
import { hrConfigurationApi, tenantApi } from '../../api'
import type {
  ConfigureHRSettingsCommand,
  DayOfWeekOption,
  PayPeriod,
} from '../../api'

const PAY_PERIOD = {
  Weekly: 1,
  BiWeekly: 2,
  SemiMonthly: 3,
  Monthly: 4,
} as const

const WORK_WEEK_PRESETS: Record<string, DayOfWeekOption[]> = {
  'mon-fri': [1, 2, 3, 4, 5],
  'mon-sat': [1, 2, 3, 4, 5, 6],
  'sun-thu': [7, 1, 2, 3, 4],
}

const DAY_OPTIONS: { label: string; value: DayOfWeekOption }[] = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 7 },
]

const PROBATION_DAYS: Record<string, number> = {
  '1': 30,
  '3': 90,
  '6': 180,
  '12': 365,
}

export default function HrConfigPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { tenantId, setTenantId, markStepComplete } = useOnboarding()

  const [workWeek, setWorkWeek] = useState('mon-fri')
  const [customDays, setCustomDays] = useState<DayOfWeekOption[]>([1, 2, 3, 4, 5])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [payPeriod, setPayPeriod] = useState(String(PAY_PERIOD.BiWeekly))
  const [probation, setProbation] = useState(true)
  const [probationLength, setProbationLength] = useState('3')
  const [ptoDays, setPtoDays] = useState('20')
  const [trackClock, setTrackClock] = useState(false)
  const [requireJobTitle, setRequireJobTitle] = useState(true)
  const [requireDepartment, setRequireDepartment] = useState(true)
  const [requireEmergencyContact, setRequireEmergencyContact] = useState(false)
  const [requireEmployeeDocuments, setRequireEmployeeDocuments] = useState(false)
  const [requireManager, setRequireManager] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleCustomDay = (day: DayOfWeekOption) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
  }

  const handleSave = async () => {
    setError(null)
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
        throw new Error('Tenant identifier not found. Please complete previous setup steps.')
      }

      const workingDays =
        workWeek === 'custom' ? customDays : WORK_WEEK_PRESETS[workWeek]

      const payload: ConfigureHRSettingsCommand = {
        workSchedule: {
          workingDays,
          startTime: `${startTime}:00`,
          endTime: `${endTime}:00`,
        },
        leavePolicy: {
          annualLeaveDays: Number(ptoDays) || 0,
        },
        payroll: {
          payPeriod: Number(payPeriod) as PayPeriod,
          probationPeriodDays: probation ? PROBATION_DAYS[probationLength] : 0,
        },
        attendance: {
          enableAttendanceTracking: trackClock,
        },
        onboarding: {
          requireJobTitle,
          requireDepartment,
          requireEmergencyContact,
          requireEmployeeDocuments,
          requireManager,
        },
      }

      await hrConfigurationApi.setup(activeTenantId, payload)
      setIsSaved(true)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save HR configuration. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinue = () => {
    markStepComplete('hr-config')
    navigate('/onboarding/complete')
  }

  return (
    <div>
      {/* Step Header */}
      <StepHeader
        title="HR Configuration"
        description="Tailor CultureSync to how your organization runs. These defaults can be changed at any time from Settings."
      />

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 sm:text-sm">
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SelectDropdown
          label="Work week"
          placeholder="Select work week"
          options={[
            { label: 'Monday — Friday', value: 'mon-fri' },
            { label: 'Monday — Saturday', value: 'mon-sat' },
            { label: 'Sunday — Thursday', value: 'sun-thu' },
            { label: 'Custom', value: 'custom' },
          ]}
          value={workWeek}
          onChange={(e) => setWorkWeek(e.target.value)}
        />

        <SelectDropdown
          label="Pay period"
          placeholder="Select pay period"
          options={[
            { label: 'Weekly', value: String(PAY_PERIOD.Weekly) },
            { label: 'Bi-weekly', value: String(PAY_PERIOD.BiWeekly) },
            { label: 'Semi-monthly', value: String(PAY_PERIOD.SemiMonthly) },
            { label: 'Monthly', value: String(PAY_PERIOD.Monthly) },
          ]}
          value={payPeriod}
          onChange={(e) => setPayPeriod(e.target.value)}
        />

        <TextInput
          label="Work day starts"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        <TextInput
          label="Work day ends"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />

        <TextInput
          label="Annual PTO days"
          type="number"
          min={0}
          value={ptoDays}
          onChange={(e) => setPtoDays(e.target.value)}
        />

        {probation && (
          <SelectDropdown
            label="Probation period"
            placeholder="Select probation length"
            options={[
              { label: '1 month', value: '1' },
              { label: '3 months', value: '3' },
              { label: '6 months', value: '6' },
              { label: '1 year', value: '12' },
            ]}
            value={probationLength}
            onChange={(e) => setProbationLength(e.target.value)}
          />
        )}
      </div>

      {workWeek === 'custom' && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-700">Working days</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DAY_OPTIONS.map((day) => {
              const selected = customDays.includes(day.value)
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleCustomDay(day.value)}
                  aria-pressed={selected}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    selected
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {day.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Toggles */}
      <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">Probation period</p>
            <p className="text-xs text-slate-500">
              Track onboarding progress for new hires.
            </p>
          </div>
          <ToggleSwitch
            checked={probation}
            onChange={(e) => setProbation(e.target.checked)}
            label="Probation period"
          />
        </div>

        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">Clock-in tracking</p>
            <p className="text-xs text-slate-500">
              Enable time tracking for hourly employees.
            </p>
          </div>
          <ToggleSwitch
            checked={trackClock}
            onChange={(e) => setTrackClock(e.target.checked)}
            label="Clock-in tracking"
          />
        </div>
      </div>

      {/* Onboarding requirements */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-800">
          Employee onboarding requirements
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Choose what information is mandatory when adding employees.
        </p>
      </div>
      <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">Require job title</p>
            <p className="text-xs text-slate-500">
              Employees must have a job title assigned.
            </p>
          </div>
          <ToggleSwitch
            checked={requireJobTitle}
            onChange={(e) => setRequireJobTitle(e.target.checked)}
            label="Require job title"
          />
        </div>

        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">Require department</p>
            <p className="text-xs text-slate-500">
              Employees must be assigned to a department.
            </p>
          </div>
          <ToggleSwitch
            checked={requireDepartment}
            onChange={(e) => setRequireDepartment(e.target.checked)}
            label="Require department"
          />
        </div>

        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Require emergency contact
            </p>
            <p className="text-xs text-slate-500">
              Collect an emergency contact for each employee.
            </p>
          </div>
          <ToggleSwitch
            checked={requireEmergencyContact}
            onChange={(e) => setRequireEmergencyContact(e.target.checked)}
            label="Require emergency contact"
          />
        </div>

        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Require employee documents
            </p>
            <p className="text-xs text-slate-500">
              Ask for documents during employee onboarding.
            </p>
          </div>
          <ToggleSwitch
            checked={requireEmployeeDocuments}
            onChange={(e) => setRequireEmployeeDocuments(e.target.checked)}
            label="Require employee documents"
          />
        </div>

        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">Require manager</p>
            <p className="text-xs text-slate-500">
              Every employee must be linked to a manager.
            </p>
          </div>
          <ToggleSwitch
            checked={requireManager}
            onChange={(e) => setRequireManager(e.target.checked)}
            label="Require manager"
          />
        </div>
      </div>

      <div className="mt-6">
        <Button
          variant="secondary"
          disabled={isSaved}
          isLoading={isSubmitting}
          onClick={handleSave}
          className="w-full sm:w-auto"
        >
          {isSaved ? (
            <>
              <IconCheck className="size-4" aria-hidden="true" />
              Configuration saved
            </>
          ) : (
            'Save configuration'
          )}
        </Button>
      </div>

      <StepFooter
        backTo="/onboarding/invite"
        onContinue={handleContinue}
        continueLabel="Finish setup"
        continueDisabled={!isSaved}
      />
    </div>
  )
}
