'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers'
import KycReview from '@/components/auth/KycReview'

function DigiLockerCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const [kycData, setKycData] = useState<any>(null)

  const token = searchParams.get('data')

  useEffect(() => {
    if (!token) {
      setError('Invalid redirect callback. Missing data payload.')
      setLoading(false)
      return
    }

    const decryptToken = async () => {
      try {
        const res = await fetch('/api/auth/digilocker/decrypt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to verify secure token.')
        }

        setKycData(data)
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Verification failed.')
        toast.error('Secure decryption of DigiLocker data failed.')
      } finally {
        setLoading(false)
      }
    }

    decryptToken()
  }, [token])

  const handleProfileSubmit = async (profile: { email: string; role: string; language: string }) => {
    setSubmitLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aadhaarHash: kycData.aadhaarHash,
          name: kycData.name,
          dob: kycData.dob,
          gender: kycData.gender,
          email: profile.email,
          role: profile.role,
          language: profile.language
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register account')
      }

      // Sync user session in frontend context
      await login(kycData.aadhaarHash, data.role || profile.role, kycData.name)

      toast.success('Account created successfully via DigiLocker!')
      router.push(`/${(data.role || profile.role).toLowerCase()}`)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || 'Profile completion failed')
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <svg className="animate-spin h-10 w-10 text-[#0F6E56]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm font-semibold text-gray-700">Fetching your details from DigiLocker...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold leading-normal">
          {error}
        </div>
        <button
          onClick={() => router.push('/register')}
          className="w-full py-2.5 bg-[#0F6E56] text-white rounded-xl font-bold text-xs hover:bg-[#085041]"
        >
          Return to Methods Selection
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {kycData && (
        <KycReview
          data={{
            name: kycData.name,
            dob: kycData.dob,
            gender: kycData.gender,
            address: kycData.address,
            photo: kycData.photo,
            method: 'DIGILOCKER'
          }}
          onSubmit={handleProfileSubmit}
          isLoading={submitLoading}
        />
      )}
    </div>
  )
}

export default function DigiLockerCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <svg className="animate-spin h-10 w-10 text-[#0F6E56]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm font-semibold text-gray-700">Loading verification details...</p>
      </div>
    }>
      <DigiLockerCallbackContent />
    </Suspense>
  )
}
