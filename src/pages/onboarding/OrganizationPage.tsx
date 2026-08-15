import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { SelectDropdown, TextInput } from '../../components/ui'
import { StepFooter, StepHeader, LogoUpload } from '../../components/onboarding'
import { useAuth, useOnboarding } from '../../store'
import { tenantApi } from '../../api'

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

const STORAGE_ORG_DRAFT_KEY = 'culturesync_org_draft'

export default function OrganizationPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { markStepComplete, setTenantId } = useOnboarding()

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ORG_DRAFT_KEY)
      if (stored) return JSON.parse(stored)
    } catch {
      // fallback
    }
    return {
      companyName: user?.companyName || '',
      industry: '',
      companySize: '',
      hqLocation: '',
      timezone: 'America/New_York (UTC-5)',
      currency: 'USD — US Dollar',
      website: '',
    }
  })

  // Pre-populate if tenant lookup exists
  useEffect(() => {
    let isMounted = true
    const loadTenantLookup = async () => {
      try {
        const res = await tenantApi.lookup()
        if ((res.isSuccess || res.succeeded) && res.data) {
          const data = res.data as {
            tenantId?: string
            id?: string
            name?: string
            companyName?: string
            industry?: string
            companySize?: string
            hqLocation?: string
            timeZoneId?: string
            defaultCurrency?: string
            logoUrl?: string
          }
          if (data.tenantId || data.id) {
            setTenantId(data.tenantId || data.id || null)
          }
          if (isMounted) {
            setForm((prev: typeof form) => ({
              ...prev,
              companyName: data.name || data.companyName || prev.companyName,
              industry: data.industry || prev.industry,
              companySize: data.companySize || prev.companySize,
              hqLocation: data.hqLocation || prev.hqLocation,
              timezone: data.timeZoneId || prev.timezone,
              currency: data.defaultCurrency || prev.currency,
            }))
            if (data.logoUrl) {
              setLogoPreview(data.logoUrl)
            }
          }
        }
      } catch {
        // Deferred if lookup offline or warming up
      }
    }
    loadTenantLookup()
    return () => {
      isMounted = false
    }
  }, [setTenantId])

  const requiredFilled =
    form.companyName.trim() !== '' &&
    form.industry !== '' &&
    form.companySize !== '' &&
    form.timezone !== ''

  const update = (field: keyof typeof form, value: string) =>
    setForm((prev: typeof form) => {
      const next = { ...prev, [field]: value }
      try {
        localStorage.setItem(STORAGE_ORG_DRAFT_KEY, JSON.stringify(next))
      } catch (e) {
        console.warn('Failed to save draft organization profile', e)
      }
      return next
    })

  const handleLogoSelect = (file: File) => {
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleContinue = async () => {
    setError(null)
    if (!requiredFilled) {
      setError('Please fill in all required fields.')
      return
    }

    setIsSubmitting(true)
    try {
      const slug =
        form.companyName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') || 'organization'

      const formData = new FormData()
      if (logoFile) {
        formData.append('image', logoFile)
      }
      formData.append('Industry', form.industry)
      formData.append('CompanySize', form.companySize)
      formData.append('HQLocation', form.hqLocation.trim() || 'Headquarters')
      formData.append('TimeZoneId', form.timezone)
      formData.append('DefaultCurrency', form.currency || 'USD — US Dollar')
      formData.append('Slug', slug)

      const res = await tenantApi.setupProfile(formData)
      const isOk = Boolean(res.isSuccess || res.succeeded)

      if (isOk) {
        markStepComplete('organization')
        navigate('/onboarding/departments')
      } else {
        setError(res.message || 'Failed to update organization profile. Please try again.')
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to update organization profile. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <StepHeader
        title="Organization profile"
        description="Tell us about your company so we can configure CultureSync for your team."
      />

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 sm:text-sm">
          {error}
        </div>
      )}

      {/* Reusable Logo Upload component */}
      <div className="mt-8">
        <LogoUpload
          previewUrl={logoPreview}
          onFileSelect={handleLogoSelect}
        />
      </div>

      {/* Form Fields */}
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

      <StepFooter
        backTo="/auth/login"
        backLabel="Back to login"
        onContinue={handleContinue}
        continueDisabled={!requiredFilled}
        isLoading={isSubmitting}
      />
    </div>
  )
}
