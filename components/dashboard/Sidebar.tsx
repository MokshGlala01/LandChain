import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers";
import {
  IconHome,
  IconFileText,
  IconSwitchHorizontal,
  IconFileCertificate,
  IconBell,
  IconLeaf,
  IconGavel,
  IconScale,
  IconShield,
  IconHistory,
  IconLock,
  IconUserCheck,
  IconBuildingBank,
  IconDatabaseImport,
  IconWebhook,
  IconReportMoney,
  IconTrendingUp,
  IconMap,
  IconKey,
  IconSettings,
  IconBuildingSkyscraper,
  IconBuildingCommunity,
  IconTimeline,
  IconCertificate,
  IconPlant,
  IconTransform,
  IconPolygon,
  IconCloud,
  IconLogout,
  IconDatabase,
} from "@tabler/icons-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  // Define navigation groups per role
  const roleNavItems: Record<string, { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[]> = {
    CITIZEN: [
      { label: "Overview", href: "/citizen", icon: IconHome },
      { label: "Documents", href: "/citizen/documents", icon: IconFileText },
      { label: "Transfers", href: "/citizen/transfer", icon: IconSwitchHorizontal },
      { label: "Will & Nominees", href: "/citizen/will", icon: IconFileCertificate },
      { label: "Alerts Watchlist", href: "/citizen/alerts", icon: IconBell },
      { label: "Carbon Credits", href: "/citizen/carbon", icon: IconLeaf },
    ],
    REGISTRAR: [
      { label: "Approvals Queue", href: "/registrar", icon: IconGavel },
      { label: "Disputes", href: "/registrar/disputes", icon: IconScale },
      { label: "Fraud Alerts", href: "/registrar/fraud", icon: IconShield },
      { label: "Audit Log", href: "/registrar/audit", icon: IconHistory },
      { label: "Legal Holds", href: "/registrar/legal", icon: IconLock },
      { label: "Inheritance", href: "/registrar/inheritance", icon: IconUserCheck },
    ],
    BANK: [
      { label: "Single Verify", href: "/bank", icon: IconBuildingBank },
      { label: "Bulk Verify", href: "/bank/bulk", icon: IconDatabaseImport },
      { label: "Webhooks", href: "/bank/webhooks", icon: IconWebhook },
      { label: "Loan Tools", href: "/bank/loans", icon: IconReportMoney },
    ],
    ADMIN: [
      { label: "Analytics", href: "/admin", icon: IconTrendingUp },
      { label: "GIS Heatmap", href: "/admin/heatmap", icon: IconMap },
      { label: "API Keys", href: "/admin/api-keys", icon: IconKey },
      { label: "Settings", href: "/admin/settings", icon: IconSettings },
    ],
    BUILDER: [
      { label: "Overview", href: "/builder", icon: IconBuildingSkyscraper },
      { label: "Unit Registry", href: "/builder/units", icon: IconBuildingCommunity },
      { label: "Milestones", href: "/builder/milestones", icon: IconTimeline },
      { label: "NFT Certificates", href: "/builder/nft", icon: IconCertificate },
    ],
    AGRI: [
      { label: "Parcel Registry", href: "/agri", icon: IconPlant },
      { label: "Land Conversion", href: "/agri/conversion", icon: IconTransform },
      { label: "Land Pooling", href: "/agri/pooling", icon: IconPolygon },
      { label: "Carbon Mgmt", href: "/agri/carbon", icon: IconCloud },
    ],
  };

  const navItems = roleNavItems[user.role] || [];

  return (
    <aside
      className={`fixed inset-y-0 left-0 bg-white dark:bg-slate-950 border-r-[0.5px] border-slate-200 dark:border-slate-800 z-40 transition-all duration-300 flex flex-col justify-between ${
        collapsed ? "w-16" : "w-[220px]"
      }`}
    >
      <div className="flex flex-col flex-1">
        {/* Brand/Logo Area */}
        <div className="h-16 flex items-center px-4 border-b-[0.5px] border-slate-200 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <span className="p-1 rounded-element bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid shrink-0">
              <IconDatabase className="w-6 h-6 stroke-[1.8]" />
            </span>
            {!collapsed && (
              <span className="font-heading font-extrabold text-lg tracking-tight text-brand dark:text-brand-mid whitespace-nowrap">
                LandChain
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-element text-xs font-heading font-extrabold transition-all ${
                  isActive
                    ? "bg-brand-light text-brand dark:bg-brand-dark/30 dark:text-brand-mid"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="w-4.5 h-4.5 stroke-[1.8] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Area & Logout */}
      <div className="p-3 border-t-[0.5px] border-slate-200 dark:border-slate-800 space-y-3">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full bg-brand-light dark:bg-brand-dark/30 text-brand dark:text-brand-mid font-heading font-extrabold text-xs flex items-center justify-center border-[0.5px] border-brand-mid/10 shrink-0">
              <span className="uppercase">{user.name.substring(0, 2)}</span>
            </div>
            <div className="flex flex-col text-left truncate">
              <span className="font-heading font-extrabold text-[11px] text-slate-700 dark:text-slate-300 leading-none">
                {user.name}
              </span>
              <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400 mt-1">
                {user.role}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          title={collapsed ? "Logout" : undefined}
          className="w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-red hover:bg-red-light/20 dark:hover:bg-red/10 rounded-element transition-colors cursor-pointer text-xs font-heading font-extrabold border-[0.5px] border-slate-100 dark:border-slate-900"
        >
          <IconLogout className="w-4 h-4 stroke-[1.8]" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
