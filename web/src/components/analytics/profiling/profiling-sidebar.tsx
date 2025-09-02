import React from "react";
import { useGetSidebarAnalytics } from "./profiling-analytics-queries";
import { Card } from "@/components/ui/card";
import { Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { useNavigate } from "react-router";

export const ProfilingSidebar = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = React.useState<string>("today");
  const { data: profilingSidebar, isLoading } = useGetSidebarAnalytics(period);

  const formatName = (firstName: string, middleName: string, lastName: string) => {
    const middle = middleName ? `${middleName[0]}.` : '';
    return `${firstName} ${middle} ${lastName}`;
  };

  const handleClick = (req_id: number) => {
    const data = profilingSidebar.find((req: any) => req.req_id == req_id);
    navigate('/resident/form', {
      state: {
        params: {
          title: "Registration Request",
            description:
              "This is a registration request submitted by the user. Please review the details and approve or reject accordingly.",
          type: 'request',
          data: data
        }
      }
    })
  }

  return (
    <Card className="w-80 bg-white h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-black/10">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-semibold text-black/90">
            Recent Requests
          </h2>
        </div>
        
        {/* Period Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setPeriod("today")}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              period === "today"
                ? "bg-white text-buttonBlue shadow-sm"
                : "text-black/60 hover:text-black/90"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setPeriod("this_week")}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              period === "this_week"
                ? "bg-white text-buttonBlue shadow-sm"
                : "text-black/60 hover:text-black/90"
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="h-4 bg-black/20 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-black/20 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : profilingSidebar?.length > 0 ? (
          <div className="p-4 space-y-3">
            {profilingSidebar.map((data: any, index: number) => (
              <Card 
                key={data.req_id || index}
                className="p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-blue-200"
                onClick={() => handleClick(data.req_id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                        Pending
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 truncate mb-1">
                      {formatName(data.per_fname, data.per_mname, data.per_lname)}
                    </h3>
                    
                    <div className="flex flex-col gap-1 text-xs text-gray-500">
                      <span>Request No. {data.req_id}</span>
                      <span>Request Date: {data.req_date}</span>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-black/10 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-black/40" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              No recent requests
            </h3>
            <p className="text-xs text-gray-500">
              Registration requests recently submitted will appear here
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {profilingSidebar?.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <Button>
            View All Requests
          </Button>
        </div>
      )}
    </Card>
  );
};