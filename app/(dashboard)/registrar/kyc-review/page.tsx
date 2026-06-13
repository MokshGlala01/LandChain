'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers'
import { toast } from 'sonner'
import { 
  IconUserCheck, 
  IconCheck, 
  IconX, 
  IconFileText, 
  IconLoader2, 
  IconSearch,
  IconCalendar,
  IconFingerprint
} from '@tabler/icons-react'
import PageHeader from '@/components/dashboard/PageHeader'
import StatusBadge from '@/components/dashboard/StatusBadge'

interface PendingUser {
  id: string
  name: string
  phone: string
  aadhaarHash: string
  aadhaarDocIpfsHash: string
  kycStatus: string
  kycMethod: string
  createdAt: string
  role: string
}

export default function RegistrarKycReviewPage() {
  const { user } = useAuth()
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  
  // Reject Modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('Blurry Document Image')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchPendingQueue = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/kyc')
      if (res.ok) {
        const data = await res.json()
        setPendingUsers(data)
      } else {
        toast.error('Failed to load pending KYC queue')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error fetching KYC queue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingQueue()
  }, [])

  const handleApprove = async (userId: string) => {
    setSubmittingId(userId)
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'APPROVE' })
      })

      if (res.ok) {
        toast.success('KYC verification approved successfully!')
        setPendingUsers((prev) => prev.filter((u) => u.id !== userId))
      } else {
        const data = await res.json()
        toast.error(data.message || 'Verification approval failed')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error completing approval')
    } finally {
      setSubmittingId(null)
    }
  }

  const handleOpenRejectModal = (userId: string) => {
    setSelectedUserId(userId)
    setRejectModalOpen(true)
  }

  const handleRejectSubmit = async () => {
    if (!selectedUserId) return
    setSubmittingId(selectedUserId)
    setRejectModalOpen(false)

    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: selectedUserId, 
          action: 'REJECT', 
          reason: rejectReason 
        })
      })

      if (res.ok) {
        toast.error('KYC verification request rejected.')
        setPendingUsers((prev) => prev.filter((u) => u.id !== selectedUserId))
      } else {
        const data = await res.json()
        toast.error(data.message || 'Rejection failed')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error submitting rejection')
    } finally {
      setSubmittingId(null)
      setSelectedUserId(null)
    }
  }

  // Masking helpers
  const maskPhone = (phone: string | null) => {
    if (!phone) return 'N/A'
    const clean = phone.replace(/\s/g, '')
    if (clean.length < 6) return phone
    return `${clean.substring(0, 3)}******${clean.substring(clean.length - 4)}`
  }

  const maskAadhaarHash = (hash: string) => {
    if (hash.startsWith('aadhaar_')) {
      const raw = hash.replace('aadhaar_', '')
      return `********${raw.substring(raw.length - 4)}`
    }
    return '********' + hash.substring(hash.length - 4)
  }

  const filteredUsers = pendingUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone.includes(searchTerm)
  )

  return (
    <div className="space-y-6 relative">
      <PageHeader 
        title="KYC Verification Dashboard" 
        subtitle="Review submitted identity certificates and approve/reject profiles for Title Mutations."
      />

      {/* Control bar */}
      <div className="flex justify-between items-center gap-4 bg-white dark:bg-slate-950 p-4 border-[0.5px] border-slate-200 dark:border-slate-800 rounded-card">
        <div className="relative flex-1 max-w-sm flex items-center">
          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-element text-xs focus:outline-none focus:border-brand"
          />
          <IconSearch className="w-4 h-4 text-slate-400 absolute left-3" />
        </div>
        <div className="text-xs text-slate-400 font-semibold">
          Pending: <span className="text-slate-800 dark:text-slate-100 font-bold">{pendingUsers.length} Users</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-950 border-[0.5px] border-slate-200 dark:border-slate-800 rounded-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <IconLoader2 className="w-8 h-8 text-brand animate-spin" />
            <p className="text-xs font-semibold text-slate-400">Loading pending KYC queue...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-2 text-center">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-[#0F6E56] rounded-full border border-emerald-100 dark:border-emerald-900/30">
              <IconUserCheck className="w-8 h-8" />
            </div>
            <h4 className="font-heading font-extrabold text-sm text-slate-800 dark:text-slate-200 pt-2">All Clear!</h4>
            <p className="text-xs text-slate-400 max-w-[280px]">No citizen profiles are currently awaiting manual KYC verification.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 font-heading font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-4.5 px-6">Name &amp; Role</th>
                  <th className="py-4.5 px-6">Mobile Number</th>
                  <th className="py-4.5 px-6">Aadhaar Ref</th>
                  <th className="py-4.5 px-6">Verification Document</th>
                  <th className="py-4.5 px-6">Submitted Date</th>
                  <th className="py-4.5 px-6 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-850 font-body">
                {filteredUsers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="py-4.5 px-6">
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">{item.role}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      {maskPhone(item.phone)}
                    </td>
                    <td className="py-4.5 px-6 font-mono text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <IconFingerprint className="w-3.5 h-3.5 text-slate-400" />
                        <span>{maskAadhaarHash(item.aadhaarHash)}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      {item.aadhaarDocIpfsHash ? (
                        <a 
                          href={
                            item.aadhaarDocIpfsHash.startsWith('Qm') 
                              ? `https://gateway.pinata.cloud/ipfs/${item.aadhaarDocIpfsHash}` 
                              : '#'
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-element bg-slate-50 hover:bg-brand-light dark:bg-slate-900 dark:hover:bg-brand-dark/20 text-slate-600 dark:text-slate-400 hover:text-brand dark:hover:text-brand-mid font-semibold border-[0.5px] border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
                        >
                          <IconFileText className="w-3.5 h-3.5" />
                          <span>View Aadhaar Document</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic font-semibold">No Document</span>
                      )}
                    </td>
                    <td className="py-4.5 px-6 text-slate-500 dark:text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <IconCalendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => handleApprove(item.id)}
                          disabled={submittingId !== null}
                          className="p-1.5 rounded-element bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer border-[0.5px] border-emerald-200/20"
                          title="Approve verification"
                        >
                          {submittingId === item.id ? (
                            <IconLoader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <IconCheck className="w-4 h-4 stroke-[2.2]" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenRejectModal(item.id)}
                          disabled={submittingId !== null}
                          className="p-1.5 rounded-element bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors cursor-pointer border-[0.5px] border-red-200/20"
                          title="Reject verification"
                        >
                          <IconX className="w-4 h-4 stroke-[2.2]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border-[0.5px] border-slate-200 dark:border-slate-800 rounded-card max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="text-center space-y-1">
              <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-slate-100">Reject KYC Request</h4>
              <p className="text-[11px] text-slate-400">Please select the reason for rejecting this Aadhaar verification request.</p>
            </div>
            
            <div className="flex flex-col space-y-2 text-left">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rejection Reason</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-element text-xs focus:outline-none"
              >
                <option value="Blurry Document Image">Blurry / Unreadable document</option>
                <option value="Document Mismatch">Aadhaar details mismatch profile details</option>
                <option value="Fake or Forged Document">Fake / Suspicious identification document</option>
                <option value="Incomplete Scan">Document front/back page missing</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectModalOpen(false)
                  setSelectedUserId(null)
                }}
                className="w-1/2 py-2 rounded-element border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                className="w-1/2 py-2 rounded-element bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-lg transition-colors"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
