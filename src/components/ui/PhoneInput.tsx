import React, { useState } from 'react'
import { COUNTRY_OPTIONS, parsePhoneValue } from './phoneUtils'

export interface PhoneInputProps {
  label?: string
  value?: string
  onChange?: (fullPhoneNumber: string) => void
  error?: string
  required?: boolean
  disabled?: boolean
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label = 'Phone number *',
  value = '',
  onChange,
  error,
  required = false,
  disabled = false,
}) => {
  const initial = parsePhoneValue(value)
  const [selectedCountry, setSelectedCountry] = useState(initial.countryCode)
  const [localNumber, setLocalNumber] = useState(initial.localNumber)

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value
    setSelectedCountry(newCode)
    emitChange(newCode, localNumber)
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '')
    const cleanedDigits = digitsOnly.replace(/^0+/, '')
    setLocalNumber(cleanedDigits)
    emitChange(selectedCountry, cleanedDigits)
  }

  const emitChange = (countryCode: string, numberStr: string) => {
    if (onChange) {
      const full = numberStr ? `${countryCode}${numberStr}` : ''
      onChange(full)
    }
  }

  const phoneIcon = (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  )

  return (
    <div className="flex flex-col gap-1 w-full font-sans">
      {label && (
        <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
          <span>
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center w-full">
        {/* Left Phone Icon */}
        <div className="absolute left-3 flex items-center justify-center text-slate-400 pointer-events-none z-10">
          {phoneIcon}
        </div>

        {/* Country Code Prefix Dropdown */}
        <select
          value={selectedCountry}
          onChange={handleCountryChange}
          disabled={disabled}
          className="pl-8 pr-2 py-1.5 sm:py-2 text-xs bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 appearance-none cursor-pointer text-center"
          style={{ width: '92px' }}
        >
          {COUNTRY_OPTIONS.map((country) => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.code}
            </option>
          ))}
        </select>

        {/* Local Phone Number Input */}
        <input
          type="tel"
          placeholder="8012345678"
          value={localNumber}
          onChange={handleNumberChange}
          disabled={disabled}
          required={required}
          className={`w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-r-lg text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 ${
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''
          }`}
        />
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  )
}
