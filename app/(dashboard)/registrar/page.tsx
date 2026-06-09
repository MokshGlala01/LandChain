"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { transferPropertyOnChain } from "@/lib/blockchain";
import {
  IconGavel,
  IconCheck,
  IconX,
  IconFolderOpen,
  IconLoader2,
  IconAlertTriangle,
  IconHistory,
  IconTrendingUp,
} from "@tabler/icons-react";

import MetricCard from "@/components/dashboard/MetricCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import PageHeader from "@/components/dashboard/PageHeader";

interface Transfer {
  id: string;
  propertyId: string;
  fromOwnerId: string;
  toOwnerId: string;
  stampDuty: number;
  status: string;
  initiatedAt: string;
  fraudScore: number;
  property: {
    parcelId: string;
    surveyNumber: string;
    location: string;
    ipfsHash: string;
  };
}

export default function RegistrarPanel() {
  const { user, walletAddress } = useAuth();
  const router = useRouter();

  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Statistics
  const [stats, setStats] = useState({
    pending: 3,
    completedToday: 5,
    fraudAlerts: 1,
    totalRegistered: 48,
  });

  const loadPendingQueue = async () => {
    try {
      const res = await fetch("/api/property");
      if (res.ok) {
        const propertiesData = await res.json();
        
        // Convert to transfers queue list
        const queue: Transfer[] = [];
        propertiesData.forEach((p: any) => {
          if (p.transfers && p.transfers.length > 0) {
            p.transfers.forEach((t: any) => {
              if (t.status === "PENDING") {
                queue.push({
                  ...t,
                  fraudScore: Math.floor(Math.random() * 95), // simulate fraud scores
                  property: {
                    parcelId: p.parcelId,
                    surveyNumber: p.surveyNumber,
                    location: p.location,
                    ipfsHash: p.ipfsHash,
                  },
                });
              }
            });
          }
        });

        // Sort by initiatedAt ASC
        queue.sort((a, b) => new Date(a.initiatedAt).getTime() - new Date(b.initiatedAt).getTime());

        // Seed mock pending transfer if empty to keep dashboard active
        if (queue.length === 0) {
          queue.push({
            id: "tr-mock-1",
            propertyId: "prop-1",
            fromOwnerId: "usr-1",
            toOwnerId: "usr-2",
            stampDuty: 240000,
            status: "PENDING",
            initiatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            fraudScore: 22,
            property: {
              parcelId: "PARCEL-4902-881",
              surveyNumber: "SURVEY-409/2",
              location: "Sector 15, Noida, UP",
              ipfsHash: "QmYwAPJzs5xx2mabX4uX7yXQG143uXG28892hH2",
            },
          });
          queue.push({
            id: "tr-mock-2",
            propertyId: "prop-2",
            fromOwnerId: "usr-3",
            toOwnerId: "usr-4",
            stampDuty: 85000,
            status: "PENDING",
            initiatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            fraudScore: 82,
            property: {
              parcelId: "PARCEL-1002-880",
              surveyNumber: "SURVEY-101/A",
              location: "Sector 62, Noida, UP",
              ipfsHash: "QmYwAPJzs5xx2mabX4uX7yXQG143uXG28892hH2",
            },
          });
        }

        setTransfers(queue);
        setStats({
          pending: queue.length,
          completedToday: 5,
          fraudAlerts: queue.filter((t) => t.fraudScore > 70).length,
          totalRegistered: propertiesData.length || 48,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "REGISTRAR") {
      loadPendingQueue();
    }
  }, [user]);

  const handleApprove = async (tx: Transfer) => {
    if (!walletAddress) {
      toast.error("Please connect your Web3 wallet to authorize smart contract registry edits.");
      return;
    }

    setActionId(tx.id);
    try {
      const mockRecipientWallet = "0x" + Math.random().toString(16).substring(2, 42);
      const blockchainTx = await transferPropertyOnChain(tx.property.parcelId, mockRecipientWallet);

      const res = await fetch("/api/transfer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transferId: tx.id,
          status: "APPROVED",
          txHash: blockchainTx,
          registrarId: user?.id,
        }),
      });

      if (res.ok) {
        toast.success(`Transfer for ${tx.property.parcelId} approved and mutation committed on-chain.`);
        loadPendingQueue();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to update record.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during approval transaction.");
    } finally {
      setActionId(null);
    }
  };

  const handleRejectTrigger = (tx: Transfer) => {
    setSelectedTransfer(tx);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedTransfer || !rejectReason.trim()) return;

    setActionId(selectedTransfer.id);
    setRejectModalOpen(false);
    try {
      const res = await fetch("/api/transfer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transferId: selectedTransfer.id,
          status: "REJECTED",
          reason: rejectReason,
          registrarId: user?.id,
        }),
      });

      if (res.ok) {
        toast.success(`Transfer for ${selectedTransfer.property.parcelId} rejected.`);
        loadPendingQueue();
      } else {
        toast.error("Failed to reject transfer.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setActionId(null);
      setSelectedTransfer(null);
    }
  };

  const handleBulkApprove = async () => {
    const lowRiskIds = selectedIds.filter((id) => {
      const tx = transfers.find((t) => t.id === id);
      return tx && tx.fraudScore < 30;
    });

    if (lowRiskIds.length === 0) {
      toast.error("No low-risk properties selected. Bulk action only validates low-risk items (<30 score).");
      return;
    }

    toast.info(`Bulk approving ${lowRiskIds.length} low-risk mutation requests...`);
    for (const id of lowRiskIds) {
      const tx = transfers.find((t) => t.id === id);
      if (tx) {
        await handleApprove(tx);
      }
    }
    setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getFraudPillColor = (score: number) => {
    if (score < 30) return "bg-green-light text-green border-green/20";
    if (score <= 75) return "bg-gold-light text-gold border-gold/20";
    return "bg-red-light text-red border-red/20";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrar Approvals Queue"
        subtitle="Manage pending land ownership mutations, audit legal deeds, and authorize ledger writes."
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Pending Approvals" value={stats.pending} color="gold" icon={IconGavel} />
        <MetricCard label="Completed Today" value={stats.completedToday} color="brand" icon={IconCheck} />
        <MetricCard label="Dispute Warning Logs" value={stats.fraudAlerts} color="red" icon={IconAlertTriangle} />
        <MetricCard label="Total Noida Index" value={stats.totalRegistered} color="purple" icon={IconTrendingUp} />
      </div>

      {/* Approvals Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex justify-between items-center pb-2">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            Approvals Priority Queue
          </h3>

          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkApprove}
              className="px-4 py-2 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer transition-colors"
            >
              Bulk Approve Low-Risk
            </button>
          )}
        </div>

        <div className="overflow-x-auto border-[0.5px] border-slate-200 dark:border-slate-800 rounded-element">
          <table className="w-full text-left text-xs font-body border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="p-3 text-center w-10">Select</th>
                <th className="p-3">Property</th>
                <th className="p-3">Seller (From)</th>
                <th className="p-3">Buyer (To)</th>
                <th className="p-3">Stamp Duty</th>
                <th className="p-3">Initiated</th>
                <th className="p-3 text-center">Fraud Score</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Loading queue details...
                  </td>
                </tr>
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No pending mutations in this division.
                  </td>
                </tr>
              ) : (
                transfers.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-150 dark:border-slate-800/80">
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(tx.id)}
                        onChange={() => toggleSelect(tx.id)}
                        className="rounded text-brand focus:ring-brand cursor-pointer"
                      />
                    </td>
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-brand">{tx.property.parcelId}</span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">{tx.property.location}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-500">{tx.fromOwnerId.substring(0, 12)}...</td>
                    <td className="p-3 font-mono text-[10px] text-slate-500">{tx.toOwnerId.substring(0, 12)}...</td>
                    <td className="p-3 font-bold text-slate-750">₹{tx.stampDuty.toLocaleString()}</td>
                    <td className="p-3 text-slate-400">{new Date(tx.initiatedAt).toLocaleDateString()}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 border-[0.5px] rounded-pill text-[10px] font-extrabold uppercase ${getFraudPillColor(tx.fraudScore)}`}>
                        {tx.fraudScore}
                      </span>
                    </td>
                    <td className="p-3 flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedTransfer(tx);
                          setDrawerOpen(true);
                        }}
                        className="p-1.5 bg-gray-50 border border-slate-200 dark:border-slate-800 rounded-element hover:bg-slate-100 cursor-pointer text-slate-600"
                        title="View Documents"
                      >
                        <IconFolderOpen className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleApprove(tx)}
                        disabled={actionId !== null}
                        className="p-1.5 bg-brand-light text-brand dark:bg-brand-dark/30 dark:text-brand-mid rounded-element hover:bg-brand hover:text-white cursor-pointer transition-colors"
                        title="Approve Mutation"
                      >
                        {actionId === tx.id ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <IconCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleRejectTrigger(tx)}
                        disabled={actionId !== null}
                        className="p-1.5 bg-red-light text-red rounded-element hover:bg-red hover:text-white cursor-pointer transition-colors"
                        title="Reject Mutation"
                      >
                        <IconX className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Documents Drawer */}
      {drawerOpen && selectedTransfer && (
        <div className="fixed inset-y-0 right-0 w-[340px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 z-50 shadow-2xl p-6 flex flex-col justify-between font-body text-xs">
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-heading font-extrabold text-sm text-slate-700 dark:text-slate-150 uppercase tracking-wider">
                Title Deed Documents
              </h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-element space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Deed IPFS CID</span>
                  <span className="font-mono font-bold text-brand select-all">{selectedTransfer.property.ipfsHash}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Survey Number</span>
                  <span className="font-semibold text-slate-700">{selectedTransfer.property.surveyNumber}</span>
                </div>
              </div>

              {/* IPFS Doc Preview Mock */}
              <div className="w-full h-44 bg-slate-50 border border-slate-200 rounded-element flex flex-col items-center justify-center text-center p-4 gap-2">
                <IconFolderOpen className="w-8 h-8 text-slate-400 stroke-[1.2]" />
                <span className="text-[10px] font-bold text-slate-600">Land_Mutation_Deed_Signed.pdf</span>
                <button
                  onClick={() => toast.success("Opening PDF deed from IPFS gate...")}
                  className="text-[9px] text-brand font-bold uppercase hover:underline"
                >
                  View full document
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setDrawerOpen(false);
                handleApprove(selectedTransfer);
              }}
              className="flex-1 py-2 bg-brand text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer text-center"
            >
              Approve Deed
            </button>
            <button
              onClick={() => {
                setDrawerOpen(false);
                handleRejectTrigger(selectedTransfer);
              }}
              className="flex-1 py-2 bg-red-light text-red text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer text-center"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal dialog */}
      {rejectModalOpen && selectedTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="max-w-sm w-full bg-white dark:bg-[#030806] rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 p-6 space-y-4 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-heading font-extrabold text-sm text-slate-700">Reject mutation request</h3>
              <button onClick={() => setRejectModalOpen(false)} className="text-xs text-slate-400 hover:text-slate-600 font-bold">×</button>
            </div>

            <div className="space-y-3 font-body">
              <div className="p-3 bg-red-50/50 border border-red-100 rounded-element text-[10px] text-red flex gap-2">
                <IconAlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Rejecting mutation flags the asset in user logs. Filer receives official rejection reason email.</span>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Rejection Reason</label>
                <textarea
                  placeholder="Enter detailed reason for deed rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full h-24 px-3 py-2 text-xs bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="w-1/3 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-heading font-extrabold rounded-element cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleRejectConfirm}
                className="flex-grow py-2 bg-red text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
