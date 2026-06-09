"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconMessageChatbot, IconX, IconSend, IconExternalLink, IconScale } from "@tabler/icons-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AILegalAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your LandChain AI Legal Assistant. Ask me anything about Indian land law, including the Registration Act 1908, the Transfer of Property Act 1882, or RERA 2016.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        throw new Error("API call failed");
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I am experiencing temporary difficulties. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = () => {
    // Open mock Calendly scheduling link
    window.open("https://calendly.com", "_blank");
  };

  return (
    <>
      {/* Floating Minimized Button */}
      <div className="fixed bottom-6 right-6 z-[999]">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-brand-DEFAULT hover:bg-brand-dark text-white p-3.5 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-1 bg-[#0F6E56]"
          title="AI Legal Assistant"
        >
          <IconMessageChatbot className="w-6 h-6 animate-pulse" />
        </button>
      </div>

      {/* Expanded Chat Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-2xl z-[999] flex flex-col overflow-hidden font-body text-slate-800 dark:text-slate-100"
          >
            {/* Header */}
            <div className="bg-brand-DEFAULT text-white p-4 flex items-center justify-between bg-[#0F6E56]">
              <div className="flex items-center gap-2">
                <IconScale className="w-5 h-5" />
                <div>
                  <h3 className="font-heading font-bold text-sm">AI Legal Assistant</h3>
                  <span className="text-[10px] text-slate-200 block">Indian Land Law Specialist</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-200 hover:text-white transition-colors"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-element p-3 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#0F6E56] text-white rounded-tr-none"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-none text-slate-700 dark:text-slate-200 shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-element rounded-tl-none p-3 text-xs text-slate-400">
                    AI is writing a reply...
                  </div>
                </div>
              )}
            </div>

            {/* Footer Form */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-2">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about Registration Act, RERA..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-element border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0F6E56] hover:bg-brand-dark text-white p-2 rounded-element transition-colors flex items-center justify-center"
                >
                  <IconSend className="w-4 h-4" />
                </button>
              </form>

              {/* Escalation Button */}
              <button
                onClick={handleEscalate}
                className="w-full flex items-center justify-center gap-1 text-[10px] font-semibold text-[#0F6E56] dark:text-emerald-400 hover:underline pt-1"
              >
                Need human counsel? Book Lawyer on Calendly
                <IconExternalLink className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
