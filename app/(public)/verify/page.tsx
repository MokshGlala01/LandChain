"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { IconShieldCheck, IconSearch, IconArrowRight } from "@tabler/icons-react";

export default function VerifyLookup() {
  const [parcelId, setParcelId] = useState("");
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!parcelId.trim()) {
      setError("Please enter a valid Parcel ID.");
      return;
    }

    // Redirect to the dynamic /verify/[id] route
    router.push(`/verify/${encodeURIComponent(parcelId.trim())}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#030806] text-slate-800 dark:text-slate-100 transition-colors duration-300 relative">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-20 px-6">
        <div className="max-w-md w-full bg-slate-50/50 dark:bg-slate-900/10 lc-border rounded-card p-8 md:p-12 space-y-8 relative overflow-hidden">
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light/10 dark:bg-brand-dark/5 rounded-full blur-2xl"></div>

          {/* Header */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid flex items-center justify-center">
              <IconShieldCheck className="w-9 h-9 stroke-[1.8]" />
            </div>
            <h2 className="font-heading font-extrabold text-3xl">
              Deed Verification
            </h2>
            <p className="text-sm font-body text-slate-500 dark:text-slate-400">
              Verify the cryptographic authenticity and ownership provenance of any LandChain parcel.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-heading font-bold text-slate-400 dark:text-slate-500">
                Enter Parcel ID
              </label>
              <div className="relative">
                <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. PARCEL-4902-881"
                  value={parcelId}
                  onChange={(e) => setParcelId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-element bg-white dark:bg-slate-900 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-brand-mid"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/20 rounded-element font-body lc-border border-rose-200 dark:border-rose-900">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand hover:bg-brand-mid text-white font-heading font-semibold text-sm rounded-element transition-colors cursor-pointer shadow-none"
            >
              Verify Certificate
              <IconArrowRight className="w-4.5 h-4.5" />
            </button>
          </form>

          {/* Helpful Tip */}
          <div className="text-center font-body text-xs text-slate-400 dark:text-slate-500">
            <span>Tip: Try scanning a QR code or lookup a sample ID like </span>
            <button
              onClick={() => setParcelId("PARCEL-4902-881")}
              className="underline hover:text-brand dark:hover:text-brand-mid cursor-pointer"
            >
              PARCEL-4902-881
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
