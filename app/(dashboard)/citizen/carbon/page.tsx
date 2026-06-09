"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconLeaf,
  IconCoins,
  IconClock,
  IconCheck,
  IconCalendar,
  IconActivity,
  IconTrash,
} from "@tabler/icons-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CarbonProperty {
  id: string;
  parcelId: string;
  greenCoverHectares: number;
  carbonSequestrationTons: number;
  creditsIssued: number;
  lastVerified: string;
  status: "VERIFIED" | "PENDING" | "REVOKED";
  ndviScore: number;
}

export default function CitizenCarbonPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<CarbonProperty[]>([
    {
      id: "cp-1",
      parcelId: "PARCEL-4902-881",
      greenCoverHectares: 2.4,
      carbonSequestrationTons: 12.8,
      creditsIssued: 12,
      lastVerified: "2026-05-15",
      status: "VERIFIED",
      ndviScore: 0.65,
    },
    {
      id: "cp-2",
      parcelId: "PARCEL-1002-880",
      greenCoverHectares: 1.2,
      carbonSequestrationTons: 5.6,
      creditsIssued: 5,
      lastVerified: "2026-06-01",
      status: "VERIFIED",
      ndviScore: 0.58,
    },
  ]);

  const [sellAmount, setSellAmount] = useState("");
  const creditPrice = 950; // ₹950 per credit

  const chartData = [
    { month: "Jan", credits: 2 },
    { month: "Feb", credits: 5 },
    { month: "Mar", credits: 7 },
    { month: "Apr", credits: 11 },
    { month: "May", credits: 15 },
    { month: "Jun", credits: 17 },
  ];

  const handleReverify = (parcelId: string) => {
    toast.info(`NDVI satellite reverification request submitted for ${parcelId}.`);
    setProperties((prev) =>
      prev.map((p) =>
        p.parcelId === parcelId
          ? { ...p, status: "PENDING" as const, lastVerified: new Date().toISOString().split("T")[0] }
          : p
      )
    );
    setTimeout(() => {
      setProperties((prev) =>
        prev.map((p) =>
          p.parcelId === parcelId
            ? { ...p, status: "VERIFIED" as const, ndviScore: +(p.ndviScore + 0.02).toFixed(2) }
            : p
        )
      );
      toast.success(`NDVI analysis complete for ${parcelId}. Satellite verified green cover index.`);
    }, 3000);
  };

  const handleSellCredits = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(sellAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid credit amount to sell.");
      return;
    }

    toast.success(`Listed ${amt} carbon credits on the marketplace at ₹${creditPrice}/credit.`);
    setSellAmount("");
  };

  const totalCredits = properties.reduce((acc, p) => acc + p.creditsIssued, 0);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100">
          Carbon Credits & Satellite NDVI Portal
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-body">
          Track green cover, check vegetation indexes (NDVI), and list carbon credits on the marketplace.
        </p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-50 rounded-card p-5 border-[0.5px] border-slate-100 flex flex-col justify-between text-center">
          <span className="text-[10px] font-heading font-extrabold uppercase text-slate-400 tracking-wider">
            Green Cover
          </span>
          <div className="mt-3 flex flex-col items-center">
            <h4 className="font-heading font-extrabold text-2xl text-slate-800 dark:text-slate-200">
              3.6 Hectares
            </h4>
            <span className="text-[9px] text-green font-bold flex items-center gap-0.5 mt-1 font-body">
              <IconLeaf className="w-3 h-3" />
              Satellite Scanned
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-card p-5 border-[0.5px] border-slate-100 flex flex-col justify-between text-center">
          <span className="text-[10px] font-heading font-extrabold uppercase text-slate-400 tracking-wider">
            Credits Balance
          </span>
          <div className="mt-3 flex flex-col items-center">
            <h4 className="font-heading font-extrabold text-2xl text-slate-800 dark:text-slate-200">
              {totalCredits} Credits
            </h4>
            <span className="text-[9px] text-brand font-bold flex items-center gap-0.5 mt-1 font-body">
              <IconCoins className="w-3 h-3" />
              On-chain ERC-20
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-card p-5 border-[0.5px] border-slate-100 flex flex-col justify-between text-center">
          <span className="text-[10px] font-heading font-extrabold uppercase text-slate-400 tracking-wider">
            Market Value
          </span>
          <div className="mt-3 flex flex-col items-center">
            <h4 className="font-heading font-extrabold text-2xl text-slate-800 dark:text-slate-200">
              ₹{(totalCredits * creditPrice).toLocaleString()}
            </h4>
            <span className="text-[9px] text-slate-405 mt-1 font-body">
              ₹{creditPrice} / credit spot price
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-card p-5 border-[0.5px] border-slate-100 flex flex-col justify-between text-center">
          <span className="text-[10px] font-heading font-extrabold uppercase text-slate-400 tracking-wider">
            Last NDVI check
          </span>
          <div className="mt-3 flex flex-col items-center">
            <h4 className="font-heading font-extrabold text-2xl text-slate-800 dark:text-slate-200">
              June 1, 2026
            </h4>
            <span className="text-[9px] text-green font-bold flex items-center gap-0.5 mt-1 font-body">
              <IconCheck className="w-3 h-3" />
              Healthy canopy index
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table & Sell section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              Credits Per Property
            </h3>

            <div className="overflow-x-auto border-[0.5px] border-slate-200 dark:border-slate-800 rounded-element">
              <table className="w-full text-left text-xs font-body border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">Parcel ID</th>
                    <th className="p-3 text-center">Green Cover</th>
                    <th className="p-3 text-center">NDVI Index</th>
                    <th className="p-3 text-center">Credits</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((item) => (
                    <tr key={item.id} className="border-b border-slate-150 dark:border-slate-800/80">
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-350">
                        {item.parcelId}
                      </td>
                      <td className="p-3 text-center text-slate-500">
                        {item.greenCoverHectares} ha
                      </td>
                      <td className="p-3 text-center font-semibold text-slate-600 dark:text-slate-400">
                        {item.ndviScore}
                      </td>
                      <td className="p-3 text-center font-bold text-brand dark:text-brand-mid">
                        {item.creditsIssued}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-pill text-[9px] font-extrabold uppercase ${
                          item.status === "VERIFIED"
                            ? "bg-green-light text-green"
                            : item.status === "PENDING"
                            ? "bg-gold-light text-gold animate-pulse"
                            : "bg-red-light text-red"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleReverify(item.parcelId)}
                          disabled={item.status === "PENDING"}
                          className="px-2.5 py-1 bg-brand-light text-brand dark:bg-brand-dark/20 dark:text-brand-mid text-[10px] font-heading font-extrabold uppercase rounded-element cursor-pointer hover:bg-brand hover:text-white disabled:opacity-50 transition-all"
                        >
                          Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sell Credits */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              Sell Carbon Credits
            </h3>

            <form onSubmit={handleSellCredits} className="space-y-4 font-body">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Credits count</label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand"
                  required
                />
              </div>

              {sellAmount && (
                <div className="p-3 rounded-element bg-slate-50 dark:bg-slate-950 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Credits to Sell:</span>
                    <span className="font-bold text-brand">{sellAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spot price:</span>
                    <span className="font-semibold text-slate-500">₹{creditPrice}</span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-800 mt-2 pt-2 flex justify-between font-bold text-sm">
                    <span>Est. Payout:</span>
                    <span className="text-green">₹{(parseFloat(sellAmount || "0") * creditPrice).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer transition-colors"
              >
                List on Marketplace
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Credit History chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
          Credits Minted Over Time
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F6E56" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0F6E56" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="month" tickLine={false} tickMargin={8} stroke="#94a3b8" style={{ fontSize: "10px" }} />
              <YAxis tickLine={false} tickMargin={8} stroke="#94a3b8" style={{ fontSize: "10px" }} />
              <Tooltip />
              <Area type="monotone" dataKey="credits" stroke="#0F6E56" strokeWidth={2} fillOpacity={1} fill="url(#colorCredits)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
