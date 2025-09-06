import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Image } from "react-native";
import { CheckCircle, XCircle, X, Search, Info } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetGarbagePendingRequest } from "../queries/garbagePickupStaffFetchQueries";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { formatTime } from "@/helpers/timeFormatter";
import { useRouter } from "expo-router";

export default function PendingGarbageRequest() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewImageModalVisible, setViewImageModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [currentZoomScale, setCurrentZoomScale] = useState(1);
  const router = useRouter();
  
  const { data: pendingReqData = [], isLoading } = useGetGarbagePendingRequest();

  const filteredData = pendingReqData.filter((request) => {
    const searchString = `
      ${request.garb_id} 
      ${request.garb_requester} 
      ${request.garb_location} 
      ${request.garb_waste_type} 
      ${request.garb_pref_date} 
      ${request.garb_pref_time} 
      ${request.garb_additional_notes || ""}
      ${request.file_url || ""}
      ${request.sitio_name || ""}
    `.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const handleViewImage = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setViewImageModalVisible(true);
    setCurrentZoomScale(1);
  };

  const handleReject = (garb_id: string) => { 
    router.push({
      pathname: '/(waste)/garbage-pickup/staff/reject-request',
      params: { 
        garb_id: garb_id
      }
    });
  };

  const handleAccept = (garb_id: string, pref_date: string, pref_time: string) => { 
    router.push({
      pathname: '/(waste)/garbage-pickup/staff/accept-request',
      params: { 
        garb_id: garb_id,
        pref_date: pref_date,
        pref_time: pref_time
      }
    });
  };

  return (
    <View className="flex-1">
      {/* Header */}
      <Text className="text-lg font-medium text-gray-800 mb-2">
        Pending Requests ({filteredData.length})
      </Text>

      {/* Search Bar */}
      {!isLoading?(
        <View className="flex-row items-center bg-white border border-gray-200 rounded-lg px-3 mb-4 mt-2">
          <Search size={18} color="#6b7280" />
          <Input
            className="flex-1 ml-2 bg-white text-black"
            placeholder="Search pending requests..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ borderWidth: 0, shadowOpacity: 0 }}
          />
        </View>
      ):( null )}

      {/* List */}
      {isLoading ? (
        <View className="justify-center items-center">
          <Text className="text-center text-gray-500 py-8">Loading pending requests...</Text>
        </View>
      ) : filteredData.length === 0 ? (
        <View className="justify-center items-center">
          <View className="bg-blue-50 p-6 rounded-lg items-center">
            <Info size={24} color="#3b82f6" className="mb-2" />
            <Text className="text-center text-gray-600">
              {pendingReqData.length === 0 
                ? "No pending requests available" 
                : "No matching pending requests found"}
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
                className="border border-gray-200 rounded-lg bg-white"
              >
                <CardHeader className="border-b border-gray-200 p-4">
                  <View className="flex flex-row justify-between items-center">
                      <View className="flex-1">
                        <View className='flex flex-row items-center gap-2 mb-1'>
                          <View className="bg-blue-600 px-3 py-1 rounded-full self-start">
                            <Text className="text-white font-bold text-sm tracking-wide">{request.garb_id}</Text>
                          </View>
                          <Text className="font-medium">{request.garb_requester}</Text>
                        </View>
                        <View className='flex flex-row justify-between items-center gap-2'>
                            <Text className="text-xs text-gray-500">
                              Sitio: {request.sitio_name}, {request.garb_location}
                            </Text>
                            <Text className="text-xs text-gray-500">{formatTimestamp(request.garb_created_at)}</Text>
                        </View>
                      </View>
                  </View>
                </CardHeader>
                <CardContent className="p-4">
                  <View className="gap-3">
                    {/* Waste Type */}
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-gray-600">Waste Type:</Text>
                      <Text className="text-sm font-medium">{request.garb_waste_type}</Text>
                    </View>

                    {/* Preferred Date */}
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-gray-600">Preferred Date:</Text>
                      <Text className="text-sm">{request.garb_pref_date}</Text>
                    </View>

                    {/* Preferred Time */}
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-gray-600">Preferred Time:</Text>
                      <Text className="text-sm">{formatTime(request.garb_pref_time)}</Text>
                    </View>

                    {/* Additional Notes */}
                    {request.garb_additional_notes && (
                      <View className="mt-2">
                        <Text className="text-sm text-gray-600">Notes:</Text>
                        <Text className="text-sm">{request.garb_additional_notes}</Text>
                      </View>
                    )}

                    {/* Attached File Link */}
                    {request.file_url && (
                      <View className="mt-2">
                        <TouchableOpacity
                          onPress={() => handleViewImage(request.file_url)}
                        >
                          <Text className="text-sm text-blue-600 underline">
                            View Attached Image
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Action Buttons */}
                    <View className="flex-row justify-end gap-2 mt-4">
                      <Button 
                        className="bg-[#17AD00] p-2"
                        onPress={() => handleAccept(request.garb_id, request.garb_pref_date, request.garb_pref_time)}
                      >
                        <CheckCircle size={16} color="white" />
                      </Button>
                      <Button 
                        className="bg-[#ff2c2c] p-2"
                        onPress={() => handleReject(request.garb_id)}
                      >
                        <XCircle size={16} color="white" />
                      </Button>
                    </View>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Image Modal - Same as in rejected requests */}
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