import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Image, RefreshControl } from "react-native";
import { CheckCircle, XCircle, X, Search, Info } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetGarbagePendingRequest } from "../queries/garbagePickupStaffFetchQueries";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { formatTime } from "@/helpers/timeFormatter";
import { useRouter } from "expo-router";
import { LoadingState } from "@/components/ui/loading-state";
import EmptyState from "@/components/ui/emptyState";

export default function PendingGarbageRequest() {
  const [searchInputVal, setSearchInputVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, _setPageSize] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewImageModalVisible, setViewImageModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [currentZoomScale, setCurrentZoomScale] = useState(1);
  const router = useRouter();
  
  // Query hook with pagination and search
  const { 
    data: pendingReqData, 
    isLoading, 
    refetch 
  } = useGetGarbagePendingRequest(currentPage, pageSize, searchQuery);

  const requests = pendingReqData?.results || [];
  const totalCount = pendingReqData?.count || 0;

  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setCurrentPage(1);
  };

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

  // Empty state component
  const renderEmptyState = () => (
    searchQuery ? (
      <View className="flex-1 justify-center items-center p-6">
        <EmptyState emptyMessage="No pending requests found" />
      </View>
    ) : (
      <View className="flex-1 justify-center items-center p-6">
        <EmptyState emptyMessage="No pending requests available" />
      </View>
    )
  );

  // Loading state component
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <LoadingState/>
    </View>
  );

  // Main content component
  const renderMainContent = () => (
    <View className="gap-4">
      {requests.map((request) => (
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
  );

  // Determine which content to render
  const renderContent = () => {
    if (isLoading && !isRefreshing) {
      return renderLoadingState();
    }

    if (totalCount === 0) {
      return renderEmptyState();
    }

    return renderMainContent();
  };

  return (
    <View className="flex-1">
      {/* Search Bar*/}
      {!isLoading && (
        <View>
          <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-3 mb-2">
            <Search size={18} color="#6b7280" />
            <Input
              className="flex-1 ml-2 bg-white text-black"
              placeholder="Search pending requests..."
              value={searchInputVal}
              onChangeText={(text) => {
                setSearchInputVal(text);
                handleSearch(text);
              }}
              style={{ borderWidth: 0, shadowOpacity: 0 }}
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-sm text-gray-500">
              {totalCount} request{totalCount !== 1 ? 's' : ''} found
            </Text>
          </View>
        </View>
      )}

      {/* Main Content with Refresh Control */}
      <ScrollView 
        className="flex-1"
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
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: 16 
        }}
      >
        {renderContent()}
      </ScrollView>

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