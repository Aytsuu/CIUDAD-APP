// ScheduleCard.tsx
import React from 'react';
import { View, Text } from 'react-native'; // Removed StyleSheet as it's not used for direct styling here
import { format } from 'date-fns';
import { ScheduleCardProps, ServiceTimeSlots } from './schedule-types';

export default function ScheduleCard({ day, dailySchedule, services }: ScheduleCardProps) {
  const displayDate = format(day, "EEEE");
  const displayFullDate = format(day, "MMM d");

  const scheduledServices = services.filter((service) => {
    const serviceTimeSlots: ServiceTimeSlots = dailySchedule[service] || { AM: false, PM: false };
    return serviceTimeSlots.AM || serviceTimeSlots.PM;
  });

  return (
    <View className="bg-white rounded-lg w-[48%] mb-4 shadow-md"> {/* w-[48%] is key for two columns */}
      <View className="p-3 border-b border-gray-200">
        <Text className="text-lg font-bold text-gray-800">
          {displayDate}
          <Text className="text-sm font-normal text-gray-600"> {displayFullDate}</Text>
        </Text>
      </View>
      <View className="p-3">
        {scheduledServices.length > 0 ? (
          <View className="space-y-2">
            {scheduledServices.map((service) => {
              const serviceTimeSlots: ServiceTimeSlots = dailySchedule[service] || { AM: false, PM: false };
              const activeSlots: string[] = [];
              if (serviceTimeSlots.AM) activeSlots.push("AM");
              if (serviceTimeSlots.PM) activeSlots.push("PM");

              return (
                <View key={service} className="flex-col">
                  <Text className="text-sm font-medium text-gray-800">{service}</Text>
                  <View className="flex-row mt-1">
                    {activeSlots.map((slot) => (
                      <View key={slot} className="bg-blue-100 rounded-full py-1 px-2 mr-1">
                        <Text className="text-xs text-blue-600 font-bold">{slot}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <Text className="text-sm text-gray-600">No services scheduled</Text>
        )}
      </View>
    </View>
  );
}
