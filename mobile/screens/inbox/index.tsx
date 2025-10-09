import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import ScreenLayout from "../_ScreenLayout";
import { Megaphone } from "@/lib/icons/Megaphone";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import { Bell } from "@/lib/icons/Bell";
import { useRouter } from "expo-router";

export default () => {
  const router = useRouter();

  return (
    <ScreenLayout
      showBackButton={false}
      showExitButton={false}
      headerBetweenAction={<Text className="text-[13px]">Inbox</Text>}
    >
      <View className="flex-1">
        {/* Announcement Card */}
        <TouchableOpacity
          onPress={() => router.push("/(announcement)")}
          className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                <Megaphone className="text-blue-600" size={20} />
              </View>

              <View className="flex-1">
                <Text className="text-gray-900 font-semibold text-base">
                  Announcement
                </Text>

                <Text className="text-gray-500 text-sm mt-1">
                  Latest updates and news
                </Text>
              </View>
            </View>

            <View className="ml-2">
              <ChevronRight className="text-gray-400" size={20} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Notification Card */}
        <TouchableOpacity
          className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mr-3">
                <Bell className="text-green-600" size={20} />
              </View>

              <View className="flex-1">
                <Text className="text-gray-900 font-semibold text-base">
                  Notification
                </Text>

                <Text className="text-gray-500 text-sm mt-1">
                  Personal alerts and reminders
                </Text>
              </View>
            </View>

            <View className="ml-2">
              <ChevronRight className="text-gray-400" size={20} />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
};
