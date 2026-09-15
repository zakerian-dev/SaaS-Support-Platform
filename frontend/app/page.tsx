"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const HomePage = () => {
  const router = useRouter();
  useEffect(() => {
    router.push("/login");
  }, []);
  return <div></div>;
};

export default HomePage;
