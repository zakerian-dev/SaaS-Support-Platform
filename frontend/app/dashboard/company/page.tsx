"use client";
import api from "@/lib/api/axios";
import { motion } from "framer-motion";

import { Factory, FactoryIcon, LucideFactory } from "lucide-react";
import { useEffect, useState } from "react";
import { IoIosAlert } from "react-icons/io";

type TCompany = {
  id: number;
  name: string;
  created_at: string;
};

const page = () => {
  const [company, setCompany] = useState<TCompany>({
    id: 1,
    name: "ABC",
    created_at: "Aug_12",
  });
  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get("/companies/me");
      setCompany(res.data);
    };
    fetchData();
  }, []);
  return (
    <div className="min-h-[calc(100vh-160px)] rounded-2xl shadow-lg shadow-black/30 px-4 sm:px-6 lg:px-8 py-3 relative">
      <h3 className="text-blue-400 text-xs mb-2">COMPANY</h3>
      <h1 className="text-[#F8FAFC] text-2xl sm:text-3xl font-bold tracking-wide">
        Your Company
      </h1>
      <p className="text-[#94A3B8] text-sm mt-2">
        Manage your company information and workspace details
      </p>

      {/* Hero */}
      <div className="w-full flex flex-col sm:flex-row bg-[url('/backgrounds/bg1.png')] bg-cover bg-center mt-8 rounded-2xl border border-blue-800 relative overflow-hidden">
        <div className="absolute w-full h-full bg-[#001835]/90 rounded-2xl" />
        <div className="z-50 flex justify-center sm:justify-start w-full sm:w-auto pt-6 sm:pt-0">
          <FactoryIcon
            size={100}
            className="sm:size-37.5 text-blue-200 border border-blue-600 p-6 sm:p-8 rounded-3xl sm:ml-10 my-5"
          />
        </div>
        {/* Card */}
        <div className="h-full my-auto mx-6 sm:ml-10 sm:mx-0 z-50 pb-6 sm:pb-0 text-center sm:text-left">
          <h2 className="text-[#F8FAFC] text-xl sm:text-2xl mb-1">
            {company.name}
          </h2>
          <div className="flex text-xs items-center justify-center sm:justify-start">
            <div className="h-1 w-1 rounded-full bg-blue-400 mr-1" />
            <p className="text-[#94A3B8]">Innovation</p>
            <div className="h-1 w-1 rounded-full bg-blue-600 mx-1" />
            <p className="text-[#94A3B8]">Support</p>
            <div className="h-1 w-1 rounded-full bg-blue-600 mx-1" />
            <p className="text-[#94A3B8]">Growth</p>
          </div>
          <div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <div className="flex mt-3 border border-blue-900/50 px-4 sm:px-5 py-2 rounded-lg items-center w-full lg:w-fit">
                <LucideFactory size={25} className="text-blue-500 mr-3" />
                <div className="text-left">
                  <p className="text-[#94A3B8] text-xs">Company ID</p>
                  <span className="text-[#F8FAFC]">#{company.id}</span>
                </div>
              </div>
              <div className="flex mt-3 border border-blue-900/50 px-4 sm:px-5 py-2 rounded-lg items-center w-full lg:w-fit">
                <LucideFactory size={25} className="text-blue-500 mr-3" />
                <div className="text-left">
                  <p className="text-[#94A3B8] text-xs">Created At</p>
                  <span className="text-[#F8FAFC]">{company.created_at}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-6 mt-5 gap-5">
        {/* Logo */}
        <div className="md:col-span-2 flex flex-col h-72 sm:h-80 items-center justify-center border border-blue-600 rounded-2xl bg-[#001835] bg-[url('/backgrounds/bg2.png')] bg-cover relative">
          <div className="absolute w-full h-full bg-[#001835]/90 rounded-2xl" />
          <div className="z-50 w-full flex flex-col items-center justify-center px-4">
            <div className="rounded-full h-24 w-24 sm:h-30 sm:w-30 bg-[url('/backgrounds/logo.png')] bg-cover flex justify-center items-center z-50">
              <Factory size={45} className="sm:size-13.75 text-blue-200" />
            </div>
            <h2 className="text-[#F8FAFC] text-lg sm:text-xl mt-4 mb-1 text-center">
              {company.name}
            </h2>
            <div className="flex text-xs items-center flex-wrap justify-center">
              <div className="h-1 w-1 rounded-full bg-blue-400 mr-1" />
              <p className="text-[#94A3B8]">Innovation</p>
              <div className="h-1 w-1 rounded-full bg-blue-600 mx-1" />
              <p className="text-[#94A3B8]">Support</p>
              <div className="h-1 w-1 rounded-full bg-blue-600 mx-1" />
              <p className="text-[#94A3B8]">Growth</p>
            </div>

            {/* Upload Logo */}
            <motion.button className="mt-8 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:inset-shadow-[0_0_30px_rgba(0,92,246,0.3)] w-11/12  py-1 cursor-pointer relative group border border-blue-800/30 overflow-hidden hover:bg-[#082350]/50 hover:border-blue-400/40 delay-0  hover:delay-1500 transition-all duration-500">
              <span className="absolute top-0 -left-full bg-linear-90 from-transparent to-sky-800 h-0.5 w-full group-hover:left-full group-hover:delay-0 transition-all duration-1000 delay-1000"></span>
              <span className="absolute -top-full right-0 bg-linear-180 from-transparent to-sky-800 w-0.5 h-full group-hover:top-full group-hover:delay-350 transition-all duration-1000 delay-750"></span>
              <span className="absolute bottom-0 -right-full bg-linear-270 from-transparent to-sky-800 h-0.5 w-full group-hover:right-full transition-all duration-1000 delay-350 group-hover:delay-750"></span>
              <span className="absolute left-0 -bottom-full bg-linear-360 from-transparent to-sky-800 w-0.5 h-full group-hover:bottom-full transition-all duration-1000 delay-0 group-hover:delay-1000"></span>
              <h3 className="text-md text-[#F8FAFC]">Company Logo</h3>
              <p className="text-[10px] text-[#94A3B8] mt-1">
                JPG , PNG (Max 2MG)
              </p>
            </motion.button>
          </div>
        </div>

        {/* Information */}
        <div className="md:col-span-4 flex flex-col h-auto md:h-80 items-center border border-blue-600 rounded-2xl bg-[#001835] bg-[url('/backgrounds/bg1.png')] bg-center bg-cover relative">
          <div className="absolute w-full h-full bg-[#001835]/70 rounded-2xl" />
          <div className="z-50 flex flex-col items-center w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between w-full pt-6 sm:pt-8 px-4 sm:px-10 gap-2">
              <h2 className="text-[#F8FAFC] text-lg sm:text-xl font-semibold">
                Company Information
              </h2>
              <div className="bg-[#0b1c33]/20 rounded-2xl text-blue-300 p-2 flex gap-1 border border-blue-900 h-fit self-start sm:self-auto">
                <IoIosAlert />
                <span className="text-xs">Read Only</span>
              </div>
            </div>
            <hr className="w-11/12 text-blue-800 mt-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 w-full pt-4 px-4 sm:px-10 mb-3 gap-1">
              <h2 className="text-[#94A3B8] text-sm sm:text-base">
                Company Name
              </h2>
              <p className="text-[#F8FAFC] text-sm">{company.name}</p>
            </div>
            <hr className="w-11/12 text-blue-800" />
            <div className="grid grid-cols-1 sm:grid-cols-2 w-full pt-4 px-4 sm:px-10 mb-3 gap-1">
              <h2 className="text-[#94A3B8] text-sm sm:text-base">
                Company ID
              </h2>
              <p className="text-[#F8FAFC] text-sm">#{company.id}</p>
            </div>
            <hr className="w-11/12 text-blue-800" />
            <div className="grid grid-cols-1 sm:grid-cols-2 w-full pt-4 pb-4 px-4 sm:px-10 gap-1">
              <h2 className="text-[#94A3B8] text-sm sm:text-base">
                Company AT
              </h2>
              <p className="text-[#F8FAFC] text-sm">{company.created_at}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
