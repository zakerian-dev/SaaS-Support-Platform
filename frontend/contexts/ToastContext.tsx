"use client";
import { useState, createContext, useContext } from "react";

interface ToastProps {
  open: boolean;
  message: string;
  type: "success" | "info" | "error";
}

const ToastContext = createContext<{
  toast: ToastProps;
  setToast: React.Dispatch<React.SetStateAction<ToastProps>>;
  isBlurring: boolean;
  setIsBlurring: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openDelete: number | null;
  setOpenDelete: React.Dispatch<React.SetStateAction<number | null>>;
  openEdit: number | null;
  setOpenEdit: React.Dispatch<React.SetStateAction<number | null>>;
} | null>(null);

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<ToastProps>({
    open: false,
    message: "",
    type: "info",
  });
  const [isBlurring, setIsBlurring] = useState(false);
  const [open, setOpen] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<number | null>(null);
  const [openEdit, setOpenEdit] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  return (
    <ToastContext.Provider
      value={{
        toast,
        setToast,
        setIsBlurring,
        isBlurring,
        open,
        setOpen,
        openDelete,
        setOpenDelete,
        openEdit,
        setOpenEdit,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export default ToastProvider;

const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export { ToastProvider, useToast };
