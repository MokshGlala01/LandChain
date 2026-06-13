'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers'
import { IconAlertTriangle, IconLock, IconArrowRight } from '@tabler/icons-react'
import AadhaarInput from '@/components/auth/AadhaarInput'
import OtpWaiting from '@/components/auth/OtpWaiting'
import OtpEntry from '@/components/auth/OtpEntry'
import ConsentCheckbox from '@/components/auth/ConsentCheckbox'
import KycReviewCard from '@/components/auth/KycReviewCard'

export default function AadhaarOTPRegisterPage() {
  const router = useRouter()
  const { login } = useAuth()

  // Wizard state: 1 = Aadhaar Entry, 2 = OTP Waiting/Entry, 3 = Profile Review & Role Selector, 4 = Pending Approval
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLoginLink, setShowLoginLink] = useState(false)

  // Step 1 States
  const [rawValue, setRawValue] = useState('')
  const [useVid, setUseVid] = useState(false)
  const [isValidAadhaar, setIsValidAadhaar] = useState<boolean | null>(null)
  const [consentChecked, setConsentChecked] = useState(false)

  // Step 2 States
  const [txnId, setTxnId] = useState('')
  const [aadhaarHash, setAadhaarHash] = useState('')
  const [showOtpInputs, setShowOtpInputs] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null)
  const [resendAttempts, setResendAttempts] = useState(0)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Step 3 States
  const [kycData, setKycData] = useState<{
    name: string
    dob: string
    gender: string
    address: string
    careOf?: string
    photo?: string
  } | null>(null)
  const [selectedRole, setSelectedRole] = useState('Citizen')

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
  const handleAadhaarSubmit = async () => {
    if (!isValidAadhaar || !consentChecked || loading) return

    setLoading(true)
    setError(null)
    setShowLoginLink(false)
    const newTxnId = crypto.randomUUID()
    setTxnId(newTxnId)

    try {
      const res = await fetch('/api/auth/register/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar: rawValue, txnId: newTxnId })
      })

      const data = await res.json()
      if (data.debug) {
        setDebugInfo(data.debug)
      }

      if (!res.ok) {
        if (data.error === 'ACCOUNT_EXISTS' || data.code === 'ACCOUNT_EXISTS') {
          setShowLoginLink(true)
          throw new Error('An account already exists with this Aadhaar. Please login instead.')
        }
        if (data.code === '940' || data.error === '940') {
          // Special full screen blocking state (No mobile linked)
          setStep(2)
          setShowOtpInputs(false)
          setAttemptsLeft(0)
          setError('940')
          return
        }
        throw new Error(data.error || 'Aadhaar registration initiation failed.')
      }

      setAadhaarHash(data.aadhaarHash)
      


      toast.success('OTP sent to registered mobile number')
      setStep(2)
      setShowOtpInputs(false)
      setAttemptsLeft(3)
    } catch (err: any) {
      setError(err.message || 'Unable to verify Aadhaar. Please try again.')
      toast.error(err.message || 'Verification failed')
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
      const res = await fetch('/api/auth/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txnId, otp })
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.attemptsLeft !== undefined) {
          setAttemptsLeft(data.attemptsLeft)
        }
        throw new Error(data.message || data.error || 'Incorrect OTP.')
      }

      if (!data.kyc) {
        throw new Error('Failed to retrieve eKYC details from UIDAI.')
      }

      setAadhaarHash(data.aadhaarHash)
      setKycData(data.kyc)
      setStep(3)
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
      const res = await fetch('/api/auth/register/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar: rawValue, txnId })
      })

      const data = await res.json()
      if (data.debug) {
        setDebugInfo(data.debug)
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend OTP')
      }



      setResendAttempts((prev) => prev + 1)
      toast.success('A new OTP has been dispatched to your mobile')
      setShowOtpInputs(false)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Complete Registration & Create Session (Step 3)
  const handleRegisterSubmit = async () => {
    if (!kycData || loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aadhaarHash,
          name: kycData.name,
          dob: kycData.dob,
          gender: kycData.gender,
          role: selectedRole,
          address: kycData.address,
          careOf: kycData.careOf,
          photo: kycData.photo
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete registration.')
      }

      if (data.pendingApproval) {
        setStep(4)
        return
      }

      await login(aadhaarHash, data.role, kycData.name)
      toast.success('Registration successful!')
      router.push(`/${data.role.toLowerCase()}`)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStartOver = () => {
    setStep(1)
    setRawValue('')
    setIsValidAadhaar(null)
    setConsentChecked(false)
    setTxnId('')
    setAadhaarHash('')
    setShowOtpInputs(false)
    setAttemptsLeft(null)
    setResendAttempts(0)
    setKycData(null)
    setError(null)
    setShowLoginLink(false)
    setDebugInfo(null)
  }

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  }

  if (error === '940') {
    return (
      <div className="flex flex-col items-center text-center space-y-6 py-4">
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-full border border-amber-200 dark:border-amber-900/30">
          <IconAlertTriangle className="w-12 h-12" />
        </div>
        <div className="space-y-3 max-w-[340px]">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">OTP could not be sent</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your Aadhaar number does not have a mobile number registered 
            with UIDAI, so an OTP cannot be sent.
          </p>
          <p className="text-xs text-slate-400">
            Please visit your nearest Aadhaar Seva Kendra to link a mobile 
            number to your Aadhaar, then try again.
          </p>
        </div>
        <div className="w-full pt-4 space-y-3">
          <a
            href="https://uidai.gov.in/locate-center"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold flex justify-center items-center gap-2 shadow-lg transition-all text-center"
          >
            Find nearest center &rarr;
          </a>
          <button
            type="button"
            onClick={handleStartOver}
            className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all font-semibold"
          >
            Start Over
          </button>
        </div>
      </div>
    )
  }

  if (step === 4) {
    return (
      <div className="flex flex-col items-center text-center space-y-6 py-4">
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-900/30">
          <IconLock className="w-12 h-12" />
        </div>
        <div className="space-y-3 max-w-[340px]">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Pending Admin Approval</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Your registration request is successful, but non-citizen profiles require verification by a LandChain administrator.
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
          <span className={`w-2 h-2 rounded-full ${step === 3 ? 'bg-[#0F6E56]' : 'bg-slate-200 dark:bg-slate-800'}`} />
        </div>
        <span className="text-[11px] font-semibold text-slate-400">Step {step} of 3</span>
      </div>

      {/* Main Form Error alerts */}
      {error && error !== '940' && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs font-semibold rounded-xl flex flex-col space-y-2 border border-red-100 dark:border-red-900/30">
          <div className="flex items-center space-x-2">
            <IconAlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          {showLoginLink && (
            <Link 
              href="/login" 
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center space-x-1 pl-6"
            >
              <span>Login to your account</span>
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
              key="register-step-1"
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
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create Account</h2>
                <p className="text-xs text-slate-500">Register securely via UIDAI eKYC</p>
              </div>

              {/* Aadhaar Input */}
              <AadhaarInput
                rawValue={rawValue}
                onChange={setRawValue}
                useVid={useVid}
                setUseVid={setUseVid}
                isValid={isValidAadhaar}
                setIsValid={setIsValidAadhaar}
              />

              {/* Scrollable terms box */}
              <div className="h-28 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-[10px] text-slate-500 space-y-2 bg-slate-50/50 dark:bg-slate-950/50 leading-relaxed scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">UIDAI eKYC Consent Policy</p>
                <p>1. <strong>Purpose:</strong> I hereby declare that I have no objection in providing my Aadhaar number and performing verification via OTP.</p>
                <p>2. <strong>Data Retrieval:</strong> I authorize UIDAI to share my demographic details (Name, Date of Birth, Gender, Care of, Address, and Profile Picture) with LandChain for identity verification and account creation.</p>
                <p>3. <strong>Storage & Privacy:</strong> LandChain will NOT store my raw Aadhaar number or OTP. A cryptographically secure SHA-256 hash will be utilized for identity mapping. All fetched profile photos and demographics will be stored securely.</p>
              </div>

              {/* Consent Checkbox */}
              <ConsentCheckbox
                checked={consentChecked}
                onChange={setConsentChecked}
                label={
                  <span>
                    I consent to verify my identity and retrieve my official eKYC demographic data from UIDAI.
                  </span>
                }
              />

              {/* Action Button */}
              <button
                type="button"
                id="send-otp-btn"
                onClick={handleAadhaarSubmit}
                disabled={!isValidAadhaar || !consentChecked || loading}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex justify-center items-center gap-2 ${
                  isValidAadhaar && consentChecked && !loading
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
                    <span>Contacting UIDAI...</span>
                  </>
                ) : (
                  <span>Send OTP</span>
                )}
              </button>

              <div className="text-center text-xs text-slate-500 pt-2">
                Already registered?{' '}
                <Link href="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                  Sign in instead
                </Link>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="register-step-2"
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

          {step === 3 && kycData && (
            <motion.div
              key="register-step-3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-6 animate-fadeIn"
            >
              <div className="text-center space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Confirm Profile Details</h3>
                <p className="text-xs text-slate-500">Demographic details fetched via secure eKYC</p>
              </div>

              {/* KYC Review Component */}
              <KycReviewCard kyc={kycData} />

              {/* Role Dropdown */}
              <div className="flex flex-col space-y-2 pt-2">
                <label htmlFor="role-select" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Select System Role
                </label>
                <select
                  id="role-select"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Citizen">Citizen</option>
                  <option value="Bank Officer">Bank Officer</option>
                  <option value="Registrar">Registrar</option>
                  <option value="Builder">Builder</option>
                  <option value="Agricultural Officer">Agricultural Officer</option>
                </select>
                {selectedRole !== 'Citizen' && (
                  <p className="text-[11px] text-amber-600 font-medium">
                    * Non-citizen roles require verification by LandChain admin before activation.
                  </p>
                )}
              </div>

              {/* Submit Registration Button */}
              <button
                type="button"
                id="create-account-btn"
                onClick={handleRegisterSubmit}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#0F6E56] hover:bg-[#085041] text-white font-semibold shadow-lg transition-all active:scale-[0.98] flex justify-center items-center"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {process.env.NODE_ENV === 'development' && debugInfo && (
        <div className="debug-panel border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950 text-[10px] text-slate-500 font-mono space-y-1 mt-4">
          <strong className="text-slate-700 dark:text-slate-300">Debug — UIDAI Response:</strong>
          <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}

    </div>
  )
}
