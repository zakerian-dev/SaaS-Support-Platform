"use client";

import { ITicket } from "@/app/dashboard/tickets/[id]/page";
import { ReceiptText } from "lucide-react";

const Description = ({ ticket }: { ticket: ITicket }) => {
  return (
    <div className="grid mt-5 border p-5 rounded-2xl border-blue-400/40 bg-[url('/backgrounds/bg2.png')] bg-fixed bg-center relative shadow-2xl/50">
      <div className="w-full h-full absolute bg-[#00112b]/90 rounded-2xl" />
      <div className="flex items-center mb-3 gap-3 z-50 py-1">
        <ReceiptText className="text-blue-400/60" />
        <h2 className="text-primary text-2xl font-semibold">Description</h2>
      </div>
      <hr className="text-blue-800/40 z-50" />

      <p className="text-white/70 z-50 self-center mt-5">{ticket.description}</p>
    </div>
  );
};

export default Description;
