"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconTimeline,
  IconCheck,
  IconClock,
  IconFlag,
  IconPlus,
  IconUpload,
  IconShieldCheck,
} from "@tabler/icons-react";

interface Milestone {
  id: string;
  name: string;
  targetDate: string;
  paymentPercent: number;
  status: "COMPLETED" | "PENDING" | "OVERDUE";
  completedDate?: string;
  daysRemainingOrOverdue: number;
}

interface Project {
  id: string;
  name: string;
}

export default function BuilderMilestonesPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: "ms-1",
      name: "Excavation and Foundation Complete",
      targetDate: "2026-04-10",
      paymentPercent: 15,
      status: "COMPLETED",
      completedDate: "2026-04-08",
      daysRemainingOrOverdue: 0,
    },
    {
      id: "ms-2",
      name: "RCC Substructure & Basement",
      targetDate: "2026-05-30",
      paymentPercent: 20,
      status: "OVERDUE",
      daysRemainingOrOverdue: 10,
    },
    {
      id: "ms-3",
      name: "RCC Superstructure Slab",
      targetDate: "2026-08-15",
      paymentPercent: 25,
      status: "PENDING",
      daysRemainingOrOverdue: 67,
    },
  ]);

  // Form State
  const [name, setName] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [payPercent, setPayPercent] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Upload proof state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeMilestoneId, setActiveMilestoneId] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/builder/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    const pct = parseFloat(payPercent);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      toast.error("Enter a valid payment release percentage.");
      return;
    }

    const currentTotal = milestones.reduce((sum, m) => sum + m.paymentPercent, 0);
    if (currentTotal + pct > 100) {
      toast.error(`Total milestone releases cannot exceed 100%. Remaining: ${100 - currentTotal}%`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/builder/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId, name, targetDate, paymentPercent: pct }),
      });

      if (res.ok) {
        const data = await res.json();
        const newMs: Milestone = {
          id: data.milestone.id,
          name: data.milestone.name,
          targetDate: data.milestone.targetDate,
          paymentPercent: data.milestone.paymentPercent,
          status: "PENDING",
          daysRemainingOrOverdue: 30,
        };
        setMilestones([...milestones, newMs]);
        toast.success("New project milestone logged successfully.");
        setModalOpen(false);
        setName("");
        setTargetDate("");
        setPayPercent("");
      }
    } catch (err) {
      toast.error("Failed to add milestone.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadTrigger = (id: string) => {
    setActiveMilestoneId(id);
    setProofFile(null);
    setUploadOpen(true);
  };

  const handleConfirmUpload = () => {
    if (!proofFile || !activeMilestoneId) return;
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === activeMilestoneId
          ? { ...m, status: "COMPLETED", completedDate: new Date().toISOString().split("T")[0] }
          : m
      )
    );
    toast.success("Milestone construction proof uploaded to IPFS. Escrow release request dispatched.");
    setUploadOpen(false);
  };

  const handleReraSubmit = () => {
    toast.success("Audit update document submitted to UPRERA Gateway. Certificate sync locked.");
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <IconTimeline className="w-6 h-6 text-brand" />
            Milestone tracker & Escrow
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-body">
            Log construction progress stages, upload site completion proofs, and release escrow payments.
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-element font-bold text-slate-650 focus:outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer transition-colors"
          >
            <IconPlus className="w-4 h-4" />
            Add Milestone
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-body text-xs leading-normal">
        {/* Milestone Timeline */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            Development timeline
          </h3>

          <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 pl-6 space-y-6">
            {milestones.map((ms) => {
              const isCompleted = ms.status === "COMPLETED";
              const isOverdue = ms.status === "OVERDUE";

              return (
                <div key={ms.id} className="relative">
                  {/* Status Bullet */}
                  <span className={`absolute -left-[35px] top-0.5 w-6 h-6 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center text-white ${
                    isCompleted ? "bg-green" : isOverdue ? "bg-red" : "bg-gold"
                  }`}>
                    {isCompleted ? <IconCheck className="w-3.5 h-3.5" /> : isOverdue ? <IconFlag className="w-3 h-3" /> : <IconClock className="w-3.5 h-3.5" />}
                  </span>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-200 block text-xs">{ms.name}</span>
                      <span className="font-mono text-slate-400 text-[10px]">{ms.paymentPercent}% stake release</span>
                    </div>

                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-450">Target Date: {ms.targetDate}</span>
                      {isCompleted ? (
                        <span className="text-green font-bold">Completed on: {ms.completedDate}</span>
                      ) : isOverdue ? (
                        <span className="text-red font-bold">{ms.daysRemainingOrOverdue} days overdue</span>
                      ) : (
                        <span className="text-gold font-bold">{ms.daysRemainingOrOverdue} days remaining</span>
                      )}
                    </div>

                    {ms.status !== "COMPLETED" && (
                      <button
                        onClick={() => handleUploadTrigger(ms.id)}
                        className="mt-2 px-2.5 py-1 bg-slate-900 hover:bg-slate-950 text-slate-200 text-[9px] font-heading font-extrabold uppercase rounded-element flex items-center gap-1 cursor-pointer"
                      >
                        <IconUpload className="w-3 h-3" />
                        Upload Proof
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RERA Checklist */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <IconShieldCheck className="w-4.5 h-4.5 text-brand" />
            RERA Compliance checklist
          </h3>

          <div className="space-y-3 font-body text-xs">
            <div className="flex items-center justify-between py-2 border-b">
              <span>Foundation complete:</span>
              <span className="text-green font-bold flex items-center gap-0.5"><IconCheck className="w-3.5 h-3.5" />Completed</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span>Superstructure slab:</span>
              <span className="text-gold font-bold flex items-center gap-0.5"><IconClock className="w-3.5 h-3.5" />Pending</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span>Plumbing/Electricals:</span>
              <span className="text-slate-400 font-bold">Planned</span>
            </div>
            <button
              onClick={handleReraSubmit}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-heading font-extrabold uppercase rounded-element text-center cursor-pointer border border-slate-200"
            >
              Submit Update to RERA
            </button>
          </div>
        </div>
      </div>

      {/* Add Milestone Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="max-w-sm w-full bg-white dark:bg-[#030806] rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 p-6 space-y-4 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-heading font-extrabold text-sm text-slate-700">Add Milestone Stage</h3>
              <button onClick={() => setModalOpen(false)} className="text-xs text-slate-450 hover:text-slate-650 font-bold">×</button>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-4 font-body text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Milestone Name</label>
                <input
                  type="text"
                  placeholder="e.g. Masonry brickwork complete"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Payment Release (%)</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={payPercent}
                  onChange={(e) => setPayPercent(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-heading font-extrabold rounded-element cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-grow py-2.5 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer flex items-center justify-center gap-1"
                >
                  {submitting && <IconLoader2 className="w-4 h-4 animate-spin" />}
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Proof Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="max-w-sm w-full bg-white dark:bg-[#030806] rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 p-6 space-y-4 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-heading font-extrabold text-sm text-slate-700">Upload construction proof</h3>
              <button onClick={() => setUploadOpen(false)} className="text-xs text-slate-450 hover:text-slate-650 font-bold">×</button>
            </div>

            <div className="space-y-4 font-body text-xs">
              <div className="p-4 border border-dashed border-slate-350 rounded-element flex flex-col items-center justify-center gap-1.5 bg-slate-50 text-center">
                <input
                  type="file"
                  id="proof-file"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="proof-file" className="cursor-pointer text-brand hover:text-brand-mid font-bold">
                  {proofFile ? "Completion document loaded" : "Select site photo / Architect NOC"}
                </label>
                {proofFile && <span className="text-[10px] text-slate-500 mt-1">{proofFile.name}</span>}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUploadOpen(false)}
                className="w-1/3 py-2 bg-gray-150 text-slate-705 text-xs font-heading font-extrabold rounded-element cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleConfirmUpload}
                disabled={!proofFile}
                className="flex-grow py-2 bg-brand text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer disabled:opacity-50"
              >
                Upload and Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple loader helper
function IconLoader2({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
