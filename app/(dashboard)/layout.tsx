"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { 
  IconFingerprint, 
  IconCalendar, 
  IconUser, 
  IconBuildingBank, 
  IconSearch, 
  IconShieldCheck, 
  IconLock,
  IconSun,
  IconMoon,
  IconChevronLeft,
  IconChevronRight,
  IconLayoutDashboard,
  IconFileSearch,
  IconLogout,
  IconGavel,
  IconMenu2,
  IconX
} from "@tabler/icons-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Calendar state
  const [currentDate] = useState(new Date());
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  // Ensure hydration matches client theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (mounted && !user) {
      router.push("/login");
    }
  }, [mounted, user, router]);

  if (!mounted || !user) return null;

  // Render navigation links based on user role
  const getNavLinks = () => {
    switch (user.role) {
      case "CITIZEN":
        return [
          {
            name: "Registry Dashboard",
            href: "/citizen",
            icon: IconLayoutDashboard,
            badge: null
          },
          {
            name: "Search Ledger",
            href: "/search",
            icon: IconSearch,
            badge: null
          },
          {
            name: "Verify Certificate",
            href: "/verify",
            icon: IconFileSearch,
            badge: null
          }
        ];
      case "BANK":
        return [
          {
            name: "Collateral Checks",
            href: "/bank",
            icon: IconBuildingBank,
            badge: null
          },
          {
            name: "Search Ledger",
            href: "/search",
            icon: IconSearch,
            badge: null
          },
          {
            name: "Verify Certificate",
            href: "/verify",
            icon: IconFileSearch,
            badge: null
          }
        ];
      case "REGISTRAR":
        return [
          {
            name: "Mutation Approvals",
            href: "/registrar",
            icon: IconGavel,
            badge: "4" // Simulated pending items badge
          },
          {
            name: "Search Ledger",
            href: "/search",
            icon: IconSearch,
            badge: null
          },
          {
            name: "Verify Certificate",
            href: "/verify",
            icon: IconFileSearch,
            badge: null
          }
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  // Simple Mini-Calendar Calculation (for June 2026)
  const daysInMonth = 30; // June 2026 has 30 days
  const startDayOffset = 1; // June 1, 2026 is a Monday (1)
  const calendarDays = [];
  
  // Fill empty offset days
  for (let i = 0; i < startDayOffset; i++) {
    calendarDays.push(null);
  }
  // Fill month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Highlighted event days for calendar (representing block/audit mutations schedule)
  const highlightDays = [5, 10, 11, 12, 13, 14, 15, 16];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const currentRoleLabel = () => {
    if (user.role === "CITIZEN") return "Resident";
    if (user.role === "BANK") return "Lender";
    if (user.role === "REGISTRAR") return "Officer";
    return "User";
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#030806] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. SIDEBAR (Sticky on Left) */}
      <aside className={`fixed inset-y-0 left-0 w-80 bg-[#1e2530] text-slate-300 flex flex-col h-screen border-r-[0.5px] border-slate-800 z-40 transition-transform duration-300 xl:translate-x-0 xl:sticky xl:top-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b-[0.5px] border-slate-800 bg-[#1a202a]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-element bg-brand flex items-center justify-center p-1.5 border-[0.5px] border-brand-mid/25 shadow-lg">
              <img src="/logo.png" alt="LandChain Logo" className="w-full h-full object-contain invert" />
            </div>
            <span className="font-heading font-extrabold text-lg text-white tracking-tight">LandChain</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="xl:hidden p-1 text-slate-400 hover:text-white">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Sidebar Area */}
        <div className="flex-grow overflow-y-auto px-4 py-6 space-y-8 no-scrollbar">
          
          {/* Main Navigation Links */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-element text-sm font-heading font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? "bg-brand text-white shadow-md shadow-brand/10 border-[0.5px] border-brand-mid/20" 
                      : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 stroke-[1.8] ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{link.name}</span>
                  </div>
                  {link.badge && (
                    <span className="w-5 h-5 rounded-full bg-[#13c2c2] text-white font-body text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mutation Schedule Calendar Widget */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2 text-[9px] font-bold uppercase tracking-wider text-slate-500">
              <span>Block Mutation Calendar</span>
              <span className="text-[10px] text-slate-400">June 2026</span>
            </div>
            
            <div className="bg-[#171c26] rounded-card p-4 border-[0.5px] border-slate-800 space-y-3">
              {/* Header Days of Week */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 font-heading">
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
                <span>S</span>
              </div>
              {/* Grid Days */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-body">
                {calendarDays.map((day, idx) => {
                  if (day === null) return <div key={`empty-${idx}`}></div>;
                  
                  const isHighlighted = highlightDays.includes(day);
                  const isToday = day === 6; // June 6, 2026 is Today
                  
                  let dayClass = "text-slate-400 py-1 rounded-element";
                  if (isToday) {
                    dayClass = "bg-[#fab005] text-slate-950 font-bold py-1 rounded-element shadow-sm";
                  } else if (isHighlighted) {
                    dayClass = "bg-brand/20 text-brand-mid font-semibold py-1 rounded-element";
                  }

                  return (
                    <div key={day} className={dayClass}>
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lien Mortgage Freeze Date Inputs */}
          <div className="space-y-3">
            <div className="px-2 text-[9px] font-bold uppercase tracking-wider text-slate-500">
              <span>Lien Lock Timeframe</span>
            </div>
            <div className="bg-[#171c26] rounded-card p-4 border-[0.5px] border-slate-800 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-500 font-heading">Freeze Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-[#1e2530] text-xs text-white border-[0.5px] border-slate-800 rounded-element px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-500 font-heading">Release Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full bg-[#1e2530] text-xs text-white border-[0.5px] border-slate-800 rounded-element px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t-[0.5px] border-slate-800 bg-[#1a202a]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-rose-950/20 hover:text-rose-400 text-slate-400 font-heading font-semibold text-xs rounded-element transition-all cursor-pointer border-[0.5px] border-slate-700/30"
          >
            <IconLogout className="w-4 h-4" />
            <span>Sign Out Profile</span>
          </button>
        </div>

      </aside>

      {/* 2. MAIN VIEWPORT (Right side) */}
      <div className="flex-grow flex flex-col min-h-screen overflow-x-hidden relative">
        
        {/* Mobile Navbar Overlay Toggle */}
        <header className="h-16 flex items-center justify-between px-6 border-b-[0.5px] border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#030806] z-30 sticky top-0 xl:h-20 xl:px-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 rounded-element hover:bg-slate-100 dark:hover:bg-slate-900 xl:hidden cursor-pointer"
            >
              <IconMenu2 className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            
            {/* Context breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-heading font-bold text-slate-400 dark:text-slate-500">
              <span>REGISTRY NODE</span>
              <span>/</span>
              <span className="text-brand dark:text-brand-mid">{user.role} INTERFACE</span>
            </div>
          </div>

          {/* Right side controls (User Card, Theme Switcher) */}
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-element hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
              title="Toggle Theme Mode"
            >
              {theme === "dark" ? (
                <IconSun className="w-4.5 h-4.5 stroke-[1.8]" />
              ) : (
                <IconMoon className="w-4.5 h-4.5 stroke-[1.8]" />
              )}
            </button>

            {/* Profile Avatar Card */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-card bg-slate-50 dark:bg-slate-900 border-[0.5px] border-slate-200 dark:border-slate-800/60 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-brand-light dark:bg-brand-dark/30 text-brand dark:text-brand-mid font-heading font-extrabold text-sm flex items-center justify-center border-[0.5px] border-brand-mid/10 shadow-inner overflow-hidden">
                {/* Generate stylish default initials or render generic user face */}
                <span className="uppercase">{user.name.substring(0, 2)}</span>
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="font-heading font-extrabold text-xs text-slate-800 dark:text-slate-200 leading-tight">
                  {user.name}
                </span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <IconShieldCheck className="w-3 h-3 text-brand-mid" />
                  {currentRoleLabel()}
                </span>
              </div>
            </div>

          </div>
        </header>

        {/* 3. Page Content Scroll Area */}
        <main className="flex-grow p-6 lg:p-10 bg-slate-50 dark:bg-[#030806] z-10 font-body">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
