"use client";
import { useToast } from "@/contexts/ToastContext";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const ToastColor = {
  success: "bg-green-300/10 text-green-700 border-green-900",
  info: "bg-sky-300/10 text-sky-700 border-sky-900",
  error: "bg-red-300/10 text-red-700 border-red-900",
};

const Toast = () => {
  const { toast, setToast, setIsBlurring } = useToast();
  useEffect(() => {
    if (!toast.open) return;

    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.open, setToast]);

  const handleX = () => {
    setToast((prev) => ({ ...prev, open: false }));
    setIsBlurring(false);
  };
  return (
    <AnimatePresence mode="wait">
      {toast.open && (
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed right-5 bottom-5 py-2 pr-3 pl-5 rounded-2xl flex border ${ToastColor[toast.type]} z-60`}
        >
          {toast.message}
          <motion.button
            onClick={handleX}
            className="ml-4  top-1/2 cursor-pointer hover:ring rounded-4xl transition-all"
          >
            <X size={20} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default Toast;
