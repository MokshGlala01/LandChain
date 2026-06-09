"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconScale,
  IconClock,
  IconGavel,
  IconCheck,
  IconUserCheck,
  IconPlus,
  IconUpload,
  IconArchive,
  IconSnowflake,
  IconFlame,
} from "@tabler/icons-react";

interface Dispute {
  id: string;
  parcelId: string;
  filerName: string;
  reason: string;
  dateFiled: string;
  arbitrator: string;
  status: "FILED" | "UNDER_REVIEW" | "ARBITRATION" | "RESOLVED";
  notes?: string;
}

export default function RegistrarDisputesPage() {
  const { user } = useAuth();
  const [viewType, setViewType] = useState<"kanban" | "table">("kanban");
  const [disputes, setDisputes] = useState<Dispute[]>([
    {
      id: "disp-1",
      parcelId: "PARCEL-4902-881",
      filerName: "Sunil Dutt",
      reason: "Claim overlapping boundaries with Survey #409.",
      dateFiled: "2026-06-01",
      arbitrator: "Not Assigned",
      status: "FILED",
    },
    {
      id: "disp-2",
      parcelId: "PARCEL-1002-880",
      filerName: "Rohan Kalia",
      reason: "Inheritance claim mismatch between siblings.",
      dateFiled: "2026-05-20",
      arbitrator: "Arbitrator V. K. Singh",
      status: "ARBITRATION",
      notes: "Arbitration hearings scheduled for June 12.",
    },
  ]);

  const [activeDispute, setActiveDispute] = useState<Dispute | null>(null);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [newNotes, setNewNotes] = useState("");
  const [arbitratorModalOpen, setArbitratorModalOpen] = useState(false);
  const [selectedArbitrator, setSelectedArbitrator] = useState("Arbitrator V. K. Singh");

  const [verdictModalOpen, setVerdictModalOpen] = useState(false);
  const [verdictFile, setVerdictFile] = useState<File | null>(null);

  const arbitrators = ["Arbitrator V. K. Singh", "Arbitrator Manju Latha", "Arbitrator R. C. Lahoti"];

  const handleAssignArbitrator = (dispute: Dispute) => {
    setActiveDispute(dispute);
    setArbitratorModalOpen(true);
  };

  const handleConfirmAssign = () => {
    if (!activeDispute) return;
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === activeDispute.id ? { ...d, arbitrator: selectedArbitrator, status: "UNDER_REVIEW" } : d
      )
    );
    toast.success(`Dispute for ${activeDispute.parcelId} assigned to ${selectedArbitrator}`);
    setArbitratorModalOpen(false);
    setActiveDispute(null);
  };

  const handleAddNotesTrigger = (dispute: Dispute) => {
    setActiveDispute(dispute);
    setNewNotes(dispute.notes || "");
    setNotesModalOpen(true);
  };

  const handleConfirmNotes = () => {
    if (!activeDispute) return;
    setDisputes((prev) =>
      prev.map((d) => (d.id === activeDispute.id ? { ...d, notes: newNotes } : d))
    );
    toast.success("Dispute audit notes updated successfully.");
    setNotesModalOpen(false);
    setActiveDispute(null);
  };

  const handleFreezeToggle = (parcelId: string, action: "freeze" | "unfreeze") => {
    toast.success(`Smart contract trigger: Property ${parcelId} has been successfully ${action}d on-chain.`);
  };

  const handleResolveTrigger = (dispute: Dispute) => {
    setActiveDispute(dispute);
    setVerdictFile(null);
    setVerdictModalOpen(true);
  };

  const handleConfirmVerdict = () => {
    if (!activeDispute) return;
    setDisputes((prev) =>
      prev.map((d) => (d.id === activeDispute.id ? { ...d, status: "RESOLVED" } : d))
    );
    toast.success(`Verdict uploaded to IPFS. Dispute for ${activeDispute.parcelId} resolved.`);
    setVerdictModalOpen(false);
    setActiveDispute(null);
  };

  const getDisputesByStatus = (status: string) => {
    return disputes.filter((d) => d.status === status);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <IconScale className="w-6 h-6 text-brand" />
            Dispute Arbitration Center
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-body">
            Assign arbitrators, record hearing logs, place legal freezes, and upload binding verdicts.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewType("kanban")}
            className={`px-3 py-1.5 text-xs font-heading font-extrabold rounded-element cursor-pointer transition-colors ${
              viewType === "kanban" ? "bg-brand text-white" : "bg-white border border-slate-200"
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => setViewType("table")}
            className={`px-3 py-1.5 text-xs font-heading font-extrabold rounded-element cursor-pointer transition-colors ${
              viewType === "table" ? "bg-brand text-white" : "bg-white border border-slate-200"
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {viewType === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {["FILED", "UNDER_REVIEW", "ARBITRATION", "RESOLVED"].map((status) => {
            const list = getDisputesByStatus(status);
            return (
              <div key={status} className="bg-gray-50/50 dark:bg-slate-900/40 p-4 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4 min-h-[300px]">
                <h3 className="font-heading font-extrabold text-[10px] text-slate-400 uppercase tracking-widest border-b pb-2">
                  {status.replace(/_/g, " ")} ({list.length})
                </h3>

                <div className="space-y-3">
                  {list.map((d) => (
                    <div
                      key={d.id}
                      className="bg-white dark:bg-slate-950 p-4 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-3 font-body text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-brand block">{d.parcelId}</span>
                        <span className="text-[10px] text-slate-450 mt-1 block">Filer: {d.filerName}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-normal">{d.reason}</p>

                      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                        <button
                          onClick={() => handleAssignArbitrator(d)}
                          className="px-2 py-1 bg-gray-50 hover:bg-slate-100 text-[10px] font-heading font-extrabold uppercase rounded-element border border-slate-200"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => handleAddNotesTrigger(d)}
                          className="px-2 py-1 bg-gray-50 hover:bg-slate-100 text-[10px] font-heading font-extrabold uppercase rounded-element border border-slate-200"
                        >
                          Notes
                        </button>
                        {d.status !== "RESOLVED" && (
                          <button
                            onClick={() => handleResolveTrigger(d)}
                            className="px-2 py-1 bg-brand-light text-brand hover:bg-brand hover:text-white text-[10px] font-heading font-extrabold uppercase rounded-element"
                          >
                            Resolve
                          </button>
                        )}
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleFreezeToggle(d.parcelId, "freeze")}
                          className="flex-1 py-1 bg-slate-900 text-white rounded-element hover:bg-slate-950 text-[9px] font-heading font-extrabold uppercase flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <IconSnowflake className="w-3 h-3" />
                          Freeze
                        </button>
                        <button
                          onClick={() => handleFreezeToggle(d.parcelId, "unfreeze")}
                          className="flex-1 py-1 bg-slate-100 text-slate-700 rounded-element hover:bg-slate-200 border border-slate-200 text-[9px] font-heading font-extrabold uppercase flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <IconFlame className="w-3 h-3" />
                          Unfreeze
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs font-body border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">Property ID</th>
                <th className="p-3">Filer</th>
                <th className="p-3">Arbitrator</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Date Filed</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => (
                <tr key={d.id} className="border-b border-slate-150 dark:border-slate-800/80">
                  <td className="p-3 font-mono font-bold text-brand">{d.parcelId}</td>
                  <td className="p-3 text-slate-600">{d.filerName}</td>
                  <td className="p-3 text-slate-650">{d.arbitrator}</td>
                  <td className="p-3 text-slate-500 max-w-[200px] truncate">{d.reason}</td>
                  <td className="p-3 text-slate-450">{d.dateFiled}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-pill text-[9px] font-extrabold uppercase ${
                      d.status === "RESOLVED"
                        ? "bg-green-light text-green"
                        : d.status === "ARBITRATION"
                        ? "bg-red-light text-red"
                        : "bg-gold-light text-gold"
                    }`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Arbitrator Modal */}
      {arbitratorModalOpen && activeDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="max-w-sm w-full bg-white dark:bg-[#030806] rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-heading font-extrabold text-sm text-slate-700">Assign Arbitrator Officer</h3>
              <button onClick={() => setArbitratorModalOpen(false)} className="text-xs text-slate-400 hover:text-slate-600 font-bold">×</button>
            </div>

            <div className="space-y-4 font-body text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400 font-body">Select Arbitrator</label>
                <select
                  value={selectedArbitrator}
                  onChange={(e) => setSelectedArbitrator(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element"
                >
                  {arbitrators.map((arb) => (
                    <option key={arb} value={arb}>{arb}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setArbitratorModalOpen(false)}
                className="w-1/3 py-2 bg-gray-150 text-slate-705 text-xs font-heading font-extrabold rounded-element cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleConfirmAssign}
                className="flex-grow py-2 bg-brand text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer"
              >
                Assign Arbitrator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Notes Modal */}
      {notesModalOpen && activeDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="max-w-sm w-full bg-white dark:bg-[#030806] rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-heading font-extrabold text-sm text-slate-700">Dispute Hearing Notes</h3>
              <button onClick={() => setNotesModalOpen(false)} className="text-xs text-slate-400 hover:text-slate-600 font-bold">×</button>
            </div>

            <div className="space-y-3 font-body text-xs">
              <textarea
                placeholder="Log notes about hearings, evidences and statements..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full h-24 px-3 py-2 border border-slate-200 rounded-element focus:outline-none focus:border-brand"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setNotesModalOpen(false)}
                className="w-1/3 py-2 bg-gray-150 text-slate-700 text-xs font-heading font-extrabold rounded-element cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmNotes}
                className="flex-grow py-2 bg-brand text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve verdict modal */}
      {verdictModalOpen && activeDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="max-w-sm w-full bg-white dark:bg-[#030806] rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-heading font-extrabold text-sm text-slate-700">Upload Dispute Verdict</h3>
              <button onClick={() => setVerdictModalOpen(false)} className="text-xs text-slate-400 hover:text-slate-600 font-bold">×</button>
            </div>

            <div className="space-y-4 font-body text-xs">
              <div className="p-4 border border-dashed border-slate-300 rounded-element flex flex-col items-center justify-center gap-1 bg-slate-50">
                <input
                  type="file"
                  id="verdict-file"
                  onChange={(e) => setVerdictFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="verdict-file" className="cursor-pointer text-brand hover:text-brand-mid font-bold">
                  {verdictFile ? "Verdict document selected" : "Select Verdict Copy PDF"}
                </label>
                {verdictFile && <span className="text-[10px] text-slate-500">{verdictFile.name}</span>}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setVerdictModalOpen(false)}
                className="w-1/3 py-2 bg-gray-150 text-slate-705 text-xs font-heading font-extrabold rounded-element cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleConfirmVerdict}
                disabled={!verdictFile}
                className="flex-grow py-2 bg-brand text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer disabled:opacity-50"
              >
                Upload and Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
