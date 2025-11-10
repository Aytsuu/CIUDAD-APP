import React, { useState, useEffect } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { enUS } from "date-fns/locale";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useGetServices, useGetScheduler, useGetDays } from "./queries/schedulerFetchQueries";
import { DailySchedule, WeeklySchedule } from "./schedule-types";
import ScheduleDialog from "./schedule-dialog";
import ScheduleCard from "./schedule-card"; // Assuming this is updated as per the sample below
import PageLayout from "@/screens/_PageLayout";
import { router } from "expo-router";
import { ChevronLeft, Plus } from "lucide-react-native"; // Added Plus icon for dialog trigger
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/contexts/AuthContext";

export default function SchedulerMain() {
  const { user, hasCheckedAuth } = useAuth();
  const isAdmin = !!user?.staff;

  const { data: servicesData = [], isLoading: isLoadingServices, error: servicesError } = useGetServices();
  const { data: schedulersData = [], isLoading: isLoadingSchedulers, error: schedulersError } = useGetScheduler();
  const { data: daysData = [], isLoading: isLoadingDays, error: daysError } = useGetDays();

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
            return addDays(monday, dayIndex);
          } else {
            console.error("Invalid day name from API:", dayData.day);
            return null;
          }
        })
        .filter((d): d is Date => d !== null);

      // Sort days consistently (Mon-Sun)
      days.sort((a, b) => {
        const dayOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon=1, ..., Sun=0
        return dayOrder.indexOf(a.getDay()) - dayOrder.indexOf(b.getDay());
      });
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

        servicesData.forEach((service) => {
          daily[service.service_name] = { AM: false, PM: false };
        });

        schedulersData.forEach((scheduler) => {
          if (scheduler.day === dayName && daily[scheduler.service_name]) {
            daily[scheduler.service_name][scheduler.meridiem] = true;
          }
        });

        schedule[formattedDate] = daily;
      });
      setWeeklySchedule(schedule);
    } else if (schedulersData.length === 0 && servicesData.length > 0 && weekDays.length > 0) {
      const schedule: WeeklySchedule = {};
      weekDays.forEach((day) => {
        const formattedDate = format(day, "yyyy-MM-dd");
        const daily: DailySchedule = {};
        servicesData.forEach((service) => {
          daily[service.service_name] = { AM: false, PM: false };
        });
        schedule[formattedDate] = daily;
      });
      setWeeklySchedule(schedule);
    }
  }, [schedulersData, servicesData, weekDays]);

  const handleSaveSchedule = (newSchedule: WeeklySchedule) => {
    setWeeklySchedule(newSchedule);
    console.log("Weekly schedule saved:", newSchedule);
    // Invalidate queries if using react-query
  };

  const handleAddService = (serviceName: string) => {
    if (!services.includes(serviceName)) {
      setServices((prev) => [...prev, serviceName]);
      setWeeklySchedule((prevSchedule) => {
        const updatedSchedule = { ...prevSchedule };
        Object.keys(updatedSchedule).forEach((dateKey) => {
          updatedSchedule[dateKey] = {
            ...updatedSchedule[dateKey],
            [serviceName]: { AM: false, PM: false },
          };
        });
        return updatedSchedule;
      });
    }
  };

  const handleAddDay = (newDay: Date) => {
    console.log("New day added (handled by data refetch):", newDay);
  };

  if (isLoadingServices || isLoadingSchedulers || isLoadingDays || !hasCheckedAuth) {
    return <LoadingState />;
  }

  if (servicesError || schedulersError || daysError) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
            <ChevronLeft size={24} className="text-slate-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-slate-900 text-[13px]">Weekly Schedules</Text>}
        rightAction={<View className="w-10 h-10" />}
      >
        <View className="flex-1 justify-center items-center bg-red-50 p-6 rounded-lg m-4 shadow-sm">
          <Text className="text-lg font-bold text-red-700 mb-2">Error Loading Data</Text>
          {servicesError && <Text className="text-red-600 text-center mb-1">Services: {servicesError.message}</Text>}
          {schedulersError && <Text className="text-red-600 text-center mb-1">Schedulers: {schedulersError.message}</Text>}
          {daysError && <Text className="text-red-600 text-center mb-1">Days: {daysError.message}</Text>}
          <Text className="text-red-600 text-center mt-4">Please check your connection and try again.</Text>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
          <ChevronLeft size={24} className="text-slate-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-slate-900 text-[13px]">Weekly Schedules</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView className="flex-1 bg-gray-50 px-4 py-6" contentContainerStyle={{ paddingBottom: 20 }}> {/* Added py-6 for more vertical spacing */}
        {isAdmin && (
          <View className="mb-6"> {/* Increased mb for section spacing */}
            <View className="bg-white rounded-xl shadow-sm overflow-hidden p-4"> {/* Softer shadow and larger rounded */}
              <View className="mb-3">
                <Text className="text-xl font-bold text-gray-800">Available Services</Text> {/* Bolder font */}
                <Text className="text-sm text-gray-500 mt-1">Services that can be scheduled this week</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {services.map((service) => (
                  <Text key={service} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {service}
                  </Text>
                ))}
              </View>
              {services.length === 0 && (
                <Text className="text-gray-500 text-sm mt-2">No services yet. Add some via the editor.</Text>
              )}
              <View className="mt-4 flex-row justify-end">
                <ScheduleDialog
                  weeklySchedule={weeklySchedule}
                  weekDays={weekDays}
                  services={services}
                  onSave={handleSaveSchedule}
                  onAddService={handleAddService}
                  onAddDay={handleAddDay}
                />
              </View>
            </View>
          </View>
        )}

        {/* Added section header for weekly cards */}
        <Text className="text-lg font-bold text-gray-800 mb-4">Daily Schedules</Text>

        <View className="flex-row flex-wrap justify-between">
          {weekDays.length === 0 ? (
            <View className="flex-1 justify-center items-center py-10 bg-white rounded-xl shadow-sm">
              <Text className="text-gray-500 text-base mb-2">No days configured yet.</Text>
              {isAdmin && (
                <TouchableOpacity className="flex-row items-center bg-blue-500 px-4 py-2 rounded-full">
                  <Plus size={16} color="white" className="mr-2" />
                  <Text className="text-white font-medium">Add Days</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            weekDays.map((day) => {
              const formattedDate = format(day, "yyyy-MM-dd");
              const dailySchedule = weeklySchedule[formattedDate] || {};
              return (
                <View key={formattedDate} className="w-full md:w-1/2 lg:w-1/3 p-2">
                  <ScheduleCard day={day} dailySchedule={dailySchedule} services={services} />
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </PageLayout>
  );
}