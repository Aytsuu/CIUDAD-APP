import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  RefreshControl
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Trash, Archive, ArchiveRestore, Edit, X, Loader2, ChevronLeft } from "lucide-react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useGetAttendanceSheets,
  useArchiveAttendanceSheet,
  useRestoreAttendanceSheet,
  useDeleteAttendanceSheet,
  useGetAttendees,
  useAddAttendee,
  useUpdateAttendee,
  useAddAttendanceSheet,
  Attendee
} from "../ce-events/queries";
import { useLocalSearchParams } from "expo-router";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToastContext } from "@/components/ui/toast";
import ScreenLayout from "@/screens/_ScreenLayout";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { Button } from "@/components/ui/button";
import MultiImageUploader, { MediaFileType } from "@/components/ui/multi-media-upload";
import { useRouter } from "expo-router";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const MarkAttendeesSchema = z.object({
  attendees: z.array(z.string()),
});


const MarkAttendance = ({ ceId }: { ceId: number }) => {
  const { data: allAttendees = [], isLoading, error, refetch } = useGetAttendees(ceId);
  const addAttendee = useAddAttendee();
  const updateAttendee = useUpdateAttendee();
  const { toast } = useToastContext();
const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }
  const eventAttendees = useMemo(() => {
    return allAttendees.filter(attendee => attendee.ce_id === ceId);
  }, [allAttendees, ceId]);

  const form = useForm<z.infer<typeof MarkAttendeesSchema>>({
    resolver: zodResolver(MarkAttendeesSchema),
    defaultValues: {
      attendees: [],
    },
  });

  useEffect(() => {
    if (isLoading || !eventAttendees) return;
    if (eventAttendees.length > 0) {
      const presentAttendees = eventAttendees
        .filter((attendee: Attendee) => attendee.atn_present_or_absent === 'Present')
        .map((attendee: Attendee) => attendee.atn_name);
      form.reset({ attendees: presentAttendees });
      console.log('Initial form attendees set to:', presentAttendees);
    }
  }, [eventAttendees, form, isLoading]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allAttendeeNames = eventAttendees.map((attendee: Attendee) => attendee.atn_name);
      form.setValue('attendees', allAttendeeNames);
    } else {
      form.setValue('attendees', []);
    }
  };

  const selectedAttendees = form.watch('attendees') ?? [];
  const isAllSelected = selectedAttendees.length === eventAttendees.length && eventAttendees.length > 0;

  const onSubmit = async (values: z.infer<typeof MarkAttendeesSchema>) => {
    try {
      console.log('Form submitted with values:', values);
      const mutationPromises = eventAttendees.map(async (attendee: Attendee) => {
        const isPresent = values.attendees.includes(attendee.atn_name);
        const status = isPresent ? 'Present' : 'Absent';
        if (attendee.atn_id) {
          return updateAttendee.mutateAsync({
            atn_id: attendee.atn_id,
            attendeeInfo: { atn_present_or_absent: status },
          });
        } else {
          return addAttendee.mutateAsync({
            atn_name: attendee.atn_name,
            atn_designation: attendee.atn_designation || 'No Designation',
            atn_present_or_absent: status,
            ce_id: ceId,
            staff_id: attendee.staff_id || null,
          });
        }
      });
      await Promise.all(mutationPromises);
      toast.success('Attendees updated successfully');
    } catch (err) {
      console.error('Error saving attendance:', err);
      toast.error('Failed to save attendance');
    }
  };

  if (ceId === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500 text-lg font-medium">Error: Invalid meeting ID</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Loader2 size={24} color="#07143F" className="animate-spin" />
        <Text className="text-gray-500 text-lg font-medium mt-4">Loading attendees...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500 text-lg font-medium">Error: {error.message || 'Failed to load attendees'}</Text>
      </View>
    );
  }

  return (
    <FormProvider {...form}>
      <View className="flex-1 bg-white p-4">
        <Text className="text-lg font-bold text-gray-800 mb-4">
          Mark Attendance for Meeting
        </Text>
        <Text className="text-sm text-gray-600 mb-4">Attendees count: {eventAttendees.length}</Text>
        {eventAttendees.length > 0 ? (
          <View>
            <View className="flex-row items-center mb-4 p-2 h-10 bg-gray-50 rounded">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                accessibilityLabel="Select all attendees"
                disabled={!true}
                className="h-5 w-5"
              />
              <Text className="ml-3 text-base font-medium text-gray-900">Select All</Text>
            </View>
            <ScrollView style={{ maxHeight: 500, minHeight: 500 }} showsVerticalScrollIndicator={true} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
              <View className="space-y-3">
                {eventAttendees.map((attendee: Attendee, index) => {
                  const isSelected = selectedAttendees.includes(attendee.atn_name);
                  return (
                    <View key={attendee.atn_id || index} className="flex-row items-center p-3 bg-gray-50 rounded border border-gray-200">
                      <MaterialIcons name="person" size={20} color="#4b5563" />
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...selectedAttendees, attendee.atn_name]
                            : selectedAttendees.filter((name: string) => name !== attendee.atn_name);
                          form.setValue('attendees', newValue);
                          console.log(`Checkbox ${attendee.atn_name} updated, new value:`, newValue);
                        }}
                        accessibilityLabel={`Mark ${attendee.atn_name} as ${isSelected ? 'absent' : 'present'}`}
                        disabled={!true}
                        className="h-5 w-5 ml-2"
                      />
                      <View className="ml-3 flex-1">
                        <Text className="text-base font-medium text-gray-900">{attendee.atn_name}</Text>
                        {attendee.atn_designation && (
                          <Text className="text-sm text-gray-500 mt-1">{attendee.atn_designation}</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
            <View className="flex-row justify-end">
              <ConfirmationModal
                trigger={
                  // <TouchableOpacity
                  //   className="bg-blue-500 rounded-lg items-center justify-center h-10 w-20"
                  //   disabled={addAttendee.isPending || updateAttendee.isPending}
                  //   accessibilityLabel="Save attendance"
                  //   accessibilityRole="button"
                  // >
                  //   <Text className="text-white text-lg font-medium">Save</Text>
                  //   {(addAttendee.isPending || updateAttendee.isPending) && (
                  //     <Loader2 size={16} color="white" className="ml-2 animate-spin" />
                  //   )}
                  // </TouchableOpacity>
                  <Button className='bg-blue-600'><Text className="text-white font-medium">Save</Text></Button>
                }
                title="Confirm Save Attendance"
                description="Are you sure you want to save these attendance changes?"
                actionLabel="Save"
                variant="default"
                onPress={form.handleSubmit(onSubmit)}
                loading={addAttendee.isPending || updateAttendee.isPending}
                loadingMessage="Saving..."
              />
            </View>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center bg-gray-50 rounded-lg p-4">
            <Text className="text-gray-500 text-lg font-medium text-center">
              No attendees found for this meeting.
            </Text>
          </View>
        )}
      </View>
    </FormProvider>
  );
};

const AttendanceSheets = () => {
  const { ceId } = useLocalSearchParams();
  const [viewMode, setViewMode] = useState<"active" | "archive">("active");
  const [modalTab, setModalTab] = useState<"view" | "mark">("view");
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  const [zoomedImage, setZoomedImage] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFileType[]>([]);
  const router = useRouter();
  const parsedCeId = Number(ceId) || 0;
  
  // Get all sheets and filter based on view mode
  const { data: allSheets = [], refetch } = useGetAttendanceSheets();
  const filteredSheets = allSheets.filter(sheet => 
    sheet.ce_id === parsedCeId && 
    sheet.att_is_archive === (viewMode === "archive")
  );

  const archiveSheet = useArchiveAttendanceSheet();
  const restoreSheet = useRestoreAttendanceSheet();
  const deleteSheet = useDeleteAttendanceSheet();
  const addAttendanceSheet = useAddAttendanceSheet();
  const { toast } = useToastContext();
  const [refreshing, setRefreshing] = useState(false)
  
    const onRefresh = async () => {
      setRefreshing(true)
      await refetch()
      setRefreshing(false)
    }

  const handleAddAttendanceSheet = async () => {
    if (mediaFiles.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }

    try {
      await Promise.all(mediaFiles.map(file => 
        addAttendanceSheet.mutateAsync({
          ce_id: parsedCeId,
          att_file_name: file.name,
          att_file_path: file.path,
          att_file_url: file.publicUrl,
          att_file_type: file.type
        })
      ));
      setUploadModalVisible(false);
      setMediaFiles([]);
      toast.success("Sheets uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload sheets");
    }
  };

  const handleZoomImage = (imageUrl: string) => {
    setZoomedImage(imageUrl);
    setZoomModalVisible(true);
  };

  const handleTabChange = (value: string) => {
    setModalTab(value as "view" | "mark");
  };

  return (
    <ScreenLayout
       customLeftAction={
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={30} color="black" className="text-black" />
          </TouchableOpacity>
        }
        headerBetweenAction={<Text className="text-[13px]">Attendance Sheets and Records</Text>}
        showExitButton={false}
        headerAlign="left"
        scrollable={true}
        keyboardAvoiding={true}
        contentPadding="medium"
    >
      <View className="flex-1">
        <Tabs value={modalTab} onValueChange={handleTabChange}>
          <TabsList className="flex-row bg-white px-4 pb-4">
            <TabsTrigger
              value="view"
              className={`flex-1 h-10 rounded-l-lg ${modalTab === "view" ? "bg-blue-600" : "bg-gray-200"} mr-1`}
            >
              <Text className={`text-sm font-medium ${modalTab === "view" ? "text-white" : "text-gray-700"}`}>
                View Sheets
              </Text>
            </TabsTrigger>
            <TabsTrigger
              value="mark"
              className={`flex-1 h-10 rounded-r-lg ${modalTab === "mark" ? "bg-blue-600" : "bg-gray-200"}`}
            >
              <Text className={`text-sm font-medium ${modalTab === "mark" ? "text-white" : "text-gray-700"}`}>
                Mark Attendance
              </Text>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="flex-1">
            <View className="px-4 pt-4 flex-row justify-between items-center">
              <Button 
                className="bg-blue-600 mb-4"
                onPress={() => setUploadModalVisible(true)}
              >
                <Text className="text-white">Upload</Text>
              </Button>
              
              <View className="flex-row border border-gray-300 rounded-full bg-gray-100 overflow-hidden h-10">
                <TouchableOpacity
                  className={`px-4 items-center justify-center ${viewMode === "active" ? "bg-white" : ""}`}
                  onPress={() => setViewMode("active")}
                >
                  <Text className="text-sm font-medium">Active</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`px-4 items-center justify-center ${viewMode === "archive" ? "bg-white" : ""}`}
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
              <ScrollView className="px-4" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
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
              </ScrollView>
            )}
          </TabsContent>

          <TabsContent value="mark" className="flex-1">
            <MarkAttendance ceId={parsedCeId} />
          </TabsContent>
        </Tabs>

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
            
            <MultiImageUploader
              mediaFiles={mediaFiles}
              setMediaFiles={setMediaFiles}
              maxFiles={10}
            />
            
            <View className="flex-row space-x-2 mt-4 gap-2">
              <Button
                className="flex-1 bg-gray-300"
                onPress={() => setUploadModalVisible(false)}
              >
                <Text className="text-gray-800">Cancel</Text>
              </Button>
              <Button
                className="flex-1 bg-blue-600"
                onPress={handleAddAttendanceSheet}
                disabled={mediaFiles.length === 0}
              >
                <Text className="text-white">Upload</Text>
              </Button>
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
                height: screenHeight * 0.8
              }}
              resizeMode="contain"
            />
          </View>
        </Modal>
      </View>
    </ScreenLayout>
  );
};

export default AttendanceSheets;