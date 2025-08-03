import _ScreenLayout from "@/screens/_ScreenLayout"
import { View, TouchableOpacity, Text, ScrollView, Image } from "react-native"
import { ChevronLeft, Edit } from "lucide-react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { formatTime } from "@/helpers/timeFormatter"
import { useUpdateGarbageRequestStatus } from "./queries/garbagePickupStaffUpdateQueries"
import { useGetViewAccepted } from "./queries/garbagePickupStaffFetchQueries"

export default function ViewRequestDetails() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const garb_id = String(params.garb_id)
  const { data: requestDetails, isPending, error } = useGetViewAccepted(garb_id)
  const { mutate: updateRequestStatus } = useUpdateGarbageRequestStatus()

  const handleConfirmRequest = () => {
    updateRequestStatus(requestDetails?.garb_id || "")
  }

  const handleEditAssignment = () => {
    router.push({
      pathname: "/(waste)/garbage-pickup/staff/edit-assignment",
      params: {
        driver_id: requestDetails?.driver_id || "",
        collector_ids: requestDetails?.collector_ids?.join(","),
        truck_id: requestDetails?.truck_id || "",
        date: requestDetails?.assignment_info?.pick_date || "",
        time: requestDetails?.assignment_info?.pick_time || "",
        pick_id: requestDetails?.pickup_assignment_id || "",
        acl_id: requestDetails?.assignment_collector_ids?.join(","),
      },
    })
  }

  return (
    <_ScreenLayout
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} className="text-black" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Accepted Request Details</Text>}
      showBackButton={false}
      showExitButton={false}
      loading={isPending}
      loadingMessage="Loading..."
    >
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
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

          {requestDetails?.dec_date && (
            <View className="py-2">
              <Text className="text-gray-600 mb-1">Decision Date:</Text>
              <Text className="font-medium" style={{ flexWrap: "wrap" }}>
                {formatTimestamp(requestDetails?.dec_date)}
              </Text>
            </View>
          )}
        </View>

        {/* Assignment Info Card */}
        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-bold text-lg">Assignment Details</Text>
            <TouchableOpacity className="p-2" onPress={handleEditAssignment}>
              <Edit size={18} color="#3b82f6" />
            </TouchableOpacity>
          </View>

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
              <Text className="font-medium">{formatTime(requestDetails?.assignment_info.pick_time)}</Text>
            </View>
          )}
        </View>

        {/* Attached Image Section */}
        {requestDetails?.file_url && (
          <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
            <Text className="font-bold text-lg mb-2">Attached Image</Text>
            <Image
              source={{ uri: requestDetails?.file_url }}
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

        {/* Confirm Button */}
        {/* <ConfirmationModal
          trigger={
            <Button className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg">
              <Text className="text-white font-PoppinsSemiBold text-[16px]">Confirm</Text>
            </Button>
          }
          title="Confirm Pickup"
          description="Would you like to confirm that the pickup has been done?"
          actionLabel="Confirm"
          onPress={handleConfirmRequest}
        /> */}
      </ScrollView>
    </_ScreenLayout>
  )
}