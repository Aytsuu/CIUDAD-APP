import { useGetSidebarAnalytics } from "./report-analytics-queries";
import { Card } from "@/components/ui/card";
import { Clock, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { formatTimeAgo } from "@/helpers/dateHelper";
import { Link, useNavigate } from "react-router";

const SEVERITY: any = {
  LOW: {
    bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    label: 'Low Priority',
    textColor: 'text-emerald-50'
  },
  MEDIUM: {
    bg: 'bg-gradient-to-br from-amber-500 to-amber-600',
    label: 'Medium Priority',
    textColor: 'text-amber-50'
  },
  HIGH: {
    bg: 'bg-gradient-to-br from-red-600 to-red-700',
    icon: AlertTriangle,
    label: 'High Priority',
    textColor: 'text-red-50'
  },
};

export const ReportSidebar = () => {
  const navigate = useNavigate();
  const { data: reportSidebar, isLoading } = useGetSidebarAnalytics();

  const handleClick = (ir_id: string) => {
    navigate("/report/incident/view", {
      state: {
        params: {
          ir_id: ir_id,
        },
      },
    });
  };

  return (
    <Card className="w-full bg-white h-full flex flex-col border-none shadow-sm">
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : reportSidebar?.length > 0 ? (
          <div className="p-4 space-y-3">
            {reportSidebar.map((data: Record<string, any>, index: number) => {
              const severityConfig = SEVERITY[data.ir_severity];
              const SeverityIcon = severityConfig.icon;
              
              return (
                <Card 
                  key={index}
                  className={`p-4 hover:shadow-lg shadow-sm rounded-xl transition-all duration-200 cursor-pointer border-none ${severityConfig.bg} ${severityConfig.textColor} relative overflow-hidden`}
                  onClick={() => handleClick(data.ir_id)}
                >
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-10 flex-1 min-w-0">
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate text-sm">
                            {data.ir_reported_by}
                          </h3>

                         <div className="flex gap-2 opacity-90 text-xs font-medium">
                           <span>{formatTimeAgo(data.ir_created_at)}</span>
                           <span>-</span>
                            <span>{severityConfig.label}</span>
                         </div>
                        </div>
                        {SeverityIcon && (
                          <div className="w-8 h-8 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                            <SeverityIcon size={20} className="fill-red-600 " />
                          </div>
                        )}
                      </div>
                      
                      <ChevronRight className="w-5 h-5 flex-shrink-0 mt-1 opacity-80" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              No Recent Reports
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Reports recently submitted will appear here
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {reportSidebar?.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <Link to="/report/incident">
            <Button variant={"link"}>
              View All Reports
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
};