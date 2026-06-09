"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconDatabaseImport,
  IconDownload,
  IconLoader2,
  IconCheck,
  IconAlertTriangle,
  IconFileSpreadsheet,
} from "@tabler/icons-react";
import Papa from "papaparse";

interface BulkRow {
  parcelId: string;
  loanAmount: number;
  applicantName: string;
}

interface VerifyResult {
  index: number;
  parcelId: string;
  ownerName: string;
  verified: boolean;
  encumbered: boolean;
  fraudScore: number;
  valuation: number;
}

export default function BankBulkVerifyPage() {
  const { user } = useAuth();
  const [csvData, setCsvData] = useState<BulkRow[]>([]);
  const [results, setResults] = useState<VerifyResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = res.data.map((row: any) => ({
          parcelId: (row.parcelId || row.ParcelID || "").trim().toUpperCase(),
          loanAmount: parseFloat(row.loanAmount || row.LoanAmount || "0"),
          applicantName: (row.applicantName || row.ApplicantName || "").trim(),
        })).filter(r => r.parcelId !== "");

        setCsvData(rows);
        setResults([]);
        toast.success(`Parsed ${rows.length} rows from CSV file.`);
      },
      error: () => {
        toast.error("Failed to parse CSV file structure.");
      },
    });
  };

  const handleStartVerification = async () => {
    if (csvData.length === 0) return;

    setProcessing(true);
    setProgress(0);
    setResults([]);

    const parcelIds = csvData.map((row) => row.parcelId);

    try {
      const res = await fetch("/api/verify/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parcelIds }),
      });

      if (!res.ok) {
        throw new Error("Bulk verify request rejected by node.");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let partialCell = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = (partialCell + chunk).split("\n\n");
        partialCell = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            try {
              const dataObj: VerifyResult = JSON.parse(dataStr);
              setResults((prev) => [...prev, dataObj]);
              setProgress((prev) => prev + 1);
            } catch (err) {
              console.warn("Parsing stream line error:", err);
            }
          }
        }
      }

      toast.success("Bulk verification stream process completed.");
    } catch (err) {
      toast.error("Verification connection aborted.");
    } finally {
      setProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,parcelId,loanAmount,applicantName\nPARCEL-4902-881,1500000,Rohan Sharma\nPARCEL-1002-880,800000,Vijay Kumar\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "landchain_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportResults = () => {
    if (results.length === 0) return;
    const csvRows = [["Parcel ID", "Owner Verified", "Lien Status", "Valuation", "Fraud Score"]];
    results.forEach((r) => {
      csvRows.push([
        r.parcelId,
        r.verified ? "YES" : "NO",
        r.encumbered ? "ENCUMBERED" : "CLEAR",
        r.valuation.toString(),
        r.fraudScore.toString(),
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "verification_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const flaggedCount = results.filter((r) => r.encumbered || r.fraudScore > 70).length;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <IconDatabaseImport className="w-6 h-6 text-brand" />
            Bulk Collateral verification
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-body">
            Upload CSV checklists containing parcel codes to query status reports in real-time.
          </p>
        </div>

        <button
          onClick={downloadTemplate}
          className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer flex items-center gap-1.5 transition-colors text-slate-650"
        >
          <IconDownload className="w-4 h-4" />
          Download CSV Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Zone & controls */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            CSV File Drop
          </h3>

          <div className="p-8 border border-dashed border-slate-300 rounded-element flex flex-col items-center justify-center gap-1.5 bg-slate-50 text-center text-xs">
            <input type="file" accept=".csv" id="bulk-csv" onChange={handleFileUpload} className="hidden" />
            <label htmlFor="bulk-csv" className="cursor-pointer text-brand hover:text-brand-mid font-bold font-heading uppercase tracking-wider text-[10px]">
              {csvData.length > 0 ? "Select another CSV file" : "Upload Verification CSV"}
            </label>
            {csvData.length > 0 && (
              <span className="text-[10px] text-slate-550 block font-semibold">{csvData.length} records parsed</span>
            )}
          </div>

          {csvData.length > 0 && (
            <button
              onClick={handleStartVerification}
              disabled={processing}
              className="w-full py-2.5 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {processing ? (
                <>
                  <IconLoader2 className="w-4 h-4 animate-spin" />
                  Verifying ({progress} / {csvData.length})
                </>
              ) : (
                "Start Bulk Verification"
              )}
            </button>
          )}

          {results.length > 0 && (
            <button
              onClick={exportResults}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white text-xs font-heading font-extrabold uppercase rounded-element flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <IconFileSpreadsheet className="w-4 h-4" />
              Download Results CSV
            </button>
          )}
        </div>

        {/* Results log and summary */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-6">
          {processing && (
            <div className="space-y-2 text-xs font-body">
              <div className="flex justify-between font-bold">
                <span>Verification progress:</span>
                <span>{Math.round((progress / csvData.length) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand transition-all duration-300"
                  style={{ width: `${(progress / csvData.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="grid grid-cols-3 gap-4 font-body text-xs text-center">
              <div className="p-3 bg-slate-50 rounded-element">
                <span className="text-slate-400 block text-[9px] uppercase font-heading font-bold">Total checked</span>
                <span className="font-extrabold text-slate-800 text-lg block mt-1">{results.length}</span>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-element">
                <span className="text-emerald-600 block text-[9px] uppercase font-heading font-bold">Passed</span>
                <span className="font-extrabold text-green text-lg block mt-1">{results.length - flaggedCount}</span>
              </div>
              <div className="p-3 bg-red-50/50 rounded-element">
                <span className="text-red block text-[9px] uppercase font-heading font-bold">Flagged</span>
                <span className="font-extrabold text-red text-lg block mt-1">{flaggedCount}</span>
              </div>
            </div>
          )}

          <div className="overflow-x-auto border-[0.5px] border-slate-200 dark:border-slate-800 rounded-element text-xs font-body">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">Parcel ID</th>
                  <th className="p-3">Owner Resolved</th>
                  <th className="p-3 text-center">Encumbrance</th>
                  <th className="p-3 text-center">Fraud Score</th>
                  <th className="p-3 text-right">Valuation</th>
                </tr>
              </thead>
              <tbody>
                {results.length > 0 ? (
                  results.map((r) => (
                    <tr key={r.index} className="border-b border-slate-150 dark:border-slate-800/80 hover:bg-slate-50/10">
                      <td className="p-3 font-mono font-bold text-brand">{r.parcelId}</td>
                      <td className="p-3 text-slate-650">{r.ownerName}</td>
                      <td className="p-3 text-center">
                        {r.encumbered ? (
                          <span className="text-red font-bold flex items-center justify-center gap-1">
                            <IconAlertTriangle className="w-3.5 h-3.5" />
                            Lien Found
                          </span>
                        ) : (
                          <span className="text-green font-bold flex items-center justify-center gap-1">
                            <IconCheck className="w-3.5 h-3.5" />
                            Clear
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center font-bold">{r.fraudScore}%</td>
                      <td className="p-3 text-right font-semibold">₹{r.valuation.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No verification logs active. Upload a CSV file above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
