"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconBuildingCommunity,
  IconCheck,
  IconLock,
  IconPlus,
  IconArrowRight,
  IconDownload,
  IconShieldCheck,
} from "@tabler/icons-react";

interface FlatUnit {
  id: string;
  flatNumber: string;
  floor: number;
  areaSqft: number;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  ownerId?: string | null;
  nftTokenId?: string | null;
}

interface Project {
  id: string;
  name: string;
  totalUnits: number;
}

export default function BuilderUnitsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [units, setUnits] = useState<FlatUnit[]>([]);
  const [loading, setLoading] = useState(false);

  // Assignment states
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [activeUnit, setActiveUnit] = useState<FlatUnit | null>(null);
  const [buyerAadhaar, setBuyerAadhaar] = useState("");
  const [submittingAssign, setSubmittingAssign] = useState(false);

  // Selection states for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const fetchUnits = async (projectId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/builder/units?projectId=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setUnits(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchUnits(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Seed fallback mock data if empty
  useEffect(() => {
    if (!loading && selectedProjectId && units.length === 0) {
      const mockSeeds: FlatUnit[] = [
        { id: "u-1", flatNumber: "Flat-101", floor: 1, areaSqft: 1200, status: "SOLD", nftTokenId: "NFT-298102" },
        { id: "u-2", flatNumber: "Flat-102", floor: 1, areaSqft: 1200, status: "AVAILABLE" },
        { id: "u-3", flatNumber: "Flat-201", floor: 2, areaSqft: 1400, status: "RESERVED" },
        { id: "u-4", flatNumber: "Flat-202", floor: 2, areaSqft: 1400, status: "AVAILABLE" },
      ];
      setUnits(mockSeeds);
    }
  }, [loading, selectedProjectId, units]);

  const handleAssignTrigger = (unit: FlatUnit) => {
    setActiveUnit(unit);
    setBuyerAadhaar("");
    setAssignModalOpen(true);
  };

  const handleConfirmAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUnit || !buyerAadhaar.trim()) return;

    setSubmittingAssign(true);
    try {
      const res = await fetch("/api/builder/transfer-unit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId: activeUnit.id, buyerAadhaar }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Unit ${activeUnit.flatNumber} transferred to ${data.buyerName}. NFT Minted: ${data.nftTokenId}`);
        setAssignModalOpen(false);
        if (selectedProjectId) fetchUnits(selectedProjectId);
      } else {
        toast.error("Failed to execute unit assignment.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setSubmittingAssign(false);
      setActiveUnit(null);
    }
  };

  const handleBulkStatus = async (status: "AVAILABLE" | "RESERVED") => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch("/api/builder/transfer-unit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, status }),
      });

      if (res.ok) {
        toast.success(`Marked ${selectedIds.length} units as ${status}`);
        setSelectedIds([]);
        if (selectedProjectId) fetchUnits(selectedProjectId);
      }
    } catch (err) {
      toast.error("Failed to execute bulk update.");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getStatusColor = (status: string) => {
    if (status === "SOLD") return "bg-green-light text-green border-green/20";
    if (status === "RESERVED") return "bg-gold-light text-gold border-gold/20";
    return "bg-brand-light text-brand border-brand/20";
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <IconBuildingCommunity className="w-6 h-6 text-brand" />
            Apartment Unit Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-body">
            Manage society flat inventories, view floor layout maps, and initiate ERC-721 token transfers to buyers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-element font-bold text-slate-650"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid view floor plan visualizer & Table list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-body text-xs">
        {/* Floor layout mock map */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4 text-center">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 tracking-wider text-left">
            Floorplan Occupancy Matrix
          </h3>

          <div className="grid grid-cols-4 gap-3 py-4 max-w-[240px] mx-auto">
            {units.map((unit) => (
              <button
                key={unit.id}
                onClick={() => {
                  if (unit.status === "AVAILABLE") handleAssignTrigger(unit);
                }}
                className={`w-12 h-12 rounded border-[0.5px] font-mono text-[10px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                  unit.status === "SOLD"
                    ? "bg-green-light border-green/30 text-green"
                    : unit.status === "RESERVED"
                    ? "bg-gold-light border-gold/30 text-gold"
                    : "bg-brand-light border-brand/30 text-brand hover:scale-105"
                }`}
                title={`${unit.flatNumber} (${unit.status})`}
              >
                <span>{unit.flatNumber.split("-")[1]}</span>
                <span className="text-[7px] opacity-75">{unit.floor}F</span>
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-3 pt-3 text-[9px] text-slate-450 border-t">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-brand/10 border border-brand/35 rounded"></span>Available</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-gold/10 border border-gold/35 rounded"></span>Reserved</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-green/10 border border-green/35 rounded"></span>Sold</span>
          </div>
        </div>

        {/* Units Table list */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex justify-between items-center pb-2">
            <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              Flat inventory log
            </h3>

            {selectedIds.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkStatus("RESERVED")}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-[10px] font-heading font-extrabold uppercase rounded-element cursor-pointer"
                >
                  Reserve Selected
                </button>
                <button
                  onClick={() => handleBulkStatus("AVAILABLE")}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-[10px] font-heading font-extrabold uppercase rounded-element cursor-pointer"
                >
                  Mark Available
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto border-[0.5px] border-slate-200 dark:border-slate-800 rounded-element">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3 w-10 text-center">Select</th>
                  <th className="p-3">Flat Number</th>
                  <th className="p-3 text-center">Floor</th>
                  <th className="p-3 text-center">Area (Sq Ft)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">NFT Token ID</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id} className="border-b border-slate-150 dark:border-slate-800/80 hover:bg-slate-50/10">
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(unit.id)}
                        disabled={unit.status === "SOLD"}
                        onChange={() => toggleSelect(unit.id)}
                        className="rounded text-brand focus:ring-brand cursor-pointer disabled:opacity-50"
                      />
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{unit.flatNumber}</td>
                    <td className="p-3 text-center text-slate-500">{unit.floor}</td>
                    <td className="p-3 text-center text-slate-500">{unit.areaSqft} sqft</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 border-[0.5px] rounded-pill text-[9px] font-extrabold uppercase ${getStatusColor(unit.status)}`}>
                        {unit.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-450">{unit.nftTokenId || "Not Minted"}</td>
                    <td className="p-3 text-center">
                      {unit.status === "AVAILABLE" ? (
                        <button
                          onClick={() => handleAssignTrigger(unit)}
                          className="px-2 py-1 bg-brand-light text-brand hover:bg-brand hover:text-white text-[10px] font-heading font-extrabold uppercase rounded-element transition-all cursor-pointer"
                        >
                          Assign Buyer
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assign Buyer Modal dialog */}
      {assignModalOpen && activeUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="max-w-sm w-full bg-white dark:bg-[#030806] rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 p-6 space-y-4 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-heading font-extrabold text-sm text-slate-705">Assign Buyer to {activeUnit.flatNumber}</h3>
              <button onClick={() => setAssignModalOpen(false)} className="text-xs text-slate-450 hover:text-slate-650 font-bold">×</button>
            </div>

            <form onSubmit={handleConfirmAssign} className="space-y-4 font-body text-xs">
              <div className="p-3 bg-slate-50 rounded-element text-[10px] leading-relaxed text-slate-400">
                Confirming assignment registers Aadhaar title ownership details in the registry and automatically generates an ERC-721 NFT certificate proof.
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Buyer Aadhaar UID</label>
                <input
                  type="text"
                  placeholder="Enter 12-digit Aadhaar..."
                  value={buyerAadhaar}
                  onChange={(e) => setBuyerAadhaar(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand font-mono"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="w-1/3 py-2 bg-gray-100 hover:bg-gray-200 text-slate-705 text-xs font-heading font-extrabold rounded-element cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAssign}
                  className="flex-grow py-2 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  {submittingAssign && <IconLoader2 className="w-4 h-4 animate-spin" />}
                  Confirm & Mint NFT
                </button>
              </div>
            </form>
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
