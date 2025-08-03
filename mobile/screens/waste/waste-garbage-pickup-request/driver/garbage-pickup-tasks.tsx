import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Image, FlatList } from "react-native";
import { CheckCircle, Search, Info, X } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetGarbagePickupTasks, type GarbagePickupTask } from "./queries/garbagePickupDriverFetchQueries";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { formatTime } from "@/helpers/timeFormatter";
import { useRouter } from "expo-router";
import PageLayout from "@/screens/_PageLayout";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { useUpdateGarbageRequestStatus } from "./queries/garbagePickupDriverUpdateQueries";

export default function GarbagePickupTasks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [viewImageModalVisible, setViewImageModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [currentZoomScale, setCurrentZoomScale] = useState(1);
  const router = useRouter();
  const { mutate: confirmCompletion, isPending} = useUpdateGarbageRequestStatus()
  const { data: pickupTasks = [], isLoading } = useGetGarbagePickupTasks();

  const filteredData = pickupTasks.filter((task) => {
    const searchString = `
      ${task.garb_requester} 
      ${task.garb_location} 
      ${task.garb_waste_type} 
      ${task.dec_date} 
      ${task.assignment_info?.pick_date || ""} 
      ${task.assignment_info?.pick_time || ""}
      ${task.sitio_name || ""}
    `.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const handleViewImage = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setViewImageModalVisible(true);
    setCurrentZoomScale(1);
  };

  const handleCompleteTask = (garb_id: string) => {
    confirmCompletion(garb_id)
  }


  const renderTaskCard = (task: GarbagePickupTask) => (
    <Card className="border border-gray-200 rounded-lg bg-white mb-4">
      <CardHeader className="border-b border-gray-200 p-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="font-medium">{task.garb_requester}</Text>
            <Text className="text-sm text-gray-500">
              Sitio: {task.sitio_name}, {task.garb_location}
            </Text>
          </View>
          <View className="flex-row gap-1 items-center">
            <Text className="text-xs text-gray-500">
              {formatTimestamp(task.dec_date)}
            </Text>
          </View>
        </View>
      </CardHeader>
      <CardContent className="p-4">
        <View className="gap-3">
          {/* Waste Type */}
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-600">Waste Type:</Text>
            <Text className="text-sm font-medium">{task.garb_waste_type}</Text>
          </View>

          {/* Scheduled Pickup Date */}
          {task.assignment_info?.pick_date && (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Pickup Date:</Text>
              <Text className="text-sm">{task.assignment_info.pick_date}</Text>
            </View>
          )}

          {/* Scheduled Pickup Time */}
          {task.assignment_info?.pick_time && (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Pickup Time:</Text>
              <Text className="text-sm">{formatTime(task.assignment_info.pick_time)}</Text>
            </View>
          )}

          {/* Assigned Truck */}
          {task.assignment_info?.truck && (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Assigned Truck:</Text>
              <Text className="text-sm">{task.assignment_info.truck}</Text>
            </View>
          )}

          {/* Assigned Collectors */}
          {task.assignment_info?.collectors && task.assignment_info.collectors.length > 0 && (
            <View>
              <Text className="text-sm text-gray-600">Team Members:</Text>
              <Text className="text-sm">
                {task.assignment_info.collectors.join(", ")}
              </Text>
            </View>
          )}

          {/* Attached File Link */}
          {task.file_url && (
            <View className="mt-2">
              <TouchableOpacity onPress={() => handleViewImage(task.file_url)}>
                <Text className="text-sm text-blue-600 underline">
                  View Attached Image
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Complete Task Button */}
        <View className="flex-row justify-end mt-4">
            <ConfirmationModal
                trigger={
                        <Button className="bg-[#17AD00] p-2 w-12"> 
                            <CheckCircle size={16} color="white" />
                        </Button>
                }
                actionLabel="Confirm"
                title="Confirm Completion"
                description="Would you like to confirm the completion of the task?"
                onPress={() => handleCompleteTask(task.garb_id)}
            />
            </View>
        </View>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Garbage Pickup Tasks</Text>}
      rightAction={
        <TouchableOpacity onPress={() => setShowSearch(!showSearch)} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <Search size={22} className="text-gray-700" />
        </TouchableOpacity>
      }
    >
      <View className="px-4">
        {/* Search Bar - shown conditionally */}
        {showSearch && (
          <View className="flex-row items-center bg-white border border-gray-200 rounded-lg px-3 mb-4 mt-2">
            <Search size={18} color="#6b7280" />
            <Input
              className="flex-1 ml-2 bg-white text-black"
              placeholder="Search pickup tasks..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ borderWidth: 0, shadowOpacity: 0 }}
            />
          </View>
        )}

        {/* Task Count */}
        <Text className="text-lg font-medium text-gray-800 mb-2">
          Pickup Tasks ({filteredData.length})
        </Text>

        {/* Task List */}
        {isLoading ? (
          <View className="justify-center items-center py-8">
            <Text className="text-center text-gray-500">Loading pickup tasks...</Text>
          </View>
        ) : filteredData.length === 0 ? (
          <View className="justify-center items-center py-8">
            <View className="bg-blue-50 p-6 rounded-lg items-center">
              <Info size={24} color="#3b82f6" className="mb-2" />
              <Text className="text-center text-gray-600">
                {pickupTasks.length === 0 
                  ? "No pickup tasks assigned" 
                  : "No matching tasks found"}
              </Text>
              {searchQuery && (
                <Text className="text-center text-gray-500 mt-1">
                  Try a different search term
                </Text>
              )}
            </View>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            renderItem={({ item }) => renderTaskCard(item)}
            keyExtractor={(item) => item.garb_id}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

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
    </PageLayout>
  );
}