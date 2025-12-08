import { useGetGarbageSidebarAnalytics } from "./garbage-pickup-analytics-queries";
import { Card } from "@/components/ui/card";
import { ChevronRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { formatTimeAgo } from "@/helpers/dateHelper";
import { Link, useNavigate } from "react-router";

const STATUS_CONFIG: any = {
  PENDING: {
    label: "Pending",
    textColor: "text-yellow-600",
  },
  ACCEPTED: {
    label: "Accepted",
    textColor: "text-blue-600",
  },
  REJECTED: {
    label: "Rejected",
    textColor: "text-red-600",
  },
  COMPLETED: {
    label: "Completed",
    textColor: "text-emerald-600",
  },
};

interface GarbagePickupSidebarProps {
  limit?: number;
}

export const GarbagePickupSidebar = ({ limit = 3 }: GarbagePickupSidebarProps) => {
  const navigate = useNavigate();
  const { data: recentRequests, isLoading } = useGetGarbageSidebarAnalytics();
  const requests = recentRequests || [];
  const total = requests.length;

  const handleClick = () => {
    navigate("/garbage-pickup-request");
  };

  return (
    <Card
      className={`bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm mb-4 ${
        total > 0 ? "flex flex-col" : ""
      }`}
    >
      {/* Sidebar Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Pickup Requests
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Recent garbage collection requests
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : total > 0 ? (
          <div>
            {requests.slice(0, limit).map((request: any, index: number) => {
              const statusKey = request.garb_req_status?.toUpperCase() || 'PENDING';
              const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING;

              return (
                <div
                  key={request.garb_id || index}
                  className={`p-4 transition-all duration-200 cursor-pointer border-b border-gray-200 hover:bg-gray-50 ${
                    index === 0 ? "border-t" : ""
                  }`}
                  onClick={() => handleClick()}
                >
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <div className="min-w-0 space-y-2">
                          <h3 className="font-semibold truncate text-sm text-gray-700">
                            {request.garb_requester || "Unknown Resident"}
                          </h3>

                          <div className="flex gap-2 text-xs font-medium text-gray-600">
                            <span>{formatTimeAgo(request.garb_created_at)}</span>
                            <span>-</span>
                            <span className={statusConfig?.textColor}>
                              {statusConfig?.label}
                            </span>
                            {request.sitio_name && (
                              <>
                                <span>-</span>
                                <span className="text-gray-500 truncate max-w-[100px]">
                                  {request.sitio_name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 flex-shrink-0 mt-1 text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              No Recent Requests
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Garbage pickup requests will appear here
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {total > 0 && (
        <div className="p-4 border-t border-gray-100">
          <Link to="/garbage-pickup-request">
            <Button variant={"link"}>
              View All Requests ({total > 100 ? "100+" : total})
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
};