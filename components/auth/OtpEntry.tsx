'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { IconDeviceMobile, IconAlertCircle } from '@tabler/icons-react'

interface OtpEntryProps {
  onSubmit: (otp: string) => void
  onResend: () => void
  onStartOver: () => void
  isLoading?: boolean
  attemptsLeft: number | null
  resendAttempts: number
  errorMsg: string | null
}

export default function OtpEntry({
  onSubmit,
  onResend,
  onStartOver,
  isLoading = false,
  attemptsLeft = null,
  resendAttempts = 0,
  errorMsg = null
}: OtpEntryProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [timeLeft, setTimeLeft] = useState(60) // 60 seconds cooldown
  const [shake, setShake] = useState(false)
  const inputRefs = useRef<HTMLInputElement[]>([])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  // Shake effect on errorMsg change
  useEffect(() => {
    if (errorMsg) {
      setShake(true)
      const t = setTimeout(() => setShake(false), 500)
      return () => clearTimeout(t)
    }
  }, [errorMsg])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  const handleChange = (index: number, val: string) => {
    const digits = val.replace(/\D/g, '')
    if (!digits) return

    const newOtp = [...otp]
    newOtp[index] = digits.slice(-1)
    setOtp(newOtp)

    if (index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp]
      if (otp[index]) {
        newOtp[index] = ''
        setOtp(newOtp)
      } else if (index > 0) {
        newOtp[index - 1] = ''
        setOtp(newOtp)
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      const newOtp = text.split('')
      setOtp(newOtp)
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerify = () => {
    const fullOtp = otp.join('')
    if (fullOtp.length === 6) {
      onSubmit(fullOtp)
    }
  }

  const handleResendClick = () => {
    if (timeLeft === 0 && resendAttempts < 3) {
      setOtp(Array(6).fill(''))
      setTimeLeft(60)
      onResend()
      inputRefs.current[0]?.focus()
    }
  }

  const isComplete = otp.every((digit) => digit !== '')

  if (attemptsLeft !== null && attemptsLeft <= 0) {
    return (
      <div className="flex flex-col items-center text-center space-y-6 py-4">
        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full border border-red-200 dark:border-red-900/30">
          <IconAlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2 max-w-[340px]">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Verification Locked</h3>
          <p className="text-sm text-slate-500">
            Too many incorrect OTP attempts. Please restart the authentication process.
          </p>
        </div>
        <button
          type="button"
          id="start-over-btn"
          onClick={onStartOver}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all"
        >
          Start Over
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-[#0F6E56] dark:text-emerald-400">
          <IconDeviceMobile className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Enter Aadhaar OTP</h3>
        <p className="text-xs text-slate-500">Provide the 6-digit code received on your registered device</p>
      </div>

      {/* 6 Digit Input Grid with Shake Animation */}
      <motion.div 
        animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex justify-between gap-2"
      >
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              if (el) inputRefs.current[i] = el
            }}
            type="tel"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            autoFocus={i === 0}
            className={`w-12 h-14 border rounded-xl text-center text-[24px] font-bold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 transition-all focus:outline-none ${
              errorMsg ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20'
            }`}
          />
        ))}
      </motion.div>

      {/* Resend OTP & Countdown */}
      <div className="flex justify-between items-center text-xs">
        <div className="text-slate-500 font-medium">
          {timeLeft > 0 ? (
            <span>Resend OTP in <span className="font-mono text-slate-800 dark:text-slate-200">{formatTime(timeLeft)}</span></span>
          ) : resendAttempts >= 3 ? (
            <span className="text-red-500">Max resend attempts reached</span>
          ) : (
            <button
              type="button"
              id="resend-otp-btn"
              onClick={handleResendClick}
              className="text-[#0F6E56] dark:text-emerald-400 font-semibold hover:underline"
            >
              Resend OTP
            </button>
          )}
        </div>

        {/* Resend Attempts indicators */}
        <div className="flex items-center space-x-1">
          {[1, 2, 3].map((num) => (
            <span
              key={num}
              className={`w-2 h-2 rounded-full ${
                resendAttempts >= num
                  ? 'bg-slate-400 dark:bg-slate-600'
                  : 'bg-slate-200 dark:bg-slate-800'
              }`}
              title={`Resend attempt ${num}`}
            />
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs font-semibold rounded-xl flex items-center space-x-2 border border-red-100 dark:border-red-900/30">
          <IconAlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Verify Button */}
      <button
        type="button"
        id="verify-otp-btn"
        onClick={handleVerify}
        disabled={!isComplete || isLoading}
        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex justify-center items-center ${
          isComplete && !isLoading
            ? 'bg-[#0F6E56] text-white hover:bg-[#085041] shadow-lg shadow-emerald-900/10 active:scale-[0.98]'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Verifying...</span>
          </span>
        ) : (
          <span>Verify &amp; Continue</span>
        )}
      </button>
    </div>
  )
}
