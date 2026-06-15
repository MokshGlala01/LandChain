"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { 
  IconLock, 
  IconQrcode, 
  IconSmartHome, 
  IconMapPin, 
  IconBell, 
  IconCode, 
  IconUser, 
  IconBuildingBank, 
  IconBuildingCommunity, 
  IconGavel, 
  IconArrowRight,
  IconAlertTriangle,
  IconCircleCheck,
  IconHexagon,
  IconTrendingDown,
  IconClock,
  IconShield,
  IconActivity
} from "@tabler/icons-react";

export default function HomePage() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 3200);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <motion.div 
          key="splash"
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="min-h-screen w-full flex flex-col items-center justify-center bg-[#030806] text-slate-100 relative overflow-hidden"
        >
          {/* 1. Solid background layer */}
          <div className="absolute inset-0 bg-[#030806] z-0"></div>

          {/* 2. Full-screen modern city skyline image with a slow zoom/fade in animation */}
          <motion.div 
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1.03, opacity: 0.45 }}
            transition={{ duration: 3.2, ease: "easeOut" }}
            className="absolute inset-0 bg-cover bg-center z-10"
            style={{ backgroundImage: "url('/login_background.png')" }}
          />

          {/* 3. Gradient vignette overlay for deep contrast and futuristic feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030806] via-[#030806]/80 to-[#030806]/40 z-10"></div>

          {/* 4. Glowing neon blobs in background */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#1D9E75]/10 blur-[130px] z-10 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#185FA5]/8 blur-[130px] z-10 animate-pulse" style={{ animationDelay: "1.5s" }}></div>

          {/* 5. Cyber Tech Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1d9e750e_1px,transparent_1px),linear-gradient(to_bottom,#1d9e750e_1px,transparent_1px)] bg-[size:50px_50px] z-15 mix-blend-overlay"></div>

          {/* 6. Glowing neon wireframe buildings overlaying the city skyline */}
          <div className="absolute inset-0 w-full h-full z-20 flex items-end overflow-hidden pointer-events-none select-none">
            <svg className="w-full h-full min-h-screen" viewBox="0 0 1200 800" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="build-grad-1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1D9E75" stopOpacity="0.15"/>
                  <stop offset="100%" stopColor="#1D9E75" stopOpacity="0.01"/>
                </linearGradient>
                <linearGradient id="build-grad-2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#185FA5" stopOpacity="0.12"/>
                  <stop offset="100%" stopColor="#185FA5" stopOpacity="0.01"/>
                </linearGradient>
              </defs>

              {/* Building 1 */}
              <motion.rect
                x="50" y="200" width="130" height="600" rx="6"
                stroke="#1D9E75" strokeOpacity="0.45" strokeWidth="2" fill="url(#build-grad-1)" filter="url(#neon-glow)"
                initial={{ y: 600, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.6, ease: "easeOut" }}
              />
              
              {/* Building 2 */}
              <motion.rect
                x="220" y="350" width="150" height="450" rx="6"
                stroke="#185FA5" strokeOpacity="0.45" strokeWidth="2" fill="url(#build-grad-2)" filter="url(#neon-glow)"
                initial={{ y: 500, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.9, ease: "easeOut", delay: 0.2 }}
              />

              {/* Building 3 */}
              <motion.path
                d="M 410 800 L 410 250 L 470 150 L 530 250 L 530 800 Z"
                stroke="#1D9E75" strokeOpacity="0.55" strokeWidth="2.2" fill="url(#build-grad-1)" filter="url(#neon-glow)"
                initial={{ y: 700, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 2.2, ease: "easeOut", delay: 0.4 }}
              />
              <motion.circle
                cx="470" cy="150" r="7" fill="#1D9E75" filter="url(#neon-glow)"
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />

              {/* Building 4 */}
              <motion.rect
                x="580" y="280" width="160" height="520" rx="6"
                stroke="#1D9E75" strokeOpacity="0.45" strokeWidth="2" fill="url(#build-grad-1)" filter="url(#neon-glow)"
                initial={{ y: 600, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
              />

              {/* Building 5 */}
              <motion.path
                d="M 780 800 L 780 300 L 830 220 L 880 300 L 880 800 Z"
                stroke="#185FA5" strokeOpacity="0.5" strokeWidth="2" fill="url(#build-grad-2)" filter="url(#neon-glow)"
                initial={{ y: 650, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 2, ease: "easeOut", delay: 0.15 }}
              />
              <motion.circle
                cx="830" cy="220" r="6" fill="#185FA5" filter="url(#neon-glow)"
                animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 0.5 }}
              />

              {/* Building 6 */}
              <motion.rect
                x="920" y="380" width="120" height="420" rx="6"
                stroke="#1D9E75" strokeOpacity="0.45" strokeWidth="2" fill="url(#build-grad-1)" filter="url(#neon-glow)"
                initial={{ y: 500, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 2.4, ease: "easeOut", delay: 0.5 }}
              />

              {/* Building 7 */}
              <motion.rect
                x="1070" y="180" width="100" height="620" rx="6"
                stroke="#1D9E75" strokeOpacity="0.4" strokeWidth="1.5" fill="url(#build-grad-1)" filter="url(#neon-glow)"
                initial={{ y: 650, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 2, ease: "easeOut", delay: 0.6 }}
              />

              {/* Sweeping Scanning Laser */}
              <motion.line
                x1="0" y1="400" x2="1200" y2="400" stroke="#1D9E75" strokeOpacity="0.85" strokeWidth="3.5" filter="url(#neon-glow)"
                animate={{ y: [800, 100, 800] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              />
            </svg>
          </div>

          {/* 7. Ambient floating micro-logos */}
          <motion.div
            animate={{ y: [0, -35, 0], x: [0, 20, 0], rotate: [0, 45, 0], opacity: [0.06, 0.12, 0.06] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-[12%] w-16 h-16 z-20 pointer-events-none select-none"
          >
            <img src="/logo.png" alt="floating particle" className="w-full h-full object-contain filter grayscale invert opacity-75" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 45, 0], x: [0, -25, 0], rotate: [0, -30, 0], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-24 right-[10%] w-24 h-24 z-20 pointer-events-none select-none"
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
            <div className="relative">
              <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-brand-mid/25 to-accent/25 blur-xl animate-pulse"></div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                className="absolute -inset-4 rounded-full border border-dashed border-[#1D9E75]/30"
              ></motion.div>
              <motion.div
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 12 }}
                className="relative w-36 h-36 rounded-element bg-[#085041]/35 flex items-center justify-center p-4 border-[0.5px] border-[#1D9E75]/30"
              >
                <img src="/logo.png" alt="LandChain Logo" className="w-full h-full object-contain" />
              </motion.div>
            </div>

            <div className="space-y-2">
              <h1 className="font-heading font-extrabold text-3xl tracking-tight text-white">LandChain</h1>
              <p className="text-xs font-heading font-semibold uppercase tracking-widest text-brand-mid">Decentralized Land Registry</p>
            </div>

            <div className="w-full space-y-3 pt-2">
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
                Securing platform registry...
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div 
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen flex flex-col bg-white dark:bg-[#030806] text-slate-800 dark:text-slate-100 transition-colors duration-300"
        >
          <Navbar />
          <main className="flex-grow">
            <LandingPageContent />
          </main>
          <Footer />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// -------------------------------------------------------------
// LANDING PAGE CONTENT (8 Sections as per full-stack spec)
// -------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

function LandingPageContent() {
  return (
    <div className="w-full relative">
      {/* SECTION 1: HERO SECTION */}
      <section className="relative overflow-hidden py-20 lg:py-28 px-6 border-b-[0.5px] border-slate-200/60 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="lg:col-span-7 space-y-6"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid font-heading font-bold text-xs border-[0.5px] border-brand/10">
              <IconLock className="w-3.5 h-3.5" />
              <span>Powered by Blockchain + IPFS</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none text-slate-900 dark:text-white">
              Land Registry, <br />
              <span className="text-brand dark:text-brand-mid">Reimagined on Chain</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-slate-500 dark:text-slate-400 font-body text-base sm:text-lg leading-relaxed max-w-xl">
              Tamper-proof property records, instant ownership verification, and smart-contract transfers — eliminating fraud from India's land registry system.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 pt-2">
              <Link 
                href="/verify/PARCEL-4902-881" 
                className="px-6 py-3 rounded-element bg-brand hover:bg-brand-mid text-white font-heading font-semibold text-sm transition-all shadow-none"
              >
                Verify Property
              </Link>
              <Link 
                href="/register" 
                className="px-6 py-3 rounded-element border-[0.5px] border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 font-heading font-semibold text-sm transition-all bg-slate-50 dark:bg-slate-950"
              >
                Register Land
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Right Graphic */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 h-[320px] sm:h-[400px] rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 relative flex items-center justify-center overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-brand-mid/10 via-transparent to-transparent"></div>
            
            {/* Blockchain Node Network SVG Graphic */}
            <svg className="w-4/5 h-4/5 z-10" viewBox="0 0 200 200">
              <g stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="0.5">
                <line x1="40" y1="40" x2="100" y2="40" />
                <line x1="100" y1="40" x2="160" y2="70" />
                <line x1="40" y1="40" x2="40" y2="120" />
                <line x1="40" y1="120" x2="100" y2="160" />
                <line x1="100" y1="160" x2="160" y2="120" />
                <line x1="160" y1="70" x2="160" y2="120" />
                <line x1="100" y1="40" x2="100" y2="160" strokeDasharray="3 3" />
                <line x1="40" y1="120" x2="160" y2="70" strokeDasharray="3 3" />
              </g>

              {/* Connecting Nodes */}
              <circle cx="40" cy="40" r="5" className="fill-brand stroke-[0.5px] stroke-white dark:stroke-[#030806]" />
              <circle cx="100" cy="40" r="5" className="fill-brand-mid stroke-[0.5px] stroke-white dark:stroke-[#030806]" />
              <circle cx="160" cy="70" r="5" className="fill-accent stroke-[0.5px] stroke-white dark:stroke-[#030806]" />
              <circle cx="40" cy="120" r="5" className="fill-gold stroke-[0.5px] stroke-white dark:stroke-[#030806]" />
              <circle cx="100" cy="160" r="5" className="fill-brand stroke-[0.5px] stroke-white dark:stroke-[#030806]" />
              <circle cx="160" cy="120" r="5" className="fill-purple stroke-[0.5px] stroke-white dark:stroke-[#030806]" />

              <path d="M 75 100 A 25 25 0 0 1 125 100" stroke="#1D9E75" strokeWidth="1.5" fill="none" strokeDasharray="2 2" />
            </svg>

            {/* Glowing active node pill */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-element bg-white/90 dark:bg-slate-900/90 border-[0.5px] border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <IconHexagon className="w-5 h-5 text-brand animate-spin" style={{ animationDuration: '8s' }} />
              <div>
                <p className="text-xs font-heading font-extrabold text-slate-800 dark:text-slate-100">BLOCK MUTATION SIGNED</p>
                <p className="text-[10px] font-mono text-slate-500">Hash: 0x9efb925b42d7...</p>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* SECTION 2: STATS BAR */}
      <section className="py-10 bg-slate-50 dark:bg-[#020504] border-b-[0.5px] border-slate-200/60 dark:border-slate-800/40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-card border-[0.5px] border-slate-200/70 dark:border-slate-800/50 bg-white dark:bg-slate-900/30 flex items-center gap-4">
              <div className="w-10 h-10 rounded-element bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid flex items-center justify-center">
                <IconClock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-heading font-extrabold text-slate-800 dark:text-slate-100">&lt; 30 Seconds</p>
                <p className="text-xs text-slate-500 font-body">Ownership verification</p>
              </div>
            </div>

            <div className="p-6 rounded-card border-[0.5px] border-slate-200/70 dark:border-slate-800/50 bg-white dark:bg-slate-900/30 flex items-center gap-4">
              <div className="w-10 h-10 rounded-element bg-rose-light dark:bg-rose/10 text-rose dark:text-rose flex items-center justify-center">
                <IconTrendingDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-heading font-extrabold text-slate-800 dark:text-slate-100">↓ 80% Reduction</p>
                <p className="text-xs text-slate-500 font-body">Land disputes & fraud cases</p>
              </div>
            </div>

            <div className="p-6 rounded-card border-[0.5px] border-slate-200/70 dark:border-slate-800/50 bg-white dark:bg-slate-900/30 flex items-center gap-4">
              <div className="w-10 h-10 rounded-element bg-accent-light dark:bg-accent/10 text-accent dark:text-[#5fa2e0] flex items-center justify-center">
                <IconActivity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-heading font-extrabold text-slate-800 dark:text-slate-100">3 Days Mutation</p>
                <p className="text-xs text-slate-500 font-body">Transfer time (vs 90 days legacy)</p>
              </div>
            </div>

            <div className="p-6 rounded-card border-[0.5px] border-slate-200/70 dark:border-slate-800/50 bg-white dark:bg-slate-900/30 flex items-center gap-4">
              <div className="w-10 h-10 rounded-element bg-gold-light dark:bg-gold/10 text-gold flex items-center justify-center">
                <IconShield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-heading font-extrabold text-slate-800 dark:text-slate-100">99.9% Uptime</p>
                <p className="text-xs text-slate-500 font-body">High-availability registry SLA</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: PROBLEMS SECTION */}
      <section className="py-20 px-6 border-b-[0.5px] border-slate-200/60 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="font-heading font-extrabold text-3xl tracking-tight text-slate-900 dark:text-white">What's broken in land records today</h2>
            <p className="text-slate-500 text-sm font-body">Traditional paper-based systems are slow, insecure, and highly susceptible to corruption.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Red */}
            <div className="p-6 rounded-card border-[0.5px] border-rose-light/50 dark:border-rose/20 bg-rose-light/10 dark:bg-rose/5 flex flex-col justify-between h-[230px]">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-element bg-rose text-white flex items-center justify-center font-bold text-sm">!</div>
                <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">Fake Documents & Fraud</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-body leading-relaxed">Impersonators selling properties they don't own through forged Aadhaar cards or fake title deeds.</p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-rose text-white font-heading font-bold text-[10px] w-fit">
                <span>Forgery</span>
                <IconArrowRight className="w-2.5 h-2.5" />
                <span>Court Disputes</span>
              </div>
            </div>

            {/* Card 2: Gold */}
            <div className="p-6 rounded-card border-[0.5px] border-gold-light/50 dark:border-gold/20 bg-gold-light/10 dark:bg-gold/5 flex flex-col justify-between h-[230px]">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-element bg-gold text-white flex items-center justify-center font-bold text-sm">!</div>
                <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">Paper Record Tampering</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-body leading-relaxed">Legacy physical record registries in Tehsil offices can be damaged, altered, or destroyed maliciously.</p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-gold text-white font-heading font-bold text-[10px] w-fit">
                <span>Tampering</span>
                <IconArrowRight className="w-2.5 h-2.5" />
                <span>Loss of Rights</span>
              </div>
            </div>

            {/* Card 3: Blue */}
            <div className="p-6 rounded-card border-[0.5px] border-accent-light/50 dark:border-accent/20 bg-accent-light/10 dark:bg-accent/5 flex flex-col justify-between h-[230px]">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-element bg-accent text-white flex items-center justify-center font-bold text-sm">!</div>
                <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">No Bank Integration</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-body leading-relaxed">Banks spend weeks performing manual title search searches before approving property-backed loans.</p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-accent text-white font-heading font-bold text-[10px] w-fit">
                <span>Isolation</span>
                <IconArrowRight className="w-2.5 h-2.5" />
                <span>Loan Bottlenecks</span>
              </div>
            </div>

            {/* Card 4: Purple */}
            <div className="p-6 rounded-card border-[0.5px] border-purple-light/50 dark:border-purple/20 bg-purple-light/10 dark:bg-purple/5 flex flex-col justify-between h-[230px]">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-element bg-purple text-white flex items-center justify-center font-bold text-sm">!</div>
                <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">Manual Mutations</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-body leading-relaxed">Updating land ownership after a sale takes months and requires multiple physical visits to Govt offices.</p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-purple text-white font-heading font-bold text-[10px] w-fit">
                <span>Bureaucracy</span>
                <IconArrowRight className="w-2.5 h-2.5" />
                <span>Corruption Risks</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section className="py-20 px-6 bg-slate-50 dark:bg-[#020504] border-b-[0.5px] border-slate-200/60 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="font-heading font-extrabold text-3xl tracking-tight text-slate-900 dark:text-white">How LandChain secures ownership</h2>
            <p className="text-slate-500 text-sm font-body">Our on-chain pipeline replaces insecure manual processes with atomic cryptographical verification.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            
            {/* Step 1 */}
            <div className="p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3 text-center">
              <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center mx-auto font-heading font-extrabold text-sm">1</div>
              <h4 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200">1. Citizen KYC</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-body">Sign up securely with standard credentials or verified Google authentication.</p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3 text-center">
              <div className="w-8 h-8 rounded-full bg-brand-mid text-white flex items-center justify-center mx-auto font-heading font-extrabold text-sm">2</div>
              <h4 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200">2. Document Hash</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-body">Property survey boundaries and title registry deeds are securely stored on IPFS.</p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3 text-center">
              <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center mx-auto font-heading font-extrabold text-sm">3</div>
              <h4 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200">3. Web3 Contract</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-body">Buyer and seller digitally sign mutation agreements using private key signatures.</p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3 text-center">
              <div className="w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center mx-auto font-heading font-extrabold text-sm">4</div>
              <h4 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200">4. Govt Approval</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-body">Registrar reviews the automated audit trail on their dashboard and signs mutation approval.</p>
            </div>

            {/* Step 5 */}
            <div className="p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3 text-center">
              <div className="w-8 h-8 rounded-full bg-purple text-white flex items-center justify-center mx-auto font-heading font-extrabold text-sm">5</div>
              <h4 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200">5. Minted on Polygon</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-body">Records are written to the blockchain, updating on-chain mappings immutably.</p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5: FEATURES GRID */}
      <section className="py-20 px-6 border-b-[0.5px] border-slate-200/60 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="font-heading font-extrabold text-3xl tracking-tight text-slate-900 dark:text-white">Advanced features for modern governance</h2>
            <p className="text-slate-500 text-sm font-body">Equipping citizens, banks, and registrars with modern cryptographic utility tools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 space-y-4">
              <div className="w-10 h-10 rounded-element bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid flex items-center justify-center">
                <IconLock className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-800 dark:text-slate-200 text-base">Immutable Records</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-body">Properties cannot be transferred without on-chain signature verification from the current registered owner.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 space-y-4">
              <div className="w-10 h-10 rounded-element bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid flex items-center justify-center">
                <IconQrcode className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-800 dark:text-slate-200 text-base">QR Code Verification</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-body">Scan QR code on physical certificate pages to verify authentic data directly against the blockchain registry state.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 space-y-4">
              <div className="w-10 h-10 rounded-element bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid flex items-center justify-center">
                <IconSmartHome className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-800 dark:text-slate-200 text-base">Smart mutation Transfers</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-body">Execute transfers using automated smart contract templates. The system locks transactions until registrar approval.</p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 space-y-4">
              <div className="w-10 h-10 rounded-element bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid flex items-center justify-center">
                <IconMapPin className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-800 dark:text-slate-200 text-base">GPS Parcel Boundary Mapping</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-body">Visual polygon boundary maps integrated with Mapbox to verify coordinates, preventing overlap dispute claims.</p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 space-y-4">
              <div className="w-10 h-10 rounded-element bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid flex items-center justify-center">
                <IconBell className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-800 dark:text-slate-200 text-base">Real-time Watchlist Alerts</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-body">Receive instant notifications via Email, WhatsApp, and SMS if any mutation attempt is initiated on your properties.</p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 space-y-4">
              <div className="w-10 h-10 rounded-element bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid flex items-center justify-center">
                <IconCode className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-800 dark:text-slate-200 text-base">Secure Banking APIs</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-body">Third-party webhook endpoints allowing partner banks to fetch instant, verified encumbrance certification logs.</p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 6: STAKEHOLDERS */}
      <section className="py-20 px-6 bg-slate-50 dark:bg-[#020504] border-b-[0.5px] border-slate-200/60 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="font-heading font-extrabold text-3xl tracking-tight text-slate-900 dark:text-white">A unified platform for all stakeholders</h2>
            <p className="text-slate-500 text-sm font-body">Different entry points and tools tailored for every key participant in the real estate pipeline.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Stakeholder 1 */}
            <div className="p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid flex items-center justify-center mx-auto">
                <IconUser className="w-6 h-6" />
              </div>
              <h4 className="font-heading font-bold text-slate-800 dark:text-slate-200 text-sm">Citizens & Owners</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-body leading-relaxed">Manage properties, track portfolio values, draft smart wills, and coordinate secure transfer mutate approvals.</p>
            </div>

            {/* Stakeholder 2 */}
            <div className="p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid flex items-center justify-center mx-auto">
                <IconBuildingBank className="w-6 h-6" />
              </div>
              <h4 className="font-heading font-bold text-slate-800 dark:text-slate-200 text-sm">Banks & Lenders</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-body leading-relaxed">Verify collateral titles instantly, perform bulk query searches, set mortgages, and query LTV metrics.</p>
            </div>

            {/* Stakeholder 3 */}
            <div className="p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid flex items-center justify-center mx-auto">
                <IconBuildingCommunity className="w-6 h-6" />
              </div>
              <h4 className="font-heading font-bold text-slate-800 dark:text-slate-200 text-sm">Govt Registrars</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-body leading-relaxed">Approve land title mutations, review fraud detection scores, resolve boundary disputes, and view audit trail records.</p>
            </div>

            {/* Stakeholder 4 */}
            <div className="p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid flex items-center justify-center mx-auto">
                <IconGavel className="w-6 h-6" />
              </div>
              <h4 className="font-heading font-bold text-slate-800 dark:text-slate-200 text-sm">Legal & Arbitrators</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-body leading-relaxed">Register disputes, investigate title trace trees, place legal holds, and verify historic encumbrance logs.</p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 7: ROADMAP */}
      <section className="py-20 px-6 border-b-[0.5px] border-slate-200/60 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="font-heading font-extrabold text-3xl tracking-tight text-slate-900 dark:text-white">Platform development roadmap</h2>
            <p className="text-slate-500 text-sm font-body">Our structured phases to roll out decentralized registry infrastructure across multiple state nodes.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8 relative before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-[1px] before:bg-slate-200 dark:before:bg-slate-800">
            
            {/* Phase 1 */}
            <div className="relative pl-10 space-y-2">
              <div className="absolute left-[8px] top-[4px] w-[15px] h-[15px] rounded-full border-2 border-brand bg-white dark:bg-[#030806] z-10 flex items-center justify-center">
                <div className="w-[5px] h-[5px] rounded-full bg-brand" />
              </div>
              <p className="text-xs font-heading font-bold uppercase tracking-wider text-brand">Phase 1 (Months 0 - 4)</p>
              <h4 className="font-heading font-extrabold text-base text-slate-800 dark:text-slate-200">MVP Registry Launch</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-body leading-relaxed">Database schema setup, NextAuth sign-in integration, land record entry forms, and basic registrar approvals queue.</p>
            </div>

            {/* Phase 2 */}
            <div className="relative pl-10 space-y-2">
              <div className="absolute left-[8px] top-[4px] w-[15px] h-[15px] rounded-full border-2 border-brand-mid bg-white dark:bg-[#030806] z-10 flex items-center justify-center">
                <div className="w-[5px] h-[5px] rounded-full bg-brand-mid" />
              </div>
              <p className="text-xs font-heading font-bold uppercase tracking-wider text-brand-mid">Phase 2 (Months 4 - 8)</p>
              <h4 className="font-heading font-extrabold text-base text-slate-800 dark:text-slate-200">Smart Contract Integration</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-body leading-relaxed">Deploy Solidity smart contracts on Polygon, link IPFS document hashes, and enable wallet signature mutation transfers.</p>
            </div>

            {/* Phase 3 */}
            <div className="relative pl-10 space-y-2">
              <div className="absolute left-[8px] top-[4px] w-[15px] h-[15px] rounded-full border-2 border-accent bg-white dark:bg-[#030806] z-10 flex items-center justify-center">
                <div className="w-[5px] h-[5px] rounded-full bg-accent" />
              </div>
              <p className="text-xs font-heading font-bold uppercase tracking-wider text-accent">Phase 3 (Months 8 - 12)</p>
              <h4 className="font-heading font-extrabold text-base text-slate-800 dark:text-slate-200">Court & Banking Webhooks</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-body leading-relaxed">Launch third-party secure API key manager, integrate e-Courts database litigation checks, and launch bulk query systems.</p>
            </div>

            {/* Phase 4 */}
            <div className="relative pl-10 space-y-2">
              <div className="absolute left-[8px] top-[4px] w-[15px] h-[15px] rounded-full border-2 border-purple bg-white dark:bg-[#030806] z-10 flex items-center justify-center">
                <div className="w-[5px] h-[5px] rounded-full bg-purple" />
              </div>
              <p className="text-xs font-heading font-bold uppercase tracking-wider text-purple">Phase 4 (Months 12 - 18)</p>
              <h4 className="font-heading font-extrabold text-base text-slate-800 dark:text-slate-200">Carbon Market & Satellite Audit</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-body leading-relaxed">Integrate satellite NDVI vegetation checks, deploy Carbon Credit tokens, and launch the decentralized carbon credit marketplace.</p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 8: CTA BOX */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto p-12 rounded-card bg-brand dark:bg-brand-dark border-[0.5px] border-brand-mid/20 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-mid/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="space-y-3 z-10 relative">
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">Ready to eliminate land fraud?</h2>
            <p className="text-brand-light/80 text-sm font-body max-w-xl mx-auto">Join LandChain to secure your land titles, automate mutations, and integrate your workflow with the blockchain.</p>
          </div>

          <div className="z-10 relative pt-2">
            <Link 
              href="/register" 
              className="px-8 py-3.5 rounded-element bg-white hover:bg-slate-100 text-brand font-heading font-extrabold text-sm transition-all inline-flex items-center gap-2"
            >
              <span>Get Started Now</span>
              <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
