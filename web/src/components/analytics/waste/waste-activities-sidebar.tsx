import React from "react";
import { useGetUpcomingHotspots, type UpcomingHotspots } from "./waste-sidebar-analytics-query";
import { Card } from "@/components/ui/card/card";
import { Clock, ChevronRight, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Label } from "@/components/ui/label";

export const WasteActivitySidebar = () => {
  const [period, setPeriod] = React.useState<string>("today");
  const [selectedHotspot, setSelectedHotspot] = React.useState<UpcomingHotspots | null>(null);
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
              <DialogLayout
                key={hotspot.wh_num}
                trigger={
                  <Card 
                    className="p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-blue-200"
                    onClick={() => setSelectedHotspot(hotspot)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate mb-1">
                          Hotspot Assignment
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
                }
                title="Hotspot Assignment Details"
                description=""
                mainContent={
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date</Label>
                        <p>{new Date(hotspot.wh_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label>Time</Label>
                        <p>
                          {format(new Date(`2000-01-01T${hotspot.wh_start_time}`), "h:mm a")} - 
                          {format(new Date(`2000-01-01T${hotspot.wh_end_time}`), "h:mm a")}
                        </p>
                      </div>
                      <div>
                        <Label className="flex items-center gap-1">
                          Watchman
                        </Label>
                        <p>{hotspot.watchman || "Not assigned"}</p>
                      </div>
                      <div>
                        <Label className="flex items-center gap-1">
                          Sitio
                        </Label>
                        <p>{hotspot.sitio || "Not specified"}</p>
                      </div>
                    </div>
                    {hotspot.wh_add_info && (
                      <div>
                        <Label className="flex items-center gap-1">
                          <Info className="w-4 h-4" />
                          Additional Information
                        </Label>
                        <p className="whitespace-pre-wrap mt-1 p-2 bg-gray-50 rounded-md">
                          {hotspot.wh_add_info}
                        </p>
                      </div>
                    )}
                  </div>
                }
              />
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
          <Button onClick={() => navigate("/waste-calendar-scheduling")}>
            View Calendar
          </Button>
        </div>
      )}
    </Card>
  );
};