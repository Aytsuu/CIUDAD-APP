import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Image, RefreshControl } from "react-native";
import { X, Search, Info, ChevronRight } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { useGetGarbageCancelledResident } from "../queries/garbagePickupFetchQueries";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/ui/loading-state";
import { useRouter } from "expo-router";

export default function ResidentCancelled() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  
  const { data: cancelledRequest = [], isLoading: isDataLoading, refetch } = useGetGarbageCancelledResident(String(user?.rp));
  
  const [viewImageModalVisible, setViewImageModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleViewDetails = (garb_id: string) => {
    router.push({
      pathname: '/(my-request)/garbage-pickup/view-cancelled-details',
      params: { garb_id }
    });
  };

  const filteredData = cancelledRequest.filter((request) => {
    const searchString = `
      ${request.garb_location} 
      ${request.garb_waste_type}
      ${request.sitio_name || ""}
    `.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const handleViewImage = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setViewImageModalVisible(true);
  };

  return (
    <View className="flex-1 p-6">
      {/* Search Bar */}
      
        <View>
          <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-3 mb-2">
            <Search size={18} color="#6b7280" />
            <Input
              className="flex-1 ml-2 bg-white text-black"
              placeholder="Search cancelled requests..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ borderWidth: 0, shadowOpacity: 0 }}
            />
          </View>
          
          {!isDataLoading && (
            <View className="mb-4">
              <Text className="text-sm text-gray-500">
                {filteredData.length} request{filteredData.length !== 1 ? 's' : ''} found
              </Text>
            </View>
          )}
        </View>
     

      {/* Loading / Empty / List */}
      {isDataLoading && !isRefreshing ? (
        <View className="h-64 justify-center items-center">
          <LoadingState />
        </View>
      ) : (
        <ScrollView 
          className="pb-4" 
          showsVerticalScrollIndicator={false} 
          showsHorizontalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#00a8f0']}
              tintColor="#00a8f0"
            />
          }
        >
          {filteredData.length === 0 ? (
            <View className="justify-center items-center py-8">
              <View className="bg-blue-50 p-6 rounded-lg items-center">
                <Info size={24} color="#3b82f6" className="mb-2" />
                <Text className="text-center text-gray-600">
                  {cancelledRequest.length === 0
                    ? "No cancelled requests available"
                    : "No matching cancelled requests found"}
                </Text>
                {searchQuery && (
                  <Text className="text-center text-gray-500 mt-1">
                    Try a different search term
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View className="gap-4">
              {filteredData.map((request) => (
                <Card
                  key={request.garb_id}
                  className="border border-gray-200 rounded-lg bg-white shadow-sm"
                >
                  {/* Make header clickable */}
                  <CardHeader className="border-b border-gray-200 p-4">
                    <TouchableOpacity 
                      onPress={() => handleViewDetails(request.garb_id)}
                      className="flex flex-row justify-between items-center"
                    >
                      <View className="flex-1">
                        <View className='flex flex-row justify-between items-center mb-1'>
                          <View className="bg-blue-600 px-3 py-1 rounded-full">
                            <Text className="text-white font-bold text-sm tracking-wide" numberOfLines={1}>
                              {request.garb_id}
                            </Text>
                          </View>
                          <ChevronRight size={16} color="#6b7280" />
                        </View>
                        <View className='flex flex-row justify-between items-center gap-2'>
                          <Text className="text-xs text-gray-500 flex-1" numberOfLines={1}>
                            {request.sitio_name}, {request.garb_location}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </CardHeader>

                  <CardContent className="p-4">
                    <View className="gap-3">
                      {/* Waste Type */}
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-600">Waste Type:</Text>
                        <View className="bg-orange-100 px-2 py-1 rounded-full">
                          <Text className="text-orange-700 font-medium text-xs">{request.garb_waste_type}</Text>
                        </View>
                      </View>

                      {/* Cancellation Date */}
                      {request.dec_date && (
                        <View className="flex-row justify-between">
                          <Text className="text-sm text-gray-600">Cancelled:</Text>
                          <Text className="text-sm text-gray-800 font-medium">
                            {formatTimestamp(request.dec_date)}
                          </Text>
                        </View>
                      )}

                      {/* Quick Preview of Cancellation Reason */}
                      {request.dec_reason && (
                        <View className="mt-2">
                          <Text className="text-sm text-gray-600">Reason:</Text>
                          <Text 
                            className="text-sm text-red-700 font-medium"
                            numberOfLines={2}
                            ellipsizeMode="tail"
                          >
                            {request.dec_reason}
                          </Text>
                        </View>
                      )}

                      {/* Image Preview (if available) */}
                      {request.file_url && (
                        <View className="mt-2">
                          <TouchableOpacity 
                            onPress={() => handleViewImage(request.file_url)}
                            className="flex-row items-center"
                          >
                            <Text className="text-sm font-medium text-blue-600">
                              View Attached Image
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </CardContent>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Image Modal */}
      <Modal
        visible={viewImageModalVisible}
        transparent={true}
        onRequestClose={() => setViewImageModalVisible(false)}
      >
        <View className="flex-1 bg-black/90">
          <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4 flex-row justify-end items-center">
            <TouchableOpacity onPress={() => setViewImageModalVisible(false)}>
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

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