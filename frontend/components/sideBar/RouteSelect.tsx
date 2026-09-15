"use client";
import {
  ChevronDown,
  FactoryIcon,
  LayoutDashboardIcon,
  LucideIcon,
  Ticket,
  UserCircle2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const routes = [
  {
    title: "Dashboard",
    href: "/dashboard",
    Icon: LayoutDashboardIcon,
  },
  {
    title: "Tickets",
    href: "/dashboard/tickets",
    Icon: Ticket,
  },
  {
    title: "Customers",
    href: "/dashboard/customers",
    Icon: Users,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    Icon: UserCircle2,
  },
  {
    title: "Company",
    href: "/dashboard/company",
    Icon: FactoryIcon,
  },
];

const RouteSelect = () => {
  return (
    <div className="space-y-1">
      {routes.map((item, index) => (
        <Route key={index} {...item} />
      ))}
    </div>
  );
};

export default RouteSelect;

const Route = ({
  title,
  href,
  Icon,
  children,
}: {
  title: string;
  href: string;
  Icon: LucideIcon;
  children?: { title: string; href: string }[];
}) => {
  const pathName = usePathname();
  const [open, setOpen] = useState<boolean>(false);
  const isChildActive = children?.some((child) => child.href === pathName);
  if (!children && href) {
    return (
      <Link
        href={href}
        className={`flex items-center justify-start gap-2  w-[calc(100%-6px)] rounded px-2 py-1.5 ${pathName === href ? "shadow-lg border text-white border-stone-700 backdrop-blur-2xl" : "hover:bg-black/20 hover:border text-gray-300/70 hover:border-gray-400/20 shadow-none"}`}
      >
        <div>
          <Icon className={pathName === href ? "text-blue-600" : ""} />
        </div>
        <span className="truncate">{title}</span>
      </Link>
    );
  }
  if (children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center justify-between w-[calc(100%-6px)] rounded px-2 py-1.5 transition-all cursor-pointer ${pathName === href || isChildActive ? "bg-white text-stone-950 shadow-lg border border-stone-100" : "hover:bg-stone-200 bg-transparent text-stone-500 shadow-non"} ${
            open
              ? "bg-white shadow-md border border-stone-200"
              : "hover:bg-stone-200 text-stone-600"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100">
              <Icon
                className={
                  pathName === href || isChildActive ? "text-blue-600" : ""
                }
              />
            </div>
            <span className="font-medium">{title}</span>
          </div>
          <span>
            <ChevronDown className={open ? "rotate-180 " : ""} />
          </span>
        </button>

        {open && (
          <div className="mr-5 mt-2 border-r border-stone-300 pr-4 space-y-1">
            {children?.map((child) => (
              <Link
                key={child.href}
                href={child.href!}
                className={`gap-3 flex items-center rounded-lg px-3 py-2 text-sm transition-all ${pathName === child.href ? "bg-white shadow text-black" : "text-stone-500 hover:bg-stone-100"}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${pathName === child.href ? "bg-amber-600 scale-125" : "bg-stone-400"}`}
                ></span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }
};
