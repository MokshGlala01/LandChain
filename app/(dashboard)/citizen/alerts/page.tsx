"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconBell,
  IconPlus,
  IconTrash,
  IconToggleLeft,
  IconToggleRight,
  IconDeviceMobile,
  IconMail,
  IconBrandWhatsapp,
  IconMessage,
  IconCheck,
} from "@tabler/icons-react";

interface WatchlistItem {
  id: string;
  parcelId: string;
  alertTypes: string; // comma separated
  active: boolean;
}

interface AlertHistoryItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  read: boolean;
  parcelId: string;
}

export default function CitizenAlertsPage() {
  const { user } = useAuth();
  const [searchParcel, setSearchParcel] = useState("");
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<AlertHistoryItem[]>([
    {
      id: "al-1",
      type: "DISPUTE",
      message: "Dispute filed for watched property PARCEL-4902-881. Status set to DISPUTED.",
      timestamp: "10 minutes ago",
      read: false,
      parcelId: "PARCEL-4902-881",
    },
    {
      id: "al-2",
      type: "VALUATION",
      message: "Valuation change >10% reported for PARCEL-4902-881. New fair market value: ₹3,150,000.",
      timestamp: "2 hours ago",
      read: false,
      parcelId: "PARCEL-4902-881",
    },
    {
      id: "al-3",
      type: "OWNERSHIP",
      message: "Ownership mutation transfer completed successfully for PARCEL-1082.",
      timestamp: "Yesterday",
      read: true,
      parcelId: "PARCEL-1082",
    },
  ]);

  // Channels state
  const [channels, setChannels] = useState({
    sms: true,
    email: true,
    whatsapp: false,
    push: true,
  });

  const fetchWatchlist = async () => {
    try {
      const res = await fetch("/api/watchlist");
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data);
      }
    } catch (err) {
      console.error("Watchlist fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleAddWatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchParcel.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parcelId: searchParcel.trim().toUpperCase(),
          alertTypes: "transfer,dispute,encumbrance,valuation",
        }),
      });

      if (res.ok) {
        toast.success(`Parcel ${searchParcel.toUpperCase()} added to watchlist.`);
        setSearchParcel("");
        fetchWatchlist();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add to watchlist");
      }
    } catch (err) {
      toast.error("Failed to connect to watchlist API");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/watchlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentStatus }),
      });
      if (res.ok) {
        toast.success("Watchlist alert updated successfully.");
        fetchWatchlist();
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleRemoveWatch = async (id: string) => {
    try {
      const res = await fetch(`/api/watchlist?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Property removed from watchlist.");
        fetchWatchlist();
      }
    } catch (err) {
      toast.error("Failed to remove watchlist item.");
    }
  };

  const handleMarkAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    toast.success("All alerts marked as read.");
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100">
          Alerts & Watchlist Console
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-body">
          Monitor property parcels, configure dispatch channels, and check notifications history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watchlist management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              Property Watchlist
            </h3>

            <form onSubmit={handleAddWatch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search and add Parcel ID (e.g. PARCEL-4902-881)..."
                value={searchParcel}
                onChange={(e) => setSearchParcel(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs bg-gray-50 border border-slate-200 dark:border-slate-800 rounded-element focus:outline-none focus:border-brand font-mono"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold rounded-element flex items-center gap-1 cursor-pointer transition-colors"
              >
                <IconPlus className="w-4 h-4" />
                Add to Watchlist
              </button>
            </form>

            <div className="overflow-x-auto border-[0.5px] border-slate-200 dark:border-slate-800 rounded-element">
              <table className="w-full text-left text-xs font-body border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">Parcel ID</th>
                    <th className="p-3">Alert Types</th>
                    <th className="p-3 text-center">Active</th>
                    <th className="p-3 text-center">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist.length > 0 ? (
                    watchlist.map((item) => (
                      <tr key={item.id} className="border-b border-slate-150 dark:border-slate-800/80">
                        <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-350">
                          {item.parcelId}
                        </td>
                        <td className="p-3 text-slate-500">
                          <span className="flex flex-wrap gap-1">
                            {item.alertTypes.split(",").map((type) => (
                              <span key={type} className="px-1.5 py-0.5 bg-gray-150/40 dark:bg-slate-800 text-[9px] rounded-element uppercase font-bold text-slate-400">
                                {type}
                              </span>
                            ))}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleToggleActive(item.id, item.active)}
                            className="cursor-pointer text-slate-500 hover:text-brand transition-colors inline-block"
                          >
                            {item.active ? (
                              <IconToggleRight className="w-5 h-5 text-brand" />
                            ) : (
                              <IconToggleLeft className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleRemoveWatch(item.id)}
                            className="text-red hover:bg-red-light/40 p-1.5 rounded-element cursor-pointer transition-colors"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-400">
                        No property parcels in your watchlist. Add one above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Notification channels */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              Dispatch Channels
            </h3>

            <div className="space-y-3 font-body">
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-850">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-brand-light text-brand rounded-element">
                    <IconMessage className="w-4 h-4 stroke-[1.8]" />
                  </span>
                  <div>
                    <span className="text-xs font-bold block">SMS (Twilio)</span>
                    <span className="text-[9px] text-slate-400">{channels.sms ? "Connected" : "Disabled"}</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={channels.sms}
                  onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                  className="rounded border-slate-300 text-brand focus:ring-brand cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-850">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-accent-light text-accent rounded-element">
                    <IconMail className="w-4 h-4 stroke-[1.8]" />
                  </span>
                  <div>
                    <span className="text-xs font-bold block">Email (Resend)</span>
                    <span className="text-[9px] text-slate-400">{channels.email ? "Connected" : "Disabled"}</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={channels.email}
                  onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
                  className="rounded border-slate-300 text-brand focus:ring-brand cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-850">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-green-light text-green rounded-element">
                    <IconBrandWhatsapp className="w-4 h-4 stroke-[1.8]" />
                  </span>
                  <div>
                    <span className="text-xs font-bold block">WhatsApp (Meta)</span>
                    <span className="text-[9px] text-slate-400">{channels.whatsapp ? "Connected" : "Disabled"}</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={channels.whatsapp}
                  onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })}
                  className="rounded border-slate-300 text-brand focus:ring-brand cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center py-2.5">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-purple-light text-purple rounded-element">
                    <IconDeviceMobile className="w-4 h-4 stroke-[1.8]" />
                  </span>
                  <div>
                    <span className="text-xs font-bold block">Mobile Push (Expo)</span>
                    <span className="text-[9px] text-slate-400">{channels.push ? "Connected" : "Disabled"}</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={channels.push}
                  onChange={(e) => setChannels({ ...channels, push: e.target.checked })}
                  className="rounded border-slate-300 text-brand focus:ring-brand cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            Alert History Feed
          </h3>
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1 bg-gray-50 border border-slate-200 hover:bg-gray-100 text-[10px] font-heading font-extrabold uppercase rounded-element cursor-pointer transition-colors"
          >
            Mark All Read
          </button>
        </div>

        <div className="space-y-3 font-body">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-element border-[0.5px] flex justify-between items-start text-xs transition-colors ${
                alert.read
                  ? "bg-slate-50/50 border-slate-100 dark:bg-slate-900/10 dark:border-slate-900 text-slate-500"
                  : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="flex gap-3 items-start">
                <span className={`p-2 rounded-full mt-0.5 ${alert.read ? "bg-slate-100 text-slate-400" : "bg-red-light text-red"}`}>
                  <IconBell className="w-4 h-4" />
                </span>
                <div>
                  <span className={`font-heading font-extrabold text-[10px] uppercase tracking-wider block ${alert.read ? "text-slate-450" : "text-slate-800 dark:text-slate-100"}`}>
                    {alert.type} ALERT
                  </span>
                  <p className="mt-1 leading-relaxed text-[11px] text-slate-500 dark:text-slate-400">
                    {alert.message}
                  </p>
                </div>
              </div>
              <span className="text-[9px] text-slate-400 font-mono shrink-0 ml-4">{alert.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
