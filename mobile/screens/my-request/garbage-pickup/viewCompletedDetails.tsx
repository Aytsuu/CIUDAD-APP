import _ScreenLayout from "@/screens/_ScreenLayout"
import { View, TouchableOpacity, Text, ScrollView, Image } from "react-native"
import { ChevronLeft, MapPin, Trash, Calendar, User, Users, Truck, Camera, CheckCircle, Info } from "lucide-react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { formatTime } from "@/helpers/timeFormatter"
import { useGetCompletedDetailsResident } from "./queries/garbagePickupFetchQueries"
import { LoadingState } from "@/components/ui/loading-state"

export default function ResidentCompletedDetails() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const garb_id = String(params.garb_id)
  const { data: requestDetails, isLoading } = useGetCompletedDetailsResident(garb_id)

   if (isLoading) {
      return (
          <View className="flex-1 justify-center items-center">
              <LoadingState/>
          </View>
      );
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
    >
      <ScrollView className="flex-1 p-6">
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

          {requestDetails?.conf_staff_conf_date && (
            <View className="py-3">
              <View className="flex-row items-center mb-2">
                <CheckCircle size={16} color="#6b7280" className="mr-2" />
                <Text className="text-gray-600 font-PoppinsMedium">Pickup Completion Date:</Text>
              </View>
              <View className="ml-6">
                <View className="bg-blue-100 px-3 py-2 rounded-lg self-start">
                  <Text className="font-PoppinsSemiBold text-blue-700">
                    {formatTimestamp(requestDetails?.conf_staff_conf_date)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {requestDetails?.conf_resident_conf_date && (
            <View className="py-3 border-b border-gray-100">
              <View className="flex-row items-center mb-2">
                <CheckCircle size={16} color="#6b7280" className="mr-2" />
                <Text className="text-gray-600 font-PoppinsMedium">Completion Acknowledged:</Text>
              </View>
              <View className="ml-6">
                <View className="bg-green-100 px-3 py-2 rounded-lg self-start">
                  <Text className="font-PoppinsSemiBold text-green-700">
                    {formatTimestamp(requestDetails?.conf_resident_conf_date)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Assignment Info Card */}
        {requestDetails?.assignment_info && (
          <View className="bg-white rounded-xl p-5 mb-4 border border-gray-100 shadow-sm">
            <View className="flex-row items-center mb-4 gap-2">
              <Users size={20} color="#16a34a" className="mr-2" />
              <Text className="font-PoppinsBold text-lg text-gray-800 font-bold">Assignment Details</Text>
            </View>

            {requestDetails.assignment_info.driver && (
              <View className="py-3 border-b border-gray-100">
                <View className="flex-row items-center mb-2 gap-2">
                  <User size={16} color="#6b7280" className="mr-2" />
                  <Text className="text-gray-600 font-PoppinsMedium">Driver:</Text>
                </View>
                <Text className="font-PoppinsSemiBold text-gray-800 ml-6">{requestDetails.assignment_info.driver}</Text>
              </View>
            )}

            {requestDetails.assignment_info.collectors && requestDetails.assignment_info.collectors.length > 0 && (
              <View className="py-3 border-b border-gray-100">
                <View className="flex-row items-center mb-2 gap-2">
                  <Users size={16} color="#6b7280" className="mr-2" />
                  <Text className="text-gray-600 font-PoppinsMedium">Collectors:</Text>
                </View>
                <View className="ml-6">
                  <View className="flex-row flex-wrap gap-2">
                    {requestDetails.assignment_info.collectors.map((collector: string, index: number) => (
                      <View 
                        key={index} 
                        className="bg-blue-100 px-3 py-1 rounded-full flex-row items-center self-start"
                        style={{ minWidth: 0 }}
                      >
                        <Text 
                          className="font-PoppinsSemiBold text-blue-800 text-sm"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {collector}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {requestDetails.assignment_info.truck && (
              <View className="py-3 border-b border-gray-100">
                <View className="flex-row items-center mb-2 gap-2">
                  <Truck size={16} color="#6b7280" className="mr-2" />
                  <Text className="text-gray-600 font-PoppinsMedium">Truck:</Text>
                </View>
                <View className="ml-6">
                  <View className="bg-gray-100 px-3 py-2 rounded-lg flex-row items-center self-start">
                    <Text className="font-PoppinsSemiBold text-gray-800">{requestDetails.assignment_info.truck}</Text>
                  </View>
                </View>
              </View>
            )}

            {requestDetails.assignment_info.pick_date && requestDetails.assignment_info.pick_time && (
              <View className="py-3">
                <View className="flex-row items-center mb-2">
                  <Calendar size={16} color="#6b7280" className="mr-2" />
                  <Text className="text-gray-600 font-PoppinsMedium">Pickup Date & Time:</Text>
                </View>
                <View className="ml-6">
                  <View className="bg-green-100 px-3 py-2 rounded-lg self-start">
                    <Text className="font-PoppinsSemiBold text-green-700">
                      {requestDetails.assignment_info.pick_date}, {formatTime(requestDetails.assignment_info.pick_time)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Attached Image Section */}
        {requestDetails?.file_url && (
          <View className="bg-white rounded-xl p-5 mb-4 border border-gray-100 shadow-sm">
            <View className="flex-row items-center mb-4">
              <Camera size={20} color="#9333ea" className="mr-2" />
              <Text className="font-PoppinsBold text-lg text-gray-800">Attached Image</Text>
            </View>
            <View className="bg-gray-50 rounded-lg p-2">
              <Image
                source={{ uri: requestDetails.file_url }}
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
      </ScrollView>
    </_ScreenLayout>
  )
}