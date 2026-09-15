"use client";
import { UserProps } from "@/app/dashboard/page";
import { ITicket } from "@/app/dashboard/tickets/[id]/page";
import {
  Check,
  ChevronDown,
  ChevronRight,
  CircleFadingArrowUp,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  PRIORITY_OPTION,
  STATUS_FLOW,
  STATUS_LABELS,
} from "../EditTicketModal";
import api from "@/lib/api/axios";
import { useToast } from "@/contexts/ToastContext";

function StatusStepper({
  status,
  setStatus,
  originalStatus,
}: {
  status: string;
  setStatus: (v: string) => void;
  originalStatus: string;
}) {
  const hasChanges = status !== originalStatus;
  const nextStatus = STATUS_FLOW[status];

  return (
    <div className="relative">
      <div className="mt-2 flex items-center justify-between bg-blue-400/10 backdrop-blur-md border border-blue-400/40 px-3 py-2.5 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-blue-300/50" />
          <span className={hasChanges ? "text-amber-300" : "text-white/80"}>
            {STATUS_LABELS[status]}
          </span>
          {hasChanges && (
            <span className="text-[10px] text-amber-400/70">(unsaved)</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setStatus(nextStatus)}
          className="flex items-center gap-1.5 text-xs text-blue-300 hover:text-blue-200 px-2.5 py-1.5 rounded-md hover:bg-blue-500/10 transition-colors cursor-pointer"
        >
          Move to {STATUS_LABELS[nextStatus]}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

const TicketAction = ({
  ticket,
  user,
}: {
  ticket: ITicket;
  user?: UserProps;
}) => {
  const { setIsBlurring, setToast, setIsLoading, setOpenEdit } = useToast();
  const [status, setStatus] = useState<string>(ticket.status);
  const [priority, setPriority] = useState<string>();
  const [priorityOpen, setPriorityOpen] = useState<boolean>(false);
  const [assignedOpen, setAssignedOpen] = useState<boolean>(false);
  const [assigned, setAssigned] = useState<number | undefined>();
  const [users, setUsers] = useState<UserProps[]>([]);
  const currentUser = users.find((item) => item.id === assigned);
  const wrapperref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperref.current &&
        !wrapperref.current.contains(event.target as Node)
      ) {
        setAssignedOpen(false);
        setPriorityOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setStatus(ticket.status);
  }, [ticket.status]);

  const handleUpgrade = async () => {
    console.log({
      status,
      priority,
      assigned,
    });
    setIsBlurring(true);
    try {
      setIsLoading(true);
      const res = await api.patch(`/tickets/${ticket.id}`, {
        status,
        priority,
        assigned_to: assigned,
      });
      setToast({
        open: true,
        type: "info",
        message: "Ticket is editing",
      });
      if (res.status === 200) {
        localStorage.setItem("ticketEditToast", "Ticket edited successfully");

        setTimeout(() => {
          window.location.href = `/dashboard/tickets/${ticket.id}`;
        }, 3000);
      }
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      setIsBlurring(false);
      setIsLoading(false);

      const message = Array.isArray(detail)
        ? detail[0]?.msg
        : detail || "Something went wrong";

      setToast({
        message,
        open: true,
        type: "error",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/users/users");
        setUsers(res.data.users);
      } catch (error) {}
    };
    fetchData();
  }, []);

  return (
    <div className="border border-blue-400/40 bg-[url('/backgrounds/bg2.png')] bg-cover rounded-2xl relative shadow-2xl/50">
      <div className="w-full h-full absolute bg-[#00112b]/90 rounded-2xl" />
      <div className="flex gap-3 px-8 py-10 items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-zap text-blue-400 z-50"
        >
          <path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z" />
        </svg>
        <h2 className="text-2xl text-primary z-50">Ticket Actions</h2>
      </div>
      <form className="flex flex-col px-8 pb-8">
        {/* Status */}
        <label className="mb-2 text-blue-400/40 font-semibold z-50">
          Status
        </label>
        <StatusStepper
          status={status}
          setStatus={setStatus}
          originalStatus={ticket.status}
        />

        {/* Priority */}
        <label className="mb-2 mt-5 text-blue-400/40 font-semibold z-50">
          Priority
        </label>
        <div className="flex justify-between items-center border border-blue-400/40 px-5 rounded-lg bg-blue-400/10 text-primary text-left relative">
          <button
            type="button"
            onClick={() => setPriorityOpen(!priorityOpen)}
            className="w-full h-full cursor-pointer text-left py-3"
          >
            {priority || ticket.priority}
          </button>
          <ChevronDown
            size={20}
            className={`text-blue-400/60 ${priorityOpen ? "rotate-180" : ""} transition-transform`}
          />
          {priorityOpen && (
            <motion.div
              ref={wrapperref}
              initial={{ opacity: 0, y: 50, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="absolute z-9999 -top-1 left-0 w-full overflow-hidden rounded-lg border border-white/10
                    bg-[#0b1a33] backdrop-blur-md shadow-xl shadow-black p-1"
            >
              {PRIORITY_OPTION.map((opt) => (
                <button
                  type="button"
                  className={`
                        w-full flex justify-between text-left px-3 py-2.5 rounded-md text-sm
                        transition-colors duration-150
                        cursor-pointer
                        ${
                          priority === opt.value
                            ? "bg-blue-500/10 text-blue-300"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }
                      `}
                  onClick={() => {
                    setPriority(opt.value);
                    setPriorityOpen(false);
                  }}
                  key={opt.value}
                >
                  {opt.label}
                  {priority === opt.value && (
                    <Check size={16} className="text-blue-400" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Assigned To */}
        <label className="mb-2 mt-5 text-blue-400/40 font-semibold z-50">
          Assigned To
        </label>
        <div className="flex justify-between items-center border h-12 border-blue-400/40 px-5 rounded-lg bg-blue-400/10 z-50 text-primary text-left relative">
          <div className="flex gap-3 items-center w-full">
            {user && (
              <div className="h-8 w-8 rounded-full bg-blue-900 border border-blue-200/20 text-lg text-primary items-center flex justify-center">
                {user?.name.slice(0, 1).toLocaleUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={() => setAssignedOpen(!assignedOpen)}
              className="w-full h-full cursor-pointer text-left py-3"
            >
              {}
              {currentUser?.name || user?.name}
            </button>
          </div>
          <ChevronDown
            size={20}
            className={`text-blue-400/60 ${assignedOpen ? "rotate-180" : ""} transition-transform`}
          />
          {assignedOpen && (
            <div
              ref={wrapperref}
              className="absolute border w-full border-blue-400/40 rounded-lg bg-[#0b1a33] py-2 top-0 left-0"
            >
              {users.map((item, index) => (
                <div key={index} className="">
                  <button
                    type="button"
                    className={`
                        w-full flex justify-between text-left px-3 py-2.5 rounded-md text-sm
                        transition-colors duration-150
                        cursor-pointer
                        ${
                          ticket.assigned_to === item.id
                            ? "bg-blue-500/10 text-blue-300"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }
                      `}
                    onClick={() => (
                      setAssignedOpen(false),
                      setAssigned(item.id)
                    )}
                  >
                    {item.name}
                    {ticket.assigned_to === item.id && (
                      <Check size={16} className="text-blue-400" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upgrade Ticket */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="mt-15 rounded-2xl border border-blue-400/40 py-3 text-xl font-semibold bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.5)] inset-shadow-[0_0_30px_rgba(255,255,255,0.3)] z-50"
        >
          <button
            type="button"
            onClick={handleUpgrade}
            className="flex justify-center items-center gap-2 text-primary w-full h-full cursor-pointer"
          >
            <CircleFadingArrowUp />
            Upgrade Ticket
          </button>
        </motion.div>
      </form>
    </div>
  );
};

export default TicketAction;
