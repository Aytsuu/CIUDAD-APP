import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { format } from "date-fns";
import { useGetScheduler, useGetServices } from "./queries/schedulerFetchQueries";

// Define interfaces for type safety
interface Service {
  service_name: string;
}

interface SchedulerGetData {
  day: string;
  service_name: string;
  meridiem: "AM" | "PM";
}

interface ServiceTimeSlots {
  AM: boolean;
  PM: boolean;
}

interface DailySchedule {
  [serviceName: string]: ServiceTimeSlots;
}

interface TodayScheduleWidgetProps {
  onViewWeeklySchedule?: () => void;
}

interface UseQueryResult<T> {
  data: T;
  isLoading: boolean;
  error: Error | null;
}

export default function TodayScheduleWidget({ onViewWeeklySchedule }: TodayScheduleWidgetProps) {
  const { data: servicesData = [], isLoading: servicesLoading, error: servicesError } = useGetServices();
  const { data: schedulersData = [], isLoading: schedulersLoading, error: schedulersError } = useGetScheduler();

  const [dailySchedule, setDailySchedule] = useState<DailySchedule>({});
  const [services, setServices] = useState<string[]>([]);

  useEffect(() => {
    if (servicesData.length > 0) {
      const serviceNames = servicesData.map((s) => s.service_name);
      setServices(serviceNames);
    }
  }, [servicesData]);

  useEffect(() => {
    if (servicesData.length > 0) {
      const today = new Date();
      const todayDayName = format(today, "EEEE");
      const currentDaily: DailySchedule = {};

      // Initialize all services for today
      servicesData.forEach((service) => {
        currentDaily[service.service_name] = { AM: false, PM: false };
      });

      // Populate schedule based on today's entries
      schedulersData.forEach((scheduler) => {
        if (scheduler.day === todayDayName && currentDaily[scheduler.service_name]) {
          currentDaily[scheduler.service_name][scheduler.meridiem] = true;
        }
      });

      setDailySchedule(currentDaily);
    }
  }, [schedulersData, servicesData]);

  const scheduledServices = useMemo(() => {
    return services.filter((serviceName) => {
      const serviceTimeSlots: ServiceTimeSlots = dailySchedule[serviceName] || { AM: false, PM: false };
      return serviceTimeSlots.AM || serviceTimeSlots.PM;
    });
  }, [services, dailySchedule]);

  if (servicesLoading || schedulersLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-2 text-base text-gray-700">Loading today's schedule...</Text>
      </View>
    );
  }

  if (servicesError || schedulersError) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-red-50 rounded-lg">
        <Text className="text-base text-red-600 text-center">Unable to load today's schedule.</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-600 py-2 px-4 rounded-lg"
          onPress={() => {
            // Trigger refetch (assuming hooks support refetch)
            // Replace with actual refetch logic if available
          }}
          accessibilityLabel="Retry loading schedule"
        >
          <Text className="text-white text-base font-bold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-lg mx-0.5 my-0.5 shadow-md shadow-black/20 elevation-3">
      <View className="p-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-800">Today's Schedule</Text>
        <Text className="text-sm text-gray-600 mt-1">{format(new Date(), "EEEE, MMM d")}</Text>
      </View>
      <View className="p-4">
        {scheduledServices.length > 0 ? (
          <View className="mb-2">
            {scheduledServices.map((serviceName) => {
              const serviceTimeSlots: ServiceTimeSlots = dailySchedule[serviceName] || { AM: false, PM: false };
              const activeSlots: string[] = [];
              if (serviceTimeSlots.AM) activeSlots.push("AM");
              if (serviceTimeSlots.PM) activeSlots.push("PM");

              return (
                <View key={serviceName} className="flex-col mb-2">
                  <Text className="text-base font-medium text-gray-800">{serviceName}</Text>
                  <View className="flex-row mt-1">
                    {activeSlots.map((slot) => (
                      <View key={slot} className="bg-blue-100 rounded-full px-2 py-1 mr-1">
                        <Text className="text-xs font-bold text-blue-600">{slot}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <Text className="text-sm text-gray-600 text-center mb-2">No services scheduled for today.</Text>
        )}
        <TouchableOpacity
          className="bg-blue-600 py-3 px-5 rounded-lg items-center mt-2"
          onPress={onViewWeeklySchedule}
          accessibilityLabel="View weekly schedule"
        >
          <Text className="text-white text-base font-bold">View Weekly Schedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}