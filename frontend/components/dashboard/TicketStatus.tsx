import { RawData } from "@/app/dashboard/page";
import { div } from "framer-motion/client";
import {
  Check,
  Hourglass,
  LoaderCircle,
  LockKeyhole,
  LucideIcon,
} from "lucide-react";

const TicketStatus = ({ items }: { items: RawData }) => {
  const openTicket = items.tickets.filter((item) => item.status === "open");
  const in_progressTicket = items.tickets.filter(
    (item) => item.status === "in_progress",
  );
  const resolvedTicket = items.tickets.filter(
    (item) => item.status === "resolved",
  );
  const closedTicket = items.tickets.filter((item) => item.status === "closed");
  return (
    <div className="w-full bg-black/20 shadow-lg shadow-black/80 border border-[#334155] rounded-2xl">
      <h2 className="p-5 mb-1 text-2xl text-[#F8FAFC]">
        Ticket Status Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <TableCard
          title="Open"
          Icon={Hourglass}
          color={{
            bg: "bg-blue-500/20",
            text: "text-blue-500",
            border: "border-blue-500/30",
            circle: "bg-blue-500",
          }}
          value={openTicket.length}
        />
        <TableCard
          title="In progress"
          Icon={LoaderCircle}
          color={{
            bg: "bg-purple-500/20",
            text: "text-purple-500",
            border: "border-purple-500/30",
            circle: "bg-purple-500",
          }}
          value={in_progressTicket.length}
        />
        <TableCard
          title="Resolved"
          Icon={Check}
          color={{
            bg: "bg-green-500/20",
            text: "text-green-500",
            border: "border-green-500/30",
            circle: "bg-green-500",
          }}
          value={resolvedTicket.length}
        />
        <TableCard
          title="Closed"
          Icon={LockKeyhole}
          color={{
            bg: "bg-orange-500/20",
            text: "text-orange-500",
            border: "border-orange-500/30",
            circle: "bg-orange-500",
          }}
          value={closedTicket.length}
        />
      </div>
    </div>
  );
};

export default TicketStatus;

const TableCard = ({
  title,
  Icon,
  color,
  value,
}: {
  title: "Open" | "Closed" | "In progress" | "Resolved";
  Icon: LucideIcon;
  color: {
    bg: string;
    text: string;
    border: string;
    circle: string;
  };
  value: number;
}) => {
  return (
    <div className="bg-black/20 text-white border shadow-lg shadow-black border-[#334155] flex justify-between items-center rounded-lg px-10 mx-5 mb-5 py-6">
      <div>
        <h3>{title}</h3>
        <p className="text-4xl mt-1">{value}</p>
      </div>
      <Icon className={`${color.bg} ${color.text} border ${color.border} rounded-full px-2`} size={40}/>
    </div>
  );
};
