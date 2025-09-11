// src/components/cards/MonthInfoCard.tsx
import { Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface MedicineMonthItem {
  month: string;
  total_items?: number;
  month_name?: string;
  
}

interface MonthInfoCardProps {
  monthItem: MedicineMonthItem;
  navigateTo?: string | { 
    path: string;
    state?: Record<string, any>;
  } | ((month: string, monthName: string) => void);
  className?: string;
  disabled?: boolean;
  record_name?: string; // Optional prop for record name
}

export function MonthInfoCard({
  monthItem,
  navigateTo,
  className = "",
  disabled = false,
  record_name = "records",
}: MonthInfoCardProps) {
  const navigate = useNavigate();
  const monthDate = new Date(monthItem.month + "-01");
  const monthName = monthItem.month_name || monthDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const isCurrentMonth = new Date().getMonth() === monthDate.getMonth() && 
    new Date().getFullYear() === monthDate.getFullYear();
  const isFutureMonth = monthDate > new Date();
  const isDisabled = disabled || isFutureMonth;

  const handleClick = () => {
    if (isDisabled || !navigateTo) return;
    
    if (typeof navigateTo === 'function') {
      navigateTo(monthItem.month, monthName);
    } else if (typeof navigateTo === 'object') {
      navigate(navigateTo.path, { state: navigateTo.state });
    } else {
      navigate(navigateTo);
    }
  };

  // Updated color scheme with blue for current/hover states and consistent amber folder
  const colors = {
    bgFrom: isDisabled ? "from-gray-100" : isCurrentMonth ? "from-blue-50" : "from-white",
    bgTo: isDisabled ? "to-gray-200" : isCurrentMonth ? "to-white" : "to-gray-50",
    border: isDisabled ? "border-gray-300" : isCurrentMonth ? "border-blue-200" : "border-gray-200",
    hoverBorder: isDisabled ? "hover:border-gray-400" : "hover:border-blue-400",
    text: isDisabled ? "text-gray-500" : isCurrentMonth ? "text-gray-800 group-hover:text-blue-600" : "text-gray-800 group-hover:text-blue-600",
    countBg: isDisabled ? "bg-gray-200" : isCurrentMonth ? "bg-blue-100" : "bg-blue-100",
    countText: isDisabled ? "text-gray-600" : isCurrentMonth ? "text-blue-700" : "text-blue-700",
    countDot: isDisabled ? "bg-gray-500" : "bg-blue-500", // Always blue dot
    pulseDot: "bg-blue-500", // Always blue pulse
    currentBadge: "text-blue-800 " // Blue badge for current month
  };

  return (
    <div
      className={`group relative bg-gradient-to-br ${colors.bgFrom} ${colors.bgTo} border ${colors.border} ${colors.hoverBorder} rounded-xl p-4 hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center min-h-[180px] ${
        isDisabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:-translate-y-1"
      } ${className}`}
      onClick={!isDisabled ? handleClick : undefined}
      title={isDisabled ? "This month is not available yet" : `View details for ${monthName}`}
    >
      {/* Consistent Amber/Yellow Folder Icon */}
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg blur-sm opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <div className="relative bg-gradient-to-br from-amber-400 to-amber-500 p-3 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
          <Folder className="w-8 h-8 text-white" />
        </div>
      </div>

      <h3 className={`font-bold text-md ${colors.text} mb-2 text-center transition-colors`}>
        {monthName}
        {isCurrentMonth && (
          <span className={` text-xs px-2 py-0.5 ${colors.currentBadge} rounded-full`}>
            (Current)
          </span>
        )}
        {isFutureMonth && !disabled && (
          <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full">
            Upcoming
          </span>
        )}
      </h3>

      <div className="text-center">
        <div className={`inline-flex items-center px-3 py-1 ${colors.countBg} ${colors.countText} rounded-full text-xs font-medium`}>
          <span className={`w-2 h-2 rounded-full mr-2 ${colors.countDot}`}></span>
          {monthItem.total_items?.toLocaleString() || 0}  {record_name || "records"}
        </div>
      </div>

      {!isDisabled && navigateTo && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className={`w-2 h-2 rounded-full animate-pulse ${colors.pulseDot}`}></div>
        </div>
      )}
    </div>
  );
}