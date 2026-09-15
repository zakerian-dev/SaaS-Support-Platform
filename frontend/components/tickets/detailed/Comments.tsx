"use client";
import { IMe, ITicket } from "@/app/dashboard/tickets/[id]/page";
import api from "@/lib/api/axios";
import { EllipsisVertical, Inbox, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaComment } from "react-icons/fa6";
import { motion } from "framer-motion";
import { useToast } from "@/contexts/ToastContext";
import DeleteCommentModal from "@/components/comments/DeleteCommentModal";
import EditCommentModal from "@/components/comments/EditCommentModal";

type TComment = {
  id: number;
  content: string;
  user_id: number;
  ticket_id: number;
  created_at: string;
  updated_at: string | null;
  user: {
    id: number;
    name: string;
    user_type: string;
  };
};

type RawComment = {
  page: number;
  total_page: number;
  total_comments: number;
  comments: TComment[];
};

export function formatCommentDate(createdAt: string) {
  const created = new Date(createdAt);
  const now = new Date();

  const diff = now.getTime() - created.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (diff < 1000 * 60) {
    return "Just Now";
  }

  if (hours < 24) {
    if (hours === 0) {
      return `${minutes}m ago`;
    }

    return `${hours}h ago`;
  }

  return created.toLocaleDateString("fa-IR");
}

const Comments = ({
  ticket,
  id,
  me,
}: {
  ticket: ITicket;
  id: string;
  me?: IMe;
}) => {
  const [comments, setComments] = useState<RawComment>({
    page: 1,
    total_comments: 0,
    total_page: 1,
    comments: [],
  });
  const [content, setContent] = useState<string | null>(null);
  const { setToast, setIsBlurring, setIsLoading } = useToast();
  const [openCommentId, setOpenCommentId] = useState<number | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const dropdownref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const editComment = localStorage.getItem("editComment");
    const deleteComment = localStorage.getItem("deleteComment");

    if (deleteComment) {
      setToast({
        open: true,
        message: deleteComment,
        type: "success",
      });

      localStorage.removeItem("deleteComment");
    }

    if (editComment) {
      setToast({
        open: true,
        message: editComment,
        type: "success",
      });

      localStorage.removeItem("editComment");
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownref.current &&
        !dropdownref.current.contains(event.target as Node)
      ) {
        setOpenCommentId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/tickets/${id}/comments`);
        setComments(res.data);
      } catch (error) {}
    };
    fetchData();
  }, []);

  const handlePostComment = async () => {
    setIsBlurring(true);
    try {
      setIsLoading(true);
      const post = await api.post(`/tickets/${id}/comments`, {
        content: content,
      });
      setToast({
        open: true,
        message: "Posting the comment",
        type: "info",
      });
      if (post.status == 201) {
        localStorage.setItem("postingComment", "Comment posted successfully");

        setTimeout(() => {
          window.location.href = `/dashboard/tickets/${ticket.id}`;
        }, 3000);
      }
    } catch (error: any) {
      console.log(error.response?.data);
    }
  };
  return (
    <div className="flex flex-col mt-5 border border-blue-400/40 bg-[url('/backgrounds/bg2.png')] bg-cover rounded-2xl relative shadow-2xl/50 min-h-136.5">
      <div className="w-full h-full absolute bg-[#00112b]/90 rounded-2xl" />
      <div className="flex flex-wrap items-center justify-between gap-2 p-4 sm:p-5">
        <div className="flex items-center gap-3 z-50">
          <FaComment className="text-blue-400/60" />
          <h2 className="text-primary text-xl sm:text-2xl font-semibold">
            Comments
          </h2>
        </div>
        <div className="pb-1.5 rounded-full border border-blue-400/40 bg-blue-600/40 h-fit px-4 py-1 text-blue-400 text-xs z-50">
          {comments.total_comments} Comments
        </div>
      </div>
      <hr className="w-11/12 text-blue-600/30 mx-auto z-50 relative mb-3" />
      {comments.total_comments === 0 ? (
        <div className="flex justify-center items-center flex-col z-50 my-auto ">
          <Inbox size={35} className="text-stone-600 z-50" />
          <p className="mt-1 text-lg text-gray-300 z-50">No comments found</p>
          <p className="mt-1 mb-5 text-sm text-secondary z-50">
            New comments will appear here.
          </p>
        </div>
      ) : (
        <div>
          {comments.comments.map((item, index) => (
            <div key={index}>
              <div className="flex text-primary p-4 sm:p-5 z-50 relative gap-3 sm:gap-5">
                <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-full bg-blue-900 border border-blue-200/20 text-base sm:text-xl text-primary items-center flex justify-center">
                  {item.user.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toLocaleUpperCase()}
                </div>

                <div className="w-full min-w-0">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:gap-10 justify-between">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-10">
                      <h2 className="text-primary text-base sm:text-xl font-semibold">
                        {item.user.name}
                      </h2>
                      <span className="text-blue-400/60 text-shadow-lg text-shadow-blue-900 text-sm sm:text-base">
                        {item.user.user_type.slice(0, 1).toUpperCase() +
                          item.user.user_type.slice(1)}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-3 sm:gap-5 relative"
                      ref={openCommentId === item.id ? dropdownref : null}
                    >
                      <span className="text-xs sm:text-sm text-blue-200/50 text-shadow-lg/80 text-shadow-blue-800">
                        {formatCommentDate(item.created_at)}
                      </span>
                      <EllipsisVertical
                        onClick={() =>
                          setOpenCommentId((prev) =>
                            prev === item.id ? null : item.id,
                          )
                        }
                        className="cursor-pointer"
                      />
                      {openCommentId === item.id && (
                        <div className="absolute right-0 top-7 z-100 w-32 rounded-xl border border-blue-400/30 bg-[#001b3d] p-2 shadow-xl">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            onClick={() => (
                              setEditCommentId(item.id),
                              setDeleteCommentId(null),
                              setOpenCommentId(null),
                              setIsBlurring(true)
                            )}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-primary hover:bg-blue-500/20 cursor-pointer"
                          >
                            Edit
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            onClick={() => (
                              setDeleteCommentId(item.id),
                              setOpenCommentId(null),
                              setIsBlurring(true)
                            )}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/20 cursor-pointer"
                          >
                            Delete
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-blue-400 mt-2 text-shadow-lg text-shadow-blue-800 wrap-break-words">
                    {item.content}
                  </p>
                </div>
              </div>
              <hr className="w-11/12 text-blue-600/30 mx-auto z-50 relative mb-3" />
            </div>
          ))}
        </div>
      )}
      {deleteCommentId !== null && (
        <DeleteCommentModal
          commentId={deleteCommentId}
          onClose={() => setDeleteCommentId(null)}
          ticketId={id}
        />
      )}
      {editCommentId !== null && (
        <EditCommentModal
          commentId={editCommentId}
          onClose={() => setEditCommentId(null)}
          ticketId={id}
        />
      )}

      <div className="p-4 sm:p-5 flex flex-col sm:flex-row relative w-full mt-auto gap-3 sm:gap-0">
        <div className="flex items-start gap-3 sm:gap-0 sm:contents">
          <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-full bg-blue-900 border border-blue-200/20 text-base sm:text-xl text-primary items-center flex justify-center">
            {me?.name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .toLocaleUpperCase()}
          </div>

          <textarea
            onInput={(e) => {
              e.currentTarget.style.height = "auto";
              e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
            }}
            className="border border-blue-400/40 sm:ml-4 w-full sm:w-12/13 min-h-24 rounded-2xl bg-blue-400/10 text-blue-300 p-4 outline-none focus:border-blue-400 resize-none scrollbar-none"
            placeholder="Write a comment..."
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: "tween" }}
          onClick={handlePostComment}
          className="text-primary bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.5)] inset-shadow-[0_0_30px_rgba(255,255,255,0.3)] flex justify-center sm:absolute sm:right-6 sm:bottom-6 cursor-pointer h-fit w-full sm:w-fit border border-blue-200/20 rounded-xl px-4 py-2"
        >
          <Send className="mr-2" />
          Send
        </motion.button>
      </div>
    </div>
  );
};

export default Comments;
