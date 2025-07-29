// ScheduleForm.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { format } from 'date-fns';
import { useAddScheduler } from './queries/schedulerAddQueries'; // Reusing mutation hook
import { ServiceScheduleFormProps, WeeklySchedule, ServiceTimeSlots, DailySchedule } from './schedule-types';

export default function ServiceScheduleForm({
  initialSchedule,
  weekDays,
  services,
  onSave,
  onAddService,
}: ServiceScheduleFormProps) {
  const [currentWeeklySchedule, setCurrentWeeklySchedule] = useState<WeeklySchedule>(initialSchedule);
  const [newServiceName, setNewServiceName] = useState("");
  const [isAddingService, setIsAddingService] = useState(false);

  const addSchedulerMutation = useAddScheduler();

  useEffect(() => {
    setCurrentWeeklySchedule(initialSchedule);
  }, [initialSchedule]);

  const handleServiceToggle = (
    date: string,
    serviceName: string,
    timeSlot: keyof ServiceTimeSlots,
    checked: boolean,
  ) => {
    setCurrentWeeklySchedule((prevSchedule) => {
      const prevDailySchedule: DailySchedule = prevSchedule[date] || {};
      const prevServiceTimeSlots: ServiceTimeSlots = prevDailySchedule[serviceName] || { AM: false, PM: false };

      const updatedServiceTimeSlots: ServiceTimeSlots = {
        ...prevServiceTimeSlots,
        [timeSlot]: checked,
      };

      const updatedDailySchedule: DailySchedule = {
        ...prevDailySchedule,
        [serviceName]: updatedServiceTimeSlots,
      };

      return {
        ...prevSchedule,
        [date]: updatedDailySchedule,
      };
    });
  };

  const handleAddService = () => {
    if (newServiceName.trim() && !services.includes(newServiceName.trim())) {
      onAddService(newServiceName.trim());
      setNewServiceName("");
      setIsAddingService(false);
    }
  };

  const handleSave = async () => {
    try {
      console.log("Saving weekly schedule:", currentWeeklySchedule);

      const schedulerEntries = [];
      for (const [date, dailySchedule] of Object.entries(currentWeeklySchedule)) {
        for (const [serviceName, timeSlots] of Object.entries(dailySchedule)) {
          if (timeSlots.AM) {
            schedulerEntries.push({
              service: serviceName,
              meridiem: 'AM' as const,
              // Conceptual: You would also need to include the 'date' here
              // date: date,
            });
          }
          if (timeSlots.PM) {
            schedulerEntries.push({
              service: serviceName,
              meridiem: 'PM' as const,
              // Conceptual: You would also need to include the 'date' here
              // date: date,
            });
          }
        }
      }

      console.log("Scheduler entries to create:", schedulerEntries);

      // This part needs careful consideration for a real app:
      // 1. You might want to delete existing entries for the week before adding new ones.
      // 2. The current backend only supports 'create', not 'update' or 'delete' for a full weekly sync.
      // For this example, we'll just add new entries.
      for (const entry of schedulerEntries) {
        console.log("Creating scheduler entry:", entry);
        const result = await addSchedulerMutation.mutateAsync(entry);
        console.log("Created scheduler with ID:", result);
      }

      console.log("All scheduler entries created.");
      onSave(currentWeeklySchedule);

    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  return (
    <ScrollView className="w-full max-h-full">
      <View className="p-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-800">Weekly Service Schedule Editor</Text>
        <Text className="text-sm text-gray-600 mt-1">Manage service availability for Monday to Friday, including AM/PM slots.</Text>
      </View>
      <View className="p-4">
        {/* Add Service Section */}
        <View className="p-4 bg-gray-50 rounded-lg mb-5">
          {isAddingService ? (
            <View className="flex-row items-center gap-2">
              <TextInput
                className="flex-1 h-10 border border-gray-300 rounded-md px-2.5 bg-white"
                placeholder="Enter new service name"
                value={newServiceName}
                onChangeText={setNewServiceName}
                onSubmitEditing={handleAddService}
              />
              <TouchableOpacity className="bg-blue-500 py-2 px-4 rounded-md" onPress={handleAddService} disabled={!newServiceName.trim()}>
                <Text className="text-white font-bold">Add</Text>
              </TouchableOpacity>
              <TouchableOpacity className="border border-gray-300 py-2 px-2.5 rounded-md" onPress={() => { setIsAddingService(false); setNewServiceName(""); }}>
                <Text className="text-gray-800">X</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity className="border border-gray-300 py-2.5 px-4 rounded-lg flex-row items-center justify-center" onPress={() => setIsAddingService(true)}>
              <Text className="text-gray-800 font-bold">+ Add New Service</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Schedule Grid */}
        {weekDays.map((day, index) => {
          const formattedDate = format(day, "yyyy-MM-dd");
          const displayDate = format(day, "EEEE, MMM d");
          const currentDaySchedule: DailySchedule = currentWeeklySchedule[formattedDate] || {};

          return (
            <View key={formattedDate} className="mb-5">
              <Text className="text-lg font-bold mb-2.5 text-gray-800">{displayDate}</Text>
              <View className="gap-3">
                {services.map((service) => {
                  const serviceTimeSlots: ServiceTimeSlots = currentDaySchedule[service] || { AM: false, PM: false };
                  return (
                    <View key={`${formattedDate}-${service}`} className="flex-row items-center justify-between pl-4">
                      <Text className="text-base font-medium text-gray-800 flex-1">{service}</Text>
                      <View className="flex-row items-center ml-5">
                        <Text className="text-sm text-gray-600 mr-2.5">AM</Text>
                        <Switch
                          value={serviceTimeSlots.AM}
                          onValueChange={(checked) => handleServiceToggle(formattedDate, service, "AM", checked)}
                        />
                      </View>
                      <View className="flex-row items-center ml-5">
                        <Text className="text-sm text-gray-600 mr-2.5">PM</Text>
                        <Switch
                          value={serviceTimeSlots.PM}
                          onValueChange={(checked) => handleServiceToggle(formattedDate, service, "PM", checked)}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
              {index < weekDays.length - 1 && <View className="h-px bg-gray-200 my-6" />}
            </View>
          );
        })}

        <TouchableOpacity
          className={`bg-blue-500 py-4 rounded-lg items-center mt-5 ${addSchedulerMutation.isPending ? 'bg-blue-300' : ''}`}
          onPress={handleSave}
          disabled={addSchedulerMutation.isPending}
        >
          {addSchedulerMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-lg font-bold">Save Weekly Schedule</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
