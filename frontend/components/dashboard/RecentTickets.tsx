import { RawData } from "@/app/dashboard/page";
import { Inbox } from "lucide-react";

export type TicketStatus = "open" | "closed" | "in_progress" | "resolved";

export const statusStyles: Record<TicketStatus, string> = {
  open: "bg-blue-500/20 text-blue-500",
  closed: "bg-orange-500/20",
  in_progress: "bg-purple-500/20",
  resolved: "bg-green-500/20",
};

const RecentTickets = ({ items }: { items: RawData }) => {

  return (
    <div className="w-full bg-black/20 shadow-lg shadow-black/80 border border-[#334155] rounded-2xl px-5 text-center">
      <h2 className="mb-1 text-2xl text-left text-[#F8FAFC] py-5">
        Recent Tickets
      </h2>
      <div className=" overflow-x-auto">
        <table className="table-fixed w-full min-w-180 text-[#94A3B8] mt-10 mx-auto mb-2 ">
          <thead className="text-[#94A3B8] mt-20 mx-auto">
            <tr>
              <th className="pb-2">Ticket ID</th>
              <th className="pb-2">Customer ID</th>
              <th className="pb-2">Subject</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Priority</th>
            </tr>
            <tr>
              <th colSpan={5}>
                <hr className="text-[#334155]" />
              </th>
            </tr>
          </thead>
          <tbody className="">
            {items.tickets.length > 0 &&
              items.tickets.map((item, index) => (
                <TableRow
                  key={index}
                  index={index}
                  id={item.id}
                  customer_id={item.customer_id}
                  status={item.status}
                  priority={item.priority}
                  subject={item.subject}
                />
              ))}

            {items.tickets.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="flex justify-center items-center flex-col mt-5">
                    <Inbox size={35} className="text-stone-600" />
                    <p className="mt-1 text-lg text-gray-300">
                      No tickets found
                    </p>
                    <p className="mt-1 mb-5 text-sm">
                      New tickets will appear here.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTickets;

const TableRow = ({
  id,
  subject,
  status,
  priority,
  customer_id,
  index,
}: {
  id: number;
  subject: string;
  status: TicketStatus;
  priority: string;
  customer_id: number;
  index: number;
}) => {
  return (
    <tr className={`${index % 2 === 0 ? "bg-stone-600/10" : ""}`}>
      <td className="py-1">{id}</td>
      <td className="py-1">{customer_id}</td>
      <td className="py-1">{subject}</td>
      <td className="py-1">
        <span className={`${statusStyles[status]} rounded-2xl pb-1 px-2`}>
          {status}
        </span>
      </td>
      <td className="py-1">{priority}</td>
    </tr>
  );
};
