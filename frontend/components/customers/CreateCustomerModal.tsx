"use client";
import { useToast } from "@/contexts/ToastContext";
import { Mail, Phone, User, X } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api/axios";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CreateCustomerModal = () => {
  const { setOpen, setIsBlurring, setToast, setIsLoading } = useToast();
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [phone_number, setPhone_number] = useState<string | null>(null);

  const createCustomer = async () => {
    try {
      setIsLoading(true);
      setOpen(false);
      await api.post("/customers", {
        name: name,
        phone_number: phone_number,
        email: email,
      });
      setToast({
        open: true,
        type: "success",
        message: "Customer created successfully",
      });
      setTimeout(() => {
        window.location.href = "/dashboard/customers";

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
    }
  };
  return (
    <div className="fixed z-60 top-1/6 left-1/3">
      <div className="bg-[#09172e] w-160 border border-[#334155] rounded-2xl">
        <form className="p-8">
          <div>
            <X
              className="text-white absolute right-10 hover:scale-110 cursor-pointer"
              size={30}
              onClick={() => (setOpen(false), setIsBlurring(false))}
            />
            <h1 className="text-white text-xl">Create New Customer</h1>
            <p className="text-[#94A3B8] text-sm mt-2 mb-10">
              Fill in the details below to create new customer.
            </p>
          </div>
          <label className="text-[#F8FAFC]">Name</label>
          <div className="relative flex items-center mb-5">
            <User className="absolute text-blue-300/50 left-3" size={20} />
            <input
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Enter customer's name"
              className="outline-none focus:border-blue-700 bg-black/30 px-10 py-2 text-stone-300 text-sm rounded-lg border border-[#334155] w-full my-3"
            />
          </div>
          <label className="text-[#F8FAFC]">Phone Number</label>
          <div className="relative flex items-center mb-5">
            <Phone className="absolute text-blue-300/50 left-3" size={20} />
            <input
              onChange={(e) => setPhone_number(e.target.value)}
              type="number"
              placeholder="Enter customer's phone number"
              className="outline-none focus:border-blue-700 bg-black/30 px-10  py-2 text-stone-300 text-sm rounded-lg border border-[#334155] w-full my-3"
            />
          </div>
          <label className="text-[#F8FAFC]">Email</label>
          <div className="relative flex items-center">
            <Mail className="absolute text-blue-300/50 left-3" size={20} />
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              placeholder="Enter customer's email address"
              className="outline-none focus:border-blue-700 bg-black/30 px-10 py-2 text-stone-300 text-sm rounded-lg border border-[#334155] w-full my-3"
            />
          </div>
        </form>
        <hr className="w-full mb-10 text-[#334155]" />
        <div className="flex items-center justify-end px-5 space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 120 }}
            onClick={() => (setOpen(false), setIsBlurring(false))}
            className="border border-[#334155] text-[#F8FAFC] mb-5 py-2.5 px-8 rounded-lg cursor-pointer"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 120 }}
            onClick={createCustomer}
            className="text-[#F8FAFC] text-center mb-5 bg-[#0f3892] rounded-lg py-2.5 px-8 font-medium text-lg cursor-pointer"
          >
            Create Customer
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomerModal;
