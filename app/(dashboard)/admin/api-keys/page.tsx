"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconKey,
  IconPlus,
  IconCopy,
  IconTrash,
  IconTrendingUp,
  IconCheck,
  IconChevronRight,
  IconBook,
  IconTerminal,
  IconCode,
} from "@tabler/icons-react";

interface ApiKey {
  id: string;
  institutionName: string;
  role: string;
  dailyLimit: number;
  usageCount: number;
  active: boolean;
  createdAt: string;
}

export default function AdminApiKeysPage() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [instName, setInstName] = useState("");
  const [selectedRole, setSelectedRole] = useState("READ_ONLY");
  const [limit, setLimit] = useState(1000);

  const [loading, setLoading] = useState(false);
  const [createdKeyDetails, setCreatedKeyDetails] = useState<{ rawKey: string } | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"keys" | "docs">("keys");
  const [docTab, setDocTab] = useState<"rest" | "graphql" | "webhooks">("rest");

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/admin/api-keys");
      if (res.ok) {
        const data = await res.json();
        setKeys(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  // Handle mock key seeds if empty
  useEffect(() => {
    if (keys.length === 0) {
      setKeys([
        {
          id: "key-1",
          institutionName: "State Bank of India (SBI)",
          role: "READ_ONLY",
          dailyLimit: 5000,
          usageCount: 1840,
          active: true,
          createdAt: "2026-06-01",
        },
        {
          id: "key-2",
          institutionName: "HDFC Home Loans Division",
          role: "FULL",
          dailyLimit: 2500,
          usageCount: 840,
          active: true,
          createdAt: "2026-06-03",
        },
      ]);
    }
  }, [keys]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institutionName: instName, role: selectedRole, dailyLimit: limit }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedKeyDetails(data);
        setDetailsModalOpen(true);
        setInstName("");
        setLimit(1000);
        fetchKeys();
        toast.success("API Key successfully generated.");
      } else {
        toast.error("Failed to generate API Key.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleKey = async (id: string, active: boolean) => {
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !active }),
      });
      if (res.ok) {
        toast.success("API Key status updated.");
        fetchKeys();
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/api-keys?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("API Key revoked.");
        fetchKeys();
      }
    } catch (err) {
      toast.error("Failed to revoke key.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API Key copied securely.");
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <IconKey className="w-6 h-6 text-brand" />
            External API Gateway Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-body">
            Manage institutional client credentials, set rate limiting, and review developer OpenAPI documentations.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("keys")}
            className={`px-3 py-1.5 text-xs font-heading font-extrabold rounded-element cursor-pointer transition-colors ${
              activeTab === "keys" ? "bg-brand text-white" : "bg-white border border-slate-200 text-slate-600"
            }`}
          >
            Credential Manager
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`px-3 py-1.5 text-xs font-heading font-extrabold rounded-element cursor-pointer transition-colors ${
              activeTab === "docs" ? "bg-brand text-white" : "bg-white border border-slate-200 text-slate-600"
            }`}
          >
            API Documentation
          </button>
        </div>
      </div>

      {activeTab === "keys" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-body text-xs">
          {/* Add Key Form */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              Generate External API Key
            </h3>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Institution Name</label>
                <input
                  type="text"
                  placeholder="e.g. State Bank of India"
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Access Scope</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element"
                >
                  <option value="READ_ONLY">READ ONLY (Query ledger records)</option>
                  <option value="FULL">FULL (Request mutation writes)</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Daily Rate Limit:</span>
                  <span className="text-brand">{limit} req/day</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={10000}
                  step={100}
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="w-full accent-brand cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <IconPlus className="w-4 h-4" />
                Generate Key
              </button>
            </form>
          </div>

          {/* Keys list */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              Active Client Credentials
            </h3>

            <div className="overflow-x-auto border-[0.5px] border-slate-200 dark:border-slate-800 rounded-element">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">Client Institution</th>
                    <th className="p-3">Access Level</th>
                    <th className="p-3 text-center">Daily Quota</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Revoke</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => {
                    const usagePercent = Math.round((k.usageCount / k.dailyLimit) * 100);
                    return (
                      <tr key={k.id} className="border-b border-slate-150 dark:border-slate-800/80 hover:bg-slate-50/10">
                        <td className="p-3">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-700">{k.institutionName}</span>
                            <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-brand" style={{ width: `${usagePercent}%` }}></div>
                            </div>
                            <span className="text-[8px] text-slate-400 block">{k.usageCount} / {k.dailyLimit} calls used</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-element text-[9px] font-bold uppercase ${
                            k.role === "FULL" ? "bg-purple-light text-purple" : "bg-slate-100 text-slate-500"
                          }`}>
                            {k.role}
                          </span>
                        </td>
                        <td className="p-3 text-center font-semibold text-slate-650">{k.dailyLimit} reqs</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleToggleKey(k.id, k.active)}
                            className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-pill border-[0.5px] cursor-pointer ${
                              k.active ? "bg-green-light text-green border-green/20" : "bg-gray-150 text-gray-500 border-slate-200"
                            }`}
                          >
                            {k.active ? "Active" : "Paused"}
                          </button>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteKey(k.id)}
                            className="p-1.5 bg-red-light text-red hover:bg-red hover:text-white rounded-element cursor-pointer transition-colors"
                            title="Revoke key"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-6 font-body text-xs">
          {/* Docs tabs */}
          <div className="flex border-b border-slate-100 pb-2 gap-4">
            <button
              onClick={() => setDocTab("rest")}
              className={`pb-1 font-heading font-extrabold uppercase text-[10px] tracking-wider cursor-pointer border-b-2 transition-all ${
                docTab === "rest" ? "border-brand text-brand" : "border-transparent text-slate-400"
              }`}
            >
              REST endpoints
            </button>
            <button
              onClick={() => setDocTab("graphql")}
              className={`pb-1 font-heading font-extrabold uppercase text-[10px] tracking-wider cursor-pointer border-b-2 transition-all ${
                docTab === "graphql" ? "border-brand text-brand" : "border-transparent text-slate-400"
              }`}
            >
              GraphQL endpoint
            </button>
            <button
              onClick={() => setDocTab("webhooks")}
              className={`pb-1 font-heading font-extrabold uppercase text-[10px] tracking-wider cursor-pointer border-b-2 transition-all ${
                docTab === "webhooks" ? "border-brand text-brand" : "border-transparent text-slate-400"
              }`}
            >
              Webhooks schema
            </button>
          </div>

          <div className="space-y-4">
            {docTab === "rest" && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-element border-[0.5px]">
                  <div className="flex items-center gap-2 mb-2 font-mono">
                    <span className="px-1.5 py-0.5 bg-brand text-white font-bold rounded-element text-[9px]">GET</span>
                    <span className="font-semibold">/api/v1/property/[parcelId]</span>
                  </div>
                  <p className="text-slate-500 mb-3 text-[11px]">Fetch complete ownership registry specifications, encumbrance history logs, and computed fraud scores.</p>
                  <pre className="p-3 bg-slate-950 text-slate-300 rounded font-mono text-[9px]">
{`Header:
  x-api-key: pk_f890289ab7e12...
Response:
  {
    "parcelId": "PARCEL-4902-881",
    "owner": "Rohan Sharma",
    "encumbered": false,
    "valuation": 3200000,
    "fraudScore": 18
  }`}
                  </pre>
                </div>
              </div>
            )}

            {docTab === "graphql" && (
              <div className="p-4 bg-slate-50 rounded-element border-[0.5px]">
                <div className="flex items-center gap-2 mb-2 font-mono">
                  <span className="px-1.5 py-0.5 bg-purple text-white font-bold rounded-element text-[9px]">POST</span>
                  <span className="font-semibold">/api/v1/graphql</span>
                </div>
                <pre className="p-3 bg-slate-950 text-slate-300 rounded font-mono text-[9px]">
{`Query:
  query {
    property(parcelId: "PARCEL-4902-881") {
      surveyNumber
      location
      area
    }
  }`}
                </pre>
              </div>
            )}

            {docTab === "webhooks" && (
              <div className="p-4 bg-slate-50 rounded-element border-[0.5px] space-y-2">
                <span className="font-bold text-slate-700 block">Dispatch Payload Sample</span>
                <pre className="p-3 bg-slate-950 text-slate-300 rounded font-mono text-[9px]">
{`{
  "event": "ownership_change",
  "parcelId": "PARCEL-4902-881",
  "from": "0x3C44Cd...",
  "to": "0x49ab88..."
}`}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Copy key details once modal */}
      {detailsModalOpen && createdKeyDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#030806] rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 p-6 space-y-4 text-center">
            <div className="p-3 rounded-full bg-brand-light text-brand inline-block">
              <IconKey className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="font-heading font-extrabold text-base">API Key Generated</h2>
              <p className="text-xs text-slate-500 font-body leading-normal">
                Copy this key now. For safety, this key hash will not be displayed again.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-element flex justify-between items-center font-mono text-xs text-slate-700 select-all">
              <span className="truncate">{createdKeyDetails.rawKey}</span>
              <button
                onClick={() => copyToClipboard(createdKeyDetails.rawKey)}
                className="p-1 hover:text-brand transition-colors cursor-pointer shrink-0 ml-3"
              >
                <IconCopy className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setDetailsModalOpen(false)}
              className="w-full py-2.5 bg-brand text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer"
            >
              Done, saved copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
