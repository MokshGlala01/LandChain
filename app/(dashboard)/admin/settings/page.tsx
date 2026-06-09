"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconSettings,
  IconDatabase,
  IconUserCheck,
  IconCpu,
  IconCloud,
  IconClock,
  IconCheck,
  IconRefresh,
  IconCopy,
} from "@tabler/icons-react";

interface CircleRate {
  id: string;
  state: string;
  district: string;
  propertyType: string;
  ratePerSqft: number;
  year: number;
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [circleRates, setCircleRates] = useState<CircleRate[]>([
    { id: "cr-1", state: "Uttar Pradesh", district: "Noida", propertyType: "Residential", ratePerSqft: 3500, year: 2026 },
    { id: "cr-2", state: "Uttar Pradesh", district: "Noida", propertyType: "Commercial", ratePerSqft: 7500, year: 2026 },
  ]);

  const [users, setUsers] = useState([
    { id: "usr-1", name: "Rohan Sharma", email: "rohan.sharma@example.com", role: "CITIZEN" },
    { id: "usr-2", name: "Amit Kumar", email: "amit.kumar@gov.in", role: "REGISTRAR" },
    { id: "usr-3", name: "SBI Verifier", email: "verifier.sbi@sbi.co.in", role: "BANK" },
  ]);

  const [ping, setPing] = useState(12); // ms
  const [syncing, setSyncing] = useState(false);

  // Auto-ping simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setPing(Math.floor(10 + Math.random() * 8));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveRate = (id: string, newRate: number) => {
    setCircleRates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ratePerSqft: newRate } : c))
    );
    toast.success("Circle rate updated in database.");
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast.success(`User role adjusted to ${newRole}`);
  };

  const handleForceSync = () => {
    setSyncing(true);
    toast.info("Initializing force block synchronization...");
    setTimeout(() => {
      setSyncing(false);
      toast.success("State sync completed. Block #4902188 mapped.");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <IconSettings className="w-6 h-6 text-brand" />
          System Settings & Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-body">
          Define circle rates, manage user roles, audit contract sync health, and configure IPFS gateway nodes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-body text-xs">
        {/* Circle Rates Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <IconDatabase className="w-4 h-4 text-brand" />
            Noida Circle Rates Matrix
          </h3>

          <div className="overflow-x-auto border-[0.5px] border-slate-200 dark:border-slate-800 rounded-element">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">District</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">Rate / Sq Ft</th>
                  <th className="p-3 text-center">Save</th>
                </tr>
              </thead>
              <tbody>
                {circleRates.map((c) => (
                  <tr key={c.id} className="border-b border-slate-150 dark:border-slate-800/80">
                    <td className="p-3 font-semibold text-slate-700">{c.district}</td>
                    <td className="p-3 text-slate-500">{c.propertyType}</td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        defaultValue={c.ratePerSqft}
                        onBlur={(e) => handleSaveRate(c.id, parseInt(e.target.value))}
                        className="w-20 text-right px-2 py-1 bg-gray-50 border border-slate-200 rounded-element focus:outline-none focus:border-brand font-mono font-bold"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toast.success("Circle rate saved successfully.")}
                        className="p-1 bg-brand-light text-brand hover:bg-brand hover:text-white rounded-element transition-colors cursor-pointer"
                      >
                        <IconCheck className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User permissions */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <IconUserCheck className="w-4 h-4 text-brand" />
            User Access Roles
          </h3>

          <div className="space-y-3 leading-normal">
            {users.map((u) => (
              <div key={u.id} className="p-3 border border-slate-100 rounded-element flex justify-between items-center gap-2">
                <div>
                  <span className="font-bold text-slate-750 block">{u.name}</span>
                  <span className="text-[10px] text-slate-450 block truncate max-w-[120px]">{u.email}</span>
                </div>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className="px-2 py-1 text-[10px] bg-gray-50 border border-slate-200 rounded-element"
                >
                  <option value="CITIZEN">Citizen</option>
                  <option value="REGISTRAR">Registrar</option>
                  <option value="BANK">Bank</option>
                  <option value="ADMIN">Admin</option>
                  <option value="BUILDER">Builder</option>
                  <option value="AGRI">Agricultural</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-body text-xs">
        {/* Blockchain health */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <IconCpu className="w-4 h-4 text-brand" />
            Blockchain Node Sync Health
          </h3>

          <div className="space-y-3 font-body">
            <div className="flex justify-between py-1.5 border-b">
              <span>Node Latency:</span>
              <span className="text-green font-bold font-mono">{ping} ms</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span>Last Synced Block:</span>
              <span className="font-mono">#4,902,188</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span>Sync Status:</span>
              <span className="text-green font-bold">MUTED (100% Synced)</span>
            </div>
            <button
              onClick={handleForceSync}
              disabled={syncing}
              className="w-full py-2 bg-slate-850 hover:bg-slate-950 text-slate-200 text-xs font-heading font-extrabold uppercase rounded-element flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              {syncing ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <IconRefresh className="w-4 h-4" />}
              Force Re-sync State
            </button>
          </div>
        </div>

        {/* IPFS Gateway */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <IconCloud className="w-4 h-4 text-brand" />
            IPFS Storage Node
          </h3>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Gateway URL</label>
              <select className="w-full px-3 py-2 text-xs bg-gray-50 border border-slate-200 rounded-element focus:outline-none">
                <option>Pinata Gateway (https://gateway.pinata.cloud)</option>
                <option>Infura Gateway (https://ipfs.infura.io)</option>
                <option>Local Node Gateway (http://localhost:5001)</option>
              </select>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-element leading-relaxed text-[10px] text-slate-500">
              IPFS coordinates decentralized metadata mappings. Selecting gateways modifies document resolution times on drawers.
            </div>
          </div>
        </div>

        {/* Cron jobs */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <IconClock className="w-4 h-4 text-brand" />
            System Cron Scheduler
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-2.5 border border-slate-100 rounded-element">
              <div>
                <span className="font-bold text-slate-700 block">NDVI Satellite check</span>
                <span className="text-[9px] text-slate-400 font-mono">*/5 * * * *</span>
              </div>
              <button
                onClick={() => toast.success("NDVI checking sequence triggered manually.")}
                className="px-2 py-1 bg-gray-50 border border-slate-200 text-[9px] font-heading font-extrabold uppercase rounded-element hover:bg-slate-100 cursor-pointer"
              >
                Run
              </button>
            </div>

            <div className="flex justify-between items-center p-2.5 border border-slate-100 rounded-element">
              <div>
                <span className="font-bold text-slate-700 block">Court Litigation Sync</span>
                <span className="text-[9px] text-slate-400 font-mono">0 0 * * *</span>
              </div>
              <button
                onClick={() => toast.success("eCourts sync sequence triggered manually.")}
                className="px-2 py-1 bg-gray-50 border border-slate-200 text-[9px] font-heading font-extrabold uppercase rounded-element hover:bg-slate-100 cursor-pointer"
              >
                Run
              </button>
            </div>
          </div>
        </div>
      </div>
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
