export interface CountryOption {
  code: string
  label: string
  flag: string
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: '+234', label: 'NG', flag: '🇳🇬' },
  { code: '+1', label: 'US/CA', flag: '🇺🇸' },
  { code: '+44', label: 'UK', flag: '🇬🇧' },
  { code: '+49', label: 'DE', flag: '🇩🇪' },
  { code: '+33', label: 'FR', flag: '🇫🇷' },
  { code: '+91', label: 'IN', flag: '🇮🇳' },
  { code: '+254', label: 'KE', flag: '🇰🇪' },
  { code: '+27', label: 'ZA', flag: '🇿🇦' },
  { code: '+233', label: 'GH', flag: '🇬🇭' },
  { code: '+61', label: 'AU', flag: '🇦🇺' },
  { code: '+81', label: 'JP', flag: '🇯🇵' },
  { code: '+971', label: 'AE', flag: '🇦🇪' },
]

export const parsePhoneValue = (val?: string): { countryCode: string; localNumber: string } => {
  if (!val) return { countryCode: '+234', localNumber: '' }
  const match = COUNTRY_OPTIONS.find((c) => val.startsWith(c.code))
  if (match) {
    return {
      countryCode: match.code,
      localNumber: val.slice(match.code.length).replace(/^0+/, ''),
    }
  }
  if (/^\d+$/.test(val)) {
    return { countryCode: '+234', localNumber: val.replace(/^0+/, '') }
  }
  return { countryCode: '+234', localNumber: '' }
}
