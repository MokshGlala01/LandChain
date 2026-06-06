"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { 
  IconFingerprint, 
  IconLock, 
  IconArrowRight, 
  IconCircleCheck,
  IconShieldCheck
} from "@tabler/icons-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  
  const [role, setRole] = useState<"CITIZEN" | "BANK" | "REGISTRAR">("CITIZEN");
  const [aadhaar, setAadhaar] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState("");
  const [simulatedOtp, setSimulatedOtp] = useState("");
  const [showSmsBanner, setShowSmsBanner] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate 12-digit Aadhaar
    const cleanAadhaar = aadhaar.replace(/\s/g, "");
    if (cleanAadhaar.length !== 12 || isNaN(Number(cleanAadhaar))) {
      setError("Please enter a valid 12-digit Aadhaar Number.");
      return;
    }

    setLoading(true);
    try {
      let res = await fetch(`/api/user/lookup?aadhaar=${encodeURIComponent(cleanAadhaar)}`);
      let data = await res.json();
      
      // Self-healing: if not found on the backend, try restoring from local storage backup
      if (!res.ok && res.status === 404) {
        if (typeof window !== "undefined") {
          const localUsers = JSON.parse(localStorage.getItem("landchain_local_users") || "[]");
          const matchedUser = localUsers.find((u: any) => u.aadhaar === cleanAadhaar);
          
          if (matchedUser) {
            console.log("[Self-Healing] Restoring database user record from local storage backup...");
            const syncRes = await fetch("/api/user/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(matchedUser),
            });
            
            if (syncRes.ok) {
              // Retry lookup
              res = await fetch(`/api/user/lookup?aadhaar=${encodeURIComponent(cleanAadhaar)}`);
              data = await res.json();
            }
          }
        }
      }
      
      if (!res.ok) {
        setError(data.error || "Aadhaar Number is not registered in the system.");
        setLoading(false);
        return;
      }

      setMaskedPhone(data.phone);
      if (data.role) {
        setRole(data.role);
      }
      if (data.simulatedOtp) {
        setSimulatedOtp(data.simulatedOtp);
        setShowSmsBanner(true);
      } else {
        setSimulatedOtp("");
        setShowSmsBanner(false);
      }
      setOtpSent(true);
    } catch (err) {
      setError("Failed to connect to verification server.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/user/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Incorrect OTP. Please check the code and try again.");
        setLoading(false);
        return;
      }

      const success = await login(aadhaar, role);
      if (success) {
        // Set a mock user cookie so the api routes can read it for fallback session checking
        if (typeof document !== "undefined") {
          const mockUserString = JSON.stringify({
            id: role === "REGISTRAR" ? "usr_registrar_1" : role === "BANK" ? "usr_bank_1" : "usr_citizen_1",
            name: role === "REGISTRAR" ? "Officer Amit Kumar" : role === "BANK" ? "SBI Verifier Officer" : "Rohan Sharma",
            role,
            aadhaarHash: "aadhaar_" + aadhaar.replace(/\s/g, "")
          });
          document.cookie = `landchain_user=${encodeURIComponent(mockUserString)}; path=/; max-age=86400;`;
        }

        setShowSmsBanner(false);

        // Redirect based on role
        if (role === "REGISTRAR") {
          router.push("/registrar");
        } else if (role === "BANK") {
          router.push("/bank");
        } else {
          router.push("/citizen");
        }
      } else {
        setError("Authentication failed.");
      }
    } catch (err) {
      setError("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#030806] text-slate-800 dark:text-slate-100 transition-colors duration-300 relative">
      <Navbar />

      {/* Simulated Phone Push Notification for OTP */}
      {showSmsBanner && simulatedOtp && (
        <motion.div
          initial={{ y: -80, opacity: 0, scale: 0.95 }}
          animate={{ y: 24, opacity: 1, scale: 1 }}
          exit={{ y: -80, opacity: 0, scale: 0.95 }}
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

        <div className="max-w-md w-full bg-white/85 dark:bg-[#030806]/85 backdrop-blur-2xl border-[0.5px] border-white/20 dark:border-white/10 rounded-card p-8 space-y-6 relative z-20 shadow-2xl">
          
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid flex items-center justify-center mx-auto">
              <IconFingerprint className="w-7 h-7 stroke-[1.8]" />
            </div>
            <h2 className="font-heading font-extrabold text-2xl">Aadhaar OTP Gateway</h2>
            <p className="text-xs text-slate-400 font-body">
              Verified identity node matching unique resident identification database.
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-element text-center font-heading text-xs font-semibold">
            <button
              onClick={() => setRole("CITIZEN")}
              className={`py-2 rounded-element cursor-pointer transition-all ${
                role === "CITIZEN" 
                  ? "bg-white dark:bg-slate-800 text-brand dark:text-brand-mid lc-border" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Citizen
            </button>
            <button
              onClick={() => setRole("BANK")}
              className={`py-2 rounded-element cursor-pointer transition-all ${
                role === "BANK" 
                  ? "bg-white dark:bg-slate-800 text-brand dark:text-brand-mid lc-border" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Banker
            </button>
            <button
              onClick={() => setRole("REGISTRAR")}
              className={`py-2 rounded-element cursor-pointer transition-all ${
                role === "REGISTRAR" 
                  ? "bg-white dark:bg-slate-800 text-brand dark:text-brand-mid lc-border" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Registrar
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/20 rounded-element font-body lc-border border-rose-200 dark:border-rose-900">
              {error}
            </div>
          )}

          {/* Form */}
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  placeholder="Enter 12-digit UID (e.g. 1234 5678 9012)"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                  className="w-full px-4 py-3 rounded-element bg-white dark:bg-slate-900 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand hover:bg-brand-mid text-white font-heading font-semibold text-sm rounded-element transition-colors cursor-pointer shadow-none"
              >
                {loading ? "Requesting OTP..." : "Request Aadhaar OTP"}
                <IconArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* Alert OTP */}
              <div className="p-3 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 rounded-element font-body lc-border border-emerald-200 dark:border-emerald-900 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <IconCircleCheck className="w-4 h-4 flex-shrink-0" />
                  <span className="font-semibold">OTP sent to registered mobile: {maskedPhone}</span>
                </div>
                {!simulatedOtp ? (
                  <span className="text-[10px] text-emerald-500/80 ml-6">Please check your mobile phone for the secure verification code.</span>
                ) : (
                  <span className="text-[10px] text-emerald-500/80 ml-6">Simulating secure OTP dispatch. Use the code shown in the notification toast above.</span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">
                  Verification OTP
                </label>
                <div className="relative">
                  <IconLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Enter 6-digit OTP code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-element bg-white dark:bg-slate-900 border-[0.5px] border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand hover:bg-brand-mid text-white font-heading font-semibold text-sm rounded-element transition-colors cursor-pointer shadow-none"
              >
                {loading ? "Establishing Session..." : "Verify & Sign In"}
                <IconShieldCheck className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full py-2 text-xs font-heading font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-center"
              >
                Change Aadhaar Number
              </button>
            </form>
          )}

          {/* Register link */}
          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-900/60 text-xs font-body text-slate-400">
            <span>New user? </span>
            <Link href="/register" className="text-brand dark:text-brand-mid hover:underline font-semibold">
              Register Resident ID
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
