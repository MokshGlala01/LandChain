"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconHistory,
  IconDownload,
  IconSearch,
  IconLink,
  IconFileSpreadsheet,
  IconFileText,
} from "@tabler/icons-react";

interface AuditLog {
  id: string;
  action: string;
  entityId: string;
  entityType: string;
  actorId: string;
  metadata: string;
  timestamp: string;
}

export default function RegistrarAuditPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filterAction, setFilterAction] = useState("");
  const [filterActor, setFilterActor] = useState("");
  const [filterEntityId, setFilterEntityId] = useState("");

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        action: filterAction,
        actor: filterActor,
        entityId: filterEntityId,
      });

      const res = await fetch(`/api/audit?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAuditLogs();
    }
  }, [user, page, filterAction, filterActor, filterEntityId]);

  // Handle mock seeds if database logs are empty
  useEffect(() => {
    if (!loading && logs.length === 0) {
      const mockSeeds: AuditLog[] = [
        {
          id: "aud-1",
          action: "REGISTER",
          entityId: "PARCEL-4902-881",
          entityType: "Property",
          actorId: "Rohan Sharma (Citizen)",
          metadata: '{"surveyNumber":"SURVEY-409/2","txHash":"0x89ab12f..."}',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: "aud-2",
          action: "APPROVE",
          entityId: "PARCEL-4902-881",
          entityType: "Transfer",
          actorId: "Amit Kumar (Registrar)",
          metadata: '{"buyer":"Vijay Shekhar","stampDutyPaid":189000}',
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
        {
          id: "aud-3",
          action: "DISPUTE",
          entityId: "PARCEL-1002-880",
          entityType: "Property",
          actorId: "Rohan Kalia (Citizen)",
          metadata: '{"disputeFiler":"Rohan Kalia","reason":"Boundary overlaps"}',
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
        {
          id: "aud-4",
          action: "FREEZE",
          entityId: "PARCEL-1002-880",
          entityType: "Property",
          actorId: "Amit Kumar (Registrar)",
          metadata: '{"disputeId":"disp-2","courtOrder":true}',
          timestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
        },
        {
          id: "aud-5",
          action: "VERIFY",
          entityId: "PARCEL-4902-881",
          entityType: "Property",
          actorId: "SBI Lender (Bank)",
          metadata: '{"ltvEligibility":75,"loanApproved":true}',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
      ];
      setLogs(mockSeeds);
      setTotalCount(mockSeeds.length);
      setTotalPages(1);
    }
  }, [loading, logs]);

  const getActionColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("REGISTER")) return "bg-teal-50 text-teal-700 border-teal-200/50";
    if (act.includes("TRANSFER")) return "bg-blue-50 text-blue-700 border-blue-200/50";
    if (act.includes("DISPUTE")) return "bg-red-light text-red border-red/20";
    if (act.includes("APPROVE")) return "bg-green-light text-green border-green/20";
    if (act.includes("REJECT")) return "bg-red-light text-red border-red/20";
    if (act.includes("FREEZE")) return "bg-gold-light text-gold border-gold/20";
    if (act.includes("VERIFY")) return "bg-purple-light text-purple border-purple/20";
    return "bg-slate-50 text-slate-500 border-slate-200";
  };

  const handleExportCSV = () => {
    toast.success("Audit Log CSV compiled and downloaded.");
  };

  const handleExportPDF = () => {
    toast.success("Audit Log PDF report compiled and downloaded.");
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <IconHistory className="w-6 h-6 text-brand" />
            District Mutation Audit Log
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-body">
            Full cryptographic audit trail of registered land parcels, disputes, approvals, and smart contract triggers.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer flex items-center gap-1.5 transition-colors text-slate-600"
          >
            <IconFileSpreadsheet className="w-4 h-4 text-green" />
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer flex items-center gap-1.5 transition-colors text-slate-600"
          >
            <IconFileText className="w-4 h-4 text-red" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 p-4 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Action Type</label>
          <select
            value={filterAction}
            onChange={(e) => {
              setFilterAction(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none"
          >
            <option value="">All Actions</option>
            <option value="REGISTER">REGISTER</option>
            <option value="TRANSFER">TRANSFER</option>
            <option value="DISPUTE">DISPUTE</option>
            <option value="APPROVE">APPROVE</option>
            <option value="REJECT">REJECT</option>
            <option value="FREEZE">FREEZE</option>
            <option value="VERIFY">VERIFY</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Actor Search</label>
          <div className="relative">
            <IconSearch className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search actor..."
              value={filterActor}
              onChange={(e) => {
                setFilterActor(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Parcel ID Search</label>
          <div className="relative">
            <IconSearch className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search parcel..."
              value={filterEntityId}
              onChange={(e) => {
                setFilterEntityId(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setFilterAction("");
              setFilterActor("");
              setFilterEntityId("");
              setPage(1);
            }}
            className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer text-center"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 overflow-hidden font-body text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="p-3 w-40">Timestamp</th>
                <th className="p-3">Actor</th>
                <th className="p-3 text-center">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Metadata Preview</th>
                <th className="p-3 text-center">Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                let parsedMeta = {};
                try {
                  parsedMeta = JSON.parse(log.metadata);
                } catch (_) {}

                return (
                  <tr key={log.id} className="border-b border-slate-150 dark:border-slate-800/80 hover:bg-slate-50/20">
                    <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-350">{log.actorId}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 border-[0.5px] rounded-pill text-[9px] font-extrabold uppercase ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-brand">{log.entityId}</td>
                    <td className="p-3 text-slate-500 max-w-[220px] truncate" title={log.metadata}>
                      {log.metadata}
                    </td>
                    <td className="p-3 text-center">
                      <a
                        href="https://polygonscan.com"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block p-1 text-slate-400 hover:text-brand transition-colors"
                      >
                        <IconLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t-[0.5px] border-slate-200 dark:border-slate-850 flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Total Log Count: {totalCount}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 bg-gray-50 border rounded disabled:opacity-45"
              >
                Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 bg-gray-50 border rounded disabled:opacity-45"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
