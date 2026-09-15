import {
  CustomerProps,
  CustomerRawData,
  UserProps,
} from "@/app/dashboard/page";
import { ITicket } from "@/app/dashboard/tickets/[id]/page";
import {
    CalendarClock,
    CalendarDays,
  CardSim,
  CircleAlert,
  Info,
  Shield,
  ShieldCheck,
  User,
  UserRoundArrowLeft,
} from "lucide-react";
import React from "react";

type Priority = "low" | "medium" | "high" | "urgent";

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "bg-green-500/30 text-green-300 border-green-500/30 text-shadow-green-800 inset-shadow-[0_0_10px_rgba(0,201,80,0.6)]",
  medium:
    "bg-purple-500/30 text-purple-300 border-purple-500/30 text-shadow-purple-800 inset-shadow-[0_0_10px_rgba(201,78,255,0.6)]",
  high: "bg-orange-500/30 text-orange-300 border-orange-500/30 text-shadow-orange-800 inset-shadow-[0_0_10px_rgba(255,105,0,0.6)]",
  urgent:
    "bg-red-500/30 text-red-300 border-red-500/30 text-shadow-red-800 inset-shadow-[0_0_10px_rgba(251,44,54,0.6)]",
};

export const PRIORITY_CIRCLE: Record<Priority, string> = {
  low: "bg-green-500",
  medium: "bg-purple-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

const STATUS_LABEL: Record<string, string> = {
  in_progress: "In Progress",
  open: "Open",
  closed: "Closed",
  resolved: "Resolved",
};

const QuickInfo = ({
  ticket,
  user,
  customers,
}: {
  ticket: ITicket;
  user: UserProps;
  customers: CustomerRawData;
}) => {
  const customer = customers.customers.find(
    (item: CustomerProps) => ticket.customer_id === item.id,
  );

  return (
    <div className="border border-blue-400/40 bg-[url('/backgrounds/bg2.png')] bg-cover rounded-2xl relative shadow-2xl/50 mt-5">
      <div className="w-full h-full absolute bg-[#00112b]/90 rounded-2xl" />
      <div className="p-6 z-50 relative">
        {/* Header */}
        <div className="flex gap-3  ">
          <CircleAlert className="text-blue-400" size={35} />
          <h2 className="text-primary text-2xl font-semibold">Quick Info</h2>
        </div>
        <hr className="w-99/100 text-blue-600/30 mx-auto z-50 relative mt-8" />

        {/* Ticket ID */}
        <div className="grid grid-cols-2 mt-5">
          <div className="flex gap-4 items-center">
            <CardSim className="text-blue-400" />
            <h3 className="text-primary text-lg">Ticket ID</h3>
          </div>
          <span className="text-primary text-xl bg-blue-900/20 w-fit px-5 py-0.5 rounded-xl border border-blue-500/10">
            #{ticket.id}
          </span>
        </div>
        <hr className="w-99/100 text-blue-600/30 mx-auto z-50 relative mt-5" />

        {/* Status */}
        <div className="grid grid-cols-2 mt-5">
          <div className="flex gap-4 items-center">
            <Info className="text-blue-400" />
            <h3 className="text-primary text-lg">Status</h3>
          </div>
          <div className="flex items-center gap-2 bg-blue-800/20 w-fit px-3 py-0.5 rounded-xl border border-blue-500/30 inset-shadow-[0_0_10px_rgba(28,98,252,0.6)]">
            <div className="w-2 h-2 rounded-full bg-blue-500 flex items-center justify-center">
              <div className="w-1 h-1 bg-blue-300/60 rounded-full backdrop-blur-lg" />
            </div>
            <span className="text-blue-400 text-shadow-lg text-shadow-blue-100/20">
              {STATUS_LABEL[ticket.status]}
            </span>
          </div>
        </div>
        <hr className="w-99/100 text-blue-600/30 mx-auto z-50 relative mt-5" />

        {/* Priority */}
        <div className="grid grid-cols-2 mt-5">
          <div className="flex gap-4 items-center">
            <ShieldCheck className="text-blue-400" />
            <h3 className="text-primary text-lg">Priority</h3>
          </div>
          <div
            className={`${PRIORITY_LABEL[ticket.priority]} border px-3 py-0.5 rounded-xl flex items-center gap-1 text-sm text-shadow-sm w-fit`}
          >
            <div
              className={`${PRIORITY_CIRCLE[ticket.priority]} rounded-full h-2 w-2`}
            />

            <span className="">{ticket.priority}</span>
          </div>
        </div>
        <hr className="w-99/100 text-blue-600/30 mx-auto z-50 relative mt-5" />

        {/* Customer */}
        <div className="grid grid-cols-2 mt-5">
          <div className="flex gap-4 items-center">
            <User className="text-blue-400" />
            <h3 className="text-primary text-lg">Customer</h3>
          </div>
          <div className="text-blue-300 text-shadow-lg text-shadow-blue-800 text-lg bg-blue-900/20 w-fit px-5 py-1 rounded-xl border border-blue-500/10">
            <div />

            <span className="">{customer?.name}</span>
          </div>
        </div>
        <hr className="w-99/100 text-blue-600/30 mx-auto z-50 relative mt-5" />

        {/* Assigned To */}
        <div className="grid grid-cols-2 mt-5">
          <div className="flex gap-4 items-center">
            <UserRoundArrowLeft className="text-blue-400" />
            <h3 className="text-primary text-lg">Assigned To</h3>
          </div>
          <div className="text-blue-300 text-shadow-lg text-shadow-blue-800 text-lg bg-blue-900/20 w-fit px-5 py-1 rounded-xl border border-blue-500/10">
            <div />

            <span className="">{user?.name}</span>
          </div>
        </div>
        <hr className="w-99/100 text-blue-600/30 mx-auto z-50 relative mt-5" />

        {/* Created At */}
        <div className="grid grid-cols-2 mt-5">
          <div className="flex gap-4 items-center">
            <CalendarDays className="text-blue-400" />
            <h3 className="text-primary text-lg">Created At</h3>
          </div>
          <div className="text-blue-300 text-shadow-lg text-shadow-blue-800 text-lg bg-blue-900/20 w-fit px-5 py-1 rounded-xl border border-blue-500/10">
            <div />

            <span className="text-sm">{ticket.created_at}</span>
          </div>
        </div>
        <hr className="w-99/100 text-blue-600/30 mx-auto z-50 relative mt-5" />

        {/* Updated At */}
        <div className="grid grid-cols-2 mt-5">
          <div className="flex gap-4 items-center">
            <CalendarClock className="text-blue-400" />
            <h3 className="text-primary text-lg">Updated At</h3>
          </div>
          <div className="text-blue-300 text-shadow-lg text-shadow-blue-800 text-lg bg-blue-900/20 w-fit px-5 py-1 rounded-xl border border-blue-500/10">
            <div />

            <span className="text-sm">{ticket.updated_at}</span>
          </div>
        </div>
        <hr className="w-99/100 text-blue-600/30 mx-auto z-50 relative mt-5" />
      </div>
    </div>
  );
};

export default QuickInfo;
