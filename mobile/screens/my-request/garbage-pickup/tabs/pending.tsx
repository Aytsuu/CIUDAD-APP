import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Image } from "react-native";
import { X, Search, Info } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { formatTime } from "@/helpers/timeFormatter";
import { useAuth } from "@/contexts/AuthContext";
import { useGetGarbagePendingResident } from "../queries/garbagePickupFetchQueries";
import { router } from "expo-router";
import { LoadingState } from "@/components/ui/loading-state";

export default function ResidentPending() {
  const { user } = useAuth();
  const { data: pendingRequests = [], isLoading: isDataLoading } = useGetGarbagePendingResident(String(user?.rp));

  const [searchQuery, setSearchQuery] = useState("");
  const [viewImageModalVisible, setViewImageModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [currentZoomScale, setCurrentZoomScale] = useState(1);

  const handleViewImage = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setViewImageModalVisible(true);
    setCurrentZoomScale(1);
  };

  const filteredData = pendingRequests.filter((request) => {
    const searchString = `
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

  const handleCancelReq = (garb_id: string) => {
    router.push({
      pathname: "/(my-request)/garbage-pickup/garbage-cancel-req-form",
      params: { garb_id },
    });
  };

  return (
    <View className="flex-1 p-6">
      {/* Header */}
      <Text className="text-lg font-medium text-gray-800 mb-2">
        Pending Requests ({filteredData.length})
      </Text>

      {/* Search Bar */}
      {!isDataLoading && (
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
      )}

      {/* Loading / Empty / List */}
      {isDataLoading ? (
        <View className="h-64 justify-center items-center">
          <LoadingState /> 
        </View>
      ) : filteredData.length === 0 ? (
        <View className="justify-center items-center py-8">
          <View className="bg-blue-50 p-6 rounded-lg items-center">
            <Info size={24} color="#3b82f6" className="mb-2" />
            <Text className="text-center text-gray-600">
              {pendingRequests.length === 0
                ? "No pending requests available"
                : "No matching requests found"}
            </Text>
            {searchQuery && (
              <Text className="text-center text-gray-500 mt-1">
                Try a different search term
              </Text>
            )}
          </View>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View className="gap-4">
            {filteredData.map((request) => (
              <Card
                key={request.garb_id}
                className="border border-gray-200 rounded-lg bg-white"
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
                      <Text className="text-sm font-medium">{request.garb_waste_type}</Text>
                    </View>

                    {/* Preferred Date */}
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-gray-600">Preferred Date & Time:</Text>
                      <Text className="text-sm">
                        {request.garb_pref_date}, {formatTime(request.garb_pref_time)}
                      </Text>
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
                        <TouchableOpacity onPress={() => handleViewImage(request.file_url)}>
                          <Text className="text-sm text-blue-600 underline">
                            View Attached Image
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Cancel Button - FIXED */}
                    <View className="flex-row justify-end mt-4">
                      <Button
                        className="border border-red-500 native:h-[40px] rounded-lg px-4"
                        onPress={() => handleCancelReq(request.garb_id)}
                      >
                        <Text className="text-red-600">Cancel</Text>
                      </Button>
                    </View>
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
          <View className="flex-1 justify-center items-center">
            <Image
              source={{ uri: currentImage }}
              style={{ width: "100%", height: 400 }}
              resizeMode="contain"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}