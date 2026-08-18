import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { SelectDropdown, TextInput } from '../../components/ui'
import { StepFooter, StepHeader, LogoUpload } from '../../components/onboarding'
import { useAuth, useOnboarding } from '../../store'
import { tenantApi, extractTenantId } from '../../api'
import type { LookupOption, TenantLookupData } from '../../api'

const FALLBACK_INDUSTRIES: LookupOption[] = [
  { value: 'Technology & Software', label: 'Technology & Software' },
  { value: 'Healthcare & Life Sciences', label: 'Healthcare & Life Sciences' },
  { value: 'Financial Services', label: 'Financial Services' },
  { value: 'Professional Services', label: 'Professional Services' },
  { value: 'Education', label: 'Education' },
  { value: 'Retail & E-Commerce', label: 'Retail & E-Commerce' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Government & Public Sector', label: 'Government & Public Sector' },
  { value: 'Media & Entertainment', label: 'Media & Entertainment' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Hospitality & Travel', label: 'Hospitality & Travel' },
  { value: 'Non-Profit', label: 'Non-Profit' },
]

const FALLBACK_COMPANY_SIZES: LookupOption[] = [
  { value: '1', label: '1 - 10 employees' },
  { value: '2', label: '11 - 50 employees' },
  { value: '3', label: '51 - 200 employees' },
  { value: '4', label: '201 - 500 employees' },
  { value: '5', label: '501+ employees' },
]

const FALLBACK_TIMEZONES: LookupOption[] = [
  { value: 'America/New_York', label: '(UTC-05:00) Eastern Time (New York)' },
  { value: 'America/Chicago', label: '(UTC-06:00) Central Time (Chicago)' },
  { value: 'America/Denver', label: '(UTC-07:00) Mountain Time (Denver)' },
  { value: 'America/Los_Angeles', label: '(UTC-08:00) Pacific Time (Los Angeles)' },
  { value: 'Europe/London', label: '(UTC+00:00) United Kingdom Time' },
  { value: 'Europe/Paris', label: '(UTC+01:00) Central European Time (Paris)' },
  { value: 'Africa/Lagos', label: '(UTC+01:00) West Africa Standard Time (Lagos)' },
  { value: 'Asia/Dubai', label: '(UTC+04:00) Gulf Standard Time (Dubai)' },
  { value: 'Asia/Singapore', label: '(UTC+08:00) Singapore Standard Time' },
  { value: 'Asia/Tokyo', label: '(UTC+09:00) Japan Standard Time (Tokyo)' },
  { value: 'Australia/Sydney', label: '(UTC+10:00) Eastern Australia Time (Sydney)' },
]

const FALLBACK_CURRENCIES: LookupOption[] = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'System Euro (€)' },
  { value: 'GBP', label: 'Pound (£)' },
  { value: 'NGN', label: 'Naira (₦)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' },
]

export default function OrganizationPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { tenantId, markStepComplete, setTenantId } = useOnboarding()

  const [industries, setIndustries] = useState<LookupOption[]>(FALLBACK_INDUSTRIES)
  const [companySizes, setCompanySizes] = useState<LookupOption[]>(FALLBACK_COMPANY_SIZES)
  const [timeZones, setTimeZones] = useState<LookupOption[]>(FALLBACK_TIMEZONES)
  const [currencies, setCurrencies] = useState<LookupOption[]>(FALLBACK_CURRENCIES)

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeTenantId = tenantId || user?.tenantId || null
  const draftStorageKey = activeTenantId
    ? `culturesync_org_draft_${activeTenantId}`
    : 'culturesync_org_draft'

  const [form, setForm] = useState(() => {
    try {
      const stored = localStorage.getItem(draftStorageKey)
      if (stored) return JSON.parse(stored)
    } catch {
      // fallback
    }
    return {
      companyName: user?.companyName || '',
      industry: 'Technology & Software',
      companySize: '1',
      hqLocation: '',
      timezone: 'America/New_York',
      currency: 'USD',
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
          const data = res.data as TenantLookupData
          const resolvedTenantId = extractTenantId(data) || data.tenantId || data.id
          if (resolvedTenantId) {
            setTenantId(resolvedTenantId)
          }

          if (isMounted) {
            if (Array.isArray(data.industries) && data.industries.length > 0) {
              setIndustries(data.industries)
            }
            if (Array.isArray(data.companySizes) && data.companySizes.length > 0) {
              setCompanySizes(data.companySizes)
            }
            if (Array.isArray(data.timeZones) && data.timeZones.length > 0) {
              setTimeZones(data.timeZones)
            }
            if (Array.isArray(data.currencies) && data.currencies.length > 0) {
              setCurrencies(data.currencies)
            }

            setForm((prev: typeof form) => ({
              ...prev,
              companyName: data.name || data.companyName || prev.companyName,
              industry: data.industry || prev.industry || data.industries?.[0]?.value || 'Technology & Software',
              companySize: data.companySize || prev.companySize || data.companySizes?.[0]?.value || '1',
              hqLocation: data.hqLocation || prev.hqLocation,
              timezone: data.timeZoneId || prev.timezone || data.timeZones?.[0]?.value || 'America/New_York',
              currency: data.defaultCurrency || prev.currency || data.currencies?.[0]?.value || 'USD',
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
        localStorage.setItem(draftStorageKey, JSON.stringify(next))
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
      formData.append('DefaultCurrency', form.currency || 'USD')
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
          options={industries}
          value={form.industry}
          onChange={(e) => update('industry', e.target.value)}
        />
        <SelectDropdown
          label="Company size"
          required
          placeholder="Select size"
          options={companySizes}
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
          options={timeZones}
          value={form.timezone}
          onChange={(e) => update('timezone', e.target.value)}
        />
        <SelectDropdown
          label="Default currency"
          placeholder="Select currency"
          options={currencies}
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
