import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, ChevronDown, Calendar } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { useGetScheduler, useGetDays } from "@/pages/healthServices/scheduler/queries/schedulerFetchQueries";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#64748b" // Slate
];

interface ScheduleItem {
  day: string;
  date: string;
  service: string;
  meridiem: string;
  fullDate: Date;
}

// Function to generate consistent color for a service name
const getServiceColor = (serviceName: string, serviceColorMap: Map<string, string>): string => {
  if (!serviceColorMap.has(serviceName)) {
    const colorIndex = serviceColorMap.size % COLORS.length;
    serviceColorMap.set(serviceName, COLORS[colorIndex]);
  }
  return serviceColorMap.get(serviceName)!;
};

export function SchedulerSidebar() {
  const { data: schedulersData = [], isLoading, error } = useGetScheduler();
  const { data: daysData = [] } = useGetDays();
  const [showAll, setShowAll] = useState(false);
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [serviceColorMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (daysData.length > 0) {
      const today = new Date();
      const monday = startOfWeek(today, { weekStartsOn: 1 });

      const days = daysData
        .map((dayData) => {
          const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
          const dayIndex = dayNames.indexOf(dayData.day);

          if (dayIndex !== -1) {
            return addDays(monday, dayIndex);
          }
          return null;
        })
        .filter((d): d is Date => d !== null);

      setWeekDays(days);
    }
  }, [daysData]);

  // Transform scheduler data to include dates
  const scheduleItems: ScheduleItem[] = [];
  
  if (schedulersData.length > 0 && weekDays.length > 0) {
    weekDays.forEach((day) => {
      const dayName = format(day, "EEEE");
      const formattedDate = format(day, "yyyy-MM-dd");

      schedulersData.forEach((scheduler) => {
        if (scheduler.day === dayName) {
          scheduleItems.push({
            day: dayName,
            date: formattedDate,
            service: scheduler.service_name,
            meridiem: scheduler.meridiem,
            fullDate: day
          });
        }
      });
    });
  }

  // Sort by date
  const sortedSchedules = scheduleItems.sort((a, b) => 
    a.fullDate.getTime() - b.fullDate.getTime()
  );

  // Group by day for display
  const groupedByDay = sortedSchedules.reduce((acc, item) => {
    const key = `${item.date}-${item.day}`;
    if (!acc[key]) {
      acc[key] = {
        day: item.day,
        date: item.date,
        fullDate: item.fullDate,
        amServices: [],
        pmServices: []
      };
    }
    // Separate AM and PM services
    if (item.meridiem === "AM") {
      acc[key].amServices.push({
        name: item.service,
        meridiem: item.meridiem
      });
    } else {
      acc[key].pmServices.push({
        name: item.service,
        meridiem: item.meridiem
      });
    }
    return acc;
  }, {} as Record<string, { 
    day: string; 
    date: string; 
    fullDate: Date; 
    amServices: Array<{ name: string; meridiem: string }>; 
    pmServices: Array<{ name: string; meridiem: string }> 
  }>);

  const allDaySchedules = Object.values(groupedByDay);
  const itemsToShow = showAll ? allDaySchedules : allDaySchedules.slice(0, 7);
  const totalDays = allDaySchedules.length;

  if (error) {
    return (
      <Card className="rounded-lg shadow-sm border-0">
        <CardContent className="pt-4">
          <Alert variant="destructive" className="border-red-100 bg-red-50">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>Failed to load scheduler data. Please try again later.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-md shadow-none">
      <CardContent className="pt-4 overflow-y-auto max-h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : allDaySchedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center h-[300px]">
            <div className="rounded-full bg-gray-100 p-3 mb-3">
              <Calendar className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Schedules Available</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              No scheduled services found for this week.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-3">
              {itemsToShow.map((daySchedule) => {
                const isToday = format(new Date(), "yyyy-MM-dd") === daySchedule.date;

                return (
                  <div key={daySchedule.date} className="space-y-2 border border-gray-300 p-2 rounded-md">
                    {/* Day Header */}
                    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${
                      isToday ? "bg-blue-200" : "bg-gray-50"
                    }`}>
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm font-semibold text-gray-700">
                          {daySchedule.day}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(daySchedule.fullDate, "MMM dd, yyyy")}
                        </span>
                        {isToday && (
                          <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-lg">
                            Today
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Services Cards */}
                    <div className="grid gap-2 ml-2">
                      {/* AM Services */}
                      {daySchedule.amServices.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 px-2 pb-1">
                            <div className="h-px flex-1 bg-orange-200" />
                            <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                              AM
                            </span>
                            <div className="h-px flex-1 bg-orange-200" />
                          </div>
                          {daySchedule.amServices.map((service, serviceIndex) => {
                            const color = getServiceColor(service.name, serviceColorMap);
                            
                            return (
                              <Link
                                key={`${daySchedule.date}-${service.name}-am-${serviceIndex}`}
                                to="/services/scheduler"
                                state={{
                                  selectedDate: daySchedule.date,
                                  dayName: daySchedule.day,
                                  selectedService: service.name,
                                  meridiem: "AM"
                                }}
                              >
                                <div className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-50 transition-all hover:shadow-sm">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div
                                      className="w-2 h-8 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: color }}
                                    />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-gray-800 truncate">
                                        {service.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Scheduled service
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* PM Services */}
                      {daySchedule.pmServices.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 px-2 pb-1">
                            <div className="h-px flex-1 bg-indigo-200" />
                            <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                              PM
                            </span>
                            <div className="h-px flex-1 bg-indigo-200" />
                          </div>
                          {daySchedule.pmServices.map((service, serviceIndex) => {
                            const color = getServiceColor(service.name, serviceColorMap);
                            
                            return (
                              <Link
                                key={`${daySchedule.date}-${service.name}-pm-${serviceIndex}`}
                                to="/services/scheduler"
                                state={{
                                  selectedDate: daySchedule.date,
                                  dayName: daySchedule.day,
                                  selectedService: service.name,
                                  meridiem: "PM"
                                }}
                              >
                                <div className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-50 transition-all hover:shadow-sm">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div
                                      className="w-2 h-8 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: color }}
                                    />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-gray-800 truncate">
                                        {service.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Scheduled service
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalDays > 7 && (
              <div className="text-center pt-4 border-t mt-4">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-sm text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1"
                >
                  {showAll ? "Show Less" : `View All ${totalDays} Days`}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
