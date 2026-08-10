import { useRef, useState } from 'react'
import { SelectDropdown, TextInput } from '../../components/ui'
import { StepFooter } from '../../components/onboarding/StepFooter'
import { IconUpload } from '@tabler/icons-react'

const INDUSTRIES = [
  'Healthcare & Life Sciences',
  'Financial Services',
  'Technology & Software',
  'Professional Services',
  'Retail & E-commerce',
  'Manufacturing',
  'Education',
  'Government & Public Sector',
  'Media & Entertainment',
  'Real Estate',
  'Hospitality & Travel',
  'Non-profit',
]

const COMPANY_SIZES = [
  '1–10 employees',
  '11–50 employees',
  '51–200 employees',
  '201–500 employees',
  '501–1000 employees',
  '1001–5000 employees',
  '5001+ employees',
]

const TIMEZONES = [
  'America/New_York (UTC-5)',
  'America/Chicago (UTC-6)',
  'America/Denver (UTC-7)',
  'America/Los_Angeles (UTC-8)',
  'Europe/London (UTC+0)',
  'Europe/Paris (UTC+1)',
  'Asia/Tokyo (UTC+9)',
  'Asia/Singapore (UTC+8)',
  'Australia/Sydney (UTC+11)',
]

const CURRENCIES = [
  'USD — US Dollar',
  'EUR — Euro',
  'GBP — British Pound',
  'CAD — Canadian Dollar',
  'AUD — Australian Dollar',
]

export default function OrganizationPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    hqLocation: '',
    timezone: '',
    currency: '',
    website: '',
  })

  const requiredFilled =
    form.companyName.trim() !== '' &&
    form.industry !== '' &&
    form.companySize !== '' &&
    form.timezone !== ''

  const update = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoPreview(URL.createObjectURL(file))
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Organization profile
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
        Tell us about your company so we can configure CultureSync for your team.
      </p>

      {/* Logo upload */}
      <div className="mt-8">
        <p className="text-sm font-medium text-slate-700">Company logo</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 flex size-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 bg-white text-slate-500 transition-colors hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600"
        >
          {logoPreview ? (
            <img
              src={logoPreview}
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
          onChange={handleLogoChange}
        />
        <p className="mt-2 text-xs text-slate-500">PNG, JPG or SVG · Max 2MB</p>
      </div>

      {/* Fields */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextInput
          label="Company name"
          required
          placeholder="e.g. Meridian Health Partners"
          value={form.companyName}
          onChange={(e) => update('companyName', e.target.value)}
        />
        <SelectDropdown
          label="Industry"
          required
          placeholder="Select industry"
          options={INDUSTRIES.map((i) => ({ label: i, value: i }))}
          value={form.industry}
          onChange={(e) => update('industry', e.target.value)}
        />
        <SelectDropdown
          label="Company size"
          required
          placeholder="Select size"
          options={COMPANY_SIZES.map((s) => ({ label: s, value: s }))}
          value={form.companySize}
          onChange={(e) => update('companySize', e.target.value)}
        />
        <TextInput
          label="HQ location"
          placeholder="e.g. Boston, MA, United States"
          value={form.hqLocation}
          onChange={(e) => update('hqLocation', e.target.value)}
        />
        <SelectDropdown
          label="Timezone"
          required
          placeholder="Select timezone"
          options={TIMEZONES.map((t) => ({ label: t, value: t }))}
          value={form.timezone}
          onChange={(e) => update('timezone', e.target.value)}
        />
        <SelectDropdown
          label="Default currency"
          placeholder="Select currency"
          options={CURRENCIES.map((c) => ({ label: c, value: c }))}
          value={form.currency}
          onChange={(e) => update('currency', e.target.value)}
        />
        <TextInput
          label="Company website"
          className="sm:col-span-2"
          placeholder="https://example.com"
          value={form.website}
          onChange={(e) => update('website', e.target.value)}
        />
      </div>

      <StepFooter backTo="/auth/login" backLabel="Back to login" continueTo="/onboarding/departments" continueDisabled={!requiredFilled} />
    </div>
  )
}
