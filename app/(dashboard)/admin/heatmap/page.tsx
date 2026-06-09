"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconMap, IconDownload, IconAlertTriangle, IconLock, IconActivity, IconStack } from "@tabler/icons-react";

export default function HeatmapPage() {
  const [layers, setLayers] = useState({
    fraud: true,
    volume: false,
    encumbrance: true,
    idle: false,
  });

  const [selectedParcel, setSelectedParcel] = useState<any>(null);

  const toggleLayer = (layer: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Mock export map as PNG
  const handleExportPng = () => {
    alert("Exporting GIS Map layer snapshot... PNG download started.");
    const link = document.createElement("a");
    link.download = "landchain_gis_heatmap.png";
    link.href = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    link.click();
  };

  const mockParcels = [
    { id: "PARCEL-4902-881", owner: "Rohan Sharma", area: 2400, type: "Residential", status: "DISPUTED", fraudScore: 85, location: "Sector 62, Noida" },
    { id: "PARCEL-1102-452", owner: "Kiran Devi", area: 5000, type: "Commercial", status: "ACTIVE", fraudScore: 12, location: "Sector 18, Noida" },
    { id: "PARCEL-9981-301", owner: "Rajesh Kumar", area: 1500, type: "Agricultural", status: "FROZEN", fraudScore: 90, location: "Surajpur, Greater Noida" },
    { id: "PARCEL-2019-712", owner: "Unclaimed Govt Immovable", area: 12000, type: "Industrial", status: "IDLE", fraudScore: 45, location: "Kasna Industrial Area" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body text-slate-800 dark:text-slate-100 flex flex-col">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconMap className="w-5 h-5 text-[#0F6E56]" />
          <h1 className="text-md font-heading font-bold">GIS Spatial Heatmap Dashboard</h1>
        </div>
        <button
          onClick={handleExportPng}
          className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-element bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <IconDownload className="w-4 h-4" />
          Export Map (PNG)
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* Toggle Panel Left-Floating */}
        <div className="absolute top-4 left-4 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-4 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 shadow-lg w-64 space-y-4">
          <div className="flex items-center gap-1 text-[#0F6E56] font-heading font-bold text-xs">
            <IconStack className="w-4 h-4" />
            MAP LAYERS
          </div>

          <div className="space-y-2 text-xs">
            <button
              onClick={() => toggleLayer("fraud")}
              className={`w-full flex items-center justify-between p-2.5 rounded-element border transition-all ${
                layers.fraud
                  ? "border-red-500 bg-red-500/5 text-red-600 dark:text-red-400 font-semibold"
                  : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <IconAlertTriangle className="w-4 h-4" />
                Fraud Risk Heatmap
              </span>
              <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-pill">High</span>
            </button>

            <button
              onClick={() => toggleLayer("volume")}
              className={`w-full flex items-center justify-between p-2.5 rounded-element border transition-all ${
                layers.volume
                  ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-semibold"
                  : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <IconActivity className="w-4 h-4" />
                Transaction Choropleth
              </span>
            </button>

            <button
              onClick={() => toggleLayer("encumbrance")}
              className={`w-full flex items-center justify-between p-2.5 rounded-element border transition-all ${
                layers.encumbrance
                  ? "border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400 font-semibold"
                  : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <IconLock className="w-4 h-4" />
                Lien/Encumbrance Dots
              </span>
            </button>

            <button
              onClick={() => toggleLayer("idle")}
              className={`w-full flex items-center justify-between p-2.5 rounded-element border transition-all ${
                layers.idle
                  ? "border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <IconMap className="w-4 h-4" />
                Idle Lands (&gt;10yrs)
              </span>
            </button>
          </div>
        </div>

        {/* Map Center Canvas Mockup */}
        <div className="flex-1 min-h-[500px] bg-slate-200 dark:bg-slate-900 relative flex items-center justify-center overflow-hidden">
          {/* Spatial Grid representation */}
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-0.5 opacity-20 bg-slate-400 pointer-events-none" />

          {/* Render active layer graphics dynamically on canvas */}
          <div className="absolute w-[80%] h-[80%] rounded-card border-[0.5px] border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
            <span className="absolute top-4 right-4 text-[10px] text-slate-400 font-mono">Mapbox GL Canvas Grid</span>
            
            {/* Interactive Mock Nodes representing properties */}
            {mockParcels.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setSelectedParcel(p)}
                style={{ top: `${20 + idx * 18}%`, left: `${25 + idx * 15}%` }}
                className={`absolute p-2.5 rounded-full border shadow-lg cursor-pointer transform hover:scale-110 transition-transform ${
                  p.status === "DISPUTED" && layers.fraud
                    ? "bg-red-500 text-white animate-ping"
                    : p.status === "FROZEN" && layers.encumbrance
                    ? "bg-amber-500 text-white"
                    : p.status === "IDLE" && layers.idle
                    ? "bg-indigo-500 text-white"
                    : "bg-[#0F6E56] text-white"
                }`}
              >
                <IconMap className="w-4 h-4" />
              </button>
            ))}

            <div className="text-xs text-slate-400 select-none">
              Mapbox spatial coordinate view loaded. Click nodes to inspect properties.
            </div>
          </div>
        </div>

        {/* Right Sidebar Details */}
        <div className="w-full md:w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-heading font-bold text-sm text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-4">Inspection Detail</h2>
            
            {selectedParcel ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-element bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2.5">
                  <div>
                    <span className="text-[9px] uppercase font-heading font-bold text-slate-400 block">Parcel ID</span>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">{selectedParcel.id}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-heading font-bold text-slate-400 block">Claimed Owner</span>
                    <span className="text-xs text-slate-700 dark:text-slate-200">{selectedParcel.owner}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-heading font-bold text-slate-400 block">Area</span>
                    <span className="text-xs text-slate-700 dark:text-slate-200">{selectedParcel.area} Sq Ft</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-heading font-bold text-slate-400 block">Property Type</span>
                    <span className="text-xs text-slate-700 dark:text-slate-200">{selectedParcel.type}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-heading font-bold text-slate-400 block">Status / Risk Level</span>
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-pill mt-0.5 uppercase ${
                      selectedParcel.status === "DISPUTED"
                        ? "bg-red-500/10 text-red-500"
                        : selectedParcel.status === "FROZEN"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-emerald-500/10 text-emerald-500"
                    }`}>
                      {selectedParcel.status}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-100/50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-element">
                  <span className="text-[9px] uppercase font-heading font-bold text-slate-400 block">AI Fraud Risk Index</span>
                  <span className="text-xl font-bold font-heading text-red-500">{selectedParcel.fraudScore}%</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Select any parcel marker node on the map to audit details.</p>
            )}
          </div>

          <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">GIS Coordinates base</span>
            <span className="text-xs font-mono block">Lat: 28.6273, Lng: 77.3725</span>
          </div>
        </div>
      </div>
    </div>
  );
}
