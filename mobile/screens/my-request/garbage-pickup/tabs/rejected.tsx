import { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal, Image, RefreshControl, ScrollView } from "react-native";
import { X, Search, Info } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { useGetGarbageRejectedResident } from "../queries/garbagePickupFetchQueries";
import { formatTime } from "@/helpers/timeFormatter";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/ui/loading-state"; 

export default function ResidentRejected() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewImageModalVisible, setViewImageModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [currentZoomScale, setCurrentZoomScale] = useState(1);

  // Add refetch to the query hook
  const { data: rejectedRequests = [], isLoading: isDataLoading, refetch } = useGetGarbageRejectedResident(String(user?.rp));

  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

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

  // Render Donation Card Component
  const RenderRejectedCard = ({ item }: { item: any }) => (
    <Card
      key={item.garb_id}
      className="border border-gray-200 rounded-lg bg-white shadow-sm mb-4"
    >
      <CardHeader className="border-b border-gray-200 p-3">
        <View className="flex flex-row justify-between items-start">
          <View className="flex-1">
            {/* Garb ID and Timestamp in one line */}
            <View className='flex flex-row justify-between items-center mb-1'>
              <View className="bg-blue-600 px-3 py-1 rounded-full">
                <Text className="text-white font-bold text-sm tracking-wide">{item.garb_id}</Text>
              </View>
              <Text className="text-xs text-gray-500">{formatTimestamp(item.garb_created_at)}</Text>
            </View>
            
            {/* Location info */}
            <Text className="text-xs text-gray-500">
              Sitio: {item.sitio_name}, {item.garb_location}
            </Text>
          </View>
        </View>
      </CardHeader>

      <CardContent className="p-4">
        <View className="gap-3">
          {/* Waste Type */}
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-600">Waste Type:</Text>
            <Text className="text-sm font-semibold">{item.garb_waste_type}</Text>
          </View>

          {/* Preferred Date */}
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-600">Preferred Date & Time:</Text>
            <Text className="text-sm">
              {item.garb_pref_date}, {formatTime(item.garb_pref_time)}
            </Text>
          </View>

          {/* Additional Notes */}
          {item.garb_additional_notes && (
            <View className="mt-2">
              <Text className="text-sm text-gray-600">Notes:</Text>
              <Text className="text-sm text-gray-800">{item.garb_additional_notes}</Text>
            </View>
          )}

          {/* Attached File Link */}
          {item.file_url && (
            <View className="mt-3">
              <TouchableOpacity onPress={() => handleViewImage(item.file_url)}>
                <Text className="text-sm font-medium text-blue-600 underline">
                  View Attached Image
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Rejection Reason */}
          {item.dec_reason && (
            <View className="mt-3 pt-3 border-t border-gray-100">
              <Text className="text-sm font-medium text-gray-700 mb-1">Rejection Reason:</Text>
              <Text className="text-sm font-semibold text-red-700">
                {item.dec_reason}
              </Text>
            </View>
          )}

          {/* Rejection Date with Staff Name */}
          {item.dec_date && (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-400 text-right italic">
                {item.staff_name ? `by ${item.staff_name}, on ${formatTimestamp(item.dec_date)}` : formatTimestamp(item.dec_date)}
              </Text>
            </View>
          )}
        </View>
      </CardContent>
    </Card>
  );

  // Empty state component
  const renderEmptyState = () => {
    const emptyMessage = searchQuery || rejectedRequests.length === 0
      ? "No rejected requests available"
      : "No matching rejected requests found";
    
    return (
      <View className="justify-center items-center py-8">
        <View className="bg-blue-50 p-6 rounded-lg items-center">
          <Info size={24} color="#3b82f6" className="mb-2" />
          <Text className="text-center text-gray-600">
            {emptyMessage}
          </Text>
          {searchQuery && (
            <Text className="text-center text-gray-500 mt-1">
              Try a different search term
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 p-6">
      {/* Search Bar */}
      {!isDataLoading && (
        <View>
          <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-3 mb-2">
            <Search size={18} color="#6b7280" />
            <Input
              className="flex-1 ml-2 bg-white text-black"
              placeholder="Search rejected requests..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ borderWidth: 0, shadowOpacity: 0 }}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500">
              {filteredData.length} request{filteredData.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        </View>
      )}

      {/* Loading / Empty / List */}
      {isDataLoading && !isRefreshing ? (
        <View className="h-64 justify-center items-center">
          <LoadingState />
        </View>
      ) : (
        <View className="flex-1">
          {filteredData.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={filteredData}
              renderItem={({ item }) => <RenderRejectedCard item={item} />}
              keyExtractor={(item) => item.garb_id}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={['#00a8f0']}
                  tintColor="#00a8f0"
                />
              }
              contentContainerStyle={{ 
                flexGrow: 1
              }}
            />
          )}
        </View>
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