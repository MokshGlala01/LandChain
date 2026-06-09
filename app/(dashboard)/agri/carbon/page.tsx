"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconCloud,
  IconLeaf,
  IconCoins,
  IconActivity,
  IconCheck,
  IconTrash,
  IconRefresh,
  IconAlertCircle,
} from "@tabler/icons-react";
import PageHeader from "@/components/dashboard/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CarbonParcel {
  id: string;
  parcelId: string;
  greenCoverHectares: number;
  carbonSequestrationTons: number;
  creditsIssued: number;
  lastVerified: string;
  property: {
    location: string;
    owner: {
      name: string;
    };
  } | null;
}

export default function AgriCarbonManagementPage() {
  const { user } = useAuth();
  const [parcels, setParcels] = useState<CarbonParcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditingParcelId, setAuditingParcelId] = useState<string | null>(null);

  const fetchCarbonParcels = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agri/carbon");
      if (res.ok) {
        const data = await res.json();
        setParcels(data);
      }
    } catch (err) {
      console.error("Failed to load carbon database", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarbonParcels();
  }, []);

  const handleNDVIAudit = async (parcelId: string) => {
    setAuditingParcelId(parcelId);
    toast.info(`Triggering high-resolution Sentinel satellite scan for ${parcelId}...`);

    try {
      const res = await fetch("/api/agri/carbon/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parcelId }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`NDVI audit complete: ${data.creditsIssued} carbon credits verified and issued on-chain.`);
        fetchCarbonParcels();
      } else {
        const err = await res.json();
        toast.error(err.error || "Audit failed");
      }
    } catch (err) {
      toast.error("Network error during NDVI satellite audit");
    } finally {
      setAuditingParcelId(null);
    }
  };

  const handleRevokeCredits = async (parcelId: string) => {
    if (!confirm(`Are you sure you want to revoke all carbon credits issued to ${parcelId}? This updates the on-chain registry.`)) {
      return;
    }

    try {
      const res = await fetch("/api/agri/carbon/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parcelId }),
      });

      if (res.ok) {
        toast.success(`Carbon credits successfully revoked for parcel ${parcelId}.`);
        fetchCarbonParcels();
      } else {
        const err = await res.json();
        toast.error(err.error || "Revocation failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  // Summary Metrics
  const totalHectares = +parcels.reduce((acc, p) => acc + p.greenCoverHectares, 0).toFixed(1);
  const totalSequestration = +parcels.reduce((acc, p) => acc + p.carbonSequestrationTons, 0).toFixed(1);
  const totalCredits = parcels.reduce((acc, p) => acc + p.creditsIssued, 0);

  // Carbon growth trends mock data
  const trendData = [
    { name: "Jan", sequestration: totalSequestration * 0.7 || 8.5 },
    { name: "Feb", sequestration: totalSequestration * 0.8 || 10.2 },
    { name: "Mar", sequestration: totalSequestration * 0.85 || 12.0 },
    { name: "Apr", sequestration: totalSequestration * 0.9 || 14.5 },
    { name: "May", sequestration: totalSequestration * 0.95 || 16.8 },
    { name: "Jun", sequestration: totalSequestration || 18.5 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="NDVI Carbon Credit Auditor"
        subtitle="Trigger spectral NDVI audits via satellite, calculate carbon offsets, and manage on-chain credit allocations."
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          label="Total Scanned Green Canopy"
          value={`${totalHectares} Hectares`}
          color="brand"
          icon={IconLeaf}
        />
        <MetricCard
          label="CO2 Sequestration Equivalent"
          value={`${totalSequestration} Tons`}
          color="green"
          icon={IconActivity}
        />
        <MetricCard
          label="ERC-20 Credits Minted"
          value={`${totalCredits} Credits`}
          color="gold"
          icon={IconCoins}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carbon Registry Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b">
            <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              Green Canopy & Credit Registry
            </h3>
            <button
              onClick={fetchCarbonParcels}
              className="p-1 text-slate-400 hover:text-brand hover:bg-slate-50 rounded-element transition-all cursor-pointer"
              title="Reload database"
            >
              <IconRefresh className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400 font-body">Loading carbon registry...</div>
          ) : parcels.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-element space-y-3">
              <IconAlertCircle className="w-8 h-8 text-gold mx-auto stroke-[1.5]" />
              <p className="text-xs text-slate-500 font-body">
                No carbon parcels registered. Perform an NDVI satellite audit on an agricultural parcel to initialize.
              </p>
              <button
                onClick={() => handleNDVIAudit("PARCEL-4902-881")}
                className="px-3.5 py-1.5 bg-brand hover:bg-brand-mid text-white text-[10px] font-heading font-extrabold uppercase rounded-element cursor-pointer"
              >
                Scan Seed Parcel PARCEL-881
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto border-[0.5px] border-slate-200 dark:border-slate-800 rounded-element">
              <table className="w-full text-left text-xs font-body border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">Parcel ID</th>
                    <th className="p-3">Landowner</th>
                    <th className="p-3 text-center">Canopy Size</th>
                    <th className="p-3 text-center font-semibold">Credits</th>
                    <th className="p-3">Last Checked</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parcels.map((parcel) => (
                    <tr key={parcel.id} className="border-b border-slate-150 dark:border-slate-800/80">
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-350">
                        {parcel.parcelId}
                      </td>
                      <td className="p-3 font-semibold text-slate-600 dark:text-slate-400">
                        {parcel.property?.owner?.name || "N/A"}
                      </td>
                      <td className="p-3 text-center text-slate-500">{parcel.greenCoverHectares} ha</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          parcel.creditsIssued > 0 ? "bg-green-light text-green" : "bg-red-light text-red"
                        }`}>
                          {parcel.creditsIssued} CR
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-[10px]">
                        {new Date(parcel.lastVerified).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleNDVIAudit(parcel.parcelId)}
                            disabled={auditingParcelId === parcel.parcelId}
                            className="flex items-center gap-0.5 px-2.5 py-1 bg-brand-light hover:bg-brand text-brand hover:text-white text-[10px] font-heading font-extrabold uppercase rounded-element transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <IconRefresh className={`w-3.5 h-3.5 ${auditingParcelId === parcel.parcelId ? "animate-spin" : ""}`} />
                            Audit
                          </button>
                          {parcel.creditsIssued > 0 && (
                            <button
                              onClick={() => handleRevokeCredits(parcel.parcelId)}
                              className="flex items-center gap-0.5 px-2.5 py-1 bg-red-light hover:bg-red text-red hover:text-white text-[10px] font-heading font-extrabold uppercase rounded-element transition-colors cursor-pointer"
                            >
                              <IconTrash className="w-3.5 h-3.5" />
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Sequestration area chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            Green Sequestration Growth
          </h3>
          <div className="h-60 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSequestration" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B6D11" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B6D11" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tickLine={false} tickMargin={6} stroke="#94a3b8" style={{ fontSize: "9px" }} />
                <YAxis tickLine={false} tickMargin={6} stroke="#94a3b8" style={{ fontSize: "9px" }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="sequestration"
                  stroke="#3B6D11"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSequestration)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-slate-400 leading-relaxed font-body">
            NDVI captures differences in green canopy index, enabling automatic estimation of sequestered CO2 equivalents under the Kyoto protocol guidelines.
          </div>
        </div>
      </div>
    </div>
  );
}
