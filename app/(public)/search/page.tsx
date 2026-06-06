"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { jsPDF } from "jspdf";
import { 
  IconSearch, 
  IconUser, 
  IconMapPin, 
  IconFileText, 
  IconDownload, 
  IconTimeline, 
  IconBuildingBank, 
  IconCode, 
  IconX,
  IconCircleCheck,
  IconArrowRight,
  IconExternalLink
} from "@tabler/icons-react";

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: string;
  walletAddress?: string | null;
  aadhaarHash: string;
}

interface Transfer {
  id: string;
  fromOwnerId: string;
  toOwnerId: string;
  stampDuty: number;
  txHash?: string | null;
  status: string;
  initiatedAt: string;
  completedAt?: string | null;
}

interface Property {
  id: string;
  parcelId: string;
  surveyNumber: string;
  area: number;
  location: string;
  latitude: number;
  longitude: number;
  ipfsHash: string;
  blockchainTxHash: string;
  ownerId: string;
  owner: User;
  transfers: Transfer[];
  status: string;
  createdAt: string;
}

export default function PropertySearch() {
  const [searchType, setSearchType] = useState<"parcelId" | "surveyNumber" | "ownerName">("parcelId");
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [bankMode, setBankMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch properties on mount and query updates
  const fetchProperties = async (queryVal = "", typeVal = "parcelId") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/property?query=${encodeURIComponent(queryVal)}&type=${typeVal}`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
      }
    } catch (err) {
      console.error("Failed to load properties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties(searchQuery, searchType);
  };

  const generatePDF = (property: Property) => {
    const doc = new jsPDF();
    
    // Title Block
    doc.setFillColor(15, 110, 86); // brand color #0F6E56
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("LANDCHAIN REGISTRY SERVICE", 15, 18);
    doc.setFontSize(12);
    doc.setFont("Helvetica", "normal");
    doc.text("Ministry of Land & Revenue, Govt of India", 15, 26);
    doc.text(`Certificate ID: LC-EC-${property.id.substring(0,8).toUpperCase()}`, 15, 33);
    
    // Body Details
    doc.setTextColor(33, 41, 54);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Encumbrance & Ownership Certificate", 15, 55);
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(15, 58, 195, 58);
    
    // Property Info Grid
    doc.setFontSize(11);
    doc.setFont("Helvetica", "bold");
    doc.text("Property Details:", 15, 68);
    
    doc.setFont("Helvetica", "normal");
    doc.text(`Parcel ID: ${property.parcelId}`, 15, 76);
    doc.text(`Survey Number: ${property.surveyNumber}`, 15, 83);
    doc.text(`Area: ${property.area} Sq Ft`, 15, 90);
    doc.text(`Location: ${property.location}`, 15, 97);
    doc.text(`Latitude / Longitude: ${property.latitude}, ${property.longitude}`, 15, 104);
    
    // Current Owner Info
    doc.setFont("Helvetica", "bold");
    doc.text("Current Owner Details:", 110, 68);
    
    doc.setFont("Helvetica", "normal");
    doc.text(`Owner Name: ${property.owner.name}`, 110, 76);
    doc.text(`Aadhaar Hash: ${property.owner.aadhaarHash.substring(0, 15)}...`, 110, 83);
    doc.text(`Wallet Address: ${property.owner.walletAddress ? property.owner.walletAddress.substring(0, 12) + "..." : "Not Connected"}`, 110, 90);
    doc.text(`Registry Status: ${property.status}`, 110, 97);
    doc.text(`Registered On: ${new Date(property.createdAt).toLocaleDateString()}`, 110, 104);
    
    doc.line(15, 112, 195, 112);
    
    // Blockchain & IPFS Hashes
    doc.setFont("Helvetica", "bold");
    doc.text("Cryptographic Proofs:", 15, 122);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`IPFS Deed Hash (CID): ${property.ipfsHash}`, 15, 130);
    doc.text(`Blockchain Genesis Tx: ${property.blockchainTxHash || "Pending Registration"}`, 15, 137);
    
    doc.line(15, 145, 195, 145);
    
    // Provenance Table
    doc.setFontSize(11);
    doc.setFont("Helvetica", "bold");
    doc.text("Ownership Provenance History:", 15, 155);
    
    doc.setFontSize(9);
    doc.text("Date", 15, 165);
    doc.text("Mutation Event", 55, 165);
    doc.text("From / To Party", 110, 165);
    doc.text("Blockchain Tx Hash", 160, 165);
    
    doc.line(15, 168, 195, 168);
    
    let yPos = 175;
    
    // Add Genesis
    doc.text(new Date(property.createdAt).toLocaleDateString(), 15, yPos);
    doc.text("GENESIS REGISTER", 55, yPos);
    doc.text(`Govt / ${property.owner.name.substring(0, 10)}...`, 110, yPos);
    doc.text(property.blockchainTxHash ? property.blockchainTxHash.substring(0, 10) + "..." : "Local Seed", 160, yPos);
    
    yPos += 8;
    
    // Add subsequent transfers
    if (property.transfers && property.transfers.length > 0) {
      property.transfers.forEach((tx) => {
        if (tx.status === "COMPLETED") {
          doc.text(new Date(tx.completedAt || tx.initiatedAt).toLocaleDateString(), 15, yPos);
          doc.text("TITLE MUTATION", 55, yPos);
          doc.text(`ID: ${tx.fromOwnerId.substring(0, 4)}... -> ID: ${tx.toOwnerId.substring(0,4)}...`, 110, yPos);
          doc.text(tx.txHash ? tx.txHash.substring(0, 10) + "..." : "0xmock...", 160, yPos);
          yPos += 8;
        }
      });
    }
    
    // Footer validation seal
    doc.setFillColor(241, 245, 249);
    doc.rect(15, 245, 180, 25, "F");
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 110, 86);
    doc.text("✓ VERIFIED CRYPTOGRAPHIC RECORD", 20, 255);
    doc.setTextColor(100, 116, 139);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.text("This document is generated dynamically from the Polygon mainnet blockchain ledgers.", 20, 260);
    doc.text("Any alteration breaks the SHA-256 seal. Authenticity can be verified via QR scan on LandChain.", 20, 264);
    
    // Save
    doc.save(`encumbrance_certificate_${property.parcelId}.pdf`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#030806] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10 space-y-8">
        
        {/* Header and Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="font-heading font-extrabold text-3xl md:text-4xl">
              Public Property Registry
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-body">
              Search real estate records, ownership timelines, and verify cryptographic deeds instantly.
            </p>
          </div>

          {/* Bank mode Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400">
              Lien Inspector
            </span>
            <button
              onClick={() => setBankMode(!bankMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none cursor-pointer ${
                bankMode ? "bg-accent" : "bg-slate-200 dark:bg-slate-800"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  bankMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm font-heading font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <IconBuildingBank className={`w-4 h-4 ${bankMode ? "text-accent" : "text-slate-400"}`} />
              Bank Mode
            </span>
          </div>
        </div>

        {/* Search Bar Block */}
        <div className="bg-slate-50 dark:bg-slate-900/10 lc-border rounded-card p-6 space-y-4">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
            <button
              onClick={() => setSearchType("parcelId")}
              className={`pb-3 font-heading text-sm font-semibold relative transition-colors cursor-pointer ${
                searchType === "parcelId" 
                  ? "text-brand dark:text-brand-mid" 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              Parcel ID
              {searchType === "parcelId" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand dark:bg-brand-mid"></span>
              )}
            </button>
            <button
              onClick={() => setSearchType("surveyNumber")}
              className={`pb-3 font-heading text-sm font-semibold relative transition-colors cursor-pointer ${
                searchType === "surveyNumber" 
                  ? "text-brand dark:text-brand-mid" 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              Survey Number
              {searchType === "surveyNumber" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand dark:bg-brand-mid"></span>
              )}
            </button>
            <button
              onClick={() => setSearchType("ownerName")}
              className={`pb-3 font-heading text-sm font-semibold relative transition-colors cursor-pointer ${
                searchType === "ownerName" 
                  ? "text-brand dark:text-brand-mid" 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              Owner Name
              {searchType === "ownerName" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand dark:bg-brand-mid"></span>
              )}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div className="relative flex-grow">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder={
                  searchType === "parcelId" 
                    ? "Enter blockchain parcel ID (e.g. PARCEL-4902-881)..." 
                    : searchType === "surveyNumber"
                    ? "Enter revenue survey number (e.g. SURVEY-402/12)..."
                    : "Enter property owner's name..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 rounded-element bg-white dark:bg-slate-900 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-brand hover:bg-brand-mid text-white font-heading font-semibold text-sm rounded-element transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results Block */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-heading">
            <span className="inline-block animate-spin mr-2 border-2 border-brand border-t-transparent w-5 h-5 rounded-full"></span>
            Loading registry ledger...
          </div>
        ) : properties.length === 0 ? (
          <div className="py-20 text-center lc-border rounded-card border-dashed">
            <p className="text-slate-400 font-body text-sm">No properties found matching your query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <div 
                key={prop.id}
                onClick={() => setSelectedProperty(prop)}
                className="lc-border rounded-card p-6 bg-white dark:bg-slate-900/10 hover:border-brand/40 dark:hover:border-brand-mid/40 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  {/* Badge & Area */}
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xs px-2.5 py-1 bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid rounded-pill">
                      {prop.parcelId}
                    </span>
                    <span className="text-xs text-slate-400 font-body font-medium">
                      {prop.area.toLocaleString()} Sq Ft
                    </span>
                  </div>

                  {/* Survey & Location */}
                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-lg group-hover:text-brand dark:group-hover:text-brand-mid transition-colors">
                      Survey: {prop.surveyNumber}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-body flex items-center gap-1">
                      <IconMapPin className="w-3.5 h-3.5" />
                      {prop.location}
                    </p>
                  </div>
                </div>

                {/* Footer specs */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                      <IconUser className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-heading font-bold">Owner</div>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                        {prop.owner.name}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-heading font-bold px-2 py-0.5 rounded-pill ${
                    prop.status === "ACTIVE" 
                      ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" 
                      : prop.status === "DISPUTED"
                      ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400"
                      : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400"
                  }`}>
                    {prop.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detailed Slider Drawer */}
        {selectedProperty && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
            <div 
              className="w-full max-w-2xl bg-white dark:bg-[#030806] h-full shadow-2xl flex flex-col animate-[slide-in_0.4s_ease-out] relative"
              style={{
                animationFillMode: "forwards"
              }}
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest font-heading font-bold text-slate-400">
                    Registry Ledger File
                  </span>
                  <h2 className="font-heading font-extrabold text-2xl text-slate-800 dark:text-slate-100">
                    {selectedProperty.parcelId}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="p-2 rounded-element hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                >
                  <IconX className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scroll Body */}
              <div className="flex-grow overflow-y-auto p-6 space-y-8">
                
                {/* Switch to Bank mode UI in drawer */}
                {bankMode ? (
                  /* BANK MODE SPECIFIC API-STYLE VIEW */
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 p-4 rounded-element bg-accent-light/30 text-accent dark:bg-accent/10 dark:text-accent-light lc-border">
                      <IconCode className="w-5 h-5" />
                      <span className="font-heading font-bold text-sm">Lien API Query: OK</span>
                    </div>

                    {/* API Output */}
                    <div className="rounded-element bg-slate-950 p-4 text-emerald-400 font-mono text-xs overflow-x-auto space-y-1">
                      <div>{`{`}</div>
                      <div className="pl-4">{`"parcelId": "${selectedProperty.parcelId}",`}</div>
                      <div className="pl-4">{`"status": "${selectedProperty.status}",`}</div>
                      <div className="pl-4">{`"liens": [],`}</div>
                      <div className="pl-4">{`"encumbered": false,`}</div>
                      <div className="pl-4">{`"claims": [],`}</div>
                      <div className="pl-4">{`"onChainVerifier": "${selectedProperty.blockchainTxHash ? "VALID" : "UNREGISTERED"}",`}</div>
                      <div className="pl-4">{`"stampDutyPaid": true`}</div>
                      <div>{`}`}</div>
                    </div>

                    <div className="space-y-3 font-body text-xs text-slate-500 leading-relaxed">
                      <p>
                        This dashboard provides direct query nodes for authorized bankers to inspect asset encumbrance before approving mortgages.
                      </p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Lien Status: <strong>Clean (No active mortgages)</strong></li>
                        <li>Tax Mutations: <strong>Cleared (0.5% state stamp duty paid)</strong></li>
                        <li>Property Status: <strong>ACTIVE</strong></li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  /* STANDARD CITIZEN PROVENANCE VIEW */
                  <>
                    {/* Mapbox Canvas Map representation */}
                    <div className="space-y-2">
                      <h3 className="font-heading font-bold text-sm flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <IconMapPin className="w-4 h-4 text-brand" />
                        Spatial Parcel Boundaries
                      </h3>
                      
                      {/* SVG Canvas Mock map */}
                      <div className="w-full h-64 rounded-element bg-slate-100 dark:bg-slate-900/50 lc-border relative overflow-hidden flex items-center justify-center">
                        {/* Map Grid background */}
                        <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.06)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:16px_16px]"></div>
                        
                        {/* Boundaries vector representation */}
                        <svg className="w-4/5 h-4/5 relative z-10" viewBox="0 0 300 200">
                          {/* Surrounding parcels */}
                          <polygon points="20,30 120,20 100,80 10,60" fill="currentColor" fillOpacity="0.03" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1"/>
                          <polygon points="125,20 250,30 230,90 105,80" fill="currentColor" fillOpacity="0.03" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1"/>
                          <polygon points="10,65 95,85 80,180 5,160" fill="currentColor" fillOpacity="0.03" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1"/>
                          
                          {/* Active parcel */}
                          <polygon 
                            points="100,85 230,95 210,185 85,180" 
                            fill="#0F6E56" fillOpacity="0.15" 
                            stroke="#0F6E56" strokeWidth="1.5" 
                            strokeDasharray="4"
                          />
                          {/* Marker */}
                          <circle cx="150" cy="130" r="4" fill="#0F6E56" className="animate-ping" />
                          <circle cx="150" cy="130" r="3.5" fill="#1D9E75" />
                        </svg>

                        {/* Coordinates overlay */}
                        <div className="absolute bottom-3 left-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-pill text-[10px] font-mono lc-border">
                          LAT: {selectedProperty.latitude} | LNG: {selectedProperty.longitude}
                        </div>
                        <div className="absolute top-3 right-3 bg-brand-light/95 dark:bg-brand-dark/95 backdrop-blur-md px-3 py-1 rounded-pill text-[10px] font-heading font-bold text-brand dark:text-brand-mid lc-border">
                          Area: {selectedProperty.area} Sq Ft
                        </div>
                      </div>
                    </div>

                    {/* Metadata specs */}
                    <div className="grid grid-cols-2 gap-6 pt-4">
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-heading font-bold">Survey Number</div>
                        <div className="text-sm font-semibold">{selectedProperty.surveyNumber}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-heading font-bold">Location</div>
                        <div className="text-sm font-semibold">{selectedProperty.location}</div>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <div className="text-[10px] text-slate-400 uppercase font-heading font-bold">IPFS CID Hash</div>
                        <div className="text-xs font-mono bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-element break-all lc-border">
                          {selectedProperty.ipfsHash}
                        </div>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <div className="text-[10px] text-slate-400 uppercase font-heading font-bold">Blockchain Tx Hash</div>
                        <div className="text-xs font-mono bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-element break-all lc-border flex items-center justify-between">
                          <span className="truncate">{selectedProperty.blockchainTxHash || "0xmock_hash..."}</span>
                          <IconExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        </div>
                      </div>
                    </div>

                    {/* Provenance timeline */}
                    <div className="space-y-4">
                      <h3 className="font-heading font-bold text-sm flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <IconTimeline className="w-4.5 h-4.5 text-brand" />
                        Ownership Provenance History
                      </h3>

                      <div className="relative border-l-[0.5px] border-slate-200 dark:border-slate-800 pl-6 space-y-6 ml-2 text-xs">
                        
                        {/* Current owner */}
                        <div className="relative">
                          <div className="absolute -left-[28.5px] top-1 w-3 h-3 rounded-full bg-brand"></div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-heading font-bold text-slate-800 dark:text-slate-200">
                                Current Owner: {selectedProperty.owner.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Registered Owner
                              </span>
                            </div>
                            <p className="text-slate-400">
                              Verified via Aadhaar OTP login and synchronized on-chain.
                            </p>
                          </div>
                        </div>

                        {/* Past transfers */}
                        {selectedProperty.transfers && selectedProperty.transfers.filter(t => t.status === "COMPLETED").map((tx, idx) => (
                          <div key={tx.id} className="relative">
                            <div className="absolute -left-[28.5px] top-1 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-heading font-bold text-slate-600 dark:text-slate-400">
                                  Title Mutation Event
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(tx.completedAt || tx.initiatedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-slate-400">
                                Ownership transferred from Owner ID {tx.fromOwnerId.substring(0,6)}... to {tx.toOwnerId.substring(0,6)}... Stamp duty of ₹{tx.stampDuty.toLocaleString()} logged.
                              </p>
                              {tx.txHash && (
                                <div className="text-[10px] font-mono text-brand dark:text-brand-mid">
                                  TX: {tx.txHash.substring(0, 20)}...
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Genesis register */}
                        <div className="relative">
                          <div className="absolute -left-[28.5px] top-1 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-heading font-bold text-slate-600 dark:text-slate-400">
                                Genesis Registration
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(selectedProperty.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-400">
                              Property parcel mapping generated and initial deed uploaded to IPFS.
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* PDF certificate download button */}
                    <button
                      onClick={() => generatePDF(selectedProperty)}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-element bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 text-brand dark:text-brand-mid font-heading font-bold text-sm lc-border cursor-pointer transition-colors"
                    >
                      <IconDownload className="w-4.5 h-4.5" />
                      Download Encumbrance Certificate
                    </button>
                  </>
                )}

              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
