"use client";

import { useState, useEffect } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { enUS } from "date-fns/locale";
import ScheduleCard from "../scheduler/schedule-card";
import ScheduleDialog from "../scheduler/schedule-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeeklySchedule, DailySchedule } from "../scheduler/schedule-types";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useGetServices, useGetDays, useGetScheduler } from "../scheduler/queries/schedulerFetchQueries";

export default function SchedulerMain() {
  const { data: servicesData = [] } = useGetServices();
  const { data: schedulersData = [] } = useGetScheduler();
  const { data: daysData = [] } = useGetDays();

  const [services, setServices] = useState<string[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({});
  const [weekDays, setWeekDays] = useState<Date[]>([]);

  useEffect(() => {
    if (servicesData.length > 0) {
      const serviceNames = servicesData.map((service) => service.service_name);
      setServices(serviceNames);
    }
  }, [servicesData]);

  useEffect(() => {
    if (daysData.length > 0) {
      const today = new Date();
      const monday = startOfWeek(today, { weekStartsOn: 1, locale: enUS });

      const days = daysData
        .map((dayData) => {
          const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
          const dayIndex = dayNames.indexOf(dayData.day);

          if (dayIndex !== -1) {
            // Monday = 0, Tuesday = 1, etc.
            return addDays(monday, dayIndex);
          } else {
            console.error("Invalid day name:", dayData.day);
            return null;
          }
        })
        .filter((d): d is Date => d !== null);

      setWeekDays(days);
    }
  }, [daysData]);

  useEffect(() => {
    if (schedulersData.length > 0 && servicesData.length > 0 && weekDays.length > 0) {
      const schedule: WeeklySchedule = {};

      weekDays.forEach((day) => {
        const formattedDate = format(day, "yyyy-MM-dd");
        const dayName = format(day, "EEEE");
        const daily: DailySchedule = {};

        // Initialize all services with false values
        servicesData.forEach((service) => {
          daily[service.service_name] = { AM: false, PM: false };
        });

        // Set actual scheduled services from database
        schedulersData.forEach((scheduler) => {
          if (scheduler.day === dayName && daily[scheduler.service_name]) {
            daily[scheduler.service_name][scheduler.meridiem] = true;
          }
        });

        schedule[formattedDate] = daily;
      });

      setWeeklySchedule(schedule);
    } else {
      console.log("No schedulers data found");
    }
  }, [schedulersData, servicesData, weekDays]);

  const handleSaveSchedule = (newSchedule: WeeklySchedule) => {
    setWeeklySchedule(newSchedule);
    console.log("Weekly schedule saved:", newSchedule);
  };

  const handleAddService = (serviceName: string) => {
    if (!services.includes(serviceName)) {
      setServices((prev) => [...prev, serviceName]);
      console.log("New service added:", serviceName);
    }
  };

  const handleAddDay = (newDay: Date) => {
    const newWeekDays = [...weekDays, newDay];
    setWeekDays(newWeekDays);

    // Initialize the new day in the schedule
    const formattedDate = format(newDay, "yyyy-MM-dd");
    const newDailySchedule: DailySchedule = {};

    services.forEach((serviceName) => {
      newDailySchedule[serviceName] = { AM: false, PM: false };
    });

    setWeeklySchedule((prev) => ({
      ...prev,
      [formattedDate]: newDailySchedule
    }));
  };

  return (
    <LayoutWithBack title="Service Scheduler" description="Schedule services for the week">
      <main className="min-h-screen">
        <div className="mx-auto">
          {/* Services Overview */}
          <div className="mb-4">
            <Card className="flex">
              <div className="w-full">
                <CardHeader>
                  <CardTitle>Available Services</CardTitle>
                  <CardDescription>Current services that can be scheduled</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {services.map((service) => (
                      <span key={service} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {service}
                      </span>
                    ))}
                  </div>
                  {services.length === 0 && <div className="text-gray-500">No services found. Add some services to get started.</div>}
                </CardContent>
              </div>

              {/* schedule dialog */}
              <div className="w-full flex justify-end items-center">
                <div className="mr-5">
                  <ScheduleDialog weeklySchedule={weeklySchedule} weekDays={weekDays} services={services} onSave={handleSaveSchedule} onAddService={handleAddService} onAddDay={handleAddDay} />
                </div>
              </div>
            </Card>
          </div>

          {/* schedule cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weekDays.map((day) => {
              const formattedDate = format(day, "yyyy-MM-dd");
              const dailySchedule = weeklySchedule[formattedDate] || {};
              return <ScheduleCard key={formattedDate} day={day} dailySchedule={dailySchedule} services={services} />;
            })}
          </div>
        </div>
      </main>
    </LayoutWithBack>
  );
}
