import { ScrollView, Text, TouchableOpacity, View } from "react-native"
import ScreenLayout from "../_ScreenLayout"
import { router, useRouter } from "expo-router"
import { ChevronRight } from "@/lib/icons/ChevronRight"
import { ChevronLeft } from "lucide-react-native"

export default () => {
  const router = useRouter();

  return (
    <ScreenLayout
      customLeftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Report</Text>}
      customRightAction={<View className="w-10 h-10"/>}
    >
      <ScrollView className="flex-1">
        <TouchableOpacity
          className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
          activeOpacity={0.7}
          onPress={() => router.push('/(report)/incident')}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">

              {/* Add Visual Image */}

              <View className="flex-1">
                <Text className="text-gray-900 font-semibold text-base">
                  Incident Report
                </Text>

                <Text className="text-gray-500 text-sm mt-1">
                  File a report for incidents or emergencies in your area.
                </Text>
              </View>
            </View>

            <View className="ml-2">
              <ChevronRight className="text-gray-400" size={20} />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">

              {/* Add Visual Image */}

              <View className="flex-1">
                <Text className="text-gray-900 font-semibold text-base">
                  Waste Report
                </Text>

                <Text className="text-gray-500 text-sm mt-1">
                  Report waste management issues.
                </Text>
              </View>
            </View>

            <View className="ml-2">
              <ChevronRight className="text-gray-400" size={20} />
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  )
}