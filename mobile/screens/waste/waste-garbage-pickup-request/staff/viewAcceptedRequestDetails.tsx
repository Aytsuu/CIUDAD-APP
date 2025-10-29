import PageLayout from "@/screens/_PageLayout"
import { View, TouchableOpacity, Text, ScrollView, Image } from "react-native"
import { ChevronLeft, Edit, MapPin, Trash, Calendar, User, Users, Truck, Camera, Info } from "lucide-react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { formatTime } from "@/helpers/timeFormatter"
import { useGetViewAccepted } from "./queries/garbagePickupStaffFetchQueries"
import { LoadingState } from "@/components/ui/loading-state"
import { Button } from "@/components/ui/button"
import { ConfirmationModal } from "@/components/ui/confirmationModal"
import { useUpdateGarbageRequestStatus } from "./queries/garbagePickupStaffUpdateQueries"
import { LoadingModal } from "@/components/ui/loading-modal"

export default function ViewRequestDetails() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const garb_id = String(params.garb_id)
  const { data: requestDetails, isLoading } = useGetViewAccepted(garb_id)
  const { mutate: confirm, isPending} = useUpdateGarbageRequestStatus()

  if(isLoading){
    return(
      <View className="flex-1 justify-center items-center">
          <LoadingState/>
      </View>
    )
  }

  const handleConfirm = (garb_id: string) => {
    confirm(garb_id)
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
    <PageLayout
      leftAction={
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Request Details</Text>}
      wrapScroll={false}
      footer={
        <View className="p-6 bg-white border-t border-gray-200">
          <ConfirmationModal
            trigger={
              <Button className="bg-green-500 native:h-[56px] w-full rounded-xl shadow-lg">
                <Text className="text-white font-PoppinsSemiBold text-[16px]">Confirm Completion</Text>
            </Button>
            }
            description="Are you sure you want to mark this request as completed?"
            title="Completion Confirmation"
            onPress={() => handleConfirm(garb_id)}
          />
        </View>
      }
    >
      <View className="flex-1 bg-gray-50">
        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
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
                  <Text className="text-gray-600 font-PoppinsMedium">Decision Date:</Text>
                </View>
                <Text className="font-PoppinsSemiBold text-gray-800 ml-6" style={{ flexWrap: "wrap" }}>
                  {formatTimestamp(requestDetails?.dec_date)}
                </Text>
              </View>
            )}
          </View>

          {/* Assignment Info Card */}
          <View className="bg-white rounded-xl p-5 mb-4 border border-gray-100 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-2">
                <Users size={20} color="#16a34a" className="mr-2" />
                <Text className="font-PoppinsBold text-lg text-gray-800 font-bold">Assignment Details</Text>
              </View>
              <TouchableOpacity className="p-2" onPress={handleEditAssignment}>
                <Edit size={18} color="#3b82f6" />
              </TouchableOpacity>
            </View>

            {requestDetails?.assignment_info?.driver && (
              <View className="py-3 border-b border-gray-100">
                <View className="flex-row items-center mb-2 gap-2">
                  <User size={16} color="#6b7280" className="mr-2" />
                  <Text className="text-gray-600 font-PoppinsMedium">Driver Loader:</Text>
                </View>
                <Text className="font-PoppinsSemiBold text-gray-800 ml-6">{requestDetails?.assignment_info.driver}</Text>
              </View>
            )}

            {requestDetails?.assignment_info?.collectors && requestDetails?.assignment_info.collectors.length > 0 && (
              <View className="py-3 border-b border-gray-100">
                <View className="flex-row items-center mb-2 gap-2">
                  <Users size={16} color="#6b7280" className="mr-2" />
                  <Text className="text-gray-600 font-PoppinsMedium">Loader(s):</Text>
                </View>
                <View className="ml-6">
                  <View className="flex-row flex-wrap gap-2">
                    {requestDetails.assignment_info.collectors.map((collector, index) => (
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

            {requestDetails?.assignment_info?.truck && (
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

            {requestDetails?.assignment_info?.pick_date && requestDetails?.assignment_info?.pick_time && (
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
          <LoadingModal visible={isPending}/>
        </ScrollView>
      </View>
    </PageLayout>
  )
}