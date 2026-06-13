'use client'

import React, { useState, useEffect } from 'react'
import { verifyAadhaarChecksum } from '@/lib/aadhaar-validator'
import { IconCheck, IconAlertCircle } from '@tabler/icons-react'

interface AadhaarInputProps {
  rawValue: string
  onChange: (val: string) => void
  useVid: boolean
  setUseVid: (val: boolean) => void
  isValid: boolean | null
  setIsValid: (val: boolean | null) => void
}

export default function AadhaarInput({
  rawValue,
  onChange,
  useVid,
  setUseVid,
  isValid,
  setIsValid
}: AadhaarInputProps) {
  const [focused, setFocused] = useState(false)
  const [blurred, setBlurred] = useState(false)

  const maxDigits = useVid ? 16 : 12

  const runValidation = (val: string) => {
    if (val.length === maxDigits) {
      setIsValid(verifyAadhaarChecksum(val))
    } else {
      setIsValid(null)
    }
  }

  // Validate when value or mode changes
  useEffect(() => {
    runValidation(rawValue)
  }, [rawValue, useVid])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    if (digits.length <= maxDigits) {
      onChange(digits)
    }
  }

  const toggleVid = () => {
    onChange('')
    setIsValid(null)
    setBlurred(false)
    setUseVid(!useVid)
  }

  const getDisplayValue = () => {
    const chars = rawValue.split('')
    const formatted = chars.map((char, index) => {
      const maskThreshold = useVid ? 12 : 8
      if (index < maskThreshold) {
        return '●'
      }
      return char
    })

    const chunks = []
    for (let i = 0; i < formatted.length; i += 4) {
      chunks.push(formatted.slice(i, i + 4).join(''))
    }
    return chunks.join(' ')
  }

  const handleBlur = () => {
    setFocused(false)
    setBlurred(true)
    runValidation(rawValue)
  }

  const showFeedback = blurred && rawValue.length === maxDigits

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {useVid ? 'Virtual ID (VID)' : 'Aadhaar Number'}
          </label>
        </div>

        <div className="relative">
          {/* Masked display layer underlay */}
          <div 
            className={`absolute inset-0 z-0 flex items-center px-4 py-3 rounded-xl border pointer-events-none transition-all duration-200 text-lg font-mono ${
              focused 
                ? 'border-emerald-500 bg-white dark:bg-slate-900 ring-1 ring-emerald-500/20' 
                : showFeedback && isValid === false
                ? 'border-red-500 bg-red-50/10'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
            }`}
          >
            {rawValue.length > 0 ? (
              <span className="text-slate-900 dark:text-slate-100 tracking-wider">{getDisplayValue()}</span>
            ) : (
              <span className="text-slate-400 dark:text-slate-600 select-none">
                {useVid ? '●●●● ●●●● ●●●● ●●●●' : '●●●● ●●●● ●●●●'}
              </span>
            )}
          </div>

          <input
            type="tel"
            id="aadhaar-input"
            value={rawValue}
            onChange={handleInputChange}
            onFocus={() => setFocused(true)}
            onBlur={handleBlur}
            maxLength={maxDigits}
            autoComplete="off"
            spellCheck="false"
            className="relative z-10 w-full px-4 py-3 rounded-xl border border-transparent bg-transparent text-transparent caret-[#0F6E56] text-lg font-mono tracking-wider focus:outline-none focus:border-transparent select-all"
          />

          {/* Validation Indicator Icons */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 pointer-events-none">
            {showFeedback && isValid === true && (
              <span className="p-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                <IconCheck className="w-4 h-4" />
              </span>
            )}
            {showFeedback && isValid === false && (
              <span className="p-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                <IconAlertCircle className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>

        {showFeedback && isValid === false && (
          <p className="text-xs text-red-600 dark:text-red-400 flex items-center space-x-1 mt-1">
            <IconAlertCircle className="w-4 h-4 shrink-0" />
            <span>Invalid Aadhaar number</span>
          </p>
        )}
      </div>

      <div className="text-right">
        <button
          type="button"
          id="toggle-vid-btn"
          onClick={toggleVid}
          className="text-xs text-[#0F6E56] dark:text-emerald-400 hover:underline font-medium"
        >
          {useVid ? 'Use Aadhaar number instead' : 'Use Virtual ID (VID) instead'}
        </button>
      </div>
    </div>
  )
}
