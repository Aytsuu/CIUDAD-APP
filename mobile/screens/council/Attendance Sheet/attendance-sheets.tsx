import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  Trash,
  Archive,
  ArchiveRestore,
  Loader2,
  ChevronLeft,
} from "lucide-react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useGetAttendanceSheets,
  useArchiveAttendanceSheet,
  useRestoreAttendanceSheet,
  useDeleteAttendanceSheet,
  useAddAttendanceSheet,
} from "../ce-events/ce-att-queries";
import { useLocalSearchParams } from "expo-router";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { Button } from "@/components/ui/button/button";
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import { useRouter } from "expo-router";
import PageLayout from "@/screens/_PageLayout";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const AttendanceSheets = () => {
  const { ceId } = useLocalSearchParams();
  const [viewMode, setViewMode] = useState<"active" | "archive">("active");
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [zoomedImage, setZoomedImage] = useState("");
  const [selectedImages, setSelectedImages] = useState<MediaItem[]>([]);
  const router = useRouter();
  const parsedCeId = Number(ceId) || 0;

  // Get all sheets and filter based on view mode
  const { data: allSheets = [], refetch } = useGetAttendanceSheets();
  const filteredSheets = allSheets.filter(
    (sheet) =>
      sheet.ce_id === parsedCeId &&
      sheet.att_is_archive === (viewMode === "archive")
  );
  const archiveSheet = useArchiveAttendanceSheet();
  const restoreSheet = useRestoreAttendanceSheet();
  const deleteSheet = useDeleteAttendanceSheet();
  const addAttendanceSheet = useAddAttendanceSheet();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAddAttendanceSheet = async () => {
    if (isUploading) return;
    setIsUploading(true); 
    
    try {
      await addAttendanceSheet.mutateAsync({
        ceId: parsedCeId,
        files: selectedImages,
      });
      setSelectedImages([]);
      setUploadModalVisible(false);
      await refetch();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleZoomImage = (imageUrl: string) => {
    setZoomedImage(imageUrl);
    setZoomModalVisible(true);
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" />
        </TouchableOpacity>
      }
    >
      <ScrollView 
        className="flex-1 p-2"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-4 pt-4 flex-row justify-between items-center">
          <Button
            className="bg-primaryBlue mb-4"
            onPress={() => setUploadModalVisible(true)}
          >
            <Text className="text-white">Upload</Text>
          </Button>

          <View className="flex-row border border-gray-300 rounded-full bg-gray-100 overflow-hidden h-10">
            <TouchableOpacity
              className={`px-4 items-center justify-center ${
                viewMode === "active" ? "bg-white" : ""
              }`}
              onPress={() => setViewMode("active")}
            >
              <Text className="text-sm font-medium">Active</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-4 items-center justify-center ${
                viewMode === "archive" ? "bg-white" : ""
              }`}
              onPress={() => setViewMode("archive")}
            >
              <Text className="text-sm font-medium">Archive</Text>
            </TouchableOpacity>
          </View>
        </View>

        {filteredSheets.length === 0 ? (
          <View className="flex-1 justify-center items-center py-12">
            <Text className="text-gray-500">
              {viewMode === "active"
                ? "No active sheets found for this meeting"
                : "No archived sheets found for this meeting"}
            </Text>
          </View>
        ) : (
          <View className="px-4">
            {filteredSheets.map((sheet) => (
              <Card key={sheet.att_id} className="mb-4">
                <CardContent>
                  <TouchableOpacity
                    onPress={() => handleZoomImage(sheet.att_file_url)}
                    className="mb-4"
                  >
                    <Image
                      source={{ uri: sheet.att_file_url }}
                      style={{ width: "100%", height: 300 }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>

                  <View className="flex-row justify-end gap-1 space-x-2">
                    {viewMode === "active" ? (
                      <ConfirmationModal
                        trigger={
                          <TouchableOpacity className="bg-red-600 p-1 rounded-md">
                            <Archive size={16} color="white" />
                          </TouchableOpacity>
                        }
                        title="Archive Sheet"
                        description="Are you sure you want to archive this sheet?"
                        onPress={() => archiveSheet.mutate(sheet.att_id)}
                      />
                    ) : (
                      <>
                        <ConfirmationModal
                          trigger={
                            <TouchableOpacity className="bg-green-600 p-1 rounded-md">
                              <ArchiveRestore size={20} color="white" />
                            </TouchableOpacity>
                          }
                          title="Restore Sheet"
                          description="Restore this sheet?"
                          onPress={() => restoreSheet.mutate(sheet.att_id)}
                        />
                        <ConfirmationModal
                          trigger={
                            <TouchableOpacity className="bg-red-600 p-1 rounded-md">
                              <Trash size={20} color="white" />
                            </TouchableOpacity>
                          }
                          title="Delete Sheet"
                          description="Permanently delete this sheet?"
                          variant="destructive"
                          onPress={() => deleteSheet.mutate(sheet.att_id)}
                        />
                      </>
                    )}
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}

        {/* Upload Modal */}
        <Modal
          visible={uploadModalVisible}
          onRequestClose={() => setUploadModalVisible(false)}
        >
          <View className="flex-1 bg-white p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Upload Sheets</Text>
              <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <MediaPicker
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
              multiple={true}
              maxImages={10}
              editable={true}
            />

            <View className="flex-row space-x-2 mt-4 gap-2">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg flex-row justify-center items-center ${
                  isUploading ? "bg-gray-200" : "bg-gray-300"
                }`}
                onPress={() => setUploadModalVisible(false)}
                disabled={isUploading}
              >
                <Text
                  className={`text-base font-medium ${
                    isUploading ? "text-gray-400" : "text-gray-800"
                  }`}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg flex-row justify-center items-center ${
                  isUploading || selectedImages.length === 0
                    ? "bg-primaryBlue/50"
                    : "bg-primaryBlue"
                }`}
                onPress={handleAddAttendanceSheet}
                disabled={selectedImages.length === 0 || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2
                      size={20}
                      color="white"
                      className="animate-spin mr-2"
                    />
                    <Text className="text-white text-base font-medium">
                      Uploading...
                    </Text>
                  </>
                ) : (
                  <Text className="text-white text-base font-medium">
                    Upload
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Zoom Modal */}
        <Modal
          visible={zoomModalVisible}
          transparent={true}
          onRequestClose={() => setZoomModalVisible(false)}
        >
          <View className="flex-1 bg-black/90 justify-center items-center">
            <TouchableOpacity
              className="absolute top-10 right-4 z-10"
              onPress={() => setZoomModalVisible(false)}
            >
              <MaterialIcons name="close" size={30} color="white" />
            </TouchableOpacity>
            <Image
              source={{ uri: zoomedImage }}
              style={{
                width: screenWidth * 0.9,
                height: screenHeight * 0.8,
              }}
              resizeMode="contain"
            />
          </View>
        </Modal>
      </ScrollView>
    </PageLayout>
  );
};

export default AttendanceSheets;