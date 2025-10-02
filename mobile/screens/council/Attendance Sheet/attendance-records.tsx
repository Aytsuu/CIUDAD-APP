import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetCouncilEvents,
  useGetAttendanceSheets,
  useGetCouncilEventYears,
} from "../ce-events/ce-att-queries";
import { SearchInput } from "@/components/ui/search-input";
import { useRouter } from "expo-router";
import { ChevronLeft, Archive } from "lucide-react-native";
import PageLayout from "@/screens/_PageLayout";
import { AttendanceRecords } from "../ce-events/ce-att-typeFile";
import { useDebounce } from "@/hooks/use-debounce";
import { SelectLayout } from "@/components/ui/select-layout";

const AttendanceRecord = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"active" | "archive">("active");
  const [refreshing, setRefreshing] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { data: availableYears = [] } = useGetCouncilEventYears();

  // Fetch council events with backend search and filtering
  const {
    data: councilEventsData,
    isLoading: isCouncilEventsLoading,
    error,
    refetch,
  } = useGetCouncilEvents(
    1,
    1000, 
    debouncedSearchTerm,
    filter,
    false
  );

  const { data: attendanceSheets = [], isLoading: isSheetsLoading } =
    useGetAttendanceSheets(activeTab === "archive");
  const isLoading = isCouncilEventsLoading || isSheetsLoading;

  // Extract events from data structure
  const councilEvents = councilEventsData?.results || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Build table data from backend filtered results
  const tableData: AttendanceRecords[] = React.useMemo(() => {
    const eventMap = new Map<number, any>();
    councilEvents.forEach((event) => {
      eventMap.set(event.ce_id, event);
    });

    const data: AttendanceRecords[] = [];

    if (activeTab === "active") {
      councilEvents.forEach((event) => {
        const nonArchivedSheets = attendanceSheets.filter(
          (sheet) => sheet.ce_id === event.ce_id && !sheet.att_is_archive
        );
        data.push({
          ceId: event.ce_id,
          attMettingTitle: event.ce_title || "Untitled Meeting",
          attMeetingDate: event.ce_date || "N/A",
          attMeetingDescription: event.ce_description || "No description",
          isArchived: false,
          sheets: nonArchivedSheets,
        });
      });
    } else {
      const archivedSheetsByEvent = new Map<number, any[]>();
      attendanceSheets
        .filter((sheet) => sheet.att_is_archive)
        .forEach((sheet) => {
          const sheets = archivedSheetsByEvent.get(sheet.ce_id) || [];
          sheets.push(sheet);
          archivedSheetsByEvent.set(sheet.ce_id, sheets);
        });

      archivedSheetsByEvent.forEach((sheets, ce_id) => {
        const event = eventMap.get(ce_id);
        if (event) {
          data.push({
            ceId: event.ce_id,
            attMettingTitle: event.ce_title || "Untitled Meeting",
            attMeetingDate: event.ce_date || "N/A",
            attMeetingDescription: event.ce_description || "No description",
            isArchived: true,
            sheets,
          });
        }
      });
    }

    return data;
  }, [councilEvents, attendanceSheets, activeTab]);

  // Create filter options
  const filterOptions = [
    { label: "All", value: "all" },
    ...availableYears.map((year) => ({
      label: year.toString(),
      value: year.toString(),
    })),
  ];

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
  };

  const handleFilterChange = (option: { label: string; value: string }) => {
    setFilter(option.value);
  };

  const handleTabChange = (tab: "active" | "archive") => {
    setActiveTab(tab);
  };

  if (error) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={30} color="black" className="text-black" />
          </TouchableOpacity>
        }
        headerTitle={<Text>Attendance Records</Text>}
        rightAction={<View></View>}
      >
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-lg font-semibold text-gray-700 mb-2 text-center">
            Failed to Load Records
          </Text>
          <Text className="text-base text-gray-500 text-center mb-6">
            {error.message ||
              "Unable to load attendance records. Please try again."}
          </Text>
          <TouchableOpacity
            className="bg-primaryBlue px-6 py-3 rounded-lg"
            onPress={() => refetch()}
          >
            <Text className="text-white text-base font-semibold">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" className="text-black" />
        </TouchableOpacity>
      }
      headerTitle={<Text>Attendance Records</Text>}
      rightAction={<View></View>}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search and Filter Section */}
        <View className="px-4 mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="flex-1">
              <SearchInput
                value={searchTerm}
                onChange={handleSearchChange}
                onSubmit={() => {}}
              />
            </View>
          </View>
        </View>

        {/* Active/Archive Tabs */}
        <View className="flex-col gap-2 justify-between mb-4 px-4">
          <View className="flex-row gap-2">
            <View className="flex-1">
              <SelectLayout
                options={filterOptions}
                selectedValue={filter}
                onSelect={handleFilterChange}
                placeholder="Filter by year"
                maxHeight={200}
              />
            </View>
          </View>
          {/* <View className="flex-row justify-end rounded-xl bg-gray-100 ">
            <TouchableOpacity
              className={`px-4 py-2 ${
                activeTab === "active" ? "bg-white" : ""
              }`}
              onPress={() => handleTabChange("active")}
            >
              <Text className="text-sm font-medium">Active</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-4 py-2 flex-row items-center gap-1 ${
                activeTab === "archive" ? "bg-white" : ""
              }`}
              onPress={() => handleTabChange("archive")}
            >
              <Archive size={14} color="#6b7280" />
              <Text className="text-sm font-medium">Archive</Text>
            </TouchableOpacity>
          </View> */}
        </View>

        {/* Loading state for content only */}
        {isLoading ? (
          <View className="h-64 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-sm text-gray-500 mt-2">
              Loading attendance records...
            </Text>
          </View>
        ) : (
          <View className="px-4">
            {tableData.map((record, index) => (
              <TouchableOpacity
                key={record.ceId}
                onPress={() =>
                  router.push({
                    pathname: "/(council)/attendance/attendance-info",
                    params: {
                      ceId: record.ceId,
                      sheets: JSON.stringify(record.sheets),
                    },
                  })
                }
                accessibilityLabel={`View details for ${record.attMettingTitle}`}
                accessibilityRole="button"
                activeOpacity={0.7}
              >
                <Card
                  className={`bg-white rounded-lg p-4 border border-gray-200 ${
                    index === tableData.length - 1 ? "mb-0" : "mb-4"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <View className="flex-row items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-black flex-1 pr-2">
                        {record.attMettingTitle}
                      </CardTitle>
                    </View>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <Text className="text-sm text-black leading-5 mb-4">
                      {record.attMeetingDescription}
                    </Text>

                    <View className="border-t border-gray-200 pt-3">
                      <Text className="text-sm font-medium text-black">
                        Date of Meeting: {record.attMeetingDate}
                      </Text>
                      <Text className="text-sm font-medium text-black mt-1">
                        Sheets: {record.sheets.length}
                      </Text>
                    </View>
                  </CardContent>
                </Card>
              </TouchableOpacity>
            ))}

            {/* Empty state */}
            {tableData.length === 0 && (
              <View className="flex-1 justify-center items-center py-12">
                <Text className="text-gray-500 text-center">
                  No {activeTab} attendance records found
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </PageLayout>
  );
};

export default AttendanceRecord;
