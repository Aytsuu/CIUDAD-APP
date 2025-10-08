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
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  Trash2,
  Archive,
  ArchiveRestore,
  Loader2,
  ChevronLeft,
} from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import { useRouter } from "expo-router";
import PageLayout from "@/screens/_PageLayout";
import EmptyState from "@/components/ui/emptyState";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const AttendanceSheets = () => {
  const { ceId } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<"active" | "archive">("active");
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [zoomedImage, setZoomedImage] = useState("");
  const [selectedImages, setSelectedImages] = useState<MediaItem[]>([]);
  const router = useRouter();
  const parsedCeId = Number(ceId) || 0;

  // Get all sheets and filter based on active tab
  const { data: allSheets = [], refetch, isLoading } = useGetAttendanceSheets();
  const filteredSheets = allSheets.filter(
    (sheet) =>
      sheet.ce_id === parsedCeId &&
      sheet.att_is_archive === (activeTab === "archive")
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

  const handleArchive = (attId: number) => {
    archiveSheet.mutate(attId, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  const handleRestore = (attId: number) => {
    restoreSheet.mutate(attId, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  const handleDelete = (attId: number) => {
    deleteSheet.mutate(attId, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  const RenderAttendanceSheetCard = React.memo(({ sheet, isArchived }: { sheet: any; isArchived: boolean }) => (
    <Card className="border-2 border-gray-200 shadow-sm bg-white mb-4">
      <CardHeader className="pb-3">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            {/* <Text className="font-semibold text-lg text-[#1a2332] mb-1">
              Attendance Sheet
            </Text> */}
            <Text className="text-sm text-gray-500">
              {sheet.att_file_type}
            </Text>
          </View>
          
          {isArchived ? (
            <View className="flex-row">
              <ConfirmationModal
                trigger={
                  <TouchableOpacity className="bg-green-50 p-2 rounded-lg ml-2">
                    <ArchiveRestore size={16} color="#10b981" />
                  </TouchableOpacity>
                }
                title="Restore Attendance Sheet"
                description="This attendance sheet will be restored to active sheets."
                actionLabel="Restore"
                onPress={() => handleRestore(sheet.att_id)}
              />
              <ConfirmationModal
                trigger={
                  <TouchableOpacity className="bg-red-50 p-2 rounded-lg ml-2">
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                }
                title="Delete Attendance Sheet"
                description="This action cannot be undone. The attendance sheet will be permanently deleted."
                actionLabel="Delete"
                onPress={() => handleDelete(sheet.att_id)}
              />
            </View>
          ) : (
            <ConfirmationModal
              trigger={
                <TouchableOpacity className="bg-red-50 p-2 rounded-lg ml-2">
                  <Archive size={16} color="#ef4444" />
                </TouchableOpacity>
              }
              title="Archive Attendance Sheet"
              description="This attendance sheet will be moved to archive. You can restore it later if needed."
              actionLabel="Archive"
              onPress={() => handleArchive(sheet.att_id)}
            />
          )}
        </View>
      </CardHeader>

      <CardContent className="pt-3 border-t border-gray-200">
        <TouchableOpacity
          onPress={() => handleZoomImage(sheet.att_file_url)}
          className="mb-3"
        >
          <Image
            source={{ uri: sheet.att_file_url }}
            style={{ width: "100%", height: 200 }}
            resizeMode="contain"
            className="rounded-lg"
          />
        </TouchableOpacity>
      </CardContent>
    </Card>
  ));

  // Empty state component
  const renderEmptyState = () => {
    const emptyMessage = activeTab === "active"
      ? "No active sheets found for this meeting"
      : "No archived sheets found for this meeting";
    
    return (
      <View className="flex-1 justify-center items-center py-12">
        <EmptyState emptyMessage={emptyMessage} />
      </View>
    );
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="font-semibold text-lg text-[#2a3a61]">Attendance Sheets</Text>}
      rightAction={<View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>}
      wrapScroll={false}
    >
      <View className="flex-1 px-6">
        {/* Upload Button */}
        <View className="mb-4 mt-5">
          <Button
            className="bg-primaryBlue rounded-xl"
            onPress={() => setUploadModalVisible(true)}
          >
            <Text className="text-white text-[15px]">Upload Sheets</Text>
          </Button>
        </View>

        {/* Tabs - Styled like Budget Plan */}
        <Tabs value={activeTab} onValueChange={val => setActiveTab(val as "active" | "archive")} className="flex-1">
          <TabsList className="bg-blue-50 flex-row justify-between">
            <TabsTrigger 
              value="active" 
              className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
            >
              <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                Active
              </Text>
            </TabsTrigger>
            <TabsTrigger 
              value="archive" 
              className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
            >
              <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                Archive
              </Text>
            </TabsTrigger>
          </TabsList>

          {/* Active Tab Content */}
          <TabsContent value="active" className="flex-1 mt-4">
            {isLoading ? (
              <View className="h-64 justify-center items-center">
                <Loader2 size={24} color="#2a3a61" className="animate-spin" />
                <Text className="text-sm text-gray-500 mt-2">
                  Loading attendance sheets...
                </Text>
              </View>
            ) : (
              <View className="flex-1">
                {filteredSheets.length === 0 ? (
                  renderEmptyState()
                ) : (
                  <FlatList
                    data={filteredSheets}
                    renderItem={({ item }) => <RenderAttendanceSheetCard sheet={item} isArchived={false} />}
                    keyExtractor={(item) => item.att_id.toString()}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#00a8f0']}
                      />
                    }
                    contentContainerStyle={{ 
                      paddingBottom: 16,
                      paddingTop: 16
                    }}
                  />
                )}
              </View>
            )}
          </TabsContent>

          {/* Archive Tab Content */}
          <TabsContent value="archive" className="flex-1 mt-4">
            {isLoading ? (
              <View className="h-64 justify-center items-center">
                <Loader2 size={24} color="#2a3a61" className="animate-spin" />
                <Text className="text-sm text-gray-500 mt-2">
                  Loading attendance sheets...
                </Text>
              </View>
            ) : (
              <View className="flex-1">
                {filteredSheets.length === 0 ? (
                  renderEmptyState()
                ) : (
                  <FlatList
                    data={filteredSheets}
                    renderItem={({ item }) => <RenderAttendanceSheetCard sheet={item} isArchived={true} />}
                    keyExtractor={(item) => item.att_id.toString()}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#00a8f0']}
                      />
                    }
                    contentContainerStyle={{ 
                      paddingBottom: 16,
                      paddingTop: 16
                    }}
                  />
                )}
              </View>
            )}
          </TabsContent>
        </Tabs>

        {/* Upload Modal */}
        <Modal
          visible={uploadModalVisible}
          onRequestClose={() => setUploadModalVisible(false)}
          animationType="slide"
        >
          <View className="flex-1 bg-white p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-[#2a3a61]">Upload Attendance Sheets</Text>
              <TouchableOpacity 
                onPress={() => setUploadModalVisible(false)}
                className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
              >
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
              className="absolute top-10 right-4 z-10 w-10 h-10 rounded-full bg-black/50 items-center justify-center"
              onPress={() => setZoomModalVisible(false)}
            >
              <MaterialIcons name="close" size={24} color="white" />
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
      </View>
    </PageLayout>
  );
};

export default AttendanceSheets;