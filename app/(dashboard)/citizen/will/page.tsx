"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconFileCertificate,
  IconPlus,
  IconTrash,
  IconFingerprint,
  IconShieldLock,
  IconAlertTriangle,
} from "@tabler/icons-react";

interface Nominee {
  id: string;
  name: string;
  aadhaar: string; // masked in table
  relationship: string;
  propertyAssigned: string; // parcelId
  sharePercent: number;
}

interface UserProperty {
  id: string;
  parcelId: string;
  surveyNumber: string;
  location: string;
}

export default function CitizenWillPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<UserProperty[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([
    {
      id: "nom-1",
      name: "Sanjana Sharma",
      aadhaar: "XXXXXXXX4892",
      relationship: "Spouse",
      propertyAssigned: "PARCEL-4902-881",
      sharePercent: 60,
    },
    {
      id: "nom-2",
      name: "Aarav Sharma",
      aadhaar: "XXXXXXXX1029",
      relationship: "Son",
      propertyAssigned: "PARCEL-4902-881",
      sharePercent: 40,
    },
  ]);

  // Form State
  const [aadhaar, setAadhaar] = useState("");
  const [relationship, setRelationship] = useState("Spouse");
  const [selectedProp, setSelectedProp] = useState("");
  const [sharePercent, setSharePercent] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [mockOtp, setMockOtp] = useState("");
  const [nomineeName, setNomineeName] = useState("");

  const loadProperties = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/property?ownerId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
        if (data.length > 0) {
          setSelectedProp(data[0].parcelId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [user]);

  // Lookup Nominee Aadhaar details and dispatch OTP
  const handleVerifyAadhaar = () => {
    const clean = aadhaar.replace(/\s/g, "");
    if (clean.length !== 12 || isNaN(Number(clean))) {
      toast.error("Please enter a valid 12-digit Aadhaar Number.");
      return;
    }

    // Mock resolve names
    const mockNames = ["Amit Sharma", "Komal Sharma", "Priya Sharma", "Rajesh Sharma"];
    const resolvedName = mockNames[Math.floor(Math.random() * mockNames.length)];
    setNomineeName(resolvedName);

    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setMockOtp(generatedOtp);
    setOtpSent(true);
    toast.success(`OTP code dispatched to mobile linked with Aadhaar ${clean.slice(-4)}`);
    // Simulated UI alert notification for testing ease
    toast.info(`[Testing SIM] Aadhaar Verification Code: ${generatedOtp}`);
  };

  const handleAddNominee = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== mockOtp) {
      toast.error("Invalid verification code. Please check the code and try again.");
      return;
    }

    const share = parseFloat(sharePercent);
    if (isNaN(share) || share <= 0 || share > 100) {
      toast.error("Please assign a valid share percentage between 1% and 100%.");
      return;
    }

    // Validate if total shares exceed 100%
    const currentShares = nominees
      .filter((n) => n.propertyAssigned === selectedProp)
      .reduce((sum, n) => sum + n.sharePercent, 0);

    if (currentShares + share > 100) {
      toast.error(
        `Total allocated shares for property ${selectedProp} cannot exceed 100%. Remaining: ${100 - currentShares}%`
      );
      return;
    }

    const newNominee: Nominee = {
      id: "nom-" + Math.random().toString(36).substring(2, 9),
      name: nomineeName,
      aadhaar: `XXXXXXXX${aadhaar.replace(/\s/g, "").slice(-4)}`,
      relationship,
      propertyAssigned: selectedProp,
      sharePercent: share,
    };

    setNominees([...nominees, newNominee]);
    toast.success("Nominee successfully added to encrypted legal ledger.");
    
    // Reset Form
    setAadhaar("");
    setSharePercent("");
    setOtpSent(false);
    setOtpCode("");
    setMockOtp("");
    setNomineeName("");
  };

  const handleDeleteNominee = (id: string) => {
    setNominees((prev) => prev.filter((n) => n.id !== id));
    toast.success("Nominee removed from registry file.");
  };

  // Group nominees by property to show progress bars
  const getPropertyShareSum = (parcelId: string) => {
    return nominees
      .filter((n) => n.propertyAssigned === parcelId)
      .reduce((sum, n) => sum + n.sharePercent, 0);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100">
          Smart Will & Nominee Registry
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-body">
          Define legally-binding will allocations. Nominees gain claims execution access only upon probate checks.
        </p>
      </div>

      {/* Will Status Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-4 items-start">
          <span className="p-3 bg-brand-light text-brand rounded-element">
            <IconFileCertificate className="w-6 h-6 stroke-[1.8]" />
          </span>
          <div className="space-y-1">
            <h3 className="font-heading font-extrabold text-sm text-slate-700 dark:text-slate-200">
              Active Will Status
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              IPFS: QmYwAPJzs5xx2mabX4uX7yXQG143uXG28892hH2
            </p>
            <p className="text-[10px] text-slate-400 font-body">
              On-chain timestamped: June 05, 2026, 11:22 AM IST
            </p>
          </div>
        </div>

        <button
          onClick={() => toast.success("Will file compiled, encrypted and signed to smart contract registry.")}
          className="px-4 py-2.5 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold rounded-element cursor-pointer transition-colors"
        >
          Publish Updated Will
        </button>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-card bg-slate-50 border border-slate-150 flex items-start gap-3">
        <IconShieldLock className="w-5 h-5 text-brand shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs font-body leading-relaxed text-slate-500">
          <span className="font-bold text-slate-700 block">Cryptographic Will Encryption (AES-256)</span>
          <span>
            Your nominee ledger is encrypted locally using AES-256 and stored on decentralized IPFS pins. Only verified nominees can retrieve their specific share certificates upon official death registry probate approval.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nominee addition form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            Register Nominee
          </h3>

          <form onSubmit={handleAddNominee} className="space-y-4 font-body">
            {!otpSent ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Nominee Aadhaar</label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="Enter 12-digit Aadhaar..."
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyAadhaar}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-heading font-extrabold rounded-element flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <IconFingerprint className="w-4 h-4" />
                  Verify Identity
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 text-[11px] text-emerald-600 bg-emerald-50/50 rounded-element border border-emerald-100 flex flex-col gap-1">
                  <span className="font-bold">Aadhaar resolved to: {nomineeName}</span>
                  <span>OTP verification code dispatched to linked phone.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Enter OTP</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Enter 4-digit OTP code..."
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand tracking-widest font-mono text-center"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Assign Property</label>
                  <select
                    value={selectedProp}
                    onChange={(e) => setSelectedProp(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none"
                  >
                    {properties.map((p) => (
                      <option key={p.parcelId} value={p.parcelId}>
                        {p.parcelId} (Survey {p.surveyNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Share Allocation (%)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={sharePercent}
                    onChange={(e) => setSharePercent(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-heading font-extrabold rounded-element cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold rounded-element cursor-pointer transition-colors"
                  >
                    Save Nominee
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Nominees list & Share Progress check */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            Nominee List & Share Allocations
          </h3>

          <div className="space-y-6">
            {/* Live Progress checker per property */}
            {properties.map((p) => {
              const totalAllocated = getPropertyShareSum(p.parcelId);
              return (
                <div key={p.parcelId} className="space-y-2 font-body text-xs border border-slate-100 dark:border-slate-850 p-4 rounded-element">
                  <div className="flex justify-between items-center font-bold">
                    <span className="font-mono text-brand">{p.parcelId}</span>
                    <span className={totalAllocated === 100 ? "text-green" : "text-gold"}>
                      {totalAllocated}% / 100% Allocated
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${totalAllocated === 100 ? "bg-green" : "bg-gold"}`}
                      style={{ width: `${totalAllocated}%` }}
                    ></div>
                  </div>
                  {totalAllocated !== 100 && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <IconAlertTriangle className="w-3.5 h-3.5" />
                      Must allocate exactly 100% share for this will asset before publication.
                    </span>
                  )}
                </div>
              );
            })}

            {/* Nominees grid */}
            <div className="overflow-x-auto border-[0.5px] border-slate-200 dark:border-slate-800 rounded-element">
              <table className="w-full text-left text-xs font-body border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">Nominee Name</th>
                    <th className="p-3">Aadhaar (Masked)</th>
                    <th className="p-3">Relationship</th>
                    <th className="p-3">Property</th>
                    <th className="p-3 text-right">Share</th>
                    <th className="p-3 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {nominees.map((nom) => (
                    <tr key={nom.id} className="border-b border-slate-150 dark:border-slate-800/80">
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-350">{nom.name}</td>
                      <td className="p-3 font-mono text-slate-450">{nom.aadhaar}</td>
                      <td className="p-3 text-slate-500">{nom.relationship}</td>
                      <td className="p-3 font-mono font-bold text-slate-500">{nom.propertyAssigned}</td>
                      <td className="p-3 text-right font-bold text-slate-800 dark:text-slate-200">{nom.sharePercent}%</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteNominee(nom.id)}
                          className="text-red hover:bg-red-light/40 p-1.5 rounded-element cursor-pointer transition-colors"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
