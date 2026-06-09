import React from "react";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normStatus = (status || "").toUpperCase();

  // Mapping status to colors: ACTIVE=teal, DISPUTED=red, PENDING=amber, COMPLETED=green, FROZEN=blue, FLAGGED=red
  const statusStyles: Record<string, string> = {
    ACTIVE: "bg-teal-50 text-teal-700 border-teal-200/50 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/50",
    DISPUTED: "bg-red-light text-red border-red/20 dark:bg-red/10 dark:text-red dark:border-red/20",
    PENDING: "bg-gold-light text-gold border-gold/20 dark:bg-gold/10 dark:text-gold dark:border-gold/20",
    COMPLETED: "bg-green-light text-green border-green/20 dark:bg-green/10 dark:text-green dark:border-green/20",
    FROZEN: "bg-accent-light text-accent border-accent/20 dark:bg-accent/10 dark:text-accent dark:border-accent/20",
    FLAGGED: "bg-red-light text-red border-red/20 dark:bg-red/10 dark:text-red dark:border-red/20",
    LITIGATED: "bg-purple-light text-purple border-purple/20 dark:bg-purple/10 dark:text-purple dark:border-purple/20",
  };

  const currentStyle = statusStyles[normStatus] || "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-pill text-[10px] font-heading font-extrabold uppercase border-[0.5px] ${currentStyle}`}>
      {status}
    </span>
  );
}
