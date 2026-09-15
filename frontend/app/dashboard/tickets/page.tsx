"use client";
import { useEffect, useRef, useState } from "react";
import { Plus, Search, ChevronDown, ListFilter, LoaderCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/contexts/ToastContext";
import TicketTable from "@/components/tickets/TicketTable";
import api from "@/lib/api/axios";
import { RawData, TicketsProps } from "../page";
import CreateTicketModal from "@/components/tickets/CreateTicketModal";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

function FilterCheckboxRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-sm text-stone-300 hover:bg-blue-600/20 cursor-pointer select-none">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="size-4 rounded-md border-stone-600 bg-transparent accent-blue-500 cursor-pointer"
      />
    </label>
  );
}

function FilterDropdown({
  status,
  setStatus,
  priority,
  setPriority,
}: {
  status: string[];
  setStatus: (v: string[]) => void;
  priority: string[];
  setPriority: (v: string[]) => void;
}) {
  const { setIsBlurring } = useToast();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const toggleValue = (
    list: string[],
    setList: (v: string[]) => void,
    value: string,
  ) => {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
  };

  const activeFiltersCount = status.length + priority.length;

  // بستن با کلیک بیرون از دراپ‌داون
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setIsBlurring(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // بستن با کلید Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") (setOpen(false), setIsBlurring(false));
    }
    if (open) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative z-60">
      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 120 }}
        onClick={() => setOpen((prev) => !prev)}
        className="text-stone-300 flex items-center gap-2 px-4 py-2 bg-blue-600/20 rounded-2xl cursor-pointer focus:border focus:border-stone-500"
      >
        <ListFilter size={15} />
        <span>Filter</span>
        {activeFiltersCount > 0 && (
          <span className="text-[10px] leading-none bg-blue-500 text-white rounded-full px-1.5 py-1">
            {activeFiltersCount}
          </span>
        )}
        <ChevronDown
          size={14}
          className={`text-stone-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </motion.button>

      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-2 w-56 rounded-xl border border-stone-700 shadow-lg shadow-black/40 p-2 z-50"
          >
            <div className="absolute inset-0 bg-[url('/yannis-papanastasopoulos-XZdgKvOqsMI-unsplash.jpg')] bg-center blur-xs" />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-[#0b1328]/80" />

            <div className="relative z-10">
              {/* Status */}
              <div className="p-2 text-[12px] uppercase tracking-wide text-stone-500 bg-black/20 rounded-lg">
                Status
              </div>
              <div className="flex flex-col">
                {STATUS_OPTIONS.map((opt) => (
                  <FilterCheckboxRow
                    key={opt.value}
                    label={opt.label}
                    checked={status.includes(opt.value)}
                    onToggle={() => toggleValue(status, setStatus, opt.value)}
                  />
                ))}
              </div>

              <hr className="border-stone-700 my-2" />

              {/* Priority */}
              <div className="p-2 text-[12px] uppercase tracking-wide text-stone-500 bg-black/20 rounded-lg">
                Priority
              </div>
              <div className="flex flex-col">
                {PRIORITY_OPTIONS.map((opt) => (
                  <FilterCheckboxRow
                    key={opt.value}
                    label={opt.label}
                    checked={priority.includes(opt.value)}
                    onToggle={() =>
                      toggleValue(priority, setPriority, opt.value)
                    }
                  />
                ))}
              </div>

              {activeFiltersCount > 0 && (
                <>
                  <hr className="border-stone-700 my-2" />
                  <button
                    type="button"
                    onClick={() => {
                      setStatus([]);
                      setPriority([]);
                    }}
                    className="w-full text-center px-2 py-1.5 rounded-lg text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800"
                  >
                    Clear filters
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const page = () => {
  const [status, setStatus] = useState<string[]>([]);
  const [priority, setPriority] = useState<string[]>([]);
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [tickets, setTickets] = useState<RawData>({
    page: 0,
    total_page: 1,
    total_tickets: 0,
    tickets: [
      {
        id: 0,
        subject: "",
        description: "",
        priority: "low",
        status: "closed",
        assigned_to: 0,
        customer_id: 0,
        company_id: 0,
        created_at: "",
        updated_at: "",
      },
    ],
  });
  const { setToast, isLoading } = useToast();

  useEffect(() => {
    const EditMessage = localStorage.getItem("ticketEditToast");
    const deleteTicket = localStorage.getItem("deleteTicket");

    if (EditMessage) {
      setToast({
        open: true,
        message: EditMessage,
        type: "success",
      });
      localStorage.removeItem("ticketEditToast");
    }

    if (deleteTicket) {
      setToast({
        open: true,
        message: deleteTicket,
        type: "success",
      });
      localStorage.removeItem("deleteTicket");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/tickets`, {
          params: { ...(search ? { search } : {}), status, priority },
          paramsSerializer: { indexes: null },
        });
        setTickets(res.data);
      } catch (error) {
        alert(error);
      }
    };
    fetchData();
  }, [search, status, priority]);
  const { isBlurring } = useToast();
  return (
    <div className="min-h-[calc(100vh-160px)] rounded-2xl shadow-lg shadow-black/30 px-8 py-3">
      <h1 className="text-[#F8FAFC] text-3xl  font-bold tracking-wide">
        Tickets
      </h1>
      <hr className="w-full border-stone-700 mt-5" />
      <div className="flex flex-col sm:flex-row justify-end space-x-2">
        <div className="flex items-center mt-4 w-fit relative">
          <Search className="text-stone-500 absolute left-3" size={15} />
          <input
            type="search"
            className="text-stone-300 outline-none px-8 py-2 bg-blue-600/20 rounded-2xl w-fit focus:border focus:border-stone-500"
            placeholder="Search by Subject ..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center mt-4 w-fit relative">
          {/* dropdown filter */}
          <FilterDropdown
            status={status}
            setStatus={setStatus}
            priority={priority}
            setPriority={setPriority}
          />
        </div>

        <div className="text-[#F8FAFC] flex items-center mt-4 justify-end  relative w-fit">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 120 }}
            onClick={() => setOpenCreate((prev) => !prev)}
            className="px-5 py-2 bg-blue-600/50 rounded-2xl cursor-pointer flex items-center space-x-1"
          >
            <Plus size={15} />
            <span>Create new ticket</span>
          </motion.button>
          {openCreate && <CreateTicketModal setOpenTicket={setOpenCreate} />}
        </div>
      </div>
      <div>
        <TicketTable items={tickets} />
      </div>
      {isLoading && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <LoaderCircle size={70} className="animate-spin text-blue-700" />
        </div>
      )}
      {isBlurring && <div className="fixed inset-0 z-50 backdrop-blur-md" />}
    </div>
  );
};

export default page;
