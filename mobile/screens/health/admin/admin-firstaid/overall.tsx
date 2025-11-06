import React, { useState, useMemo, useCallback, useEffect } from "react";
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList } from "react-native";
import { Search, ChevronLeft, AlertCircle, User, FileText, RefreshCw } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFirstaidRecords, getFirstAidCounts } from "./restful-api/getAPI";
import { FirstAidRecord } from "./types";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { calculateAge } from "@/helpers/ageCalculator";
import { useDebounce } from "@/hooks/use-debounce";
import { PaginationControls } from "../components/pagination-layout";
import { TabBar, TabType } from "../components/tab-bar";

// type TabType = "all" | "resident" | "transient";

// Components
const StatusBadge: React.FC<{ type: string }> = ({ type }) => {
  const getTypeConfig = (type: string) => {
    switch (type.toLowerCase()) {
      case 'resident':
        return {
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
        };
      case 'transient':
        return {
          color: 'text-amber-700',
          bgColor: 'bg-amber-100',
          borderColor: 'border-amber-200',
        };
      default:
        return {
          color: 'text-gray-700',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
        };
    }
  };

  const typeConfig = getTypeConfig(type);
  return (
    <View className={`px-3 py-1 rounded-full border ${typeConfig.bgColor} ${typeConfig.borderColor}`}>
      <Text className={`text-xs font-semibold ${typeConfig.color}`}>
        {type}
      </Text>
    </View>
  );
};

// const TabBar: React.FC<{
//   activeTab: TabType;
//   setActiveTab: (tab: TabType) => void;
// }> = ({ activeTab, setActiveTab }) => (
//   <View className="flex-row justify-around bg-white p-2 border-b border-gray-200">
//     <TouchableOpacity
//       onPress={() => setActiveTab('all')}
//       className={`flex-1 items-center py-3 ${activeTab === 'all' ? 'border-b-2 border-blue-600' : ''}`}
//     >
//       <Text className={`text-sm font-medium ${activeTab === 'all' ? 'text-blue-600' : 'text-gray-600'}`}>
//         All 
//       </Text>
//     </TouchableOpacity>
//     <TouchableOpacity
//       onPress={() => setActiveTab('resident')}
//       className={`flex-1 items-center py-3 ${activeTab === 'resident' ? 'border-b-2 border-blue-600' : ''}`}
//     >
//       <Text className={`text-sm font-medium ${activeTab === 'resident' ? 'text-blue-600' : 'text-gray-600'}`}>
//         Residents
//       </Text>
//     </TouchableOpacity>
//     <TouchableOpacity
//       onPress={() => setActiveTab('transient')}
//       className={`flex-1 items-center py-3 ${activeTab === 'transient' ? 'border-b-2 border-blue-600' : ''}`}
//     >
//       <Text className={`text-sm font-medium ${activeTab === 'transient' ? 'text-blue-600' : 'text-gray-600'}`}>
//         Transients 
//       </Text>
//     </TouchableOpacity>
//   </View>
// );

const FirstAidRecordCard: React.FC<{
  record: FirstAidRecord;
  onPress: () => void;
}> = ({ record, onPress }) => {
  const formatAddress = () => {
    const address = record.patient_details.address;
    return [address.add_street, address.add_barangay, address.add_city, address.add_province]
      .filter(Boolean)
      .join(", ");
  };

  const calculatePatientAge = () => {
    return calculateAge(record.patient_details.personal_info.per_dob).toString();
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-xl border border-gray-200 mb-3 overflow-hidden shadow-sm"
      activeOpacity={0.8}
      onPress={onPress}
    >
      {/* Header */}
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-1">
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-3">
                <User color="white" size={20} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-md text-gray-900">
                  {record.patient_details.personal_info.per_lname}, {record.patient_details.personal_info.per_fname} {record.patient_details.personal_info.per_mname}
                </Text>
                <Text className="text-gray-500 text-sm">ID: {record.pat_id}</Text>
              </View>
            </View>
          </View>
          <StatusBadge type={record.patient_details.pat_type} />
        </View>
      </View>

  
    </TouchableOpacity>
  );
};

export default function AllFirstAidRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const queryClient = useQueryClient();
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);


   const queryParams = useMemo(
    () => ({
      page: currentPage,
      page_size: pageSize,
      search: debouncedSearchQuery || '',
      patient_type: activeTab !== "all" ? activeTab : 'all'
    }),
    [currentPage, pageSize, debouncedSearchQuery, activeTab]
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, activeTab]);

  // Fetch counts (separate query, refetches on search/tab change)
   const { 
    data: counts = { all: 0, resident: 0, transient: 0 }, 
    isLoading: isCountsLoading,
    refetch: refetchCounts 
  } = useQuery({
    queryKey: ["firstAidCounts", debouncedSearchQuery],
    queryFn: () => getFirstAidCounts(debouncedSearchQuery),
    staleTime: 0,
  });

  // Fetch records from backend with pagination
  const { 
    data: apiResponse, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    isFetching 
  } = useQuery({
    queryKey: ["firstAidRecords", queryParams],
    queryFn: () => getFirstaidRecords(
      queryParams.search,
      queryParams.patient_type,
      queryParams.page,
      queryParams.page_size
    ),
    staleTime: 0,
  });

  const firstAidRecords = useMemo(() => {
    return apiResponse?.results || [];
  }, [apiResponse?.results]);

   const totalCount = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNext = !!apiResponse?.next;
  const hasPrevious = !!apiResponse?.previous;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), refetchCounts()]);
    } catch (e) {
      console.error("Refetch error:", e);
    }
    setRefreshing(false);
  }, [refetch, refetchCounts]);

  const handleRecordPress = (record: FirstAidRecord) => {
    try {
      router.push({
        pathname: "/admin/first-aid/individual",
        params: { patientData: JSON.stringify(record) }
      });
    } catch (error) {
      console.log("Navigation error:", error);
    }
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  if (isLoading || isCountsLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="">First Aid Records</Text>}
      >
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <AlertCircle size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">Error loading records</Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">
            Failed to load data. Please check your connection and try again.
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            className="flex-row items-center bg-blue-600 px-6 py-3 rounded-lg"
          >
            <RefreshCw size={18} color="white" />
            <Text className="ml-2 text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

   return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">First Aid Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-gray-50">
        {/* Search Bar */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center border border-gray-200 bg-gray-50 rounded-xl">
            <Search size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-800 text-base"
              placeholder="Search..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Results Info */}
        <View className="px-4 flex-row items-center justify-between py-3 bg-white border-b border-gray-200">
          <Text className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} records
          </Text>
          <Text className="text-sm font-medium text-gray-800">
            Page {currentPage} of {totalPages}
          </Text>
        </View>

        {/* Records List */}
        {!firstAidRecords || firstAidRecords.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <FileText size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">No records found</Text>
            <Text className="text-gray-600 text-center mt-2">
              {searchQuery ? "No records match your search criteria." : "There are no first aid records available yet."}
            </Text>
          </View>
        ) : (
          <>
            <FlatList
              data={firstAidRecords}
              keyExtractor={(item) => `firstaid-${item.pat_id}`}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16 }}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={10}
              renderItem={({ item }) => (
                <FirstAidRecordCard record={item} onPress={() => handleRecordPress(item)} />
              )}
              ListFooterComponent={
                isFetching ? (
                  <View className="py-4 items-center">
                    <RefreshCw size={20} color="#3B82F6" className="animate-spin" />
                  </View>
                ) : null
              }
            />

            {/* Pagination Controls - You'll need to create this component */}
            <PaginationControls
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </>
        )}
      </View>
    </PageLayout>
  );
}