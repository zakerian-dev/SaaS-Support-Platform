import { LucideIcon } from "lucide-react";

type infoCartProps = {
  title: string;
  value: number;
  important?: boolean;
  Icon: LucideIcon;
  color: {
    bg: string;
    text: string;
    border: string;
    circle: string;
  };
  span: string;
  
};

const InfoCard = ({
  title,
  value,
  important,
  Icon,
  color,
  span,
}: infoCartProps) => {
  return (
    <div
      className={`flex shadow-lg shadow-black/70 bg-[#172037]/50 col-span-1 border border-[#334155] py-5 px-8 rounded-2xl ${important ? `${color.border}` : ""}`}
    >
      <Icon
        className={`px-2 border ${color.border} ${color.bg} ${color.text} rounded-lg mr-5`}
        size={45}
      />
      <div className="text-[#F8FAFC]">
        <h2 className="text-2xl font-semibold ">{title}</h2>
        <p className="text-4xl mt-3 font-medium mb-5">{value}</p>
        <div className="flex items-center">
          <div className={`w-1.5 h-1.5 ${color.circle} rounded-full`} />
          <span className="text-[10px] ml-2 text-[#94A3B8]">{span}</span>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
