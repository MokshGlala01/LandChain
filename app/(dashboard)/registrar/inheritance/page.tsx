"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconUserCheck,
  IconLoader2,
  IconCheck,
  IconX,
  IconCertificate,
  IconFileText,
} from "@tabler/icons-react";

interface Claim {
  id: string;
  parcelId: string;
  deceasedName: string;
  nomineeName: string;
  relationship: string;
  sharePercent: number;
  deathCertCid: string;
  probateCid: string;
  filedDate: string;
  aadhaarVerified: boolean;
}

export default function RegistrarInheritancePage() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [otpVerifyId, setOtpVerifyId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [simulatedOtp, setSimulatedOtp] = useState("");

  const [history, setHistory] = useState<any[]>([
    {
      id: "h-1",
      parcelId: "PARCEL-1002-880",
      deceasedName: "Late Hari Kalia",
      nomineeName: "Rohan Kalia",
      relationship: "Son",
      sharePercent: 100,
      completedDate: "2026-06-02",
    },
  ]);

  // Load claims or seed mock data
  React.useEffect(() => {
    // Seed mock claims if empty
    setClaims([
      {
        id: "cl-1",
        parcelId: "PARCEL-4902-881",
        deceasedName: "Late B. K. Sharma",
        nomineeName: "Sanjana Sharma",
        relationship: "Spouse",
        sharePercent: 60,
        deathCertCid: "QmYwAPJzs5xx2mabX4uX7yXQG143uXG28892hH2",
        probateCid: "QmYwAPJzs5xx2mabX4uX7yXQG143uXG28892hH2",
        filedDate: "2026-06-03",
        aadhaarVerified: false,
      },
    ]);
  }, []);

  const handleVerifyAadhaar = (claimId: string) => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setSimulatedOtp(code);
    setOtpVerifyId(claimId);
    setOtpCode("");
    toast.success("Identity verification OTP dispatched to nominee's Aadhaar linked phone.");
    // Simulate UI alert for testing
    toast.info(`[Testing SIM] Nominee Verification Code: ${code}`);
  };

  const handleConfirmOtp = () => {
    if (otpCode !== simulatedOtp) {
      toast.error("Incorrect verification code.");
      return;
    }

    setClaims((prev) =>
      prev.map((c) => (c.id === otpVerifyId ? { ...c, aadhaarVerified: true } : c))
    );
    toast.success("Nominee identity successfully verified.");
    setOtpVerifyId(null);
  };

  const handleApproveClaim = (claim: Claim) => {
    if (!claim.aadhaarVerified) {
      toast.error("Please verify nominee Aadhaar identity before executing the claim mutation.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Remove from claims, add to history
      setClaims((prev) => prev.filter((c) => c.id !== claim.id));
      setHistory([
        {
          id: "h-" + Math.random().toString(36).substring(2, 9),
          parcelId: claim.parcelId,
          deceasedName: claim.deceasedName,
          nomineeName: claim.nomineeName,
          relationship: claim.relationship,
          sharePercent: claim.sharePercent,
          completedDate: new Date().toISOString().split("T")[0],
        },
        ...history,
      ]);
      setLoading(false);
      toast.success(
        `Mutation deed executed for property ${claim.parcelId}. Title transferred: ${claim.nomineeName} (${claim.sharePercent}%)`
      );
    }, 2000);
  };

  const handleRejectClaim = (claimId: string) => {
    setClaims((prev) => prev.filter((c) => c.id !== claimId));
    toast.error("Inheritance claim rejected. Filer notified.");
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <IconUserCheck className="w-6 h-6 text-brand" />
          Inheritance Claims Administration
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-body">
          Audit probate documents, verify nominee identities, and authorize inheritance partition mutations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Claims list */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            Pending Claims Queue
          </h3>

          <div className="overflow-x-auto border-[0.5px] border-slate-200 dark:border-slate-800 rounded-element font-body text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">Property</th>
                  <th className="p-3">Deceased Owner</th>
                  <th className="p-3">Nominee (Rel)</th>
                  <th className="p-3 text-right">Share %</th>
                  <th className="p-3 text-center">Docs</th>
                  <th className="p-3 text-center">Identity</th>
                  <th className="p-3 text-center">Execute</th>
                </tr>
              </thead>
              <tbody>
                {claims.length > 0 ? (
                  claims.map((claim) => (
                    <tr key={claim.id} className="border-b border-slate-150 dark:border-slate-800/80 hover:bg-slate-50/20">
                      <td className="p-3 font-mono font-bold text-brand">{claim.parcelId}</td>
                      <td className="p-3 text-slate-650">{claim.deceasedName}</td>
                      <td className="p-3">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-700">{claim.nomineeName}</span>
                          <span className="text-[9px] text-slate-400 block">{claim.relationship}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-800">{claim.sharePercent}%</td>
                      <td className="p-3 text-center">
                        <span className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => toast.info("Opening death certificate file from IPFS...")}
                            className="p-1 hover:text-brand transition-colors text-slate-400"
                            title="Death Cert"
                          >
                            <IconCertificate className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toast.info("Opening probate order file from IPFS...")}
                            className="p-1 hover:text-brand transition-colors text-slate-400"
                            title="Probate Order"
                          >
                            <IconFileText className="w-4 h-4" />
                          </button>
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {claim.aadhaarVerified ? (
                          <span className="px-2 py-0.5 bg-green-light text-green text-[9px] font-extrabold uppercase rounded-pill border-[0.5px] border-green/20">
                            Verified
                          </span>
                        ) : (
                          <button
                            onClick={() => handleVerifyAadhaar(claim.id)}
                            className="px-2 py-1 bg-slate-850 hover:bg-slate-950 text-slate-300 text-[10px] font-heading font-extrabold uppercase rounded-element border border-slate-200"
                          >
                            Verify
                          </button>
                        )}
                      </td>
                      <td className="p-3 flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleApproveClaim(claim)}
                          className="p-1 bg-brand-light text-brand hover:bg-brand hover:text-white rounded-element transition-colors"
                          title="Execute Title Mutation"
                        >
                          <IconCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRejectClaim(claim.id)}
                          className="p-1 bg-red-light text-red hover:bg-red hover:text-white rounded-element transition-colors"
                          title="Reject"
                        >
                          <IconX className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      No pending inheritance partition claims.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Completed Claims history */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            Partition Deeds Archive
          </h3>

          <div className="space-y-3 font-body text-xs">
            {history.map((h) => (
              <div key={h.id} className="p-3 border border-slate-100 rounded-element space-y-1.5 leading-normal">
                <div className="flex justify-between items-center font-bold">
                  <span className="font-mono text-brand">{h.parcelId}</span>
                  <span className="text-slate-405">{h.completedDate}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  <div>Deceased: {h.deceasedName}</div>
                  <div>Recipient: {h.nomineeName} ({h.sharePercent}%)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* OTP Nominee verification Modal dialog */}
      {otpVerifyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="max-w-sm w-full bg-white dark:bg-[#030806] rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-heading font-extrabold text-sm text-slate-700">Nominee OTP identity verification</h3>
              <button onClick={() => setOtpVerifyId(null)} className="text-xs text-slate-450 hover:text-slate-650 font-bold">×</button>
            </div>

            <div className="space-y-4 font-body text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Enter Nominee OTP</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Enter 4-digit code..."
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand tracking-widest text-center font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setOtpVerifyId(null)}
                className="w-1/3 py-2 bg-gray-150 text-slate-700 text-xs font-heading font-extrabold rounded-element cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleConfirmOtp}
                className="flex-grow py-2 bg-brand text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer"
              >
                Verify Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
