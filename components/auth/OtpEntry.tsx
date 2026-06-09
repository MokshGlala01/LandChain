'use client'

import React, { useRef, useState, useEffect } from 'react'
import { IconDeviceMobile } from '@tabler/icons-react'

interface OtpEntryProps {
  onSubmit: (otp: string) => void;
  onResend: () => void;
  isLoading?: boolean;
  attemptsLeft?: number | null;
}

export default function OtpEntry({
  onSubmit,
  onResend,
  isLoading = false,
  attemptsLeft = null
}: OtpEntryProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes (600 seconds)
  const inputRefs = useRef<HTMLInputElement[]>([])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Handle cell text change
  const handleChange = (index: number, val: string) => {
    const digits = val.replace(/\D/g, '')
    if (!digits) return

    const newOtp = [...otp]
    // Use only the last digit typed
    newOtp[index] = digits.slice(-1)
    setOtp(newOtp)

    // Move to next cell
    if (index < 5 && digits) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle backspaces/arrows
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp]
      if (otp[index]) {
        // Clear current cell
        newOtp[index] = ''
        setOtp(newOtp)
      } else if (index > 0) {
        // Go back and clear previous cell
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

  // Handle paste events
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
    if (timeLeft === 0) {
      setOtp(Array(6).fill(''))
      setTimeLeft(600)
      onResend()
      inputRefs.current[0]?.focus()
    }
  }

  const isComplete = otp.every((digit) => digit !== '')

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="p-2.5 bg-emerald-50 rounded-xl text-[#0F6E56]">
          <IconDeviceMobile className="w-7 h-7" />
        </div>
        <h3 className="font-semibold text-gray-900 text-lg">Enter Aadhaar OTP</h3>
        <p className="text-xs text-gray-500">Provide the 6-digit code received on your phone</p>
      </div>

      {/* 6 Digit Input Grid */}
      <div className="flex justify-between gap-2">
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
            className="w-12 h-14 border border-slate-200 rounded-xl text-center text-xl font-bold text-gray-900 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all focus:outline-none"
          />
        ))}
      </div>

      <div className="flex justify-between items-center text-xs">
        {/* Timer */}
        <div className="text-slate-500 font-medium">
          {timeLeft > 0 ? (
            <span>OTP valid for <span className="font-mono text-slate-800">{formatTime(timeLeft)}</span></span>
          ) : (
            <span className="text-red-500 font-semibold">OTP expired</span>
          )}
        </div>

        {/* Resend Link */}
        <button
          type="button"
          onClick={handleResendClick}
          disabled={timeLeft > 0}
          className={`font-semibold transition-colors ${
            timeLeft === 0
              ? 'text-[#0F6E56] hover:text-[#085041] cursor-pointer hover:underline'
              : 'text-slate-300 cursor-not-allowed'
          }`}
        >
          Resend OTP
        </button>
      </div>

      {/* Display attempts counter if active */}
      {attemptsLeft !== null && (
        <p className={`text-xs text-center font-medium ${attemptsLeft <= 1 ? 'text-red-600' : 'text-amber-600'}`}>
          {attemptsLeft} attempt{attemptsLeft > 1 ? 's' : ''} remaining before session lock.
        </p>
      )}

      {/* Verify Button */}
      <button
        type="button"
        onClick={handleVerify}
        disabled={!isComplete || isLoading}
        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex justify-center items-center ${
          isComplete && !isLoading
            ? 'bg-[#0F6E56] text-white hover:bg-[#085041] shadow-lg shadow-emerald-900/10 active:scale-[0.98]'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
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
          <span>Verify OTP</span>
        )}
      </button>
    </div>
  )
}
