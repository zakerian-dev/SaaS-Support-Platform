import SideBar from "@/components/sideBar/SideBar";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-[#0b1328] ">
      <div className="relative grid grid-cols-1 lg:grid-cols-[220px_1fr] items-start gap-4 sm:p-4 border border-[#334155] m-4 lg:m-20 bg-cover rounded-lg before:absolute before:inset-0 ">

        {/* Background */}
        <div
          className="
        absolute inset-0
        bg-[url('/yannis-papanastasopoulos-XZdgKvOqsMI-unsplash.jpg')]
        bg-cover bg-center
        blur-md
      "
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0b1328]/80" />
        <div className="relative z-10 h-full">
          <SideBar />
        </div>
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
