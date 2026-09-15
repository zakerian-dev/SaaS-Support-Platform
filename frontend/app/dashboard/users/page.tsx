"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Plus, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserTable from "@/components/users/UserTable";
import { useToast } from "@/contexts/ToastContext";
import CreateUserModal from "@/components/users/CreateUserModal";

const UsersPage = () => {
  const { open, setOpen, setIsBlurring, isBlurring, isLoading, setToast } =
    useToast();
  const [search, setSearch] = useState<string>("");

  const handleOpenCreateModal = () => {
    setOpen(true);
    setIsBlurring(true);
  };

  useEffect(() => {
    const deletedMessage = localStorage.getItem("userDeletedToast");
    const createdMessage = localStorage.getItem("userCreatedToast");
    const editedMessage = localStorage.getItem("userEditToast");

    if (deletedMessage) {
      setToast({
        open: true,
        type: "success",
        message: deletedMessage,
      });
      localStorage.removeItem("userDeletedToast");
    }

    if (createdMessage) {
      setToast({
        open: true,
        type: "success",
        message: createdMessage,
      });
      localStorage.removeItem("userCreatedToast");
    }

    if (editedMessage) {
      setToast({
        open: true,
        type: "success",
        message: editedMessage,
      });
      localStorage.removeItem("userEditToast");
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-160px)] w-full rounded-2xl shadow-lg shadow-black/30 px-4 sm:px-6 lg:px-8 py-4 relative">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[#F8FAFC] text-2xl sm:text-3xl font-bold tracking-wide">
          Users
        </h1>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <label className="relative flex items-center w-full sm:w-64">
            <Search
              className="text-stone-500 absolute left-3 pointer-events-none"
              size={15}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-stone-300 outline-none pl-9 pr-3 py-2 bg-blue-600/20 rounded-2xl w-full transition-colors focus:border focus:border-blue-700"
              placeholder="Search by username..."
              aria-label="Search users by username"
            />
          </label>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 120 }}
            onClick={handleOpenCreateModal}
            className="text-[#F8FAFC] px-5 py-2 bg-blue-600/50 hover:bg-blue-600/70 rounded-2xl cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors shrink-0"
          >
            <Plus size={15} />
            <span>Create new user</span>
          </motion.button>
        </div>
      </div>

      <hr className="w-full border-stone-700 mt-5" />

      {/* Table */}
      <div className="mt-4 overflow-x-auto shadow-lg shadow-black/30">
        <UserTable search={search} />
      </div>
      <AnimatePresence>{open && <CreateUserModal />}</AnimatePresence>

      {isLoading && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <LoaderCircle
            size={70}
            className="animate-spin text-blue-700"
            aria-label="Loading"
          />
        </div>
      )}
      {isBlurring && <div className="fixed inset-0 z-50 backdrop-blur-md" />}
    </div>
  );
};

export default UsersPage;
