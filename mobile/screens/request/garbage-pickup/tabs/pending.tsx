import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Image } from "react-native";
import { XCircle, X, Search, Info } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { formatTime } from "@/helpers/timeFormatter";

// Mock data interface
interface GarbageRequest {
  garb_id: string;
  garb_location: string;
  garb_waste_type: string;
  garb_pref_date: string;
  garb_pref_time: string;
  garb_additional_notes?: string;
  garb_created_at: string;
  file_url?: string;
  sitio_name?: string;
}

export default function ResidentPending() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewImageModalVisible, setViewImageModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [currentZoomScale, setCurrentZoomScale] = useState(1);
  
  // Mock data - replace with your actual data source
  const [requestsData, setRequestsData] = useState<GarbageRequest[]>([
    {
      garb_id: "1",
      garb_location: "Main Street",
      garb_waste_type: "General Waste",
      garb_pref_date: "2023-10-15",
      garb_pref_time: "10:00:00",
      garb_created_at: "2023-10-10T08:30:00Z",
      sitio_name: "Sitio 1",
      file_url: "https://example.com/image1.jpg"
    },
    {
      garb_id: "2",
      garb_location: "Park Avenue",
      garb_waste_type: "Recyclables",
      garb_pref_date: "2023-10-16",
      garb_pref_time: "14:30:00",
      garb_additional_notes: "Please collect plastic bottles separately",
      garb_created_at: "2023-10-11T09:15:00Z",
      sitio_name: "Sitio 2"
    }
  ]);

  const isLoading = false; // Replace with actual loading state if needed

  const filteredData = requestsData.filter((request) => {
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
 

  return (
    <View className="flex-1 p-4">
      {/* Header */}
      <Text className="text-lg font-medium text-gray-800 mb-2">
        Pending Requests ({filteredData.length})
      </Text>

      {/* Search Bar */}
      {!isLoading && (
        <View className="flex-row items-center bg-white border border-gray-200 rounded-lg px-3 mb-4 mt-2">
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
      {isLoading ? (
        <View className="justify-center items-center py-8">
          <Text className="text-center text-gray-500">Loading requests...</Text>
        </View>
      ) : filteredData.length === 0 ? (
        <View className="justify-center items-center py-8">
          <View className="bg-blue-50 rounded-lg items-cente">
            <Info size={24} color="#3b82f6" className="mb-2" />
            <Text className="text-center text-gray-600">
              {requestsData.length === 0 
                ? "No requests available" 
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
                        //   onPress={() => handleViewImage(request.file_url)}
                        >
                          <Text className="text-sm text-blue-600 underline">
                            View Attached Image
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Cancel Button */}
                    <View className="flex-row justify-end mt-4">
                      <Button 
                        className="bg-[#ff2c2c]"
                        // onPress={() => handleCancel(request.garb_id)}
                      >
                        <Text className="text-white text-sm">Cancel</Text>
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