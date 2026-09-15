"use client";
import { useToast } from "@/contexts/ToastContext";
import { Mail, Phone, User, X } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api/axios";

const DeleteCommentModal = ({
  ticketId,
  commentId,
  onClose,
}: {
  ticketId: string;
  commentId: number;
  onClose: () => void;
}) => {
  const { setIsBlurring, setToast, setIsLoading } = useToast();

  const deleteComment = async (commentId: number) => {
    onClose();
    setIsLoading(true);
    try {
      const res = await api.delete(
        `/tickets/${ticketId}/comments/${commentId}`,
      );
      setToast({
        open: true,
        type: "info",
        message: "Comment is deleting",
      });
      setTimeout(() => {
        if (res.status == 204) {
          localStorage.setItem("deleteComment", "Comment deleted successfully");
        }
        window.location.href = `/dashboard/tickets/${ticketId}`;
        setIsLoading(false);
        setIsBlurring(false);
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
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setIsBlurring(false);
      }, 3000);
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
              onClick={() => (onClose(), setIsBlurring(false))}
            />
            <h1 className="text-white text-xl">Delete Comment</h1>
            <p className="text-[#94A3B8] text-sm mt-2 mb-10">
              Are you sure you want to delete this comment?
            </p>
          </div>
        </form>
        <hr className="w-full mb-10 text-[#334155]" />
        <div className="flex items-center justify-end px-5 space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 120 }}
            onClick={() => (onClose(), setIsBlurring(false))}
            className="border border-[#334155] text-[#F8FAFC] mb-5 py-2.5 px-8 rounded-lg cursor-pointer"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 120 }}
            onClick={() => deleteComment(commentId)}
            className="text-[#F8FAFC] text-center mb-5 bg-[#920f0f] rounded-lg py-2.5 px-8 font-medium text-lg cursor-pointer"
          >
            Delete Comment
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCommentModal;
