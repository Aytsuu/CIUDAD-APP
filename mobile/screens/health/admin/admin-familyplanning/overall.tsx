import React, { useState, useMemo, useEffect } from "react";
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList } from "react-native";
import { Search, ChevronLeft, AlertCircle, User, FileText, RefreshCw } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFPPatientsCounts, getFPRecordsList } from "./GetRequest";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { debounce } from "lodash";
import { TabBar, TabType } from "../components/tab-bar";
import { StatusBadge } from "../components/status-badge";

interface FPRecord {
  fprecord_id: number;
  patient_id: string;
  patient_name: string;
  patient_age: number;
  sex: string;
  client_type: string;
  subtype: string | null;
  patient_type: string;
  method_used: string;
  created_at: string;
  record_count: number;
}

interface FPPatientsCount {
  total_fp_patients: number;
  resident_fp_patients: number;
  transient_fp_patients: number;
}

const FPRecordCard: React.FC<{
  record: FPRecord;
  onPress: () => void;
}> = ({ record, onPress }) => {
  
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
                  {record.patient_name}
                </Text>
                <Text className="text-gray-500 text-sm">ID: {record.patient_id}</Text>
              </View>
            </View>
          </View>
          <StatusBadge type={record.patient_type} />
        </View>
      </View>

      {/* Details */}
      {/* <View className="p-4">
        <View className="flex-row items-center">
          <FileText size={16} color="#6B7280" />
          <Text className="ml-2 text-gray-600 text-sm">
            Client Type: <Text className="font-medium text-gray-900">{record.client_type}</Text>
          </Text>
        </View>
      </View> */}
    </TouchableOpacity>
  );
};
  
export default function OverallFpRecordsScreen() {
  const [searchQuery, setSearchQuery] = useState("");  // Raw input value (updates instantly)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");  // Debounced value for API
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

  const queryClient = useQueryClient();

  // Debounce function: Wait 500ms after typing stops before updating debouncedSearchQuery
  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setDebouncedSearchQuery(value), 500),
    []
  );

  useEffect(() => {
    debouncedSetSearch(searchQuery);
    return () => debouncedSetSearch.cancel();  // Cleanup on unmount
  }, [searchQuery, debouncedSetSearch]);

  const {
    data: fpData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery<{ count: number; next: string | null; previous: string | null; results: FPRecord[] }, Error>({
    queryKey: ["fpRecordsList", page, debouncedSearchQuery, activeTab],
    queryFn: () => getFPRecordsList({
      page,
      page_size: pageSize,
      search: debouncedSearchQuery || undefined,
      patient_type: activeTab !== "all" ? activeTab : undefined,
    }),
  });

  const {
    data: fpCounts,
    isLoading: isLoadingCounts,
    isError: isErrorCounts,
    error: errorCounts,
  } = useQuery<FPPatientsCount, Error>({
    queryKey: ["fpPatientCounts", debouncedSearchQuery],
    queryFn: () => getFPPatientsCounts({ search: debouncedSearchQuery || undefined }),
  });

  const fpRecords = fpData?.results || [];
  const totalCount = fpData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const counts = useMemo(() => {
    return {
      all: fpCounts?.total_fp_patients || 0,
      resident: fpCounts?.resident_fp_patients || 0,
      transient: fpCounts?.transient_fp_patients || 0,
    };
  }, [fpCounts]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["fpPatientCounts"] });
    } catch (e) {
      console.error("Refetch error:", e);
    }
    setRefreshing(false);
  }, [refetch, queryClient]);

  const handleRecordPress = (patientId: string) => {
    try {
      router.push({
        pathname: "/admin/familyplanning/individual",
        params: { patientId },
      });
    } catch (error) {
      console.log("Navigation error:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (isLoading || isLoadingCounts) {
    return <LoadingState />;
  }

  if (isError || isErrorCounts) {
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
        headerTitle={<Text className="">Family Planning Records</Text>}
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
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">Family Planning Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-gray-50">
        {/* Search Bar */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center p-1 border border-gray-200 bg-gray-50 rounded-xl">
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

        <View className="px-4 flex-row items-center justify-between mt-4">
                  <View className="flex-row items-center">
                    <Text className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} records
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-sm font-medium text-gray-800">
                      Page {currentPage} of {totalPages}
                    </Text>
                  </View>
                </View>

        {/* Records List */}
        {fpRecords.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <FileText size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">No records found</Text>
            <Text className="text-gray-600 text-center mt-2">
              There are no family planning records available yet.
            </Text>
          </View>
        ) : (
          <FlatList
            data={fpRecords}
            keyExtractor={(item) => `fp-${item.fprecord_id}`}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16 }}
            initialNumToRender={15}
            maxToRenderPerBatch={20}
            windowSize={21}
            renderItem={({ item }) => (
              <FPRecordCard
                record={item}
                onPress={() => handleRecordPress(item.patient_id)}
              />
            )}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center py-20">
                <FileText size={48} color="#D1D5DB" />
                <Text className="text-gray-600 text-lg font-semibold mb-2 mt-4">
                  No records in this category
                </Text>
                <Text className="text-gray-500 text-center">
                  {searchQuery
                    ? `No ${activeTab} records match your search.`
                    : `No ${activeTab} records found.`}
                </Text>
              </View>
            )}
            ListFooterComponent={() => (
  <View className="px-4 mb-4">
 
    {totalPages > 1 && (
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <View className="flex-row items-center justify-between">
            <Button
              onPress={() => handlePageChange(page - 1)}
              disabled={page === 1}
              variant={page === 1 ? "secondary" : "default"}
              className={page === 1 ? "bg-slate-200" : "bg-blue-600"}
            >
              <Text className={page === 1 ? "text-slate-400" : "text-white"}>
                Previous
              </Text>
            </Button>

            <Text className="text-slate-600 font-medium">
              Page {page} of {totalPages}
            </Text>

            <Button
              onPress={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              variant={page === totalPages ? "secondary" : "default"}
              className={page === totalPages ? "bg-slate-200" : "bg-blue-600"}
            >
              <Text className={page === totalPages ? "text-slate-400" : "text-white"}>
                Next
              </Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    )}
  </View>
)}
          />
        )}
      </View>
    </PageLayout>
  );
}