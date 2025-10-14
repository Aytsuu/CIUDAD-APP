import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from "react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  useGetCouncilEvents,
  useGetAttendanceSheets,
  useGetCouncilEventYears,
} from "../ce-events/ce-att-queries";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import PageLayout from "@/screens/_PageLayout";
import { AttendanceRecords } from "../ce-events/ce-att-typeFile";
import { useDebounce } from "@/hooks/use-debounce";
import { SelectLayout } from "@/components/ui/select-layout";
import EmptyState from "@/components/ui/emptyState";
import { formatTableDate } from "@/helpers/dateHelpers";
import { LoadingState } from "@/components/ui/loading-state";
import { Search } from "@/lib/icons/Search";
import { SearchInput } from "@/components/ui/search-input";

const AttendanceRecord = () => {
  const router = useRouter();
  const [searchInputVal, setSearchInputVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
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
    useGetAttendanceSheets(false); // Only active sheets
  const isLoading = isCouncilEventsLoading || isSheetsLoading;

  // Extract events from data structure
  const councilEvents = councilEventsData?.results || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Build table data from backend filtered results - only active records
  const tableData: AttendanceRecords[] = React.useMemo(() => {
    const data: AttendanceRecords[] = [];

    councilEvents.forEach((event) => {
      const activeSheets = attendanceSheets.filter(
        (sheet) => sheet.ce_id === event.ce_id && !sheet.att_is_archive
      );
      data.push({
        ceId: event.ce_id,
        attMettingTitle: event.ce_title || "Untitled Meeting",
        attMeetingDate: event.ce_date || "N/A",
        attMeetingDescription: event.ce_description || "No description",
        isArchived: false,
        sheets: activeSheets,
      });
    });

    return data;
  }, [councilEvents, attendanceSheets]);

  
  const filterOptions = [
    { label: "All Years", value: "all" },
    ...availableYears.map((year) => ({
      label: year.toString(),
      value: year.toString(),
    })),
  ];

  const handleSearch = () => {
    setSearchQuery(searchInputVal);
  };

  const handleFilterChange = (option: { label: string; value: string }) => {
    setFilter(option.value);
  };

  const handleOpenAttendance = (ceId: number, sheets: any[]) => {
    router.push({
      pathname: "/(council)/attendance/attendance-info",
      params: {
        ceId: ceId,
        sheets: JSON.stringify(sheets),
      },
    });
  };

  const RenderAttendanceCard = React.memo(({ item }: { item: AttendanceRecords }) => (
    <TouchableOpacity 
      onPress={() => handleOpenAttendance(item.ceId, item.sheets)}
      activeOpacity={0.8}
      className="mb-3"
    >
      <Card className="border-2 border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="font-semibold text-lg text-[#1a2332] mb-1">
                {item.attMettingTitle}
              </Text>
              <Text className="text-sm text-gray-500">
                Date: {formatTableDate(item.attMeetingDate)}
              </Text>
            </View>
          </View>
        </CardHeader>

        <CardContent className="pt-3 border-t border-gray-200">
          <View className="space-y-3">
            <View className="pb-2">
              <Text className="text-sm text-gray-600 mb-1">Description:</Text>
              <Text className="text-base text-black" numberOfLines={2} ellipsizeMode="tail">
                {item.attMeetingDescription}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Attendance Sheets:</Text>
              <Text className="text-lg font-bold text-[#2a3a61]">
                {item.sheets.length}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Status:</Text>
              <Text className={`text-sm font-medium ${
                item.isArchived ? 'text-orange-600' : 'text-green-600'
              }`}>
                {item.isArchived ? 'Archived' : 'Active'}
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  ));

  // Empty state component
  const renderEmptyState = () => {
    const emptyMessage = searchQuery
      ? 'No records found. Try adjusting your search terms.'
      : 'No attendance records available yet.';
    
    return (
      <View className="flex-1 justify-center items-center py-8">
        <EmptyState emptyMessage={emptyMessage} />
      </View>
    );
  };

  // Loading state component
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <LoadingState/>
    </View>
  );

  if (error) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Attendance Records</Text>}
        rightAction={
          <TouchableOpacity 
            onPress={() => setShowSearch(!showSearch)} 
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <Search size={22} className="text-gray-700" />
          </TouchableOpacity>
        }
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
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Attendance Records</Text>}
      rightAction={
        <TouchableOpacity 
          onPress={() => setShowSearch(!showSearch)} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Search size={22} className="text-gray-700" />
        </TouchableOpacity>
      }
      wrapScroll={false}
    >
      <View className="flex-1 bg-white">
        {/* Search Bar */}
        {showSearch && (
          <SearchInput 
            value={searchInputVal}
            onChange={setSearchInputVal}
            onSubmit={handleSearch} 
          />
        )}

        <View className="flex-1 px-6">
          {/* Filter Section */}
          <View className="py-3">
            <SelectLayout
              options={filterOptions}
              className="h-8"
              selectedValue={filter}
              onSelect={handleFilterChange}
              placeholder="Filter by year"
              isInModal={false}
            />
          </View>

          {/* Content Section */}
          <View className="flex-1">
            {isLoading ? (
              renderLoadingState()
            ) : (
              <View className="flex-1">
                {tableData.length === 0 ? (
                  renderEmptyState()
                ) : (
                  <FlatList
                    data={tableData}
                    renderItem={({ item }) => <RenderAttendanceCard item={item} />}
                    keyExtractor={(item) => item.ceId.toString()}
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
          </View>
        </View>
      </View>
    </PageLayout>
  );
};

export default AttendanceRecord;