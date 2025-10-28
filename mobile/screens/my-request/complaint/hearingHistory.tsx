import { Text, View, TouchableOpacity, ScrollView, Modal, Image, Pressable } from "react-native";
import PageLayout from "@/screens/_PageLayout";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import { X } from "@/lib/icons/X";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Paperclip, Eye, Plus } from "lucide-react-native";
import { formatDate } from "@/helpers/dateHelpers";
import { formatTime } from "@/helpers/timeFormatter";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { useLocalSearchParams } from "expo-router";
import { useGetScheduleList } from "./queries/summon-relatedFetchQueries";
import { LoadingState } from "@/components/ui/loading-state";

export default function HearingHistory() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const sc_id = params.sc_id as string
  const status = params.status as string
  const [viewImagesModalVisible, setViewImagesModalVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<{url: string, name: string}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const {data: hearingSchedules = [], isLoading} = useGetScheduleList(sc_id)
  const isClosed = status.toLowerCase() == "escalated" || status.toLowerCase() == "resolved"
  // Check if there's an open schedule
  const hasOpenSchedule = hearingSchedules.some((schedule: any) => !schedule.hs_is_closed);

  const handleAddSchedule = () => {
    if (hasOpenSchedule) return; // Don't navigate if there's an open schedule
    
    router.push({
      pathname: '/(my-request)/complaint-tracking/schedule',
      params: {
        sc_id: sc_id
      }
    });
  };

  const handleViewImages = (files: any[], index = 0) => {
    const images = files.map(file => ({
      url: file.url || file.rsd_url,
      name: file.name || file.rsd_name
    }));
    setSelectedImages(images);
    setCurrentIndex(index);
    setViewImagesModalVisible(true);
  };

  if(isLoading){
    return(
      <View className="flex-1 justify-center items-center bg-gray-50">
        <LoadingState/>
      </View>
    )
  }

  return (
    <View className="flex-1">
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Hearing Schedules</Text>}
        rightAction={
          <Text className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"> </Text>
        }          
      >
        <View className="flex-1 bg-gray-50">
          {/* Empty State */}
          {hearingSchedules.length === 0 && (
            <View className="flex-1 justify-center items-center p-6">
              <Calendar size={48} className="text-gray-300 mb-4" />
              <Text className="text-gray-500 text-center text-md font-medium mb-2">
                No Hearing Schedules
              </Text>
              <Text className="text-gray-400 text-center text-sm">
                No hearing schedules have been created for this case yet.
              </Text>
            </View>
          )}

          {/* Schedules List */}
          {hearingSchedules.length > 0 && (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="p-6">
                {hearingSchedules.map((schedule: any, index: number) => (
                  <Card key={schedule.hs_id || index} className="border-2 border-gray-200 shadow-sm bg-white mb-3">
                    <CardContent className="p-4">
                      {/* Header with Hearing Level and Status */}
                      <View className="flex-row justify-between items-start mb-3">
                        <View className="flex flex-row items-center gap-3">
                          <Text className="text-md font-bold text-gray-900">
                            {schedule.hs_level}
                          </Text>
                          <View className={`px-2 py-1 rounded-full ${
                            schedule.hs_is_closed
                              ? "bg-orange-100 border border-orange-200"
                              : "bg-green-100 border border-green-200"
                          }`}> 
                            <Text className={`text-xs font-medium ${
                              schedule.hs_is_closed ? "text-orange-700" : "text-green-700"
                            }`}>
                              {schedule.hs_is_closed ? "Closed" : "Open"}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Hearing Date and Time */}
                      <View className="space-y-2 mb-3">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-sm font-medium text-gray-600">Hearing Date & Time</Text>
                          <Text className="text-sm font-semibold text-gray-900">
                            {schedule.summon_date?.sd_date ? formatDate(schedule.summon_date.sd_date, "long") : "Not scheduled"},  
                            {schedule.summon_time?.st_start_time ? ` ${formatTime(schedule.summon_time.st_start_time)}` : ""}
                          </Text>
                        </View>
                      </View>

                      {/* Remarks Section */}
                      <View className="border-t border-gray-100 pt-3">
                        {schedule.remark && schedule.remark.rem_id ? (
                          <View className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <View className="mb-2">
                              <Text className="text-sm font-semibold text-blue-800 mb-1">
                                Remarks
                              </Text>
                              <Text className="text-xs text-blue-600 italic">
                                by{schedule.remark.staff_name ? ` ${schedule.remark.staff_name}` : ' Unknown'}, 
                                {schedule.remark.rem_date ? ` on ${formatTimestamp(schedule.remark.rem_date)}` : ''}
                              </Text>
                            </View>
                            <Text className="text-sm text-gray-700 mb-2">
                              {schedule.remark.rem_remarks}
                            </Text>
                            {schedule.remark.supp_docs && schedule.remark.supp_docs.length > 0 && (
                              <View className="mt-2">
                                <TouchableOpacity 
                                  onPress={() => handleViewImages(schedule.remark.supp_docs)}
                                  className="flex-row items-center justify-between bg-white border border-blue-200 rounded-lg p-3"
                                >
                                  <View className="flex-row items-center">
                                    <Paperclip size={16} color="#3b82f6" />
                                    <Text className="text-blue-700 text-sm font-semibold ml-2">
                                      View Attached Files ({schedule.remark.supp_docs.length})
                                    </Text>
                                  </View>
                                  <Eye size={16} color="#3b82f6" />
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        ) : (
                          <View className="bg-red-50 rounded-lg p-3 border border-red-200">
                            <View className="flex-row items-center space-x-2">
                              <Text className="text-sm font-semibold text-red-800">
                                No Remarks Available
                              </Text>
                            </View>
                            <Text className="text-xs text-red-600 mt-1">
                              Awaiting barangay staff remarks
                            </Text>
                          </View>
                        )}
                      </View>
                    </CardContent>
                  </Card>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </PageLayout>

      {/* Floating Add Button - Always visible but conditionally disabled */}
      <TouchableOpacity onPress={handleAddSchedule}
        disabled={hasOpenSchedule || isClosed || hearingSchedules.length === 6}
        className={`absolute bottom-6 right-6 w-16 h-16 rounded-full items-center justify-center shadow-lg z-50 ${
          hasOpenSchedule || isClosed || hearingSchedules.length === 6 ? "bg-gray-400" : "bg-blue-600"
        }`}
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>

      {/* Image Viewer Modal */}
      <Modal
        visible={viewImagesModalVisible}
        transparent={true}
        onRequestClose={() => setViewImagesModalVisible(false)}
      >
        <View className="flex-1 bg-black/90">
          {/* Header with close button and file name */}
          <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4 flex-row justify-between items-center">
            <Text className="text-white text-lg font-medium w-[90%]">
              {selectedImages[currentIndex]?.name || 'Document'}
            </Text>
            <TouchableOpacity onPress={() => setViewImagesModalVisible(false)}>
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Main Image */}
          <Pressable 
            className="flex-1 justify-center items-center"
            onPress={() => setViewImagesModalVisible(false)}
          >
            <Image
              source={{ uri: selectedImages[currentIndex]?.url }}
              className="w-full h-full"
              resizeMode="contain"
            />
          </Pressable>

          {/* Pagination indicators */}
          {selectedImages.length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 items-center">
              <View className="flex-row bg-black/50 rounded-full px-3 py-1">
                {selectedImages.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setCurrentIndex(index)}
                    className="p-1"
                  >
                    <View className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-500'}`} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Navigation arrows */}
          {selectedImages.length > 1 && (
            <>
              {currentIndex > 0 && (
                <TouchableOpacity
                  className="absolute left-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
                  onPress={() => setCurrentIndex(prev => prev - 1)}
                >
                  <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
              )}
              {currentIndex < selectedImages.length - 1 && (
                <TouchableOpacity
                  className="absolute right-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
                  onPress={() => setCurrentIndex(prev => prev + 1)}
                >
                  <ChevronRight size={24} color="white" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}