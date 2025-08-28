import { ScrollView, Text, TouchableOpacity, View } from "react-native"
import ScreenLayout from "../_ScreenLayout"
import { router, useRouter } from "expo-router"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import {ChevronRight} from "@/lib/icons/ChevronRight"

export default () => {
  const router = useRouter();

  const menuItem = [
  {
    title: "Garbage Pickup Request",
    description: "Request a garbage pickup outside the regular collection schedule.",
    route: "/(request)/garbage-pickup/form"
  },
  {
    title: "Certification Request",
     description: "Request official certification documents for personal or legal use.",
     route: "/(request)/certification-request/cert-choices"
  },
  {
    title: "Track Requests",
    description: "Track your personal certifications and business permits.",
    route: "/(request)/cert-tracking"
  },
  {
    title: "Medicine Request",
     description: "",
     route: ""
  },
  {
    title: "Maternal Appointment",
     description: "",
     route: ""
  },
  {
    title: "Medical Consultation Appointment",
     description: "",
     route: ""
  },
]

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
      headerBetweenAction={<Text className="text-[13px]">Request</Text>}
      customRightAction={<View className="w-10 h-10"/>}
    >
      <View className="flex-1 px-5">
        {
          menuItem.map((item: any, index: number) => (
            <TouchableOpacity
              key={index}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
              activeOpacity={0.7}
              onPress={() => router.push(item.route)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">

                  {/* Add Visual Image */}

                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold text-base">
                      {item.title}
                    </Text>

                    <Text className="text-gray-500 text-sm mt-1">
                      {item.description}
                    </Text>
                  </View>
                </View>

                <View className="ml-2">
                  <ChevronRight className="text-gray-400" size={20} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        }
      </View>
    </ScreenLayout>
  )
}