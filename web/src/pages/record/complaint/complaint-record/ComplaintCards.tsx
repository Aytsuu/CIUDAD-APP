import { useMemo } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  CircleAlert 
} from "lucide-react"
import { useGetCardAnalytics } from "@/components/analytics/complaint/complaint-analytics-queries";

const CARD_SKELETON_LOADER = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="bg-gray-100 rounded-lg p-6 h-32 animate-pulse"></div>
    ))}
  </div>
);

export default function ComplaintCards() {
    const {data, isLoading} = useGetCardAnalytics();

    const cards = useMemo(() => [
        {
            title: "Accepted",
            value: data?.accepted || 0,
            icon: <CheckCircle2 className="w-6 h-6"/>,
            iconColor: "text-green-500",
            iconBg: "bg-green-50",
            description: "Valid/qualified report",
        },
        {
            title: "Pending",
            value: data?.pending || 0,
            icon: <Clock className="w-6 h-6"/>,
            iconColor: "text-orange-500",
            iconBg: "bg-orange-50",
            description: "Awaiting review",
        },
        {
            title: "Cancelled",
            value: data?.cancelled || 0,
            icon: <XCircle className="w-6 h-6"/>,
            iconColor: "text-red-500",
            iconBg: "bg-red-50",
            description: "Cancelled report",
        },
        {
            title: "Raised",
            value: data?.raised || 0,
            icon: <AlertCircle className="w-6 h-6"/>,
            iconColor: "text-blue-500",
            iconBg: "bg-blue-50",
            description: "Total reports raised",
        },
        {
            title: "Rejected",
            value: data?.rejected || 0,
            icon: <CircleAlert className="w-6 h-6"/>,
            iconColor: "text-purple-500",
            iconBg: "bg-purple-50",
            description: "Not qualified",
        },
    ], [data]);

    if (isLoading) {
        return <CARD_SKELETON_LOADER />;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
            {cards.map((card) => (
                <div 
                    key={card.title}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-200 flex items-center gap-4"
                >
                    <div className={`${card.iconBg} p-3 rounded-lg flex-shrink-0`}>
                        <div className={card.iconColor}>
                            {card.icon}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500 font-medium mb-0.5">
                            {card.title}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                            {card.value}
                        </div>
                        <div className="text-xs text-gray-400">
                            {card.description}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}