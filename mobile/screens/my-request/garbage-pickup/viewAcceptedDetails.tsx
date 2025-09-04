import _ScreenLayout from "@/screens/_ScreenLayout"
import { View, TouchableOpacity, Text, ScrollView, Image } from "react-native"
import { ChevronLeft, Edit } from "lucide-react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { formatTime } from "@/helpers/timeFormatter"
import { useGetAcceptedDetailsResident } from "./queries/garbagePickupFetchQueries"
import { ConfirmationModal } from "@/components/ui/confirmationModal"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react-native"

export default function ResidentAcceptedDetails() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const garb_id = String(params.garb_id)
  const { data: requestDetails, isPending, error } = useGetAcceptedDetailsResident(garb_id)

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
      stickyFooter={true}
      footer={
        <View className="flex-row justify-end mt-4">
          <ConfirmationModal
            trigger={
              <Button className="bg-[#17AD00] p-2 w-12"> 
                <CheckCircle size={16} color="white" />
              </Button>
            }
            actionLabel="Confirm"
            title="Confirm Completion"
            description="Would you like to confirm the completion of the task?"
            // onPress={() => handleCompleteTask(task.garb_id)}
          />
        </View>
      }
    >
      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Request Info Card */}
        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <Text className="font-bold text-lg mb-2">Request Information</Text>

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

      </ScrollView>
    </_ScreenLayout>
  )
}