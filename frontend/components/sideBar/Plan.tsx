"use client"
import { useToast } from "@/contexts/ToastContext";
import { removeToken } from "@/lib/api/storage";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Plan = () => {
    const { setToast, setIsBlurring, isBlurring } = useToast();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter()
    const logout = () => {
        try {
            setIsBlurring(true)
            setToast({
                open: true,
                message: "Transfering to login page",
                type: "info"
            })
            setTimeout(() => {
                setIsBlurring(false)
                removeToken()
                router.push("/login")
            }, 5000);
        } catch (error) {
            
        }
    }
  return (
    <div className="mt-15 relative mx-6 lg:mx-0">
      <motion.button
      whileHover={{scale: 1.05}}
      whileTap={{scale: .95}}
      transition={{type: "spring", stiffness: 120}}
      onClick={logout}
      className="w-full absolute lg:translate-0 px-4 py-2 bg-blue-600/50 text-[#F8FAFC] font-semibold bottom-0 rounded-lg cursor-pointer">
        Log out
      </motion.button>
    </div>
  );
};

export default Plan;
