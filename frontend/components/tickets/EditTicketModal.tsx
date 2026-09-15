"use client";
import { useToast } from "@/contexts/ToastContext";
import {
  BookText,
  Check,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Type,
  User,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api/axios";
import { useState } from "react";
import { TicketsProps } from "@/app/dashboard/page";

export const STATUS_FLOW: Record<string, string> = {
  open: "in_progress",
  in_progress: "resolved",
  resolved: "closed",
  closed: "open",
};

export const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const PRIORITY_OPTION = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

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
      <label className="text-[#F8FAFC] text-sm">Status</label>

      <div className="mt-2 flex items-center justify-between bg-black/20 backdrop-blur-md border border-white/10 px-3 py-2.5 rounded-lg text-sm">
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
          className="flex items-center gap-1.5 text-xs text-blue-300 hover:text-blue-200 px-2.5 py-1 rounded-md hover:bg-blue-500/10 transition-colors cursor-pointer"
        >
          Move to {STATUS_LABELS[nextStatus]}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

const EditTicketModal = ({ item }: { item: TicketsProps }) => {
  const { setIsBlurring, setToast, setIsLoading, setOpenEdit } = useToast();
  const [subject, setSubject] = useState<string>(item.subject);
  const [description, setDescription] = useState<string>(item.description);
  const [status, setStatus] = useState<string>(item.status);
  const [priority, setPriority] = useState<string>(item.priority);
  const [assigned_to, setAssigned_to] = useState<number | null>(
    item.assigned_to,
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [priorityOpen, setPriorityOpen] = useState<boolean>(false);

  const editCustomer = async (id: number) => {
    setIsBlurring(true);
    try {
      setIsLoading(true);
      setOpenEdit(null);
      const res = await api.patch(`/tickets/${id}`, {
        subject,
        description,
        priority,
        status,
        assigned_to,
      });
      setToast({
        open: true,
        type: "info",
        message: "Ticket is editing",
      });
      if (res.status === 200) {
        localStorage.setItem("ticketEditToast", "Ticket edited successfully");

        window.location.href = "/dashboard/tickets";
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

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 overflow-y-auto text-left">
      <div
        className="bg-[#09172e]/95 w-full max-w-lg border border-[#334155] rounded-2xl my-8 
      max-h-[90vh] overflow-y-auto"
      >
        <form className="p-5 sm:p-8">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-white text-lg sm:text-xl text-left">
                Edit Ticket
              </h1>
              <p className="text-[#94A3B8] text-sm mt-2">
                Fill whichone you like to update.
              </p>
            </div>
            <X
              className="text-white hover:scale-110 cursor-pointer shrink-0 ml-3"
              size={26}
              onClick={() => (setOpenEdit(null), setIsBlurring(false))}
            />
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label className="text-[#F8FAFC] text-sm">Subject</label>
              <div className="relative flex items-center mt-2">
                <BookText
                  className="absolute text-blue-300/50 left-3"
                  size={20}
                />
                <input
                  onChange={(e) => setSubject(e.target.value)}
                  type="text"
                  placeholder="Enter new subject"
                  className="outline-none focus:border-blue-700 bg-black/30 px-10 py-2.5 
                  text-stone-300 text-sm rounded-lg border border-[#334155] w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-[#F8FAFC] text-sm">Description</label>
              <div className="relative flex items-center mt-2">
                <Type className="absolute text-blue-300/50 left-3" size={20} />
                <input
                  onChange={(e) => setDescription(e.target.value)}
                  type="text"
                  placeholder="Enter new description"
                  className="outline-none focus:border-blue-700 bg-black/30 px-10 py-2.5 text-stone-300 text-sm rounded-lg border 
                  border-[#334155] w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-[#F8FAFC] text-sm">Assigned to</label>
              <div className="relative flex items-center mt-2">
                <User className="absolute text-blue-300/50 left-3" size={20} />
                <input
                  onChange={(e) => setAssigned_to(Number(e.target.value))}
                  type="number"
                  placeholder="Which user you want to assign this ticket to"
                  className="outline-none focus:border-blue-700 bg-black/30 px-10 py-2.5 text-stone-300 text-sm rounded-lg border 
                  border-[#334155] w-full"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-[#F8FAFC] text-sm">Priority</label>
              <button
                type="button"
                className="mt-2 w-full flex items-center justify-between bg-black/20 backdrop-blur-md border border-white/10 
                hover:border-blue-400/40 focus:border-blue-500/60 
                text-white/60 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer"
                onClick={() => setPriorityOpen(!priorityOpen)}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-blue-300/50" />
                  <span>{priority}</span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-white/40 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {priorityOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-white/10
                    bg-[#0b1a33] backdrop-blur-md shadow-xl shadow-black/20 p-1"
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

            <StatusStepper
              status={status}
              setStatus={setStatus}
              originalStatus={item.status}
            />
          </div>
        </form>

        <hr className="w-full text-[#334155]" />
        <div
          className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center 
        justify-end gap-3 px-5 py-5"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 120 }}
            onClick={() => (setOpenEdit(null), setIsBlurring(false))}
            className="border border-[#334155] text-[#F8FAFC] py-2.5 px-8 rounded-lg 
            cursor-pointer text-center"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 120 }}
            onClick={() => editCustomer(item.id)}
            className="text-[#F8FAFC] text-center bg-[#0f3892] rounded-lg py-2.5 
            px-8 font-medium text-lg cursor-pointer"
          >
            Save
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default EditTicketModal;
