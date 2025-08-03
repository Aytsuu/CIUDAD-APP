import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Image, ScrollView, FlatList } from "react-native";
import { Info, X } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGetGarbageCompletedTasks, type GarbageCompletedTasks } from "./queries/garbagePickupDriverFetchQueries";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { formatTime } from "@/helpers/timeFormatter";

export default function GarbageCompletedTasks() {
  const [viewImageModalVisible, setViewImageModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [currentZoomScale, setCurrentZoomScale] = useState(1);
  const { data: completedTasks = [], isLoading } = useGetGarbageCompletedTasks();

  const handleViewImage = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setViewImageModalVisible(true);
    setCurrentZoomScale(1);
  };

  const renderTaskCard = (task: GarbageCompletedTasks) => (
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
              {formatTimestamp(task.conf_staff_conf_date || task.conf_resident_conf_date || '')}
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

          {/* Completed Date */}
          {task.conf_staff_conf_date && (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Completed Date:</Text>
              <Text className="text-sm">{new Date(task.conf_staff_conf_date).toLocaleDateString()}</Text>
            </View>
          )}

          {/* Pickup Date */}
          {task.assignment_info?.pick_date && (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Pickup Date:</Text>
              <Text className="text-sm">{task.assignment_info.pick_date}</Text>
            </View>
          )}

          {/* Pickup Time */}
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
        </View>
      </CardContent>
    </Card>
  );

  return (
    <View className="px-4 pt-4">
      {/* Task List */}
      {isLoading ? (
        <View className="justify-center items-center py-8">
          <Text className="text-center text-gray-500">Loading completed tasks...</Text>
        </View>
      ) : completedTasks.length === 0 ? (
        <View className="justify-center items-center py-8">
          <View className="bg-blue-50 p-6 rounded-lg items-center">
            <Info size={24} color="#3b82f6" className="mb-2" />
            <Text className="text-center text-gray-600">
              No completed tasks found
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={completedTasks}
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