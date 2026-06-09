"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconPolygon,
  IconCheck,
  IconX,
  IconUsers,
  IconLayersIntersect,
  IconMapPin,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react";
import PageHeader from "@/components/dashboard/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface PoolParcel {
  parcelId: string;
  area: number;
  ownerName: string;
  consented: boolean;
  compensation: number;
}

interface PoolingProject {
  id: string;
  name: string;
  purpose: string;
  parcels: PoolParcel[];
  status: "PLANNING" | "CONSENT_STAGE" | "APPROVED" | "COMPLETED";
  createdAt: string;
}

export default function LandPoolingPage() {
  const { user } = useAuth();
  const [pools, setPools] = useState<PoolingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<PoolingProject | null>(null);

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectPurpose, setProjectPurpose] = useState("");
  const [selectedParcelIds, setSelectedParcelIds] = useState<string[]>([]);
  const [availableParcelIds, setAvailableParcelIds] = useState<string[]>([]);

  // Local state for clicking dummy map
  const [mockMapHover, setMockMapHover] = useState<string | null>(null);

  const fetchPools = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agri/pool");
      if (res.ok) {
        const data = await res.json();
        setPools(data);
        if (data.length > 0 && !selectedPool) {
          setSelectedPool(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load pooling projects", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableParcels = async () => {
    try {
      const res = await fetch("/api/agri/parcels");
      if (res.ok) {
        const data = await res.json();
        // Extract all parcel ids in the registry
        setAvailableParcelIds(data.map((p: any) => p.parcelId));
      }
    } catch (err) {
      console.error("Failed to load available parcels", err);
    }
  };

  useEffect(() => {
    fetchPools();
    fetchAvailableParcels();
  }, []);

  const handleToggleConsent = async (parcelId: string) => {
    if (!selectedPool) return;
    try {
      const res = await fetch("/api/agri/pool", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPool.id,
          parcelId,
          action: "toggle_consent",
        }),
      });

      if (res.ok) {
        toast.success(`Consent status updated for ${parcelId}`);
        // Update local state
        const updatedPools = pools.map((p) => {
          if (p.id === selectedPool.id) {
            const updatedParcels = p.parcels.map((pr) => {
              if (pr.parcelId === parcelId) {
                return { ...pr, consented: !pr.consented };
              }
              return pr;
            });
            return { ...p, parcels: updatedParcels };
          }
          return p;
        });
        setPools(updatedPools);
        const nextSelected = updatedPools.find((p) => p.id === selectedPool.id);
        if (nextSelected) setSelectedPool(nextSelected);
      }
    } catch (err) {
      toast.error("Failed to update consent");
    }
  };

  const handleUpdateStatus = async (status: PoolingProject["status"]) => {
    if (!selectedPool) return;
    try {
      const res = await fetch("/api/agri/pool", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPool.id,
          status,
          action: "update_status",
        }),
      });

      if (res.ok) {
        toast.success(`Pooling project status advanced to ${status}`);
        fetchPools();
      }
    } catch (err) {
      toast.error("Failed to update project status");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedParcelIds.length === 0) {
      toast.error("Please select at least one parcel for the pooling belt.");
      return;
    }

    try {
      const res = await fetch("/api/agri/pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          purpose: projectPurpose,
          parcelIds: selectedParcelIds,
        }),
      });

      if (res.ok) {
        toast.success("Land Pooling project registered and parcels mapped.");
        setIsAdding(false);
        setProjectName("");
        setProjectPurpose("");
        setSelectedParcelIds([]);
        fetchPools();
      } else {
        const err = await res.json();
        toast.error(err.error || "Creation failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const handleMapParcelClick = (parcelId: string) => {
    if (selectedParcelIds.includes(parcelId)) {
      setSelectedParcelIds(selectedParcelIds.filter((id) => id !== parcelId));
      toast.info(`Removed ${parcelId} from pooling belt.`);
    } else {
      setSelectedParcelIds([...selectedParcelIds, parcelId]);
      toast.success(`Added ${parcelId} to pooling belt.`);
    }
  };

  // Chart data calculations
  const totalParcelsCount = selectedPool?.parcels.length || 0;
  const consentedCount = selectedPool?.parcels.filter((p) => p.consented).length || 0;
  const nonConsentedCount = totalParcelsCount - consentedCount;

  const pieData = [
    { name: "Consented", value: consentedCount, color: "#0F6E56" },
    { name: "Awaiting Consent", value: nonConsentedCount, color: "#BA7517" },
  ];

  // Compensation analytics
  const totalCompensation = selectedPool?.parcels.reduce((acc, p) => acc + p.compensation, 0) || 0;
  const averageCompensation = totalParcelsCount ? Math.round(totalCompensation / totalParcelsCount) : 0;
  const consentedArea = selectedPool?.parcels.reduce((acc, p) => acc + (p.consented ? p.area : 0), 0) || 0;
  const totalArea = selectedPool?.parcels.reduce((acc, p) => acc + p.area, 0) || 0;
  const consentPercentage = totalArea ? Math.round((consentedArea / totalArea) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Land Pooling & Infrastructure Planning"
        subtitle="Consolidate contiguous agricultural zones, track landowner consent, and estimate blockchain compensation packages."
        cta={
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer transition-colors"
          >
            <IconPlus className="w-4 h-4" />
            New Pooling Project
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          label="Total Pooling Capital"
          value={`₹${(totalCompensation / 10000000).toFixed(2)} Cr`}
          color="brand"
          icon={IconUsers}
        />
        <MetricCard
          label="Area Consent Percentage"
          value={`${consentPercentage}%`}
          color="green"
          icon={IconTrendingUp}
          trend={{ value: consentPercentage, isUp: consentPercentage > 50 }}
        />
        <MetricCard
          label="Mapped Belt Parcels"
          value={totalParcelsCount}
          color="gold"
          icon={IconLayersIntersect}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Project Selection list & Consent tracking */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
                Pooling Project Selector
              </h3>
              <select
                className="px-2.5 py-1.5 text-xs bg-gray-50 border border-slate-200 dark:border-slate-800 rounded-element focus:outline-none"
                value={selectedPool?.id || ""}
                onChange={(e) => {
                  const pool = pools.find((p) => p.id === e.target.value);
                  if (pool) setSelectedPool(pool);
                }}
              >
                {pools.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedPool ? (
              <div className="space-y-5">
                {/* Info Box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-element space-y-2 text-xs font-body leading-relaxed">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                      {selectedPool.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-pill bg-brand-light text-brand text-[9px] font-extrabold uppercase">
                      {selectedPool.status}
                    </span>
                  </div>
                  <p className="text-slate-405">{selectedPool.purpose}</p>

                  <div className="pt-2 flex gap-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => handleUpdateStatus("CONSENT_STAGE")}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-750 dark:text-slate-250 text-[10px] font-heading font-extrabold uppercase rounded-element cursor-pointer"
                    >
                      Stage Consent
                    </button>
                    <button
                      onClick={() => handleUpdateStatus("APPROVED")}
                      className="px-2.5 py-1 bg-brand-light hover:bg-brand text-brand hover:text-white text-[10px] font-heading font-extrabold uppercase rounded-element cursor-pointer"
                    >
                      Approve Pool
                    </button>
                  </div>
                </div>

                {/* Consent Table */}
                <div className="space-y-3">
                  <h4 className="font-heading font-extrabold text-xs text-slate-450 uppercase tracking-wide">
                    Consenting Landowners Registry
                  </h4>
                  <div className="overflow-x-auto border-[0.5px] border-slate-200 dark:border-slate-800 rounded-element">
                    <table className="w-full text-left text-xs font-body border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                          <th className="p-3">Parcel ID</th>
                          <th className="p-3">Landowner</th>
                          <th className="p-3 text-center">Area (ha)</th>
                          <th className="p-3 text-right">Compensation</th>
                          <th className="p-3 text-center">Consent</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPool.parcels.map((parcel) => (
                          <tr key={parcel.parcelId} className="border-b border-slate-150 dark:border-slate-800/80">
                            <td className="p-3 font-mono font-bold text-slate-750 dark:text-slate-350">
                              {parcel.parcelId}
                            </td>
                            <td className="p-3 font-semibold text-slate-650">{parcel.ownerName}</td>
                            <td className="p-3 text-center text-slate-500">{parcel.area}</td>
                            <td className="p-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                              ₹{(parcel.compensation / 100000).toFixed(1)} L
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-pill text-[9px] font-extrabold uppercase ${
                                  parcel.consented ? "bg-green-light text-green" : "bg-gold-light text-gold"
                                }`}
                              >
                                {parcel.consented ? "Signed" : "Pending"}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleToggleConsent(parcel.parcelId)}
                                className={`px-2 py-1 text-[9px] font-heading font-extrabold uppercase rounded-element transition-colors cursor-pointer ${
                                  parcel.consented
                                    ? "bg-gold-light hover:bg-gold text-gold hover:text-white"
                                    : "bg-green-light hover:bg-green text-green hover:text-white"
                                }`}
                              >
                                {parcel.consented ? "Revoke" : "Sign"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-slate-400 font-body">No pooling projects configured. Create one to start tracking landowner consent.</div>
            )}
          </div>
        </div>

        {/* Right Side: Consent Distribution & Interactive Map clicker */}
        <div className="space-y-6">
          {selectedPool && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
                Consent Distribution
              </h3>
              <div className="h-44 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "10px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Interactive Mock Map Selector */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <IconMapPin className="w-4 h-4 text-brand" />
              Agri Belt GIS Selection
            </h3>

            <div className="relative border border-slate-200 dark:border-slate-800 rounded-element aspect-square overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
              {/* Dummy SVG Map for GIS selection */}
              <svg viewBox="0 0 100 100" className="w-full h-full stroke-slate-350 fill-slate-100 dark:fill-slate-900 stroke-[0.8] cursor-pointer">
                {/* Parcel 1 */}
                <polygon
                  points="10,10 45,15 40,50 8,45"
                  className={`transition-colors duration-250 ${
                    selectedParcelIds.includes("PARCEL-4902-881")
                      ? "fill-brand/30 stroke-brand stroke-[1.5]"
                      : mockMapHover === "PARCEL-4902-881"
                      ? "fill-slate-200 dark:fill-slate-800"
                      : ""
                  }`}
                  onClick={() => handleMapParcelClick("PARCEL-4902-881")}
                  onMouseEnter={() => setMockMapHover("PARCEL-4902-881")}
                  onMouseLeave={() => setMockMapHover(null)}
                />
                <text x="20" y="30" className="font-mono text-[5px] fill-slate-550 select-none pointer-events-none">PARCEL-881</text>

                {/* Parcel 2 */}
                <polygon
                  points="45,15 90,20 85,60 40,50"
                  className={`transition-colors duration-250 ${
                    selectedParcelIds.includes("PARCEL-1002-880")
                      ? "fill-brand/30 stroke-brand stroke-[1.5]"
                      : mockMapHover === "PARCEL-1002-880"
                      ? "fill-slate-200 dark:fill-slate-800"
                      : ""
                  }`}
                  onClick={() => handleMapParcelClick("PARCEL-1002-880")}
                  onMouseEnter={() => setMockMapHover("PARCEL-1002-880")}
                  onMouseLeave={() => setMockMapHover(null)}
                />
                <text x="55" y="35" className="font-mono text-[5px] fill-slate-550 select-none pointer-events-none">PARCEL-880</text>

                {/* Parcel 3 */}
                <polygon
                  points="8,45 40,50 35,90 5,85"
                  className={`transition-colors duration-250 ${
                    selectedParcelIds.includes("PARCEL-2209-411")
                      ? "fill-brand/30 stroke-brand stroke-[1.5]"
                      : mockMapHover === "PARCEL-2209-411"
                      ? "fill-slate-200 dark:fill-slate-800"
                      : ""
                  }`}
                  onClick={() => handleMapParcelClick("PARCEL-2209-411")}
                  onMouseEnter={() => setMockMapHover("PARCEL-2209-411")}
                  onMouseLeave={() => setMockMapHover(null)}
                />
                <text x="15" y="70" className="font-mono text-[5px] fill-slate-550 select-none pointer-events-none">PARCEL-411</text>
              </svg>
              <div className="absolute bottom-2 left-2 right-2 bg-white/90 dark:bg-slate-900/95 backdrop-blur-sm p-2 rounded border-[0.5px] border-slate-200 dark:border-slate-800 text-[9px] leading-tight text-center text-slate-500 font-body">
                Click map zones to add/remove contiguous survey boundaries from the pooling queue.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Creation Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
            <div className="border-b pb-3 flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-sm text-slate-800 dark:text-slate-100">
                Configure Land Pooling Project
              </h3>
              <button
                onClick={() => setIsAdding(false)}
                className="text-slate-450 hover:text-slate-700 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs font-body">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ring Road Bypass Extension"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-slate-200 dark:border-slate-800 rounded-element focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Purpose / Scope</label>
                <textarea
                  placeholder="Details of public infrastructure planning..."
                  value={projectPurpose}
                  onChange={(e) => setProjectPurpose(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 border border-slate-200 dark:border-slate-800 rounded-element focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400 block">Select Belt Parcels</label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border border-slate-100 rounded-element bg-slate-50 dark:bg-slate-950">
                  {availableParcelIds.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleMapParcelClick(id)}
                      className={`px-2 py-1 rounded text-[9px] font-mono font-bold border ${
                        selectedParcelIds.includes(id)
                          ? "bg-brand text-white border-brand"
                          : "bg-white border-slate-200 text-slate-650 hover:bg-slate-100"
                      }`}
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 border border-slate-200 rounded-element hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand text-white rounded-element hover:bg-brand-mid cursor-pointer font-heading font-extrabold uppercase"
                >
                  Initialize Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
