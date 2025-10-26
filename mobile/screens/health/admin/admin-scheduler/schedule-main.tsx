import React, { useState, useEffect } from "react"
import { format, startOfWeek, addDays } from "date-fns"
import { enUS } from "date-fns/locale"
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native" 
import { useGetServices,useGetScheduler,useGetDays } from "./queries/schedulerFetchQueries"
import { DailySchedule, WeeklySchedule } from "./schedule-types"
import ScheduleDialog from "./schedule-dialog"
import ScheduleCard from "./schedule-card"
import PageLayout from "@/screens/_PageLayout"
import { router } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { LoadingState } from "@/components/ui/loading-state"
import { useAuth } from "@/contexts/AuthContext"

const LayoutWithBack: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-4 border-b border-gray-200 bg-white">
        {/* You might add a back button here */}
        <Text className="text-xl font-bold text-gray-800">{title}</Text>
        <Text className="text-sm text-gray-500 mt-1">{description}</Text>
      </View>
      {children}
    </SafeAreaView>
  )
}


export default function SchedulerMain() {
  
  const { user, hasCheckedAuth } = useAuth(); // Access user and auth status
  
    // Determine user role
    const isAdmin = !!user?.staff; // Admin if staff object exists
    const isResident = !!user?.resident || !!user?.rp; // Resident if resident or rp exists

    const { data: servicesData = [], isLoading: isLoadingServices, error: servicesError } = useGetServices()
  const { data: schedulersData = [], isLoading: isLoadingSchedulers, error: schedulersError } = useGetScheduler()
  const { data: daysData = [], isLoading: isLoadingDays, error: daysError } = useGetDays()

  const [services, setServices] = useState<string[]>([])
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({})
  const [weekDays, setWeekDays] = useState<Date[]>([])

  useEffect(() => {
    if (servicesData.length > 0) {
      const serviceNames = servicesData.map((service) => service.service_name)
      setServices(serviceNames)
    }
  }, [servicesData])

  useEffect(() => {
    if(daysData.length > 0) {
      const today = new Date()
      // Ensure week starts on Monday for consistent day mapping
      const monday = startOfWeek(today, { weekStartsOn: 1, locale: enUS }) 

      const days = daysData.map((dayData) => {
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      const dayIndex = dayNames.indexOf(dayData.day)
      
      if (dayIndex !== -1) {
        // Monday = 0, Tuesday = 1, etc.
        return addDays(monday, dayIndex)
      } else {
        console.error('Invalid day name from API:', dayData.day)
        return null
      }
    }).filter((d): d is Date => d !== null) // Filter out any nulls from invalid day names

      // Sort the weekDays array to ensure consistent order (e.g., Mon, Tue, Wed...)
      days.sort((a, b) => a.getDay() - b.getDay()); // getDay() returns 0 for Sunday, 1 for Monday...
                                                    // This needs adjustment if weekStartsOn is Monday (1 for Mon, 2 for Tue, 0 for Sun)
                                                    // A more robust sort:
                                                    const sortedDays = days.sort((a, b) => {
                                                      const dayOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon, Tue, ..., Sat, Sun
                                                      return dayOrder.indexOf(a.getDay()) - dayOrder.indexOf(b.getDay());
                                                    });
      setWeekDays(sortedDays)
    }
  }, [daysData])

  useEffect(() => {
    if (schedulersData.length > 0 && servicesData.length > 0 && weekDays.length > 0) {
      const schedule: WeeklySchedule = {}

      weekDays.forEach((day) => {
        const formattedDate = format(day, "yyyy-MM-dd")
        const dayName = format(day, "EEEE") // e.g., "Monday"
        const daily: DailySchedule = {}

        // Initialize all services with false values for the current day
        servicesData.forEach((service) => {
          daily[service.service_name] = { AM: false, PM: false }
        })

        // Set actual scheduled services from database for the current day
        schedulersData.forEach((scheduler) => {
          if (scheduler.day === dayName && daily[scheduler.service_name]) {
            daily[scheduler.service_name][scheduler.meridiem] = true
          }
        })

        schedule[formattedDate] = daily
      })

      setWeeklySchedule(schedule)
    } else if (schedulersData.length === 0 && servicesData.length > 0 && weekDays.length > 0) {
      // If no scheduler data, but services and days exist, initialize an empty schedule
      const schedule: WeeklySchedule = {}
      weekDays.forEach((day) => {
        const formattedDate = format(day, "yyyy-MM-dd")
        const daily: DailySchedule = {}
        servicesData.forEach((service) => {
          daily[service.service_name] = { AM: false, PM: false }
        })
        schedule[formattedDate] = daily
      })
      setWeeklySchedule(schedule)
    } else {
      console.log("Waiting for all scheduler data (services, days, schedulers) to load or be available.")
    }
  }, [schedulersData, servicesData, weekDays])


  const handleSaveSchedule = (newSchedule: WeeklySchedule) => {
    setWeeklySchedule(newSchedule)
    console.log("Weekly schedule saved:", newSchedule)
    // Invalidate queries to refetch latest data after save
    // queryClient.invalidateQueries({ queryKey: ['schedulers'] });
    // queryClient.invalidateQueries({ queryKey: ['services'] });
    // queryClient.invalidateQueries({ queryKey: ['days'] });
  }

  const handleAddService = (serviceName: string) => {
    if (!services.includes(serviceName)) {
      setServices((prev) => [...prev, serviceName])
      console.log("New service added:", serviceName)
      // When a new service is added, you might want to update the weeklySchedule
      // to include this new service for all existing days, initialized to false.
      setWeeklySchedule(prevSchedule => {
        const updatedSchedule = { ...prevSchedule };
        Object.keys(updatedSchedule).forEach(dateKey => {
          updatedSchedule[dateKey] = {
            ...updatedSchedule[dateKey],
            [serviceName]: { AM: false, PM: false }
          };
        });
        return updatedSchedule;
      });
    }
  }

  const handleAddDay = (newDay: Date) => {
    // This function is called from schedule-form after a day is added via API.
    // The `daysData` query will refetch, and the `useEffect` for `weekDays` will update.
    // The `useEffect` for `weeklySchedule` will then re-initialize the schedule
    // including the new day.
    console.log("New day added (handled by data refetch):", newDay);
  }

  if (isLoadingServices || isLoadingSchedulers || isLoadingDays) {
    return <LoadingState/>
  }

  if (servicesError || schedulersError || daysError) {
    return (
      <LayoutWithBack title="Service Scheduler" description="Schedule services for the week">
        <View className="flex-1 justify-center items-center bg-red-50 p-4">
          <Text className="text-lg font-semibold text-red-700 mb-2">Error Loading Data</Text>
          {servicesError && <Text className="text-red-600 text-center">Services Error: {servicesError.message}</Text>}
          {schedulersError && <Text className="text-red-600 text-center">Schedulers Error: {schedulersError.message}</Text>}
          {daysError && <Text className="text-red-600 text-center">Days Error: {daysError.message}</Text>}
          <Text className="text-red-600 text-center mt-4">Please check your network connection or try again later.</Text>
        </View>
      </LayoutWithBack>
    )
  }


  return (
      <PageLayout
          leftAction={
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
            >
              <ChevronLeft size={24} className="text-slate-700" />
            </TouchableOpacity>
          }
          headerTitle={<Text className="text-slate-900 text-[13px]">Weekly Schedules</Text>}
          rightAction={<View className="w-10 h-10" />}
        >
      <ScrollView className="flex-1 bg-gray-50 p-4">
        {/* Services Overview */}
          {isAdmin && (
        <View className="mb-4 p-2">
          {/* Card */}

  <View className="flex-row bg-white rounded-lg shadow-md overflow-hidden">
            <View className="flex-1 p-4">
              {/* CardHeader */}
              <View className="pb-2">
                {/* CardTitle */}
                <Text className="text-lg font-semibold text-gray-800">Available Services</Text>
                {/* CardDescription */}
                <Text className="text-sm text-gray-500 mt-1">
                  Current services that can be scheduled
                </Text>
              </View>
              {/* CardContent */}
              <View className="pt-2">
                <View className="flex-row flex-wrap gap-2">
                  {services.map((service) => (
                    <Text key={service} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {service}
                    </Text>
                  ))}
                </View>
                {services.length === 0 && (
                  <Text className="text-gray-500 text-sm">No services found. Add some services to get started.</Text>
                )}
              </View>
            </View>

            {/* schedule dialog trigger */}
            <View className="justify-center items-center pr-5">
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


        {/* schedule cards grid */}
        <View className="flex-row flex-wrap justify-between"> {/* Use flex-wrap for grid-like layout */}
          {weekDays.length === 0 ? (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-gray-500 text-base">No days configured. Please add days to the schedule.</Text>
            </View>
          ) : (
            weekDays.map((day) => {
              const formattedDate = format(day, "yyyy-MM-dd")
              const dailySchedule = weeklySchedule[formattedDate] || {}
              return (
                <View key={formattedDate} className="w-full md:w-1/2 lg:w-1/3 p-2"> {/* Adjust width for grid columns */}
                  <ScheduleCard 
                    day={day} 
                    dailySchedule={dailySchedule} 
                    services={services} />
                </View>
              )
            })
          )}
        </View>
      </ScrollView>
      </PageLayout>
  )
}