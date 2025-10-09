import { useGetSidebarAnalytics } from "./report-analytics-queries";
import { Card } from "@/components/ui/card";
import { Clock, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { formatTimeAgo } from "@/helpers/dateHelper";
import { Link, useNavigate } from "react-router";

const SEVERITY: any = {
  LOW: {
    label: 'Low Priority',
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  MEDIUM: {
    icon: AlertTriangle,
    label: 'Medium Priority',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600'
  },
  HIGH: {
    icon: AlertTriangle,
    label: 'High Priority',
    textColor: 'text-red-600',
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600'
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
          <div>
            {reportSidebar.map((data: Record<string, any>, index: number) => {
              const severityConfig = SEVERITY[data.ir_severity] || SEVERITY.LOW; // Fallback to LOW if severity not found
              const SeverityIcon = severityConfig.icon;
              
              return (
                <div 
                  key={index}
                  className={`${severityConfig.bgColor || 'bg-gray-50'} p-4 transition-all duration-200 cursor-pointer border-b border-gray-200 ${index === 0 ? 'border-t' : ''}`}
                  onClick={() => handleClick(data.ir_id)}
                >
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-10 flex-1 min-w-0">
                        <div className="min-w-0 space-y-2">
                          <h3 className="font-semibold truncate text-sm text-gray-700">
                            {data.ir_reported_by}
                          </h3>

                         <div className="flex gap-2 text-xs font-medium text-gray-600">
                           <span>{formatTimeAgo(data.ir_created_at)}</span>
                           <span>-</span>
                            <span className={severityConfig.textColor}>{severityConfig.label}</span>
                         </div>
                        </div>
                        {SeverityIcon && (
                          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                            <SeverityIcon size={20} className={severityConfig.iconColor} />
                          </div>
                        )}
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
              View All Reports ({reportSidebar?.length > 100 ? "100+": reportSidebar.length})
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
};