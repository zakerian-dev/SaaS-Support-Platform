import { RawData, TicketsProps } from "@/app/dashboard/page";
import { Ellipsis, Inbox } from "lucide-react";
import { statusStyles } from "../dashboard/RecentTickets";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import { createPortal } from "react-dom";
import EditTicketModal, { STATUS_LABELS } from "./EditTicketModal";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PRIORITY_LABEL } from "./detailed/QuickInfo";
import DeleteTicketModal from "./DeleteTicketModal";

const TicketTable = ({ items }: { items: RawData }) => {
  return (
    <div className="shadow-lg shadow-black/30 w-full overflow-x-auto">
      <table className="table-fixed w-full min-w-180 text-[#94A3B8] mt-10 mx-auto">
        <thead className="text-[#94A3B8] mt-20 mx-auto">
          <tr>
            <th className="pb-2">Id</th>
            <th className="pb-2">Subject</th>
            <th className="pb-2">Customer</th>
            <th className="pb-2">Assigned to</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Priority</th>
            <th className="pb-2">Created at</th>
            <th>Action</th>
          </tr>
          <tr>
            <th colSpan={8}>
              <hr />
            </th>
          </tr>
        </thead>
        <tbody>
          {items.tickets.length > 0 &&
            items.tickets.map((item, index) => (
              <TableRow key={index} item={item} index={index} />
            ))}
          {items.tickets.length === 0 && (
            <tr>
              <td colSpan={7}>
                <div className="flex justify-center items-center flex-col mt-5">
                  <Inbox size={35} className="text-stone-600" />
                  <p className="mt-1 text-lg text-gray-300">No tickets found</p>
                  <p className="mt-1 mb-5 text-sm">
                    New tickets will appear here.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;

const TableRow = ({ item, index }: { item: TicketsProps; index: number }) => {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);

  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const {
    setIsBlurring,
    isBlurring,
    setOpenDelete,
    setOpenEdit,
    openDelete,
    openEdit,
  } = useToast();

  const toggleOpen = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 6,
        left: rect.right - 120,
      });
    }
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);
  useEffect(() => {
    function handleScroll() {
      setOpen(false);
    }
    if (open) {
      window.addEventListener("scroll", handleScroll, true);
    }
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [open]);

  return (
    <tr className={`text-center ${index % 2 === 0 ? "bg-stone-600/10" : ""}`}>
      <td className="py-0.5">
        <Link
          href={`/dashboard/tickets/${item.id}`}
          className="underline underline-offset-2 cursor-pointer hover:text-blue-600 hover:scale-120 transition-all"
        >
          {item.id}
        </Link>
      </td>
      <td>{item.subject}</td>
      <td>{item.customer_id}</td>
      <td>{item.assigned_to}</td>
      <td className="py-1">
        <span className="text-blue-400 text-shadow-lg text-shadow-blue-100/20 rounded-lg bg-blue-800/20 pr-3 pl-5 pt-0.5 pb-1 border border-blue-500/30 inset-shadow-[0_0_10px_rgba(28,98,252,0.6)] font-semibold relative">
          <div className="w-2 h-2 rounded-full bg-blue-500 flex items-center justify-center absolute top-1/2 -translate-y-1/2 left-2">
            <div className="w-1 h-1 bg-blue-300/60 rounded-full backdrop-blur-lg" />
          </div>
          {STATUS_LABELS[item.status]}
        </span>
      </td>
      <td className="py-1">
        <span
          className={`${PRIORITY_LABEL[item.priority]} rounded-lg pt-0.5 pb-1 px-3 font-semibold`}
        >
          {item.priority}
        </span>
      </td>
      <td>{item.created_at}</td>
      <td>
        <button
          ref={buttonRef}
          onClick={toggleOpen}
          className="cursor-pointer hover:scale-120 hover:text-blue-600 transition-all outline-none"
        >
          <Ellipsis />
        </button>
        {open &&
          position &&
          createPortal(
            <div
              ref={wrapperRef}
              style={{
                position: "fixed",
                top: position.top,
                left: position.left,
              }}
              className="w-30 border border-[#334155] z-9999 rounded-lg bg-[#09172e] flex flex-col items-center"
            >
              <h3 className="text-stone-500 pt-2 pb-3">Actions</h3>
              <hr className="mb-3 w-full text-[#334155]" />
              <button
                onClick={() => (
                  setOpenEdit(item.id),
                  setIsBlurring(true),
                  setOpen(!open)
                )}
                className="cursor-pointer hover:text-blue-600 w-fit font-semibold text-stone-300/90"
              >
                Edit
              </button>
              <button
                onClick={() => (
                  setOpenDelete(item.id),
                  setIsBlurring(true),
                  setOpen(!open)
                )}
                className="py-2 cursor-pointer hover:text-red-700 font-semibold text-stone-300/90"
              >
                Delete
              </button>
            </div>,
            document.body,
          )}
        {openEdit === item.id && <EditTicketModal item={item} />}
        {openDelete === item.id && <DeleteTicketModal id={item.id} />}
      </td>
    </tr>
  );
};
