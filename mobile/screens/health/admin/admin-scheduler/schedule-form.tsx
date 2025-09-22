import React, { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from "react-native"
import { Plus, X, Calendar, CheckSquare, Square } from "lucide-react-native"
import type { ServiceScheduleFormProps, WeeklySchedule, DailySchedule, ServiceTimeSlots } from "./schedule-types"
import { useAddDay, useAddScheduler, useAddService } from "./queries/schedulerAddQueries"
import { useGetDays, useGetServices } from "./queries/schedulerFetchQueries"
import { useDeleteService, useDeleteDay } from "./queries/schedulerDeleteQueries"

// Custom Checkbox component with better visual feedback
interface CustomCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ id, checked, onCheckedChange, label }) => (
  <TouchableOpacity
    className="flex-row items-center space-x-2 p-2 rounded-md border border-gray-300 bg-white"
    onPress={() => onCheckedChange(!checked)}
    accessibilityRole="checkbox"
    accessibilityState={{ checked }}
    style={{ 
      borderColor: checked ? '#3B82F6' : '#D1D5DB',
      backgroundColor: checked ? '#EFF6FF' : '#FFFFFF'
    }}
  >
    {checked ? (
      <CheckSquare className="h-5 w-5 text-blue-600" />
    ) : (
      <Square className="h-5 w-5 text-gray-400" />
    )}
    <Text className="text-sm text-gray-600">{label}</Text>
  </TouchableOpacity>
);


// Define the ServiceScheduleForm component
export default function ServiceScheduleForm({
  initialSchedule,
  weekDays: initialWeekDays, // Renamed to avoid conflict with local state 'days'
  services: initialServices,
  onSave,
  onAddService,
  onAddDay, // Now explicitly part of props
  onClose, // Added onClose prop
}: ServiceScheduleFormProps) {

  // fetch services and days
  const { data: servicesData, isLoading: isLoadingServices } = useGetServices()
  const { data: daysData, isLoading: isLoadingDays } = useGetDays()

  const [currentWeeklySchedule, setCurrentWeeklySchedule] = useState<WeeklySchedule>(initialSchedule)
  const [days, setDays] = useState<string[]>([]); // This will hold day names like "Monday", "Tuesday"
  const [services, setServices] = useState<string[]>(initialServices || [])
  const [newServiceName, setNewServiceName] = useState("")
  const [isAddingService, setIsAddingService] = useState(false)
  const [isAddingDay, setIsAddingDay] = useState(false)

  // mutation hook
  const addServiceMutation = useAddService()
  const addDayMutation = useAddDay()
  const addSchedulerMutation = useAddScheduler()

  const deleteServiceMutation = useDeleteService()
  const deleteDayMutation = useDeleteDay()

  const sortDaysInWeekOrder = (dayNames: string[]): string[] => {
    const weekDaysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    return dayNames.sort((a, b) => {
      const indexA = weekDaysOrder.indexOf(a)
      const indexB = weekDaysOrder.indexOf(b)

      if(indexA === -1 || indexB === -1) return a.localeCompare(b)
      if(indexA === -1) return 1
      if(indexB === -1) return -1

      return indexA - indexB
    })
  }

  const getNextAvailableDay = (): string => {
    const weekDaysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    for(const day of weekDaysOrder) {
      if(!days.includes(day)) {
        return day
      }
    }

    return `Day ${days.length + 1}` 
  }
  
  // update fetched services
  useEffect(() => {
    if (servicesData && servicesData.length > 0) {
      const serviceNames = servicesData.map(service => service.service_name)
      setServices(serviceNames)
    }
  }, [servicesData])

  // update fetched days
  useEffect(() => {
    if(daysData && daysData.length > 0) {
      const dayNames = daysData.map(day => day.day)
      const sortedDays = sortDaysInWeekOrder(dayNames)
      setDays(sortedDays)
    }
  }, [daysData])

  // update internal state if initialSchedule prop changes
  useEffect(() => {
    setCurrentWeeklySchedule(initialSchedule)
  }, [initialSchedule])

    const handleServiceToggle = (
    dayName: string,
    serviceName: string,
    timeSlot: keyof ServiceTimeSlots,
    checked: boolean,
  ) => {
    console.log("Toggling:", dayName, serviceName, timeSlot, checked);
    
    setCurrentWeeklySchedule((prevSchedule) => {
      const prevDailySchedule: DailySchedule = prevSchedule[dayName] || {}
      const prevServiceTimeSlots: ServiceTimeSlots = prevDailySchedule[serviceName] || { AM: false, PM: false }
      
      const updatedServiceTimeSlots: ServiceTimeSlots = {
        ...prevServiceTimeSlots,
        [timeSlot]: checked,
      }
      
      const updatedDailySchedule: DailySchedule = {
        ...prevDailySchedule,
        [serviceName]: updatedServiceTimeSlots,
      }
      
      return {
        ...prevSchedule,
        [dayName]: updatedDailySchedule,
      }
    })
  }

  // add service
  const handleAddService = async () => {
    if (newServiceName.trim() && !services.includes(newServiceName.trim())) {
      try {
        await addServiceMutation.mutateAsync({ service_name: newServiceName.trim() })
        
        setNewServiceName("")
        setIsAddingService(false)
        onAddService(newServiceName.trim()) // Call prop function to update parent state

      } catch (error: any) {
        console.error("Error adding service: ", error)
      }
    }
  }

  // remove service
  const handleRemoveService = async (service: string) => {
    try {
        const serviceObj = servicesData?.find(s => s.service_name === service)
        if (!serviceObj) {
          console.error("Service not found: ", service)
          return
        }

        await deleteServiceMutation.mutateAsync(serviceObj.service_id)

        // Optimistically update UI or wait for refetch
        setServices(prev => prev.filter(s => s !== service)) // Filter by 's' not 'service'
        
        // Remove from schedule state if it exists
        setCurrentWeeklySchedule(prev => {
          const updatedSchedule = { ...prev }
          Object.keys(updatedSchedule).forEach(day => {
            if (updatedSchedule[day][service]) { // Check by service name
              delete updatedSchedule[day][service] // Delete by service name
            }
          })
          return updatedSchedule
        })
        
        console.log(`Removed service: ${service}`)
    } catch (error: any) {
      console.error("Error removing service:", error)
    }
  }

  // add day
  const handleAddDay = async () => {
    if (days.length >= 7) { // Use local 'days' state for count
      return
    }

    const nextDay = getNextAvailableDay()

    try {
      await addDayMutation.mutateAsync({day: nextDay, day_description: `${nextDay} Schedule`})
      onAddDay(new Date()) // Call prop function to update parent state (SchedulerMain)
      setIsAddingDay(false) // Close the input field
      console.log("Successfully added day: ", nextDay)
    } catch (error: any) {
      console.error("Error adding day: ", error)
    }
  }

  // remove day
  const handleRemoveDay = async (day: string) => {
  try {
    const dayObj = daysData?.find(d => d.day === day)

    if (!dayObj) {
          console.error("Day not found: ", day)
          return
        }
    
      await deleteDayMutation.mutateAsync(dayObj.day_id)

    // Optimistically update UI or wait for refetch
    setDays(prev => prev.filter(d => d !== day)) // Filter by 'd' not 'day'
    
    setCurrentWeeklySchedule(prev => {
      const updatedSchedule = { ...prev }
      // Remove the entire day's schedule
      if (updatedSchedule[day]) {
        delete updatedSchedule[day]
      }
      return updatedSchedule
    })
    
    console.log(`Removed day: ${day}`)
  } catch (error: any) {
    console.error("Error removing day:", error)
  }
}

  // updated handleSave to create individual scheduler entries using your API
  const handleSave = async () => {
    try {
      console.log("Saving weekly schedule: ", currentWeeklySchedule);

      const schedulerEntries = [];
      for (const dayName of days) { // Iterate over the current 'days' state
        const dailySchedule = currentWeeklySchedule[dayName] || {};

        for (const [serviceName, timeSlots] of Object.entries(dailySchedule)) {
          if(timeSlots.AM) {
            schedulerEntries.push({
              service_name: serviceName,
              day: dayName,
              meridiem: "AM" as const,
            })
          }
          if(timeSlots.PM) {
            schedulerEntries.push({
              service_name: serviceName,
              day: dayName,
              meridiem: "PM" as const,
            })
          }
        }
      }
      console.log('Scheduler entries to create: ', schedulerEntries)

      // This part needs careful consideration for bulk creation vs individual.
      // The current mutation is for individual entries.
      // If your API supports bulk creation, you might want a different mutation.
      // For now, it will call addSchedulerMutation for each entry.
      const createdEntries = []
      for (const entry of schedulerEntries) {
        const result = await addSchedulerMutation.mutateAsync(entry)
        createdEntries.push(result)
      }
      console.log("Created scheduler entries: ", createdEntries);

      onSave(currentWeeklySchedule) // Call parent save handler
      onClose && onClose(); // Close modal after successful save
    } catch (error: any){ 
      console.error("Error saving schedule: ", error)
    }
  }

  if (isLoadingServices || isLoadingDays) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-gray-600">Loading schedule data...</Text>
      </View>
    );
  }


  return (
    // Card
    <View className="w-full bg-white rounded-lg shadow-md overflow-hidden flex-1"> {/* flex-1 to allow ScrollView */}
      {/* CardHeader */}
      <View className="p-4 pb-2">
        {/* CardTitle */}
        <Text className="text-xl font-semibold text-gray-800">Weekly Service Schedule Editor</Text>
        {/* CardDescription */}
        <Text className="text-sm text-gray-500 mt-1">Manage service availability and add new services or days as needed.</Text>
      </View>
      
      <ScrollView className="flex-1 p-4"> {/* Scrollable content */}
        <View className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Use flex-col for mobile, wrap for larger screens */}
          {/* Add Service Section */}
          <View className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <View className="flex-row items-center gap-2 mb-3">
              <Plus className="h-4 w-4 flex-shrink-0 text-gray-700" />
              <Text className="text-sm font-medium text-gray-700">Add Service:</Text>
            </View>
            {isAddingService ? (
              <View className="flex-row items-center gap-2">
                <TextInput
                  placeholder="Enter service name"
                  value={newServiceName}
                  onChangeText={setNewServiceName}
                  className="flex-1 border border-gray-300 rounded-md p-2 text-sm" // Mimics Input
                  onSubmitEditing={handleAddService} // Trigger on keyboard "Done"
                />
                <TouchableOpacity
                  onPress={handleAddService}
                  disabled={!newServiceName.trim() || addServiceMutation.isPending}
                  className={`px-3 py-2 rounded-md ${addServiceMutation.isPending ? 'bg-blue-300' : 'bg-blue-600'}`} // Mimics Button
                >
                  {addServiceMutation.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-white text-sm font-semibold">Add</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setIsAddingService(false)
                    setNewServiceName("")
                  }}
                  className="px-2 py-2 rounded-md border border-gray-300" // Mimics Button variant="outline"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setIsAddingService(true)}
                className="flex-row items-center gap-2 px-3 py-2 rounded-md border border-gray-300 bg-white" // Mimics Button variant="outline"
              >
                <Plus className="h-4 w-4 text-gray-700" />
                <Text className="text-gray-700 font-semibold text-sm">Add New Service</Text>
              </TouchableOpacity>
            )}

            <View className="mt-4">
              {services.length > 0 ? (
                <View className="space-y-2">
                  <Text className="text-xs text-gray-500 font-medium">Active Services:</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {services.map((service) => (
                      <View 
                        key={service} 
                        className="flex-row items-center gap-2 border border-blue-200 rounded-lg px-3 py-1.5 bg-blue-50"
                      >
                        <Text className="text-blue-800 text-sm font-medium">{service}</Text>
                        <TouchableOpacity 
                          onPress={() => handleRemoveService(service)}
                          className="p-1" // Make touchable area larger
                          disabled={deleteServiceMutation.isPending}
                        >
                          {deleteServiceMutation.isPending ? (
                            <ActivityIndicator size="small" color="#60A5FA" />
                          ) : (
                            <X className="h-3 w-3 text-blue-400" />
                          )}
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <View className="text-center py-4 border border-dashed border-gray-300 rounded-lg">
                  <Text className="text-gray-400 text-sm">No services available. Please add a service.</Text>
                </View>
              )}
            </View>
          </View>

          {/* Add Day Section */}
          <View className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <View className="flex-row items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 flex-shrink-0 text-gray-700" />
              <Text className="text-sm font-medium text-gray-700">Add Day:</Text>
            </View>
            {isAddingDay ? (
              <View className="flex-row items-center gap-2">
                <TextInput
                  value={getNextAvailableDay()}
                  editable={false} // Not editable, just displays next available day
                  className="flex-1 border border-gray-300 rounded-md p-2 text-sm bg-gray-100 text-gray-700" // Mimics Input
                />
                <TouchableOpacity
                  onPress={handleAddDay}
                  disabled={days.length >= 7 || addDayMutation.isPending}
                  className={`px-3 py-2 rounded-md ${days.length >= 7 || addDayMutation.isPending ? 'bg-blue-300' : 'bg-blue-600'}`} // Mimics Button
                >
                  {addDayMutation.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-white text-sm font-semibold">Add Day</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsAddingDay(false)}
                  className="px-2 py-2 rounded-md border border-gray-300" // Mimics Button variant="outline"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setIsAddingDay(true)}
                disabled={days.length >= 7}
                className={`flex-row items-center gap-2 px-3 py-2 rounded-md border border-gray-300 bg-white ${days.length >= 7 ? 'opacity-50' : ''}`} // Mimics Button variant="outline"
              >
                <Calendar className="h-4 w-4 text-gray-700" />
                <Text className="text-gray-700 font-semibold text-sm">
                  Add New Day
                  {days.length >= 7 && " (Max 7)"}
                </Text>
              </TouchableOpacity>
            )}

            <View className="mt-4">
              {days.length > 0 ? (
                <View className="space-y-2">
                  <Text className="text-xs text-gray-500 font-medium">Active Days:</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {days.map((day) => (
                      <View 
                        key={day} 
                        className="flex-row items-center gap-2 border border-green-200 rounded-lg px-3 py-1.5 bg-green-50"
                      >
                        <Text className="text-green-800 text-sm font-medium">{day}</Text>
                        <TouchableOpacity 
                          onPress={() => handleRemoveDay(day)}
                          className="p-1" // Make touchable area larger
                          disabled={deleteDayMutation.isPending}
                        >
                          {deleteDayMutation.isPending ? (
                            <ActivityIndicator size="small" color="#60A5FA" />
                          ) : (
                            <X className="h-3 w-3 text-green-400" />
                          )}
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <View className="text-center py-4 border border-dashed border-gray-300 rounded-lg">
                  <Text className="text-gray-400 text-sm">No days available. Please add a day.</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Separator */}
        <View className="h-px bg-gray-200 my-6" />

        {/* Schedule Grid */}
        <View className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {days.map((dayName) => {
            const currentDaySchedule: DailySchedule = currentWeeklySchedule[dayName] || {}

            return (
              <View key={dayName} className="border border-gray-200 rounded-lg p-4 bg-white">
                <Text className="border border-gray-300 rounded-md p-1 text-lg text-center font-semibold mb-5">{dayName}</Text>
                <View className="grid gap-3">
                  {services.length === 0 ? (
                    <View className="text-center text-sm text-gray-400 py-4">
                      <Text className="text-gray-400 text-sm">No services available. Please add a service to manage the schedule.</Text>
                    </View>
                  ) : (
                    services.map((service) => {
                      const serviceTimeSlots: ServiceTimeSlots = currentDaySchedule[service] || { AM: false, PM: false }

                      return (
                        <View key={`${dayName}-${service}`} className="flex-row items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                          <Text className="text-base font-medium flex-1">{service}</Text>
                          <View className="flex-row items-center gap-2 pl-4">
                            <CustomCheckbox
                              id={`${dayName}-${service}-am`}
                              checked={serviceTimeSlots.AM}
                              onCheckedChange={(checked) =>
                                handleServiceToggle(dayName, service, "AM", checked)
                              }
                              label="AM"
                            />
                            <CustomCheckbox
                              id={`${dayName}-${service}-pm`}
                              checked={serviceTimeSlots.PM}
                              onCheckedChange={(checked) =>
                                handleServiceToggle(dayName, service, "PM", checked)
                              }
                              label="PM"
                            />
                          </View>
                        </View>
                      )
                    })
                  )}
                </View>
              </View>
            )
          })}
        </View>

        {days.length === 0 && (
          <View className="text-center py-8 items-center">
            <Calendar className="h-12 w-12 mb-4 text-gray-300" />
            <Text className="text-gray-500">No days available. Add some days to get started.</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleSave}
          className={`w-full mt-4 px-4 py-3 rounded-md ${addSchedulerMutation.isPending ? 'bg-blue-300' : 'bg-blue-600'}`} // Mimics Button
          disabled={addSchedulerMutation.isPending}
        >
          {addSchedulerMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white text-center font-semibold text-base">Save Weekly Schedule</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}