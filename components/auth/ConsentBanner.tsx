'use client'

import React, { useState } from 'react'
import { IconShieldCheck, IconInfoCircle } from '@tabler/icons-react'

interface ConsentBannerProps {
  onAgree: () => void;
  auaCode?: string;
}

export default function ConsentBanner({ onAgree, auaCode = 'LC_AUA_8921' }: ConsentBannerProps) {
  const [checked, setChecked] = useState(false)

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
          <IconShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">Aadhaar Authentication Consent</h3>
          <p className="text-xs text-gray-500">Voluntary consent for identity verification</p>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 max-h-[200px] overflow-y-auto text-sm text-gray-600 leading-relaxed scrollbar-thin">
        <p className="font-medium text-gray-900 mb-2">Consent Terms &amp; Conditions:</p>
        <p className="mb-3">
          I hereby voluntarily give my consent to LandChain (AUA Code: <span className="font-semibold">{auaCode}</span>) 
          to use my Aadhaar number / Virtual ID (VID) for the purpose of authentication through UIDAI&apos;s 
          Authentication Service.
        </p>
        <p className="mb-3">
          I understand that my Aadhaar number will not be stored by LandChain, and will only be used 
          for one-time verification during the registration or login processes. My Aadhaar number is 
          hashed using advanced SHA-256 protocols and a secure salt, and only the hash is recorded 
          in the LandChain ledger database for identity linking.
        </p>
        <p className="mb-3">
          I am aware that the OTP (One-Time Password) for authentication will be sent by UIDAI to my 
          registered mobile number linked with Aadhaar, and not by LandChain. LandChain does not 
          have access to, nor does it store, my registered mobile number or the OTP code itself.
        </p>
        <p>
          This consent is compliant with Section 8 of the Aadhaar Act, 2016, and the Digital Personal 
          Data Protection (DPDP) Act, 2023. I can withdraw my consent at any time by deleting my 
          LandChain profile, upon which my hashed identity mapping will be permanently removed.
        </p>
      </div>

      <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200/50">
        <IconInfoCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-normal">
          By signing, you authorise UIDAI to share your demographic records (Name, DOB, Gender, Address, and Photo) 
          with LandChain for KYC verification.
        </p>
      </div>

      <label className="flex items-center space-x-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
        />
        <span className="text-sm font-medium text-gray-700 select-none group-hover:text-gray-900 transition-colors">
          I have read and agree to the above consent terms
        </span>
      </label>

      <button
        onClick={onAgree}
        disabled={!checked}
        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
          checked
            ? 'bg-[#0F6E56] text-white hover:bg-[#085041] shadow-lg shadow-emerald-900/10 active:scale-[0.98]'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        I Agree &amp; Continue
      </button>
    </div>
  )
}
