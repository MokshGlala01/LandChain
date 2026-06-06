"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
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
      const res = await fetch(`/api/user/lookup?aadhaar=${encodeURIComponent(cleanAadhaar)}`);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Aadhaar Number is not registered in the system.");
        setLoading(false);
        return;
      }

      setMaskedPhone(data.phone);
      if (data.role) {
        setRole(data.role);
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

    if (otp !== "123456" && otp !== "1234") {
      setError("Incorrect OTP. For testing, please enter '123456'.");
      return;
    }

    setLoading(true);
    try {
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#030806] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-6">
        <div className="max-w-md w-full bg-slate-50/50 dark:bg-slate-900/10 lc-border rounded-card p-8 space-y-6 relative overflow-hidden">
          
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
                <span className="text-[10px] text-emerald-500/80 ml-6">For testing, enter <strong>123456</strong></span>
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
