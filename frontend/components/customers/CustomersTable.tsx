"use client";
import { CustomerProps, CustomerRawData } from "@/app/dashboard/page";
import { useToast } from "@/contexts/ToastContext";
import api from "@/lib/api/axios";
import { Ellipsis, Inbox } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import DeleteCustomerModal from "./DeleteCustomerModal";
import EditCustomerModal from "./EditCustomerModal";

const CustomersTable = ({ search }: { search: string }) => {
  const [customers, setCustomers] = useState<CustomerRawData>({
    page: 1,
    total_page: 1,
    customers: [],
    total_customers: 0,
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (search !== "") {
          const res = await api.get(`/customers?search=${search}`);
          setCustomers(res.data);
        } else {
          const res = await api.get("/customers");
          setCustomers(res.data);
        }
      } catch (error: any) {
        console.log(error.response.data.detail);
      }
    };
    fetchData();
  }, [search]);
  return (
    <div className="shadow-lg shadow-black/30">
      <table className="table-fixed w-full mt-10 text-[#94A3B8] min-w-180">
        <thead className="text-[#94A3B8] mt-20 mx-auto">
          <tr>
            <th className="pb-2">ID</th>
            <th className="pb-2">Name</th>
            <th className="pb-2">Phone</th>
            <th className="pb-2">Email</th>
            <th className="pb-2">Actions</th>
          </tr>
          <tr>
            <th colSpan={5}>
              <hr />
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.customers.length > 0 &&
            customers.customers.map((item, index) => (
              <TableRow items={item} key={index} index={index} id={item.id} />
            ))}
          {customers.customers.length === 0 && (
            <tr>
              <td colSpan={5}>
                <div className="flex justify-center items-center flex-col mt-5">
                  <Inbox size={35} className="text-stone-600" />
                  <p className="mt-1 text-lg text-gray-300">
                    No customers found
                  </p>
                  <p className="mt-1 mb-5 text-sm">
                    New customers will appear here.
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

export default CustomersTable;

const TableRow = ({
  id,
  items,
  index,
}: {
  id: number;
  items: CustomerProps;
  index: number;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const {
    setIsBlurring,

    setOpenDelete,
    setOpenEdit,
    openDelete,
    openEdit,
  } = useToast();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
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

  return (
    <tr className={`text-center ${index % 2 === 0 ? "bg-gray-600/10" : ""}`}>
      <td className="py-0.5">
        <button className="underline underline-offset-2 cursor-pointer hover:text-blue-600 hover:scale-120 transition-all">
          {items.id}
        </button>
      </td>
      <td>{items.name}</td>
      <td>{items.phone_number}</td>
      <td>{items.email}</td>
      <td className="text-center">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="cursor-pointer hover:scale-120 hover:text-blue-600 transition-all outline-none"
        >
          <Ellipsis />
        </button>
        {open && (
          <div
            ref={wrapperRef}
            className="w-30 border border-[#334155] absolute right-0 z-20 rounded-lg bg-[#09172e] flex flex-col items-center"
          >
            <h3 className="text-stone-500 pt-2 pb-3">Actions</h3>
            <hr className="mb-3 w-full text-[#334155]" />
            <button
              onClick={() => (setOpenEdit(items.id), setIsBlurring(true))}
              className="cursor-pointer hover:text-blue-600 w-fit font-semibold"
            >
              Edit
            </button>
            <button
              onClick={() => (setOpenDelete(items.id), setIsBlurring(true))}
              className="py-2 cursor-pointer hover:text-red-700 font-semibold"
            >
              Delete
            </button>
          </div>
        )}
        {openDelete === id && (
          <div className="w-30 h-30 border border-[#334155] absolute rounded-lg bg-[#09172e] text-left">
            <DeleteCustomerModal id={id} />
          </div>
        )}
        {openEdit === id && <EditCustomerModal item={items} />}
      </td>
    </tr>
  );
};
