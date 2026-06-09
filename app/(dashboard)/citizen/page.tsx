"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { registerPropertyOnChain } from "@/lib/blockchain";
import { uploadFileToIPFS } from "@/lib/ipfs";
import CryptoJS from "crypto-js";
import {
  IconHome,
  IconFingerprint,
  IconFileText,
  IconMap,
  IconCircleCheck,
  IconPlus,
  IconActivity,
  IconDownload,
  IconSwitchHorizontal,
  IconGlobe,
  IconLoader2,
  IconCoins,
} from "@tabler/icons-react";

import MetricCard from "@/components/dashboard/MetricCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import PageHeader from "@/components/dashboard/PageHeader";

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
  status: string;
}

const stateDistricts: Record<string, string[]> = {
  "Uttar Pradesh": ["Gautam Buddha Nagar (Noida)", "Ghaziabad", "Lucknow", "Kanpur"],
  "Delhi": ["South Delhi", "New Delhi", "North Delhi", "West Delhi"],
  "Haryana": ["Gurugram", "Faridabad", "Sonipat", "Rohtak"],
  "Maharashtra": ["Mumbai Suburban", "Mumbai City", "Pune", "Thane"],
};

export default function CitizenDashboard() {
  const { user, walletAddress, connectWallet } = useAuth();
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  
  // Registration form steps
  const [step, setStep] = useState(1);
  const [progressPercent, setProgressPercent] = useState(25);

  // Form states
  const [kycAadhaar, setKycAadhaar] = useState("");
  const [kycOtp, setKycOtp] = useState("");
  const [kycOtpSent, setKycOtpSent] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  const [kycMaskedPhone, setKycMaskedPhone] = useState("");
  const [simulatedOtp, setSimulatedOtp] = useState("");
  const [showSmsBanner, setShowSmsBanner] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);

  // Specs
  const [surveyNum, setSurveyNum] = useState("");
  const [area, setArea] = useState("");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("Residential");
  const [selectedState, setSelectedState] = useState("Uttar Pradesh");
  const [district, setDistrict] = useState("Gautam Buddha Nagar (Noida)");

  // Docs
  const [deedFile, setDeedFile] = useState<File | null>(null);
  const [deedHash, setDeedHash] = useState("");
  const [ipfsCid, setIpfsCid] = useState("");
  const [uploadingIpfs, setUploadingIpfs] = useState(false);

  // Map / Boundaries
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
  const [mapLat, setMapLat] = useState(28.6273);
  const [mapLng, setMapLng] = useState(77.3725);

  const [formError, setFormError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [mapDrawerOpen, setMapDrawerOpen] = useState(false);
  const [activeParcelForMap, setActiveParcelForMap] = useState<Property | null>(null);

  // Audit Logs
  const [activities, setActivities] = useState<any[]>([
    { id: "act-1", action: "PROPERTY_REGISTERED", parcelId: "PARCEL-4902-881", time: "2 hours ago" },
    { id: "act-2", action: "KYC_COMPLETED", parcelId: "Aadhaar System", time: "5 hours ago" },
    { id: "act-3", action: "WILL_PUBLISHED", parcelId: "Will Ledger", time: "1 day ago" },
  ]);

  // Load owned properties
  const loadOwnedProperties = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/property?ownerId=${user.id}`);
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
    if (user) {
      loadOwnedProperties();
    }
  }, [user]);

  const handleSendKycOtp = async () => {
    const cleanAadhaar = kycAadhaar.replace(/\s/g, "");
    if (cleanAadhaar.length !== 12 || isNaN(Number(cleanAadhaar))) {
      setFormError("Please enter a valid 12-digit Aadhaar Number.");
      return;
    }
    setFormError("");
    setKycLoading(true);
    try {
      const res = await fetch(`/api/user/lookup?aadhaar=${encodeURIComponent(cleanAadhaar)}`);
      const data = await res.json();
      
      if (!res.ok) {
        setFormError(data.error || "Aadhaar Number is not registered in the system.");
        return;
      }

      setKycMaskedPhone(data.phone);
      if (data.simulatedOtp) {
        setSimulatedOtp(data.simulatedOtp);
        setShowSmsBanner(true);
        toast.info(`[Testing SIM] Aadhaar Secure OTP: ${data.simulatedOtp}`);
      }
      setKycOtpSent(true);
      toast.success("Identity verification OTP dispatched.");
    } catch (err) {
      setFormError("Failed to connect to verification server.");
    } finally {
      setKycLoading(false);
    }
  };

  const handleVerifyKycOtp = async () => {
    setFormError("");
    setKycLoading(true);
    const cleanAadhaar = kycAadhaar.replace(/\s/g, "");

    try {
      const res = await fetch("/api/user/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar: cleanAadhaar, otp: kycOtp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Incorrect OTP. Please check the code and try again.");
        return;
      }

      setKycVerified(true);
      setShowSmsBanner(false);
      toast.success("Aadhaar Identity Verified successfully.");
    } catch (err) {
      setFormError("An error occurred during verification.");
    } finally {
      setKycLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDeedFile(file);
    setUploadingIpfs(true);
    setFormError("");

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const binary = event.target?.result;
        if (binary) {
          const wa = CryptoJS.lib.WordArray.create(binary as any);
          const hash = CryptoJS.SHA256(wa).toString();
          setDeedHash(hash);
        }
      };
      reader.readAsArrayBuffer(file);

      const cid = await uploadFileToIPFS(file, file.name);
      setIpfsCid(cid);
      toast.success("Document uploaded to decentralized IPFS.");
    } catch (err: any) {
      setFormError("IPFS Upload failed: " + err.message);
    } finally {
      setUploadingIpfs(false);
    }
  };

  const handleAddMapPoint = (x: number, y: number) => {
    const lat = 28.62 + (y / 1000);
    const lng = 77.37 + (x / 1000);
    setDrawnPoints([...drawnPoints, [lng, lat]]);
    setMapLat(lat);
    setMapLng(lng);
  };

  const handleFinalSubmit = async () => {
    if (!walletAddress) {
      setFormError("Please connect your web3 wallet to submit the transaction.");
      return;
    }
    if (drawnPoints.length < 3) {
      setFormError("Please draw at least 3 points on the boundary map.");
      return;
    }

    setRegistering(true);
    setFormError("");
    const parcelId = `PARCEL-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`;

    try {
      const txHash = await registerPropertyOnChain(parcelId, ipfsCid);

      const res = await fetch("/api/property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parcelId,
          surveyNumber: surveyNum,
          area: parseFloat(area),
          location,
          latitude: mapLat,
          longitude: mapLng,
          ipfsHash: ipfsCid,
          blockchainTxHash: txHash,
          ownerId: user?.id,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to write property to database.");
      }

      toast.success(`Property ${parcelId} registered on-chain successfully!`);
      setFormOpen(false);
      resetForm();
      loadOwnedProperties();
    } catch (err: any) {
      setFormError(err.message || "An error occurred during submission.");
    } finally {
      setRegistering(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setProgressPercent(25);
    setKycAadhaar("");
    setKycOtp("");
    setKycOtpSent(false);
    setKycVerified(false);
    setSurveyNum("");
    setArea("");
    setLocation("");
    setDeedFile(null);
    setDeedHash("");
    setIpfsCid("");
    setDrawnPoints([]);
  };

  const nextStep = () => {
    if (step === 1 && !kycVerified) {
      setFormError("Verify Aadhaar before proceeding.");
      return;
    }
    if (step === 2 && (!surveyNum || !area || !location)) {
      setFormError("Please fill out all property details.");
      return;
    }
    if (step === 3 && !ipfsCid) {
      setFormError("Please upload deed document to IPFS.");
      return;
    }
    setFormError("");
    setStep((prev) => prev + 1);
    setProgressPercent((prev) => (prev + 1) * 25);
  };

  const prevStep = () => {
    setFormError("");
    setStep((prev) => prev - 1);
    setProgressPercent((prev) => (prev - 1) * 25);
  };

  const handleDownloadEC = (parcelId: string) => {
    toast.success(`Encumbrance Certificate requested for ${parcelId}. PDF compile download starting...`);
  };

  const handleViewMap = (prop: Property) => {
    setActiveParcelForMap(prop);
    setMapDrawerOpen(true);
  };

  const portfolioValue = properties.reduce((acc, p) => acc + p.area * 3000, 0);

  return (
    <div className="space-y-6 relative">
      {/* Dynamic welcome page header */}
      <PageHeader
        title="Citizen Assets Portal"
        subtitle="Log properties, track active mutations, and query decentralized title registries."
        cta={
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element transition-colors cursor-pointer"
          >
            <IconPlus className="w-4 h-4" />
            Register Property
          </button>
        }
      />

      {/* Simulated OTP Notification Banner */}
      {showSmsBanner && simulatedOtp && (
        <div className="bg-slate-900 border-[0.5px] border-slate-700 text-white rounded-card p-3 flex justify-between items-center text-xs font-mono mb-4 max-w-md">
          <span>[OTP SIMULATOR]: UIDAI Authentication code: <strong>{simulatedOtp}</strong></span>
          <button onClick={() => setShowSmsBanner(false)} className="font-bold hover:text-brand-mid ml-2">×</button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Properties Owned" value={properties.length} color="brand" icon={IconHome} />
        <MetricCard label="Pending Transfers" value={properties.filter(p => p.status === "PENDING").length} color="gold" icon={IconSwitchHorizontal} />
        <MetricCard label="Watched Assets" value="2 Properties" color="purple" icon={IconGlobe} />
        <MetricCard label="Est. Portfolio Value" value={`₹${portfolioValue.toLocaleString()}`} color="green" icon={IconCoins} />
      </div>

      {/* Grid of properties & Activities split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Properties grid (2 columns as per requirements) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            Your Registered Assets ({properties.length})
          </h3>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading properties...</div>
          ) : properties.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-card border border-dashed text-slate-450">
              No registered properties found in Noida Revenue division.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-brand/40 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-xs text-brand bg-brand-light dark:bg-brand-dark/20 dark:text-brand-mid px-2 py-0.5 rounded-element">
                        {prop.parcelId}
                      </span>
                      <StatusBadge status={prop.status} />
                    </div>

                    <h4 className="font-heading font-extrabold text-sm text-slate-700 dark:text-slate-200">
                      Survey: {prop.surveyNumber}
                    </h4>
                    <p className="text-[11px] text-slate-450 font-body leading-normal">
                      {prop.location}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>Area: {prop.area.toLocaleString()} Sq Ft</span>
                      <span>Value: ₹{(prop.area * 3000).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-850 pt-3 flex gap-2">
                    <button
                      onClick={() => handleViewMap(prop)}
                      className="flex-1 py-1.5 bg-gray-50 border border-slate-200 dark:border-slate-800 text-[10px] font-heading font-extrabold uppercase rounded-element flex items-center justify-center gap-1 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <IconMap className="w-3.5 h-3.5" />
                      View Map
                    </button>
                    <button
                      onClick={() => router.push("/citizen/transfer")}
                      className="flex-1 py-1.5 bg-gray-50 border border-slate-200 dark:border-slate-800 text-[10px] font-heading font-extrabold uppercase rounded-element flex items-center justify-center gap-1 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <IconSwitchHorizontal className="w-3.5 h-3.5" />
                      Transfer
                    </button>
                    <button
                      onClick={() => handleDownloadEC(prop.parcelId)}
                      className="p-1.5 bg-brand-light hover:bg-brand hover:text-white dark:bg-brand-dark/25 text-brand dark:text-brand-mid rounded-element cursor-pointer transition-colors"
                      title="Download EC"
                    >
                      <IconDownload className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activities feed */}
        <div className="space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <IconActivity className="w-4.5 h-4.5 text-brand" />
            Recent Log Activity
          </h3>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-3 font-body">
            {activities.map((act) => (
              <div key={act.id} className="flex gap-3 text-[10px] items-start pb-2 border-b border-slate-100 dark:border-slate-850 last:border-0 last:pb-0">
                <span className="p-1.5 rounded-full bg-slate-50 text-slate-450 dark:bg-slate-800 mt-0.5">
                  <IconFileText className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 uppercase block tracking-wider">
                    {act.action.replace(/_/g, " ")}
                  </span>
                  <p className="text-slate-450 text-[9px] mt-0.5">{act.parcelId}</p>
                  <span className="text-[8px] text-slate-400 font-mono block mt-1">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-step property register modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#030806] rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 p-6 space-y-5 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100">
              <h2 className="font-heading font-extrabold text-base text-slate-800 dark:text-slate-200">
                Property Registry Gateway
              </h2>
              <button
                onClick={() => {
                  setFormOpen(false);
                  resetForm();
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Stepper details */}
            <div className="space-y-2">
              <div className="w-full h-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[8px] font-heading font-extrabold text-slate-400 uppercase tracking-widest">
                <span className={step >= 1 ? "text-brand" : ""}>1. KYC</span>
                <span className={step >= 2 ? "text-brand" : ""}>2. Details</span>
                <span className={step >= 3 ? "text-brand" : ""}>3. IPFS Deed</span>
                <span className={step >= 4 ? "text-brand" : ""}>4. Limits</span>
              </div>
            </div>

            {formError && (
              <div className="p-3 text-[10px] text-red bg-red-light/30 border border-red/20 rounded-element font-body">
                {formError}
              </div>
            )}

            {/* Form scroll window */}
            <div className="overflow-y-auto flex-grow max-h-[50vh] pr-1 space-y-4 font-body">
              {step === 1 && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 text-slate-500 rounded-element leading-relaxed text-[10px]">
                    Verify Aadhaar Resident identity to sync ownership deed properties with legal names.
                  </div>
                  {!kycOtpSent ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-heading font-bold uppercase text-slate-400">Aadhaar UID</label>
                        <input
                          type="text"
                          placeholder="Enter 12-digit Aadhaar..."
                          value={kycAadhaar}
                          onChange={(e) => setKycAadhaar(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendKycOtp}
                        disabled={kycLoading}
                        className="w-full py-2 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element flex items-center justify-center cursor-pointer transition-colors"
                      >
                        Send OTP Code
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-250 rounded-element text-[10px] text-emerald-600">
                        OTP code sent to: {kycMaskedPhone}
                      </div>
                      {simulatedOtp && (
                        <div className="p-2.5 bg-slate-900 border border-slate-700 text-white rounded-element text-[10px] font-mono leading-normal">
                          [OTP SIMULATOR]: UIDAI Authentication code is <strong>{simulatedOtp}</strong>
                        </div>
                      )}
                      <div className="space-y-1">
                        <label className="text-[10px] font-heading font-bold uppercase text-slate-400">verification code</label>
                        <input
                          type="password"
                          placeholder="Enter 6-digit OTP code..."
                          value={kycOtp}
                          onChange={(e) => setKycOtp(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand tracking-widest text-center font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyKycOtp}
                        disabled={kycLoading}
                        className="w-full py-2 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element flex items-center justify-center cursor-pointer transition-colors"
                      >
                        Verify OTP Code
                      </button>
                    </div>
                  )}

                  {kycVerified && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-250 text-center font-heading font-extrabold text-xs uppercase tracking-widest text-emerald-600 rounded-element flex items-center justify-center gap-1.5">
                      <IconCircleCheck className="w-5 h-5 text-emerald-500" />
                      Resident Verified
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-heading font-bold uppercase text-slate-400">Survey Number</label>
                      <input
                        type="text"
                        placeholder="SURVEY-X"
                        value={surveyNum}
                        onChange={(e) => setSurveyNum(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-heading font-bold uppercase text-slate-400">Area (Sq Ft)</label>
                      <input
                        type="number"
                        placeholder="1200"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-heading font-bold uppercase text-slate-400">Property Address</label>
                    <input
                      type="text"
                      placeholder="Sector address details..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-heading font-bold uppercase text-slate-400">Type</label>
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        className="w-full px-2 py-2 bg-gray-50 border border-slate-200 rounded-element focus:outline-none"
                      >
                        <option>Residential</option>
                        <option>Commercial</option>
                        <option>Agricultural</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-heading font-bold uppercase text-slate-400">State</label>
                      <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full px-2 py-2 bg-gray-50 border border-slate-200 rounded-element focus:outline-none"
                      >
                        {Object.keys(stateDistricts).map((st) => (
                          <option key={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-heading font-bold uppercase text-slate-400">District</label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-2 py-2 bg-gray-50 border border-slate-200 rounded-element focus:outline-none"
                      >
                        {(stateDistricts[selectedState] || []).map((dst) => (
                          <option key={dst}>{dst}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 text-xs text-center">
                  <div className="p-6 border border-dashed border-slate-350 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-element flex flex-col items-center justify-center gap-2">
                    <input type="file" onChange={handleFileUpload} className="hidden" id="deed-upload" />
                    <label htmlFor="deed-upload" className="cursor-pointer text-brand hover:text-brand-mid font-heading font-extrabold uppercase text-[10px] tracking-wider">
                      {deedFile ? "Replace Deed document" : "Select Deed Copy File"}
                    </label>
                    {deedFile && (
                      <span className="text-[9px] text-slate-450 truncate max-w-[200px] block mt-1">
                        {deedFile.name}
                      </span>
                    )}
                  </div>

                  {uploadingIpfs && <span className="text-[10px] text-slate-400">Uploading file to IPFS...</span>}

                  {ipfsCid && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-element text-left text-[9px] font-mono leading-normal text-slate-400 truncate">
                      IPFS Hash: {ipfsCid}
                    </div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-element text-[10px] text-slate-500 leading-normal">
                    Point bounds coordinates. Click inside the visual region grid below to simulate parcel vertices coordinates.
                  </div>

                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = Math.round(e.clientX - rect.left);
                      const y = Math.round(e.clientY - rect.top);
                      handleAddMapPoint(x, y);
                    }}
                    className="w-full h-32 bg-slate-100 dark:bg-slate-900 rounded-element cursor-crosshair border border-slate-200 dark:border-slate-800 relative overflow-hidden flex items-center justify-center"
                  >
                    {drawnPoints.length > 0 ? (
                      <div className="absolute inset-0 flex flex-wrap gap-1 p-2">
                        {drawnPoints.map((pt, i) => (
                          <span key={i} className="px-1 py-0.5 bg-brand-light text-brand text-[8px] rounded-element font-mono">
                            {pt[0].toFixed(3)},{pt[1].toFixed(3)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[9px] text-slate-400 font-heading font-bold uppercase tracking-wider">
                        Click inside grid region to add limits
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Stepper buttons */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 bg-gray-150 border border-slate-200 text-slate-700 text-[10px] font-heading font-extrabold uppercase rounded-element cursor-pointer"
                >
                  Previous
                </button>
              ) : (
                <div></div>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 bg-brand hover:bg-brand-mid text-white text-[10px] font-heading font-extrabold uppercase rounded-element cursor-pointer"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={registering}
                  className="px-4 py-2 bg-brand hover:bg-brand-mid text-white text-[10px] font-heading font-extrabold uppercase rounded-element cursor-pointer flex items-center gap-1"
                >
                  {registering && <IconLoader2 className="w-3.5 h-3.5 animate-spin" />}
                  Register Asset
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map visualizer drawer */}
      {mapDrawerOpen && activeParcelForMap && (
        <div className="fixed inset-y-0 right-0 w-[320px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 z-50 shadow-2xl p-6 flex flex-col justify-between font-body text-xs">
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-heading font-extrabold text-sm text-slate-700 dark:text-slate-150 uppercase tracking-wider">
                Parcel spatial limits
              </h3>
              <button
                onClick={() => setMapDrawerOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-element font-mono text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span>Parcel ID:</span>
                  <span className="font-bold text-brand">{activeParcelForMap.parcelId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Coordinates:</span>
                  <span>{activeParcelForMap.latitude.toFixed(4)}°N, {activeParcelForMap.longitude.toFixed(4)}°E</span>
                </div>
              </div>

              {/* Map Canvas Mock */}
              <div className="w-full h-48 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-element flex items-center justify-center text-center relative overflow-hidden">
                <div className="absolute w-20 h-20 bg-brand-light/30 border border-brand/50 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-brand-dark/45 dark:text-brand-mid/50 z-10 flex flex-col items-center gap-1">
                  <IconGlobe className="w-6 h-6 stroke-[1.4] animate-spin" />
                  Mapbox Satellite Layer
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setMapDrawerOpen(false)}
            className="w-full py-2 bg-slate-800 hover:bg-slate-950 text-slate-200 text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer text-center"
          >
            Clear Bounds View
          </button>
        </div>
      )}
    </div>
  );
}
