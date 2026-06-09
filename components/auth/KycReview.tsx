'use client'

import React, { useState } from 'react'
import { IconUser, IconRosetteDiscountCheckFilled, IconMapPin, IconCalendar, IconGenderMale } from '@tabler/icons-react'

interface KycReviewData {
  name: string;
  dob: string;
  gender: string;
  address: string;
  photo?: string;
  method: 'UIDAI_OTP' | 'DIGILOCKER';
}

interface KycReviewProps {
  data: KycReviewData;
  onSubmit: (profile: { email: string; role: string; language: string }) => void;
  isLoading?: boolean;
}

const ROLES = [
  { value: 'citizen', label: 'Citizen', desc: 'Land owners, buyers & sellers' },
  { value: 'builder', label: 'Builder / Developer', desc: 'Real estate developers & societies' },
  { value: 'bank officer', label: 'Bank Officer', desc: 'Mortgage & loan verifications' },
  { value: 'registrar', label: 'Registrar', desc: 'Government registration authorities' },
  { value: 'agricultural officer', label: 'Agri Officer', desc: 'Farm parcel conversions & pooling' }
]

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'mr', label: 'मराठी (Marathi)' },
  { value: 'ta', label: 'தமிழ் (Tamil)' },
  { value: 'te', label: 'తెలుగు (Telugu)' }
]

export default function KycReview({ data, onSubmit, isLoading = false }: KycReviewProps) {
  const [email, setEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState('citizen')
  const [language, setLanguage] = useState('en')

  const handleConfirm = () => {
    onSubmit({ email, role: selectedRole, language })
  }

  const getInitials = (nameStr: string) => {
    return nameStr
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="text-center space-y-1">
        <h3 className="font-bold text-gray-900 text-lg">Verify eKYC Profile</h3>
        <p className="text-xs text-gray-500">Please review your government registered credentials</p>
      </div>

      {/* High Fidelity Demographic Data Card */}
      <div className="border border-slate-200 rounded-2xl bg-[#E1F5EE]/30 p-5 space-y-4 relative overflow-hidden">
        {/* Background glow badge */}
        <div className="absolute right-3 top-3">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <IconRosetteDiscountCheckFilled className="w-4 h-4 text-emerald-600" />
            <span>Verified by {data.method === 'UIDAI_OTP' ? 'UIDAI' : 'DigiLocker'}</span>
          </span>
        </div>

        <div className="flex items-start space-x-4">
          {/* Base64 Avatar or fallback */}
          {data.photo ? (
            <img
              src={`data:image/jpeg;base64,${data.photo}`}
              alt="KYC Profile Photo"
              className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-20 h-20 bg-slate-200 text-slate-500 rounded-xl border border-slate-300 flex items-center justify-center font-bold text-2xl">
              {data.name ? getInitials(data.name) : <IconUser className="w-10 h-10" />}
            </div>
          )}

          <div className="space-y-1 pr-24">
            <h4 className="font-bold text-gray-900 text-base leading-tight">{data.name}</h4>
            <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-gray-500 pt-1 font-medium">
              <span className="flex items-center space-x-1">
                <IconCalendar className="w-3.5 h-3.5" />
                <span>{data.dob}</span>
              </span>
              <span className="flex items-center space-x-1">
                <IconGenderMale className="w-3.5 h-3.5" />
                <span>{data.gender}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/60 pt-3 flex items-start space-x-2 text-xs text-gray-600 leading-normal">
          <IconMapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2" title={data.address}>{data.address}</span>
        </div>
      </div>

      {/* Profile completion inputs */}
      <div className="space-y-4">
        {/* Email Field */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Email Address (Optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Role Cards Selector */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-semibold text-gray-700">Select System Role</label>
          <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-1">
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.value
              return (
                <div
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`flex flex-col p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 select-none ${
                    isSelected
                      ? 'border-[#0F6E56] bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500/10'
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50'
                  }`}
                >
                  <span className={`text-sm font-semibold ${isSelected ? 'text-[#0F6E56]' : 'text-gray-900'}`}>
                    {role.label}
                  </span>
                  <span className="text-[11px] text-gray-500">{role.desc}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Preferred Language Field */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Preferred Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all cursor-pointer font-medium"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Create Account Action */}
      <button
        type="button"
        disabled={isLoading}
        onClick={handleConfirm}
        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex justify-center items-center bg-[#0F6E56] text-white hover:bg-[#085041] shadow-lg shadow-emerald-900/10 active:scale-[0.98]`}
      >
        {isLoading ? (
          <span className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Creating profile...</span>
          </span>
        ) : (
          <span>Confirm &amp; Create Account</span>
        )}
      </button>
    </div>
  )
}
