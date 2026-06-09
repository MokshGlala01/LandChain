"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconBuildingSkyscraper,
  IconPlus,
  IconCheck,
  IconBuildingCommunity,
  IconUpload,
} from "@tabler/icons-react";

import MetricCard from "@/components/dashboard/MetricCard";
import PageHeader from "@/components/dashboard/PageHeader";

interface Project {
  id: string;
  name: string;
  reraNumber: string;
  address: string;
  totalUnits: number;
}

export default function BuilderOverviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [rera, setRera] = useState("");
  const [address, setAddress] = useState("");
  const [units, setUnits] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/builder/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  // Seed mock projects if empty
  useEffect(() => {
    if (!loading && projects.length === 0) {
      const mockSeeds: Project[] = [
        {
          id: "proj-1",
          name: "LandChain Heights Phase 1",
          reraNumber: "UPRERAPRJ889212",
          address: "Sector 150, Noida, UP",
          totalUnits: 40,
        },
      ];
      setProjects(mockSeeds);
    }
  }, [loading, projects]);

  const handleRegisterProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rera || !address || !units) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/builder/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, reraNumber: rera, address, totalUnits: units }),
      });

      if (res.ok) {
        toast.success("RERA Project registered successfully. Flats created.");
        setModalOpen(false);
        setName("");
        setRera("");
        setAddress("");
        setUnits("");
        fetchProjects();
      } else {
        toast.error("Failed to register project.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Builder Project Center"
        subtitle="Register developer projects, verify RERA compliance indexes, and monitor unit-level tokenization."
        cta={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element transition-colors cursor-pointer"
          >
            <IconPlus className="w-4 h-4" />
            Register Project
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Active Projects" value={projects.length} color="brand" icon={IconBuildingSkyscraper} />
        <MetricCard label="Units Sold" value="12 Flats" color="green" icon={IconCheck} />
        <MetricCard label="Units Available" value="28 Flats" color="accent" icon={IconBuildingCommunity} />
        <MetricCard label="NFT Certificates Minted" value="12 NFTs" color="purple" icon={IconBuildingCommunity} />
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
          Housing Societies ({projects.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading developments...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-body text-xs">
            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-brand/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-heading font-extrabold text-base text-slate-800 dark:text-slate-150">
                      {p.name}
                    </h4>
                    <span className="px-2 py-0.5 bg-green-light text-green text-[9px] font-extrabold uppercase rounded-pill border border-green/20 flex items-center gap-0.5">
                      <IconCheck className="w-3 h-3" />
                      RERA Verified
                    </span>
                  </div>

                  <p className="text-slate-500 leading-normal">{p.address}</p>
                  <p className="font-mono text-slate-400 text-[10px]">RERA ID: {p.reraNumber}</p>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span>Units Sold Progress:</span>
                      <span>30%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand" style={{ width: "30%" }}></div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-850 pt-3 flex gap-2">
                  <button
                    onClick={() => router.push(`/builder/units?projectId=${p.id}`)}
                    className="flex-1 py-2 bg-gray-50 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 text-[10px] font-heading font-extrabold uppercase rounded-element cursor-pointer text-center"
                  >
                    View Units
                  </button>
                  <button
                    onClick={() => router.push(`/builder/milestones?projectId=${p.id}`)}
                    className="flex-1 py-2 bg-gray-50 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 text-[10px] font-heading font-extrabold uppercase rounded-element cursor-pointer text-center"
                  >
                    View Milestones
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Project Modal dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#030806] rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 p-6 space-y-4 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-heading font-extrabold text-sm text-slate-700">Register RERA Project</h3>
              <button onClick={() => setModalOpen(false)} className="text-xs text-slate-450 hover:text-slate-650 font-bold">×</button>
            </div>

            <form onSubmit={handleRegisterProject} className="space-y-4 font-body text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. LandChain Towers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">RERA Registration ID</label>
                <input
                  type="text"
                  placeholder="e.g. UPRERAPRJ1234"
                  value={rera}
                  onChange={(e) => setRera(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Address Location</label>
                <input
                  type="text"
                  placeholder="Location coordinates..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Total Apartment Units</label>
                <input
                  type="number"
                  placeholder="e.g. 40"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand font-mono"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-heading font-extrabold rounded-element cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-grow py-2.5 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer flex items-center justify-center gap-1"
                >
                  {submitting && <IconLoader2 className="w-4 h-4 animate-spin" />}
                  Register Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple loader helper
function IconLoader2({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
