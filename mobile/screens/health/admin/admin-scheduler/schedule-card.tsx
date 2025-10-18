import { format } from "date-fns"
import { View, Text, ScrollView } from "react-native"
import { Clock, Sun, Moon } from "lucide-react-native"
import type { DailySchedule } from "./schedule-types"

interface ScheduleCardProps {
  day: Date
  dailySchedule: DailySchedule
  services: string[]
}

export default function ScheduleCard({ day, dailySchedule, services }: ScheduleCardProps) {
  const dayName = format(day, "EEEE")
  const dateStr = format(day, "MMM d")

  // ✅ Get services for each meridiem that are actually scheduled
  const getServicesForMeridiem = (meridiem: "AM" | "PM") => {
    return services.filter(service => {
      const serviceTimeSlots = dailySchedule[service]
      return serviceTimeSlots && serviceTimeSlots[meridiem] === true
    })
  }

  const amServices = getServicesForMeridiem("AM")
  const pmServices = getServicesForMeridiem("PM")

  const hasAnyServices = amServices.length > 0 || pmServices.length > 0

  return (
    <View className="w-full bg-white rounded-lg shadow-md overflow-hidden mb-4">
      {/* CardHeader */}
      <View className="p-4 pb-3 flex-shrink-0 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <Text className="text-lg font-semibold text-gray-800">{dayName}</Text>
          </View>
          <Text className="text-sm font-normal text-gray-500">{dateStr}</Text>
        </View>
      </View>
      
      {/* CardContent */}
      <View className="p-4 pt-0">
        {!hasAnyServices ? (
          <View className="text-center py-8 items-center">
            <Clock className="h-8 w-8 mb-2 opacity-50 text-gray-400" />
            <Text className="text-sm text-gray-400">No services scheduled</Text>
          </View>
        ) : (
          <View className="space-y-3">
            {/* AM Services */}
            <View className="border border-amber-200 rounded-lg p-3 bg-amber-50">
              <View className="flex-row items-center gap-2 mb-2">
                <Sun className="h-4 w-4 text-amber-600" />
                <Text className="font-semibold text-amber-800 text-base">Morning (AM)</Text>
                <View className="px-2 py-1 rounded-full bg-amber-200">
                  <Text className="text-xs text-amber-800">
                    {amServices.length} service{amServices.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
              
              <ScrollView style={{ maxHeight: 80 }}>
                {amServices.length === 0 ? (
                  <Text className="text-xs text-amber-600 italic">No morning services</Text>
                ) : (
                  amServices.map((service) => (
                    <View
                      key={`${dayName}-${service}-am`}
                      className="flex-row items-center gap-2 p-2 bg-white/80 rounded-md mb-1"
                    >
                      <View className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
                      <Text className="text-amber-800 font-medium flex-1" numberOfLines={1}>
                        {service}
                      </Text>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>

            {/* PM Services */}
            <View className="border border-blue-200 rounded-lg p-3 bg-blue-50">
              <View className="flex-row items-center gap-2 mb-2">
                <Moon className="h-4 w-4 text-blue-600" />
                <Text className="font-semibold text-blue-800 text-base">Afternoon (PM)</Text>
                <View className="px-2 py-1 rounded-full bg-blue-200">
                  <Text className="text-xs text-blue-800">
                    {pmServices.length} service{pmServices.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
              
              <ScrollView style={{ maxHeight: 80 }}>
                {pmServices.length === 0 ? (
                  <Text className="text-xs text-blue-600 italic">No afternoon services</Text>
                ) : (
                  pmServices.map((service) => (
                    <View
                      key={`${dayName}-${service}-pm`}
                      className="flex-row items-center gap-2 p-2 bg-white/80 rounded-md mb-1"
                    >
                      <View className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      <Text className="text-blue-800 font-medium flex-1" numberOfLines={1}>
                        {service}
                      </Text>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}