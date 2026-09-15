"use client";
import { useToast } from "@/contexts/ToastContext";
import {
  Check,
  ChevronDown,
  Lock,
  Mail,
  Phone,
  ShieldAlert,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api/axios";
import { useState } from "react";

const ROLE_OPTIONS = [
  { value: "member", label: "member" },
  { value: "admin", label: "admin" },
];

const CreateUserModal = () => {
  const { setOpen, setIsBlurring, setToast, setIsLoading } = useToast();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone_number, setPhone_number] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [selectrole, setSelectrole] = useState<boolean>(false);

  const closeModal = () => {
    setOpen(false);
    setIsBlurring(false);
  };

  const createCustomer = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setIsLoading(true);

      const res = await api.post("/users/create_user", {
        name,
        phone_number,
        email,
        user_type: role,
        password,
      });
      if (res.status === 201) {
        localStorage.setItem("userCreatedToast", "User created successfully");

        window.location.href = "/dashboard/users";
      }

      setOpen(false);
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
        <form className="p-5 sm:p-8" onSubmit={(e) => e.preventDefault()}>
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
              Create New User
            </h1>
            <p className="text-[#94A3B8] text-sm mt-2">
              Fill in the details below to create new user.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="text-[#F8FAFC] text-sm">
                Name
              </label>
              <div className="relative flex items-center mt-2">
                <User className="absolute text-blue-300/50 left-3" size={18} />
                <input
                  id="name"
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  autoComplete="name"
                  placeholder="Enter username"
                  className="outline-none focus:border-blue-600 bg-black/30 pl-10 pr-3 py-2.5 text-stone-200 text-sm rounded-lg border border-[#334155] w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-[#F8FAFC] text-sm">
                Password
              </label>
              <div className="relative flex items-center mt-2">
                <Lock className="absolute text-blue-300/50 left-3" size={18} />
                <input
                  id="password"
                  name="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter user's password"
                  className="outline-none focus:border-blue-600 bg-black/30 pl-10 pr-3 py-2.5 text-stone-200 text-sm rounded-lg border border-[#334155] w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="text-[#F8FAFC] text-sm">
                Phone Number
              </label>
              <div className="relative flex items-center mt-2">
                <Phone className="absolute text-blue-300/50 left-3" size={18} />
                <input
                  id="phone"
                  name="phone_number"
                  required
                  value={phone_number}
                  onChange={(e) => setPhone_number(e.target.value)}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10,15}"
                  autoComplete="tel"
                  placeholder="Enter user's phone number"
                  className="outline-none focus:border-blue-600 bg-black/30 pl-10 pr-3 py-2.5 text-stone-200 text-sm rounded-lg border border-[#334155] w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-[#F8FAFC] text-sm">
                Email
              </label>
              <div className="relative flex items-center mt-2">
                <Mail className="absolute text-blue-300/50 left-3" size={18} />
                <input
                  id="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="Enter user's email address"
                  className="outline-none focus:border-blue-600 bg-black/30 pl-10 pr-3 py-2.5 text-stone-200 text-sm rounded-lg border border-[#334155] w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-[#F8FAFC] text-sm">Role</label>
              <button
                type="button"
                onClick={() => setSelectrole(!selectrole)}
                className="w-full flex items-center justify-between bg-black/20 backdrop-blur-md border border-white/10 hover:border-blue-400/40 
                focer:border-blue-500/60 text-white/60 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer mt-2"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-blue-300/50" size={18} />
                  <span>{role || "Select role"}</span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-white/40 transition-transform duration-200 ${
                    selectrole ? "rotate-180" : ""
                  }`}
                />
              </button>
              {selectrole && (
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
                      role === opt.value
                        ? "bg-blue-500/10 text-blue-300"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }
                  `}
                      onClick={() => {
                        setRole(opt.value);
                        setSelectrole(false);
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
            onClick={createCustomer}
            className="text-[#F8FAFC] text-center bg-[#0f3892] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg py-2.5 px-8 font-medium text-base sm:text-lg cursor-pointer"
          >
            {submitting ? "Creating..." : "Create User"}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;
