"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  IconShieldCheck, 
  IconShieldX, 
  IconCopy, 
  IconCheck, 
  IconFileText, 
  IconUser, 
  IconMapPin, 
  IconLink,
  IconClock,
  IconArrowLeft,
  IconSearch
} from "@tabler/icons-react";

interface VerificationData {
  parcelId: string;
  surveyNumber: string;
  area: number;
  location: string;
  latitude: number;
  longitude: number;
  ipfsHash: string;
  blockchainTxHash: string;
  status: string;
  registeredAt: string;
  owner: {
    name: string;
    walletAddress: string;
    aadhaarHash: string;
  };
  verification: {
    verified: boolean;
    blockchainChecked: boolean;
    dbMatch: boolean;
    timestamp: string;
  };
}

export default function VerifyProperty({ params }: { params: { id: string } }) {
  const parcelId = decodeURIComponent(params.id);
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const res = await fetch(`/api/verify?parcelId=${encodeURIComponent(parcelId)}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Tampered: Parcel ID not found in government database registry.");
          }
          const errData = await res.json();
          throw new Error(errData.error || "Verification check failed.");
        }
        const verifyResult = await res.json();
        setData(verifyResult);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to establish blockchain node connection.");
      } finally {
        setLoading(false);
      }
    };

    checkVerification();
  }, [parcelId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-center py-10 px-6">
        <div className="max-w-2xl w-full bg-slate-50/50 dark:bg-slate-900/10 lc-border rounded-card p-8 md:p-12 space-y-8 relative overflow-hidden">
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light/10 dark:bg-brand-dark/5 rounded-full blur-2xl"></div>

          {loading ? (
            /* Loading State */
            <div className="text-center py-12 space-y-4">
              <span className="inline-block animate-spin border-3 border-brand border-t-transparent w-8 h-8 rounded-full"></span>
              <p className="font-heading text-sm font-semibold text-slate-400">
                Establishing handshake with Polygon nodes...
              </p>
            </div>
          ) : error ? (
            /* Error / Tampered State */
            <div className="space-y-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <IconShieldX className="w-9 h-9 stroke-[1.8]" />
                </div>
                <h2 className="font-heading font-extrabold text-2xl text-rose-600 dark:text-rose-400">
                  Registry Alert: Tampered
                </h2>
                <p className="text-sm text-slate-500 max-w-md font-body leading-relaxed">
                  {error} Crytographic proofs do not match government mutations. The parcel has either been frozen or unregistered.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/50 flex justify-center">
                <Link 
                  href="/search" 
                  className="inline-flex items-center gap-2 text-xs font-heading font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <IconArrowLeft className="w-4 h-4" />
                  Return to Registry Search
                </Link>
              </div>
            </div>
          ) : data ? (
            /* Verified State */
            <div className="space-y-8">
              
              {/* Verification Header Badge */}
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-pulse">
                  <IconShieldCheck className="w-9 h-9 stroke-[1.8]" />
                </div>
                <div className="px-3.5 py-1.5 rounded-pill bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-heading font-bold text-xs uppercase tracking-widest lc-border">
                  ✓ Verified Record
                </div>
                <h2 className="font-heading font-extrabold text-3xl">
                  Cryptographic Land Deed
                </h2>
                <p className="text-xs font-body text-slate-400">
                  On-chain record timestamp: {new Date(data.registeredAt).toLocaleString()}
                </p>
              </div>

              <div className="border-t border-b border-slate-200/60 dark:border-slate-800/60 py-6 space-y-4">
                
                {/* Details layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm font-body">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-heading font-bold text-slate-400">Parcel ID</span>
                    <p className="font-semibold">{data.parcelId}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-heading font-bold text-slate-400">Survey Number</span>
                    <p className="font-semibold">{data.surveyNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-heading font-bold text-slate-400">Owner Name</span>
                    <p className="font-semibold">{data.owner.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-heading font-bold text-slate-400">Property Area</span>
                    <p className="font-semibold">{data.area.toLocaleString()} Sq Ft</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-[10px] uppercase font-heading font-bold text-slate-400">Physical Address</span>
                    <p className="font-semibold text-xs">{data.location}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-[10px] uppercase font-heading font-bold text-slate-400">IPFS Document Hash (Deed)</span>
                    <p className="font-mono text-[11px] bg-white dark:bg-slate-900/60 p-2.5 rounded-element break-all lc-border">
                      {data.ipfsHash}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-[10px] uppercase font-heading font-bold text-slate-400">Blockchain Block Tx</span>
                    <p className="font-mono text-[11px] bg-white dark:bg-slate-900/60 p-2.5 rounded-element break-all lc-border">
                      {data.blockchainTxHash}
                    </p>
                  </div>
                </div>

              </div>

              {/* Share and back buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleShare}
                  className="flex-grow flex items-center justify-center gap-2 py-3 rounded-element bg-brand hover:bg-brand-mid text-white font-heading font-semibold text-sm transition-colors cursor-pointer shadow-none"
                >
                  {copied ? (
                    <>
                      <IconCheck className="w-4 h-4" />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <IconCopy className="w-4 h-4" />
                      Copy Verification URL
                    </>
                  )}
                </button>
                <Link 
                  href="/search"
                  className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-6 py-3 rounded-element bg-white hover:bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-heading font-semibold text-sm lc-border transition-colors"
                >
                  <IconSearch className="w-4 h-4" />
                  Search Registry
                </Link>
              </div>

            </div>
          ) : null}

        </div>
    </div>
  );
}
