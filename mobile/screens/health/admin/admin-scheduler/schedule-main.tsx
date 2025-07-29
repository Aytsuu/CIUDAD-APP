// SchedulerMain.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { format, startOfWeek, addDays } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useGetUniqueServices, useGetServices } from './queries/schedulerFetchQueries';
import type { WeeklySchedule, DailySchedule } from './schedule-types';
import ScheduleCard from './schedule-card';
import ScheduleDialog from './schedule-dialog';

interface SchedulerMainProps {
  onGoBack: () => void;
}

export default function SchedulerMain({ onGoBack }: SchedulerMainProps) {
  const { data: servicesFromDB = [], isLoading: servicesLoading, error: servicesError } = useGetUniqueServices();
  const { data: schedulersFromDB = [], isLoading: schedulersLoading } = useGetServices();

  const [services, setServices] = useState<string[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({});
  const [weekDays, setWeekDays] = useState<Date[]>([]);

  useEffect(() => {
    if (servicesFromDB.length > 0) {
      setServices(servicesFromDB);
    }
  }, [servicesFromDB]);

  useEffect(() => {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1, locale: enUS });
    const days: Date[] = [];
    for (let i = 0; i < 5; i++) { // Monday to Friday
      days.push(addDays(monday, i));
    }
    setWeekDays(days);

    if (schedulersFromDB.length > 0 && servicesFromDB.length > 0) {
      const scheduleFromDB: WeeklySchedule = {};

      days.forEach((day) => {
        const formattedDate = format(day, "yyyy-MM-dd");
        const daily: DailySchedule = {};

        servicesFromDB.forEach(serviceName => {
          daily[serviceName] = { AM: false, PM: false };
        });

        schedulersFromDB.forEach(scheduler => {
          if (daily[scheduler.service]) {
            daily[scheduler.service][scheduler.meridiem] = true;
          }
        });
        scheduleFromDB[formattedDate] = daily;
      });
      setWeeklySchedule(scheduleFromDB);
    } else {
      const emptySchedule: WeeklySchedule = {};
      days.forEach((day) => {
        const formattedDate = format(day, "yyyy-MM-dd");
        const daily: DailySchedule = {};
        servicesFromDB.forEach(serviceName => {
          daily[serviceName] = { AM: false, PM: false };
        });
        emptySchedule[formattedDate] = daily;
      });
      setWeeklySchedule(emptySchedule);
    }
  }, [schedulersFromDB, servicesFromDB]);

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

  if (servicesLoading || schedulersLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-2.5 text-base text-gray-800">Loading services...</Text>
      </View>
    );
  }

  if (servicesError) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-base text-red-500">Error loading services. Please try again later.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="mb-5 items-center">
        <TouchableOpacity onPress={onGoBack} className="self-start mb-2.5 p-1.5">
          <Text className="text-base text-blue-500">{'< Back'}</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Service Scheduler</Text>
        <Text className="text-base text-gray-600 mt-1.5">Schedule services for the week</Text>
      </View>

      <View className="mb-5">
        <View className="bg-white rounded-lg shadow-md">
          <View className="p-4 border-b border-gray-200">
            <Text className="text-lg font-bold text-gray-800">Available Services</Text>
            <Text className="text-sm text-gray-600 mt-1">
              Current services that can be scheduled
            </Text>
          </View>
          <View className="p-4">
            <View className="flex-row flex-wrap gap-2">
              {services.map((service) => (
                <View key={service} className="bg-blue-100 rounded-full py-1.5 px-3">
                  <Text className="text-sm text-blue-800">{service}</Text>
                </View>
              ))}
            </View>
            {services.length === 0 && (
              <Text className="text-sm text-gray-600 mt-2.5">
                No services found. Add some services to get started.
              </Text>
            )}
          </View>
          <View className="p-4 items-end">
            <ScheduleDialog
              weeklySchedule={weeklySchedule}
              weekDays={weekDays}
              services={services}
              onSave={handleSaveSchedule}
              onAddService={handleAddService}
            />
          </View>
        </View>
      </View>

      {/* This is the key part for the grid layout */}
      <View className="flex-row flex-wrap justify-between gap-4">
        {weekDays.map((day) => {
          const formattedDate = format(day, "yyyy-MM-dd");
          const dailySchedule = weeklySchedule[formattedDate] || {};
          return (
            <ScheduleCard key={formattedDate} day={day} dailySchedule={dailySchedule} services={services} />
          );
        })}
      </View>
    </ScrollView>
  );
}
