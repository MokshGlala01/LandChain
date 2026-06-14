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
    if (session?.user?.role) {
      const path = roleRoutes[session.user.role] ?? '/citizen'
      router.push(path)
    }
  }, [session, status, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="text-center space-y-4 p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-xl max-w-sm w-full mx-4">
        <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Verifying Session</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Redirecting you to your dashboard...
          </p>
        </div>
      </div>
    </div>
  )
}
