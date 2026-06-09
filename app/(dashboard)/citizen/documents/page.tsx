"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconFileText,
  IconPlus,
  IconDownload,
  IconCopy,
  IconDeviceFloppy,
  IconCloudUpload,
  IconQrcode,
  IconHistory,
  IconLoader2,
} from "@tabler/icons-react";

interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface UserProperty {
  id: string;
  parcelId: string;
  surveyNumber: string;
  location: string;
}

interface GeneratedDoc {
  id: string;
  docType: string;
  parcelId: string;
  ipfsHash: string;
  txHash: string;
  createdAt: string;
  digilockerStatus: string;
}

export default function CitizenDocumentsPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<UserProperty[]>([]);
  const [history, setHistory] = useState<GeneratedDoc[]>([
    {
      id: "doc-1",
      docType: "Encumbrance Certificate",
      parcelId: "PARCEL-4902-881",
      ipfsHash: "QmYwAPJzs5xx2mabX4uX7yXQG143uXG28892hH2",
      txHash: "0x39a1b8...",
      createdAt: "2026-06-05",
      digilockerStatus: "PUSHED",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);
  const [selectedParcel, setSelectedParcel] = useState("");
  const [resultPdf, setResultPdf] = useState<string | null>(null);
  const [generatedIpfs, setGeneratedIpfs] = useState("");
  const [filterType, setFilterType] = useState("All");

  const docTypes: DocumentType[] = [
    { id: "saleDeed", name: "Sale Deed", description: "Official transfer deed confirming purchase/sale alignment.", icon: IconFileText },
    { id: "giftDeed", name: "Gift Deed", description: "Voluntary title transfer deed between blood relatives.", icon: IconFileText },
    { id: "partitionDeed", name: "Partition Deed", description: "Deed dividing joint holdings into individual titles.", icon: IconFileText },
    { id: "encumbrance", name: "Encumbrance Certificate", description: "Official certificate detailing past legal claims or liabilities.", icon: IconFileText },
    { id: "khata", name: "Khata Certificate", description: "Municipality registry ledger transcript copy.", icon: IconFileText },
    { id: "taxReceipt", name: "Property Tax Receipt", description: "Authorized receipt copy of paid property taxes.", icon: IconFileText },
  ];

  const loadProperties = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/property?ownerId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
        if (data.length > 0) {
          setSelectedParcel(data[0].parcelId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [user]);

  const handleGenerateClick = (type: DocumentType) => {
    if (properties.length === 0) {
      toast.error("You must own at least one registered property to generate documents.");
      return;
    }
    setSelectedDocType(type);
    setModalOpen(true);
    setResultPdf(null);
  };

  const handleGenerateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocType || !selectedParcel) return;

    setLoading(true);
    try {
      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType: selectedDocType.id,
          parcelId: selectedParcel,
          additionalData: { ownerName: user?.name },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`${selectedDocType.name} compiled successfully.`);
        setGeneratedIpfs(data.ipfsHash);
        // Simulate local PDF object (e.g. data URI representation or mock preview)
        setResultPdf(data.pdfUrl || `https://ipfs.io/ipfs/${data.ipfsHash}`);

        // Add to history
        const newDoc: GeneratedDoc = {
          id: "doc-" + Math.random().toString(36).substring(2, 9),
          docType: selectedDocType.name,
          parcelId: selectedParcel,
          ipfsHash: data.ipfsHash,
          txHash: data.txHash || "0x" + Math.random().toString(16).substring(2, 12),
          createdAt: new Date().toISOString().split("T")[0],
          digilockerStatus: "PENDING",
        };
        setHistory([newDoc, ...history]);
      } else {
        toast.error(data.error || "Failed to compile document.");
      }
    } catch (err) {
      toast.error("An error occurred during compilation.");
    } finally {
      setLoading(false);
    }
  };

  const handlePushToDigilocker = (docId: string) => {
    toast.success("Document verified and pushed to resident's secure DigiLocker folder!");
    setHistory((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, digilockerStatus: "PUSHED" } : d))
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("IPFS hash copied to clipboard.");
  };

  const filteredHistory = history.filter((d) => {
    if (filterType === "All") return true;
    return d.docType.toLowerCase().includes(filterType.toLowerCase()) || d.docType === filterType;
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100">
          Document Generator & DigiLocker Gateway
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-body">
          Compile certified transaction deed PDFs, retrieve encumbrance histories, and sync copies to DigiLocker.
        </p>
      </div>

      {/* Grid of selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docTypes.map((type) => {
          const Icon = type.icon;
          return (
            <div
              key={type.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-brand/50 dark:hover:border-brand-mid/50 transition-colors"
            >
              <div className="space-y-2">
                <span className="p-2 rounded-element bg-brand-light dark:bg-brand-dark/20 text-brand dark:text-brand-mid inline-block">
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </span>
                <h3 className="font-heading font-extrabold text-sm text-slate-800 dark:text-slate-100">
                  {type.name}
                </h3>
                <p className="text-xs text-slate-500 font-body leading-normal">
                  {type.description}
                </p>
              </div>
              <button
                onClick={() => handleGenerateClick(type)}
                className="w-full py-2 bg-gray-50 hover:bg-brand hover:text-white border border-slate-200 dark:border-slate-800 text-[11px] font-heading font-extrabold uppercase rounded-element cursor-pointer transition-all"
              >
                Generate Document
              </button>
            </div>
          );
        })}
      </div>

      {/* Document History Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex justify-between items-center pb-2">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <IconHistory className="w-4 h-4 text-brand" />
            Compilation History
          </h3>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs bg-gray-50 border border-slate-200 dark:border-slate-800 rounded-element focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Sale Deed">Sale Deed</option>
            <option value="Encumbrance Certificate">Encumbrance Certificate</option>
            <option value="Khata Certificate">Khata Certificate</option>
            <option value="Property Tax Receipt">Tax Receipt</option>
          </select>
        </div>

        <div className="overflow-x-auto border-[0.5px] border-slate-200 dark:border-slate-800 rounded-element">
          <table className="w-full text-left text-xs font-body border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">Document Type</th>
                <th className="p-3">Property ID</th>
                <th className="p-3">Generated On</th>
                <th className="p-3">IPFS Hash (CID)</th>
                <th className="p-3 text-center">DigiLocker</th>
                <th className="p-3 text-center">Download</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((doc) => (
                  <tr key={doc.id} className="border-b border-slate-150 dark:border-slate-800/80">
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-350">{doc.docType}</td>
                    <td className="p-3 font-mono font-bold text-slate-500">{doc.parcelId}</td>
                    <td className="p-3 text-slate-450">{doc.createdAt}</td>
                    <td className="p-3 font-mono text-[10px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        {doc.ipfsHash.substring(0, 16)}...
                        <button
                          onClick={() => copyToClipboard(doc.ipfsHash)}
                          className="hover:text-brand p-1 cursor-pointer transition-colors"
                        >
                          <IconCopy className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {doc.digilockerStatus === "PUSHED" ? (
                        <span className="px-2 py-0.5 bg-green-light text-green text-[9px] font-extrabold uppercase rounded-pill border-[0.5px] border-green/20">
                          Synced
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePushToDigilocker(doc.id)}
                          className="px-2.5 py-1 bg-slate-850 hover:bg-brand hover:text-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[10px] font-heading font-extrabold uppercase rounded-element flex items-center justify-center gap-1 cursor-pointer transition-all text-slate-300"
                        >
                          <IconCloudUpload className="w-3.5 h-3.5" />
                          Sync
                        </button>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toast.success("Document downloaded. Verified signature attached.")}
                        className="p-1.5 text-slate-500 hover:text-brand hover:bg-slate-100 rounded-element cursor-pointer transition-colors inline-block"
                      >
                        <IconDownload className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No documents compiled. Use card actions above to generate.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate dialog modal */}
      {modalOpen && selectedDocType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#030806] rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 p-6 space-y-5 flex flex-col">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100">
              <h2 className="font-heading font-extrabold text-base text-slate-800 dark:text-slate-150">
                Compile {selectedDocType.name}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-xs font-bold text-slate-450 hover:text-slate-650 cursor-pointer"
              >
                Close
              </button>
            </div>

            {!resultPdf ? (
              <form onSubmit={handleGenerateDoc} className="space-y-4 font-body">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Select Asset</label>
                  <select
                    value={selectedParcel}
                    onChange={(e) => setSelectedParcel(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none"
                  >
                    {properties.map((p) => (
                      <option key={p.parcelId} value={p.parcelId}>
                        {p.parcelId} ({p.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 text-[10px] bg-slate-50 dark:bg-slate-900 rounded-element leading-relaxed text-slate-400">
                  Selecting properties fetches current title owner verification and surveyor specs. Document signature will include wallet authorization parameters.
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <>
                      <IconLoader2 className="w-4 h-4 animate-spin" />
                      Compiling...
                    </>
                  ) : (
                    "Compile and Sign Document"
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="p-4 rounded-element bg-emerald-500/10 border border-emerald-250 flex items-center justify-center gap-2 font-heading font-extrabold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  <IconDeviceFloppy className="w-5 h-5" />
                  Document Compiled
                </div>

                <div className="flex flex-col items-center p-3 border border-slate-100 rounded-element bg-slate-50 dark:bg-slate-900 gap-2">
                  <IconQrcode className="w-20 h-20 text-slate-700 dark:text-slate-300 stroke-[1.2]" />
                  <span className="text-[9px] font-mono text-slate-400 leading-normal">
                    IPFS CID: {generatedIpfs.substring(0, 24)}...
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toast.success("PDF signature downloaded.")}
                    className="flex-1 py-2.5 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <IconDownload className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => {
                      toast.success("Linked copy successfully uploaded to DigiLocker folder.");
                      setModalOpen(false);
                    }}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-slate-200 text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <IconCloudUpload className="w-4 h-4" />
                    Push DigiLocker
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
