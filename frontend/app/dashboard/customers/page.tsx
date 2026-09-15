"use client";
import { LoaderCircle, Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import CustomersTable from "@/components/customers/CustomersTable";
import CreateCustomerModal from "@/components/customers/CreateCustomerModal";
import { useToast } from "@/contexts/ToastContext";
import { useState } from "react";

const page = () => {
  const { open, setOpen, setIsBlurring, isBlurring, isLoading } = useToast();
  const [search, setSearch] = useState<string>("");
  const createCustomer = () => {
    setOpen(true);
    setIsBlurring(true);
  };
  return (
    <div className="min-h-[calc(100vh-160px)] rounded-2xl shadow-lg shadow-black/30 px-8 py-3 relative">
      <h1 className="text-[#F8FAFC] text-3xl  font-bold tracking-wide">
        Customers
      </h1>
      <hr className="w-full border-stone-700 mt-5" />
      <div className="flex justify-end space-x-2 flex-col md:flex-row">
        <div className="flex items-center mt-4 w-fit relative">
          <Search className="text-stone-500 absolute left-3" size={15} />
          <input
            type="search"
            className="text-stone-300 outline-none px-8 py-2 bg-blue-600/20 rounded-2xl w-fit focus:border focus:border-blue-600"
            placeholder="Search ..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="text-[#F8FAFC] flex items-center mt-4 justify-end w-fit">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 120 }}
            onClick={createCustomer}
            className="px-5 py-2 bg-blue-600/50 rounded-2xl cursor-pointer flex items-center space-x-1"
          >
            <Plus size={15} />
            <span>Create new customer</span>
          </motion.button>
        </div>
      </div>
      <div className="overflow-x-auto shadow-lg shadow-black/30">
        <CustomersTable search={search} />
      </div>
      {open && <CreateCustomerModal />}
      {isBlurring && <div className="fixed inset-0 z-50 backdrop-blur-md" />}
      {isLoading && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <LoaderCircle size={70} className="animate-spin text-blue-700" />
        </div>
      )}
    </div>
  );
};

export default page;
