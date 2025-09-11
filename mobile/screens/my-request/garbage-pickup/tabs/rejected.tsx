import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Image } from "react-native";
import { X, Search, Info } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { useGetGarbageRejectedResident } from "../queries/garbagePickupFetchQueries";
import { formatTime } from "@/helpers/timeFormatter";
import { useAuth } from "@/contexts/AuthContext";

export default function ResidentRejected() {
  const {user} = useAuth()  
  const { data: rejectedRequests = [], isLoading: isDataLoading} = useGetGarbageRejectedResident(user.resident.rp_id)
  const [searchQuery, setSearchQuery] = useState("");
  const [viewImageModalVisible, setViewImageModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [currentZoomScale, setCurrentZoomScale] = useState(1);

  console.log('Rejected:', rejectedRequests)

  const filteredData = rejectedRequests.filter((request) => {
    const searchString = `
      ${request.garb_location} 
      ${request.garb_waste_type}
      ${request.dec_reason || ""}
      ${request.sitio_name || ""}
    `.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const handleViewImage = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setViewImageModalVisible(true);
    setCurrentZoomScale(1);
  };

  return (
    <View className="flex-1 p-4">
      {/* Header */}
      <Text className="text-lg font-semibold text-gray-800 mb-2">
        Rejected Requests ({filteredData.length})
      </Text>

      {/* Search Bar */}
      {!isDataLoading && (
        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-3 mb-4 mt-2">
          <Search size={18} color="#6b7280" />
          <Input
            className="flex-1 ml-2 bg-white text-black"
            placeholder="Search rejected requests..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ borderWidth: 0, shadowOpacity: 0 }}
          />
        </View>
      )}

      {/* List */}
      {isDataLoading ? (
        <View className="justify-center items-center py-8">
          <Text className="text-center text-gray-500">Loading rejected requests...</Text>
        </View>
      ) : filteredData.length === 0 ? (
        <View className="justify-center items-center py-8">
          <View className="bg-blue-50 p-6 rounded-lg items-center">
            <Info size={24} color="#3b82f6" className="mb-2" />
            <Text className="text-center text-gray-600">
              {rejectedRequests.length === 0 
                ? "No rejected requests available" 
                : "No matching rejected requests found"}
            </Text>
            {searchQuery && (
              <Text className="text-center text-gray-500 mt-1">
                Try a different search term
              </Text>
            )}
          </View>
        </View>
      ) : (
        <ScrollView className="pb-4" showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
          <View className="gap-4">
            {filteredData.map((request) => (
              <Card
                key={request.garb_id}
                className="border border-gray-200 rounded-lg bg-white shadow-sm"
              >
                <CardHeader className="border-b border-gray-200 p-4">
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-sm text-gray-500">
                        Sitio: {request.sitio_name}, {request.garb_location}
                      </Text>
                    </View>
                    <View className="flex-row gap-1 items-center">
                      <Text className="text-xs text-gray-500">
                        {formatTimestamp(request.garb_created_at)}
                      </Text>
                    </View>
                  </View>
                </CardHeader>
                <CardContent className="p-4">
                  <View className="gap-3">
                    {/* Waste Type */}
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-gray-600">Waste Type:</Text>
                      <Text className="text-sm font-semibold ">{request.garb_waste_type}</Text>
                    </View>

                    {/* Preferred Date */}
                    <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-600">Preferred Date & Time:</Text>
                        <Text className="text-sm">{request.garb_pref_date}, {formatTime(request.garb_pref_time)}</Text>
                    </View>

                    {/* Additional Notes */}
                    {request.garb_additional_notes && (
                        <View className="mt-2">
                        <Text className="text-sm text-gray-600">Notes:</Text>
                        <Text className="text-sm text-gray-800">{request.garb_additional_notes}</Text>
                        </View>
                    )}

                    {/* Attached File Link */}
                    {request.file_url && (
                      <View className="mt-3">
                        <TouchableOpacity
                          onPress={() => handleViewImage(request.file_url)}
                        >
                          <Text className="text-sm font-medium text-blue-600 underline">
                            View Attached Image
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Rejection Reason */}
                    {request.dec_reason && (
                      <View className="mt-3 pt-3 border-t border-gray-100">
                        <Text className="text-sm font-medium text-gray-700 mb-1">Rejection Reason:</Text>
                        <Text className="text-sm font-semibold text-red-700 ">
                          {request.dec_reason}
                        </Text>
                      </View>
                    )}

                    {/* Rejection Date */}
                    {request.dec_date && (
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-600">Rejection Date:</Text>
                        <Text className="text-sm font-medium text-red-700">
                          {formatTimestamp(request.dec_date)}
                        </Text>
                      </View>
                    )}
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Image Modal */}
      <Modal
        visible={viewImageModalVisible}
        transparent={true}
        onRequestClose={() => {
          setViewImageModalVisible(false);
          setCurrentZoomScale(1);
        }}
      >
        <View className="flex-1 bg-black/90">
          {/* Close Button */}
          <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4 flex-row justify-end items-center">
            <TouchableOpacity
              onPress={() => {
                setViewImageModalVisible(false);
                setCurrentZoomScale(1);
              }}
            >
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Image Viewer */}
          <ScrollView
            className="flex-1"
            maximumZoomScale={3}
            minimumZoomScale={1}
            zoomScale={currentZoomScale}
            onScrollEndDrag={(e) => setCurrentZoomScale(e.nativeEvent.zoomScale)}
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          >
            <Image
              source={{ uri: currentImage }}
              style={{ width: "100%", height: 400 }}
              resizeMode="contain"
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}