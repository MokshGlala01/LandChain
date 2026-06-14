import React from 'react'

export function PasswordStrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ]
  const strength = checks.filter(Boolean).length
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', '#E24B4A', '#BA7517', '#185FA5', '#0F6E56']

  if (!password) return null
  return (
    <div className="password-strength">
      <div className="strength-bars">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="strength-bar" style={{ background: i <= strength ? colors[strength] : '#e5e7eb' }} />
        ))}
      </div>
      <span style={{ color: colors[strength], fontSize: 12, fontWeight: 600 }}>{labels[strength]}</span>
    </div>
  )
}
