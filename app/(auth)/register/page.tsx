'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { PasswordStrengthBar } from '@/components/auth/PasswordStrengthBar'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('CITIZEN')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pendingApproval, setPendingApproval] = useState(false)

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    // Password strength check validation
    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[^A-Za-z0-9]/.test(password)
    if (password.length < 8 || !hasUpper || !hasNumber || !hasSpecial) {
      setError('Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Registration failed.')
        setLoading(false)
        return
      }

      toast.success('Registration successful!')
      
      if (role !== 'CITIZEN') {
        setPendingApproval(true)
        setLoading(false)
        return
      }

      // Auto sign-in for Citizens
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Auto sign-in failed. Please login manually.')
        setLoading(false)
        return
      }

      router.push('/auth/redirect')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred during registration.')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      // Set short-lived cookie to inform NextAuth signIn callback that this is a sign-up flow
      document.cookie = "landchain_oauth_flow=signup; path=/; max-age=60; SameSite=Lax";
      await signIn('google', { callbackUrl: '/auth/redirect' })
    } catch (err: any) {
      toast.error('Google registration failed.')
    }
  }

  if (pendingApproval) {
    return (
      <div className="flex flex-col items-center text-center space-y-6 py-4">
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-900/30">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
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
          onClick={() => {
            setPendingApproval(false)
            router.push('/login')
          }}
          className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-semibold hover:bg-slate-800 transition-all cursor-pointer"
        >
          Return to Login
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Google Logo & Header */}
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Google logo "G" */}
        <svg width="40" height="40" viewBox="0 0 24 24" className="shrink-0 mb-1">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <h1 className="text-2xl font-normal text-slate-800 dark:text-slate-100 font-sans tracking-tight font-heading">Create account</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">to continue to LandChain</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs font-semibold rounded-lg border border-red-100 dark:border-red-900/30">
          <span>{error}</span>
        </div>
      )}

      {/* Google Account Registration Button */}
      <button 
        type="button" 
        onClick={handleGoogleLogin} 
        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md py-2.5 px-4 font-sans text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span>Sign up with Google Account</span>
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-[0.5px] bg-slate-200 dark:bg-slate-800"></div>
        <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">or</span>
        <div className="flex-1 h-[0.5px] bg-slate-200 dark:bg-slate-800"></div>
      </div>

      <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <div className="relative">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
          />
        </div>

        {/* Email Address */}
        <div className="relative">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
          />
          <div className="px-1 mt-1">
            <PasswordStrengthBar password={password} />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
          />
        </div>

        {/* Role Select */}
        <div className="relative">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
          >
            <option value="CITIZEN">Citizen / Property Owner</option>
            <option value="BANK">Bank / Financial Institution</option>
            <option value="BUILDER">Builder / Developer</option>
            <option value="AGRI">Agricultural Officer</option>
            <option value="REGISTRAR">Government Registrar</option>
          </select>
          {role !== 'CITIZEN' && (
            <p className="text-[10px] text-amber-600 dark:text-amber-500 font-semibold mt-1.5 px-1 bg-amber-50 dark:bg-amber-950/20 py-1 rounded">
              ⚠️ Non-citizen roles require manual registrar approval.
            </p>
          )}
        </div>

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between pt-3">
          <Link 
            href="/login" 
            className="text-sm font-semibold text-[#1a73e8] hover:text-[#1557b0] transition-colors"
          >
            Sign in instead
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-sm rounded-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <span>Register</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
