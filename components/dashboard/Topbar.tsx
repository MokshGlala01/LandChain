import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/providers";
import {
  IconBell,
  IconSun,
  IconMoon,
  IconCheck,
  IconChevronDown,
  IconMenu2,
  IconShieldCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";

interface TopbarProps {
  onToggleSidebar: () => void;
}

interface NotificationItem {
  id: string;
  type: string;
  message: string;
  time: string;
  read: boolean;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "nt-1",
      type: "DISPUTE",
      message: "Dispute filed for watched property PARCEL-4902-881. Status set to DISPUTED.",
      time: "2 mins ago",
      read: false,
    },
    {
      id: "nt-2",
      type: "ALERT",
      message: "Security checklist updated: KYC verification successfully validated.",
      time: "1 hour ago",
      read: false,
    },
    {
      id: "nt-3",
      type: "TRANSFER",
      message: "Stamp duty receipt generated for transaction block #290188.",
      time: "4 hours ago",
      read: true,
    },
    {
      id: "nt-4",
      type: "CARBON",
      message: "Satellite NDVI vegetation check completed successfully for PARCEL-1002.",
      time: "1 day ago",
      read: true,
    },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Title translation based on path
  const getPageTitle = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "Home Node";
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + " Panel";
    }
    // Sub-routes
    const sub = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    return sub.replace(/-/g, " ");
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b-[0.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-element hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <IconMenu2 className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Dynamic Title / Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-heading font-extrabold text-slate-400 dark:text-slate-500">
          <span>{user.role} GATEWAY</span>
          <span>/</span>
          <span className="text-brand dark:text-brand-mid">{getPageTitle()}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        {/* Theme Toggler */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-element hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <IconSun className="w-4.5 h-4.5 stroke-[1.8]" />
            ) : (
              <IconMoon className="w-4.5 h-4.5 stroke-[1.8]" />
            )}
          </button>
        )}

        {/* Notifications Indicator */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-element hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer relative"
          >
            <IconBell className="w-4.5 h-4.5 stroke-[1.8]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red animate-pulse"></span>
            )}
          </button>

          {/* Notifications Panel */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-950 border-[0.5px] border-slate-200 dark:border-slate-800 rounded-card shadow-2xl z-50 p-4 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                <span className="text-[10px] font-heading font-extrabold uppercase text-slate-400 tracking-wider">
                  Notifications ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[9px] font-bold text-brand hover:text-brand-mid transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 no-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-element border-[0.5px] text-[10px] leading-relaxed flex gap-2 justify-between items-start transition-colors ${
                        item.read
                          ? "bg-slate-50/50 border-slate-100 dark:bg-slate-900/10 dark:border-slate-900 text-slate-500"
                          : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      }`}
                    >
                      <div className="flex gap-2 items-start">
                        {item.type === "DISPUTE" || item.type === "ALERT" ? (
                          <IconAlertTriangle className="w-4 h-4 text-red shrink-0" />
                        ) : (
                          <IconShieldCheck className="w-4 h-4 text-brand shrink-0" />
                        )}
                        <div>
                          <p>{item.message}</p>
                          <span className="text-[8px] text-slate-400 block mt-1">{item.time}</span>
                        </div>
                      </div>
                      {!item.read && (
                        <button
                          onClick={() => handleMarkAsRead(item.id)}
                          className="text-slate-400 hover:text-brand transition-colors p-0.5"
                          title="Mark Read"
                        >
                          <IconCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-450 text-center py-6">No new notifications.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Small Profile Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-pill bg-slate-50 dark:bg-slate-900 border-[0.5px] border-slate-150 dark:border-slate-850">
          <div className="w-6.5 h-6.5 rounded-full bg-brand-light dark:bg-brand-dark/30 text-brand dark:text-brand-mid font-heading font-extrabold text-[10px] flex items-center justify-center border-[0.5px] border-brand-mid/10 shadow-inner shrink-0">
            <span className="uppercase">{user.name.substring(0, 2)}</span>
          </div>
          <span className="hidden sm:inline font-heading font-extrabold text-[10px] text-slate-600 dark:text-slate-350">
            {user.role}
          </span>
        </div>
      </div>
    </header>
  );
}
