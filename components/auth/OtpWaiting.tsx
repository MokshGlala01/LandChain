'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { IconDeviceMobileMessage } from '@tabler/icons-react'

export default function OtpWaiting() {
  return (
    <div className="flex flex-col items-center text-center space-y-6 py-6">
      {/* Centered Graphic Icon */}
      <div className="relative flex justify-center items-center w-20 h-20 bg-emerald-50 dark:bg-emerald-950/20 rounded-full border border-emerald-100 dark:border-emerald-900/30">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-full"
        />
        <IconDeviceMobileMessage className="w-12 h-12 text-[#0F6E56] dark:text-emerald-400 relative z-10" />
      </div>

      <div className="space-y-3 max-w-[340px]">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">OTP sent by UIDAI</h3>
        
        <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed font-medium">
          UIDAI has sent a 6-digit OTP to the mobile number registered 
          with this Aadhaar number.
        </p>

        <p className="text-xs text-gray-400 dark:text-slate-500 leading-relaxed">
          LandChain does not have access to this mobile number. 
          Check the SMS on the device linked to your Aadhaar.
        </p>
      </div>
    </div>
  )
}
