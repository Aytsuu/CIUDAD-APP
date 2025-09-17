import { format } from "date-fns"
import { View, Text, ScrollView } from "react-native" // Replaced Card, CardContent, etc. with View/Text
import { Clock, Sun, Moon } from "lucide-react-native" // Changed to lucide-react-native
import type { DailySchedule } from "./schedule-types"

interface ScheduleCardProps {
  day: Date
  dailySchedule: DailySchedule
  services: string[]
}

export default function ScheduleCard({ day, dailySchedule, services }: ScheduleCardProps) {
  const dayName = format(day, "EEEE")
  const dateStr = format(day, "MMM d")

  // ✅ Separate AM and PM services
  const getServicesForMeridiem = (meridiem: "AM" | "PM") => {
    return services.filter(service => {
      const serviceTimeSlots = dailySchedule[service]
      return serviceTimeSlots && serviceTimeSlots[meridiem]
    })
  }

  const amServices = getServicesForMeridiem("AM")
  const pmServices = getServicesForMeridiem("PM")

  const hasAnyServices = amServices.length > 0 || pmServices.length > 0

  return (
    // Card
    <View className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* CardHeader */}
      <View className="p-4 pb-3 flex-shrink-0 border-b border-gray-200">
        {/* CardTitle */}
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
            {/* AM Services Row */}
            <View className="border border-amber-200 rounded-lg p-3 bg-amber-50"> {/* bg-gradient-to-r from-amber-100 to-orange-50 */}
              <View className="flex-row items-center gap-2 mb-2">
                <Sun className="h-4 w-4 text-amber-600" />
                <Text className="font-semibold text-amber-800 text-base">Morning (AM)</Text>
                {/* Badge */}
                <View className="px-2 py-1 rounded-full bg-gray-200">
                  <Text className="text-xs text-gray-700">
                    {amServices.length > 1 ? `${amServices.length} services` : `${amServices.length} service`} 
                  </Text>
                </View>
              </View>
              
              <ScrollView style={{ maxHeight: 80 }}> {/* max-h-20 overflow-y-auto */}
                {amServices.length === 0 ? (
                  <Text className="text-xs text-amber-600 italic">No morning services</Text>
                ) : (
                  amServices.map((service) => (
                    <View
                      key={`${dayName}-${service}-am`}
                      className="flex-row items-center gap-2 p-1.5 bg-white/60 rounded-md mb-1" // Added mb-1 for spacing
                    >
                      <View className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
                      <Text className="text-amber-800 font-medium flex-1" numberOfLines={1}>{service}</Text>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>

            {/* PM Services Row */}
            <View className="border border-blue-200 rounded-lg p-3 bg-blue-50"> {/* bg-gradient-to-r from-blue-100 to-indigo-50 */}
              <View className="flex-row items-center gap-2 mb-2">
                <Moon className="h-4 w-4 text-blue-600" />
                <Text className="font-semibold text-blue-800 text-base">Afternoon (PM)</Text>
                {/* Badge */}
                <View className="px-2 py-1 rounded-full bg-gray-200">
                  <Text className="text-xs text-gray-700">
                    {pmServices.length > 1 ? `${pmServices.length} services` : `${pmServices.length} service`}
                  </Text>
                </View>
              </View>
              
              <ScrollView style={{ maxHeight: 80 }}> {/* max-h-20 overflow-y-auto */}
                {pmServices.length === 0 ? (
                  <Text className="text-xs text-blue-600 italic">No afternoon services</Text>
                ) : (
                  pmServices.map((service) => (
                    <View
                      key={`${dayName}-${service}-pm`}
                      className="flex-row items-center gap-2 p-1.5 bg-white/60 rounded-md mb-1" // Added mb-1 for spacing
                    >
                      <View className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      <Text className="text-blue-800 font-medium flex-1" numberOfLines={1}>{service}</Text>
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