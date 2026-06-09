'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { IconDeviceMobile, IconMessageCircle2 } from '@tabler/icons-react'

export default function OtpWaiting() {
  return (
    <div className="flex flex-col items-center text-center space-y-6 py-6">
      {/* Centered Graphic Illustration */}
      <div className="relative flex justify-center items-center w-28 h-28">
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-24 h-24 bg-emerald-100 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute w-20 h-20 bg-emerald-200/50 rounded-full"
        />
        <div className="relative p-5 bg-white rounded-2xl border border-slate-200/80 shadow-md">
          <IconDeviceMobile className="w-12 h-12 text-[#0F6E56]" />
          <motion.div
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: -5, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            className="absolute -top-1 -right-1 p-1 bg-amber-500 text-white rounded-full border-2 border-white"
          >
            <IconMessageCircle2 className="w-4 h-4" />
          </motion.div>
        </div>
      </div>

      <div className="space-y-3 max-w-[340px]">
        <h3 className="text-xl font-bold text-gray-900">OTP Sent by UIDAI</h3>
        
        <p className="text-sm text-gray-600 leading-relaxed">
          A 6-digit One-Time Password has been sent by UIDAI to the mobile number 
          registered with your Aadhaar card.
        </p>

        <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2.5 border border-amber-200/50 leading-relaxed font-medium">
          Please check your phone — the SMS will come directly from <span className="font-bold">UIDAI</span> or 
          <span className="font-bold"> AD-UIDAI</span>, not from LandChain.
        </p>
      </div>

      <p className="text-[11px] text-gray-400 font-medium tracking-wide">
        🚨 Don&apos;t share this OTP with anyone, including LandChain staff.
      </p>
    </div>
  )
}
