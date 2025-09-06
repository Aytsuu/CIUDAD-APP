import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Image, ScrollView, FlatList } from "react-native";
import { CheckCircle, Info, X } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetGarbagePickupTasks, type GarbagePickupTask } from "./queries/garbagePickupDriverFetchQueries";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { formatTime } from "@/helpers/timeFormatter";
import { useUpdateGarbageRequestStatus } from "./queries/garbagePickupDriverUpdateQueries";
import { ConfirmationModal } from "@/components/ui/confirmationModal";

export default function GarbagePickupTasks() {
  const [viewImageModalVisible, setViewImageModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [currentZoomScale, setCurrentZoomScale] = useState(1);
  const { mutate: confirmCompletion } = useUpdateGarbageRequestStatus();
  const { data: pickupTasks = [], isLoading } = useGetGarbagePickupTasks();

  const handleViewImage = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setViewImageModalVisible(true);
    setCurrentZoomScale(1);
  };

  const handleCompleteTask = (garb_id: string) => {
    confirmCompletion(garb_id);
  };

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
          {task.assignment_info?.pick_date && task.assignment_info?.pick_time && (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Pickup Date & Time:</Text>
              <Text className="text-sm">{task.assignment_info.pick_date}, {formatTime(task.assignment_info.pick_time)}</Text>
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
    <View className="px-4 pt-4">
      {/* Task List */}
      {isLoading ? (
        <View className="justify-center items-center py-8">
          <Text className="text-center text-gray-500">Loading pickup tasks...</Text>
        </View>
      ) : pickupTasks.length === 0 ? (
        <View className="justify-center items-center py-8">
          <View className="bg-blue-50 p-6 rounded-lg items-center">
            <Info size={24} color="#3b82f6" className="mb-2" />
            <Text className="text-center text-gray-600">
              No pickup tasks assigned
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={pickupTasks}
          renderItem={({ item }) => renderTaskCard(item)}
          keyExtractor={(item) => item.garb_id}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
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