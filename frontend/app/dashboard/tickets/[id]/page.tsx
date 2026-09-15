"use client";
import CustomerCard from "@/components/tickets/detailed/CustomerCard";
import Header, { Priority } from "@/components/tickets/detailed/Header";
import api from "@/lib/api/axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CustomerProps,
  CustomerRawData,
  UserProps,
  UserRawData,
} from "../../page";
import Description from "@/components/tickets/detailed/Description";
import TicketAction from "@/components/tickets/detailed/TicketAction";
import { useToast } from "@/contexts/ToastContext";
import { LoaderCircle } from "lucide-react";
import Comments from "@/components/tickets/detailed/Comments";
import QuickInfo from "@/components/tickets/detailed/QuickInfo";
import HistoryTimeline from "@/components/tickets/detailed/HistoryTimeline";

export interface ITicket {
  assigned_to: number;
  company_id: number;
  created_at: string;
  customer_id: number;
  description: string;
  id: number;
  priority: Priority;
  status: string;
  subject: string;
  updated_at: string;
}

export interface IMe {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  user_type: "owner" | "member" | "admin";
  company_id: number;
}

const page = () => {
  const { isBlurring, setToast, isLoading } = useToast();
  const params = useParams();
  const id = params.id;
  const [ticket, setTicket] = useState<ITicket>({
    id: 0,
    assigned_to: 0,
    company_id: 0,
    customer_id: 0,
    description: "",
    subject: "",
    updated_at: "",
    status: "",
    created_at: "",
    priority: "low",
  });
  const [user, setUser] = useState<UserProps>({
    id: 1,
    name: "",
    email: "",
    company_id: 0,
    created_at: "",
    phone_number: "",
    user_type: "member",
  });
  const [customers, setCustomers] = useState<CustomerRawData>({
    page: 1,
    total_customers: 0,
    total_page: 1,
    customers: [],
  });
  const [me, setMe] = useState<IMe>();

  useEffect(() => {
    const EditMessage = localStorage.getItem("ticketEditToast");
    const postingComment = localStorage.getItem("postingComment");

    if (EditMessage) {
      setToast({
        open: true,
        message: EditMessage,
        type: "success",
      });
      localStorage.removeItem("ticketEditToast");
    }

    if (postingComment) {
      setToast({
        open: true,
        message: postingComment,
        type: "success",
      });
      localStorage.removeItem("postingComment");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticket_res, res_users, res_customer, res_me] = await Promise.all(
          [
            api.get(`/tickets/${id}`),
            api.get("/users/users"),
            api.get("/customers"),
            api.get("/users/dashboard"),
          ],
        );

        setTicket(ticket_res.data);

        var user = res_users.data.users.find(
          (item: UserProps) => item.id === ticket_res.data.assigned_to,
        );
        setCustomers(res_customer.data);
        setUser(user);
        setMe(res_me.data);
      } catch (error: any) {
        console.log(error.response);
      }
    };
    fetchData();
  }, [id]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5">
      <div className="lg:col-span-3 p-4 sm:p-6 lg:pr-2.5">
        <Header ticket={ticket} />
        <CustomerCard ticket={ticket} user={user} customers={customers} />
        <Description ticket={ticket} />
        <Comments ticket={ticket} id={id as string} me={me} />
      </div>
      <div className="lg:col-span-2 p-4 sm:p-6 lg:pl-2.5">
        <TicketAction ticket={ticket} user={user} />
        <QuickInfo ticket={ticket} user={user} customers={customers} />
      </div>
      {isBlurring && <div className="fixed inset-0 z-50 backdrop-blur-md" />}
      {isLoading && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <LoaderCircle size={70} className="animate-spin text-blue-700" />
        </div>
      )}
      <div className="lg:col-span-5 pb-6 px-4 sm:px-6">
        <HistoryTimeline
          ticketId={typeof id === "string" ? id : undefined}
        />
      </div>
    </div>
  );
};

export default page;
