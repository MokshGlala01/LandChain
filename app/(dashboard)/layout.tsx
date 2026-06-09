"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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

  return (
    <div className="min-h-screen flex bg-gray-50/30 dark:bg-[#030806] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Role-Aware Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Panel Viewport */}
      <div
        className="flex-grow flex flex-col min-h-screen overflow-x-hidden transition-all duration-300"
        style={{ paddingLeft: collapsed ? "64px" : "220px" }}
      >
        {/* Dynamic Topbar */}
        <Topbar onToggleSidebar={() => setCollapsed(!collapsed)} />

        {/* Dynamic Router Render Frame */}
        <main className="flex-grow p-6 bg-gray-50/20 dark:bg-[#030806]/40">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="max-w-7xl mx-auto w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
