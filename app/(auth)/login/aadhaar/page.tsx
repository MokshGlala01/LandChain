'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import Link from 'next/link'
import { useAuth } from '@/components/providers'

import AadhaarInput from '@/components/auth/AadhaarInput'
import OtpWaiting from '@/components/auth/OtpWaiting'
import OtpEntry from '@/components/auth/OtpEntry'

export default function AadhaarLoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [step, setStep] = useState(1) // 1 = Entry, 2 = OTP
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [aadhaarNum, setAadhaarNum] = useState('')
  const [txnId, setTxnId] = useState('')
  const [aadhaarHash, setAadhaarHash] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null)
  const [showOtpInputs, setShowOtpInputs] = useState(false)
  const [mockOtp, setMockOtp] = useState<string | null>(null)

  // 3-second timer transition for OTP waiting screen in Step 2
  useEffect(() => {
    if (step === 2 && !showOtpInputs) {
      const timer = setTimeout(() => {
        setShowOtpInputs(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [step, showOtpInputs])

  // Submit Aadhaar number and trigger OTP dispatch
  const handleAadhaarSubmit = async (aadhaar: string) => {
    setLoading(true)
    setError('')
    setAadhaarNum(aadhaar)

    const newTxnId = crypto.randomUUID()
    setTxnId(newTxnId)

    try {
      const res = await fetch('/api/auth/aadhaar/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar, txnId: newTxnId })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch verification code')
      }

      setAadhaarHash(data.aadhaarHash)
      setMockOtp(data.mockOtp || null)

      toast.success('OTP sent to your registered mobile number')

      setStep(2)
      setShowOtpInputs(false)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || 'OTP dispatch failed')
    } finally {
      setLoading(false)
    }
  }

  // Verify OTP and establish session
  const handleOtpVerifySubmit = async (otp: string) => {
    setLoading(true)
    setError('')

    try {
      // 1. Verify OTP
      const verifyRes = await fetch('/api/auth/aadhaar/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txnId, otp, aadhaarHash })
      })

      const verifyData = await verifyRes.json()

      if (!verifyRes.ok) {
        if (verifyData.attemptsLeft !== undefined) {
          setAttemptsLeft(verifyData.attemptsLeft)
        }
        throw new Error(verifyData.error || 'OTP verification failed')
      }

      // 2. Fetch session by hash
      const sessionRes = await fetch(`/api/auth/session?aadhaarHash=${encodeURIComponent(aadhaarHash)}`, {
        method: 'GET'
      })

      const sessionData = await sessionRes.json()

      if (!sessionRes.ok) {
        if (sessionRes.status === 404) {
          throw new Error('This Aadhaar number is not registered. Please register first.')
        }
        throw new Error(sessionData.error || 'Failed to establish session')
      }

      // Synchronize client context
      await login(aadhaarHash, sessionData.role, sessionData.name)

      toast.success('Signed in successfully!')
      router.push(`/${sessionData.role.toLowerCase()}`)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP trigger
  const handleOtpResend = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/aadhaar/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar: aadhaarNum, txnId })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend OTP')
      }

      if (data.mockOtp) {
        setMockOtp(data.mockOtp)
      }
      toast.success('A new OTP has been dispatched to your mobile')

      setShowOtpInputs(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 }
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Wizard Header Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
          <span>Aadhaar Login Gateway</span>
          <span>Step {step} of 2</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#0F6E56] transition-all duration-500 rounded-full"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 bg-red-50 text-red-700 text-xs font-medium border border-red-200 rounded-xl leading-normal space-y-2">
          <p>{error}</p>
          {error.includes('not registered') && (
            <Link 
              href="/register" 
              className="inline-block text-[#0F6E56] font-bold hover:underline"
            >
              Go to registration &rarr;
            </Link>
          )}
        </div>
      )}

      {/* Transition Container */}
      <div className="relative overflow-hidden min-h-[300px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-login-aadhaar"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <AadhaarInput onSubmit={handleAadhaarSubmit} isLoading={loading} />
              <div className="text-center pt-4">
                <Link href="/login" className="text-xs text-slate-400 font-semibold hover:underline">
                  &larr; Choose another method
                </Link>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-login-otp"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              {!showOtpInputs ? (
                <OtpWaiting />
              ) : (
                <OtpEntry
                  onSubmit={handleOtpVerifySubmit}
                  onResend={handleOtpResend}
                  isLoading={loading}
                  attemptsLeft={attemptsLeft}
                  mockOtp={mockOtp}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
