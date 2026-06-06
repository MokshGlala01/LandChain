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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#030806] text-slate-100 relative overflow-hidden">
      
      {/* 1. Solid background layer */}
      <div className="absolute inset-0 bg-[#030806] z-0"></div>

      {/* 2. Full-screen modern city skyline image with a slow zoom/fade in animation */}
      <motion.div 
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1.03, opacity: 0.45 }}
        transition={{ duration: 3.2, ease: "easeOut" }}
        className="absolute inset-0 bg-cover bg-center z-10"
        style={{ backgroundImage: "url('/splash_background.png')" }}
      />

      {/* 3. Gradient vignette overlay for deep contrast and futuristic feel */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030806] via-[#030806]/80 to-[#030806]/40 z-10"></div>

      {/* 4. Glowing neon blobs in background */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-mid/12 blur-[130px] z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/8 blur-[130px] z-10 animate-pulse" style={{ animationDelay: "1.5s" }}></div>

      {/* 5. Cyber Tech Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1d9e750e_1px,transparent_1px),linear-gradient(to_bottom,#1d9e750e_1px,transparent_1px)] bg-[size:50px_50px] z-15 mix-blend-overlay"></div>

      {/* 6. Glowing neon wireframe buildings overlaying the city skyline */}
      <div className="absolute inset-0 w-full h-full z-20 flex items-end overflow-hidden pointer-events-none select-none">
        <svg className="w-full h-full min-h-screen" viewBox="0 0 1200 800" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Glowing neon filter */}
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            {/* Gradients for buildings */}
            <linearGradient id="build-grad-1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1D9E75" stopOpacity="0.15"/>
              <stop offset="100%" stopColor="#1D9E75" stopOpacity="0.01"/>
            </linearGradient>
            <linearGradient id="build-grad-2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#185FA5" stopOpacity="0.12"/>
              <stop offset="100%" stopColor="#185FA5" stopOpacity="0.01"/>
            </linearGradient>
          </defs>

          {/* Building 1 (Left Tall Outline) */}
          <motion.rect
            x="50" y="200" width="130" height="600" rx="6"
            stroke="#1D9E75"
            strokeOpacity="0.45"
            strokeWidth="2"
            fill="url(#build-grad-1)"
            filter="url(#neon-glow)"
            initial={{ y: 600, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
          />
          
          {/* Building 2 (Left Mid Block) */}
          <motion.rect
            x="220" y="350" width="150" height="450" rx="6"
            stroke="#4696e6"
            strokeOpacity="0.45"
            strokeWidth="2"
            fill="url(#build-grad-2)"
            filter="url(#neon-glow)"
            initial={{ y: 500, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.9, ease: "easeOut", delay: 0.2 }}
          />

          {/* Building 3 (Center Left Spire Skyscraper) */}
          <motion.path
            d="M 410 800 L 410 250 L 470 150 L 530 250 L 530 800 Z"
            stroke="#1D9E75"
            strokeOpacity="0.55"
            strokeWidth="2.2"
            fill="url(#build-grad-1)"
            filter="url(#neon-glow)"
            initial={{ y: 700, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 2.2, ease: "easeOut", delay: 0.4 }}
          />
          {/* Glowing Spire Tip */}
          <motion.circle
            cx="470" cy="150" r="7"
            fill="#1D9E75"
            filter="url(#neon-glow)"
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />

          {/* Building 4 (Center Right Block) */}
          <motion.rect
            x="580" y="280" width="160" height="520" rx="6"
            stroke="#1D9E75"
            strokeOpacity="0.45"
            strokeWidth="2"
            fill="url(#build-grad-1)"
            filter="url(#neon-glow)"
            initial={{ y: 600, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
          />

          {/* Building 5 (Right Spire Tower) */}
          <motion.path
            d="M 780 800 L 780 300 L 830 220 L 880 300 L 880 800 Z"
            stroke="#4696e6"
            strokeOpacity="0.5"
            strokeWidth="2"
            fill="url(#build-grad-2)"
            filter="url(#neon-glow)"
            initial={{ y: 650, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.15 }}
          />
          <motion.circle
            cx="830" cy="220" r="6"
            fill="#4696e6"
            filter="url(#neon-glow)"
            animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 0.5 }}
          />

          {/* Building 6 (Far Right Block) */}
          <motion.rect
            x="920" y="380" width="120" height="420" rx="6"
            stroke="#1D9E75"
            strokeOpacity="0.45"
            strokeWidth="2"
            fill="url(#build-grad-1)"
            filter="url(#neon-glow)"
            initial={{ y: 500, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 2.4, ease: "easeOut", delay: 0.5 }}
          />

          {/* Building 7 (Far Right Outline Tower) */}
          <motion.rect
            x="1070" y="180" width="100" height="620" rx="6"
            stroke="#1D9E75"
            strokeOpacity="0.4"
            strokeWidth="1.5"
            fill="url(#build-grad-1)"
            filter="url(#neon-glow)"
            initial={{ y: 650, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.6 }}
          />

          {/* Glowing Windows / Connection nodes inside buildings */}
          {/* Building 1 Nodes */}
          <motion.circle cx="100" cy="350" r="3.5" fill="#1D9E75" filter="url(#neon-glow)" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2, delay: 0.2 }} />
          <motion.circle cx="130" cy="450" r="3.5" fill="#1D9E75" filter="url(#neon-glow)" animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.8, delay: 0.5 }} />
          <motion.circle cx="90" cy="550" r="3.5" fill="#1D9E75" filter="url(#neon-glow)" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2.2, delay: 0.8 }} />

          {/* Building 2 Nodes */}
          <motion.circle cx="280" cy="420" r="3.5" fill="#4696e6" filter="url(#neon-glow)" animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0.1 }} />
          <motion.circle cx="310" cy="520" r="3.5" fill="#4696e6" filter="url(#neon-glow)" animate={{ opacity: [0.9, 0.4, 0.9] }} transition={{ repeat: Infinity, duration: 2, delay: 0.7 }} />

          {/* Building 3 Nodes */}
          <motion.circle cx="470" cy="320" r="4" fill="#1D9E75" filter="url(#neon-glow)" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 3, delay: 0.8 }} />
          <motion.circle cx="440" cy="480" r="4" fill="#1D9E75" filter="url(#neon-glow)" animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2.2, delay: 0.4 }} />
          <motion.circle cx="500" cy="620" r="4" fill="#1D9E75" filter="url(#neon-glow)" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0.3 }} />

          {/* Building 4 Nodes */}
          <motion.circle cx="640" cy="380" r="3.5" fill="#1D9E75" filter="url(#neon-glow)" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.7 }} />
          <motion.circle cx="680" cy="500" r="3.5" fill="#1D9E75" filter="url(#neon-glow)" animate={{ opacity: [0.9, 0.4, 0.9] }} transition={{ repeat: Infinity, duration: 2.4, delay: 0.1 }} />

          {/* Building 5 Nodes */}
          <motion.circle cx="830" cy="380" r="3.5" fill="#4696e6" filter="url(#neon-glow)" animate={{ opacity: [0.3, 0.9, 0.3] }} transition={{ repeat: Infinity, duration: 2.8, delay: 0.3 }} />
          <motion.circle cx="830" cy="550" r="3.5" fill="#4696e6" filter="url(#neon-glow)" animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 2.1, delay: 0.9 }} />

          {/* Building 6 Nodes */}
          <motion.circle cx="970" cy="480" r="3.5" fill="#1D9E75" filter="url(#neon-glow)" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.7, delay: 0.2 }} />

          {/* Building 7 Nodes */}
          <motion.circle cx="1120" cy="300" r="3.5" fill="#1D9E75" filter="url(#neon-glow)" animate={{ opacity: [0.2, 0.9, 0.2] }} transition={{ repeat: Infinity, duration: 3.2, delay: 0.6 }} />
          <motion.circle cx="1120" cy="460" r="3.5" fill="#1D9E75" filter="url(#neon-glow)" animate={{ opacity: [0.9, 0.3, 0.9] }} transition={{ repeat: Infinity, duration: 2.4, delay: 0.4 }} />

          {/* Base Registry Line */}
          <line x1="0" y1="800" x2="1200" y2="800" stroke="#1D9E75" strokeOpacity="0.4" strokeWidth="2" />
          
          {/* Glowing sweeping scanning laser line (Blockchain Mutation scan) */}
          <motion.line
            x1="0" y1="400" x2="1200" y2="400"
            stroke="#1D9E75"
            strokeOpacity="0.85"
            strokeWidth="3.5"
            filter="url(#neon-glow)"
            animate={{ y: [800, 100, 800] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          />
        </svg>
      </div>

      {/* 7. Ambient floating micro-logos in the background */}
      {/* Micro-logo 1 */}
      <motion.div
        animate={{ 
          y: [0, -35, 0], 
          x: [0, 20, 0],
          rotate: [0, 45, 0],
          opacity: [0.06, 0.12, 0.06]
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0 }}
        className="absolute top-20 left-[12%] w-16 h-16 z-20 pointer-events-none select-none"
      >
        <img src="/logo.png" alt="floating particle" className="w-full h-full object-contain filter grayscale invert opacity-75" />
      </motion.div>

      {/* Micro-logo 2 */}
      <motion.div
        animate={{ 
          y: [0, 45, 0], 
          x: [0, -25, 0],
          rotate: [0, -30, 0],
          opacity: [0.05, 0.1, 0.05]
        }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-24 right-[10%] w-24 h-24 z-20 pointer-events-none select-none"
      >
        <img src="/logo.png" alt="floating particle" className="w-full h-full object-contain filter grayscale invert opacity-60" />
      </motion.div>

      {/* Micro-logo 3 */}
      <motion.div
        animate={{ 
          y: [0, -25, 0], 
          x: [0, -20, 0],
          rotate: [0, 20, 0],
          opacity: [0.04, 0.08, 0.04]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-32 right-[15%] w-14 h-14 z-20 pointer-events-none select-none"
      >
        <img src="/logo.png" alt="floating particle" className="w-full h-full object-contain filter grayscale invert opacity-50" />
      </motion.div>

      {/* Micro-logo 4 */}
      <motion.div
        animate={{ 
          y: [0, 40, 0], 
          x: [0, 30, 0],
          rotate: [0, -15, 0],
          opacity: [0.05, 0.12, 0.05]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-32 left-[15%] w-20 h-20 z-20 pointer-events-none select-none"
      >
        <img src="/logo.png" alt="floating particle" className="w-full h-full object-contain filter grayscale invert opacity-60" />
      </motion.div>

      {/* 8. Splash card container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-10 rounded-card bg-[#030806]/75 backdrop-blur-2xl border-[0.5px] border-white/20 flex flex-col items-center text-center space-y-8 shadow-2xl relative z-30"
      >
        {/* Animated logo wrapper */}
        <div className="relative">
          {/* Pulsing and rotating aura */}
          <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-brand-mid/25 to-accent/25 blur-xl animate-pulse"></div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            className="absolute -inset-4 rounded-full border border-dashed border-brand-mid/30"
          ></motion.div>

          {/* Core Logo box (BIG SIZE Centerpiece) */}
          <motion.div
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 12 }}
            className="relative w-36 h-36 rounded-element bg-[#085041]/35 flex items-center justify-center p-4 border-[0.5px] border-brand-mid/30 shadow-lg shadow-brand/10"
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
            className="font-heading font-extrabold text-3xl tracking-tight text-white"
          >
            LandChain
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-xs font-heading font-semibold uppercase tracking-widest text-brand-mid"
          >
            Decentralized Land Registry
          </motion.p>
        </div>

        {/* Loading Indicator */}
        <div className="w-full space-y-3 pt-2">
          {/* Progress bar container */}
          <div className="w-48 h-[3px] bg-slate-900 rounded-full mx-auto overflow-hidden relative border-[0.5px] border-white/10">
            <motion.div
              initial={{ left: "-100%" }}
              animate={{ left: "100%" }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute top-0 bottom-0 w-1/2 bg-brand-mid rounded-full"
            ></motion.div>
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="text-xs text-slate-500 font-body"
          >
            Redirecting to secure login...
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
