"use client";
import api from "@/lib/api/axios";
import { div } from "framer-motion/client";
import { useEffect, useState } from "react";

interface UserProps {
  id: number;
  name: string;
  phone_number: string;
  email: string;
  company_id: number;
}

const Profile = () => {
  const [data, setData] = useState<UserProps>();
  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get("/users/dashboard");
      const data = res.data;
      setData(data);
    };

    fetchData();
  }, []);
  return (
    <div className="mb-7">
      <div className="text-stone-200 flex gap-6 justify-center items-center mb-5">
        <span className="text-2xl">{data?.name}</span>
        <p className="flex text-sm text-stone-400">{data?.email}</p>
      </div>
      <hr className="w-full border-stone-700" />
    </div>
  );
};

export default Profile;
