"use client";

import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { 
  IconShieldLock, 
  IconDatabaseShare, 
  IconMapPin, 
  IconHourglassOff, 
  IconBuildingBank, 
  IconHistory,
  IconArrowRight,
  IconCircleCheck,
  IconUser,
  IconAlertTriangle,
  IconCheck,
  IconSearch,
  IconCpu
} from "@tabler/icons-react";

// Framer motion variants for stagger reveals
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#030806] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <motion.div 
              className="lg:col-span-7 space-y-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Pill badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid font-heading font-bold text-xs uppercase tracking-wider lc-border">
                <IconShieldLock className="w-3.5 h-3.5" />
                India's First Web3 Land Registry
              </div>
              
              <h1 className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight">
                Decentralized Trust for{" "}
                <span className="text-brand dark:text-brand-mid relative inline-block">
                  Land Ownership
                  <span className="absolute bottom-1 left-0 w-full h-2 bg-brand-light/75 dark:bg-brand-dark/30 -z-10 rounded-sm"></span>
                </span>
              </h1>
              
              <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-body leading-relaxed max-w-2xl">
                Replace opaque paper registries and manual mutation files with instant blockchain validation, tamper-proof title deeds, and Mapbox polygon auditing.
              </p>

              {/* Two CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  href="/login" 
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-element bg-brand hover:bg-brand-mid dark:bg-brand dark:hover:bg-brand-mid text-white font-heading font-semibold transition-all hover:-translate-y-0.5"
                >
                  Register Property
                  <IconArrowRight className="w-4 h-4" />
                </Link>
                <Link 
                  href="/search" 
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-element bg-white hover:bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-100 font-heading font-semibold lc-border transition-all hover:-translate-y-0.5"
                >
                  Search Properties
                  <IconSearch className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Right Interactive Node Graphic */}
            <motion.div 
              className="lg:col-span-5 flex justify-center relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="w-full max-w-[420px] aspect-square relative rounded-full bg-gradient-to-tr from-brand-light/35 to-accent-light/35 dark:from-brand-dark/10 dark:to-accent-DEFAULT/5 flex items-center justify-center">
                
                {/* Rotating ring */}
                <div className="absolute inset-4 rounded-full border border-dashed border-brand/20 dark:border-brand-mid/10 animate-[spin_40s_linear_infinite]"></div>
                
                {/* SVG node graphic */}
                <svg className="w-4/5 h-4/5 z-10" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Grid Lines */}
                  <line x1="30" y1="50" x2="100" y2="30" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1"/>
                  <line x1="100" y1="30" x2="170" y2="50" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1"/>
                  <line x1="170" y1="50" x2="170" y2="130" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1"/>
                  <line x1="170" y1="130" x2="100" y2="170" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1"/>
                  <line x1="100" y1="170" x2="30" y2="130" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1"/>
                  <line x1="30" y1="130" x2="30" y2="50" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1"/>
                  <line x1="100" y1="30" x2="100" y2="170" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1"/>
                  <line x1="30" y1="50" x2="170" y2="130" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1"/>
                  <line x1="30" y1="130" x2="170" y2="50" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1"/>

                  {/* Connected Nodes */}
                  <motion.circle 
                    cx="100" cy="30" r="8" 
                    fill="#0F6E56" className="dark:fill-[#1D9E75]"
                    animate={{ y: [30, 26, 30] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  />
                  <motion.circle 
                    cx="30" cy="50" r="6" 
                    fill="#185FA5" className="dark:fill-[#4696e6]"
                    animate={{ y: [50, 54, 50] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  />
                  <motion.circle 
                    cx="170" cy="50" r="6" 
                    fill="#BA7517" className="dark:fill-[#faae43]"
                    animate={{ y: [50, 46, 50] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                  />
                  <motion.circle 
                    cx="170" cy="130" r="7" 
                    fill="#0F6E56" className="dark:fill-[#1D9E75]"
                    animate={{ y: [130, 134, 130] }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                  />
                  <motion.circle 
                    cx="100" cy="170" r="8" 
                    fill="#185FA5" className="dark:fill-[#4696e6]"
                    animate={{ y: [170, 166, 170] }}
                    transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
                  />
                  <motion.circle 
                    cx="30" cy="130" r="6" 
                    fill="#BA7517" className="dark:fill-[#faae43]"
                    animate={{ y: [130, 132, 130] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                  />
                  
                  {/* Central Core block */}
                  <motion.g 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                    className="origin-[100px_100px]"
                  >
                    <rect x="85" y="85" width="30" height="30" rx="4" fill="#0F6E56" fillOpacity="0.8" stroke="#E1F5EE" strokeWidth="1" />
                  </motion.g>
                </svg>

                {/* Central CPU Icon absolute overlay */}
                <IconCpu className="w-5 h-5 text-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none" />

                {/* Glassmorphic overlay cards representing blocks */}
                <div className="absolute -bottom-4 -left-6 px-4 py-2.5 rounded-element bg-white/70 dark:bg-slate-900/70 backdrop-blur-md lc-border text-xs flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse"></span>
                  <span>Block #14,028 Verified</span>
                </div>
                <div className="absolute -top-4 -right-6 px-4 py-2.5 rounded-element bg-white/70 dark:bg-slate-900/70 backdrop-blur-md lc-border text-xs flex items-center gap-2">
                  <IconShieldLock className="w-3.5 h-3.5 text-brand" />
                  <span>SHA-256 Mutation Lock</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* STATS BAR */}
        <section className="bg-slate-50 dark:bg-slate-950/20 py-8 px-6 lc-border border-y transition-colors duration-300">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
            
            <div className="text-center md:text-left space-y-1">
              <div className="font-heading font-extrabold text-3xl md:text-4xl text-brand dark:text-brand-mid">&lt; 30s</div>
              <div className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-body">On-Chain Verification</div>
            </div>
            
            <div className="text-center md:text-left space-y-1">
              <div className="font-heading font-extrabold text-3xl md:text-4xl text-brand dark:text-brand-mid">↓ 80%</div>
              <div className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-body">Reduction in Title Fraud</div>
            </div>
            
            <div className="text-center md:text-left space-y-1">
              <div className="font-heading font-extrabold text-3xl md:text-4xl text-brand dark:text-brand-mid">3 Days</div>
              <div className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-body">Complete Ownership Transfer</div>
            </div>
            
            <div className="text-center md:text-left space-y-1">
              <div className="font-heading font-extrabold text-3xl md:text-4xl text-brand dark:text-brand-mid">99.9%</div>
              <div className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-body">Platform Uptime SLA</div>
            </div>

          </div>
        </section>

        {/* PROBLEMS SECTION */}
        <section className="py-20 px-6 max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-heading font-bold text-xs uppercase tracking-widest text-slate-400">Systemic Challenges</h2>
            <h3 className="font-heading font-extrabold text-3xl md:text-4xl">Why Traditional Land Registries Fail</h3>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Red Card */}
            <motion.div variants={itemVariants} className="lc-border rounded-card p-6 bg-red-50/20 dark:bg-red-950/5 flex flex-col justify-between h-72">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-element bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400">
                  <IconAlertTriangle className="w-5.5 h-5.5" />
                </div>
                <h4 className="font-heading font-bold text-lg text-red-900 dark:text-red-300">Title Duplication</h4>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-body">
                  Multiple sales deeds issued for a single plot using forged credentials and manual ledger modifications.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-heading font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mt-4">
                <span>Cause</span>
                <IconArrowRight className="w-3.5 h-3.5" />
                <span>Consequence: Legal Dispute</span>
              </div>
            </motion.div>

            {/* Amber Card */}
            <motion.div variants={itemVariants} className="lc-border rounded-card p-6 bg-amber-50/20 dark:bg-amber-950/5 flex flex-col justify-between h-72">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-element bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <IconHourglassOff className="w-5.5 h-5.5" />
                </div>
                <h4 className="font-heading font-bold text-lg text-amber-900 dark:text-amber-300">Delay & Bribery</h4>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-body">
                  Mutual mutations take 30-90 days due to reliance on physical verifiers and offline registrar approval loops.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-heading font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mt-4">
                <span>Cause</span>
                <IconArrowRight className="w-3.5 h-3.5" />
                <span>Consequence: Capital Lock</span>
              </div>
            </motion.div>

            {/* Blue Card */}
            <motion.div variants={itemVariants} className="lc-border rounded-card p-6 bg-blue-50/20 dark:bg-blue-950/5 flex flex-col justify-between h-72">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-element bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <IconSearch className="w-5.5 h-5.5" />
                </div>
                <h4 className="font-heading font-bold text-lg text-blue-900 dark:text-blue-300">Opaque History</h4>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-body">
                  Encumbrance tracking requires hiring brokers to dig through physical registers spanning 30 years.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-heading font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mt-4">
                <span>Cause</span>
                <IconArrowRight className="w-3.5 h-3.5" />
                <span>Consequence: Broker Fraud</span>
              </div>
            </motion.div>

            {/* Purple Card */}
            <motion.div variants={itemVariants} className="lc-border rounded-card p-6 bg-purple-50/20 dark:bg-purple-950/5 flex flex-col justify-between h-72">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-element bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <IconBuildingBank className="w-5.5 h-5.5" />
                </div>
                <h4 className="font-heading font-bold text-lg text-purple-900 dark:text-purple-300">Encroachment</h4>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-body">
                  Boundaries drawn on physical papers are easily manipulated, triggering immediate territorial disputes.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-heading font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mt-4">
                <span>Cause</span>
                <IconArrowRight className="w-3.5 h-3.5" />
                <span>Consequence: Court Battles</span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-slate-50 dark:bg-[#020504] py-20 px-6 transition-colors duration-300">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="font-heading font-bold text-xs uppercase tracking-widest text-slate-400">The Lifecycle</h2>
              <h3 className="font-heading font-extrabold text-3xl md:text-4xl">How LandChain Encrypts Land Registry</h3>
            </div>

            {/* 5-Step horizontal flow */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center space-y-4 relative">
                <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-heading font-extrabold text-lg shadow-none">1</div>
                <h4 className="font-heading font-bold text-base">Aadhaar KYC</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed">
                  Citizens authenticate via mock Aadhaar OTP to secure cryptographic identity matching.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center space-y-4 relative">
                <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-heading font-extrabold text-lg shadow-none">2</div>
                <h4 className="font-heading font-bold text-base">Boundary Mapping</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed">
                  Draw property boundaries on Mapbox to record absolute GPS polygon coordinates.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center space-y-4 relative">
                <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-heading font-extrabold text-lg shadow-none">3</div>
                <h4 className="font-heading font-bold text-base">IPFS Storage</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed">
                  Deeds and NOC copies are uploaded to Pinata IPFS to compute immutable content hashes.
                </p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center space-y-4 relative">
                <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-heading font-extrabold text-lg shadow-none">4</div>
                <h4 className="font-heading font-bold text-base">Registrar Approval</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed">
                  Govt Registrar reviews the application and audit logs before executing mutations.
                </p>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col items-center text-center space-y-4 relative">
                <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-heading font-extrabold text-lg shadow-none">5</div>
                <h4 className="font-heading font-bold text-base">On-Chain Lock</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed">
                  The smart contract updates the registry on Polygon and logs the irreversible tx hash.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-20 px-6 max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-heading font-bold text-xs uppercase tracking-widest text-slate-400">Technical Foundation</h2>
            <h3 className="font-heading font-extrabold text-3xl md:text-4xl">Platform Features</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="lc-border rounded-card p-6 bg-white dark:bg-slate-900/20 hover:border-brand/40 dark:hover:border-brand-mid/40 transition-all duration-300 space-y-4">
              <div className="w-11 h-11 rounded-element bg-brand-light dark:bg-brand-dark/30 flex items-center justify-center text-brand dark:text-brand-mid">
                <IconShieldLock className="w-5.5 h-5.5 stroke-[1.8]" />
              </div>
              <h4 className="font-heading font-bold text-lg">Blockchain Provenance</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-body leading-relaxed">
                Immutable history log matching smart contracts to maintain perfect chronological history of title deeds.
              </p>
            </div>

            {/* Card 2 */}
            <div className="lc-border rounded-card p-6 bg-white dark:bg-slate-900/20 hover:border-brand/40 dark:hover:border-brand-mid/40 transition-all duration-300 space-y-4">
              <div className="w-11 h-11 rounded-element bg-brand-light dark:bg-brand-dark/30 flex items-center justify-center text-brand dark:text-brand-mid">
                <IconDatabaseShare className="w-5.5 h-5.5 stroke-[1.8]" />
              </div>
              <h4 className="font-heading font-bold text-lg">IPFS Hashed Deeds</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-body leading-relaxed">
                Document files pinned on Pinata IPFS ensure papers cannot be modified or replaced without breaking hashes.
              </p>
            </div>

            {/* Card 3 */}
            <div className="lc-border rounded-card p-6 bg-white dark:bg-slate-900/20 hover:border-brand/40 dark:hover:border-brand-mid/40 transition-all duration-300 space-y-4">
              <div className="w-11 h-11 rounded-element bg-brand-light dark:bg-brand-dark/30 flex items-center justify-center text-brand dark:text-brand-mid">
                <IconMapPin className="w-5.5 h-5.5 stroke-[1.8]" />
              </div>
              <h4 className="font-heading font-bold text-lg">Polygon Boundary Checks</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-body leading-relaxed">
                Mapbox draw bounds check prevents new registrations from overlapping with previously locked on-chain maps.
              </p>
            </div>

            {/* Card 4 */}
            <div className="lc-border rounded-card p-6 bg-white dark:bg-slate-900/20 hover:border-brand/40 dark:hover:border-brand-mid/40 transition-all duration-300 space-y-4">
              <div className="w-11 h-11 rounded-element bg-brand-light dark:bg-brand-dark/30 flex items-center justify-center text-brand dark:text-brand-mid">
                <IconHourglassOff className="w-5.5 h-5.5 stroke-[1.8]" />
              </div>
              <h4 className="font-heading font-bold text-lg">Instant Mutation Approvals</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-body leading-relaxed">
                Upon seller-buyer matching, stamp duty validation, and registrar click, mutations execute in single transactions.
              </p>
            </div>

            {/* Card 5 */}
            <div className="lc-border rounded-card p-6 bg-white dark:bg-slate-900/20 hover:border-brand/40 dark:hover:border-brand-mid/40 transition-all duration-300 space-y-4">
              <div className="w-11 h-11 rounded-element bg-brand-light dark:bg-brand-dark/30 flex items-center justify-center text-brand dark:text-brand-mid">
                <IconBuildingBank className="w-5.5 h-5.5 stroke-[1.8]" />
              </div>
              <h4 className="font-heading font-bold text-lg">Mortgage Bank APIs</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-body leading-relaxed">
                Allows lending institutions to lock query status of land assets directly to approve home loans instantly.
              </p>
            </div>

            {/* Card 6 */}
            <div className="lc-border rounded-card p-6 bg-white dark:bg-slate-900/20 hover:border-brand/40 dark:hover:border-brand-mid/40 transition-all duration-300 space-y-4">
              <div className="w-11 h-11 rounded-element bg-brand-light dark:bg-brand-dark/30 flex items-center justify-center text-brand dark:text-brand-mid">
                <IconHistory className="w-5.5 h-5.5 stroke-[1.8]" />
              </div>
              <h4 className="font-heading font-bold text-lg">Govt Audit Logs</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-body leading-relaxed">
                Verifiable event feed tracking all registrars, verifications, and approvals on an open public indexer.
              </p>
            </div>

          </div>
        </section>

        {/* STAKEHOLDERS */}
        <section className="bg-slate-50 dark:bg-slate-950/20 py-20 px-6 transition-colors duration-300">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="font-heading font-bold text-xs uppercase tracking-widest text-slate-400">Stakeholder Personas</h2>
              <h3 className="font-heading font-extrabold text-3xl md:text-4xl">Unified Platform for the Ecosystem</h3>
            </div>

            <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
              <span className="px-6 py-3 rounded-pill bg-white dark:bg-slate-900 lc-border font-heading font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <IconUser className="w-4 h-4 text-brand" />
                Citizens (Sellers & Buyers)
              </span>
              <span className="px-6 py-3 rounded-pill bg-white dark:bg-slate-900 lc-border font-heading font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <IconBuildingBank className="w-4 h-4 text-brand" />
                Lending Banks
              </span>
              <span className="px-6 py-3 rounded-pill bg-white dark:bg-slate-900 lc-border font-heading font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <IconCircleCheck className="w-4 h-4 text-brand" />
                Govt Registrars
              </span>
              <span className="px-6 py-3 rounded-pill bg-white dark:bg-slate-900 lc-border font-heading font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <IconShieldLock className="w-4 h-4 text-brand" />
                Central Admins
              </span>
            </div>
          </div>
        </section>

        {/* ROADMAP */}
        <section className="py-20 px-6 max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <h2 className="font-heading font-bold text-xs uppercase tracking-widest text-slate-400">Timeline</h2>
            <h3 className="font-heading font-extrabold text-3xl md:text-4xl">Development Roadmap</h3>
          </div>

          {/* Vertical 4-phase timeline */}
          <div className="relative border-l-[0.5px] border-slate-200 dark:border-slate-800 pl-8 space-y-12 ml-4">
            
            {/* Phase 1 */}
            <div className="relative">
              {/* Dot */}
              <div className="absolute -left-[39.5px] top-1.5 w-6 h-6 rounded-full bg-brand-light dark:bg-brand-dark flex items-center justify-center text-brand dark:text-brand-mid font-bold text-xs lc-border">1</div>
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-lg text-slate-800 dark:text-slate-200">Phase 1: Solidity & App Prototype</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-body leading-relaxed">
                  Implement key smart contracts, local Hardhat simulations, mock Aadhaar OTP services, and spatial query integrations.
                </p>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="relative">
              {/* Dot */}
              <div className="absolute -left-[39.5px] top-1.5 w-6 h-6 rounded-full bg-brand-light dark:bg-brand-dark flex items-center justify-center text-brand dark:text-brand-mid font-bold text-xs lc-border">2</div>
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-lg text-slate-800 dark:text-slate-200">Phase 2: Local Pilot Deployment</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-body leading-relaxed">
                  Launch the platform within a targeted municipal region (e.g. Noida District) to test real registrar approved mutations on-chain.
                </p>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="relative">
              {/* Dot */}
              <div className="absolute -left-[39.5px] top-1.5 w-6 h-6 rounded-full bg-brand-light dark:bg-brand-dark flex items-center justify-center text-brand dark:text-brand-mid font-bold text-xs lc-border">3</div>
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-lg text-slate-800 dark:text-slate-200">Phase 3: Institutional Bank APIs</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-body leading-relaxed">
                  Open read-only verification endpoints for mortgage lenders to check ownership provenance and automate lien checking.
                </p>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="relative">
              {/* Dot */}
              <div className="absolute -left-[39.5px] top-1.5 w-6 h-6 rounded-full bg-brand-light dark:bg-brand-dark flex items-center justify-center text-brand dark:text-brand-mid font-bold text-xs lc-border">4</div>
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-lg text-slate-800 dark:text-slate-200">Phase 4: State-wide Rollout</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-body leading-relaxed">
                  Integrate with National Land Records Modernization Program (NLRMP) and deploy on mainnet nodes for absolute legal recognition.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* CTA BOX */}
        <section className="px-6 pb-20">
          <div className="max-w-5xl mx-auto rounded-card bg-brand p-8 md:p-12 text-center text-white space-y-6 relative overflow-hidden">
            {/* Background design */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-brand-mid/10"></div>
            <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-brand-dark/10"></div>

            <h3 className="font-heading font-extrabold text-3xl md:text-4xl z-10 relative">
              Ready to Secure Your Real Estate?
            </h3>
            <p className="text-brand-light text-sm md:text-base max-w-2xl mx-auto font-body leading-relaxed z-10 relative">
              Initiate property verification, lock parcel boundary coordinates, or complete a fast, digital transfer of deeds under registrar supervision today.
            </p>
            <div className="pt-4 z-10 relative">
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-element bg-white hover:bg-slate-50 text-brand font-heading font-bold transition-all hover:-translate-y-0.5 cursor-pointer shadow-none"
              >
                Request Pilot Access
                <IconArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
