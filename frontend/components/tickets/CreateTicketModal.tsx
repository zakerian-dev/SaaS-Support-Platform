"use client";
import { useToast } from "@/contexts/ToastContext";
import {
  BookText,
  Check,
  ChevronDown,
  IdCard,
  ShieldAlert,
  Type,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api/axios";
import { useState } from "react";

const ROLE_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const CreateTicketModal = ({
  setOpenTicket,
}: {
  setOpenTicket: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { setOpen, setIsBlurring, setToast, setIsLoading } = useToast();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [customer_id, setCustomer_id] = useState<number>(0);
  const [selectPriority, setSelectPriority] = useState<boolean>(false);

  const closeModal = () => {
    setOpenTicket(false);
    setIsBlurring(false);
  };

  const createTicket = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setIsLoading(true);

      await api.post("/tickets", {
        subject,
        description,
        priority,
        customer_id,
      });

      setOpen(false);
      setToast({
        open: true,
        type: "success",
        message: "Ticket created successfully",
      });

      setTimeout(() => {
        window.location.href = "/dashboard/tickets";
        setIsBlurring(false);
        setIsLoading(false);
      }, 3000);
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail[0]?.msg
        : detail || "Something went wrong";

      setToast({
        message,
        open: true,
        type: "error",
      });

      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4"
      onClick={closeModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md sm:max-w-lg bg-[#09172e] border border-[#334155] rounded-2xl max-h-[90vh] overflow-y-auto"
      >
        <form className="p-5 sm:p-8">
          <div className="relative mb-8">
            <button
              type="button"
              aria-label="Close"
              onClick={closeModal}
              className="absolute right-0 top-0 text-white/70 hover:text-white hover:scale-110 transition cursor-pointer"
            >
              <X size={26} />
            </button>
            <h1 className="text-white text-lg sm:text-xl pr-8">
              Create New Ticket
            </h1>
            <p className="text-[#94A3B8] text-sm mt-2">
              Fill in the details below to create new ticket.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-[#F8FAFC] text-sm">Subject</label>
              <div className="relative flex items-center mt-2">
                <BookText
                  className="absolute text-blue-300/50 left-3"
                  size={18}
                />
                <input
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  type="text"
                  placeholder="Enter a brief subject"
                  className="outline-none focus:border-blue-600 bg-black/30 pl-10 pr-3 py-2.5 text-stone-200 text-sm rounded-lg border border-[#334155] w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="text-[#F8FAFC] text-sm">
                Description
              </label>
              <div className="relative flex items-center mt-2">
                <Type className="absolute text-blue-300/50 left-3" size={18} />
                <input
                  id="description"
                  name="description"
                  required
                  minLength={8}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  type="text"
                  placeholder="Describe the issue or request"
                  className="outline-none focus:border-blue-600 bg-black/30 pl-10 pr-3 py-2.5 text-stone-200 text-sm rounded-lg border border-[#334155] w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="customer_id" className="text-[#F8FAFC] text-sm">
                Customer ID
              </label>
              <div className="relative flex items-center mt-2">
                <IdCard
                  className="absolute text-blue-300/50 left-3"
                  size={18}
                />
                <input
                  required
                  value={customer_id}
                  onChange={(e) => setCustomer_id(parseInt(e.target.value))}
                  type="number"
                  autoComplete="customer_id"
                  placeholder="Enter customer id"
                  className="outline-none focus:border-blue-600 bg-black/30 pl-10 pr-3 py-2.5 text-stone-200 text-sm rounded-lg border border-[#334155] w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-[#F8FAFC] text-sm">Priority</label>
              <button
                type="button"
                onClick={() => setSelectPriority(!selectPriority)}
                className="w-full flex items-center justify-between bg-black/20 backdrop-blur-md border border-white/10 hover:border-blue-400/40 
                focer:border-blue-500/60 text-white/60 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-blue-300/50" size={18} />
                  <span>{priority || "Select priority"}</span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-white/40 transition-transform duration-200 ${
                    selectPriority ? "rotate-180" : ""
                  }`}
                />
              </button>
              {selectPriority && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className="
                absolute z-50 mt-2 w-[calc(100%-68px)] overflow-hidden rounded-lg border border-white/10
                backdrop-blur-md shadow-xl shadow-black/20 p-1
              "
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <button
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
                        setSelectPriority(false);
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
          </div>
        </form>

        <hr className="w-full text-[#334155]" />

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 p-5 sm:p-6">
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 120 }}
            onClick={closeModal}
            className="border border-[#334155] text-[#F8FAFC] py-2.5 px-8 rounded-lg cursor-pointer"
          >
            Cancel
          </motion.button>
          <motion.button
            type="button"
            disabled={submitting}
            whileHover={{ scale: submitting ? 1 : 1.03 }}
            whileTap={{ scale: submitting ? 1 : 0.97 }}
            transition={{ type: "spring", stiffness: 120 }}
            onClick={createTicket}
            className="text-[#F8FAFC] text-center bg-[#0f3892] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg py-2.5 px-8 font-medium text-base sm:text-lg cursor-pointer"
          >
            {submitting ? "Creating..." : "Create Ticket"}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CreateTicketModal;
