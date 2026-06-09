'use client'

import React, { useState, useEffect } from 'react'
import { verifyAadhaarChecksum } from '@/lib/aadhaar-validator'
import { IconInfoCircle, IconCheck, IconAlertCircle } from '@tabler/icons-react'

interface AadhaarInputProps {
  onSubmit: (aadhaar: string) => void;
  isLoading?: boolean;
}

export default function AadhaarInput({ onSubmit, isLoading = false }: AadhaarInputProps) {
  const [rawValue, setRawValue] = useState('')
  const [useVid, setUseVid] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [focused, setFocused] = useState(false)

  const maxDigits = useVid ? 16 : 12

  // Validate on input change
  useEffect(() => {
    if (rawValue.length === maxDigits) {
      const valid = verifyAadhaarChecksum(rawValue)
      setIsValid(valid)
    } else {
      setIsValid(null)
    }
  }, [rawValue, maxDigits])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const digits = e.target.value.replace(/\D/g, '')
    if (digits.length <= maxDigits) {
      setRawValue(digits)
    }
  }

  const toggleVid = () => {
    setRawValue('')
    setIsValid(null)
    setUseVid(!useVid)
  }

  // Formatting display string: ●●●● ●●●● 9012
  const getDisplayValue = () => {
    const chars = rawValue.split('')
    const formatted = chars.map((char, index) => {
      // Mask logic: mask index < 8 for Aadhaar, index < 12 for VID
      const maskThreshold = useVid ? 12 : 8
      if (index < maskThreshold) {
        return '●'
      }
      return char
    })

    // Group into chunks of 4
    const chunks = []
    for (let i = 0; i < formatted.length; i += 4) {
      chunks.push(formatted.slice(i, i + 4).join(''))
    }
    return chunks.join(' ')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isValid && !isLoading) {
      onSubmit(rawValue)
    }
  }

  return (
    <div className="flex flex-col space-y-5">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-gray-800">
          {useVid ? 'Virtual ID (VID)' : 'Aadhaar Number'}
        </label>
        <button
          type="button"
          onClick={toggleVid}
          className="text-xs text-[#0F6E56] hover:text-[#085041] font-medium transition-colors hover:underline"
        >
          {useVid ? 'Use Aadhaar Number instead' : 'Use Virtual ID instead'}
        </button>
      </div>

      <div className="relative">
        {/* Underlay for premium visual formatting (Bullet points + spacing) */}
        <div 
          className={`absolute inset-0 flex items-center px-4 py-3 rounded-xl border pointer-events-none transition-all duration-200 text-lg font-mono ${
            focused 
              ? 'border-emerald-500 bg-white ring-1 ring-emerald-500/20' 
              : 'border-slate-200 bg-slate-50'
          }`}
        >
          {rawValue.length > 0 ? (
            <span className="text-slate-900 tracking-wider">{getDisplayValue()}</span>
          ) : (
            <span className="text-slate-400 select-none">
              {useVid ? '●●●● ●●●● ●●●● ●●●●' : '●●●● ●●●● ●●●●'}
            </span>
          )}
        </div>

        {/* Real hidden/transparent input styled directly on top */}
        <input
          type="tel"
          value={rawValue}
          onChange={handleInputChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          maxLength={maxDigits + (useVid ? 3 : 2)} // Allow buffer for paste
          autoComplete="off"
          spellCheck="false"
          className="w-full px-4 py-3 rounded-xl border border-transparent bg-transparent text-transparent caret-[#0F6E56] text-lg font-mono tracking-wider focus:outline-none focus:border-transparent select-all"
        />

        {/* Validation indicator icons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          {isValid === true && (
            <span className="p-1 bg-emerald-100 text-emerald-700 rounded-full">
              <IconCheck className="w-4 h-4" />
            </span>
          )}
          {isValid === false && (
            <span className="p-1 bg-red-100 text-red-700 rounded-full" title="Invalid Checksum">
              <IconAlertCircle className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>

      {isValid === false && (
        <p className="text-xs text-red-600 flex items-center space-x-1">
          <IconAlertCircle className="w-4 h-4 shrink-0" />
          <span>Incorrect checksum (failed Verhoeff verification). Check digits.</span>
        </p>
      )}

      {/* Amber Notice Banner */}
      <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200/50 rounded-xl">
        <IconInfoCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 space-y-1 leading-relaxed">
          <p className="font-semibold">OTP will be sent to your Aadhaar-registered mobile</p>
          <p>
            UIDAI will send the OTP directly to the mobile number linked to your Aadhaar. 
            LandChain does not know, intercept, or store your mobile number.
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={!isValid || isLoading}
        onClick={() => onSubmit(rawValue)}
        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex justify-center items-center ${
          isValid && !isLoading
            ? 'bg-[#0F6E56] text-white hover:bg-[#085041] shadow-lg shadow-emerald-900/10 active:scale-[0.98]'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Initiating request...</span>
          </span>
        ) : (
          <span>Send OTP</span>
        )}
      </button>
    </div>
  )
}
