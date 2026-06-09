'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import MethodSelector from '@/components/auth/MethodSelector'

export default function LoginPage() {
  const router = useRouter()
  const [dlLoading, setDlLoading] = useState(false)

  const handleSelectAadhaar = () => {
    router.push('/login/aadhaar')
  }

  const handleSelectDigiLocker = () => {
    setDlLoading(true)
    window.location.href = '/api/auth/digilocker/authorize'
  }

  return (
    <MethodSelector
      mode="login"
      onSelectAadhaar={handleSelectAadhaar}
      onSelectDigiLocker={handleSelectDigiLocker}
      isDigiLockerLoading={dlLoading}
    />
  )
}
