"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconSearch,
  IconShieldCheck,
  IconAlertTriangle,
  IconDownload,
  IconCoins,
  IconArrowRight,
  IconLoader2,
  IconUserCheck,
} from "@tabler/icons-react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

interface VerificationResult {
  parcelId: string;
  ownerName: string;
  aadhaarMasked: string;
  encumbered: boolean;
  valuation: number;
  confidenceRange: string;
  fraudScore: number;
  historyDepth: string;
  historyTimeline: { date: string; action: string; owner: string }[];
}

export default function BankSingleVerifyPage() {
  const { user } = useAuth();
  const [parcelId, setParcelId] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  // LTV slider state
  const [loanAmount, setLoanAmount] = useState(1500000);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parcelId.trim()) return;

    setSearching(true);
    setResult(null);

    setTimeout(() => {
      // Mock result
      const parsedId = parcelId.trim().toUpperCase();
      const mockResult: VerificationResult = {
        parcelId: parsedId,
        ownerName: "Rohan Sharma",
        aadhaarMasked: "XXXXXXXX4321",
        encumbered: parsedId.includes("1002") ? true : false,
        valuation: 3200000,
        confidenceRange: "₹3,100,000 - ₹3,350,000 (High Confidence)",
        fraudScore: parsedId.includes("8021") ? 85 : 18,
        historyDepth: "4 ownership shifts registered over 10 years",
        historyTimeline: [
          { date: "2026-05-15", action: "Ownership Mutation Registered", owner: "Rohan Sharma" },
          { date: "2024-11-12", action: "Sale Deed Executed", owner: "Amit Singh" },
          { date: "2020-04-01", action: "Inheritance Deed Registered", owner: "Late Hari Singh" },
        ],
      };

      setResult(mockResult);
      setSearching(false);
      toast.success(`Analysis complete for property ${parsedId}`);
    }, 1500);
  };

  const handleDownloadReport = () => {
    toast.success(`Verification PDF report generated and downloaded for ${result?.parcelId}`);
  };

  // LTV calculation
  const getLtvPercentage = () => {
    if (!result) return 0;
    return Math.round((loanAmount / result.valuation) * 100);
  };

  const ltvVal = getLtvPercentage();
  const maxEligible = result ? result.valuation * 0.8 : 0;
  const isEligible = ltvVal <= 80 && (!result?.encumbered);

  // Radial chart data
  const chartData = result
    ? [
        { name: "score", value: result.fraudScore, fill: result.fraudScore > 75 ? "#A32D2D" : "#1D9E75" },
        { name: "max", value: 100, fill: "#f1f5f9" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <IconUserCheck className="w-6 h-6 text-brand" />
          Single Asset Collateral Verification
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-body">
          Query Noida title registry nodes, inspect lien encumbrance status, verify KYC hashes, and evaluate LTV limits.
        </p>
      </div>

      {/* Verify search form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 max-w-2xl mx-auto space-y-4">
        <form onSubmit={handleVerify} className="flex gap-2">
          <input
            type="text"
            placeholder="Search and verify Parcel ID (e.g. PARCEL-4902-881)..."
            value={parcelId}
            onChange={(e) => setParcelId(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand font-mono uppercase"
            required
          />
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {searching ? (
              <>
                <IconLoader2 className="w-4 h-4 animate-spin" />
                Querying Ledger...
              </>
            ) : (
              <>
                <IconSearch className="w-4 h-4" />
                Verify Now
              </>
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeIn_0.3s_ease-out]">
          {/* Main verification details */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-6 font-body">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-850">
              <div className="space-y-1">
                <span className="font-mono font-bold text-sm text-brand">{result.parcelId}</span>
                <span className="text-[10px] text-slate-450 block">Verified Node Check: {new Date().toLocaleString()}</span>
              </div>

              <button
                onClick={handleDownloadReport}
                className="px-3 py-1.5 bg-gray-50 hover:bg-slate-100 text-[10px] font-heading font-extrabold uppercase rounded-element border border-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <IconDownload className="w-3.5 h-3.5" />
                Download Report
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-heading">Certified Owner Profile</span>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-element">
                    <div className="font-bold text-slate-700">{result.ownerName}</div>
                    <div className="text-[10px] text-slate-450 mt-1 font-mono">UIDAI: {result.aadhaarMasked}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-heading">Encumbrance/Lien Status</span>
                  {result.encumbered ? (
                    <div className="p-3 bg-red-50/50 border border-red-100 rounded-element flex items-center gap-2 text-red font-bold">
                      <IconAlertTriangle className="w-4 h-4 shrink-0" />
                      Lien Registered (Encumbered)
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-250 rounded-element flex items-center gap-2 text-emerald-600 font-bold">
                      <IconShieldCheck className="w-4 h-4 shrink-0" />
                      Lien-Free (Clear Title)
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-heading">Automated Valuation Index</span>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-element">
                    <div className="font-bold text-slate-800 text-sm">₹{result.valuation.toLocaleString()}</div>
                    <div className="text-[9px] text-slate-450 mt-1 font-body">{result.confidenceRange}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-heading">History Timeline Depth</span>
                  <p className="text-[10px] text-slate-500 leading-normal mb-2">{result.historyDepth}</p>
                  <div className="space-y-2 border-l-2 border-slate-100 pl-3">
                    {result.historyTimeline.map((item, idx) => (
                      <div key={idx} className="relative text-[10px]">
                        <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-slate-200 border-2 border-white dark:border-slate-950"></span>
                        <div className="font-bold text-slate-700">{item.action}</div>
                        <div className="text-[9px] text-slate-450">{item.owner} ({item.date})</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Gauge & LTV checker */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4 text-center">
              <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider text-left">
                Fraud Risk Index
              </h3>

              <div className="w-32 h-32 mx-auto relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={chartData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar dataKey="value" background />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`font-heading font-extrabold text-xl ${result.fraudScore > 75 ? "text-red" : "text-green"}`}>
                    {result.fraudScore}%
                  </span>
                  <span className="text-[8px] uppercase font-bold text-slate-400">Risk Factor</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
                LTV Limits Evaluator
              </h3>

              <div className="space-y-4 font-body text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Desired Loan:</span>
                    <span className="text-brand">₹{loanAmount.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={500000}
                    max={3000000}
                    step={10000}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(parseInt(e.target.value))}
                    className="w-full accent-brand cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-element space-y-2">
                  <div className="flex justify-between">
                    <span>LTV Ratio:</span>
                    <span className={`font-bold ${ltvVal > 80 ? "text-red" : "text-green"}`}>{ltvVal}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Eligible Loan:</span>
                    <span>₹{maxEligible.toLocaleString()} (80%)</span>
                  </div>
                  <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between font-bold">
                    <span>Approval Status:</span>
                    <span className={isEligible ? "text-green" : "text-red"}>
                      {isEligible ? "ELIGIBLE" : "INELIGIBLE"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
