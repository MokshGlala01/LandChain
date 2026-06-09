'use client'

import React from 'react'
import Link from 'next/link'
import { IconFingerprint, IconCloudLock } from '@tabler/icons-react'

interface MethodSelectorProps {
  mode: 'login' | 'register';
  onSelectAadhaar: () => void;
  onSelectDigiLocker: () => void;
  isDigiLockerLoading?: boolean;
}

export default function MethodSelector({
  mode,
  onSelectAadhaar,
  onSelectDigiLocker,
  isDigiLockerLoading = false
}: MethodSelectorProps) {
  const isRegister = mode === 'register'

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-[#0F6E56] flex items-center justify-center text-white font-bold text-lg shadow-md">
            L
          </div>
          <span className="font-extrabold text-gray-900 text-xl tracking-tight font-heading">
            Land<span className="text-[#0F6E56]">Chain</span>
          </span>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          {isRegister ? 'Create your account' : 'Sign in to LandChain'}
        </h2>
        <p className="text-xs text-gray-500 max-w-[340px] mx-auto">
          Verify your identity using Government of India approved methods
        </p>
      </div>

      {/* Stacked Selection Cards */}
      <div className="flex flex-col space-y-4">
        {/* Method 1: Aadhaar OTP */}
        <div 
          onClick={onSelectAadhaar}
          className="group relative flex flex-col p-5 border border-slate-200 hover:border-emerald-500 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer text-left active:scale-[0.99]"
        >
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors">
              <IconFingerprint className="w-8 h-8 stroke-[1.5]" />
            </div>
            
            <div className="space-y-1.5 flex-1 pr-6">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-gray-900 text-sm">
                  {isRegister ? 'Verify with Aadhaar' : 'Login with Aadhaar OTP'}
                </h3>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded-full">
                  Powered by UIDAI
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-normal">
                OTP will be sent to your Aadhaar-registered mobile number by UIDAI&apos;s authentication service.
              </p>
            </div>
          </div>
          
          <button 
            type="button"
            className="w-full mt-4 py-2.5 px-4 bg-[#0F6E56] text-white rounded-xl font-semibold text-xs transition-colors hover:bg-[#085041]"
          >
            {isRegister ? 'Continue with Aadhaar' : 'Authenticate via Aadhaar'}
          </button>
        </div>

        {/* Method 2: DigiLocker */}
        <div 
          onClick={onSelectDigiLocker}
          className="group relative flex flex-col p-5 border border-slate-200 hover:border-blue-500 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer text-left active:scale-[0.99]"
        >
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
              <IconCloudLock className="w-8 h-8 stroke-[1.5]" />
            </div>

            <div className="space-y-1.5 flex-1 pr-6">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-gray-900 text-sm">
                  {isRegister ? 'Continue with DigiLocker' : 'Login with DigiLocker'}
                </h3>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded-full">
                  Govt of India
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-normal">
                Securely sign in and retrieve your verified Aadhaar XML credentials via your cloud DigiLocker.
              </p>
            </div>
          </div>

          <button 
            type="button"
            disabled={isDigiLockerLoading}
            className="w-full mt-4 py-2.5 px-4 bg-blue-600 text-white rounded-xl font-semibold text-xs transition-all hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 flex items-center justify-center"
          >
            {isDigiLockerLoading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Redirecting...</span>
              </span>
            ) : (
              <span>Continue with DigiLocker</span>
            )}
          </button>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-500">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <Link href="/login" className="text-[#0F6E56] font-semibold hover:underline">
                Sign in
              </Link>
            </>
          ) : (
            <>
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#0F6E56] font-semibold hover:underline">
                Register now
              </Link>
            </>
          )}
        </p>
      </div>

      {/* UIDAI Legal Consent Note */}
      <div className="border-t border-slate-100 pt-4 flex flex-col items-center space-y-3">
        <p className="text-[10px] text-gray-400 text-center leading-normal max-w-[360px]">
          By continuing, you consent to Aadhaar-based authentication as per UIDAI guidelines. 
          Your raw Aadhaar number will not be stored, logged, or shared under any circumstances.
        </p>

        {/* Govt Logos Row */}
        <div className="flex items-center justify-center space-x-5 opacity-40 grayscale hover:opacity-75 hover:grayscale-0 transition-all duration-300">
          <div className="text-[9px] font-extrabold text-slate-800 tracking-wider">UIDAI</div>
          <div className="w-px h-3.5 bg-slate-200" />
          <div className="text-[9px] font-extrabold text-blue-900 tracking-wider">DigiLocker</div>
          <div className="w-px h-3.5 bg-slate-200" />
          <div className="text-[9px] font-extrabold text-[#BA7517] tracking-wider">MeitY</div>
        </div>
      </div>
    </div>
  )
}
