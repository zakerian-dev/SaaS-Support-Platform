"use client";

import { LockKeyhole, Mail } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import { login } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const { setToast, setIsBlurring, isBlurring } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter()

  const handleLogin = async () => {
    try {
      setIsBlurring(true);
      const res = await login({
        email,
        password,
      });
      setToast({
        open: true,
        message: "Logged in Successfully",
        type: "success",
      });
      setTimeout(() => {
        setIsBlurring(false);
        router.push("/dashboard")
      }, 5200);
    } catch (error: any) {
      if (error.response?.status === 422) {
        setToast({
          open: true,
          message: "Invalid Email address",
          type: "error",
        });
      } else {
        setToast({
          open: true,
          message: error.response?.data?.detail,
          type: "error",
        });
      }
    }
  };

  return (
    <div className="bg-[#090909] h-screen flex">
      <div className="mx-auto w-150 my-auto relative">
        <div className="flex flex-col border-stone-700/20 border rounded-3xl px-10 pt-10 pb-20 relative overflow-hidden bg-[#0d0d0f]">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-1/2 w-px bg-linear-to-b from-transparent via-blue-500 to-transparent" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-px bg-linear-to-b from-transparent via-blue-500 to-transparent" />
          <div className="bg-blue-500/50 w-40 h-64 rounded-full absolute top-1/2 -translate-y-1/2 -left-30 blur-3xl z-10" />
          <div className="bg-stone-100/20 w-60 h-60 rounded-full absolute -top-25 -left-20 blur-3xl" />
          <div className="bg-stone-100/20 w-60 h-60 rounded-full absolute -top-25 -right-20 blur-3xl" />

          <h2 className="text-white text-5xl w-fit mx-auto mb-2">Log in</h2>
          <p className="text-stone-500 text-center mt-5">
            Log in to your account and seamlessly continue managing your
            projects, ideas, and progress just where you left off.
          </p>

          {/* Email field */}
          <div className="mb-5 mt-15 border border-stone-700 rounded-full relative">
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="glowLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <rect
                x="1"
                y="1"
                width="calc(100% - 2px)"
                height="calc(100% - 2px)"
                rx="24"
                ry="24"
                fill="none"
                stroke="url(#glowLine)"
                strokeWidth="2"
              />
            </svg>
            <Mail
              className="text-stone-600 absolute top-1/2 -translate-y-1/2 left-4"
              size={18}
            />
            <input
              onChange={(e) => setEmail(e.target.value)}
              className="text-stone-500 pl-11 w-full rounded-full px-3 py-3 bg-transparent outline-none"
              type="email"
              placeholder="Enter your email address"
            />
          </div>

          {/* Password field */}
          <div className="mb-20 border border-stone-700 rounded-full relative">
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="glowLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <rect
                x="1"
                y="1"
                width="calc(100% - 2px)"
                height="calc(100% - 2px)"
                rx="24"
                ry="24"
                fill="none"
                stroke="url(#glowLine)"
                strokeWidth="2"
              />
            </svg>
            <LockKeyhole
              className="text-stone-600 absolute top-1/2 -translate-y-1/2 left-4"
              size={18}
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              className="text-stone-500 pl-11 pr-11 w-full rounded-full px-3 py-3 bg-transparent outline-none"
              type="password"
              placeholder="Enter your password"
            />
          </div>

          {/* Log in button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 50 }}
            onClick={handleLogin}
            className="text-center text-white text-lg border border-l-blue-500/60 border-stone-700 py-3 rounded-full bg-blue-500/50 hover:bg-blue-500/70 transition-colors cursor-pointer"
          >
            Log in
          </motion.button>

          {/* Social buttons */}
          <div className="grid grid-cols-3 mt-5 gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 150 }}
              className="flex items-center justify-center gap-2 text-stone-400 text-sm bg-stone-600/10 hover:bg-stone-600/20 transition-colors py-2 rounded-full border border-stone-300/10 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
              </svg>
              Facebook
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 150 }}
              className="flex items-center justify-center gap-2 text-stone-400 text-sm bg-stone-600/10 hover:bg-stone-600/20 transition-colors py-2 rounded-full border border-stone-300/10 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.55-5.17 3.55-8.82Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.1A12 12 0 0 0 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.28a12 12 0 0 0 0 10.78l3.99-3.1Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42A11.9 11.9 0 0 0 12 0 12 12 0 0 0 1.28 6.61l3.99 3.1C6.22 6.86 8.87 4.75 12 4.75Z"
                />
              </svg>
              Google
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 150 }}
              className="flex items-center justify-center gap-2 text-stone-400 text-sm bg-stone-600/10 hover:bg-stone-600/20 transition-colors py-2 rounded-full border border-stone-300/10 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M16.36 1.43c.09 1.03-.32 2.02-.94 2.75-.65.77-1.72 1.36-2.75 1.28-.11-1 .36-2.03.98-2.72.68-.77 1.83-1.35 2.71-1.31ZM19.9 17.06c-.55 1.26-.81 1.82-1.51 2.93-.98 1.55-2.36 3.48-4.07 3.5-1.52.02-1.91-.99-3.97-.98-2.06.01-2.49.99-4.01.97-1.71-.02-3.02-1.76-4-3.31-2.74-4.24-3.03-9.22-1.34-11.87C2.4 5.87 4.4 4.68 6.24 4.68c1.87 0 3.05 1.03 4.6 1.03 1.5 0 2.4-1.03 4.6-1.03 1.63 0 3.35.9 4.58 2.46-4.03 2.2-3.38 7.93-.12 9.92Z" />
              </svg>
              Apple
            </motion.button>
          </div>

          <h2 className="text-stone-400 mt-10 w-fit mx-auto">
            Didn't have an account?{" "}
            <Link href={"/register"} className="text-blue-500 underline">
              Sign up
            </Link>
          </h2>
        </div>
      </div>
      {isBlurring && <div className="fixed inset-0 z-50 backdrop-blur-md" />}
    </div>
  );
};

export default LoginForm;
