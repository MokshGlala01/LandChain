'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers'
import { useDropzone } from 'react-dropzone'
import { 
  IconAlertTriangle, 
  IconLock, 
  IconArrowRight, 
  IconDeviceMobile, 
  IconUpload, 
  IconFileText, 
  IconTrash, 
  IconCheck
} from '@tabler/icons-react'
import OtpWaiting from '@/components/auth/OtpWaiting'
import OtpEntry from '@/components/auth/OtpEntry'
import AadhaarInput from '@/components/auth/AadhaarInput'
import ConsentCheckbox from '@/components/auth/ConsentCheckbox'

export default function MobileOTPRegisterPage() {
  const router = useRouter()
  const { login } = useAuth()

  // Wizard state: 1 = Mobile Entry, 2 = OTP Verification, 3 = KYC details, 4 = Role selection, 5 = Pending Approval
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLoginLink, setShowLoginLink] = useState(false)

  // Step 1 States
  const [mobile, setMobile] = useState('')
  const [isValidMobile, setIsValidMobile] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)

  // Step 2 States
  const [showOtpInputs, setShowOtpInputs] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null)
  const [resendAttempts, setResendAttempts] = useState(0)

  // Step 3 States (Manual Profile Details)
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('Male')
  const [aadhaarRaw, setAadhaarRaw] = useState('')
  const [useVid, setUseVid] = useState(false)
  const [isValidAadhaar, setIsValidAadhaar] = useState<boolean | null>(null)
  const [address, setAddress] = useState('')
  const [aadhaarDocIpfsHash, setAadhaarDocIpfsHash] = useState('')
  const [uploading, setUploading] = useState(false)

  // Step 4 States
  const [selectedRole, setSelectedRole] = useState('Citizen')

  // Debug Panel States
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Mobile Validation
  useEffect(() => {
    setIsValidMobile(/^[6-9]\d{9}$/.test(mobile))
  }, [mobile])

  // Step 2 OTP entry transition
  useEffect(() => {
    if (step === 2 && !showOtpInputs) {
      const timer = setTimeout(() => {
        setShowOtpInputs(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [step, showOtpInputs])

  // Step 1: Send OTP
  const handleMobileSubmit = async () => {
    if (!isValidMobile || !consentChecked || loading) return

    setLoading(true)
    setError(null)
    setShowLoginLink(false)

    try {
      const res = await fetch('/api/auth/register/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      })

      const data = await res.json()
      if (data.debug) {
        setDebugInfo(data.debug)
      }

      if (!res.ok) {
        if (data.error === 'ACCOUNT_EXISTS') {
          setShowLoginLink(true)
          throw new Error('An account already exists with this mobile number. Please login instead.')
        }
        throw new Error(data.message || 'Verification initiation failed.')
      }

      if (data.isMock && data.debug?.otp) {
        toast.info(`[Testing SIM] Mobile OTP: ${data.debug.otp}`)
      } else {
        toast.success('OTP sent to your mobile number')
      }
      setStep(2)
      setShowOtpInputs(false)
      setAttemptsLeft(5)
    } catch (err: any) {
      setError(err.message || 'Unable to register. Please try again.')
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleOtpSubmit = async (otp: string) => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/register/verify-otp', {
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

      toast.success('Mobile verified! Proceeding to KYC upload.')
      setStep(3)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/register/send-otp', {
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

  // Step 3: Handle Dropzone Upload
  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    const file = acceptedFiles[0]

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('aadhaarDoc', file)

      const res = await fetch('/api/auth/register/kyc-upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Failed to upload document.')
      }

      setAadhaarDocIpfsHash(data.ipfsHash)
      toast.success('Aadhaar document uploaded to IPFS successfully!')
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  })

  // Advance from Step 3 to Step 4
  const handleKycDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !dob || !gender || !isValidAadhaar || !address || !aadhaarDocIpfsHash) {
      setError('Please fill in all profile fields and upload your Aadhaar document.')
      return
    }
    setError(null)
    setStep(4)
  }

  // Step 4: Finalize Registration
  const handleRegisterSubmit = async () => {
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile,
          name: fullName,
          dob,
          gender,
          aadhaarNumber: aadhaarRaw,
          address,
          aadhaarDocIpfsHash,
          role: selectedRole
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to complete registration.')
      }

      if (data.pendingApproval) {
        setStep(5)
        return
      }

      // Initialize session on client context
      await login(data.aadhaarHash, selectedRole, fullName, data.kycStatus)
      toast.success('Registration completed!')
      router.push(`/${selectedRole.toLowerCase()}`)
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
    setConsentChecked(false)
    setShowOtpInputs(false)
    setAttemptsLeft(null)
    setResendAttempts(0)
    setFullName('')
    setDob('')
    setGender('Male')
    setAadhaarRaw('')
    setIsValidAadhaar(null)
    setAddress('')
    setAadhaarDocIpfsHash('')
    setSelectedRole('Citizen')
    setError(null)
    setShowLoginLink(false)
    setDebugInfo(null)
  }

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  }

  if (step === 5) {
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
    <div className="flex flex-col space-y-6 max-w-lg mx-auto">
      {/* Step Indicators */}
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center space-x-1.5">
          {[1, 2, 3, 4].map((s) => (
            <span 
              key={s} 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                step === s ? 'bg-[#0F6E56] w-4' : 'bg-slate-200 dark:bg-slate-800'
              }`} 
            />
          ))}
        </div>
        <span className="text-[11px] font-semibold text-slate-400">Step {step} of 4</span>
      </div>

      {/* Error Message banner */}
      {error && (
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

      {/* Animation Containers */}
      <div className="relative overflow-hidden min-h-[350px] flex flex-col justify-center">
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
              <div className="flex flex-col items-center text-center space-y-2">
                <img src="/logo.png" alt="LandChain Logo" className="w-12 h-12 object-contain" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create Account</h2>
                <p className="text-xs text-slate-500">Register securely via SMS verification</p>
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

              {/* Scrollable Terms */}
              <div className="h-24 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-[10px] text-slate-500 space-y-2 bg-slate-50/50 dark:bg-slate-950/50 leading-relaxed scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">Identity Verification Consent</p>
                <p>1. <strong>Verification:</strong> I authorize LandChain to verify my mobile number via SMS OTP and collect my manual profile details and Aadhaar card document photo for KYC review.</p>
                <p>2. <strong>Security:</strong> All submitted Aadhaar card documents are hosted on the decentralized IPFS network and remain encrypted/restricted for access only by authorized Land Registry Registrars.</p>
              </div>

              {/* Consent check */}
              <ConsentCheckbox
                checked={consentChecked}
                onChange={setConsentChecked}
                label={
                  <span>
                    I consent to verify my mobile number and upload my Aadhaar document for manual KYC review.
                  </span>
                }
              />

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleMobileSubmit}
                disabled={!isValidMobile || !consentChecked || loading}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex justify-center items-center gap-2 ${
                  isValidMobile && consentChecked && !loading
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

          {step === 3 && (
            <motion.div
              key="register-step-3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="text-center space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Identity Details</h3>
                <p className="text-xs text-slate-500">Provide demographic profile details and upload Aadhaar card document</p>
              </div>

              <form onSubmit={handleKycDetailsSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name (as in Aadhaar)"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                {/* DOB + Gender row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Aadhaar Number */}
                <AadhaarInput
                  rawValue={aadhaarRaw}
                  onChange={setAadhaarRaw}
                  useVid={useVid}
                  setUseVid={setUseVid}
                  isValid={isValidAadhaar}
                  setIsValid={setIsValidAadhaar}
                />

                {/* Address */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Address</label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full address detail"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                {/* Dropzone Document Upload */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Aadhaar Card Document (Front &amp; Back)</label>
                  
                  {!aadhaarDocIpfsHash ? (
                    <div 
                      {...getRootProps()} 
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                        isDragActive 
                          ? 'border-emerald-500 bg-emerald-500/5' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="flex flex-col items-center space-y-2">
                        <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-lg text-slate-400">
                          {uploading ? (
                            <svg className="animate-spin h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <IconUpload className="w-6 h-6" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                          {uploading ? 'Uploading to IPFS...' : 'Drag & drop Aadhaar file here, or click to browse'}
                        </p>
                        <p className="text-[10px] text-slate-400">Supports PDF, JPG, PNG (Max 5MB)</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                          <IconFileText className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Aadhaar_KYC_Doc.pdf</p>
                          <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Decentralized IPFS CID: {aadhaarDocIpfsHash.substring(0, 16)}...</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setAadhaarDocIpfsHash('')}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!fullName || !dob || !gender || !isValidAadhaar || !address || !aadhaarDocIpfsHash || uploading}
                    className={`w-full py-3 rounded-xl font-semibold transition-all flex justify-center items-center ${
                      fullName && dob && gender && isValidAadhaar && address && aadhaarDocIpfsHash && !uploading
                        ? 'bg-[#0F6E56] hover:bg-[#085041] text-white shadow-lg active:scale-[0.98]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Continue to Role Selection
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="register-step-4"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-6 animate-fadeIn"
            >
              <div className="text-center space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">System Role Selector</h3>
                <p className="text-xs text-slate-500">Select your role designation in the Land Registry registry</p>
              </div>

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
                <p className="text-[11px] text-amber-600 font-medium pt-1">
                  * All new user accounts undergo manual Aadhaar document verification by a Land Registrar before full feature unlocking.
                </p>
              </div>

              {/* Submit Registration Button */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-1/3 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  id="create-account-btn"
                  onClick={handleRegisterSubmit}
                  disabled={loading}
                  className="w-2/3 py-3 rounded-xl bg-[#0F6E56] hover:bg-[#085041] text-white font-semibold shadow-lg transition-all active:scale-[0.98] flex justify-center items-center"
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
              </div>
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
