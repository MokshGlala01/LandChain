'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const roleRoutes: Record<string, string> = {
  CITIZEN:   '/citizen',
  REGISTRAR: '/registrar',
  BANK:      '/bank',
  ADMIN:     '/admin',
  BUILDER:   '/builder',
  AGRI:      '/agri'
}

export default function AuthRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (session?.user) {
      const role = session.user.role || 'CITIZEN'
      const path = roleRoutes[role] ?? '/citizen'
      router.push(path)
    }
  }, [session, status, router])

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 font-sans"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#030806',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#f8fafc',
        margin: 0
      }}
    >
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div 
        className="text-center space-y-4 p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-xl max-w-sm w-full mx-4"
        style={{
          textAlign: 'center',
          padding: '2.5rem',
          backgroundColor: '#090e0c',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
          maxWidth: '360px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div 
          style={{
            width: '44px',
            height: '44px',
            margin: '0 auto 1.25rem',
            borderRadius: '50%',
            border: '3px solid rgba(29, 158, 117, 0.15)',
            borderTopColor: '#1d9e75',
            animation: 'spin 0.8s linear infinite'
          }}
        />
        <div>
          <h3 
            className="text-base font-bold text-slate-800 dark:text-slate-200"
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: '#f8fafc',
              margin: '0 0 0.5rem 0',
              letterSpacing: '-0.025em'
            }}
          >
            Verifying Session
          </h3>
          <p 
            className="text-xs text-slate-500 dark:text-slate-400 mt-1"
            style={{
              fontSize: '0.85rem',
              color: '#94a3b8',
              margin: 0
            }}
          >
            Redirecting you to your dashboard...
          </p>
        </div>
      </div>
    </div>
  )
}

