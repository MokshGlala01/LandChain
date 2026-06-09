"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconArrowLeft, IconCalculator, IconCoins, IconCreditCard, IconCircleCheck } from "@tabler/icons-react";

const stateDistricts: Record<string, string[]> = {
  "Uttar Pradesh": ["Gautam Buddha Nagar (Noida)", "Ghaziabad", "Lucknow", "Kanpur"],
  "Delhi": ["South Delhi", "New Delhi", "North Delhi", "West Delhi"],
  "Haryana": ["Gurugram", "Faridabad", "Sonipat", "Rohtak"],
  "Maharashtra": ["Mumbai Suburban", "Mumbai City", "Pune", "Thane"],
};

export default function CalculatorPage() {
  const [state, setState] = useState("Uttar Pradesh");
  const [district, setDistrict] = useState("Gautam Buddha Nagar (Noida)");
  const [propertyType, setPropertyType] = useState("Residential");
  const [relationship, setRelationship] = useState("unrelated");
  const [propertyValue, setPropertyValue] = useState<number>(3000000);
  
  const [stampDutyPercent, setStampDutyPercent] = useState(7);
  const [regFeePercent, setRegFeePercent] = useState(1);
  const [totalDuty, setTotalDuty] = useState(210000);
  const [totalReg, setTotalReg] = useState(30000);
  const [totalPayable, setTotalPayable] = useState(240000);

  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  // Recalculate fees
  useEffect(() => {
    // Basic rules matching our seeded database:
    // UP: unrelated = 7% duty, family = 2% duty, 1% reg
    // Delhi: unrelated = 6% duty, family = 3% duty, 1% reg
    // Haryana: unrelated = 5% duty, family = 2% duty, 1% reg
    // Maha: unrelated = 6% duty, family = 3% duty, 1% reg
    let duty = 6;
    let reg = 1;

    if (state === "Uttar Pradesh") {
      duty = relationship === "family" ? 2 : 7;
    } else if (state === "Delhi") {
      duty = relationship === "family" ? 3 : 6;
    } else if (state === "Haryana") {
      duty = relationship === "family" ? 2 : 5;
    } else if (state === "Maharashtra") {
      duty = relationship === "family" ? 3 : 6;
    }

    if (propertyType === "Commercial") {
      duty += 1; // commercial surcharge
    }

    const computedDuty = (propertyValue * duty) / 100;
    const computedReg = (propertyValue * reg) / 100;

    setStampDutyPercent(duty);
    setRegFeePercent(reg);
    setTotalDuty(computedDuty);
    setTotalReg(computedReg);
    setTotalPayable(computedDuty + computedReg);
  }, [state, propertyType, relationship, propertyValue]);

  const handleStateChange = (selectedState: string) => {
    setState(selectedState);
    const districts = stateDistricts[selectedState] || [];
    if (districts.length > 0) {
      setDistrict(districts[0]);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/stamp-duty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPayable,
          parcelId: "MOCK-PAY-" + Math.floor(1000 + Math.random() * 9000),
        }),
      });

      if (res.ok) {
        const orderData = await res.json();
        // Simulate standard Razorpay success callback
        setTimeout(() => {
          setReceipt({
            orderId: orderData.orderId,
            paymentId: "pay_mock_" + Math.random().toString(36).substring(2, 12),
            amount: totalPayable,
            parcelId: orderData.parcelId || "PARCEL-PAY-COMPLETED",
            date: new Date().toLocaleDateString(),
            ipfsHash: "QmPayReceipt_" + Math.random().toString(36).substring(2, 16),
            blockchainHash: "0xhash_" + Math.random().toString(16).substring(2, 66),
          });
          setPaymentSuccess(true);
          setLoading(false);
        }, 1500);
      } else {
        throw new Error("Order creation failed");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body text-slate-800 dark:text-slate-100 p-6 flex flex-col items-center"
    >
      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8">
        <Link href="/login" className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
          <IconArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
        <div className="flex items-center gap-2">
          <IconCalculator className="w-6 h-6 text-[#0F6E56]" />
          <h1 className="text-xl font-heading font-bold">Stamp Duty & Fees Calculator</h1>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Panel: Inputs */}
        <div className="bg-white dark:bg-slate-900 rounded-card p-6 border-[0.5px] border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h2 className="font-heading font-bold text-sm text-slate-600 dark:text-slate-300 uppercase tracking-wider">Property Parameters</h2>
          
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-heading font-bold text-slate-400">State</label>
            <select
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-4 py-3 rounded-element bg-slate-50 dark:bg-slate-950 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
            >
              {Object.keys(stateDistricts).map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-heading font-bold text-slate-400">District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-4 py-3 rounded-element bg-slate-50 dark:bg-slate-950 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
            >
              {(stateDistricts[state] || []).map((dst) => (
                <option key={dst} value={dst}>{dst}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-4 py-3 rounded-element bg-slate-50 dark:bg-slate-950 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
              >
                <option>Residential</option>
                <option>Commercial</option>
                <option>Agricultural</option>
                <option>Industrial</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Buyer Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-4 py-3 rounded-element bg-slate-50 dark:bg-slate-950 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
              >
                <option value="unrelated">Unrelated Buyer-Seller</option>
                <option value="family">Family Gift / Transfer</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Estimated Property Value (INR)</label>
              <span className="text-xs font-mono font-bold text-[#0F6E56]">₹{propertyValue.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={100000}
              max={20000000}
              step={50000}
              value={propertyValue}
              onChange={(e) => setPropertyValue(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0F6E56]"
            />
            <input
              type="number"
              value={propertyValue}
              onChange={(e) => setPropertyValue(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-2.5 rounded-element bg-slate-50 dark:bg-slate-950 border-[0.5px] border-slate-200 dark:border-slate-800 text-xs focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Right Panel: Results */}
        <div className="bg-white dark:bg-slate-900 rounded-card p-6 border-[0.5px] border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          {!paymentSuccess ? (
            <div className="space-y-6">
              <h2 className="font-heading font-bold text-sm text-slate-600 dark:text-slate-300 uppercase tracking-wider">Valuation Breakdown</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-element bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] uppercase font-heading font-bold text-slate-400 block">Stamp Duty Rate</span>
                  <span className="text-xl font-bold font-heading text-slate-700 dark:text-slate-200">{stampDutyPercent}%</span>
                </div>
                <div className="p-4 rounded-element bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] uppercase font-heading font-bold text-slate-400 block">Registration Fee</span>
                  <span className="text-xl font-bold font-heading text-slate-700 dark:text-slate-200">{regFeePercent}%</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 dark:border-slate-850 pt-4">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Stamp Duty Charge</span>
                  <span className="font-mono">₹{totalDuty.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Registration Fee Charge</span>
                  <span className="font-mono">₹{totalReg.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-200 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <span>Total Payable Amount</span>
                  <span className="font-mono text-[#0F6E56]">₹{totalPayable.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-[#0F6E56] hover:bg-brand-dark text-white text-xs font-semibold py-3.5 rounded-element transition-colors flex items-center justify-center gap-2"
              >
                <IconCreditCard className="w-4 h-4" />
                {loading ? "Initializing Razorpay..." : "Pay Stamp Duty via Razorpay"}
              </button>
            </div>
          ) : (
            <div className="space-y-5 flex flex-col justify-center items-center py-6 text-center">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                <IconCircleCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-md text-slate-800 dark:text-slate-100">Payment Successful!</h3>
                <p className="text-xs text-slate-400 mt-1">Receipt uploaded to IPFS and signed on-chain</p>
              </div>

              <div className="w-full text-left text-xs bg-slate-50 dark:bg-slate-950 p-4 rounded-element border border-slate-100 dark:border-slate-800 font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order ID:</span>
                  <span>{receipt.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment ID:</span>
                  <span>{receipt.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="text-[#0F6E56] font-bold">₹{receipt.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IPFS Hash:</span>
                  <span className="truncate w-36 text-right" title={receipt.ipfsHash}>{receipt.ipfsHash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tx Hash:</span>
                  <span className="truncate w-36 text-right" title={receipt.blockchainHash}>{receipt.blockchainHash}</span>
                </div>
              </div>

              <button
                onClick={() => setPaymentSuccess(false)}
                className="text-xs font-bold text-[#0F6E56] hover:underline"
              >
                Calculate Another Property
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
