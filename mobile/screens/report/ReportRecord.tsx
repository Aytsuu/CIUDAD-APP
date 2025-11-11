import { TouchableOpacity, View, Text } from "react-native";
import { User } from "../_Enums";
import { router } from "expo-router";
import { ChevronRight } from "@/lib/icons/ChevronRight";

const recordMenuItem = [
  {
    title: "Incident",
    description: "",
    route: "/(report)/incident/records",
    user: [User.resident, User.brgyStaff],
  },
  {
    title: "Acknowledgement",
    description: "",
    route: "/(report)/acknowledgement/records",
    user: [User.brgyStaff],
  },
  {
    title: "Weekly Accomplishment",
    description: "",
    route: "/(report)/weekly-ar/records",
    user: [User.brgyStaff],
  },
  {
    title: "Securado",
    description: "",
    route: "/(report)/securado/map",
    user: [User.brgyStaff],
  },
  {
    title: 'Illegal Dumping',
    description: '',
    route: '/(waste)/illegal-dumping/resident/illegal-dump-res-main',
    user: [User.resident, User.brgyStaff]
  },
];

export default function ReportRecord() {
  return (
    <View className="px-6">
      {recordMenuItem.map((item: any, index: number) => (
        <TouchableOpacity
          key={index}
          className={`bg-blue-100 rounded-xl p-4 mb-3 ${index == recordMenuItem.length - 1 && "mb-8"}`}
          activeOpacity={0.7}
          onPress={() => item.route && router.push(item.route)}
          disabled={!item.route}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-gray-700 font-medium text-sm mb-1">
                {item.title}
              </Text>
            </View>
            <View className="ml-3">
              <ChevronRight size={20} className="text-gray-400" />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}