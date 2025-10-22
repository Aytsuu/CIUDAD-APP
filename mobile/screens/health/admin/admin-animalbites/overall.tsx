import React, { useState, useMemo, useCallback } from "react"
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList } from "react-native"
import { Search, ChevronLeft, AlertCircle, FileText, RefreshCw } from "lucide-react-native"
import { Text } from "@/components/ui/text"
import { router } from "expo-router"
import { useAnimalBitePatientSummary } from "./db-request/get-query"
import PageLayout from "@/screens/_PageLayout"
import { LoadingState } from "@/components/ui/loading-state"
import { useDebounce } from "@/hooks/use-debounce"
import { Overallrecordcard } from "../components/overall-cards"
import { PaginationControls } from "../components/pagination-layout"
import { TabBar, TabType } from "../components/tab-bar"

type PatientSummary = {
  id: string
  fname: string
  lname: string
  gender: string
  age: string
  date: string
  patientType: string
  exposure: string
  siteOfExposure: string
  bitingAnimal: string
  actions_taken: string
  referredby: string
  recordCount: number
}

export default function AnimalBiteOverallScreen() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const {
    data: patientSummary,
    isLoading,
    isError,
    error,
    refetch,
  } = useAnimalBitePatientSummary({
    search: debouncedSearchQuery,
    filter: activeTab === 'all' ? undefined : activeTab,
    page: currentPage,
    limit: pageSize,
    ordering: '-date',
  })

  const patients: PatientSummary[] = useMemo(() => {
    return patientSummary?.results || []
  }, [patientSummary])

  const totalCount = patientSummary?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Reset to page 1 when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, activeTab]);

  const transformedRecords = useMemo(() => {
    return patients.map(transformToOverallRecord);
  }, [patients]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (e) {
      console.error("Refetch error:", e);
    }
    setRefreshing(false);
  }, [refetch]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const handleRecordPress = (record: any) => {
    try {
      router.push({
        pathname: "/admin/animalbites/individual",
        params: { patientId: record.pat_id },
      });
    } catch (error) {
      console.log("Navigation error:", error);
    }
  };

  if (isLoading && currentPage === 1) {
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
        headerTitle={<Text className="text-gray-900 text-lg font-semibold">Animal Bite Records</Text>}
      >
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <AlertCircle size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">Error loading records</Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">
            {error?.message || 'Failed to load data. Please check your connection and try again.'}
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
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">Animal Bite Records</Text>}
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
              onChangeText={handleSearchChange}
            />
          </View>
        </View>

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} setActiveTab={handleTabChange}/>
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
        <View className="flex-1">
          <FlatList
            data={transformedRecords}
            keyExtractor={(item) => `ab-${item.pat_id}-${currentPage}`}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3B82F6']}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 16,
              flexGrow: 1,
              paddingBottom: transformedRecords.length > 0 ? 80 : 0 // Add space for pagination
            }}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center py-20">
                <FileText size={48} color="#D1D5DB" />
                <Text className="text-gray-600 text-lg font-semibold mb-2 mt-4">
                  {searchQuery || activeTab !== 'all' ? 'No records found' : 'No records available'}
                </Text>
                <Text className="text-gray-500 text-center">
                  {searchQuery
                    ? `No records match "${searchQuery}"`
                    : `No animal bite records found`}
                </Text>
              </View>
            )}
            renderItem={({ item }) => (
              <Overallrecordcard
                record={item}
                onPress={() => handleRecordPress(item)}
              />
            )}
          />

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </View>
      </View>
    </PageLayout>
  );
}

// Transform function
const transformToOverallRecord = (patient: PatientSummary) => {
  return {
    pat_id: patient.id,
    fname: patient.fname,
    lname: patient.lname,
    mname: "", // Animal bite data doesn't have middle name
    age: patient.age,
    sex: patient.gender,
    pat_type: patient.patientType,
    count: patient.recordCount,
    street: "",
    barangay: "",
    city: "",
    province: "",
    sitio: "",
    address: "",
  };
};