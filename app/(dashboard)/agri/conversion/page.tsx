"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconTransform,
  IconCheck,
  IconX,
  IconCash,
  IconArrowRight,
  IconClock,
  IconScale,
  IconPlus,
} from "@tabler/icons-react";
import PageHeader from "@/components/dashboard/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";

interface ConversionRequest {
  id: string;
  parcelId: string;
  surveyNumber: string;
  ownerName: string;
  area: number;
  currentType: string;
  proposedType: string;
  status: "PENDING_TEHSILDAR" | "PENDING_COLLECTOR" | "PENDING_REVENUE" | "APPROVED" | "REJECTED";
  fee: number;
  paymentStatus: "UNPAID" | "PAID";
  submittedAt: string;
}

export default function LandConversionPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ConversionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form & Calculator states
  const [isAdding, setIsAdding] = useState(false);
  const [newParcelId, setNewParcelId] = useState("");
  const [newProposedType, setNewProposedType] = useState("Residential");

  // Interactive Fee Calculator state
  const [calcArea, setCalcArea] = useState("1.5");
  const [calcZone, setCalcZone] = useState("Commercial");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agri/conversion");
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error("Failed to load conversion queue", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject" | "pay") => {
    try {
      const res = await fetch("/api/agri/conversion", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });

      if (res.ok) {
        const updated = await res.json();
        if (action === "approve") {
          toast.success(`Request approved to next level: ${updated.status}`);
        } else if (action === "reject") {
          toast.error("Land conversion request rejected.");
        } else {
          toast.success("Payment status updated to PAID.");
        }
        fetchRequests();
      } else {
        const err = await res.json();
        toast.error(err.error || "Action failed");
      }
    } catch (err) {
      toast.error("Network error during action");
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/agri/conversion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parcelId: newParcelId,
          proposedType: newProposedType,
        }),
      });

      if (res.ok) {
        toast.success("Conversion request filed successfully in the blockchain queue.");
        setIsAdding(false);
        setNewParcelId("");
        fetchRequests();
      } else {
        const err = await res.json();
        toast.error(err.error || "Submission failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  // Fee calculation helper
  const getEstimatedFee = (area: number, zone: string) => {
    const baseRateMap: Record<string, number> = {
      Residential: 15000,
      Commercial: 35000,
      Industrial: 25000,
    };
    const rate = baseRateMap[zone] || 15000;
    return Math.ceil(area * rate);
  };

  const currentEstimatedFee = getEstimatedFee(parseFloat(calcArea) || 0, calcZone);

  // Status mapping UI helpers
  const getStagePercentage = (status: ConversionRequest["status"]) => {
    switch (status) {
      case "PENDING_TEHSILDAR":
        return 25;
      case "PENDING_COLLECTOR":
        return 50;
      case "PENDING_REVENUE":
        return 75;
      case "APPROVED":
        return 100;
      case "REJECTED":
        return 100;
      default:
        return 0;
    }
  };

  const getStageLabel = (status: ConversionRequest["status"]) => {
    switch (status) {
      case "PENDING_TEHSILDAR":
        return "Stage 1: Tehsildar Audit";
      case "PENDING_COLLECTOR":
        return "Stage 2: District Collector Clearance";
      case "PENDING_REVENUE":
        return "Stage 3: State Revenue Board";
      case "APPROVED":
        return "Approved & Blockchain Registered";
      case "REJECTED":
        return "Rejected / Mismatched Records";
    }
  };

  // Analytics metrics
  const activeQueueCount = requests.filter((r) => r.status !== "APPROVED" && r.status !== "REJECTED").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const pendingFeesCount = requests.filter((r) => r.paymentStatus === "UNPAID").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Non-Agricultural Land Conversion Pipeline"
        subtitle="Manage Section 143/80 agricultural-to-non-agricultural zoning requests through the regulatory pipeline."
        cta={
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer transition-colors"
          >
            <IconPlus className="w-4 h-4" />
            File Request
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          label="Active Pipeline Requests"
          value={activeQueueCount}
          color="brand"
          icon={IconClock}
        />
        <MetricCard
          label="Conversion Authorizations"
          value={approvedCount}
          color="green"
          icon={IconScale}
        />
        <MetricCard
          label="Unpaid Regulatory Fees"
          value={pendingFeesCount}
          color="red"
          icon={IconCash}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Queue Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            Zoning & Conversion Pipeline Queue
          </h3>

          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400 font-body">Loading pipeline requests...</div>
          ) : requests.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-400 font-body">No conversion requests registered in pipeline.</div>
          ) : (
            <div className="space-y-6">
              {requests.map((item) => {
                const percentage = getStagePercentage(item.status);
                const stageLabel = getStageLabel(item.status);
                
                return (
                  <div
                    key={item.id}
                    className="p-5 border border-slate-200 dark:border-slate-800 rounded-card space-y-4 font-body text-xs hover:border-slate-300 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-850">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-200 text-sm">
                            {item.parcelId}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">({item.surveyNumber})</span>
                        </div>
                        <p className="text-[10px] text-slate-405 mt-0.5">
                          Owner: <span className="font-semibold">{item.ownerName}</span> | Area: {item.area} ha
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className={`px-2 py-0.5 rounded-pill text-[9px] font-extrabold uppercase ${
                          item.paymentStatus === "PAID" ? "bg-green-light text-green" : "bg-red-light text-red"
                        }`}>
                          {item.paymentStatus}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          ₹{item.fee.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Progress Pipeline */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] uppercase font-heading font-extrabold">
                        <span className="text-slate-400">{stageLabel}</span>
                        <span className={item.status === "APPROVED" ? "text-green" : item.status === "REJECTED" ? "text-red" : "text-brand"}>
                          {percentage}%
                        </span>
                      </div>
                      
                      {/* Bar indicator */}
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            item.status === "APPROVED"
                              ? "bg-green"
                              : item.status === "REJECTED"
                              ? "bg-red"
                              : "bg-brand animate-pulse"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      {/* Level markers */}
                      <div className="grid grid-cols-4 text-[9px] text-slate-400 font-bold uppercase pt-1">
                        <span className={percentage >= 25 ? "text-brand dark:text-brand-mid" : ""}>Tehsildar</span>
                        <span className={percentage >= 50 ? "text-brand dark:text-brand-mid" : ""}>Collector</span>
                        <span className={percentage >= 75 ? "text-brand dark:text-brand-mid" : ""}>Revenue</span>
                        <span className={percentage === 100 ? (item.status === "APPROVED" ? "text-green" : "text-red") : ""}>Decision</span>
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 uppercase font-heading font-bold">Conversion Zone:</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded-element">
                          {item.currentType} → {item.proposedType}
                        </span>
                      </div>

                      {item.status !== "APPROVED" && item.status !== "REJECTED" && (
                        <div className="flex gap-2">
                          {item.paymentStatus === "UNPAID" && (
                            <button
                              onClick={() => handleAction(item.id, "pay")}
                              className="flex items-center gap-1 px-3 py-1 bg-green-light text-green text-[10px] font-heading font-extrabold uppercase rounded-element hover:bg-green hover:text-white transition-colors cursor-pointer"
                            >
                              <IconCash className="w-3.5 h-3.5" />
                              Approve Payment
                            </button>
                          )}

                          <button
                            onClick={() => handleAction(item.id, "reject")}
                            className="flex items-center gap-1 px-3 py-1 bg-red-light text-red text-[10px] font-heading font-extrabold uppercase rounded-element hover:bg-red hover:text-white transition-colors cursor-pointer"
                          >
                            <IconX className="w-3.5 h-3.5" />
                            Reject
                          </button>

                          <button
                            onClick={() => handleAction(item.id, "approve")}
                            className="flex items-center gap-1 px-3 py-1 bg-brand-light text-brand text-[10px] font-heading font-extrabold uppercase rounded-element hover:bg-brand hover:text-white transition-colors cursor-pointer"
                          >
                            <IconCheck className="w-3.5 h-3.5" />
                            {item.status === "PENDING_REVENUE" ? "Final Approve" : "Forward Stage"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Fee Calculator Estimator */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <IconTransform className="w-4 h-4 text-brand" />
              Conversion Fee Estimator
            </h3>

            <div className="space-y-4 text-xs font-body">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Land Area (Hectares)</label>
                <input
                  type="number"
                  step="0.1"
                  value={calcArea}
                  onChange={(e) => setCalcArea(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-slate-200 dark:border-slate-800 rounded-element focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Target Conversion Zone</label>
                <select
                  value={calcZone}
                  onChange={(e) => setCalcZone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-slate-200 dark:border-slate-800 rounded-element focus:outline-none"
                >
                  <option value="Residential">Residential Zone (Tax x1.5)</option>
                  <option value="Commercial">Commercial Zone (Tax x3.5)</option>
                  <option value="Industrial">Industrial Zone (Tax x2.5)</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-element space-y-2 border border-slate-100 dark:border-slate-850">
                <div className="flex justify-between">
                  <span className="text-slate-405">Base Levy:</span>
                  <span className="font-semibold text-slate-650">₹10,000 / ha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-405">Zoning Premium:</span>
                  <span className="font-semibold text-slate-650">
                    {calcZone === "Commercial" ? "₹35,000 / ha" : calcZone === "Industrial" ? "₹25,000 / ha" : "₹15,000 / ha"}
                  </span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between font-heading font-extrabold text-sm text-slate-800 dark:text-slate-200">
                  <span>Est. Fee Payable:</span>
                  <span className="text-brand">₹{currentEstimatedFee.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 leading-relaxed">
                * Estimations calculated according to the Land Revenue Code guidelines. Final rates may vary based on district circle rules and tehsil offsets.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Request Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
            <div className="border-b pb-3 flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-sm text-slate-800 dark:text-slate-100">
                File Land Conversion Request
              </h3>
              <button
                onClick={() => setIsAdding(false)}
                className="text-slate-450 hover:text-slate-700 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs font-body">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Agricultural Parcel ID</label>
                <input
                  type="text"
                  placeholder="e.g. PARCEL-4902-881"
                  value={newParcelId}
                  onChange={(e) => setNewParcelId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-slate-200 dark:border-slate-800 rounded-element focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Target Conversion Zone</label>
                <select
                  value={newProposedType}
                  onChange={(e) => setNewProposedType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-slate-200 dark:border-slate-800 rounded-element focus:outline-none"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>

              <div className="p-3 bg-brand-light/20 text-brand rounded-element text-[10px] leading-relaxed">
                By filing this form, you initialize the multi-stage governmental audit workflow. Fees must be approved and paid to proceed from Stage 1.
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
                  File Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
