"use client";
import { useToast } from "@/contexts/ToastContext";
import {
  Check,
  ChevronDown,
  Mail,
  Phone,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api/axios";
import { useState } from "react";
import { CustomerProps, UserProps } from "@/app/dashboard/page";

const ROLE_OPTIONS = [
  { value: "member", label: "member" },
  { value: "admin", label: "admin" },
];

const EditUserModal = ({ item }: { item: UserProps }) => {
  const { setIsBlurring, setToast, setIsLoading, setOpenEdit } = useToast();
  const [name, setName] = useState<string | null>(item.name);
  const [email, setEmail] = useState<string | null>(item.email);
  const [phone_number, setPhone_number] = useState<string | null>(
    item.phone_number,
  );
  const [password, setPassword] = useState<string>(item.password);
  const [role, setRole] = useState<string>(item.user_type);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const editCustomer = async (id: number) => {
    setIsBlurring(true);
    try {
      setIsLoading(true);
      setOpenEdit(null);
      const res = await api.patch(`/users/${id}`, {
        name: name,
        phone_number: phone_number,
        email: email,
        password: password,
        user_type: role,
      });
      setToast({
        open: true,
        type: "success",
        message: "User edited successfully",
      });
      if (res.status === 200) {
        localStorage.setItem("userEditToast", "User edited successfully");

        window.location.href = "/dashboard/users";
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
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-[#09172e]/95 w-full max-w-lg border border-[#334155] rounded-2xl my-8 
      max-h-[90vh] overflow-y-auto"
      >
        <form className="p-5 sm:p-8">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-white text-lg sm:text-xl text-left">
                Edit User
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
              <label className="text-[#F8FAFC] text-sm">Name</label>
              <div className="relative flex items-center mt-2">
                <User className="absolute text-blue-300/50 left-3" size={20} />
                <input
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Enter user's name"
                  className="outline-none focus:border-blue-700 bg-black/30 px-10 py-2.5 
                  text-stone-300 text-sm rounded-lg border border-[#334155] w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-[#F8FAFC] text-sm">Password</label>
              <div className="relative flex items-center mt-2">
                <User className="absolute text-blue-300/50 left-3" size={20} />
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  type="text"
                  placeholder="Enter user's password"
                  className="outline-none focus:border-blue-700 bg-black/30 px-10 py-2.5 text-stone-300 text-sm rounded-lg border 
                  border-[#334155] w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-[#F8FAFC] text-sm">Phone Number</label>
              <div className="relative flex items-center mt-2">
                <Phone className="absolute text-blue-300/50 left-3" size={20} />
                <input
                  onChange={(e) => setPhone_number(e.target.value)}
                  type="number"
                  placeholder="Enter customer's phone number"
                  className="outline-none focus:border-blue-700 bg-black/30 px-10 py-2.5 text-stone-300 text-sm rounded-lg border 
                  border-[#334155] w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-[#F8FAFC] text-sm">Email</label>
              <div className="relative flex items-center mt-2">
                <Mail className="absolute text-blue-300/50 left-3" size={20} />
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  type="text"
                  placeholder="Enter customer's email address"
                  className="outline-none focus:border-blue-700 bg-black/30 px-10 py-2.5 text-stone-300 text-sm rounded-lg border 
                  border-[#334155] w-full"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-[#F8FAFC] text-sm">Role</label>
              <button
                type="button"
                className="mt-2 w-full flex items-center justify-between bg-black/20 backdrop-blur-md border border-white/10 
                hover:border-blue-400/40 focus:border-blue-500/60 
                text-white/60 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-blue-300/50" />
                  <span>{role || "Select the role"}</span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-white/40 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-white/10
                    bg-[#0b1a33] backdrop-blur-md shadow-xl shadow-black/20 p-1"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      className={`
                        w-full flex justify-between text-left px-3 py-2.5 rounded-md text-sm
                        transition-colors duration-150
                        cursor-pointer
                        ${
                          role === opt.value
                            ? "bg-blue-500/10 text-blue-300"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }
                      `}
                      onClick={() => {
                        setRole(opt.value);
                        setIsOpen(false);
                      }}
                      key={opt.value}
                    >
                      {opt.label}
                      {role === opt.value && (
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

export default EditUserModal;
