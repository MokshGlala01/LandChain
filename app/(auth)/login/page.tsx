'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const err = params.get('error')
      if (err) {
        if (err === 'AccessDenied' || err === 'CallbackRouteError') {
          setError('Google account is not registered. Please create an account first.')
        } else if (err === 'OAuthAccountNotLinked') {
          setError('This email is already registered with a password. Please sign in using your email and password.')
        } else if (err === 'Configuration') {
          setError('Google OAuth access denied. Ensure this Google account is added as a "Test User" on your Google Console OAuth Consent Screen.')
        } else {
          setError('Authentication failed. Please try again.')
        }
      }
    }
  }, [])

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
        setLoading(false)
        return
      }

      toast.success('Successfully logged in!')
      router.push('/auth/redirect')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An unexpected error occurred.')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      // Set short-lived cookie to inform NextAuth signIn callback that this is a sign-in flow
      document.cookie = "landchain_oauth_flow=signin; path=/; max-age=60; SameSite=Lax";
      await signIn('google', { callbackUrl: '/auth/redirect' })
    } catch (err: any) {
      toast.error('Google login failed.')
    }
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
        <h1 className="text-2xl font-normal text-slate-800 dark:text-slate-100 font-sans tracking-tight">Sign in</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">to continue to LandChain</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs font-semibold rounded-lg border border-red-100 dark:border-red-900/30">
          <span>{error}</span>
        </div>
      )}

      {/* Google Account Sign-In Button */}
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
        <span>Sign in with Google Account</span>
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-[0.5px] bg-slate-200 dark:bg-slate-800"></div>
        <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">or</span>
        <div className="flex-1 h-[0.5px] bg-slate-200 dark:bg-slate-800"></div>
      </div>

      <form onSubmit={handleCredentialsSubmit} className="space-y-4" noValidate>
        {/* Email Field */}
        <div className="relative">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
          />
        </div>

        {/* Password Field */}
        <div className="relative border-b-0">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
          />
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs font-semibold text-[#1a73e8] hover:underline">
            Forgot password?
          </Link>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between pt-3">
          <Link 
            href="/register" 
            className="text-sm font-semibold text-[#1a73e8] hover:text-[#1557b0] transition-colors"
          >
            Create account
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
              <span>Next</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
