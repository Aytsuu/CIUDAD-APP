"use client";

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Sun, Moon } from "lucide-react";
import type { DailySchedule } from "./schedule-types";

interface ScheduleCardProps {
  day: Date;
  dailySchedule: DailySchedule;
  services: string[];
}

export default function ScheduleCard({ day, dailySchedule, services }: ScheduleCardProps) {
  const dayName = format(day, "EEEE");
  const dateStr = format(day, "MMM d");

  const getServicesForMeridiem = (meridiem: "AM" | "PM") => {
    return services.filter((service) => {
      const serviceTimeSlots = dailySchedule[service];
      return serviceTimeSlots && serviceTimeSlots[meridiem];
    });
  };

  const amServices = getServicesForMeridiem("AM");
  const pmServices = getServicesForMeridiem("PM");

  const hasAnyServices = amServices.length > 0 || pmServices.length > 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{dayName}</span>
          </div>
          <span className="text-sm font-normal text-gray-500">{dateStr}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {!hasAnyServices ? (
          <div className="text-center py-8 text-gray-400">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No services scheduled</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* AM Services Row */}
            <div className="border rounded-lg p-3 bg-gradient-to-r from-amber-100 to-orange-50">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="h-4 w-4 text-amber-600" />
                <h4 className="font-semibold text-amber-800">Morning (AM)</h4>
                <Badge variant="secondary" className="text-xs">
                  {amServices.length && amServices.length > 1 ? `${amServices.length} services` : `${amServices.length} service`}
                </Badge>
              </div>

              <div className="space-y-1 max-h-20 overflow-y-auto">
                {amServices.length === 0 ? (
                  <p className="text-xs text-amber-600 italic">No morning services</p>
                ) : (
                  amServices.map((service) => (
                    <div key={`${dayName}-${service}-am`} className="flex items-center gap-2 p-1.5 bg-white/60 rounded text-xs">
                      <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
                      <span className="text-amber-800 font-medium truncate">{service}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* PM Services Row */}
            <div className="border rounded-lg p-3 bg-gradient-to-r from-blue-100 to-indigo-50">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Afternoon (PM)</h4>
                <Badge variant="secondary" className="text-xs">
                  {pmServices.length && pmServices.length > 1 ? `${pmServices.length} services` : `${pmServices.length} service`}
                </Badge>
              </div>

              <div className="space-y-1 max-h-20 overflow-y-auto">
                {pmServices.length === 0 ? (
                  <p className="text-xs text-blue-600 italic">No afternoon services</p>
                ) : (
                  pmServices.map((service) => (
                    <div key={`${dayName}-${service}-pm`} className="flex items-center gap-2 p-1.5 bg-white/60 rounded text-xs">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      <span className="text-blue-800 font-medium truncate">{service}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* {hasAnyServices && (
          <div className="mt-3 pt-3 border-t text-center">
            <p className="text-xs text-gray-500">
              Total: {amServices.length + pmServices.length} services scheduled
            </p>
          </div>
        )} */}
      </CardContent>
    </Card>
  );
}
