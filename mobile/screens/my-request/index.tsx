import { Text, View, TouchableOpacity } from "react-native"
import ScreenLayout from "../_ScreenLayout"
import { useRouter } from "expo-router";
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import {ChevronRight} from "@/lib/icons/ChevronRight"

export default () => {
  const router = useRouter();

  const menuItem = [
  {
    title: "Garbage Pickup Request",
    description: "Monitor garbage pickup request.",
    route: "/(my-request)/garbage-pickup/garbage-pickup-tracker"
  },
  {
    title: "Certification Request",
     description: "Request official certification documents for personal or legal use.",
     route: "/(my-request)/certificate-request/certificate-request-tracker"
  },
  {
    title: "Medicine Request",
     description: "Monitor your medicine requests.",
     route: "/(health)/medicine-request/my-requests"
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
      showBackButton={false}
      showExitButton={false}
      headerBetweenAction={<Text className="text-[13px]">My Requests</Text>}
    >
      <View className="flex-1 px-5">
        <Text className="text-sm text-center text-gray-600 leading-6 px-5 mb-4">
          Monitor your own requests. Select a category below to view records.
        </Text> 
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