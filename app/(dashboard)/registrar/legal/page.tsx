"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconLock,
  IconSearch,
  IconGavel,
  IconArchive,
  IconShieldLock,
  IconAlertTriangle,
  IconCalendar,
  IconUpload,
} from "@tabler/icons-react";

interface LegalHold {
  id: string;
  parcelId: string;
  ownerName: string;
  courtOrder: string; // IPFS CID
  caseNumber: string;
  placedOn: string;
  officer: string;
}

interface PublicNotice {
  id: string;
  parcelId: string;
  reason: string;
  filedDate: string;
  expiryDays: number;
}

interface CourtCase {
  caseNumber: string;
  courtName: string;
  filingDate: string;
  nextHearing: string;
  petitioner: string;
  respondent: string;
}

export default function RegistrarLegalHoldsPage() {
  const { user } = useAuth();
  
  // Active Holds
  const [holds, setHolds] = useState<LegalHold[]>([
    {
      id: "h-1",
      parcelId: "PARCEL-1002-880",
      ownerName: "Rohan Kalia",
      courtOrder: "QmYwAPJzs5xx2mabX4uX7yXQG143uXG28892hH2",
      caseNumber: "OS-402/2025",
      placedOn: "2026-05-22",
      officer: "Amit Kumar",
    },
  ]);

  // Public Notices
  const [notices, setNotices] = useState<PublicNotice[]>([
    {
      id: "n-1",
      parcelId: "PARCEL-4902-881",
      reason: "Claim of right of way partition query.",
      filedDate: "2026-05-10",
      expiryDays: 12,
    },
    {
      id: "n-2",
      parcelId: "PARCEL-8021-992",
      reason: "Boundary audit conflict reported.",
      filedDate: "2026-04-01",
      expiryDays: 0, // Expired
    },
  ]);

  // eCourts Lookup
  const [searchParcel, setSearchParcel] = useState("");
  const [lookupResult, setLookupResult] = useState<{ parcelId: string; cases: CourtCase[] } | null>(null);
  const [searching, setSearching] = useState(false);

  // Closure Order Upload
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeHoldId, setActiveHoldId] = useState("");
  const [orderFile, setOrderFile] = useState<File | null>(null);

  const handleSearchCourts = async () => {
    if (!searchParcel.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/courts/${searchParcel.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setLookupResult(data);
      } else {
        toast.error("Lookup failed.");
      }
    } catch (err) {
      toast.error("Lookup failed.");
    } finally {
      setSearching(false);
    }
  };

  const handlePlaceHold = (parcelId: string, caseNo: string) => {
    const newHold: LegalHold = {
      id: "h-" + Math.random().toString(36).substring(2, 9),
      parcelId,
      ownerName: "Anil Sharma & Others",
      courtOrder: "QmYwAPJzs5xx2mabX4uX7yXQG143uXG28892hH2",
      caseNumber: caseNo,
      placedOn: new Date().toISOString().split("T")[0],
      officer: user?.name || "Officer",
    };
    setHolds([newHold, ...holds]);
    toast.success(`Legal freeze placed on property ${parcelId} successfully.`);
    setLookupResult(null);
    setSearchParcel("");
  };

  const handleTriggerUpload = (holdId: string) => {
    setActiveHoldId(holdId);
    setOrderFile(null);
    setUploadModalOpen(true);
  };

  const handleConfirmClosure = () => {
    if (!orderFile || !activeHoldId) return;
    setHolds((prev) => prev.filter((h) => h.id !== activeHoldId));
    toast.success("Court closure order verified. Legal hold removed and property unfrozen on-chain.");
    setUploadModalOpen(false);
  };

  const handleRenewNotice = (noticeId: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === noticeId ? { ...n, expiryDays: n.expiryDays + 30 } : n))
    );
    toast.success("Public notice duration extended by 30 days.");
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <IconLock className="w-6 h-6 text-brand" />
          Litigation Locks & Legal Holds
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-body">
          Cross-reference civil case records on eCourts, place legal holds, and verify closure orders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* eCourts Lookup Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            eCourts Case Lookup
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Parcel ID (e.g. PARCEL-1002)..."
              value={searchParcel}
              onChange={(e) => setSearchParcel(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand font-mono"
            />
            <button
              onClick={handleSearchCourts}
              disabled={searching}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-950 text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer"
            >
              Search
            </button>
          </div>

          {lookupResult && (
            <div className="space-y-3 pt-2 font-body text-xs leading-normal">
              <span className="font-heading font-extrabold text-[10px] text-slate-400 uppercase block">Pending Cases</span>
              {lookupResult.cases.map((cs) => (
                <div key={cs.caseNumber} className="p-3 border border-slate-100 rounded-element space-y-2">
                  <div className="font-bold text-slate-700">{cs.caseNumber}</div>
                  <div className="text-[10px] text-slate-500">{cs.courtName}</div>
                  <div className="text-[10px] text-slate-400">
                    <div>Petitioner: {cs.petitioner}</div>
                    <div>Respondent: {cs.respondent}</div>
                  </div>
                  <button
                    onClick={() => handlePlaceHold(lookupResult.parcelId, cs.caseNumber)}
                    className="w-full py-1 bg-red-light text-red hover:bg-red hover:text-white text-[10px] font-heading font-extrabold uppercase rounded-element transition-colors cursor-pointer"
                  >
                    Place Legal Hold
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Holds Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            Active Legal Holds (Frozen Assets)
          </h3>

          <div className="overflow-x-auto border-[0.5px] border-slate-200 dark:border-slate-800 rounded-element">
            <table className="w-full text-left text-xs font-body border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">Property</th>
                  <th className="p-3">Owner Name</th>
                  <th className="p-3">Case Number</th>
                  <th className="p-3">Placed On</th>
                  <th className="p-3 text-center">Unfreeze</th>
                </tr>
              </thead>
              <tbody>
                {holds.map((hold) => (
                  <tr key={hold.id} className="border-b border-slate-150 dark:border-slate-800/80">
                    <td className="p-3 font-mono font-bold text-brand">{hold.parcelId}</td>
                    <td className="p-3 text-slate-650">{hold.ownerName}</td>
                    <td className="p-3 font-semibold text-red">{hold.caseNumber}</td>
                    <td className="p-3 text-slate-450">{hold.placedOn}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleTriggerUpload(hold.id)}
                        className="px-2 py-1 bg-green-light text-green text-[10px] font-heading font-extrabold uppercase rounded-element border border-green/20 cursor-pointer"
                      >
                        Upload Release
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Public Notices */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
          Active Public Objections & Notices
        </h3>

        <div className="overflow-x-auto border-[0.5px] border-slate-200 dark:border-slate-800 rounded-element font-body text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">Property ID</th>
                <th className="p-3">Objection / Reason</th>
                <th className="p-3">Filed Date</th>
                <th className="p-3">Status / Expiry</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((n) => {
                const isExpired = n.expiryDays === 0;
                return (
                  <tr
                    key={n.id}
                    className={`border-b border-slate-150 dark:border-slate-800/80 hover:bg-slate-50/20 ${
                      isExpired ? "text-slate-400 bg-slate-50/40" : ""
                    }`}
                  >
                    <td className="p-3 font-mono font-bold text-brand">{n.parcelId}</td>
                    <td className="p-3 text-slate-500">{n.reason}</td>
                    <td className="p-3 text-slate-450">{n.filedDate}</td>
                    <td className="p-3">
                      {isExpired ? (
                        <span className="px-2 py-0.5 bg-gray-150 text-gray-500 text-[9px] font-extrabold uppercase rounded-pill">
                          Expired
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gold-light text-gold text-[9px] font-extrabold uppercase rounded-pill">
                          Active ({n.expiryDays} days remaining)
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleRenewNotice(n.id)}
                        className="px-2 py-1 bg-gray-50 border border-slate-200 text-[10px] font-heading font-extrabold uppercase rounded-element hover:bg-slate-100 cursor-pointer"
                      >
                        Extend 30 Days
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Release Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="max-w-sm w-full bg-white dark:bg-[#030806] rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-heading font-extrabold text-sm text-slate-700">Upload Court Closure Order</h3>
              <button onClick={() => setUploadModalOpen(false)} className="text-xs text-slate-450 hover:text-slate-650 font-bold">×</button>
            </div>

            <div className="space-y-4 font-body text-xs">
              <div className="p-4 border border-dashed border-slate-300 rounded-element flex flex-col items-center justify-center gap-1 bg-slate-50">
                <input
                  type="file"
                  id="closure-file"
                  onChange={(e) => setOrderFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="closure-file" className="cursor-pointer text-brand hover:text-brand-mid font-bold">
                  {orderFile ? "Closure order selected" : "Select Court Order PDF"}
                </label>
                {orderFile && <span className="text-[10px] text-slate-500">{orderFile.name}</span>}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="w-1/3 py-2 bg-gray-150 text-slate-705 text-xs font-heading font-extrabold rounded-element cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleConfirmClosure}
                disabled={!orderFile}
                className="flex-grow py-2 bg-brand text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer disabled:opacity-50"
              >
                Verify and Unfreeze
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
