'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers'
import { IconAlertTriangle, IconDeviceMobile, IconLock, IconArrowRight } from '@tabler/icons-react'
import OtpWaiting from '@/components/auth/OtpWaiting'
import OtpEntry from '@/components/auth/OtpEntry'

export default function MobileOTPLoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  // Wizard state: 1 = Mobile Entry, 2 = OTP Waiting/Entry, 3 = Pending Approval
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRegisterLink, setShowRegisterLink] = useState(false)

  // Step 1 States
  const [mobile, setMobile] = useState('')
  const [isValidMobile, setIsValidMobile] = useState(false)

  // Step 2 States
  const [showOtpInputs, setShowOtpInputs] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null)
  const [resendAttempts, setResendAttempts] = useState(0)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Validate mobile number format on change
  useEffect(() => {
    setIsValidMobile(/^[6-9]\d{9}$/.test(mobile))
  }, [mobile])

  // 3-second timer transition for OTP waiting screen in Step 2
  useEffect(() => {
    if (step === 2 && !showOtpInputs) {
      const timer = setTimeout(() => {
        setShowOtpInputs(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [step, showOtpInputs])

  // Step 1 Submission
  const handleMobileSubmit = async () => {
    if (!isValidMobile || loading) return

    setLoading(true)
    setError(null)
    setShowRegisterLink(false)

    try {
      const res = await fetch('/api/auth/login/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      })

      const data = await res.json()
      if (data.debug) {
        setDebugInfo(data.debug)
      }

      if (!res.ok) {
        if (data.error === 'ACCOUNT_NOT_FOUND') {
          setShowRegisterLink(true)
          throw new Error('No account is associated with this mobile number. Please register first.')
        }
        throw new Error(data.message || 'Failed to send OTP.')
      }

      if (data.isMock && data.debug?.otp) {
        toast.info(`[Testing SIM] Mobile OTP: ${data.debug.otp}`)
      } else {
        toast.success('Verification code dispatched to your phone')
      }
      setStep(2)
      setShowOtpInputs(false)
      setAttemptsLeft(5)
    } catch (err: any) {
      setError(err.message || 'Unable to initiate login. Please try again.')
      toast.error(err.message || 'Initialization failed')
    } finally {
      setLoading(false)
    }
  }

  // OTP Verification Submission (Step 2)
  const handleOtpSubmit = async (otp: string) => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp })
      })

      const data = await res.json()
      if (data.debug) {
        setDebugInfo(data.debug)
      }

      if (!res.ok) {
        setAttemptsLeft((prev) => (prev !== null ? prev - 1 : 4))
        throw new Error(data.message || 'Incorrect OTP.')
      }

      if (data.pendingApproval) {
        setStep(3)
        return
      }

      // Log in on context provider
      await login(data.aadhaarHash, data.role, data.name, data.kycStatus)
      toast.success('Sign in successful!')
      router.push(`/${data.role.toLowerCase()}`)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      })

      const data = await res.json()
      if (data.debug) {
        setDebugInfo(data.debug)
      }

      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend OTP')
      }

      setResendAttempts((prev) => prev + 1)
      if (data.isMock && data.debug?.otp) {
        toast.info(`[Testing SIM] Mobile OTP: ${data.debug.otp}`)
      } else {
        toast.success('A new OTP has been dispatched to your mobile')
      }
      setShowOtpInputs(false)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStartOver = () => {
    setStep(1)
    setMobile('')
    setShowOtpInputs(false)
    setAttemptsLeft(null)
    setResendAttempts(0)
    setError(null)
    setShowRegisterLink(false)
    setDebugInfo(null)
  }

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  }

  if (step === 3) {
    return (
      <div className="flex flex-col items-center text-center space-y-6 py-4">
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-900/30">
          <IconLock className="w-12 h-12" />
        </div>
        <div className="space-y-3 max-w-[340px]">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Pending Admin Approval</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Your account request is successful, but non-citizen profiles require verification by a LandChain administrator.
          </p>
          <p className="text-xs text-slate-400">
            You will be granted access once your identity status has been verified. Please contact the registrar office if you require priority activation.
          </p>
        </div>
        <button
          type="button"
          onClick={handleStartOver}
          className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-semibold hover:bg-slate-800 transition-all"
        >
          Return to Login
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Step Dots Indicators */}
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center space-x-1.5">
          <span className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-[#0F6E56]' : 'bg-slate-200 dark:bg-slate-800'}`} />
          <span className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-[#0F6E56]' : 'bg-slate-200 dark:bg-slate-800'}`} />
        </div>
        <span className="text-[11px] font-semibold text-slate-400">Step {step} of 2</span>
      </div>

      {/* Main Form Error alerts */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs font-semibold rounded-xl flex flex-col space-y-2 border border-red-100 dark:border-red-900/30">
          <div className="flex items-center space-x-2">
            <IconAlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          {showRegisterLink && (
            <Link 
              href="/register" 
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center space-x-1 pl-6"
            >
              <span>Create an account now</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      {/* Form Steps transition */}
      <div className="relative overflow-hidden min-h-[300px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="login-step-1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex flex-col items-center text-center space-y-2">
                <img src="/logo.png" alt="LandChain Logo" className="w-12 h-12 object-contain" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Sign in to LandChain</h2>
                <p className="text-xs text-slate-500">Secure OTP-based login via SMS</p>
              </div>

              {/* Mobile Input */}
              <div className="flex flex-col space-y-2">
                <label htmlFor="mobile-input" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Mobile Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-sm font-semibold text-slate-500 border-r border-slate-200 dark:border-slate-800 pr-3 mr-2">
                    +91
                  </div>
                  <input
                    id="mobile-input"
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full pl-16 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  <div className="absolute right-4 text-slate-400">
                    <IconDeviceMobile className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                id="send-otp-btn"
                onClick={handleMobileSubmit}
                disabled={!isValidMobile || loading}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex justify-center items-center gap-2 ${
                  isValidMobile && !loading
                    ? 'bg-[#0F6E56] hover:bg-[#085041] text-white shadow-lg active:scale-[0.98]'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Contacting SMS Gateway...</span>
                  </>
                ) : (
                  <span>Send OTP</span>
                )}
              </button>

              <div className="text-center text-xs text-slate-500 pt-2">
                New to LandChain?{' '}
                <Link href="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                  Create an account
                </Link>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="login-step-2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {!showOtpInputs ? (
                <OtpWaiting />
              ) : (
                <OtpEntry
                  onSubmit={handleOtpSubmit}
                  onResend={handleResendOtp}
                  onStartOver={handleStartOver}
                  isLoading={loading}
                  attemptsLeft={attemptsLeft}
                  resendAttempts={resendAttempts}
                  errorMsg={error}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {process.env.NODE_ENV === 'development' && debugInfo && (
        <div className="debug-panel border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950 text-[10px] text-slate-500 font-mono space-y-1 mt-4">
          <strong className="text-slate-700 dark:text-slate-300">Debug — SMS Response:</strong>
          <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
