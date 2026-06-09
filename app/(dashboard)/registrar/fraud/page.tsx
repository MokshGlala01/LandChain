"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconDownload,
  IconMail,
  IconUserCheck,
  IconAlertTriangle,
  IconZoomQuestion,
} from "@tabler/icons-react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

interface FlaggedProperty {
  id: string;
  parcelId: string;
  ownerName: string;
  riskScore: number;
  flags: string[];
  status: "PENDING_AUDIT" | "FLAGGED" | "INVESTIGATING";
}

export default function RegistrarFraudPage() {
  const { user } = useAuth();
  const [flaggedProps, setFlaggedProps] = useState<FlaggedProperty[]>([
    {
      id: "fp-1",
      parcelId: "PARCEL-8021-992",
      ownerName: "Unknown Claimant",
      riskScore: 88,
      flags: ["Valuation jump >65% in 30 days", "Multiple transfers registered in Noida & Delhi simultaneously"],
      status: "PENDING_AUDIT",
    },
    {
      id: "fp-2",
      parcelId: "PARCEL-4902-881",
      ownerName: "Amit Kumar",
      riskScore: 78,
      flags: ["Same buyer Aadhaar in multiple distinct transactions today"],
      status: "PENDING_AUDIT",
    },
  ]);

  const handleInvestigate = (id: string, parcelId: string) => {
    setFlaggedProps((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "INVESTIGATING" } : p))
    );
    toast.success(`Property ${parcelId} marked as FLAGGED. Audit file assigned to district officer.`);
  };

  const handleDownloadFraudReport = () => {
    toast.success("Compiling Noida division fraud risk index. PDF download initialized.");
  };

  const handleEmailCollector = () => {
    toast.success("Fraud alerts summary dispatched to District Collector Office (amit.kumar@gov.in).");
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <IconAlertTriangle className="w-6 h-6 text-red" />
            AI Fraud Prevention Console
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-body">
            Algorithmic monitoring of transaction spikes, boundary overrides, and valuation anomalies.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownloadFraudReport}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <IconDownload className="w-4 h-4" />
            Download Report
          </button>
          <button
            onClick={handleEmailCollector}
            className="px-3 py-2 bg-brand text-white hover:bg-brand-mid text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <IconMail className="w-4 h-4" />
            Email Collector
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* High-Risk properties list */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            High-Risk Mutations Queue (Score &gt; 75)
          </h3>

          <div className="space-y-4 font-body text-xs">
            {flaggedProps.map((prop) => {
              // Format data for RadialBar
              const chartData = [
                { name: "score", value: prop.riskScore, fill: "#A32D2D" },
                { name: "max", value: 100, fill: "#e2e8f0" },
              ];

              return (
                <div
                  key={prop.id}
                  className="p-5 border border-slate-150 dark:border-slate-800/80 rounded-element flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-red/35 transition-colors"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-red bg-red-light dark:bg-red/15 dark:text-red px-2 py-0.5 rounded-element">
                        {prop.parcelId}
                      </span>
                      <span className="text-[10px] text-slate-400">Owner: {prop.ownerName}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block font-heading">Suspicion Flags</span>
                      <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-1 leading-normal">
                        {prop.flags.map((flag, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <IconAlertTriangle className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="w-16 h-16 relative">
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
                      <div className="absolute inset-0 flex items-center justify-center font-heading font-extrabold text-xs text-red">
                        {prop.riskScore}%
                      </div>
                    </div>

                    <button
                      onClick={() => handleInvestigate(prop.id, prop.parcelId)}
                      disabled={prop.status === "INVESTIGATING"}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-950 text-white text-[10px] font-heading font-extrabold uppercase rounded-element flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <IconZoomQuestion className="w-4 h-4" />
                      {prop.status === "INVESTIGATING" ? "Investigating" : "Investigate"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Patterns and analytics */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              Fraud Pattern Tracker
            </h3>

            <div className="space-y-3 font-body text-xs leading-relaxed">
              <div className="p-3 border border-slate-100 rounded-element space-y-1">
                <span className="font-bold text-slate-700 block">Same Buyer Overrides</span>
                <span className="text-[10px] text-slate-400 block">Filer Aadhaar matches &gt;3 transfer listings in Noida within 24 hours.</span>
                <span className="text-[10px] font-bold text-red block mt-1">1 active warning</span>
              </div>

              <div className="p-3 border border-slate-100 rounded-element space-y-1">
                <span className="font-bold text-slate-700 block">Rapid Ownership Loops</span>
                <span className="text-[10px] text-slate-400 block">Property survey records &gt;4 transfers inside a 12-month sequence.</span>
                <span className="text-[10px] font-bold text-slate-400 block mt-1">0 active warning</span>
              </div>

              <div className="p-3 border border-slate-100 rounded-element space-y-1">
                <span className="font-bold text-slate-700 block">Valuation Spikes</span>
                <span className="text-[10px] text-slate-400 block">Assessed transaction prices exceeds standard circle rates by &gt;50%.</span>
                <span className="text-[10px] font-bold text-red block mt-1">1 active warning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
