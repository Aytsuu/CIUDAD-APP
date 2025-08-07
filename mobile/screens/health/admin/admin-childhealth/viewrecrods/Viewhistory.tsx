import React, { useMemo, useState, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView 
} from "react-native";
import { ChevronLeft, ChevronRight, History, Baby } from "lucide-react-native";
import { useChildHealthHistory } from "../forms/queries/fetchQueries";
import { ChildHealthHistoryRecord } from "./types";
import { getSupplementStatusesFields } from "./config";
import { PatientSummarySection } from "./currenthistory";

interface Props {
  route: {
    params: {
      chrecId: string;
      chhistId: string;
    };
  };
  navigation: any;
}

export default function ChildHealthHistoryDetail({ route, navigation }: Props) {
  // Navigation and routing
  const { chrecId, chhistId } = route.params || {};
  console.log('ChildHealthHistoryDetail: Received params:', { chrecId, chhistId });

  // State management
  const [fullHistoryData, setFullHistoryData] = useState<
    ChildHealthHistoryRecord[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(2);
  const [activeTab, setActiveTab] = useState("current"); // 'current' or 'history'

  const supplementStatusesFields = useMemo(
    () => getSupplementStatusesFields(fullHistoryData),
    [fullHistoryData]
  );

  const { 
    data: historyData, 
    isLoading, 
  } = useChildHealthHistory(chrecId);

  useEffect(() => {
    console.log('ChildHealthHistoryDetail: historyData:', historyData);
    if (historyData) {
      const sortedHistory = (historyData[0]?.child_health_histories || [])
        .sort((a: ChildHealthHistoryRecord, b: ChildHealthHistoryRecord) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      
      setFullHistoryData(sortedHistory);
      console.log('ChildHealthHistoryDetail: sortedHistory:', sortedHistory);

      // Set initial index to the selected record
      const initialIndex = sortedHistory.findIndex(
        (record: ChildHealthHistoryRecord) => record.chhist_id === chhistId
      );
      setCurrentIndex(initialIndex !== -1 ? initialIndex : 0);
    }
  }, [historyData, chhistId]);

    const recordsToDisplay = useMemo(() => {
    if (fullHistoryData.length === 0) return [];
    const records = fullHistoryData.slice(currentIndex, currentIndex + recordsPerPage);
    console.log('ChildHealthHistoryDetail: recordsToDisplay:', records);
    return records;
  }, [fullHistoryData, currentIndex, recordsPerPage]);

  // Navigation handlers
  const handleSwipeLeft = () => {
    if (currentIndex < fullHistoryData.length - recordsPerPage) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Set default value for recordsPerPage
  useEffect(() => {
    setRecordsPerPage(3);
  }, []);

  // Loading component
  const LoadingComponent = () => (
    <View className="flex-1 justify-center items-center p-6">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="text-gray-500 mt-4">Loading health history...</Text>
    </View>
  );

  // Tab button component
  const TabButton = ({ value, label, icon, isActive, onPress }: any) => (
    <TouchableOpacity
      className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg ${
        isActive ? 'bg-blue-100' : 'bg-gray-100'
      }`}
      onPress={() => onPress(value)}
    >
      {icon}
      <Text className={`font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Pagination controls component
  const PaginationControls = ({ showRecordCount = true }: { showRecordCount?: boolean }) => (
    <View className="flex-col gap-4">
      {showRecordCount && (
        <Text className="text-sm text-gray-500 font-medium text-center">
          Showing records {currentIndex + 1}-
          {Math.min(currentIndex + recordsPerPage, fullHistoryData.length)}{" "}
          of {fullHistoryData.length}
        </Text>
      )}
      <View className="flex-row justify-center gap-2">
        <TouchableOpacity
          className={`p-3 rounded-lg border border-gray-300 ${
            currentIndex === 0 ? 'opacity-50' : 'bg-white'
          }`}
          onPress={handleSwipeRight}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={16} color={currentIndex === 0 ? "#9CA3AF" : "#374151"} />
        </TouchableOpacity>
        <TouchableOpacity
          className={`p-3 rounded-lg border border-gray-300 ${
            currentIndex >= fullHistoryData.length - recordsPerPage ? 'opacity-50' : 'bg-white'
          }`}
          onPress={handleSwipeLeft}
          disabled={currentIndex >= fullHistoryData.length - recordsPerPage}
        >
          <ChevronRight size={16} color={
            currentIndex >= fullHistoryData.length - recordsPerPage ? "#9CA3AF" : "#374151"
          } />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <LoadingComponent />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 mt-10">
        {/* Header Section */}
        <View className="px-6 pt-4">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              className=" rounded-lg mr-4"
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft size={20} color="#374151" />
            </TouchableOpacity>
            <View className="flex-1 ">
              <Text className="font-semibold text-xl text-gray-800">
                Child Health History Records
              </Text>
              <Text className="text-sm text-gray-600">
                View and compare child's health history
              </Text>
            </View>
          </View>
          
          <View className="h-px bg-gray-200 mb-6" />
        </View>

        {/* Main Content */}
        <View className="px-6">
          {/* Tab Navigation */}
          <View className="flex-row gap-2 mb-6">
            <TabButton
              value="current"
              label="Current Record"
              icon={<Baby size={16} color={activeTab === "current" ? "#2563EB" : "#6B7280"} />}
              isActive={activeTab === "current"}
              onPress={setActiveTab}
            />
            <TabButton
              value="history"
              label="View History"
              icon={<History size={16} color={activeTab === "history" ? "#2563EB" : "#6B7280"} />}
              isActive={activeTab === "history"}
              onPress={setActiveTab}
            />
          </View>

          {/* Tab Content */}
          {activeTab === "current" && (
            <PatientSummarySection
              recordsToDisplay={[fullHistoryData[currentIndex]]}
              fullHistoryData={fullHistoryData}
              chhistId={chhistId}
            />
          )}

          {activeTab === "history" && (
            <>
              {recordsToDisplay.length === 0 ? (
                <View className="p-6 items-center">
                  <Text className="text-gray-600 text-center">
                    No health history found for this child.
                  </Text>
                </View>
              ) : (
                <View className="border border-gray-200 rounded-lg bg-white">
                  <View className="p-6">
                    {/* Pagination Controls with Record Count */}
                    <PaginationControls />

                    {/* Divider */}
                    <View className="h-px bg-gray-200 my-6" />

                    {/* Accordion Sections */}
                    <View className="space-y-4">
                      {/* <HealthHistoryAccordions
                        recordsToDisplay={recordsToDisplay}
                        chhistId={chhistId}
                        supplementStatusesFields={supplementStatusesFields}
                      /> */}
                    </View>

                    {/* Bottom Pagination Controls (mobile-friendly) */}
                    <View className="mt-6 pt-4">
                      <PaginationControls showRecordCount={false} />
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}