import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  cta?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, cta }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80 mb-6">
      <div className="space-y-1">
        <h1 className="font-heading font-extrabold text-2xl text-slate-800 dark:text-slate-100 tracking-tight">
          {title}
        </h1>
        <p className="text-slate-400 dark:text-slate-500 text-xs font-body max-w-2xl leading-normal">
          {subtitle}
        </p>
      </div>
      {cta && <div className="flex-shrink-0">{cta}</div>}
    </div>
  );
}
