'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import MethodSelector from '@/components/auth/MethodSelector'

export default function RegisterPage() {
  const router = useRouter()
  const [dlLoading, setDlLoading] = useState(false)

  const handleSelectAadhaar = () => {
    router.push('/register/aadhaar')
  }

  const handleSelectDigiLocker = () => {
    setDlLoading(true)
    // Redirect directly to the authorize endpoint
    window.location.href = '/api/auth/digilocker/authorize'
  }

  return (
    <MethodSelector
      mode="register"
      onSelectAadhaar={handleSelectAadhaar}
      onSelectDigiLocker={handleSelectDigiLocker}
      isDigiLockerLoading={dlLoading}
    />
  )
}
