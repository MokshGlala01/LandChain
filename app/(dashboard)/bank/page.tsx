"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { useRouter } from "next/navigation";

import { 
  IconBuildingBank, 
  IconSearch, 
  IconShieldCheck, 
  IconLock,
  IconLockOpen,
  IconCoins,
  IconTimeline,
  IconExternalLink,
  IconCode
} from "@tabler/icons-react";

interface Property {
  id: string;
  parcelId: string;
  surveyNumber: string;
  area: number;
  location: string;
  ipfsHash: string;
  blockchainTxHash: string;
  status: string;
  owner: {
    name: string;
    walletAddress?: string | null;
  };
}

export default function BankPortal() {
  const { user } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lienRegistering, setLienRegistering] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Check banker role
  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.role !== "BANK") {
      router.push("/login");
    }
  }, [user, router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setProperty(null);
    setSuccessMsg("");

    if (!searchQuery.trim()) {
      setError("Please input a parcel ID.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/verify?parcelId=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Parcel ID not found in database.");
        }
        throw new Error("Failed to query registry node.");
      }
      const data = await res.json();
      setProperty(data);
    } catch (err: any) {
      setError(err.message || "Failed to search registry.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterLien = async () => {
    if (!property) return;
    setLienRegistering(true);
    setError("");
    setSuccessMsg("");

    try {
      // Simulate registrar webhook or direct API to update property status to FROZEN
      // We will create a local state or call a patch/webhook.
      // Let's mock a delay and update local property status for UI representation
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      setProperty({
        ...property,
        status: "FROZEN"
      });
      setSuccessMsg(`Lien registered successfully. Parcel ${property.parcelId} is now locked (FROZEN).`);
    } catch (err: any) {
      setError("Failed to register lien.");
    } finally {
      setLienRegistering(false);
    }
  };

  if (!user || user.role !== "BANK") return null;

  return (
    <div className="space-y-10">
        
        {/* Title */}
        <div className="space-y-1.5 pb-6 border-b border-slate-100 dark:border-slate-800/80">
          <h1 className="font-heading font-extrabold text-3xl flex items-center gap-2">
            <IconBuildingBank className="w-8 h-8 text-brand" />
            Bank verification portal
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-body">
            Verify real estate collaterals, register financial liens, and retrieve encumbrance certificate feeds.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lc-border rounded-card p-6 bg-slate-50/40 dark:bg-slate-900/10 space-y-2">
            <div className="text-[10px] uppercase font-heading font-bold text-slate-400 font-body">Collateral Checks</div>
            <div className="font-heading font-extrabold text-3xl text-brand dark:text-brand-mid">182</div>
          </div>
          <div className="lc-border rounded-card p-6 bg-slate-50/40 dark:bg-slate-900/10 space-y-2">
            <div className="text-[10px] uppercase font-heading font-bold text-slate-400 font-body">Active Liens Lock</div>
            <div className="font-heading font-extrabold text-3xl text-brand dark:text-brand-mid">24</div>
          </div>
          <div className="lc-border rounded-card p-6 bg-slate-50/40 dark:bg-slate-900/10 space-y-2">
            <div className="text-[10px] uppercase font-heading font-bold text-slate-400 font-body">Approved Valuations</div>
            <div className="font-heading font-extrabold text-3xl text-brand dark:text-brand-mid">₹42.5 Cr</div>
          </div>
          <div className="lc-border rounded-card p-6 bg-slate-50/40 dark:bg-slate-900/10 space-y-2">
            <div className="text-[10px] uppercase font-heading font-bold text-slate-400 font-body">Credit Clearances</div>
            <div className="font-heading font-extrabold text-3xl text-brand dark:text-brand-mid">99.1%</div>
          </div>
        </div>

        {/* Search Collateral */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Search column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="lc-border rounded-card p-6 bg-slate-50/40 dark:bg-slate-900/10 space-y-4">
              <h2 className="font-heading font-bold text-base">Collateral Search</h2>
              <form onSubmit={handleSearch} className="space-y-4 font-body text-sm">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Parcel ID</label>
                  <input
                    type="text"
                    placeholder="e.g. PARCEL-4902-881"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-element bg-white dark:bg-slate-900 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-brand hover:bg-brand-mid text-white font-heading font-semibold text-xs rounded-element transition-colors cursor-pointer"
                >
                  {loading ? "Verifying..." : "Verify Asset"}
                  <IconSearch className="w-4 h-4" />
                </button>
              </form>

              {error && (
                <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/20 rounded-element font-body lc-border border-rose-200 dark:border-rose-900">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Results column */}
          <div className="lg:col-span-2">
            {property ? (
              <div className="lc-border rounded-card p-8 bg-white dark:bg-slate-900/10 space-y-8">
                
                {/* Header state */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="space-y-1">
                    <span className="font-heading font-bold text-xs px-2.5 py-1 bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid rounded-pill">
                      {property.parcelId}
                    </span>
                    <h3 className="font-heading font-extrabold text-xl pt-1">
                      Verification Result
                    </h3>
                  </div>

                  <span className={`text-xs font-heading font-bold px-3 py-1.5 rounded-pill ${
                    property.status === "ACTIVE" 
                      ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" 
                      : "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400"
                  }`}>
                    Status: {property.status}
                  </span>
                </div>

                {successMsg && (
                  <div className="p-3 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 rounded-element font-body lc-border border-emerald-200 dark:border-emerald-900 flex items-center gap-2">
                    <IconShieldCheck className="w-4.5 h-4.5 flex-shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-6 font-body text-sm">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-heading font-bold text-slate-400">Current Owner</span>
                    <p className="font-semibold">{property.owner.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-heading font-bold text-slate-400">Survey ID</span>
                    <p className="font-semibold">{property.surveyNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-heading font-bold text-slate-400">Deed IPFS Reference</span>
                    <p className="font-mono text-xs truncate">{property.ipfsHash}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-heading font-bold text-slate-400">Asset Area</span>
                    <p className="font-semibold">{property.area.toLocaleString()} Sq Ft</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-[10px] uppercase font-heading font-bold text-slate-400">Property Location</span>
                    <p className="font-semibold text-xs">{property.location}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-[10px] uppercase font-heading font-bold text-slate-400">Active Lien Status</span>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      {property.status === "ACTIVE" ? (
                        <>
                          <IconLockOpen className="w-4 h-4 text-emerald-600" />
                          CLEAN: No financial liens or active mortgages registered.
                        </>
                      ) : (
                        <>
                          <IconLock className="w-4 h-4 text-rose-500" />
                          LOCKED: Active mortgage registered on this collateral.
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 border-t flex gap-4">
                  {property.status === "ACTIVE" ? (
                    <button
                      onClick={handleRegisterLien}
                      disabled={lienRegistering}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand hover:bg-brand-mid text-white font-heading font-semibold text-xs rounded-element transition-colors cursor-pointer shadow-none"
                    >
                      {lienRegistering ? "Broadcasting Lock..." : "Register Mortgage Lien (Freeze)"}
                      <IconLock className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 font-heading font-semibold text-xs rounded-element lc-border border-dashed cursor-not-allowed"
                    >
                      Collateral Already Locked
                      <IconLock className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="py-24 text-center lc-border rounded-card border-dashed">
                <p className="text-slate-400 text-sm font-body">Input a valid parcel ID and click "Verify Asset".</p>
              </div>
            )}
          </div>

        </div>

    </div>
  );
}
