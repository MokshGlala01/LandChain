"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body text-slate-800 dark:text-slate-100">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/login" className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
            <IconArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
          <span className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
          <h1 className="text-md font-bold font-heading text-slate-800 dark:text-slate-100">LandChain Public API Gateway Documentation</h1>
        </div>
        <div className="text-xs text-slate-400">
          Sandbox Key: <code className="bg-slate-100 dark:bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-[10px] font-mono">key_mock_sbi_12345</code>
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-slate-900 mt-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <SwaggerUI url="/api/v1/openapi.json" />
      </div>
    </div>
  );
}
