'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers'

import ConsentBanner from '@/components/auth/ConsentBanner'
import AadhaarInput from '@/components/auth/AadhaarInput'
import OtpWaiting from '@/components/auth/OtpWaiting'
import OtpEntry from '@/components/auth/OtpEntry'
import KycReview from '@/components/auth/KycReview'
import MockSmsNotification from '@/components/auth/MockSmsNotification'

export default function AadhaarRegisterWizard() {
  const router = useRouter()
  const { login } = useAuth()
  
  const [step, setStep] = useState(1) // 1 to 4
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // State shared across wizard steps
  const [aadhaarNum, setAadhaarNum] = useState('')
  const [phone, setPhone] = useState('')
  const [txnId, setTxnId] = useState('')
  const [aadhaarHash, setAadhaarHash] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null)
  const [showOtpInputs, setShowOtpInputs] = useState(false)
  
  // Decrypted eKYC demographic data from UIDAI
  const [kycData, setKycData] = useState<any>(null)
  const [mockOtp, setMockOtp] = useState<string | null>(null)
  const [smsNotifyOtp, setSmsNotifyOtp] = useState<string | null>(null)

  // 3-second timer transition for OTP waiting screen in Step 3
  useEffect(() => {
    if (step === 3 && !showOtpInputs) {
      const timer = setTimeout(() => {
        setShowOtpInputs(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [step, showOtpInputs])

  // Step 2: Submit Aadhaar & request OTP
  const handleAadhaarSubmit = async (aadhaar: string, phoneInput?: string) => {
    setLoading(true)
    setError('')
    setAadhaarNum(aadhaar)
    if (phoneInput) {
      setPhone(phoneInput)
    }

    const newTxnId = crypto.randomUUID()
    setTxnId(newTxnId)

    try {
      const res = await fetch('/api/auth/aadhaar/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar, txnId: newTxnId, phone: phoneInput })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      setAadhaarHash(data.aadhaarHash)
      setMockOtp(data.mockOtp || null)
      toast.success('OTP sent to your registered mobile number')

      if (data.mockOtp) {
        setTimeout(() => {
          setSmsNotifyOtp(data.mockOtp)
        }, 1500)
      }

      setStep(3)
      setShowOtpInputs(false)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Verify OTP & retrieve eKYC profile
  const handleOtpSubmit = async (otp: string) => {
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

      // 2. Retrieve eKYC profile
      const kycRes = await fetch('/api/auth/aadhaar/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txnId, authCode: verifyData.authCode })
      })

      const kycResult = await kycRes.json()

      if (!kycRes.ok) {
        throw new Error(kycResult.error || 'Failed to retrieve KYC demographics')
      }

      setKycData(kycResult)
      setStep(4)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Resend OTP trigger
  const handleOtpResend = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/aadhaar/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar: aadhaarNum, txnId, phone })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend OTP')
      }

      if (data.mockOtp) {
        setMockOtp(data.mockOtp)
        setTimeout(() => {
          setSmsNotifyOtp(data.mockOtp)
        }, 1500)
      }
      toast.success('A new OTP has been dispatched to your mobile')

      setShowOtpInputs(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Step 4: Finalize Profile Creation
  const handleProfileSubmit = async (profile: { email: string; role: string; language: string }) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aadhaarHash,
          name: kycData.name,
          dob: kycData.dob,
          gender: kycData.gender,
          phone: kycData.phone,
          email: profile.email,
          role: profile.role,
          language: profile.language,
          uidaiTxnId: txnId
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete registration')
      }

      // Synchronize client auth provider state
      await login(aadhaarHash, data.role || profile.role, kycData.name)

      toast.success('Registration successful!')

      // Redirect to specific role dashboard
      const targetDashboard = `/${(data.role || profile.role).toLowerCase()}`
      router.push(targetDashboard)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  // Steps transition slide variants
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
          <span>Aadhaar Verification</span>
          <span>Step {step} of 4</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#0F6E56] transition-all duration-500 rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Error Panel */}
      {error && (
        <div className="p-3.5 bg-red-50 text-red-700 text-xs font-medium border border-red-200 rounded-xl leading-normal">
          {error}
        </div>
      )}

      {/* Steps Transition Container */}
      <div className="relative overflow-hidden min-h-[340px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-consent"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <ConsentBanner onAgree={() => setStep(2)} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-aadhaar"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <AadhaarInput onSubmit={handleAadhaarSubmit} isLoading={loading} isRegister={true} />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-otp"
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
                  onSubmit={handleOtpSubmit}
                  onResend={handleOtpResend}
                  isLoading={loading}
                  attemptsLeft={attemptsLeft}
                  mockOtp={mockOtp}
                />
              )}
            </motion.div>
          )}

          {step === 4 && kycData && (
            <motion.div
              key="step-kyc"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <KycReview
                data={{
                  name: kycData.name,
                  dob: kycData.dob,
                  gender: kycData.gender,
                  address: kycData.address,
                  photo: kycData.photo,
                  method: 'UIDAI_OTP'
                }}
                onSubmit={handleProfileSubmit}
                isLoading={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <MockSmsNotification 
        otp={smsNotifyOtp} 
        visible={!!smsNotifyOtp} 
        onClose={() => setSmsNotifyOtp(null)} 
      />
    </div>
  )
}
