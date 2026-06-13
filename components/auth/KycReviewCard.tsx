'use client'

import React from 'react'
import { IconShieldCheck, IconInfoCircle, IconUser } from '@tabler/icons-react'

interface KycData {
  name: string
  dob: string
  gender: string
  address: string
  careOf?: string
  photo?: string
}

interface KycReviewCardProps {
  kyc: KycData
}

export default function KycReviewCard({ kyc }: KycReviewCardProps) {
  const formatDateString = (dateStr: string) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-4">
      <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden">
        
        {/* Verification badge */}
        <div className="absolute top-4 right-4 flex items-center space-x-1 py-0.5 px-2.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-200/50 dark:border-emerald-900/30">
          <IconShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Verified by UIDAI</span>
        </div>

        {/* Circular photo & Profile header */}
        <div className="flex items-center space-x-4 pt-2">
          {kyc.photo ? (
            <img 
              src={kyc.photo.startsWith('data:') ? kyc.photo : `data:image/jpeg;base64,${kyc.photo}`} 
              alt="Aadhaar Profile" 
              className="w-[72px] h-[72px] rounded-full object-cover border-2 border-emerald-500/20 shadow-md shrink-0" 
            />
          ) : (
            <div className="w-[72px] h-[72px] rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border-2 border-emerald-500/20 shrink-0">
              <IconUser className="w-8 h-8" />
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Full Name</p>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">{kyc.name}</h4>
          </div>
        </div>

        {/* Demographic Fields Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs border-t border-slate-200/60 dark:border-slate-800/80 pt-4">
          <div>
            <p className="font-semibold text-slate-400 dark:text-slate-500">Date of Birth</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{formatDateString(kyc.dob)}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-400 dark:text-slate-500">Gender</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{kyc.gender}</p>
          </div>
          {kyc.careOf && (
            <div className="col-span-2">
              <p className="font-semibold text-slate-400 dark:text-slate-500">Care Of</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{kyc.careOf}</p>
            </div>
          )}
          <div className="col-span-2">
            <p className="font-semibold text-slate-400 dark:text-slate-500">Address</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed">{kyc.address}</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start space-x-2.5 p-3.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-xs text-blue-800 dark:text-blue-400 leading-relaxed">
        <IconInfoCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          These details are fetched directly from your Aadhaar and cannot be edited here. 
          To update them, visit an Aadhaar Seva Kendra.
        </p>
      </div>
    </div>
  )
}
