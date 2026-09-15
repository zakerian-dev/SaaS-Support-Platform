import { CustomerRawData } from "@/app/dashboard/page";
import { Inbox } from "lucide-react";

const RecentCustomers = ({ items }: { items: CustomerRawData }) => {
  items.customers.reverse();

  return (
    <div className="w-full bg-black/20 shadow-lg shadow-black/80 border border-[#334155] rounded-2xl px-5 text-center">
      <h2 className="mb-1 text-2xl text-[#F8FAFC] text-left py-5">
        Recent Customers
      </h2>
      <div className="overflow-x-auto">
        <table className="table-fixed min-w-180 w-full text-[#94A3B8] mb-2">
          <thead className="text-[#94A3B8] mt-20 mx-auto">
            <tr>
              <th className="pb-2">Customer ID</th>
              <th className="pb-2">Company ID</th>
              <th className="pb-2">Name</th>
              <th className="pb-2">Phone Number</th>
              <th className="pb-2">Email</th>
            </tr>
            <tr>
              <th colSpan={5}>
                <hr className="text-[#334155]" />
              </th>
            </tr>
          </thead>
          <tbody>
            {items.customers.length > 0 &&
              items.customers
                .slice(0, 4)
                .map((item, index) => (
                  <TableRow
                    key={index}
                    index={index}
                    name={item.name}
                    id={item.id}
                    company_id={item.company_id}
                    phone_number={item.phone_number}
                    email={item.email}
                  />
                ))}

            {items.customers.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="flex justify-center items-center flex-col mt-5">
                    <Inbox size={35} className="text-stone-600" />
                    <p className="mt-1 text-lg text-gray-300">
                      No customers found
                    </p>
                    <p className="mt-1 mb-5 text-sm">
                      New customers will appear here.
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

export default RecentCustomers;

const TableRow = ({
  id,
  name,
  company_id,
  phone_number,
  email,
  index,
}: {
  id: number;
  name: string;
  company_id: number;
  phone_number: string;
  email: string;
  index: number;
}) => {
  return (
    <tr className={`${index % 2 === 0 ? "bg-gray-600/20" : ""}`}>
      <td className="py-0.5">{id}</td>
      <td className="py-0.5">{company_id}</td>
      <td className="py-0.5">{name}</td>
      <td className="py-0.5">{phone_number}</td>
      <td className="py-0.5">{email}</td>
    </tr>
  );
};
