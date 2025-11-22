import PageLayout from "@/screens/_PageLayout"
import { View, TouchableOpacity, Text, ScrollView, Image, Modal, RefreshControl } from "react-native"
import { ChevronLeft, MapPin, Trash, Calendar, User, Camera, Info, X, UserX } from "lucide-react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { formatTime } from "@/helpers/timeFormatter"
import { LoadingState } from "@/components/ui/loading-state"
import { useState } from "react"
import { formatDate } from "@/helpers/dateHelpers"
import { useGetGarbageCancelledDetailsResident } from "./queries/garbagePickupFetchQueries"

export default function ResidentCancelledDetails() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const garb_id = String(params.garb_id)
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewImageModalVisible, setViewImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{url: string, name: string} | null>(null);

  const { data: requestDetails, isLoading, refetch } = useGetGarbageCancelledDetailsResident(garb_id)

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleViewImage = (imageUrl: string, imageName: string = "") => {
    setSelectedImage({
      url: imageUrl,
      name: imageName
    })
    setViewImageModalVisible(true)
  }

  if(isLoading && !isRefreshing){
    return(
      <View className="flex-1 justify-center items-center">
        <LoadingState/>
      </View>
    )
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
    >
      <View className="flex-1 bg-gray-50">
        <ScrollView 
          className="flex-1 p-6" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#00a8f0']}
              tintColor="#00a8f0"
            />
          }
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        >
          {/* Request Info Card */}
          <View className="bg-white rounded-xl p-5 mb-4 border border-gray-100 shadow-sm">
            <View className="flex-row items-center mb-4 gap-2">
              <Info size={20} color="#2563eb" className="mr-2" />
              <Text className="font-PoppinsBold text-lg text-gray-800 font-bold">Request Information</Text>
            </View>

            <View className="py-3 border-b border-gray-100">
              <View className="flex-row items-center mb-2">
                <User size={16} color="#6b7280" className="mr-2" />
                <Text className="text-gray-600 font-PoppinsMedium">Requester:</Text>
              </View>
              <Text className="font-PoppinsSemiBold text-gray-800 ml-6">{requestDetails?.garb_requester}</Text>
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
                <Text className="text-gray-600 font-PoppinsMedium">Preferred Date & Time:</Text>
              </View>
              <Text className="font-PoppinsSemiBold text-gray-800 ml-6">
                {formatDate(requestDetails?.garb_pref_date || "", "long")} • {formatTime(requestDetails?.garb_pref_time || "")}
              </Text>
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

            {requestDetails?.garb_additional_notes && (
              <View className="py-3 border-b border-gray-100">
                <View className="flex-row items-center mb-2 gap-2">
                  <Info size={16} color="#6b7280" className="mr-2" />
                  <Text className="text-gray-600 font-PoppinsMedium">Additional Notes:</Text>
                </View>
                <Text className="font-PoppinsSemiBold text-gray-800 ml-6">{requestDetails?.garb_additional_notes}</Text>
              </View>
            )}
          </View>

          {/* Cancellation Details Card */}
          <View className="bg-white rounded-xl p-5 mb-4 border border-gray-100 shadow-sm">
            <View className="flex-row items-center mb-4 gap-2">
              <UserX size={20} color="#dc2626" className="mr-2" />
              <Text className="font-PoppinsBold text-lg text-gray-800 font-bold">Cancellation Details</Text>
            </View>

            {/* Cancellation Date */}
            {requestDetails?.dec_date && (
              <View className="py-3 border-b border-gray-100">
                <View className="flex-row items-center mb-2 gap-2">
                  <Calendar size={16} color="#6b7280" className="mr-2" />
                  <Text className="text-gray-600 font-PoppinsMedium">Cancelled On:</Text>
                </View>
                <Text className="font-PoppinsSemiBold text-gray-800 ml-6">
                  {formatTimestamp(requestDetails.dec_date)}
                </Text>
              </View>
            )}

            {/* Cancellation Reason */}
            <View className="py-3">
              <View className="flex-row items-center mb-2 gap-2">
                <Info size={16} color="#6b7280" className="mr-2" />
                <Text className="text-gray-600 font-PoppinsMedium">Cancellation Reason:</Text>
              </View>
              <View className="ml-6 bg-red-50 border border-red-200 rounded-lg p-3">
                <Text className="font-PoppinsSemiBold text-red-800">{requestDetails?.dec_reason || "No reason provided"}</Text>
              </View>
            </View>
          </View>

          {/* Attached Image Section */}
          {requestDetails?.file_url && (
            <View className="bg-white rounded-xl p-5 mb-4 border border-gray-100 shadow-sm">
              <View className="flex-row items-center mb-4 gap-2">
                <Camera size={20} color="#9333ea" className="mr-2" />
                <Text className="font-PoppinsBold text-lg text-gray-800 font-bold">Attached Image</Text>
              </View>
              
              <TouchableOpacity 
                onPress={() => handleViewImage(requestDetails?.file_url || '')}
                className="bg-gray-50 rounded-lg p-2"
              >
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
              </TouchableOpacity>
            </View>
          )}
          
        </ScrollView>
      </View>

      {/* Image Viewer Modal */}
      <Modal
        visible={viewImageModalVisible}
        transparent={true}
        onRequestClose={() => setViewImageModalVisible(false)}
        animationType="fade"
      >
        <View className="flex-1 bg-black/90">
          <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4 flex-row justify-between items-center">
            <Text className="text-white text-lg font-medium w-[90%]" numberOfLines={1}>
              {selectedImage?.name || ''}
            </Text>
            <TouchableOpacity 
              onPress={() => setViewImageModalVisible(false)}
              className="bg-black/50 rounded-full p-1"
            >
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          {selectedImage && (
            <Image
              source={{ uri: selectedImage.url }}
              className="w-full h-full"
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </PageLayout>
  )
}