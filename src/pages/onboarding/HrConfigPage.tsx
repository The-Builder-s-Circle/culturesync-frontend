import { useState } from 'react'
import { SelectDropdown, TextInput, ToggleSwitch } from '../../components/ui'
import { StepFooter } from '../../components/onboarding/StepFooter'


export default function HrConfigPage() {
  const [workWeek, setWorkWeek] = useState('mon-fri')
  const [payPeriod, setPayPeriod] = useState('biweekly')
  const [probation, setProbation] = useState(true)
  const [probationLength, setProbationLength] = useState('3')
  const [ptoDays, setPtoDays] = useState('20')
  const [notifyPolicies, setNotifyPolicies] = useState(true)
  const [trackClock, setTrackClock] = useState(false)

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        HR Configuration
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
        Tailor CultureSync to how your organization runs. These defaults can be
        changed at any time from Settings.
      </p>

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
            { label: 'Bi-weekly', value: 'biweekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Semi-monthly', value: 'semi-monthly' },
            { label: 'Weekly', value: 'weekly' },
          ]}
          value={payPeriod}
          onChange={(e) => setPayPeriod(e.target.value)}
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
            <p className="text-sm font-semibold text-slate-800">
              Policy notifications
            </p>
            <p className="text-xs text-slate-500">
              Notify employees when policies are updated.
            </p>
          </div>
          <ToggleSwitch
            checked={notifyPolicies}
            onChange={(e) => setNotifyPolicies(e.target.checked)}
            label="Policy notifications"
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

      <StepFooter backTo="/onboarding/invite" continueTo="/onboarding/complete" continueLabel="Finish setup" />
    </div>
  )
}
