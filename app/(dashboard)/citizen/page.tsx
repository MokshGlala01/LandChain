"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { registerPropertyOnChain } from "@/lib/blockchain";
import { uploadFileToIPFS } from "@/lib/ipfs";
import CryptoJS from "crypto-js";
import { 
  IconUser, 
  IconHome, 
  IconFingerprint, 
  IconFileText, 
  IconMap, 
  IconCircleCheck, 
  IconTrash, 
  IconPlus, 
  IconArrowRight, 
  IconArrowLeft,
  IconSearch,
  IconCoins
} from "@tabler/icons-react";

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
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedPropForTransfer, setSelectedPropForTransfer] = useState<Property | null>(null);

  // Form Steps: 1, 2, 3, 4
  const [step, setStep] = useState(1);
  const [progressPercent, setProgressPercent] = useState(25);

  // Step 1: KYC State
  const [kycAadhaar, setKycAadhaar] = useState("");
  const [kycOtp, setKycOtp] = useState("");
  const [kycOtpSent, setKycOtpSent] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  const [kycMaskedPhone, setKycMaskedPhone] = useState("");
  const [simulatedOtp, setSimulatedOtp] = useState("");
  const [showSmsBanner, setShowSmsBanner] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);

  useEffect(() => {
    if (formOpen && user?.aadhaarHash) {
      const cleanAadhaar = user.aadhaarHash.replace("aadhaar_", "");
      setKycAadhaar(cleanAadhaar);
    }
  }, [formOpen, user]);

  // Step 2: Details State
  const [surveyNum, setSurveyNum] = useState("");
  const [area, setArea] = useState("");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("Residential");
  const [selectedState, setSelectedState] = useState("Uttar Pradesh");
  const [district, setDistrict] = useState("Gautam Buddha Nagar (Noida)");

  // Step 3: Document Upload State
  const [deedFile, setDeedFile] = useState<File | null>(null);
  const [deedHash, setDeedHash] = useState("");
  const [ipfsCid, setIpfsCid] = useState("");
  const [uploadingIpfs, setUploadingIpfs] = useState(false);

  // Step 4: Map Boundary State
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
  const [mapLat, setMapLat] = useState(28.6273);
  const [mapLng, setMapLng] = useState(77.3725);

  // Transfer Form State
  const [buyerAadhaar, setBuyerAadhaar] = useState("");
  const [stampDuty, setStampDuty] = useState("");
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState(false);
  
  const [formError, setFormError] = useState("");
  const [registering, setRegistering] = useState(false);

  // Check login
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Load owned properties
  const loadOwnedProperties = async () => {
    if (!user) return;
    try {
      // 1. Self-healing: Check if the logged-in user still exists in the database.
      // If Vercel database container reset, this will restore their database record automatically!
      const cleanAadhaar = user.aadhaarHash.replace("aadhaar_", "");
      const checkRes = await fetch(`/api/user/lookup?aadhaar=${encodeURIComponent(cleanAadhaar)}`);
      
      if (!checkRes.ok && checkRes.status === 404) {
        console.log("[Self-Healing] User record not found in database. Re-syncing profile details...");
        const syncRes = await fetch("/api/user/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            aadhaar: cleanAadhaar,
            name: user.name,
            phone: user.phone,
            role: user.role,
            walletAddress: user.walletAddress || null,
          }),
        });
        if (!syncRes.ok) {
          console.error("Self-healing: User registration sync failed.");
        }
      }

      // 2. Fetch properties from the database
      const res = await fetch(`/api/property?query=${user.name}&type=ownerName`);
      if (res.ok) {
        const data = await res.json();
        
        // 3. Self-healing: Check if local properties exist that are missing from the database
        const localProps = JSON.parse(localStorage.getItem("landchain_local_properties") || "[]");
        const userLocalProps = localProps.filter((p: any) => p.ownerAadhaar === cleanAadhaar);
        
        const dbSurveyNumbers = new Set(data.map((p: any) => p.surveyNumber));
        const missingProps = userLocalProps.filter((lp: any) => !dbSurveyNumbers.has(lp.surveyNumber));
        
        if (missingProps.length > 0) {
          console.log(`[Self-Healing] Syncing ${missingProps.length} missing properties to database...`);
          for (const lp of missingProps) {
            await fetch("/api/property", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                parcelId: lp.parcelId,
                surveyNumber: lp.surveyNumber,
                area: lp.area,
                location: lp.location,
                latitude: lp.latitude,
                longitude: lp.longitude,
                ipfsHash: lp.ipfsHash,
                blockchainTxHash: lp.blockchainTxHash,
                ownerId: user.id
              }),
            });
          }
          // Reload from db
          const retryRes = await fetch(`/api/property?query=${user.name}&type=ownerName`);
          if (retryRes.ok) {
            const retryData = await retryRes.json();
            setProperties(retryData);
            return;
          }
        }
        
        setProperties(data);
      }
    } catch (err) {
      console.error("Failed to load properties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwnedProperties();
  }, [user]);

  // Form navigation
  const nextStep = () => {
    if (step === 1 && !kycVerified) {
      setFormError("Please verify your Aadhaar identity before proceeding.");
      return;
    }
    if (step === 2 && (!surveyNum || !area || !location)) {
      setFormError("Please fill out all property details.");
      return;
    }
    if (step === 3 && !ipfsCid) {
      setFormError("Please upload deed document and generate IPFS hash.");
      return;
    }
    
    setFormError("");
    const next = step + 1;
    setStep(next);
    setProgressPercent(next * 25);
  };

  const prevStep = () => {
    setFormError("");
    const prev = step - 1;
    setStep(prev);
    setProgressPercent(prev * 25);
  };

  // Step 1: Aadhaar OTP verification
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
      } else {
        setSimulatedOtp("");
        setShowSmsBanner(false);
      }
      setKycOtpSent(true);
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
      setFormError("");
    } catch (err) {
      setFormError("An error occurred during verification.");
    } finally {
      setKycLoading(false);
    }
  };

  // Step 3: Drag & Drop with SHA-256 calculation + Pinata Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDeedFile(file);
    setUploadingIpfs(true);
    setFormError("");

    try {
      // Calculate SHA-256 Client-side
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

      // Upload to IPFS via local Pinata wrapper
      const cid = await uploadFileToIPFS(file, file.name);
      setIpfsCid(cid);
    } catch (err: any) {
      setFormError("IPFS Upload failed: " + err.message);
    } finally {
      setUploadingIpfs(false);
    }
  };

  // Step 4: Simple Boundary Point drawer
  const handleAddMapPoint = (x: number, y: number) => {
    // scale coordinates around Delhi Noida base
    const lat = 28.62 + (y / 1000);
    const lng = 77.37 + (x / 1000);
    setDrawnPoints([...drawnPoints, [lng, lat]]);
    setMapLat(lat);
    setMapLng(lng);
  };

  const handleClearMapPoints = () => {
    setDrawnPoints([]);
  };

  // Confirm and Register
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

    // Generate random parcel ID
    const parcelId = `PARCEL-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`;

    try {
      // 1. Submit on-chain via ethers
      const txHash = await registerPropertyOnChain(parcelId, ipfsCid);

      // 2. Submit details to backend
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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to write property to database.");
      }

      // Save property backup details locally in localStorage to survive Vercel database container wipes
      if (typeof window !== "undefined") {
        const localProps = JSON.parse(localStorage.getItem("landchain_local_properties") || "[]");
        const cleanAadhaar = user?.aadhaarHash?.replace("aadhaar_", "") || "";
        if (!localProps.some((p: any) => p.parcelId === parcelId)) {
          localProps.push({
            parcelId,
            surveyNumber: surveyNum,
            area: parseFloat(area),
            location,
            latitude: mapLat,
            longitude: mapLng,
            ipfsHash: ipfsCid,
            blockchainTxHash: txHash,
            ownerId: user?.id,
            ownerAadhaar: cleanAadhaar,
          });
          localStorage.setItem("landchain_local_properties", JSON.stringify(localProps));
        }
      }

      // Reload owned properties
      await loadOwnedProperties();
      
      // Close form and reset
      setFormOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || "An error occurred during registry submission.");
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
    setKycMaskedPhone("");
    setSimulatedOtp("");
    setShowSmsBanner(false);
    setSurveyNum("");
    setArea("");
    setLocation("");
    setDeedFile(null);
    setDeedHash("");
    setIpfsCid("");
    setDrawnPoints([]);
    setSelectedState("Uttar Pradesh");
    setDistrict("Gautam Buddha Nagar (Noida)");
  };

  // Initiate Transfer Submit
  const handleInitiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError("");
    setTransferSuccess(false);

    if (!selectedPropForTransfer) return;

    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: selectedPropForTransfer.id,
          fromOwnerId: user?.id,
          toOwnerAadhaar: buyerAadhaar,
          stampDuty: parseFloat(stampDuty),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate transfer.");
      }

      setTransferSuccess(true);
      setTimeout(() => {
        setTransferModalOpen(false);
        setBuyerAadhaar("");
        setStampDuty("");
        setSelectedPropForTransfer(null);
      }, 1500);
    } catch (err: any) {
      setTransferError(err.message || "Failed to submit transfer request.");
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-10">
      {/* Simulated Phone Push Notification for OTP */}
      {showSmsBanner && simulatedOtp && (
        <motion.div
          initial={{ y: -120, opacity: 0, scale: 0.95 }}
          animate={{ y: 96, opacity: 1, scale: 1 }}
          exit={{ y: -120, opacity: 0, scale: 0.95 }}
          className="fixed top-0 left-1/2 -translate-x-1/2 max-w-sm w-[90%] bg-slate-900/95 text-white backdrop-blur-xl border-[0.5px] border-white/10 p-4 rounded-card shadow-2xl z-[9999] flex items-start space-x-3 text-xs"
        >
          <div className="p-2 rounded-element bg-brand flex-shrink-0 text-white shadow-md">
            <IconFingerprint className="w-5 h-5" />
          </div>
          <div className="flex-grow space-y-1">
            <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              <span>💬 UIDAI OTP GATEWAY</span>
              <span>Now</span>
            </div>
            <p className="font-body text-slate-100 leading-normal text-[11px]">
              Secure LandChain Verification code is <strong className="text-brand-mid font-extrabold select-all tracking-wider text-xs px-1 py-0.5 rounded bg-white/10">{simulatedOtp}</strong>. Valid for 5 minutes.
            </p>
          </div>
          <button 
            onClick={() => setShowSmsBanner(false)}
            className="text-slate-400 hover:text-white font-bold text-xs p-1 cursor-pointer transition-colors"
          >
            ×
          </button>
        </motion.div>
      )}
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/80">
          <div className="space-y-1">
            <h1 className="font-heading font-extrabold text-3xl">Citizen Registry Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-body">
              Log properties, complete KYC verifications, and initiate legal mutation requests.
            </p>
          </div>
          
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-element bg-brand hover:bg-brand-mid text-white font-heading font-semibold text-sm transition-colors cursor-pointer shadow-none"
          >
            <IconPlus className="w-4.5 h-4.5" />
            Register New Property
          </button>
        </div>

        {/* Properties list */}
        <div className="space-y-4">
          <h2 className="font-heading font-bold text-lg text-slate-700 dark:text-slate-300">
            Your Registered Assets ({properties.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center text-slate-400 font-heading">
              Loading registry index...
            </div>
          ) : properties.length === 0 ? (
            <div className="py-12 text-center lc-border rounded-card border-dashed">
              <p className="text-slate-400 font-body text-sm">You do not own any registered properties.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <div 
                  key={prop.id} 
                  className="lc-border rounded-card p-6 bg-slate-50/40 dark:bg-slate-900/10 flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-xs px-2 py-0.5 bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid rounded-pill">
                        {prop.parcelId}
                      </span>
                      <span className="text-[10px] uppercase font-heading font-bold text-slate-400">
                        {prop.area.toLocaleString()} Sq Ft
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-lg">
                      Survey: {prop.surveyNumber}
                    </h3>

                    <p className="text-xs text-slate-500 font-body">
                      {prop.location}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-brand dark:text-brand-mid font-semibold">
                      TX: {prop.blockchainTxHash.substring(0, 14)}...
                    </span>

                    <button
                      onClick={() => {
                        setSelectedPropForTransfer(prop);
                        setTransferModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-brand hover:border-brand dark:hover:text-brand-mid dark:hover:border-brand-mid font-heading font-semibold text-xs rounded-element lc-border cursor-pointer transition-colors"
                    >
                      Initiate Transfer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Multi-step property register form modal */}
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="max-w-xl w-full bg-white dark:bg-[#030806] rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 p-8 space-y-8 flex flex-col max-h-[90vh]">
              
              {/* Form Title & Progress bar */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading font-extrabold text-xl">Property Registry Gateway</h2>
                  <button
                    onClick={() => {
                      setFormOpen(false);
                      resetForm();
                    }}
                    className="text-xs font-heading font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand dark:bg-brand-mid transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                {/* Step indicators */}
                <div className="flex items-center justify-between text-[10px] uppercase font-heading font-bold text-slate-400">
                  <span className={step >= 1 ? "text-brand dark:text-brand-mid" : ""}>1. KYC</span>
                  <span className={step >= 2 ? "text-brand dark:text-brand-mid" : ""}>2. Specs</span>
                  <span className={step >= 3 ? "text-brand dark:text-brand-mid" : ""}>3. IPFS Deed</span>
                  <span className={step >= 4 ? "text-brand dark:text-brand-mid" : ""}>4. Boundaries</span>
                </div>
              </div>

              {/* Form Scroll Area */}
              <div className="flex-grow overflow-y-auto space-y-6 pr-1">
                
                {formError && (
                  <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/20 rounded-element font-body lc-border border-rose-200 dark:border-rose-900">
                    {formError}
                  </div>
                )}

                {/* STEP 1: Aadhaar OTP Verification */}
                {step === 1 && (
                  <div className="space-y-4 font-body text-sm">
                    <div className="p-4 rounded-element bg-slate-50 dark:bg-slate-900/50 lc-border text-xs text-slate-500 leading-relaxed">
                      KYC verification links the property deed record to your legal resident identity on the registry database.
                    </div>

                    {!kycOtpSent ? (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Aadhaar UID</label>
                          <input
                            type="text"
                            placeholder="Enter 12-digit Aadhaar UID"
                            value={kycAadhaar}
                            onChange={(e) => setKycAadhaar(e.target.value)}
                            className="w-full px-4 py-3 rounded-element bg-slate-50 dark:bg-slate-900/50 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                            disabled={kycVerified}
                          />
                        </div>
                        {!kycVerified && (
                          <button
                            type="button"
                            onClick={handleSendKycOtp}
                            disabled={kycLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-brand hover:bg-brand-mid text-white font-heading font-semibold text-xs rounded-element transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {kycLoading ? "Sending..." : "Send OTP Code"}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-3 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 rounded-element font-body lc-border border-emerald-200 dark:border-emerald-900 flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <IconCircleCheck className="w-4 h-4 flex-shrink-0" />
                            <span className="font-semibold">OTP sent to registered mobile: {kycMaskedPhone}</span>
                          </div>
                          {!simulatedOtp ? (
                            <span className="text-[10px] text-emerald-500/80 ml-6">Please check your mobile phone for the secure verification code.</span>
                          ) : (
                            <span className="text-[10px] text-emerald-500/80 ml-6">Simulating secure OTP dispatch. Use the code shown in the notification toast above.</span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-heading font-bold text-slate-400">verification code</label>
                          <input
                            type="password"
                            placeholder="Enter 6-digit OTP"
                            value={kycOtp}
                            onChange={(e) => setKycOtp(e.target.value)}
                            className="w-full px-4 py-3 rounded-element bg-slate-50 dark:bg-slate-900/50 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                            disabled={kycVerified}
                          />
                        </div>
                        {!kycVerified && (
                          <button
                            type="button"
                            onClick={handleVerifyKycOtp}
                            disabled={kycLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-brand hover:bg-brand-mid text-white font-heading font-semibold text-xs rounded-element transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {kycLoading ? "Verifying..." : "Verify OTP"}
                          </button>
                        )}
                      </div>
                    )}

                    {kycVerified && (
                      <div className="p-4 rounded-element bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-heading font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 lc-border border-emerald-200 dark:border-emerald-900">
                        <IconCircleCheck className="w-5 h-5" />
                        Identity Verified
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: Property Specs */}
                {step === 2 && (
                  <div className="space-y-4 font-body text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Survey Number</label>
                        <input
                          type="text"
                          placeholder="e.g. SURVEY-102"
                          value={surveyNum}
                          onChange={(e) => setSurveyNum(e.target.value)}
                          className="w-full px-4 py-3 rounded-element bg-slate-50 dark:bg-slate-900/50 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Area (Sq Ft)</label>
                        <input
                          type="number"
                          placeholder="e.g. 1500"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          className="w-full px-4 py-3 rounded-element bg-slate-50 dark:bg-slate-900/50 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Physical Address</label>
                      <input
                        type="text"
                        placeholder="Complete property address details"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-4 py-3 rounded-element bg-slate-50 dark:bg-slate-900/50 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Property Type</label>
                        <select
                          value={propertyType}
                          onChange={(e) => setPropertyType(e.target.value)}
                          className="w-full px-4 py-3 rounded-element bg-slate-50 dark:bg-slate-900/50 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                        >
                          <option>Residential</option>
                          <option>Commercial</option>
                          <option>Agricultural</option>
                          <option>Industrial</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-heading font-bold text-slate-400">State</label>
                        <select
                          value={selectedState}
                          onChange={(e) => {
                            const newState = e.target.value;
                            setSelectedState(newState);
                            const districts = stateDistricts[newState] || [];
                            if (districts.length > 0) {
                              setDistrict(districts[0]);
                            } else {
                              setDistrict("");
                            }
                          }}
                          className="w-full px-4 py-3 rounded-element bg-slate-50 dark:bg-slate-900/50 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                        >
                          {Object.keys(stateDistricts).map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-heading font-bold text-slate-400">District</label>
                        <select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full px-4 py-3 rounded-element bg-slate-50 dark:bg-slate-900/50 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                        >
                          {(stateDistricts[selectedState] || []).map((dst) => (
                            <option key={dst} value={dst}>
                              {dst}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Document Hashing & IPFS */}
                {step === 3 && (
                  <div className="space-y-4 font-body text-sm">
                    <div className="p-4 rounded-element bg-slate-50 dark:bg-slate-900/50 lc-border text-xs text-slate-500 leading-relaxed">
                      Upload your title deed, mutation copy, or NOC. The file will be cryptographically hashed on your client before being pinned on IPFS.
                    </div>

                    {/* Dropzone */}
                    <div className="w-full h-36 rounded-element border-[0.5px] border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-6 text-center bg-slate-50/20 dark:bg-slate-900/10 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors relative">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full"
                      />
                      <IconFileText className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-xs text-slate-500 font-semibold">
                        {deedFile ? deedFile.name : "Drag & drop or click to upload PDF Title Deed"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">PDF format under 10MB</p>
                    </div>

                    {uploadingIpfs && (
                      <div className="text-center text-xs text-slate-400 font-heading">
                        Uploading block to IPFS...
                      </div>
                    )}

                    {ipfsCid && (
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Client-Side File SHA-256</label>
                          <div className="text-xs font-mono bg-slate-100 dark:bg-slate-900/40 p-2.5 rounded-element break-all lc-border">
                            {deedHash}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-heading font-bold text-slate-400">IPFS CID Reference</label>
                          <div className="text-xs font-mono bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-element break-all lc-border border-emerald-200/50 dark:border-emerald-900/50">
                            {ipfsCid}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 4: Spatial Boundaries */}
                {step === 4 && (
                  <div className="space-y-4 font-body text-sm">
                    <div className="p-4 rounded-element bg-slate-50 dark:bg-slate-900/50 lc-border text-xs text-slate-500 leading-relaxed flex items-center justify-between">
                      <span>Click inside the grid map to draw a closed parcel boundary polygon (min 3 points).</span>
                      {drawnPoints.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearMapPoints}
                          className="text-xs font-heading font-bold text-rose-500 hover:underline cursor-pointer"
                        >
                          Clear Points
                        </button>
                      )}
                    </div>

                    {/* Interactive Canvas Drawing */}
                    <div className="w-full h-64 rounded-element bg-slate-100 dark:bg-slate-900/30 lc-border relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.06)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:16px_16px]"></div>
                      
                      {/* Click catcher overlay */}
                      <div 
                        className="absolute inset-0 z-20 cursor-crosshair"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const y = e.clientY - rect.top;
                          handleAddMapPoint(x, y);
                        }}
                      ></div>

                      {/* SVG Canvas Map */}
                      <svg className="w-full h-full absolute inset-0 z-10">
                        {drawnPoints.length > 0 && (
                          <g>
                            {/* Draw points */}
                            {drawnPoints.map((pt, idx) => {
                              // map GPS coordinates back to canvas dimensions for rendering
                              const x = (pt[0] - 77.37) * 1000;
                              const y = (pt[1] - 28.62) * 1000;
                              return (
                                <circle 
                                  key={idx} 
                                  cx={x} 
                                  cy={y} 
                                  r="4" 
                                  fill="#0F6E56" 
                                  className="dark:fill-[#1D9E75]"
                                />
                              );
                            })}
                            {/* Draw boundaries lines */}
                            {drawnPoints.length >= 2 && (
                              <polyline
                                points={drawnPoints.map(pt => {
                                  const x = (pt[0] - 77.37) * 1000;
                                  const y = (pt[1] - 28.62) * 1000;
                                  return `${x},${y}`;
                                }).join(" ")}
                                fill="none"
                                stroke="#0F6E56"
                                strokeWidth="2"
                              />
                            )}
                            {/* Close polygon if 3+ points */}
                            {drawnPoints.length >= 3 && (
                              <polygon
                                points={drawnPoints.map(pt => {
                                  const x = (pt[0] - 77.37) * 1000;
                                  const y = (pt[1] - 28.62) * 1000;
                                  return `${x},${y}`;
                                }).join(" ")}
                                fill="#0F6E56"
                                fillOpacity="0.1"
                                stroke="#0F6E56"
                                strokeWidth="2"
                                strokeDasharray="3"
                              />
                            )}
                          </g>
                        )}
                      </svg>

                      {drawnPoints.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-heading text-xs z-10">
                          Click multiple spots in this grid to draw boundary points
                        </div>
                      )}

                      {/* Info coordinates overlay */}
                      <div className="absolute bottom-3 left-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-pill text-[10px] font-mono lc-border z-30">
                        Points logged: {drawnPoints.length}
                      </div>
                    </div>

                    {/* Connected wallet validation check */}
                    <div className="pt-2">
                      {!walletAddress ? (
                        <button
                          type="button"
                          onClick={connectWallet}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-heading font-semibold text-xs rounded-element lc-border border-rose-200 cursor-pointer"
                        >
                          Connect MetaMask Wallet to Authorize Transaction
                        </button>
                      ) : (
                        <div className="p-3 text-xs bg-slate-50 dark:bg-slate-900/50 rounded-element font-body lc-border flex items-center justify-between">
                          <span className="text-slate-400">Signer Wallet:</span>
                          <span className="font-mono font-semibold">{walletAddress.substring(0, 15)}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Form Footer Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-element text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-heading font-bold text-xs lc-border cursor-pointer transition-colors"
                  >
                    <IconArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                
                {step < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-grow flex items-center justify-center gap-1.5 py-3 rounded-element bg-brand hover:bg-brand-mid text-white font-heading font-semibold text-xs cursor-pointer transition-colors"
                  >
                    Continue
                    <IconArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={registering}
                    className="flex-grow flex items-center justify-center gap-1.5 py-3 rounded-element bg-brand hover:bg-brand-mid text-white font-heading font-semibold text-xs cursor-pointer transition-colors shadow-none"
                  >
                    {registering ? (
                      <>
                        <span className="animate-spin border-2 border-white border-t-transparent w-4 h-4 rounded-full mr-1"></span>
                        Broadcasting Transaction...
                      </>
                    ) : (
                      <>
                        <IconCircleCheck className="w-4.5 h-4.5" />
                        Sign & Register Property
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Transfer Modal */}
        {transferModalOpen && selectedPropForTransfer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="max-w-md w-full bg-white dark:bg-[#030806] rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 p-8 space-y-6">
              
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-extrabold text-xl">Initiate Title Mutation</h2>
                <button
                  onClick={() => {
                    setTransferModalOpen(false);
                    setSelectedPropForTransfer(null);
                    setBuyerAadhaar("");
                    setStampDuty("");
                    setTransferError("");
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="p-4 rounded-element bg-slate-50 dark:bg-slate-900/50 lc-border text-xs text-slate-500 leading-relaxed font-body">
                Initiating transfer locks this property record for registrar review. Enter the buyer's Aadhaar Number and deposit the stamp duty log.
              </div>

              {transferSuccess && (
                <div className="p-3 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 rounded-element font-body lc-border border-emerald-200 dark:border-emerald-900 flex items-center gap-2">
                  <IconCircleCheck className="w-4.5 h-4.5 flex-shrink-0" />
                  <span>Mutation Requested Successfully! registrar notified.</span>
                </div>
              )}

              {transferError && (
                <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/20 rounded-element font-body lc-border border-rose-200 dark:border-rose-900">
                  {transferError}
                </div>
              )}

              <form onSubmit={handleInitiateTransfer} className="space-y-4 font-body text-sm">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-heading font-bold text-slate-400">Property Parcel ID</span>
                  <div className="p-2.5 rounded-element bg-slate-100 dark:bg-slate-900/40 text-xs font-semibold lc-border">
                    {selectedPropForTransfer.parcelId} (Survey: {selectedPropForTransfer.surveyNumber})
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Buyer Aadhaar Number</label>
                  <input
                    type="text"
                    placeholder="Enter buyer's 12-digit Aadhaar UID"
                    value={buyerAadhaar}
                    onChange={(e) => setBuyerAadhaar(e.target.value)}
                    className="w-full px-4 py-3 rounded-element bg-slate-50 dark:bg-slate-900 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Agreed Stamp Duty (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 75000"
                    value={stampDuty}
                    onChange={(e) => setStampDuty(e.target.value)}
                    className="w-full px-4 py-3 rounded-element bg-slate-50 dark:bg-slate-900 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-brand hover:bg-brand-mid text-white font-heading font-semibold text-xs rounded-element transition-colors cursor-pointer shadow-none pt-2"
                >
                  <IconCoins className="w-4 h-4" />
                  Initiate Lock & Mutation Request
                </button>
              </form>

            </div>
          </div>
        )}

    </div>
  );
}
