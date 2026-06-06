"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 3200); // Redirect after 3.2 seconds to allow background animations to show beautifully
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-[#030806] text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-light/30 dark:bg-brand/5 blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-accent-light/25 dark:bg-accent-DEFAULT/5 blur-[120px] -z-10 animate-pulse" style={{ animationDelay: "1.5s" }}></div>

      {/* Full-page background building skyline outline animation */}
      <div className="absolute inset-0 w-full h-full -z-20 flex items-end overflow-hidden pointer-events-none select-none">
        <svg className="w-full h-3/5 min-h-[400px]" viewBox="0 0 1200 400" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Building 1 (Left Tall Outline) */}
          <motion.rect
            x="50" y="100" width="100" height="300" rx="4"
            className="stroke-brand/10 dark:stroke-brand-mid/5 fill-brand-light/[0.01] dark:fill-brand-dark/[0.005]"
            strokeWidth="1.2"
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          
          {/* Building 2 (Left Mid Block) */}
          <motion.rect
            x="180" y="180" width="120" height="220" rx="4"
            className="stroke-accent/10 dark:stroke-accent-DEFAULT/5 fill-accent-light/[0.008] dark:fill-accent-DEFAULT/[0.003]"
            strokeWidth="1.2"
            initial={{ y: 250, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
          />

          {/* Building 3 (Center Left Spire) */}
          <motion.path
            d="M 340 400 L 340 100 L 390 50 L 440 100 L 440 400 Z"
            className="stroke-brand/15 dark:stroke-brand-mid/8 fill-brand-light/[0.02] dark:fill-brand-dark/[0.01]"
            strokeWidth="1.2"
            initial={{ y: 350, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.4 }}
          />
          <motion.circle
            cx="390" cy="50" r="4.5"
            className="fill-brand dark:fill-brand-mid"
            animate={{ scale: [1, 1.8, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />

          {/* Building 4 (Center Right Block) */}
          <motion.rect
            x="480" y="140" width="140" height="260" rx="4"
            className="stroke-brand/10 dark:stroke-brand-mid/5 fill-brand-light/[0.01] dark:fill-brand-dark/[0.005]"
            strokeWidth="1.2"
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.6, ease: "easeOut", delay: 0.3 }}
          />

          {/* Building 5 (Right Spire Tower) */}
          <motion.path
            d="M 660 400 L 660 140 L 710 90 L 760 140 L 760 400 Z"
            className="stroke-accent/10 dark:stroke-accent-DEFAULT/5 fill-accent-light/[0.008] dark:fill-accent-DEFAULT/[0.003]"
            strokeWidth="1.2"
            initial={{ y: 320, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.9, ease: "easeOut", delay: 0.15 }}
          />
          <motion.circle
            cx="710" cy="90" r="4.5"
            className="fill-accent dark:fill-accent-DEFAULT"
            animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0.9, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 0.5 }}
          />

          {/* Building 6 (Far Right Block) */}
          <motion.rect
            x="800" y="200" width="110" height="200" rx="4"
            className="stroke-brand/10 dark:stroke-brand-mid/5 fill-brand-light/[0.01] dark:fill-brand-dark/[0.005]"
            strokeWidth="1.2"
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 2.2, ease: "easeOut", delay: 0.5 }}
          />

          {/* Building 7 (Far Right Outline Tower) */}
          <motion.rect
            x="940" y="90" width="90" height="310" rx="4"
            className="stroke-brand/8 dark:stroke-brand-mid/3 fill-brand-light/[0.005] dark:fill-brand-dark/[0.002]"
            strokeWidth="1.2"
            initial={{ y: 320, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.7, ease: "easeOut", delay: 0.6 }}
          />

          {/* Glowing connection dots / windows inside buildings */}
          <motion.circle cx="100" cy="180" r="2" className="fill-brand/60 dark:fill-brand-mid/60" animate={{ opacity: [0.2, 0.9, 0.2] }} transition={{ repeat: Infinity, duration: 2, delay: 0.2 }} />
          <motion.circle cx="100" cy="220" r="2" className="fill-brand/60 dark:fill-brand-mid/60" animate={{ opacity: [0.9, 0.2, 0.9] }} transition={{ repeat: Infinity, duration: 1.8, delay: 0.5 }} />
          <motion.circle cx="240" cy="250" r="2" className="fill-accent/60 dark:fill-accent-DEFAULT/60" animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0.1 }} />
          <motion.circle cx="390" cy="150" r="2" className="fill-brand/70 dark:fill-brand-mid/70" animate={{ opacity: [0.1, 0.9, 0.1] }} transition={{ repeat: Infinity, duration: 3, delay: 0.8 }} />
          <motion.circle cx="390" cy="230" r="2.5" className="fill-brand/70 dark:fill-brand-mid/70" animate={{ opacity: [0.8, 0.2, 0.8] }} transition={{ repeat: Infinity, duration: 2.2, delay: 0.4 }} />
          <motion.circle cx="550" cy="210" r="2" className="fill-brand/60 dark:fill-brand-mid/60" animate={{ opacity: [0.3, 0.9, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.7 }} />
          <motion.circle cx="710" cy="190" r="2" className="fill-accent/60 dark:fill-accent-DEFAULT/60" animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ repeat: Infinity, duration: 2.8, delay: 0.3 }} />
          <motion.circle cx="710" cy="270" r="2" className="fill-accent/60 dark:fill-accent-DEFAULT/60" animate={{ opacity: [0.9, 0.1, 0.9] }} transition={{ repeat: Infinity, duration: 2.1, delay: 0.9 }} />
          <motion.circle cx="850" cy="280" r="2" className="fill-brand/60 dark:fill-brand-mid/60" animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ repeat: Infinity, duration: 1.7, delay: 0.2 }} />
          <motion.circle cx="985" cy="170" r="2" className="fill-brand/50 dark:fill-brand-mid/50" animate={{ opacity: [0.1, 0.8, 0.1] }} transition={{ repeat: Infinity, duration: 3.2, delay: 0.6 }} />

          {/* Grid lines behind city */}
          <line x1="0" y1="400" x2="1200" y2="400" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
          
          {/* Glowing sweeping scanning laser line */}
          <motion.line
            x1="0" y1="280" x2="1200" y2="280"
            className="stroke-brand/20 dark:stroke-brand-mid/10"
            strokeWidth="1.5"
            animate={{ y: [400, 50, 400] }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          />
        </svg>
      </div>

      {/* Ambient floating micro-logos in the background */}
      {/* Micro-logo 1 */}
      <motion.div
        animate={{ 
          y: [0, -35, 0], 
          x: [0, 20, 0],
          rotate: [0, 45, 0],
          opacity: [0.02, 0.05, 0.02]
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0 }}
        className="absolute top-20 left-[12%] w-16 h-16 -z-20 pointer-events-none select-none"
      >
        <img src="/logo.png" alt="floating particle" className="w-full h-full object-contain filter grayscale dark:invert opacity-70" />
      </motion.div>

      {/* Micro-logo 2 */}
      <motion.div
        animate={{ 
          y: [0, 45, 0], 
          x: [0, -25, 0],
          rotate: [0, -30, 0],
          opacity: [0.015, 0.045, 0.015]
        }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-24 right-[10%] w-24 h-24 -z-20 pointer-events-none select-none"
      >
        <img src="/logo.png" alt="floating particle" className="w-full h-full object-contain filter grayscale dark:invert opacity-60" />
      </motion.div>

      {/* Micro-logo 3 */}
      <motion.div
        animate={{ 
          y: [0, -25, 0], 
          x: [0, -20, 0],
          rotate: [0, 20, 0],
          opacity: [0.01, 0.035, 0.01]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-32 right-[15%] w-14 h-14 -z-20 pointer-events-none select-none"
      >
        <img src="/logo.png" alt="floating particle" className="w-full h-full object-contain filter grayscale dark:invert opacity-50" />
      </motion.div>

      {/* Micro-logo 4 */}
      <motion.div
        animate={{ 
          y: [0, 40, 0], 
          x: [0, 30, 0],
          rotate: [0, -15, 0],
          opacity: [0.02, 0.05, 0.02]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-32 left-[15%] w-20 h-20 -z-20 pointer-events-none select-none"
      >
        <img src="/logo.png" alt="floating particle" className="w-full h-full object-contain filter grayscale dark:invert opacity-60" />
      </motion.div>

      {/* Splash card container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-10 rounded-card bg-white/70 dark:bg-[#030806]/60 backdrop-blur-xl border-[0.5px] border-black/12 dark:border-white/12 flex flex-col items-center text-center space-y-8 shadow-2xl shadow-brand/5 dark:shadow-none relative z-10"
      >
        {/* Animated logo wrapper */}
        <div className="relative">
          {/* Pulsing and rotating aura */}
          <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-brand/25 to-accent-DEFAULT/25 dark:from-brand-mid/12 dark:to-accent-DEFAULT/12 blur-xl animate-pulse"></div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            className="absolute -inset-4 rounded-full border border-dashed border-brand/30 dark:border-brand-mid/20"
          ></motion.div>

          {/* Core Logo box (BIG SIZECenterpiece) */}
          <motion.div
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 12 }}
            className="relative w-36 h-36 rounded-element bg-brand-light dark:bg-brand-dark/30 flex items-center justify-center p-4 border-[0.5px] border-brand/20 dark:border-brand-mid/20 shadow-lg shadow-brand/5 dark:shadow-none"
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
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
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
