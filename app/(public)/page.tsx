"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2800); // Redirect after 2.8 seconds to allow background animations to show beautifully
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-[#030806] text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-light/30 dark:bg-brand/5 blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-accent-light/25 dark:bg-accent-DEFAULT/5 blur-[120px] -z-10 animate-pulse" style={{ animationDelay: "1.5s" }}></div>

      {/* Large animated watermark logo in the center background */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, rotate: 0 }}
        animate={{ 
          opacity: [0.04, 0.07, 0.04], 
          scale: [0.95, 1.05, 0.95],
          rotate: [0, 8, 0]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute w-[500px] h-[500px] md:w-[650px] md:h-[650px] -z-20 pointer-events-none select-none flex items-center justify-center"
      >
        <img 
          src="/logo.png" 
          alt="LandChain Watermark Logo" 
          className="w-full h-full object-contain filter grayscale dark:invert opacity-80" 
        />
      </motion.div>

      {/* Ambient floating micro-logos in the background */}
      {/* Micro-logo 1 */}
      <motion.div
        animate={{ 
          y: [0, -30, 0], 
          x: [0, 15, 0],
          rotate: [0, 45, 0],
          opacity: [0.02, 0.05, 0.02]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0 }}
        className="absolute top-20 left-[15%] w-16 h-16 -z-20 pointer-events-none select-none"
      >
        <img src="/logo.png" alt="floating particle" className="w-full h-full object-contain filter grayscale dark:invert opacity-70" />
      </motion.div>

      {/* Micro-logo 2 */}
      <motion.div
        animate={{ 
          y: [0, 40, 0], 
          x: [0, -20, 0],
          rotate: [0, -30, 0],
          opacity: [0.015, 0.045, 0.015]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-24 right-[12%] w-24 h-24 -z-20 pointer-events-none select-none"
      >
        <img src="/logo.png" alt="floating particle" className="w-full h-full object-contain filter grayscale dark:invert opacity-60" />
      </motion.div>

      {/* Micro-logo 3 */}
      <motion.div
        animate={{ 
          y: [0, -25, 0], 
          x: [0, -15, 0],
          rotate: [0, 20, 0],
          opacity: [0.01, 0.035, 0.01]
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-32 right-[20%] w-12 h-12 -z-20 pointer-events-none select-none"
      >
        <img src="/logo.png" alt="floating particle" className="w-full h-full object-contain filter grayscale dark:invert opacity-50" />
      </motion.div>

      {/* Micro-logo 4 */}
      <motion.div
        animate={{ 
          y: [0, 35, 0], 
          x: [0, 25, 0],
          rotate: [0, -15, 0],
          opacity: [0.02, 0.05, 0.02]
        }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-32 left-[18%] w-20 h-20 -z-20 pointer-events-none select-none"
      >
        <img src="/logo.png" alt="floating particle" className="w-full h-full object-contain filter grayscale dark:invert opacity-60" />
      </motion.div>

      {/* Splash card container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-8 rounded-card bg-white/70 dark:bg-[#030806]/60 backdrop-blur-xl border-[0.5px] border-black/12 dark:border-white/12 flex flex-col items-center text-center space-y-6 shadow-2xl shadow-brand/5 dark:shadow-none relative z-10"
      >
        {/* Animated logo wrapper */}
        <div className="relative">
          {/* Pulsing and rotating aura */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-brand/20 to-accent-DEFAULT/20 dark:from-brand-mid/10 dark:to-accent-DEFAULT/10 blur-md animate-pulse"></div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            className="absolute -inset-2.5 rounded-full border border-dashed border-brand/30 dark:border-brand-mid/20"
          ></motion.div>

          {/* Core Logo box */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
            className="relative w-20 h-20 rounded-element bg-brand-light dark:bg-brand-dark/30 flex items-center justify-center p-3 border-[0.5px] border-brand/25 dark:border-brand-mid/25"
          >
            <img src="/logo.png" alt="LandChain Logo" className="w-full h-full object-contain" />
          </motion.div>
        </div>

        {/* Text descriptions */}
        <div className="space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="font-heading font-extrabold text-3xl tracking-tight text-slate-800 dark:text-slate-100"
          >
            LandChain
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-xs font-heading font-semibold uppercase tracking-widest text-brand dark:text-brand-mid"
          >
            Decentralized Land Registry
          </motion.p>
        </div>

        {/* Loading Indicator */}
        <div className="w-full space-y-3 pt-2">
          {/* Progress bar container */}
          <div className="w-48 h-[3px] bg-slate-100 dark:bg-slate-900 rounded-full mx-auto overflow-hidden relative border-[0.5px] border-black/5 dark:border-white/5">
            <motion.div
              initial={{ left: "-100%" }}
              animate={{ left: "100%" }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="absolute top-0 bottom-0 w-1/2 bg-brand dark:bg-brand-mid rounded-full"
            ></motion.div>
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="text-xs text-slate-400 dark:text-slate-500 font-body"
          >
            Redirecting to secure login...
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
