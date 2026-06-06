"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useAuth } from "@/components/providers";
import { motion } from "framer-motion";
import { 
  IconUserPlus, 
  IconFingerprint, 
  IconUser, 
  IconPhone, 
  IconMail, 
  IconWallet, 
  IconArrowRight,
  IconCircleCheck
} from "@tabler/icons-react";

export default function RegisterPage() {
  const router = useRouter();
  const { walletAddress, connectWallet } = useAuth();

  const [name, setName] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("CITIZEN");
  const [customWallet, setCustomWallet] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanAadhaar = aadhaar.replace(/\s/g, "");
    if (cleanAadhaar.length !== 12 || isNaN(Number(cleanAadhaar))) {
      setError("Please enter a valid 12-digit Aadhaar Number.");
      setLoading(false);
      return;
    }

    const finalWalletAddress = walletAddress || customWallet || null;

    try {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aadhaar: cleanAadhaar,
          name,
          phone,
          email: email || null,
          role,
          walletAddress: finalWalletAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register user.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#030806] text-slate-800 dark:text-slate-100 transition-colors duration-300 relative">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-6 relative overflow-hidden">
        
        {/* Full-screen city skyline image with a slow zoom/pan Ken Burns animation */}
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1.02, opacity: 1 }}
          transition={{ duration: 4.5, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: "url('/login_background.png')" }}
        />

        {/* Dark overlay for contrast and legibility */}
        <div className="absolute inset-0 bg-slate-950/45 dark:bg-black/60 backdrop-blur-[1.5px] z-10"></div>

        <div className="max-w-lg w-full bg-white/85 dark:bg-[#030806]/85 backdrop-blur-2xl border-[0.5px] border-white/20 dark:border-white/10 rounded-card p-8 space-y-6 relative z-20 shadow-2xl">
          
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid flex items-center justify-center mx-auto">
              <IconUserPlus className="w-7 h-7 stroke-[1.8]" />
            </div>
            <h2 className="font-heading font-extrabold text-2xl">Register Resident ID</h2>
            <p className="text-xs text-slate-400 font-body">
              Link your Aadhaar credentials to an on-chain cryptographic registry profile.
            </p>
          </div>

          {/* Success Alert */}
          {success && (
            <div className="p-3 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 rounded-element font-body lc-border border-emerald-200 dark:border-emerald-900 flex items-center gap-2">
              <IconCircleCheck className="w-4 h-4 flex-shrink-0" />
              <span>Registration Successful! Redirecting to login...</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/20 rounded-element font-body lc-border border-rose-200 dark:border-rose-900">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-body">
            
            {/* Row 1: Name and Aadhaar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">
                  Full Name
                </label>
                <div className="relative">
                  <IconUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-element bg-white dark:bg-slate-900 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">
                  Aadhaar Number
                </label>
                <div className="relative">
                  <IconFingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="12-digit Aadhaar UID"
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-element bg-white dark:bg-slate-900 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Phone and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">
                  Phone Number
                </label>
                <div className="relative">
                  <IconPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-element bg-white dark:bg-slate-900 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <IconMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-element bg-white dark:bg-slate-900 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Role selection */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-heading font-bold text-slate-400">
                Registry System Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-element bg-white dark:bg-slate-900 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
              >
                <option value="CITIZEN">CITIZEN (Land Owner / Buyer)</option>
                <option value="BANK">BANK (Lending Officer)</option>
                <option value="REGISTRAR">REGISTRAR (Govt Mutation Officer)</option>
              </select>
            </div>

            {/* Row 4: Wallet Address */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-heading font-bold text-slate-400">
                Web3 Wallet Address
              </label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <IconWallet className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Connect wallet or paste 0x address"
                    value={walletAddress || customWallet}
                    onChange={(e) => setCustomWallet(e.target.value)}
                    disabled={!!walletAddress}
                    className="w-full pl-10 pr-4 py-3 rounded-element bg-white dark:bg-slate-900 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none disabled:bg-slate-100 dark:disabled:bg-slate-800/50"
                  />
                </div>
                {!walletAddress && (
                  <button
                    type="button"
                    onClick={connectWallet}
                    className="px-4 py-3 bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid font-heading font-bold text-xs rounded-element lc-border cursor-pointer transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand hover:bg-brand-mid text-white font-heading font-semibold text-sm rounded-element transition-colors cursor-pointer shadow-none pt-4"
            >
              {loading ? "Registering Resident..." : "Complete Registration"}
              <IconArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Login link */}
          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-900/60 text-xs font-body text-slate-400">
            <span>Already have a verified ID? </span>
            <Link href="/login" className="text-brand dark:text-brand-mid hover:underline font-semibold">
              Sign In
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
