"use client";
import { useToast } from "@/contexts/ToastContext";
import { Mail, Phone, Text, User, X } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api/axios";
import { useState } from "react";
import { CustomerProps } from "@/app/dashboard/page";

interface CommentProps {
  comments: [];
  page: number;
  total_page: number;
  total_comments: number;
}

const EditCommentModal = ({
  commentId,
  ticketId,
  onClose,
}: {
  commentId: number;
  ticketId: string;
  onClose: () => void;
}) => {
  const { setIsBlurring, setToast, setIsLoading, setOpenEdit } = useToast();
  const [content, setContent] = useState<string | null>(null);

  const editComment = async (commentId: number, ticketId: string) => {
    setIsBlurring(true);
    try {
      setIsLoading(true);
      setOpenEdit(null);
      const res = await api.patch(
        `/tickets/${ticketId}/comments/${commentId}`,
        {
          content,
        },
      );
      setToast({
        open: true,
        type: "info",
        message: "Comment is editing.",
      });
      setTimeout(() => {
        if (res.status === 200) {
          localStorage.setItem("editComment", "Comment edited successfully!");
        }
        window.location.href = `/dashboard/tickets/${ticketId}`;
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
              <h1 className="text-white text-lg sm:text-xl">Edit Comment</h1>
              <p className="text-[#94A3B8] text-sm mt-2">Update your Comment</p>
            </div>
            <X
              className="text-white hover:scale-110 cursor-pointer shrink-0 ml-3"
              size={30}
              onClick={() => (onClose(), setIsBlurring(false))}
            />
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label className="text-[#F8FAFC]">New Content</label>
              <div className="relative flex items-center mb-5">
                <Text className="absolute text-blue-300/50 left-3" size={20} />
                <input
                  onChange={(e) => setContent(e.target.value)}
                  type="text"
                  placeholder="Edit your comment..."
                  className="outline-none focus:border-blue-700 bg-black/30 px-10 py-2 text-stone-300 text-sm rounded-lg border border-[#334155] w-full my-3"
                />
              </div>
            </div>
          </div>
        </form>
        <hr className="w-full text-[#334155]" />
        <div
          className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center 
        justify-end gap-3 p-5"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 120 }}
            onClick={() => (onClose(), setIsBlurring(false))}
            className="border border-[#334155] text-[#F8FAFC] mb-5 py-2.5 px-8 rounded-lg 
            cursor-pointer text-center"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 120 }}
            onClick={() => (editComment(commentId, ticketId), onClose())}
            className="text-[#F8FAFC] text-center mb-5 bg-[#0f3892] rounded-lg py-2.5 
            px-8 font-medium text-lg cursor-pointer"
          >
            Edit Comment
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default EditCommentModal;
