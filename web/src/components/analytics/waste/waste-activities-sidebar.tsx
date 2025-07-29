import React from "react";
import { useGetUpcomingHotspots } from "./waste-sidebar-analytics-query";
import { Card } from "@/components/ui/card/card";
import { Clock, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { useNavigate } from "react-router";
import { format } from "date-fns";

export const WasteActivitySidebar = () => {
  const [period, setPeriod] = React.useState<string>("today");
  const { data: upcomingHotspots, isLoading } = useGetUpcomingHotspots();
  const navigate = useNavigate();

  // Filter hotspots based on selected period
  const filteredHotspots = React.useMemo(() => {
    if (!upcomingHotspots) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return upcomingHotspots.filter((hotspot) => {
      const hotspotDate = new Date(hotspot.wh_date);
      hotspotDate.setHours(0, 0, 0, 0);
      
      if (period === "today") {
        return hotspotDate.getTime() === today.getTime();
      } else { // this_week
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + 7);
        return hotspotDate >= today && hotspotDate <= endOfWeek;
      }
    });
  }, [upcomingHotspots, period]);

  return (
    <Card className="w-80 bg-white h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-black/10">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-semibold text-black/90">
            Upcoming Waste Activities
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
        ) : filteredHotspots.length > 0 ? (
          <div className="p-4 space-y-3">
            {filteredHotspots.map((hotspot) => (
              <Card 
                key={hotspot.wh_num}
                className="p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-blue-200"
                onClick={() => navigate(`/waste-hotspots/${hotspot.wh_num}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        Scheduled
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 truncate mb-1">
                      {hotspot.sitio || "Unspecified Location"}
                    </h3>
                    
                    <div className="flex flex-col gap-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(hotspot.wh_date).toLocaleDateString()}</span>
                      </div>
                      <div>
                        {format(new Date(`2000-01-01T${hotspot.wh_start_time}`), "h:mm a")} - 
                        {format(new Date(`2000-01-01T${hotspot.wh_end_time}`), "h:mm a")}
                      </div>
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
              No upcoming activities
            </h3>
            <p className="text-xs text-gray-500">
              {period === "today" 
                ? "No activity scheduled for today"
                : "No activity scheduled this week"}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredHotspots.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <Button onClick={() => '/waste-calendar-scheduling'}>
            View Calendar
          </Button>
        </div>
      )}
    </Card>
  );
};