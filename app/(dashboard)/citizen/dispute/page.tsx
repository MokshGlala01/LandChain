"use client";

import React, { useState, useEffect } from "react";
import { IconAlertTriangle, IconCheck, IconCircleCheck, IconGavel } from "@tabler/icons-react";

export default function CitizenDisputePage() {
  const [parcelId, setParcelId] = useState("");
  const [reason, setReason] = useState("boundary");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [disputes, setDisputes] = useState<any[]>([]);

  const fetchDisputes = async () => {
    try {
      const res = await fetch("/api/disputes");
      if (res.ok) {
        const data = await res.json();
        setDisputes(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parcelId || !description || loading) return;

    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parcelId, reason, description }),
      });

      if (res.ok) {
        setSuccess(true);
        setParcelId("");
        setDescription("");
        fetchDisputes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body text-slate-800 dark:text-slate-100 p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-xl font-heading font-bold">Dispute Resolution Module</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Submit adverse possession, inheritance claims, or fraud challenges</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* File Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-600 dark:text-slate-300 uppercase">File a Claim</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Parcel ID</label>
              <input
                type="text"
                placeholder="e.g. PARCEL-4902-881"
                value={parcelId}
                onChange={(e) => setParcelId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-element border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-element border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none"
              >
                <option value="fraud">Fraud / Unauthorized transfer</option>
                <option value="boundary">Boundary Dispute</option>
                <option value="inheritance">Inheritance Claim</option>
                <option value="encroachment">Encroachment Challenge</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Detailed Statement</label>
              <textarea
                rows={3}
                placeholder="Describe the claim or encroachment details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-element border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F6E56] hover:bg-brand-dark text-white text-xs font-semibold py-2.5 rounded-element transition-colors"
            >
              {loading ? "Filing Claim..." : "File Dispute Claim"}
            </button>
          </form>

          {success && (
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-element text-xs flex items-center gap-1.5 font-semibold">
              <IconCircleCheck className="w-4 h-4" />
              Dispute successfully filed. Status updated on-chain.
            </div>
          )}
        </div>

        {/* Audit Pipeline */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-600 dark:text-slate-300 uppercase">My Claims History</h3>

          {disputes.length > 0 ? (
            <div className="space-y-3">
              {disputes.map((d) => (
                <div key={d.id} className="p-4 rounded-element bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-xs flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-200 block font-mono">{d.parcelId}</span>
                    <span className="text-[10px] text-slate-400 block font-heading uppercase font-bold">Reason: {d.reason}</span>
                    <p className="text-slate-500 leading-relaxed mt-1 text-[11px] font-body">{d.description}</p>
                    {d.verdictIpfsHash && (
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-500 font-bold">
                        <IconGavel className="w-3.5 h-3.5" />
                        On-chain Verdict Hash: <code className="font-mono">{d.verdictIpfsHash}</code>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-pill uppercase font-heading ${
                      d.status === "Resolved"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : d.status === "Arbitration"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-red-500/10 text-red-500"
                    }`}>
                      {d.status}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">{d.date}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-12">No claims filed by this user profile.</p>
          )}
        </div>
      </div>
    </div>
  );
}
