"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconPlant,
  IconDroplet,
  IconActivity,
  IconUserCheck,
  IconEdit,
  IconPlus,
  IconCheck,
  IconChevronRight,
  IconSearch,
  IconFileSpreadsheet,
} from "@tabler/icons-react";
import PageHeader from "@/components/dashboard/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface CropRecord {
  season: string;
  crop: string;
  yieldTons: number;
}

interface AgriParcel {
  id: string;
  parcelId: string;
  soilType: string;
  irrigationSource: string;
  productivityScore: number;
  currentCrop: string | null;
  pmKisanBeneficiary: boolean;
  cropHistory: CropRecord[];
  property: {
    surveyNumber: string;
    area: number;
    location: string;
    owner: {
      name: string;
      phone: string;
    };
  } | null;
}

export default function AgriDashboard() {
  const { user } = useAuth();
  const [parcels, setParcels] = useState<AgriParcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Selection & Modal States
  const [selectedParcel, setSelectedParcel] = useState<AgriParcel | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Form states for update
  const [editSoilType, setEditSoilType] = useState("");
  const [editIrrigation, setEditIrrigation] = useState("");
  const [editCurrentCrop, setEditCurrentCrop] = useState("");
  const [editProductivity, setEditProductivity] = useState(5.0);
  const [editPmKisan, setEditPmKisan] = useState(false);

  // Form states for register new agri details
  const [newParcelId, setNewParcelId] = useState("");
  const [newSoilType, setNewSoilType] = useState("Alluvial Clay");
  const [newIrrigation, setNewIrrigation] = useState("Tubewell");
  const [newCurrentCrop, setNewCurrentCrop] = useState("Paddy");
  const [newProductivity, setNewProductivity] = useState(7.0);
  const [newPmKisan, setNewPmKisan] = useState(false);

  const fetchParcels = async (query = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agri/parcels?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setParcels(data);
        if (data.length > 0 && !selectedParcel) {
          setSelectedParcel(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load agricultural parcels", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchParcels(searchQuery);
  };

  const startEdit = (parcel: AgriParcel) => {
    setEditSoilType(parcel.soilType);
    setEditIrrigation(parcel.irrigationSource);
    setEditCurrentCrop(parcel.currentCrop || "");
    setEditProductivity(parcel.productivityScore);
    setEditPmKisan(parcel.pmKisanBeneficiary);
    setIsEditing(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcel) return;

    try {
      const res = await fetch("/api/agri/parcels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parcelId: selectedParcel.parcelId,
          soilType: editSoilType,
          irrigationSource: editIrrigation,
          currentCrop: editCurrentCrop,
          productivityScore: editProductivity,
          pmKisanBeneficiary: editPmKisan,
          cropHistory: selectedParcel.cropHistory,
        }),
      });

      if (res.ok) {
        toast.success(`Agricultural metrics updated for ${selectedParcel.parcelId}`);
        setIsEditing(false);
        fetchParcels(searchQuery);
      } else {
        const err = await res.json();
        toast.error(err.error || "Update failed");
      }
    } catch (err) {
      toast.error("Network error during update");
    }
  };

  const handleAddAgriDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/agri/parcels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parcelId: newParcelId,
          soilType: newSoilType,
          irrigationSource: newIrrigation,
          currentCrop: newCurrentCrop,
          productivityScore: newProductivity,
          pmKisanBeneficiary: newPmKisan,
          cropHistory: [
            { season: "Kharif 2024", crop: newCurrentCrop, yieldTons: 4.2 },
            { season: "Rabi 2024", crop: "Wheat", yieldTons: 3.5 },
          ],
        }),
      });

      if (res.ok) {
        toast.success(`Agricultural metadata initialized for ${newParcelId}`);
        setIsAdding(false);
        setNewParcelId("");
        fetchParcels(searchQuery);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to initialize details. Verify parcel ID.");
      }
    } catch (err) {
      toast.error("Network error while adding details");
    }
  };

  // Metrics
  const totalParcelsCount = parcels.length;
  const pmKisanBeneficiariesCount = parcels.filter((p) => p.pmKisanBeneficiary).length;
  const averageProductivity = parcels.length
    ? +(parcels.reduce((acc, p) => acc + p.productivityScore, 0) / parcels.length).toFixed(1)
    : 0;

  // Chart crop yield history mapping
  const chartData = selectedParcel?.cropHistory.map((item) => ({
    season: item.season,
    [item.crop]: item.yieldTons,
  })) || [
    { season: "Kharif 2024", Paddy: 4.5 },
    { season: "Rabi 2024", Wheat: 3.8 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agricultural Land Registry & Analytics"
        subtitle="Maintain soil structures, irrigation logs, PM-Kisan distribution eligibility, and crop yield analytics."
        cta={
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer transition-colors shadow-sm"
          >
            <IconPlus className="w-4 h-4" />
            Initialize Agri Parcel
          </button>
        }
      />

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          label="Registered Agri Parcels"
          value={totalParcelsCount}
          color="brand"
          icon={IconPlant}
        />
        <MetricCard
          label="Average Productivity Index"
          value={`${averageProductivity} / 10`}
          color="green"
          icon={IconActivity}
          trend={{ value: 4.2, isUp: true }}
        />
        <MetricCard
          label="PM-Kisan Beneficiaries"
          value={pmKisanBeneficiariesCount}
          color="gold"
          icon={IconUserCheck}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Parcel Selection & Search */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
                Agricultural Survey Database
              </h3>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Parcel ID or Location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-60 pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand"
                  />
                  <IconSearch className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-heading font-extrabold uppercase rounded-element transition-colors"
                >
                  Query
                </button>
              </form>
            </div>

            {loading ? (
              <div className="py-20 text-center text-xs text-slate-400 font-body">Loading agricultural registry...</div>
            ) : parcels.length === 0 ? (
              <div className="py-20 text-center text-xs text-slate-400 font-body">No agricultural parcels found matching search query.</div>
            ) : (
              <div className="overflow-x-auto border-[0.5px] border-slate-200 dark:border-slate-800 rounded-element">
                <table className="w-full text-left text-xs font-body border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3">Parcel ID</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Current Crop</th>
                      <th className="p-3 text-center">Productivity</th>
                      <th className="p-3 text-center">PM-Kisan</th>
                      <th className="p-3 text-center">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parcels.map((parcel) => (
                      <tr
                        key={parcel.id}
                        className={`border-b border-slate-150 dark:border-slate-800/80 cursor-pointer transition-all hover:bg-gray-50/50 dark:hover:bg-slate-800/10 ${
                          selectedParcel?.id === parcel.id ? "bg-brand-light/20 dark:bg-brand-dark/10" : ""
                        }`}
                        onClick={() => setSelectedParcel(parcel)}
                      >
                        <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-350">
                          {parcel.parcelId}
                        </td>
                        <td className="p-3 text-slate-500 truncate max-w-[150px]">
                          {parcel.property?.location || "N/A"}
                        </td>
                        <td className="p-3">
                          <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <IconPlant className="w-3.5 h-3.5 text-brand" />
                            {parcel.currentCrop || "Fallow"}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-brand">
                          {parcel.productivityScore}/10
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-pill text-[9px] font-extrabold uppercase ${
                              parcel.pmKisanBeneficiary ? "bg-green-light text-green" : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {parcel.pmKisanBeneficiary ? "Active" : "Ineligible"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button className="text-slate-400 hover:text-brand transition-colors">
                            <IconChevronRight className="w-4 h-4 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed View */}
        <div className="space-y-6">
          {selectedParcel ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-5 relative">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
                <div>
                  <h4 className="font-heading font-extrabold text-sm text-slate-800 dark:text-slate-200">
                    Parcel Details
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">{selectedParcel.parcelId}</span>
                </div>
                <button
                  onClick={() => startEdit(selectedParcel)}
                  className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-brand rounded-element transition-colors cursor-pointer"
                >
                  <IconEdit className="w-4 h-4" />
                </button>
              </div>

              {/* Stats Block */}
              <div className="grid grid-cols-2 gap-4 text-xs font-body">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-heading font-bold">Soil Composition</span>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{selectedParcel.soilType}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-heading font-bold">Irrigation Source</span>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <IconDroplet className="w-3.5 h-3.5 text-accent" />
                    {selectedParcel.irrigationSource}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-heading font-bold">Survey Number</span>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{selectedParcel.property?.surveyNumber || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-heading font-bold">Area Size</span>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    {selectedParcel.property ? +(selectedParcel.property.area / 107639).toFixed(2) : "0"} Hectares
                  </p>
                </div>
              </div>

              {/* Owner Block */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-element text-xs leading-normal">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-heading font-bold text-slate-400 uppercase text-[9px]">Landowner</span>
                  <span className="px-1.5 py-0.5 bg-brand-light text-brand text-[8px] font-extrabold uppercase rounded-element">Verified</span>
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedParcel.property?.owner?.name || "N/A"}
                </div>
                <div className="text-[10px] text-slate-405 mt-0.5">
                  Phone: {selectedParcel.property?.owner?.phone || "N/A"}
                </div>
              </div>

              {/* Yield Chart */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-heading font-bold block">Production Yield (Tons)</span>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="season" tickLine={false} tickMargin={6} stroke="#94a3b8" style={{ fontSize: "9px" }} />
                      <YAxis tickLine={false} tickMargin={6} stroke="#94a3b8" style={{ fontSize: "9px" }} />
                      <Tooltip contentStyle={{ fontSize: "10px" }} />
                      <Bar dataKey="Paddy" fill="#0F6E56" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Wheat" fill="#BA7517" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 text-center text-xs text-slate-450 font-body">
              Select a parcel from the database grid to inspect yield histories and edit soil/PM-Kisan configs.
            </div>
          )}
        </div>
      </div>

      {/* Initialize Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
            <div className="border-b pb-3 flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-sm text-slate-800 dark:text-slate-100">
                Initialize Agricultural Property
              </h3>
              <button
                onClick={() => setIsAdding(false)}
                className="text-slate-450 hover:text-slate-700 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAgriDetails} className="space-y-4 text-xs font-body">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Blockchain Parcel ID</label>
                <input
                  type="text"
                  placeholder="e.g. PARCEL-4902-881"
                  value={newParcelId}
                  onChange={(e) => setNewParcelId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-slate-200 dark:border-slate-800 rounded-element focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Soil Structure</label>
                  <select
                    value={newSoilType}
                    onChange={(e) => setNewSoilType(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-slate-200 dark:border-slate-800 rounded-element focus:outline-none"
                  >
                    <option value="Alluvial Clay">Alluvial Clay</option>
                    <option value="Black Cotton Soil">Black Cotton Soil</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                    <option value="Red Laterite">Red Laterite</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Irrigation Log</label>
                  <select
                    value={newIrrigation}
                    onChange={(e) => setNewIrrigation(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-slate-200 dark:border-slate-800 rounded-element focus:outline-none"
                  >
                    <option value="Tubewell & Canal">Tubewell & Canal</option>
                    <option value="Drip Irrigation">Drip Irrigation</option>
                    <option value="Rainfed">Rainfed</option>
                    <option value="River Canal System">River Canal System</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Current Crop</label>
                  <input
                    type="text"
                    value={newCurrentCrop}
                    onChange={(e) => setNewCurrentCrop(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-slate-200 dark:border-slate-800 rounded-element focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Productivity Score (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={newProductivity}
                    onChange={(e) => setNewProductivity(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-slate-200 dark:border-slate-800 rounded-element focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="newPmKisan"
                  checked={newPmKisan}
                  onChange={(e) => setNewPmKisan(e.target.checked)}
                  className="rounded border-slate-300 text-brand focus:ring-brand"
                />
                <label htmlFor="newPmKisan" className="text-[10px] uppercase font-heading font-bold text-slate-500">
                  Register as PM-Kisan Beneficiary
                </label>
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
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && selectedParcel && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
            <div className="border-b pb-3 flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-sm text-slate-800 dark:text-slate-100">
                Update Soil & Irrigation Logs
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-450 hover:text-slate-700 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs font-body">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400 block">Soil Type</label>
                <input
                  type="text"
                  value={editSoilType}
                  onChange={(e) => setEditSoilType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-slate-200 dark:border-slate-800 rounded-element focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400 block">Irrigation Source</label>
                <input
                  type="text"
                  value={editIrrigation}
                  onChange={(e) => setEditIrrigation(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-slate-200 dark:border-slate-800 rounded-element focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Current Crop</label>
                  <input
                    type="text"
                    value={editCurrentCrop}
                    onChange={(e) => setEditCurrentCrop(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-slate-200 dark:border-slate-800 rounded-element focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Productivity (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={editProductivity}
                    onChange={(e) => setEditProductivity(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-slate-200 dark:border-slate-800 rounded-element focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="editPmKisan"
                  checked={editPmKisan}
                  onChange={(e) => setEditPmKisan(e.target.checked)}
                  className="rounded border-slate-300 text-brand focus:ring-brand"
                />
                <label htmlFor="editPmKisan" className="text-[10px] uppercase font-heading font-bold text-slate-500">
                  PM-Kisan Scheme Active Beneficiary
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-200 rounded-element hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand text-white rounded-element hover:bg-brand-mid cursor-pointer font-heading font-extrabold uppercase"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
