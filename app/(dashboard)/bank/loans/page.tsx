"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconReportMoney,
  IconCoins,
  IconScale,
  IconAlertTriangle,
  IconDownload,
  IconFileText,
} from "@tabler/icons-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface MortgagedProperty {
  id: string;
  parcelId: string;
  ownerName: string;
  loanAmount: number;
  ltv: number;
  propertyValue: number;
  registeredDate: string;
  emiStatus: "REGULAR" | "OVERDUE" | "DEFAULT";
}

export default function BankLoansPage() {
  const { user } = useAuth();
  
  // Mortgaged Portfolio
  const [portfolio, setPortfolio] = useState<MortgagedProperty[]>([
    {
      id: "mp-1",
      parcelId: "PARCEL-4902-881",
      ownerName: "Rohan Sharma",
      loanAmount: 2200000,
      ltv: 68,
      propertyValue: 3200000,
      registeredDate: "2026-05-18",
      emiStatus: "REGULAR",
    },
    {
      id: "mp-2",
      parcelId: "PARCEL-1002-880",
      ownerName: "Rohan Kalia",
      loanAmount: 1800000,
      ltv: 78,
      propertyValue: 2300000,
      registeredDate: "2026-05-25",
      emiStatus: "OVERDUE",
    },
  ]);

  // Sliders for calculator
  const [propertyValue, setPropertyValue] = useState(2500000);
  const [loanVal, setLoanVal] = useState(1500000);
  const [stateName, setStateName] = useState("Uttar Pradesh");

  // Calculations
  const calculatedLtv = Math.round((loanVal / propertyValue) * 100);
  const maxLoan = propertyValue * 0.8;

  // Mortgage stamp duty (UP standard is 0.5% of loan amount, Delhi 0.25%, Haryana 0.25%)
  const getStampDutyPercent = () => {
    if (stateName === "Uttar Pradesh") return 0.5;
    if (stateName === "Delhi") return 0.25;
    return 0.25;
  };

  const stampDutyRate = getStampDutyPercent();
  const mortgageStampDuty = Math.round(loanVal * (stampDutyRate / 100));

  // Risk data for PieChart
  const riskData = [
    { name: "Low Risk (<60% LTV)", value: 1, color: "#3B6D11" },
    { name: "Medium Risk (60-75% LTV)", value: 1, color: "#BA7517" },
    { name: "High Risk (>75% LTV)", value: 1, color: "#A32D2D" },
  ];

  const handleRequestEC = (parcelId: string) => {
    toast.success(`Encumbrance Certificate requested for mortgaged property ${parcelId}.`);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <IconReportMoney className="w-6 h-6 text-brand" />
          Lending Assessment & Mortgages
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-body">
          Calculate loan eligibility ratios, estimate registration fee duties, and manage active mortgage collateral.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-body text-xs">
        {/* LTV & Duty Calculator */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            Loan-to-Value Estimator
          </h3>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span>Property Value:</span>
                <span className="text-brand">₹{propertyValue.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={1000000}
                max={5000000}
                step={50000}
                value={propertyValue}
                onChange={(e) => setPropertyValue(parseInt(e.target.value))}
                className="w-full accent-brand cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span>Loan Value:</span>
                <span className="text-brand">₹{loanVal.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={500000}
                max={4000000}
                step={50000}
                value={loanVal}
                onChange={(e) => setLoanVal(parseInt(e.target.value))}
                className="w-full accent-brand cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Property State</label>
              <select
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-slate-200 rounded-element"
              >
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Delhi">Delhi</option>
                <option value="Haryana">Haryana</option>
              </select>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-element space-y-2">
              <div className="flex justify-between">
                <span>Estimated LTV:</span>
                <span className={`font-bold ${calculatedLtv > 80 ? "text-red" : "text-green"}`}>{calculatedLtv}%</span>
              </div>
              <div className="flex justify-between">
                <span>Max Loan (80%):</span>
                <span>₹{maxLoan.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Mortgage Stamp Duty:</span>
                <span>₹{mortgageStampDuty.toLocaleString()} ({stampDutyRate}%)</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm">
                <span>Eligibility Status:</span>
                <span className={calculatedLtv <= 80 ? "text-green" : "text-red"}>
                  {calculatedLtv <= 80 ? "APPROVED" : "EXCEEDS LIMITS"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk summary chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4 text-center">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider text-left">
            Collateral Risk Profile
          </h3>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-[10px] text-slate-500 font-bold">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-green rounded-full"></span>Low LTV</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-gold rounded-full"></span>Mid LTV</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red rounded-full"></span>High LTV</span>
          </div>
        </div>
      </div>

      {/* Mortgaged Portfolio table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4 font-body text-xs">
        <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
          Mortgaged Assets Portfolio
        </h3>

        <div className="overflow-x-auto border-[0.5px] border-slate-200 dark:border-slate-800 rounded-element">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">Property ID</th>
                <th className="p-3">Mortgagor</th>
                <th className="p-3 text-right">Loan Amount</th>
                <th className="p-3 text-center">LTV Ratio</th>
                <th className="p-3 text-right">Collateral Value</th>
                <th className="p-3">Registered Date</th>
                <th className="p-3 text-center">EMI Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((mp) => (
                <tr
                  key={mp.id}
                  className={`border-b border-slate-150 dark:border-slate-800/80 hover:bg-slate-50/10 ${
                    mp.ltv > 75 ? "bg-red-50/10" : ""
                  }`}
                >
                  <td className="p-3 font-mono font-bold text-brand">{mp.parcelId}</td>
                  <td className="p-3 font-semibold text-slate-700">{mp.ownerName}</td>
                  <td className="p-3 text-right font-semibold">₹{mp.loanAmount.toLocaleString()}</td>
                  <td className="p-3 text-center font-bold">
                    <span className={mp.ltv > 75 ? "text-red font-extrabold" : "text-slate-850"}>
                      {mp.ltv}%
                    </span>
                  </td>
                  <td className="p-3 text-right font-semibold">₹{mp.propertyValue.toLocaleString()}</td>
                  <td className="p-3 text-slate-450">{mp.registeredDate}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-pill text-[9px] font-extrabold uppercase ${
                      mp.emiStatus === "REGULAR"
                        ? "bg-green-light text-green"
                        : mp.emiStatus === "OVERDUE"
                        ? "bg-gold-light text-gold"
                        : "bg-red-light text-red"
                    }`}>
                      {mp.emiStatus}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleRequestEC(mp.parcelId)}
                      className="px-2 py-1 bg-gray-50 border border-slate-200 text-[10px] font-heading font-extrabold uppercase rounded-element hover:bg-slate-100 cursor-pointer"
                    >
                      Verify EC
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
