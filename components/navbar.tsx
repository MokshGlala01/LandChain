"use client";

import Link from "next/link";
import { useAuth } from "./providers";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { 
  IconLink, 
  IconSun, 
  IconMoon, 
  IconWallet, 
  IconLogout, 
  IconLayoutDashboard,
  IconSearch,
  IconShieldCheck
} from "@tabler/icons-react";

export default function Navbar() {
  const { user, logout, connectWallet, walletAddress } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-[#030806]/70 lc-border border-b transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-element bg-brand-light dark:bg-brand-dark/30 flex items-center justify-center text-brand dark:text-brand-mid transition-all duration-300 group-hover:scale-105">
            <IconLink className="w-5.5 h-5.5 stroke-[2]" />
          </div>
          <span className="font-heading font-extrabold text-2xl tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-brand dark:group-hover:text-brand-mid transition-colors duration-300">
            LandChain
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 font-heading text-sm font-medium">
          <Link href="/search" className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-brand dark:hover:text-brand-mid transition-colors">
            <IconSearch className="w-4 h-4" />
            Search
          </Link>
          <Link href="/verify/PARCEL-4902-881" className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-brand dark:hover:text-brand-mid transition-colors">
            <IconShieldCheck className="w-4 h-4" />
            Verify
          </Link>
          {user ? (
            <Link 
              href={user.role === "REGISTRAR" ? "/registrar" : user.role === "BANK" ? "/bank" : "/citizen"} 
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-brand dark:hover:text-brand-mid transition-colors"
            >
              <IconLayoutDashboard className="w-4 h-4" />
              Dashboard ({user.role})
            </Link>
          ) : (
            <Link href="/login" className="text-slate-600 dark:text-slate-300 hover:text-brand dark:hover:text-brand-mid transition-colors">
              Login / Register
            </Link>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-element text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 lc-border bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 transition-all cursor-pointer"
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <IconSun className="w-4.5 h-4.5 stroke-[1.8]" />
              ) : (
                <IconMoon className="w-4.5 h-4.5 stroke-[1.8]" />
              )}
            </button>
          )}

          {/* Wallet Button */}
          <button
            onClick={connectWallet}
            className="flex items-center gap-2 px-4 py-2.5 rounded-element font-heading text-sm font-semibold transition-all duration-300 cursor-pointer text-white bg-brand hover:bg-brand-mid dark:bg-brand dark:hover:bg-brand-mid shadow-none focus:ring-2 focus:ring-brand-mid"
          >
            <IconWallet className="w-4 h-4" />
            {walletAddress ? (
              <span>{formatAddress(walletAddress)}</span>
            ) : (
              <span className="hidden sm:inline">Connect Wallet</span>
            )}
          </button>

          {/* Logout if User */}
          {user && (
            <button
              onClick={logout}
              className="p-2.5 rounded-element text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 lc-border bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
              title="Logout"
            >
              <IconLogout className="w-4.5 h-4.5 stroke-[1.8]" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
