import React from "react";
import { IconArrowUpRight, IconArrowDownRight } from "@tabler/icons-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  color?: string; // e.g., "brand", "accent", "gold", "purple", "red", "green"
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isUp: boolean;
  };
}

export default function MetricCard({ label, value, color = "brand", icon: Icon, trend }: MetricCardProps) {
  // Map color strings to tailwind classes
  const colorMap: Record<string, { text: string; bg: string }> = {
    brand: { text: "text-brand", bg: "bg-brand/10" },
    accent: { text: "text-accent", bg: "bg-accent/10" },
    gold: { text: "text-gold", bg: "bg-gold/10" },
    purple: { text: "text-purple", bg: "bg-purple/10" },
    red: { text: "text-red", bg: "bg-red/10" },
    green: { text: "text-green", bg: "bg-green/10" },
  };

  const colors = colorMap[color] || colorMap.brand;

  return (
    <div className="bg-gray-50 rounded-card p-4 flex flex-col justify-between min-h-[110px] text-center relative border-[0.5px] border-slate-100">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-heading font-extrabold tracking-wider text-slate-400 uppercase text-left">
          {label}
        </span>
        {Icon && (
          <span className={`p-1.5 rounded-element ${colors.bg} ${colors.text}`}>
            <Icon className="w-4 h-4 stroke-[1.8]" />
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-col items-center">
        <h4 className="font-heading font-extrabold text-2xl text-slate-800 dark:text-slate-200">
          {value}
        </h4>
        
        {trend && (
          <span className={`flex items-center gap-0.5 text-[10px] font-bold mt-1 font-body ${trend.isUp ? "text-green" : "text-red"}`}>
            {trend.isUp ? <IconArrowUpRight className="w-3 h-3" /> : <IconArrowDownRight className="w-3 h-3" />}
            {trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}
