'use client'

import React from 'react'

interface ConsentCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: React.ReactNode
}

export default function ConsentCheckbox({ checked, onChange, label }: ConsentCheckboxProps) {
  return (
    <label className="flex items-start space-x-3 cursor-pointer group p-1 select-none">
      <input
        type="checkbox"
        id="consent-checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer transition-colors shrink-0"
      />
      <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
        {label || "I consent to authenticate via UIDAI using my Aadhaar number."}
      </div>
    </label>
  )
}
