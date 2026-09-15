import {
  CustomerProps,
  CustomerRawData,
  UserProps,
} from "@/app/dashboard/page";
import { ITicket } from "@/app/dashboard/tickets/[id]/page";
import { Calendar } from "lucide-react";

const CustomerCard = ({
  ticket,
  user,
  customers,
}: {
  ticket: ITicket;
  user?: UserProps;
  customers: CustomerRawData;
}) => {
  var customer = customers.customers.find(
    (item: CustomerProps) => ticket.customer_id === item.id,
  );
  return (
    <div className="grid mt-10 border px-4 sm:px-5 py-6 sm:py-8.5 rounded-2xl border-blue-400/40 bg-[url('/backgrounds/bg2.png')] bg-cover relative shadow-2xl/50">
      <div className="w-full h-full absolute bg-[#00112b]/90 rounded-2xl" />
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0 border-b border-blue-800/40 pb-6 z-50">
        <div className="flex gap-4 sm:gap-8">
          {/* Logo or ShortName */}
          <div className="h-12 w-12 sm:h-15 sm:w-15 shrink-0 rounded-full bg-blue-900 border border-blue-200/20 text-xl sm:text-2xl text-primary items-center flex justify-center">
            {customer?.name.slice(0, 1).toLocaleUpperCase()}
          </div>

          {/* Customer Information */}
          <div className="min-w-0">
            <h3 className="text-primary text-xl sm:text-2xl truncate">
              {customer?.name}
            </h3>
            <p className="text-blue-300/40 truncate">{customer?.email}</p>
            <span className="text-blue-300/40">{customer?.phone_number}</span>
          </div>
        </div>

        {/* Customer Badge */}
        <div className="flex items-center gap-2 self-start rounded-full border border-blue-400 bg-blue-600/40 h-fit px-4 py-1 text-blue-400 text-shadow-blue-200 text-shadow-sm">
          <div className="rounded-full h-2 w-2 bg-blue-500 top-1/2 left-1" />
          <div className="pb-0.5">Customer</div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap gap-6 sm:gap-12 mt-3 z-50">
        {/* First Card */}
        <div className="flex items-center gap-3 sm:border-r border-blue-800/40 sm:pr-12">
          <Calendar className="text-blue-300/30 shrink-0" />
          <div>
            <h4 className="text-blue-300/30">Created AT</h4>
            <p className="text-primary">{ticket.created_at}</p>
          </div>
        </div>
        {/* Second Card */}
        <div className="flex items-center gap-3 sm:justify-center sm:border-r border-blue-800/40 sm:pr-12">
          <Calendar className="text-blue-300/30 shrink-0" />
          <div>
            <h4 className="text-blue-300/30">Updated AT</h4>
            <p className="text-primary">{ticket.updated_at}</p>
          </div>
        </div>
        {/* Third Card */}
        <div className="flex items-center gap-3 sm:justify-center">
          <div className="flex flex-col">
            <div className="h-8 w-8 shrink-0 rounded-full bg-blue-900 border border-blue-200/20 text-lg text-primary items-center flex justify-center">
              {user?.name.slice(0, 1).toLocaleUpperCase()}
            </div>
          </div>
          <div>
            <h4 className="text-blue-300/30">Assigned To</h4>
            <p className="text-primary">{user?.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;
