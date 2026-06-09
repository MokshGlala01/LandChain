"use client";

import React, { useState } from "react";
import Link from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import {
  IconSmartHome,
  IconActivity,
  IconUserCheck,
  IconScale,
  IconShield,
  IconCoins,
  IconFileSpreadsheet,
  IconFilter,
} from "@tabler/icons-react";
import { toast } from "sonner";

import MetricCard from "@/components/dashboard/MetricCard";
import PageHeader from "@/components/dashboard/PageHeader";

export default function AdminAnalyticsPage() {
  const [filterState, setFilterState] = useState("All");

  const mockMetrics = [
    { label: "Total Properties", value: "48,209", change: 12, isUp: true, icon: IconSmartHome, color: "brand" },
    { label: "Transfers Today", value: "142", change: 8, isUp: true, icon: IconActivity, color: "accent" },
    { label: "Pending Approvals", value: "27", change: 4, isUp: false, icon: IconUserCheck, color: "gold" },
    { label: "Active Disputes", value: "8 Cases", change: 0, isUp: true, icon: IconScale, color: "red" },
    { label: "Fraud Flags (>75)", value: "3", change: 25, isUp: false, icon: IconShield, color: "red" },
    { label: "Stamp Duty MTD", value: "₹4.82 Cr", change: 18, isUp: true, icon: IconCoins, color: "green" },
  ];

  const transferVolumeData = [
    { month: "Jan", transfers: 1200 },
    { month: "Feb", transfers: 1400 },
    { month: "Mar", transfers: 1800 },
    { month: "Apr", transfers: 2100 },
    { month: "May", transfers: 2400 },
    { month: "Jun", transfers: 2800 },
  ];

  const propertyTypeData = [
    { name: "Residential", value: 24000 },
    { name: "Commercial", value: 12000 },
    { name: "Agricultural", value: 8500 },
    { name: "Industrial", value: 3709 },
  ];

  const COLORS = ["#0F6E56", "#185FA5", "#BA7517", "#534AB7"];

  const processingTimeData = [
    { month: "Jan", hours: 14 },
    { month: "Feb", hours: 12 },
    { month: "Mar", hours: 11 },
    { month: "Apr", hours: 9 },
    { month: "May", hours: 7 },
    { month: "Jun", hours: 5 },
  ];

  const districtsData = [
    { name: "Noida", count: 480 },
    { name: "Ghaziabad", count: 320 },
    { name: "Lucknow", count: 290 },
    { name: "Gurugram", count: 210 },
    { name: "Pune", count: 180 },
  ];

  const fraudTimelineData = [
    { month: "Jan", cases: 20 },
    { month: "Feb", cases: 35 },
    { month: "Mar", cases: 55 },
    { month: "Apr", cases: 80 },
    { month: "May", cases: 65 },
    { month: "Jun", cases: 40 },
  ];

  const revenueData = [
    { month: "Jan", revenue: 1.2 },
    { month: "Feb", revenue: 2.1 },
    { month: "Mar", revenue: 3.0 },
    { month: "Apr", revenue: 3.8 },
    { month: "May", revenue: 4.5 },
    { month: "Jun", revenue: 4.8 },
  ];

  const handleExportCsv = (title: string) => {
    toast.success(`Exported ${title} analytics dataset as CSV.`);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100">
            Noida Revenue Division Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-body">
            Real-time mutation telemetry, stamp duty collections, and algorithmic fraud warnings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs bg-white dark:bg-slate-900 px-3 py-2 rounded-element border border-slate-200 dark:border-slate-800">
            <IconFilter className="w-4 h-4 text-slate-450" />
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="bg-transparent focus:outline-none font-bold text-slate-600 dark:text-slate-350"
            >
              <option>All States</option>
              <option>Uttar Pradesh</option>
              <option>Delhi</option>
              <option>Haryana</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {mockMetrics.map((m, i) => (
          <MetricCard
            key={i}
            label={m.label}
            value={m.value}
            color={m.color}
            icon={m.icon}
            trend={{ value: m.change, isUp: m.isUp }}
          />
        ))}
      </div>

      {/* Charts Grid (2x3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-body text-xs">
        {/* Chart 1: Transfer Volume */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-extrabold text-xs text-slate-500 uppercase tracking-wider">Transfer Volumes</h3>
            <button onClick={() => handleExportCsv("Transfer Volumes")} className="text-slate-450 hover:text-slate-650 p-1">
              <IconFileSpreadsheet className="w-4 h-4" />
            </button>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transferVolumeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} style={{ fontSize: 9 }} stroke="#94a3b8" />
                <YAxis tickLine={false} style={{ fontSize: 9 }} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="transfers" stroke="#0F6E56" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Property types breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-extrabold text-xs text-slate-500 uppercase tracking-wider">Property Categories</h3>
            <button onClick={() => handleExportCsv("Property Categories")} className="text-slate-450 hover:text-slate-650 p-1">
              <IconFileSpreadsheet className="w-4 h-4" />
            </button>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={propertyTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                  {propertyTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={6} wrapperStyle={{ fontSize: 9 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Processing Duration */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-extrabold text-xs text-slate-500 uppercase tracking-wider">Avg Processing Time</h3>
            <button onClick={() => handleExportCsv("Processing Times")} className="text-slate-450 hover:text-slate-650 p-1">
              <IconFileSpreadsheet className="w-4 h-4" />
            </button>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processingTimeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} style={{ fontSize: 9 }} stroke="#94a3b8" />
                <YAxis tickLine={false} style={{ fontSize: 9 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="hours" fill="#185FA5" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Top active districts */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-extrabold text-xs text-slate-500 uppercase tracking-wider">Top 5 Districts</h3>
            <button onClick={() => handleExportCsv("Top Districts")} className="text-slate-450 hover:text-slate-650 p-1">
              <IconFileSpreadsheet className="w-4 h-4" />
            </button>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tickLine={false} style={{ fontSize: 9 }} stroke="#94a3b8" />
                <YAxis type="category" dataKey="name" tickLine={false} style={{ fontSize: 9 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" fill="#BA7517" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Fraud Timeline */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-extrabold text-xs text-slate-500 uppercase tracking-wider">Fraud cases timeline</h3>
            <button onClick={() => handleExportCsv("Fraud Timeline")} className="text-slate-450 hover:text-slate-650 p-1">
              <IconFileSpreadsheet className="w-4 h-4" />
            </button>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fraudTimelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} style={{ fontSize: 9 }} stroke="#94a3b8" />
                <YAxis tickLine={false} style={{ fontSize: 9 }} stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="cases" stroke="#A32D2D" fill="rgba(163, 45, 45, 0.05)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Stamp Duty Revenue */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-extrabold text-xs text-slate-500 uppercase tracking-wider">Stamp Duty Revenue (₹ Cr)</h3>
            <button onClick={() => handleExportCsv("Revenue")} className="text-slate-450 hover:text-slate-650 p-1">
              <IconFileSpreadsheet className="w-4 h-4" />
            </button>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} style={{ fontSize: 9 }} stroke="#94a3b8" />
                <YAxis tickLine={false} style={{ fontSize: 9 }} stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#3B6D11" fill="rgba(59, 109, 17, 0.05)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
