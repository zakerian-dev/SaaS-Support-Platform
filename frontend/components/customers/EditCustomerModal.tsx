"use client";
import { useToast } from "@/contexts/ToastContext";
import { Mail, Phone, User, X } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api/axios";
import { useState } from "react";
import { CustomerProps } from "@/app/dashboard/page";

const EditCustomerModal = ({ item }: { item: CustomerProps }) => {
  const { setIsBlurring, setToast, setIsLoading, setOpenEdit } = useToast();
  const [name, setName] = useState<string | null>(item.name);
  const [email, setEmail] = useState<string | null>(item.email);
  const [phone_number, setPhone_number] = useState<string | null>(
    item.phone_number,
  );

  const editCustomer = async (id: number) => {
    setIsBlurring(true);
    try {
      setIsLoading(true);
      setOpenEdit(null);
      const res = await api.patch(`/customers/${id}`, {
        name: name,
        phone_number: phone_number,
        email: email,
      });
      setToast({
        open: true,
        type: "success",
        message: "Customer Edited successfully",
      });
      setTimeout(() => {
        window.location.href = "/dashboard/customers";
        setIsBlurring(false);
        setIsLoading(false);
      }, 3000);
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
        className="bg-[#09172e] w-full max-w-lg border border-[#334155] rounded-2xl my-8 
      max-h-[90vh] overflow-y-auto text-left"
      >
        <form className="p-5 sm:p-8">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-white text-lg sm:text-xl">Edit Customer</h1>
              <p className="text-[#94A3B8] text-sm mt-2">
                Fill whichone you like to update.
              </p>
            </div>
            <X
              className="text-white hover:scale-110 cursor-pointer shrink-0 ml-3"
              size={30}
              onClick={() => (setOpenEdit(null), setIsBlurring(false))}
            />
          </div>

          <div className="mt-6 space-y-5">
            <div>
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
            </div>
            
            <div>
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
            </div>

            <div>
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
            </div>

          </div>
        </form>
        <hr className="w-full text-[#334155]" />
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center 
        justify-end gap-3 p-5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 120 }}
            onClick={() => (setOpenEdit(null), setIsBlurring(false))}
            className="border border-[#334155] text-[#F8FAFC] mb-5 py-2.5 px-8 rounded-lg 
            cursor-pointer text-center"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 120 }}
            onClick={() => editCustomer(item.id)}
            className="text-[#F8FAFC] text-center mb-5 bg-[#0f3892] rounded-lg py-2.5 
            px-8 font-medium text-lg cursor-pointer"
          >
            Edit Customer
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerModal;
