"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconCertificate,
  IconLink,
  IconTrash,
  IconSearch,
  IconEye,
  IconChartBar,
} from "@tabler/icons-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface NftCert {
  id: string;
  tokenId: string;
  flatNum: string;
  projectName: string;
  ownerWallet: string;
  mintedOn: string;
  ipfsMeta: string;
}

export default function BuilderNftPage() {
  const { user } = useAuth();
  const [nfts, setNfts] = useState<NftCert[]>([
    {
      id: "nft-1",
      tokenId: "298102",
      flatNum: "Flat-101",
      projectName: "LandChain Heights Phase 1",
      ownerWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      mintedOn: "2026-06-02",
      ipfsMeta: '{"name":"Apartment Unit Title Certificate","description":"Official digital ownership certificate representing Flat 101, Noida Sector 150","image":"ipfs://Qm...","attributes":[{"trait_type":"Area","value":"1200 Sq Ft"}]}',
    },
  ]);

  const [activeNft, setActiveNft] = useState<NftCert | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mintData = [
    { name: "Jan", count: 2 },
    { name: "Feb", count: 4 },
    { name: "Mar", count: 3 },
    { name: "Apr", count: 8 },
    { name: "May", count: 12 },
    { name: "Jun", count: 15 },
  ];

  const handleRevoke = (id: string, tokenId: string) => {
    setNfts((prev) => prev.filter((n) => n.id !== id));
    toast.error(`ERC-721 Token #${tokenId} burned and ownership registry status reset.`);
  };

  const handleInspect = (nft: NftCert) => {
    setActiveNft(nft);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <IconCertificate className="w-6 h-6 text-brand" />
          ERC-721 PropertyNFT Certificates
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-body">
          Manage blockchain-minted flat title tokens, audit IPFS metadata mappings, and track minting counts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-body text-xs">
        {/* NFTs Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            Tokenized ownership certificates
          </h3>

          <div className="overflow-x-auto border-[0.5px] border-slate-200 dark:border-slate-800 rounded-element">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">Token ID</th>
                  <th className="p-3">Flat Number</th>
                  <th className="p-3">Development</th>
                  <th className="p-3">Owner Wallet</th>
                  <th className="p-3">Minted On</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {nfts.map((n) => (
                  <tr key={n.id} className="border-b border-slate-150 dark:border-slate-800/80 hover:bg-slate-50/10">
                    <td className="p-3 font-mono font-bold text-brand">#{n.tokenId}</td>
                    <td className="p-3 font-semibold text-slate-700">{n.flatNum}</td>
                    <td className="p-3 text-slate-550">{n.projectName}</td>
                    <td className="p-3 font-mono text-slate-450">{n.ownerWallet.substring(0, 10)}...</td>
                    <td className="p-3 text-slate-400">{n.mintedOn}</td>
                    <td className="p-3 flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleInspect(n)}
                        className="p-1.5 bg-gray-50 border border-slate-200 rounded-element hover:bg-slate-100 cursor-pointer text-slate-500"
                        title="Inspect Metadata"
                      >
                        <IconEye className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href="https://polygonscan.com"
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-gray-50 border border-slate-200 rounded-element hover:bg-slate-100 text-slate-500"
                        title="View Explorer Link"
                      >
                        <IconLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleRevoke(n.id, n.tokenId)}
                        className="p-1.5 bg-red-light text-red rounded-element hover:bg-red hover:text-white cursor-pointer transition-colors"
                        title="Burn Token"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mint History chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <IconChartBar className="w-4 h-4 text-brand" />
            Monthly Mint Telemetry
          </h3>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mintData} margin={{ left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tickLine={false} style={{ fontSize: 9 }} stroke="#94a3b8" />
                <YAxis tickLine={false} style={{ fontSize: 9 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" fill="#0F6E56" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Metadata Inspector Drawer */}
      {drawerOpen && activeNft && (
        <div className="fixed inset-y-0 right-0 w-[340px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 z-50 shadow-2xl p-6 flex flex-col justify-between font-body text-xs leading-normal">
          <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-heading font-extrabold text-sm text-slate-700 dark:text-slate-150 uppercase tracking-wider">
                NFT Metadata Schema
              </h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 flex-grow overflow-y-auto pr-1">
              <div>
                <span className="text-[10px] text-slate-400 block font-heading uppercase font-bold">Token ID</span>
                <span className="font-mono font-bold text-brand">#{activeNft.tokenId}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-heading uppercase font-bold">Owner Contract Wallet</span>
                <span className="font-mono text-slate-650 select-all block break-all bg-slate-50 p-2 border border-slate-100 rounded-element">
                  {activeNft.ownerWallet}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block font-heading uppercase font-bold">IPFS Metadata File JSON</span>
                <pre className="p-3 bg-slate-950 text-slate-350 rounded font-mono text-[9px] overflow-x-auto leading-relaxed">
                  {JSON.stringify(JSON.parse(activeNft.ipfsMeta), null, 2)}
                </pre>
              </div>
            </div>
          </div>

          <button
            onClick={() => setDrawerOpen(false)}
            className="w-full py-2 bg-slate-900 hover:bg-slate-950 text-slate-200 text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer text-center mt-4"
          >
            Done Inspecting
          </button>
        </div>
      )}
    </div>
  );
}
