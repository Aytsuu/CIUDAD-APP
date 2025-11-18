import { Text, View, TouchableOpacity, FlatList, Modal, Image, Pressable, RefreshControl } from "react-native";
import PageLayout from "@/screens/_PageLayout";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import { X } from "@/lib/icons/X";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Paperclip, Eye, Plus, AlertTriangle, Info } from "lucide-react-native";
import { formatDate } from "@/helpers/dateHelpers";
import { formatTime } from "@/helpers/timeFormatter";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { useLocalSearchParams } from "expo-router";
import { useGetScheduleList } from "./queries/summon-relatedFetchQueries";
import { LoadingState } from "@/components/ui/loading-state";
import { useGetSummonCaseDetails } from "@/screens/summon/queries/summonFetchQueries";

export default function HearingHistory() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const sc_id = params.sc_id as string
  const status = params.status as string
  const [viewImagesModalVisible, setViewImagesModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<{url: string, name: string}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const {data: hearingSchedules = [], isLoading: isSchedulesLoading, refetch} = useGetScheduleList(sc_id)
  const {data: caseDetails, isLoading: isDetailsLoading} = useGetSummonCaseDetails(sc_id)
  const isClosed = status.toLowerCase() == "escalated" || status.toLowerCase() == "resolved"
  
  // Check if case is in final mediation (3rd mediation proceedings)
  const isFinalMediation = hearingSchedules.some(
    schedule => schedule.hs_level === "3rd MEDIATION"
  );

  // Check if case is in final conciliation (3rd conciliation proceedings)
  const isFinalConciliation = hearingSchedules.some(
    schedule => schedule.hs_level === "3rd Conciliation Proceedings"
  );

  // Check if there's an open schedule
  const hasOpenSchedule = hearingSchedules.some((schedule: any) => !schedule.hs_is_closed);

  // Check if case has reached 3rd MEDIATION with specific statuses
  const isThirdMediationWithActiveStatus = isFinalMediation && 
    (caseDetails?.sc_mediation_status?.toLowerCase() === "waiting for schedule" || 
     caseDetails?.sc_mediation_status?.toLowerCase() === "ongoing");

  const isThirdConciliationWithActiveStatus = isFinalConciliation && 
    (caseDetails?.sc_conciliation_status?.toLowerCase() === "waiting for schedule" || 
     caseDetails?.sc_conciliation_status?.toLowerCase() === "ongoing");

  // Determine case handler
  const isHandledByLupon = caseDetails?.sc_conciliation_status !== null && 
                          caseDetails?.sc_conciliation_status !== undefined && 
                          caseDetails?.sc_conciliation_status !== "";
  const isHandledByBarangayCouncil = !isHandledByLupon;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAddSchedule = () => {
    if (hasOpenSchedule || isThirdMediationWithActiveStatus || isThirdConciliationWithActiveStatus) return; // Don't navigate if there's an open schedule or 3rd mediation with active status
    
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

  const handleInfoPress = () => {
    setInfoModalVisible(true);
  };

  // Render Schedule Card Component
  const RenderScheduleCard = ({ item }: { item: any }) => {
    const isFinalMediationSchedule = item.hs_level === "3rd MEDIATION";
    const isFinalConciliationSchedule = item.hs_level === "3rd Conciliation Proceedings";
    
    return (
      <Card className="border-2 border-gray-200 shadow-sm bg-white mb-3">
        <CardContent className="p-4">
          {/* Header with Hearing Level and Status */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex flex-row items-center gap-3">
              <Text className="text-md font-bold text-gray-900">
                {item.hs_level}
              </Text>
            
              <View className={`px-2 py-1 rounded-full ${
                item.hs_is_closed
                  ? "bg-orange-100 border border-orange-200"
                  : "bg-green-100 border border-green-200"
              }`}> 
                <Text className={`text-xs font-medium ${
                  item.hs_is_closed ? "text-orange-700" : "text-green-700"
                }`}>
                  {item.hs_is_closed ? "Closed" : "Open"}
                </Text>
              </View>
            </View>
          </View>

          {/* Hearing Date and Time */}
          <View className="space-y-3 mb-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-medium text-gray-600">Hearing Date & Time</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {item.summon_date?.sd_date ? formatDate(item.summon_date.sd_date, "long") : "Not scheduled"},  
                {item.summon_time?.st_start_time ? ` ${formatTime(item.summon_time.st_start_time)}` : ""}
              </Text>
            </View>
          </View>

          {/* Remarks Section */}
          <View className="border-t border-gray-100 pt-3">
            {item.remark && item.remark.rem_id ? (
              <View className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <View className="mb-2">
                  <Text className="text-sm font-semibold text-blue-800 mb-1">
                    Remarks
                  </Text>
                  <Text className="text-xs text-blue-600 italic">
                    by{item.remark.staff_name ? ` ${item.remark.staff_name}` : ' Unknown'}, 
                    {item.remark.rem_date ? ` on ${formatTimestamp(item.remark.rem_date)}` : ''}
                  </Text>
                </View>
                <Text className="text-sm text-gray-700 mb-2">
                  {item.remark.rem_remarks}
                </Text>
                {item.remark.supp_docs && item.remark.supp_docs.length > 0 && (
                  <View className="mt-2">
                    <TouchableOpacity 
                      onPress={() => handleViewImages(item.remark.supp_docs)}
                      className="flex-row items-center justify-between bg-white border border-blue-200 rounded-lg p-3"
                    >
                      <View className="flex-row items-center">
                        <Paperclip size={16} color="#3b82f6" />
                        <Text className="text-blue-700 text-sm font-semibold ml-2">
                          View Attached Files ({item.remark.supp_docs.length})
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
    );
  };

  // Empty state component
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-6">
      <Calendar size={48} className="text-gray-300 mb-4" />
      <Text className="text-gray-500 text-center text-md font-medium mb-2">
        No Hearing Schedules
      </Text>
      <Text className="text-gray-400 text-center text-sm">
        No hearing schedules have been created for this case yet.
      </Text>
    </View>
  );

  // Loading state component
  const renderLoadingState = () => (
    <View className="flex-1 justify-center items-center bg-gray-50">
      <LoadingState/>
    </View>
  );

  if(isSchedulesLoading || isDetailsLoading){
    return renderLoadingState();
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
          <TouchableOpacity onPress={handleInfoPress} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <Info size={20} className="text-gray-700" />
          </TouchableOpacity>
        }          
      >
        <View className="flex-1 bg-gray-50">
          {/* Final Mediation Banner */}
          {isFinalMediation && (caseDetails?.sc_mediation_status?.toLowerCase() == "waiting for schedule" || caseDetails?.sc_mediation_status?.toLowerCase() =='ongoing')&& (
            <View className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <View className="flex-row items-start space-x-3 gap-3">
                <AlertTriangle size={20} className="text-amber-600 mt-0.5" />
                <View className="flex-1">
                  <Text className="text-amber-800 font-bold text-sm mb-1">
                    3rd Mediation Reached
                  </Text>
                  <Text className="text-amber-700 text-xs leading-4">
                    Your case has reached the final mediation level. Please wait for the barangay staff's decision to either resolve the case or forward it to Lupon Tagapamayapa before any new hearing schedules can be set.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Final Conciliation Banner */}
          {isFinalConciliation && (caseDetails?.sc_conciliation_status?.toLowerCase() == "waiting for schedule" || caseDetails?.sc_conciliation_status?.toLowerCase() =='ongoing') &&(
            <View className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
              <View className="flex-row items-start space-x-3 gap-3">
                <AlertTriangle size={20} className="text-red-600 mt-0.5" />
                <View className="flex-1">
                  <Text className="text-red-800 font-bold text-sm mb-1">
                    3rd Conciliation Proceedings Reached
                  </Text>
                  <Text className="text-red-700 text-xs leading-4">
                    Your case has reached the final conciliation level. Please wait for the barangay staff's decision to either resolve the case or escalate it for further legal action.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Content Area */}
          <View className="flex-1 px-6">
            {hearingSchedules.length === 0 ? (
              renderEmptyState()
            ) : (
              <FlatList
                data={hearingSchedules}
                renderItem={({ item }) => <RenderScheduleCard item={item} />}
                keyExtractor={(item, index) => item.hs_id?.toString() || index.toString()}
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
        </View>
      </PageLayout>

      {/* Floating Add Button - Always visible but conditionally disabled */}
      <TouchableOpacity onPress={handleAddSchedule}
        disabled={hasOpenSchedule || isClosed || hearingSchedules.length === 6 || isThirdMediationWithActiveStatus || isThirdConciliationWithActiveStatus}
        className={`absolute bottom-6 right-6 w-16 h-16 rounded-full items-center justify-center shadow-lg z-50 ${
          hasOpenSchedule || isClosed || hearingSchedules.length === 6 || isThirdMediationWithActiveStatus || isThirdConciliationWithActiveStatus ? "bg-gray-400" : "bg-blue-600"
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

      {/* Info Modal */}
      <Modal
        visible={infoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="bg-white rounded-2xl w-full max-w-md">
            {/* Header */}
            <View className="bg-blue-600 px-6 py-4 rounded-t-2xl">
              <View className="flex-row items-center space-x-3 gap-3">
                <Info size={24} color="white" />
                <Text className="text-white font-bold text-lg">Case Information</Text>
              </View>
            </View>

            {/* Content */}
            <View className="p-6 space-y-4">
              {/* Case Handler Information */}
              <View>
                <Text className="text-gray-800 font-semibold text-md mb-2">
                  {isHandledByBarangayCouncil ? "Barangay Council" : "Lupon Tagapamayapa"}
                </Text>
                <Text className="text-gray-600 text-sm leading-5">
                  {isHandledByBarangayCouncil 
                    ? "Your case is currently being handled by the Barangay Council. They will facilitate the mediation process to help resolve the dispute amicably."
                    : "Your case has been forwarded to Lupon Tagapamayapa for conciliation proceedings. The Lupon will assist in reaching a settlement between parties."
                  }
                </Text>
              </View>
            </View>

            {/* Close Button */}
            <View className="px-6 pb-6">
              <TouchableOpacity 
                onPress={() => setInfoModalVisible(false)}
                className="bg-blue-600 rounded-lg py-3 px-4 active:bg-blue-700"
              >
                <Text className="text-white text-center font-semibold text-md">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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