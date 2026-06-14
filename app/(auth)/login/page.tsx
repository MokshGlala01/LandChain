'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { getSession } from 'next-auth/react'
import { toast } from 'sonner'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { AuthDivider } from '@/components/auth/AuthDivider'
import { redirectByRole } from '@/lib/auth-session'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showGoogleModal, setShowGoogleModal] = useState(false)

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
      // Check if credentials are configured
      const res = await fetch('/api/auth/config')
      const data = await res.json()
      if (!data.isConfigured) {
        setShowGoogleModal(true)
        return
      }
      await signIn('google', { callbackUrl: '/auth/redirect' })
    } catch (err: any) {
      toast.error('Google login failed.')
    }
  }

  const handleMockGoogleLogin = async (emailToUse = 'mokshgala.ijs009@gmail.com') => {
    setLoading(true)
    setError(null)
    setShowGoogleModal(false)
    try {
      const result = await signIn('credentials', {
        email: emailToUse,
        isMockGoogle: 'true',
        redirect: false
      })

      if (result?.error) {
        setError('Mock Google login failed.')
        setLoading(false)
        return
      }

      toast.success('Successfully logged in with Mock Google!')
      router.push('/auth/redirect')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="auth-header flex flex-col items-center text-center">
        <img src="/logo.png" alt="LandChain Logo" className="w-12 h-12 object-contain mb-3" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Sign in to LandChain</h1>
        <p className="text-sm text-slate-500">Manage your land records securely</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs font-semibold rounded-xl flex items-center space-x-2 border border-red-100 dark:border-red-900/30">
          <span>{error}</span>
        </div>
      )}

      {/* Google Button */}
      <GoogleButton onClick={handleGoogleLogin} label="Continue with Google" />

      <AuthDivider />

      <form onSubmit={handleCredentialsSubmit} className="space-y-4" noValidate>
        <div className="field">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="field">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <Link href="/forgot-password" style={{ fontSize: 11 }} className="text-emerald-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-2">
        Don't have an account?{' '}
        <Link href="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
          Create one →
        </Link>
      </div>

      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Google Credentials Pending</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Your local <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-xs text-rose-600 dark:text-rose-400">.env.local</code> contains Google Client ID placeholder values. Continuing with the actual Google login will trigger an <strong>invalid_client (Error 401)</strong>.
            </p>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleMockGoogleLogin('mokshgala.ijs009@gmail.com')}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/10"
              >
                <span>✨ Use Mock Developer Login</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowGoogleModal(false)
                  await signIn('google', { callbackUrl: '/auth/redirect' })
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all"
              >
                Continue with Real Google OAuth
              </button>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="w-full py-2.5 px-4 text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
