"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Inbox } from "lucide-react";
import { getHistoryDisplay, timeAgo } from "@/lib/Utils";
import api from "@/lib/api/axios";

export interface HistoryUser {
  id: number;
  name: string;
}

export interface HistoryEntry {
  id: number;
  ticket_id: number;
  field: string;
  old_value: string | null;
  new_value: string | null;
  action: string; // "updated" | "Ticket created"
  created_at: string; // ISO date string
  user: HistoryUser;
}

export interface HistoryResponse {
  history: HistoryEntry[];
  page: number;
  total_page: number;
  total_history: number;
}

interface HistoryTimelineProps {
  ticketId?: string;
  pageSize?: number;
}

export default function HistoryTimeline({
  ticketId,
  pageSize = 5,
}: HistoryTimelineProps) {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log("RENDER HistoryTimeline", ticketId); // ← این

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("PAGE:", page, "LIMIT:", pageSize);
        const res = await api.get(`/tickets/${ticketId}/history`, {
          params: { page, limit: pageSize },
        });
        console.log("SUCCESS", res);
        setData(res.data);
      } catch (err) {
        console.error("HISTORY FETCH ERROR", err); // ← این خط رو اضافه کنید
        setError("Couldn't load history. Try again.");
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [page, pageSize]);

  const items = data?.history ?? [];

  return (
    <div className="relative w-full rounded-2xl border border-blue-400/40 bg-[url('/backgrounds/bg2.png')] bg-cover shadow-[0_0_40px_-15px_rgba(59,130,246,0.35)]">
      <div className="w-full h-full absolute bg-[#00112b]/90 rounded-2xl" />
      <div className="flex items-center gap-2 p-6 z-50 relative">
        <Clock className="h-5 w-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">History</h2>
      </div>
      <div className="px-8">
        <hr className="w-full mx-auto text-blue-600/40 z-50 relative" />
      </div>

      {loading && (
        <div className="animate-pulse space-y-6 p-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="mt-1 h-3 w-3 rounded-full bg-blue-400/30" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 rounded bg-white/10" />
                <div className="h-2 w-24 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">
          {error}
          <button className="ml-2 underline">Retry</button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="z-50 relative flex flex-col justify-center items-center my-10">
          <Inbox className="text-stone-600 mb-2" size={35} />
          <p className="text-sm text-slate-400 text-center">
            No history yet for this ticket.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="relative">
          {/* Main content */}
          <ul className="space-y-1 p-6">
            <AnimatePresence mode="popLayout">
              {items.map((entry, index) => {
                const display = getHistoryDisplay(entry);
                return (
                  <motion.li
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, delay: index * 0.06 }}
                    className="group relative grid grid-cols-4 gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-white/3"
                  >
                    {/* Field */}
                    <div className="flex col-span-2 gap-3">
                      <span className="relative mt-1 flex h-3 w-3 shrink-0 items-center justify-center">
                        <motion.span
                          className="absolute h-full w-full rounded-full"
                          style={{ backgroundColor: display.color }}
                          animate={{
                            scale: [1, 1.8, 1],
                            opacity: [0.6, 0, 0.6],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />

                        <span
                          className="h-3 w-3 rounded-full ring-4 ring-[#060a14]"
                          style={{
                            backgroundColor: display.color,
                            boxShadow: `0 0 10px ${display.color}`,
                          }}
                        />
                      </span>

                      <div className="min-w-0">
                        <p className="text-lg font-medium text-white">
                          {display.title}
                        </p>
                        {display.subtitle && (
                          <p className="mt-0.5 text-sm text-blue-400 text-shadow-lg text-shadow-blue-600/50">
                            {display.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* User */}
                    <div className="hidden shrink-0 text-center sm:block">
                      <p className="text-blue-300 text-shadow-lg text-shadow-blue-400/50">
                        by {entry.user?.name ?? "Unknown"}
                      </p>
                    </div>

                    {/* Time */}
                    <div className="shrink-0 text-right">
                      <p className="whitespace-nowrap text-xs text-blue-300/70">
                        {timeAgo(entry.created_at)}
                      </p>
                    </div>
                    <hr className="w-full col-span-4 text-blue-600/40" />
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>
      )}

      {data && data.total_page > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-blue-400/40 pt-4 relative z-50 mb-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-blue-500 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </motion.button>
          <span className="text-sm text-blue-400">
            Page {data.page} of {data.total_page}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setPage((p) => Math.min(data.total_page, p + 1))}
            disabled={page >= data.total_page}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-blue-500 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            Next <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
