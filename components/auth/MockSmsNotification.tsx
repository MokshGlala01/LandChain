'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconMessage } from '@tabler/icons-react'

interface MockSmsNotificationProps {
  otp: string | null
  visible: boolean
  onClose: () => void
}

export default function MockSmsNotification({ otp, visible, onClose }: MockSmsNotificationProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose()
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [visible, onClose])

  return (
    <AnimatePresence>
      {visible && otp && (
        <motion.div
          initial={{ y: -100, x: '-50%', opacity: 0 }}
          animate={{ y: 0, x: '-50%', opacity: 1 }}
          exit={{ y: -100, x: '-50%', opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 120 }}
          className="fixed top-4 left-1/2 z-[100] w-full max-w-sm px-4 pointer-events-auto"
        >
          <div className="bg-slate-900/95 backdrop-blur text-white rounded-2xl p-4 shadow-2xl border border-slate-800 flex items-start space-x-3.5">
            {/* Messages Icon */}
            <div className="p-2 bg-blue-600 rounded-xl text-white mt-0.5 shadow-md shadow-blue-900/20">
              <IconMessage className="w-5 h-5" />
            </div>

            {/* Notification Content */}
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-200">Messages</span>
                <span className="text-[10px] text-slate-400 font-medium">now</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                LandChain Verification: Your Aadhaar Secure OTP is <span className="font-bold text-white tracking-wide bg-slate-800 px-1.5 py-0.5 rounded">{otp}</span>. Valid for 2 minutes.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
