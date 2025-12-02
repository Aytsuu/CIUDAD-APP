import { format } from "date-fns";
import { View, Text } from "react-native";
import { Clock, Sun, Moon } from "lucide-react-native";
import type { DailySchedule } from "./schedule-types";

interface ScheduleCardProps {
  day: Date;
  dailySchedule: DailySchedule;
  services: string[];
}

export default function ScheduleCard({ day, dailySchedule, services }: ScheduleCardProps) {
  const dayName = format(day, "EEEE");
  const dateStr = format(day, "MMM d");

  // Get services for each meridiem that are actually scheduled
  const getServicesForMeridiem = (meridiem: "AM" | "PM") => {
    return services.filter((service) => {
      const serviceTimeSlots = dailySchedule[service];
      return serviceTimeSlots && serviceTimeSlots[meridiem] === true;
    });
  };

  const amServices = getServicesForMeridiem("AM");
  const pmServices = getServicesForMeridiem("PM");
  const hasAnyServices = amServices.length > 0 || pmServices.length > 0;

  return (
    <View className="w-full bg-white rounded-xl shadow-sm mb-6"> {/* Increased mb-4 to mb-6 for card spacing */}
      {/* Card Header */}
      <View className="px-4 py-3 border-b border-gray-200"> {/* Adjusted padding for header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3"> {/* Increased gap-2 to gap-3 */}
            <Clock className="h-5 w-5 text-gray-500" />
            <Text className="text-xl font-bold text-gray-800">{dayName}</Text>
          </View>
          <Text className="text-sm text-gray-500">{dateStr}</Text>
        </View>
      </View>

      {/* Card Content */}
      <View className="px-4 py-6"> {/* Increased vertical padding for content */}
        {!hasAnyServices ? (
          <View className="items-center py-8"> {/* Increased py-6 to py-8 for empty state */}
            <Clock className="h-6 w-6 mb-3 text-gray-400" /> {/* Increased mb-2 to mb-3 */}
            <Text className="text-sm text-gray-500">No services scheduled for this day</Text>
          </View>
        ) : (
          <View className="space-y-6"> {/* Increased space-y-4 to space-y-6 for AM/PM separation */}
            {/* AM Services */}
            <View>
              <View className="flex-row items-center gap-3 mb-3"> {/* Increased gap-2 to gap-3, mb-2 to mb-3 */}
                <Sun className="h-5 w-5 text-amber-600" />
                <Text className="font-semibold text-gray-800 text-base">Morning (AM)</Text>
                <View className="px-2 py-1 rounded-full">
                  <Text className="text-sm  font-medium">
                    {amServices.length} {amServices.length === 1 ? "service" : "services"}
                  </Text>
                </View>
              </View>
              {amServices.length === 0 ? (
                <Text className="text-sm text-gray-500 italic">No morning services</Text>
              ) : (
                <View className="flex-row flex-wrap gap-3"> {/* Increased gap-2 to gap-3 */}
                  {amServices.map((service) => (
                    <Text
                      key={`${dayName}-${service}-am`}
                      className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium" // Added py-1.5 for chip padding
                      numberOfLines={1}
                    >
                      {service}
                    </Text>
                  ))}
                </View>
              )}
            </View>

            {/* PM Services */}
            <View>
              <View className="flex-row items-center gap-3 mb-3 mt-4"> {/* Increased gap-2 to gap-3, mb-2 to mb-3 */}
                <Moon className="h-5 w-5 text-blue-600" />
                <Text className="font-semibold text-gray-800 text-base">Afternoon (PM)</Text>
                <View className="px-2 py-1 rounded-full ">
                  <Text className="text-sm  font-medium">
                    {pmServices.length} {pmServices.length === 1 ? "service" : "services"}
                  </Text>
                </View>
              </View>
              {pmServices.length === 0 ? (
                <Text className="text-sm text-gray-500 italic">No afternoon services</Text>
              ) : (
                <View className="flex-row flex-wrap gap-3"> {/* Increased gap-2 to gap-3 */}
                  {pmServices.map((service) => (
                    <Text
                      key={`${dayName}-${service}-pm`}
                      className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium" // Added py-1.5 for chip padding
                      numberOfLines={1}
                    >
                      {service}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}