"use client";
import InfoCard from "@/components/dashboard/InfoCard";
import RecentCustomers from "@/components/dashboard/RecentCustomers";
import RecentTickets from "@/components/dashboard/RecentTickets";
import TicketStatus from "@/components/dashboard/TicketStatus";
import { useToast } from "@/contexts/ToastContext";
import api from "@/lib/api/axios";
import { CircleUserRound, LucideTicket, Users } from "lucide-react";
import { useEffect, useState } from "react";

export interface TicketsProps {
  id: number;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  assigned_to: number | null;
  customer_id: number;
  company_id: number;
  created_at: string;
  updated_at: string | null;
}

export interface RawData {
  page: number;
  tickets: TicketsProps[];
  total_page: number;
  total_tickets: number;
}

export interface CustomerProps {
  id: number;
  name: string;
  phone_number: string;
  email: string;
  company_id: number;
}

export interface CustomerRawData {
  page: number;
  customers: CustomerProps[];
  total_page: number;
  total_customers: number;
}

export interface UserProps {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  user_type: "owner" | "admin" | "member";
  company_id: number;
  created_at: string;
  password?: string;
}

export interface UserRawData {
  users: UserProps[];
  page: number;
  total_page: number;
  total_users: number;
}

const dashboard = () => {
  const { isBlurring } = useToast();
  const [data, setData] = useState<RawData>({
    page: 0,
    tickets: [],
    total_page: 1,
    total_tickets: 0,
  });
  const [customer, setCustomer] = useState<CustomerRawData>({
    page: 0,
    customers: [],
    total_page: 1,
    total_customers: 0,
  });
  const [user, setUser] = useState<UserRawData>({
    users: [],
    page: 0,
    total_page: 0,
    total_users: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const [ticket_res, res_customer, res_user] = await Promise.all([
        api.get("/tickets"),
        api.get("/customers"),
        api.get("/users/users"),
      ]);

      setData(ticket_res.data);
      setCustomer(res_customer.data);
      setUser(res_user.data);
    };
    fetchData();
  }, []);

  const openTicket = data.tickets.filter((item) => item.status === "open");
  const urgentTicket = data.tickets.filter(
    (item) => item.priority === "urgent",
  );
  return (
    <div className="px-8 py-3 lg:min-h-[calc(100vh-32px-48px-60px)] rounded-lg shadow-[0_10px_40px_rgba(0,0,0,.3)] ">
      <h1 className="text-3xl mb-2 font-bold text-[#F8FAFC]">Overview</h1>
      <p className="text-[#94A3B8] mb-10">
        Here's what's happening with your support system today
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
        <InfoCard
          title="Open Tickets"
          value={openTicket.length}
          important
          Icon={LucideTicket}
          color={{
            bg: "bg-blue-500/20",
            text: "text-blue-500",
            border: "border-blue-500/50",
            circle: "bg-blue-500",
          }}
          span="Needs attention"
        />

        <InfoCard
          title="Total Tickets"
          value={data.total_tickets}
          Icon={LucideTicket}
          color={{
            bg: "bg-purple-500/20",
            text: "text-purple-500",
            border: "border-purple-500/30",
            circle: "bg-purple-500",
          }}
          span="All time"
        />
        <InfoCard
          title="Customers"
          value={customer.total_customers}
          Icon={Users}
          color={{
            bg: "bg-green-500/20",
            text: "text-green-500",
            border: "border-green-500/30",
            circle: "bg-green-500",
          }}
          span="Registered"
        />
        <InfoCard
          title="Urgent Tickets"
          value={urgentTicket.length}
          Icon={LucideTicket}
          color={{
            bg: "bg-orange-500/20",
            text: "text-orange-500",
            border: "border-orange-500/50",
            circle: "bg-orange-500",
          }}
          span="Needs attention"
          important
        />
      </div>
      <div className="mt-10">
        <RecentTickets items={data} />
      </div>
      <div className="mt-10">
        <RecentCustomers items={customer} />
      </div>
      <div className="mt-10">
        <TicketStatus items={data} />
      </div>
      {isBlurring && <div className="fixed inset-0 z-50 backdrop-blur-md" />}
    </div>
  );
};

export default dashboard;
