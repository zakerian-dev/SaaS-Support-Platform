"use client";
import { ITicket } from "@/app/dashboard/tickets/[id]/page";
import api from "@/lib/api/axios";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { STATUS_LABELS } from "../EditTicketModal";

export type Priority = "low" | "medium" | "high" | "urgent";

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "bg-green-500/30 text-green-300 border-green-500/30 text-shadow-green-800 inset-shadow-[0_0_10px_rgba(0,201,80,0.6)]",
  medium:
    "bg-purple-500/30 text-purple-300 border-purple-500/30 text-shadow-purple-800 inset-shadow-[0_0_10px_rgba(201,78,255,0.6)]",
  high: "bg-orange-500/30 text-orange-300 border-orange-500/30 text-shadow-orange-800 inset-shadow-[0_0_10px_rgba(255,105,0,0.6)]",
  urgent:
    "bg-red-500/30 text-red-300 border-red-500/30 text-shadow-red-800 inset-shadow-[0_0_10px_rgba(251,44,54,0.6)]",
};

const PRIORITY_CIRCLE: Record<Priority, string> = {
  low: "bg-green-500",
  medium: "bg-purple-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

const Header = ({ ticket }: { ticket: ITicket }) => {
  return (
    <div>
      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        className="flex gap-2 items-center cursor-pointer"
      >
        <FaArrowLeftLong className="text-blue-400 text-xs" />
        <Link href={"/dashboard/tickets"}>
          <p className="text-blue-400 text-xs">Back To Tickets</p>
        </Link>
      </motion.button>

      {/* Header Information */}
      <div className="flex mt-6 gap-5 items-center">
        <h2 className="text-[#F8FAFC] text-3xl font-semibold">#{ticket.id}</h2>

        {/* Status */}
        <div className="flex items-center gap-2 bg-blue-800/20 w-fit px-3 py-0.5 rounded-xl border border-blue-500/30 inset-shadow-[0_0_10px_rgba(28,98,252,0.6)]">
          <div className="w-2 h-2 rounded-full bg-blue-500 flex items-center justify-center">
            <div className="w-1 h-1 bg-blue-300/60 rounded-full backdrop-blur-lg" />
          </div>
          <span className="text-blue-400 text-shadow-lg text-shadow-blue-100/20 text-sm pb-0.5">
            {STATUS_LABELS[ticket.status]}
          </span>
        </div>

        {/* Priority */}
        <div
          className={`${PRIORITY_LABEL[ticket.priority]} border h-fit px-3 py-0.5 rounded-xl flex items-center gap-1 text-sm text-shadow-sm`}
        >
          <div
            className={`${PRIORITY_CIRCLE[ticket.priority]} rounded-full h-2 w-2`}
          />
          <span className="pb-0.5">{ticket.priority}</span>
        </div>
      </div>

      {/* Title and Description */}
      <h3 className="text-secondary text-sm mt-10">Subject</h3>
      <p className="text-primary mt-1 text-3xl font-bold">{ticket.subject}</p>
    </div>
  );
};

export default Header;
