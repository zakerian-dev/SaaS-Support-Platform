"use client";
import { UserProps, UserRawData } from "@/app/dashboard/page";
import { useToast } from "@/contexts/ToastContext";
import api from "@/lib/api/axios";
import { Ellipsis, Inbox } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";

const UserTable = ({ search }: { search?: string }) => {
  const [users, setUsers] = useState<UserRawData>({
    page: 1,
    total_page: 1,
    users: [],
    total_users: 0,
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (search) {
          const res = await api.get(`/users/users?search=${search}`);
          setUsers(res.data);
        } else {
          const res = await api.get(`/users/users`);
          setUsers(res.data);
        }
      } catch (error: any) {
        console.log(error.response?.data?.detail ?? error.message);
      }
    };
    fetchData();
  }, [search]);

  return (
    <div className="shadow-lg shadow-black/30 overflow-x-auto">
      <table className="table-fixed w-full min-w-180 mt-10 text-[#94A3B8]">
        <thead className="text-[#94A3B8] mt-20 mx-auto">
          <tr>
            <th className="pb-2">ID</th>
            <th className="pb-2">Name</th>
            <th className="pb-2">Phone</th>
            <th className="pb-2">Email</th>
            <th>Role</th>
            <th>Created at</th>
            <th className="pb-2">Actions</th>
          </tr>
          <tr>
            <th colSpan={7}>
              <hr />
            </th>
          </tr>
        </thead>
        <tbody>
          {users.users.length > 0 &&
            users.users.map((item, index) => (
              <TableRow items={item} key={item.id} index={index} id={item.id} />
            ))}
          {users.users.length === 0 && (
            <tr>
              {/* نکته ۳: جدول ۷ ستون داره، پس colSpan هم باید ۷ باشه
                  وگرنه ساختار جدول از نظر HTML نامعتبر می‌شه */}
              <td colSpan={7}>
                <div className="flex justify-center items-center flex-col mt-5">
                  <Inbox size={35} className="text-stone-600" />
                  <p className="mt-1 text-lg text-gray-300">No users found</p>
                  <p className="mt-1 mb-5 text-sm">
                    New users will appear here.
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

export default UserTable;

const TableRow = ({
  id,
  items,
  index,
}: {
  id: number;
  items: UserProps;
  index: number;
}) => {
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
    <tr className={`text-center ${index % 2 === 0 ? "bg-gray-600/10" : ""}`}>
      <td className="py-0.5">
        <button className="underline underline-offset-2 cursor-pointer hover:text-blue-600 hover:scale-120 transition-all">
          {items.id}
        </button>
      </td>
      <td>{items.name}</td>
      <td>{items.phone_number}</td>
      <td className="truncate">{items.email}</td>
      <td>{items.user_type}</td>
      <td>{items.created_at}</td>
      <td className="text-center">
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
                  setOpenEdit(items.id),
                  setIsBlurring(true),
                  setOpen(!open)
                )}
                className="cursor-pointer hover:text-blue-600 w-fit font-semibold text-stone-300/90"
              >
                Edit
              </button>
              <button
                onClick={() => (setOpenDelete(items.id), setIsBlurring(true), setOpen(!open))}
                className="py-2 cursor-pointer hover:text-red-700 font-semibold text-stone-300/90"
              >
                Delete
              </button>
            </div>,
            document.body,
          )}
        {openEdit === id && <EditUserModal item={items} />}
        {openDelete === id && <DeleteUserModal id={items.id} />}
      </td>
    </tr>
  );
};
