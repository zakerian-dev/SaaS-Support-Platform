"use client";
import { useToast } from "@/contexts/ToastContext";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api/axios";

const DeleteUserModal = ({ id }: { id: number }) => {
  const { setIsBlurring, setToast, setOpenDelete, setIsLoading } = useToast();

  const deleteUser = async (id: number) => {
    setOpenDelete(null);
    setIsLoading(true);

    try {
      const res = await api.delete(`/users/delete/${id}`);

      if (res.status === 204) {
        localStorage.setItem("userDeletedToast", "User deleted successfully");

        window.location.href = "/dashboard/users";
      }
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
    }
  };
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="bg-[#09172e] w-full max-w-lg border border-[#334155] rounded-2xl text-left">
        <form className="p-6 sm:p-8">
          <div className="flex flex-row w-full">
            <div className="w-full">
              <h1 className="text-white text-xl">Delete User</h1>
              <p className="text-[#94A3B8] text-sm mt-2 mb-10">
                Are you sure you want to delete this user?
              </p>
            </div>
            <X
              className="text-white hover:scale-110 cursor-pointer"
              size={30}
              onClick={() => (setOpenDelete(null), setIsBlurring(false))}
            />
          </div>
        </form>
        <hr className="w-full max-w-lg mb-10 text-[#334155]" />
        <div className="flex items-center justify-end px-5 space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 120 }}
            onClick={() => (setOpenDelete(null), setIsBlurring(false))}
            className="border border-[#334155] text-[#F8FAFC] mb-5 py-2.5 px-8 rounded-lg cursor-pointer"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 120 }}
            onClick={() => deleteUser(id)}
            className="text-[#F8FAFC] text-center mb-5 bg-[#920f0f] rounded-lg py-2.5 px-8 font-medium text-lg cursor-pointer"
          >
            Delete
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
