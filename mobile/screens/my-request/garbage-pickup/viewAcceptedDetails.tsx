import _ScreenLayout from "@/screens/_ScreenLayout"
import { View, TouchableOpacity, Text, ScrollView, Image } from "react-native"
import { ChevronLeft, MapPin, Trash, Calendar, User, Users, Truck, Camera, CheckCircle, Info} from "lucide-react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { formatTime } from "@/helpers/timeFormatter"
import { useGetAcceptedDetailsResident } from "./queries/garbagePickupFetchQueries"
import { ConfirmationModal } from "@/components/ui/confirmationModal"
import { Button } from "@/components/ui/button"

export default function ResidentAcceptedDetails() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const garb_id = String(params.garb_id)
  const { data: requestDetails, isPending, error } = useGetAcceptedDetailsResident(garb_id)

  const handleConfirmCompletion = (id: any) => {
    console.log(`Task with ID ${id} confirmed as completed.`)
  }

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
      <ScrollView className="flex-1 p-4" >
        {/* Request Info Card */}
        <View className="bg-white rounded-xl p-5 mb-4 border border-gray-100 shadow-sm">
          <View className="flex-row items-center mb-4 gap-2">
            <Info size={20} color="#2563eb" className="mr-2" />
            <Text className="font-PoppinsBold text-lg text-gray-800 font-bold">Request Information</Text>
          </View>

          <View className="py-3 border-b border-gray-100">
            <View className="flex-row items-center mb-2">
              <MapPin size={16} color="#6b7280" className="mr-2" />
              <Text className="text-gray-600 font-PoppinsMedium">Location:</Text>
            </View>
            <Text className="font-PoppinsSemiBold text-gray-800 ml-6">{requestDetails?.garb_location}</Text>
          </View>

          {requestDetails?.sitio_name && (
            <View className="py-3 border-b border-gray-100">
              <View className="flex-row items-center mb-2">
                <MapPin size={16} color="#6b7280" className="mr-2" />
                <Text className="text-gray-600 font-PoppinsMedium">Sitio:</Text>
              </View>
              <Text className="font-PoppinsSemiBold text-gray-800 ml-6">{requestDetails?.sitio_name}</Text>
            </View>
          )}

          <View className="py-3 border-b border-gray-100">
            <View className="flex-row items-center mb-2">
              <Trash size={16} color="#6b7280" className="mr-2" />
              <Text className="text-gray-600 font-PoppinsMedium">Waste Type:</Text>
            </View>
            <View className="ml-6">
              <View className="bg-orange-100 px-3 py-1 rounded-full self-start">
                <Text className="font-PoppinsSemiBold text-orange-700 text-sm">{requestDetails?.garb_waste_type}</Text>
              </View>
            </View>
          </View>

          <View className="py-3 border-b border-gray-100">
            <View className="flex-row items-center mb-2">
              <Calendar size={16} color="#6b7280" className="mr-2" />
              <Text className="text-gray-600 font-PoppinsMedium">Created:</Text>
            </View>
            <Text className="font-PoppinsSemiBold text-gray-800 ml-6" style={{ flexWrap: "wrap" }}>
              {formatTimestamp(requestDetails?.garb_created_at || "")}
            </Text>
          </View>

          {requestDetails?.dec_date && (
            <View className="py-3">
              <View className="flex-row items-center mb-2">
                <Calendar size={16} color="#6b7280" className="mr-2" />
                <Text className="text-gray-600 font-PoppinsMedium">Date Accepted:</Text>
              </View>
              <Text className="font-PoppinsSemiBold text-gray-800 ml-6" style={{ flexWrap: "wrap" }}>
                {formatTimestamp(requestDetails?.dec_date)}
              </Text>
            </View>
          )}
        </View>

        {/* Assignment Info Card */}
        <View className="bg-white rounded-xl p-5 mb-4 border border-gray-100 shadow-sm">
          <View className="flex-row items-center mb-4 gap-2">
            <Users size={20} color="#16a34a" className="mr-2" />
            <Text className="font-PoppinsBold text-lg text-gray-800 font-bold">Assignment Details</Text>
          </View>

          {requestDetails?.assignment_info?.driver && (
            <View className="py-3 border-b border-gray-100">
              <View className="flex-row items-center mb-2 gap-2">
                <User size={16} color="#6b7280" className="mr-2" />
                <Text className="text-gray-600 font-PoppinsMedium">Driver:</Text>
              </View>
              <Text className="font-PoppinsSemiBold text-gray-800 ml-6">{requestDetails?.assignment_info.driver}</Text>
            </View>
          )}

          {requestDetails?.assignment_info?.collectors && requestDetails?.assignment_info.collectors.length > 0 && (
            <View className="py-3 border-b border-gray-100">
              <View className="flex-row items-center mb-3 gap-2">
                <Users size={16} color="#6b7280" className="mr-2" />
                <Text className="text-gray-600 font-PoppinsMedium">Collectors:</Text>
              </View>
              <View className="flex-row flex-wrap gap-2 ml-6">
                {requestDetails.assignment_info.collectors.map((collector, index) => (
                  <View key={index} className="bg-blue-100 px-3 py-2 rounded-full flex-row items-center">
                    <User size={12} color="#2563eb" className="mr-1" />
                    <Text className="font-PoppinsMedium text-blue-700 text-sm">{collector}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {requestDetails?.assignment_info?.truck && (
            <View className="py-3 border-b border-gray-100">
               <View className="flex-row items-center mb-2 gap-2">
                <Truck size={16} color="#6b7280" className="mr-2" />
                <Text className="text-gray-600 font-PoppinsMedium">Truck:</Text>
              </View>
              <View className="ml-6">
                <View className="bg-gray-100 px-3 py-2 rounded-lg flex-row items-center self-start">
                  <Truck size={14} color="#4b5563" className="mr-2" />
                  <Text className="font-PoppinsSemiBold text-gray-800">{requestDetails?.assignment_info.truck}</Text>
                </View>
              </View>
            </View>
          )}

          {requestDetails?.assignment_info?.pick_date && requestDetails?.assignment_info.pick_time && (
            <View className="py-3 border-b border-gray-100">
              <View className="flex-row items-center mb-2">
                <Calendar size={16} color="#6b7280" className="mr-2" />
                <Text className="text-gray-600 font-PoppinsMedium">Pickup Date & Time:</Text>
              </View>
              <View className="ml-6">
                <View className="bg-green-100 px-3 py-2 rounded-lg self-start">
                  <Text className="font-PoppinsSemiBold text-green-700">
                    {requestDetails?.assignment_info.pick_date}, {formatTime(requestDetails?.assignment_info.pick_time)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Attached Image Section */}
        {requestDetails?.file_url && (
          <View className="bg-white rounded-xl p-5 mb-4 border border-gray-100 shadow-sm">
            <View className="flex-row items-center mb-4">
              <Camera size={20} color="#9333ea" className="mr-2" />
              <Text className="font-PoppinsBold text-lg text-gray-800">Attached Image</Text>
            </View>
            <View className="bg-gray-50 rounded-lg p-2">
              <Image
                source={{ uri: requestDetails?.file_url }}
                style={{
                  width: "100%",
                  height: undefined,
                  aspectRatio: 1,
                  borderRadius: 8,
                  resizeMode: "cover",
                }}
              />
            </View>
          </View>
        )}

        <View className="flex justify-center items-center w-full mt-2">
          <ConfirmationModal
            trigger={
                <Button className="bg-green-600 native:h-[56px] w-full rounded-xl shadow-lg flex-row items-center justify-center gap-2">
                  <CheckCircle size={20} color="white" />
                  <Text className="text-white font-PoppinsSemiBold text-[16px]">Confirm Completion</Text>
                </Button>
            }
            actionLabel="Confirm"
            title="Confirm Completion"
            description="Would you like to confirm the completion of the task?"
            onPress={() => handleConfirmCompletion(requestDetails?.garb_id)}
          />
        </View>
      </ScrollView>
    </_ScreenLayout>
  )
}
