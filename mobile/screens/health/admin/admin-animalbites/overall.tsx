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

type TabType = "all" | "resident" | "transient"

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

const TabBar: React.FC<{
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  counts: { all: number; resident: number; transient: number };
}> = ({ activeTab, setActiveTab, counts }) => (
  <View className="flex-row justify-around bg-white p-2 border-b border-gray-200">
    <TouchableOpacity
      onPress={() => setActiveTab('all')}
      className={`flex-1 items-center py-3 ${activeTab === 'all' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'all' ? 'text-blue-600' : 'text-gray-600'}`}>
        All ({counts.all})
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('resident')}
      className={`flex-1 items-center py-3 ${activeTab === 'resident' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'resident' ? 'text-blue-600' : 'text-gray-600'}`}>
        Residents ({counts.resident})
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('transient')}
      className={`flex-1 items-center py-3 ${activeTab === 'transient' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'transient' ? 'text-blue-600' : 'text-gray-600'}`}>
        Transients ({counts.transient})
      </Text>
    </TouchableOpacity>
  </View>
);


export default function AnimalBiteOverallScreen() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { 
    data: patientSummary, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    isFetching,
  } = useAnimalBitePatientSummary({
    search: debouncedSearchQuery,
    filter: activeTab === 'all' ? undefined : activeTab,
    page: currentPage,
    limit: 20, // Set your desired page size
    ordering: '-date', // Optional: sort by most recent
  })

  // Extract patients from the response
  const patients: PatientSummary[] = useMemo(() => {
    if (!patientSummary?.results) return []
    return patientSummary.results
  }, [patientSummary])

  // Reset pagination when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
    setHasMoreData(true);
  }, [debouncedSearchQuery, activeTab]);

  // Update hasMoreData based on API response
  React.useEffect(() => {
    if (patientSummary) {
      setHasMoreData(!!patientSummary.next);
    }
  }, [patientSummary]);

  // Transform patients to Overallrecordcard format
  const transformedRecords = useMemo(() => {
    return patients.map(transformToOverallRecord);
  }, [patients]);

  // Extract counts from the response - now using backend counts
  const counts = useMemo(() => {
    // Use backend-provided count if available, otherwise fallback
    const totalCount = patientSummary?.count || 0;
    
    // For resident/transient counts, we'll use the current page data
    // If your backend provides these counts separately, use them instead
    const residents = patients.filter((p) => p.patientType.toLowerCase() === "resident").length
    const transients = patients.filter((p) => p.patientType.toLowerCase() === "transient").length
    
    return {
      all: totalCount,
      resident: residents,
      transient: transients,
    }
  }, [patientSummary, patients])

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

  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasMoreData && patientSummary?.next) {
      setCurrentPage(prev => prev + 1);
    }
  }, [isFetching, hasMoreData, patientSummary]);

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

  // Loading state for initial load
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
          <View className="flex-row items-center p-3 border border-gray-200 bg-gray-50 rounded-xl">
            <Search size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-800 text-base"
              placeholder="Search by name, ID, or location..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={handleSearchChange}
            />
          </View>
        </View>

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} setActiveTab={handleTabChange} counts={counts} />

        {/* Records List */}
        {transformedRecords.length === 0 && !isFetching ? (
          <View className="flex-1 justify-center items-center px-6">
            <FileText size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">No records found</Text>
            <Text className="text-gray-600 text-center mt-2">
              {searchQuery || activeTab !== 'all' 
                ? `No records match your current filters.` 
                : `There are no animal bite records available yet.`
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={transformedRecords}
            keyExtractor={(item) => `ab-${item.pat_id}-${Math.random()}`} // Add randomness for pagination
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={['#3B82F6']} 
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16 }}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={21}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => (
              <Overallrecordcard
                record={item}
                onPress={() => handleRecordPress(item)}
              />
            )}
            ListFooterComponent={
              isFetching && currentPage > 1 ? (
                <View className="py-4 items-center">
                  <Text className="text-gray-500">Loading more records...</Text>
                </View>
              ) : hasMoreData ? (
                <View className="py-4 items-center">
                  <Text className="text-gray-500">Pull to load more</Text>
                </View>
              ) : transformedRecords.length > 0 ? (
                <View className="py-4 items-center">
                  <Text className="text-gray-500"></Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              isFetching ? (
                <View className="flex-1 justify-center items-center py-20">
                  <Text className="text-gray-500">Loading records...</Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </PageLayout>
  );
}

// Keep your existing transformToOverallRecord function
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