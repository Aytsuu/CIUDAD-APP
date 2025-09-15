import _ScreenLayout from "@/screens/_ScreenLayout"
import { View, TouchableOpacity, Text, ScrollView, Image } from "react-native"
import { ChevronLeft } from "lucide-react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { formatTime } from "@/helpers/timeFormatter"
import { useGetViewCompleted } from "./queries/garbagePickupStaffFetchQueries"

export default function ViewCompletedRequestDetails() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const garb_id = String(params.garb_id)
  const { data: requestDetails, isPending } = useGetViewCompleted(garb_id)

  return (
    <_ScreenLayout
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} className="text-black" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Request Details</Text>}
      showBackButton={false}
      showExitButton={false}
      loading={isPending}
      loadingMessage="Loading..."
    >
      <ScrollView className="flex-1 p-4">
        {/* Request Info Card */}
        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <Text className="font-bold text-lg mb-2">Request Information</Text>

          <View className="py-2 border-b border-gray-100">
            <Text className="text-gray-600 mb-1">Requester:</Text>
            <Text className="font-medium">{requestDetails?.garb_requester}</Text>
          </View>

          <View className="py-2 border-b border-gray-100">
            <Text className="text-gray-600 mb-1">Location:</Text>
            <Text className="font-medium">{requestDetails?.garb_location}</Text>
          </View>

          {requestDetails?.sitio_name && (
            <View className="py-2 border-b border-gray-100">
              <Text className="text-gray-600 mb-1">Sitio:</Text>
              <Text className="font-medium">{requestDetails?.sitio_name}</Text>
            </View>
          )}

          <View className="py-2 border-b border-gray-100">
            <Text className="text-gray-600 mb-1">Waste Type:</Text>
            <Text className="font-medium">{requestDetails?.garb_waste_type}</Text>
          </View>

          <View className="py-2 border-b border-gray-100">
            <Text className="text-gray-600 mb-1">Created:</Text>
            <Text className="font-medium" style={{ flexWrap: "wrap" }}>
              {formatTimestamp(requestDetails?.garb_created_at || "")}
            </Text>
          </View>

          {requestDetails?.conf_resident_conf_date && (
            <View className="py-2 border-b border-gray-100">
              <Text className="text-gray-600 mb-1">Resident Confirmation Date:</Text>
              <Text className="font-medium" style={{ flexWrap: "wrap" }}>
                {formatTimestamp(requestDetails?.conf_resident_conf_date)}
              </Text>
            </View>
          )}

          {requestDetails?.conf_staff_conf_date && (
            <View className="py-2">
              <Text className="text-gray-600 mb-1">Staff Confirmation Date:</Text>
              <Text className="font-medium" style={{ flexWrap: "wrap" }}>
                {formatTimestamp(requestDetails?.conf_staff_conf_date)}
              </Text>
            </View>
          )}
        </View>

        {/* Assignment Info Card */}
        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <Text className="font-bold text-lg mb-2">Assignment Details</Text>

          {requestDetails?.assignment_info?.driver && (
            <View className="py-2 border-b border-gray-100">
              <Text className="text-gray-600 mb-1">Driver:</Text>
              <Text className="font-medium">{requestDetails?.assignment_info.driver}</Text>
            </View>
          )}

          {requestDetails?.assignment_info?.collectors && requestDetails?.assignment_info.collectors.length > 0 && (
            <View className="py-2 border-b border-gray-100">
              <Text className="text-gray-600 mb-2">Collectors:</Text>
              <View className="flex-row flex-wrap gap-2">
                {requestDetails.assignment_info.collectors.map((collector, index) => (
                  <View key={index} className="bg-gray-100 px-3 py-1 rounded-full">
                    <Text className="font-medium text-sm">{collector}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {requestDetails?.assignment_info?.truck && (
            <View className="py-2 border-b border-gray-100">
              <Text className="text-gray-600 mb-1">Truck:</Text>
              <Text className="font-medium">{requestDetails?.assignment_info.truck}</Text>
            </View>
          )}

          {requestDetails?.assignment_info?.pick_date && (
            <View className="py-2 border-b border-gray-100">
              <Text className="text-gray-600 mb-1">Pickup Date:</Text>
              <Text className="font-medium">{requestDetails?.assignment_info.pick_date}</Text>
            </View>
          )}

          {requestDetails?.assignment_info?.pick_time && (
            <View className="py-2">
              <Text className="text-gray-600 mb-1">Pickup Time:</Text>
              <Text className="font-medium">{formatTime(requestDetails.assignment_info.pick_time)}</Text>
            </View>
          )}
        </View>

        {/* Confirmation Status */}
        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <Text className="font-bold text-lg mb-2">Completion Status</Text>

          <View className="py-2 border-b border-gray-100">
            <Text className="text-gray-600 mb-1">Resident Confirmed:</Text>
            <Text className="font-medium">{requestDetails?.conf_resident_conf ? "✅ Yes" : "❌ No"}</Text>
          </View>

          <View className="py-2">
            <Text className="text-gray-600 mb-1">Staff Confirmed:</Text>
            <Text className="font-medium">{requestDetails?.conf_staff_conf ? "✅ Yes" : "❌ No"}</Text>
          </View>
        </View>

        {/* Attached Image Section */}
        {requestDetails?.file_url && (
          <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
            <Text className="font-bold text-lg mb-2">Attached Image</Text>
            <Image
              source={{ uri: requestDetails.file_url }}
              style={{
                width: "100%",
                height: undefined,
                aspectRatio: 1,
                borderRadius: 8,
                resizeMode: "cover",
              }}
              className="mt-2"
            />
          </View>
        )}
      </ScrollView>
    </_ScreenLayout>
  )
}