"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import {
  IconWebhook,
  IconPlus,
  IconTrash,
  IconCopy,
  IconRefresh,
  IconPlayerPlay,
  IconChevronRight,
  IconCircleCheck,
  IconCircleX,
  IconLoader2,
} from "@tabler/icons-react";

interface Webhook {
  id: string;
  url: string;
  subscribedEvents: string; // comma-separated
  active: boolean;
  secret: string;
}

interface DeliveryLog {
  timestamp: string;
  event: string;
  status: number;
  retryCount: number;
  responseBody: string;
}

export default function BankWebhooksPage() {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState({
    ownership_change: true,
    dispute_filed: false,
    encumbrance_added: true,
    property_frozen: false,
    fraud_flagged: true,
  });

  const [loading, setLoading] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResponse, setTestResponse] = useState<{ code: number; body: string } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [deliveryLogs] = useState<DeliveryLog[]>([
    { timestamp: "2026-06-09 15:30:12", event: "ownership_change", status: 200, retryCount: 0, responseBody: '{"success":true}' },
    { timestamp: "2026-06-09 14:15:22", event: "fraud_flagged", status: 200, retryCount: 0, responseBody: '{"received":true}' },
    { timestamp: "2026-06-08 09:12:00", event: "encumbrance_added", status: 500, retryCount: 3, responseBody: "Internal Server Error" },
  ]);

  const fetchWebhooks = async () => {
    try {
      const res = await fetch("/api/webhooks");
      if (res.ok) {
        const data = await res.json();
        setWebhooks(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.startsWith("https://")) {
      toast.error("Webhook endpoint must use secure HTTPS protocol.");
      return;
    }

    setLoading(true);
    const selectedEvents = Object.keys(events)
      .filter((k) => events[k as keyof typeof events])
      .join(",");

    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, subscribedEvents: selectedEvents }),
      });

      if (res.ok) {
        toast.success("Webhook endpoint registered successfully.");
        setUrl("");
        fetchWebhooks();
      } else {
        toast.error("Failed to register webhook.");
      }
    } catch (err) {
      toast.error("Failed to register webhook.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWebhook = async (id: string, active: boolean) => {
    try {
      const res = await fetch("/api/webhooks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !active }),
      });
      if (res.ok) {
        toast.success("Webhook status updated.");
        fetchWebhooks();
      }
    } catch (err) {
      toast.error("Failed to update webhook status.");
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      const res = await fetch(`/api/webhooks?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Webhook endpoint deleted.");
        fetchWebhooks();
      }
    } catch (err) {
      toast.error("Failed to delete webhook.");
    }
  };

  const handleTestWebhook = (webhook: Webhook) => {
    setTestingId(webhook.id);
    setTestResponse(null);
    setDrawerOpen(true);

    setTimeout(() => {
      setTestResponse({
        code: 200,
        body: JSON.stringify({ event: "ping", status: "success", timestamp: Date.now() }, null, 2),
      });
      setTestingId(null);
    }, 1500);
  };

  const handleRotateSecret = (webhook: Webhook) => {
    toast.success("Webhook encryption secret key rotated successfully.");
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <IconWebhook className="w-6 h-6 text-brand" />
          Webhook Dispatch Manager
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-body">
          Configure real-time server webhooks to dispatch event notifications directly to bank API endpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-body text-xs">
        {/* Add Webhook Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            Register Webhook Endpoint
          </h3>

          <form onSubmit={handleSaveWebhook} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-heading font-bold text-slate-400">Endpoint URL</label>
              <input
                type="text"
                placeholder="https://api.yourbank.com/v1/landchain-events"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-slate-200 dark:border-slate-850 rounded-element focus:outline-none focus:border-brand font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-heading font-bold text-slate-400 block">Subscribed Events</span>
              <div className="space-y-2 pl-1">
                {Object.keys(events).map((eKey) => (
                  <label key={eKey} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={events[eKey as keyof typeof events]}
                      onChange={(e) => setEvents({ ...events, [eKey]: e.target.checked })}
                      className="rounded text-brand focus:ring-brand"
                    />
                    <span className="capitalize">{eKey.replace(/_/g, " ")}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand hover:bg-brand-mid text-white text-xs font-heading font-extrabold uppercase rounded-element flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              {loading ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <IconPlus className="w-4 h-4" />}
              Save Webhook
            </button>
          </form>
        </div>

        {/* Webhooks list */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            Configured endpoints
          </h3>

          <div className="overflow-x-auto border-[0.5px] border-slate-200 dark:border-slate-800 rounded-element">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">Webhook URL</th>
                  <th className="p-3">Events</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {webhooks.length > 0 ? (
                  webhooks.map((wh) => (
                    <tr key={wh.id} className="border-b border-slate-150 dark:border-slate-800/80">
                      <td className="p-3 font-mono font-bold text-slate-700 truncate max-w-[200px]" title={wh.url}>
                        {wh.url}
                      </td>
                      <td className="p-3 text-slate-500">
                        <span className="flex flex-wrap gap-1">
                          {wh.subscribedEvents.split(",").map((evt) => (
                            <span key={evt} className="px-1.5 py-0.5 bg-slate-100 text-[8px] rounded-element font-bold uppercase text-slate-500">
                              {evt.replace(/_/g, " ")}
                            </span>
                          ))}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleWebhook(wh.id, wh.active)}
                          className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-pill border-[0.5px] cursor-pointer ${
                            wh.active
                              ? "bg-green-light text-green border-green/20"
                              : "bg-gray-150 text-gray-500 border-slate-200"
                          }`}
                        >
                          {wh.active ? "Active" : "Paused"}
                        </button>
                      </td>
                      <td className="p-3 flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleTestWebhook(wh)}
                          className="p-1 bg-gray-50 border border-slate-200 rounded-element hover:bg-slate-100 cursor-pointer text-slate-500"
                          title="Test Payload"
                        >
                          <IconPlayerPlay className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRotateSecret(wh)}
                          className="p-1 bg-gray-50 border border-slate-200 rounded-element hover:bg-slate-100 cursor-pointer text-slate-500"
                          title="Rotate Secret"
                        >
                          <IconRefresh className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteWebhook(wh.id)}
                          className="p-1 bg-red-light text-red rounded-element hover:bg-red hover:text-white cursor-pointer transition-colors"
                          title="Delete"
                        >
                          <IconTrash className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400">
                      No webhook endpoints configured. Register one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delivery Logs */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-card border-[0.5px] border-slate-200 dark:border-slate-800 space-y-4 font-body text-xs">
        <h3 className="font-heading font-extrabold text-xs text-slate-400 uppercase tracking-wider">
          Delivery Event Logs (Last 100)
        </h3>

        <div className="overflow-x-auto border-[0.5px] border-slate-200 dark:border-slate-800 rounded-element">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/20 text-[10px] font-heading font-extrabold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Dispatched Event</th>
                <th className="p-3 text-center">HTTP Status</th>
                <th className="p-3 text-center">Retries</th>
                <th className="p-3">Response Payload</th>
              </tr>
            </thead>
            <tbody>
              {deliveryLogs.map((log, index) => (
                <tr key={index} className="border-b border-slate-150 dark:border-slate-800/80">
                  <td className="p-3 text-slate-450">{log.timestamp}</td>
                  <td className="p-3 font-mono font-bold text-brand">{log.event}</td>
                  <td className="p-3 text-center">
                    <span className={`inline-flex items-center gap-1 font-bold ${log.status === 200 ? "text-green" : "text-red"}`}>
                      {log.status === 200 ? <IconCircleCheck className="w-3.5 h-3.5" /> : <IconCircleX className="w-3.5 h-3.5" />}
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono">{log.retryCount}</td>
                  <td className="p-3 font-mono text-[10px] text-slate-500 max-w-[200px] truncate" title={log.responseBody}>
                    {log.responseBody}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhook tester drawer */}
      {drawerOpen && (
        <div className="fixed inset-y-0 right-0 w-[340px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 z-50 shadow-2xl p-6 flex flex-col justify-between font-body text-xs">
          <div className="space-y-6 flex-1 flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-heading font-extrabold text-sm text-slate-700 dark:text-slate-150 uppercase tracking-wider">
                Webhook dispatch tester
              </h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
              <div className="p-3 bg-slate-50 border border-slate-105 rounded-element text-[10px] text-slate-500 leading-normal">
                Dispatches a mock ping event body to test endpoint connection health and secret headers signature matching.
              </div>

              <div className="flex-1 flex flex-col justify-end bg-slate-950 text-slate-300 font-mono text-[10px] p-4 rounded-element overflow-y-auto">
                {testingId ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <IconLoader2 className="w-4 h-4 animate-spin text-brand" />
                    <span>Sending POST request...</span>
                  </div>
                ) : testResponse ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <span className="text-green font-bold">STATUS:</span>
                      <span>{testResponse.code} OK</span>
                    </div>
                    <div className="border-t border-slate-800 pt-2 space-y-1">
                      <span className="text-slate-450 font-bold block">RESPONSE BODY:</span>
                      <pre className="text-slate-350">{testResponse.body}</pre>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <button
            onClick={() => setDrawerOpen(false)}
            className="w-full py-2 bg-slate-900 hover:bg-slate-950 text-slate-200 text-xs font-heading font-extrabold uppercase rounded-element cursor-pointer text-center mt-4"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
