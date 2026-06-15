"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconSearch,
  IconCoins,
  IconCheck,
  IconArrowRight,
  IconLoader2,
  IconArrowsLeftRight,
  IconLock,
} from "@tabler/icons-react";

interface UserProperty {
  id: string;
  parcelId: string;
  surveyNumber: string;
  location: string;
  area: number;
}

interface TransferItem {
  id: string;
  parcelId: string;
  buyerName: string;
  buyerAadhaar: string;
  stampDuty: number;
  status: string; // INITIATED, DUTY_PAID, REGISTRAR_REVIEW, SIGNED, COMPLETED
  step: number; // 1 to 5
}

interface HistoryItem {
  id: string;
  parcelId: string;
  fromName: string;
  toName: string;
  date: string;
  stampDuty: number;
  status: string;
  txHash: string;
}

export default function CitizenTransferPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<UserProperty[]>([]);
  const [selectedParcel, setSelectedParcel] = useState("");
  const [buyerAadhaar, setBuyerAadhaar] = useState("");
  const [buyerResolvedName, setBuyerResolvedName] = useState("");
  const [buyerLookingUp, setBuyerLookingUp] = useState(false);
  const [stampDutyValue, setStampDutyValue] = useState<number | null>(null);
  const [payingDuty, setPayingDuty] = useState(false);
  const [dutyPaid, setDutyPaid] = useState(false);
  const [submittingTransfer, setSubmittingTransfer] = useState(false);

  const [activeTransfers, setActiveTransfers] = useState<TransferItem[]>([
    {
      id: "tr-1",
      parcelId: "PARCEL-4902-881",
      buyerName: "Vijay Shekhar",
      buyerAadhaar: "XXXXXXXX9018",
      stampDuty: 189000,
      status: "REGISTRAR_REVIEW",
      step: 3,
    },
  ]);

  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: "h-1",
      parcelId: "PARCEL-1002-880",
      fromName: "Ramesh Sharma",
      toName: "Rohan Sharma",
      date: "2026-05-10",
      stampDuty: 87500,
      status: "COMPLETED",
      txHash: "0xfa1098bc19...",
    },
  ]);

  const loadProperties = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/property?ownerId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
        if (data.length > 0) {
          setSelectedParcel(data[0].parcelId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [user]);

  // Recalculate stamp duty on parcel change
  useEffect(() => {
    if (!selectedParcel) return;
    const prop = properties.find((p) => p.parcelId === selectedParcel);
    if (prop) {
      // Simple formula: ₹3000 per sqft circle rate × area × 6% stamp duty
      const value = prop.area * 3000;
      const duty = Math.round(value * 0.06);
      setStampDutyValue(duty);
    }
  }, [selectedParcel, properties]);

  const handleBuyerLookup = () => {
    const clean = buyerAadhaar.replace(/\s/g, "");
    if (clean.length !== 12 || isNaN(Number(clean))) {
      toast.error("Please enter a valid 12-digit Aadhaar.");
      return;
    }

    setBuyerLookingUp(true);
    setTimeout(() => {
      // Mock Aadhaar lookup resolves
      const names = ["Vijay Shekhar", "Vikram Singh", "Priyanka Nair", "Anoop Joseph"];
      const resolved = names[Math.floor(Math.random() * names.length)];
      setBuyerResolvedName(resolved);
      setBuyerLookingUp(false);
      toast.success("Buyer Aadhaar details resolved successfully.");
    }, 1500);
  };

  const handlePayStampDuty = () => {
    if (!buyerResolvedName) {
      toast.error("Please verify buyer Aadhaar first.");
      return;
    }
    setPayingDuty(true);
    setTimeout(() => {
      setDutyPaid(true);
      setPayingDuty(false);
      toast.success("Razorpay Payment Successful. Stamp duty challan receipt: ST-779812.");
    }, 2000);
  };

  const handleInitiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcel || !buyerResolvedName || !dutyPaid || !stampDutyValue) return;

    setSubmittingTransfer(true);
    try {
      // Find property record id
      const prop = properties.find((p) => p.parcelId === selectedParcel);
      if (!prop) return;

      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: prop.id,
          fromOwnerId: user?.id,
          toOwnerAadhaar: buyerAadhaar.replace(/\s/g, ""),
          stampDuty: stampDutyValue,
        }),
      });

      if (res.ok) {
        toast.success("Property mutation transfer initiated. Registrar notified.");
        // Add to active steppers
        const newTransfer: TransferItem = {
          id: "tr-" + Math.random().toString(36).substring(2, 9),
          parcelId: selectedParcel,
          buyerName: buyerResolvedName,
          buyerAadhaar: `XXXXXXXX${buyerAadhaar.slice(-4)}`,
          stampDuty: stampDutyValue,
          status: "REGISTRAR_REVIEW",
          step: 3,
        };
        setActiveTransfers([newTransfer, ...activeTransfers]);

        // Reset inputs
        setBuyerAadhaar("");
        setBuyerResolvedName("");
        setDutyPaid(false);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit transfer request.");
      }
    } catch (err) {
      toast.error("An error occurred during transfer submission.");
    } finally {
      setSubmittingTransfer(false);
    }
  };

  const stepsList = ["Initiated", "Stamp Duty Paid", "Registrar Review", "On-Chain Signed", "Completed"];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100">
          Property Mutation & Transfer Gateway
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-body">
          Initiate title transfers, evaluate stamp duties, execute Razorpay checkout, and monitor registrar approvals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Initiate Transfer Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            Initiate Title Transfer
          </h3>

          {user && user.kycStatus !== 'VERIFIED' ? (
            <div className="p-6 bg-amber-50/50 border border-amber-200 dark:bg-amber-950/10 dark:border-amber-900/30 rounded-card text-center space-y-3 font-body mt-4">
              <IconLock className="w-8 h-8 text-amber-500 mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Transfers Locked</p>
                <p className="text-[10px] text-slate-500 leading-relaxed max-w-[280px] mx-auto">
                  Your Aadhaar identity document is pending review. Please wait for registrar approval to unlock transfer capabilities.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleInitiateTransfer} className="space-y-4 font-body">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Select Property</label>
              <select
                value={selectedParcel}
                onChange={(e) => setSelectedParcel(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none"
              >
                {properties.map((p) => (
                  <option key={p.parcelId} value={p.parcelId}>
                    {p.parcelId} ({p.area} Sq Ft)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Buyer Aadhaar UID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 12-digit Aadhaar UID..."
                  value={buyerAadhaar}
                  onChange={(e) => setBuyerAadhaar(e.target.value)}
                  className="flex-1 px-4 py-2 text-xs bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand font-mono"
                  disabled={buyerResolvedName !== ""}
                />
                {buyerResolvedName === "" ? (
                  <button
                    type="button"
                    onClick={handleBuyerLookup}
                    disabled={buyerLookingUp}
                    className="px-4 py-2 bg-[#0F6E56] hover:bg-[#075E54] text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer transition-colors flex items-center gap-1.5 font-bold"
                  >
                    {buyerLookingUp ? (
                      <IconLoader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <IconSearch className="w-4 h-4" />
                    )}
                    <span>Verify</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setBuyerResolvedName("");
                      setBuyerAadhaar("");
                      setDutyPaid(false);
                    }}
                    className="px-4 py-2 bg-red-light text-red hover:bg-red hover:text-white text-[10px] font-heading font-extrabold uppercase rounded-element cursor-pointer transition-all font-bold"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {buyerResolvedName && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-250 rounded-element text-[11px] text-emerald-600 dark:text-emerald-400 font-body">
                <span className="font-bold block">Buyer Verified Profile:</span>
                <span>Name: {buyerResolvedName}</span>
              </div>
            )}

            {stampDutyValue !== null && (
              <div className="p-4 rounded-element bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Calculated Valuation:</span>
                  <span>₹{((stampDutyValue / 0.06)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-200">
                  <span>Stamp Duty Rate:</span>
                  <span>6.00%</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between font-bold text-sm text-slate-800 dark:text-slate-100">
                  <span>Duty Payable:</span>
                  <span className="text-brand dark:text-brand-mid">₹{stampDutyValue.toLocaleString()}</span>
                </div>
              </div>
            )}

            {buyerResolvedName && !dutyPaid && (
              <button
                type="button"
                onClick={handlePayStampDuty}
                disabled={payingDuty}
                className="w-full py-2.5 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {payingDuty ? (
                  <>
                    <IconLoader2 className="w-4 h-4 animate-spin" />
                    Connecting Gateway...
                  </>
                ) : (
                  <>
                    <IconCoins className="w-4 h-4" />
                    Pay Stamp Duty (Razorpay)
                  </>
                )}
              </button>
            )}

            {dutyPaid && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-250 rounded-element text-center font-heading font-bold text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Stamp Duty Paid ✓
              </div>
            )}

            <button
              type="submit"
              disabled={!dutyPaid || submittingTransfer}
              className="w-full py-2.5 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submittingTransfer ? (
                <>
                  <IconLoader2 className="w-4 h-4 animate-spin" />
                  Initiating...
                </>
              ) : (
                "Request Mutation Approval"
              )}
            </button>
          </form>
          )}
        </div>

        {/* Active transfers tracker */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              Active Approvals Tracking
            </h3>

            {activeTransfers.map((item) => (
              <div
                key={item.id}
                className="border border-slate-150 dark:border-slate-800/80 rounded-element p-4 space-y-4 font-body"
              >
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono font-bold text-brand">{item.parcelId}</span>
                    <span className="text-slate-400 text-[10px] ml-2">Buyer: {item.buyerName}</span>
                  </div>
                  <span className="font-bold text-slate-650">₹{item.stampDuty.toLocaleString()}</span>
                </div>

                {/* Horizontal Stepper */}
                <div className="relative">
                  <div className="absolute top-2.5 left-6 right-6 h-0.5 bg-slate-100 dark:bg-slate-800 -z-10"></div>
                  <div
                    className="absolute top-2.5 left-6 right-6 h-0.5 bg-green -z-10 transition-all duration-300"
                    style={{ width: `${((item.step - 1) / 4) * 100}%` }}
                  ></div>

                  <div className="flex justify-between text-[9px] font-heading font-bold uppercase text-slate-400">
                    {stepsList.map((stepName, index) => {
                      const isActive = index + 1 === item.step;
                      const isCompleted = index + 1 < item.step;

                      return (
                        <div key={stepName} className="flex flex-col items-center gap-1.5 w-16 text-center">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                              isCompleted
                                ? "bg-green border-green text-white"
                                : isActive
                                ? "bg-brand text-white border-brand shadow-sm"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                            }`}
                          >
                            {isCompleted ? <IconCheck className="w-3 h-3" /> : index + 1}
                          </span>
                          <span className={isActive ? "text-brand font-extrabold" : isCompleted ? "text-green font-medium" : ""}>
                            {stepName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* History log */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <IconArrowsLeftRight className="w-4 h-4 text-brand" />
              Transfer Mutation Log
            </h3>

            <div className="overflow-x-auto border-[0.5px] border-slate-200 dark:border-slate-800 rounded-element">
              <table className="w-full text-left text-xs font-body border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">Property</th>
                    <th className="p-3">From</th>
                    <th className="p-3">To</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Stamp Duty</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((tx) => (
                    <tr key={tx.id} className="border-b border-slate-150 dark:border-slate-800/80">
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-350">{tx.parcelId}</td>
                      <td className="p-3 text-slate-500">{tx.fromName}</td>
                      <td className="p-3 text-slate-500">{tx.toName}</td>
                      <td className="p-3 text-slate-450">{tx.date}</td>
                      <td className="p-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                        ₹{tx.stampDuty.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 bg-green-light text-green text-[9px] font-extrabold uppercase rounded-pill border-[0.5px] border-green/20">
                          {tx.status}
                        </span>
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
