import React, { useState, useMemo, useCallback, useRef } from "react";
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList } from "react-native";
import { router } from "expo-router";
import { Search, ChevronLeft, AlertCircle, User, Calendar, FileText, Users, MapPinHouse, RefreshCw } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useDebounce } from "@/hooks/use-debounce";

import PageLayout from "@/screens/_PageLayout";
import { AgeCalculation } from "@/helpers/ageCalculator";

import { useMaternalRecords, useMaternalCount } from "./queries/maternalFETCH";

interface maternalRecords {
   pat_id: string;
   age: number;
   personal_info: {
      per_fname: string;
      per_lname: string;
      per_mname: string;
      per_sex: string;
      per_dob?: string;
      ageTime: string;
   };
   address?: {
      add_street?: string;
      add_barangay?: string;
      add_city?: string;
      add_province?: string;
      add_external_sitio?: string;
      add_sitio?: string;
   };
   pat_type: "Transient" | "Resident";
   patrec_type?: string;
   completed_pregnancy_count?: number;
}

type TabType = "all" | "resident" | "transient";

const StatusBadge = React.memo<{ type: string }>(({ type }) => {
  const typeConfig = useMemo(() => {
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
  }, [type]);

  return (
    <View className={`px-3 py-1 rounded-full border ${typeConfig.bgColor} ${typeConfig.borderColor}`}>
      <Text className={`text-xs font-semibold ${typeConfig.color}`}>
        {type}
      </Text>
    </View>
  );
});

const TabBar = React.memo<{
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}>(({ activeTab, setActiveTab}) => (
  <View className="flex-row justify-around bg-white p-2 border-b border-gray-200">
    <TouchableOpacity
      onPress={() => setActiveTab('all')}
      className={`flex-1 items-center py-3 ${activeTab === 'all' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'all' ? 'text-blue-600' : 'text-gray-600'}`}>
        All
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('resident')}
      className={`flex-1 items-center py-3 ${activeTab === 'resident' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'resident' ? 'text-blue-600' : 'text-gray-600'}`}>
        Residents
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('transient')}
      className={`flex-1 items-center py-3 ${activeTab === 'transient' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'transient' ? 'text-blue-600' : 'text-gray-600'}`}>
        Transients
      </Text>
    </TouchableOpacity>
  </View>
));

// Optimized MaternalRecordCard with memoization and computed values
const MaternalRecordCard = React.memo<{
  record: maternalRecords;
  onPress: () => void;
}>(({ record, onPress }) => {
  // Pre-compute expensive operations
  const fullName = useMemo(() => 
    `${record.personal_info?.per_fname} ${record.personal_info?.per_lname}`, 
    [record.personal_info?.per_fname, record.personal_info?.per_lname]
  );
  
  const calculatedAge = useMemo(() => 
    AgeCalculation(record?.personal_info?.per_dob ?? ""), 
    [record.personal_info?.per_dob]
  );
  
  const fullAddress = useMemo(() => {
    if (!record.address) return null;
    const addressParts = [
      record.address.add_street,
      record.address.add_barangay,
      record.address.add_city,
      record.address.add_province
    ].filter(Boolean);
    return addressParts.join(' ');
  }, [record.address]);

  return (
    <TouchableOpacity
      className="bg-white rounded-xl border border-gray-200 mb-3 overflow-hidden shadow-sm"
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-1">
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-3">
                <User color="white" size={20} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-lg text-gray-900 capitalize">
                  {fullName}
                </Text>
                <Text className="text-gray-500 text-sm">ID: {record.pat_id}</Text>
              </View>
            </View>
          </View>
          <StatusBadge type={record.pat_type} />
        </View>
      </View>
      <View className="p-4">
        <View className="flex-row items-center mb-3">
          <Users size={16} color="#6B7280" />
          <Text className="ml-2 text-gray-600 text-sm">
            Age: <Text className="font-medium text-gray-900">{calculatedAge}</Text> • {record.personal_info?.per_sex}
          </Text>
        </View>
        <View className="flex-row items-center mb-3">
          <FileText size={16} color="#6B7280" />
          <Text className="ml-2 text-gray-600 text-sm">
            Completed Pregnancies: <Text className="font-medium text-gray-900">{record.completed_pregnancy_count ?? 'N/A'}</Text>
          </Text>
        </View>
        {fullAddress && (
          <View className="flex-row items-center">
            <MapPinHouse size={16} color="#6B7280" />
            <Text className="ml-2 text-gray-600 text-sm">
              Address: <Text className="font-medium text-gray-900 capitalize">
                {fullAddress}
              </Text>
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

// Memoized Empty State Component
const EmptyState = React.memo<{
  searchQuery: string;
  activeTab: TabType;
}>(({ searchQuery, activeTab }) => (
  <View className="px-4">
    <Card className="bg-white border-slate-200">
       <CardContent className="items-center justify-center py-12">
          <FileText size={48} color="#94a3b8" />
          <Text className="text-lg font-medium text-slate-900 mt-4">
          No records found
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            {searchQuery
              ? `No ${activeTab} records match your search.`
              : `No ${activeTab} records found.`}
          </Text>
       </CardContent>
    </Card>
 </View>
));

// Memoized Pagination Component
const PaginationFooter = React.memo<{
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}>(({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <View className="px-4 mb-4">
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <View className="flex-row items-center justify-between">
            <Button
              onPress={() => onPageChange(page - 1)}
              disabled={page === 1}
              variant={page === 1 ? "secondary" : "default"}
              className={page === 1 ? "bg-slate-200" : "bg-blue-600"}
            >
              <Text
                className={`font-medium ${
                  page === 1 ? "text-slate-400" : "text-white"
                }`}
              >
                Previous
              </Text>
            </Button>

            <Text className="text-slate-600 font-medium">
              Page {page} of {totalPages}
            </Text>

            <Button
              onPress={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              variant={page === totalPages ? "secondary" : "default"}
              className={page === totalPages ? "bg-slate-200" : "bg-blue-600"}
            >
              <Text
                className={`font-medium ${
                  page === totalPages ? "text-slate-400" : "text-white"
                }`}
              >
                Next
              </Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  );
});

export default function OverallMaternalRecordsScreen() {
  const [searchInput, setSearchInput] = useState(""); 
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [page, setPage] = useState(1);
  const debouncedSearchTerm = useDebounce(searchInput, 300);
const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Optimized search debouncing with useCallback
  const handleSearchChange = useCallback((text: string) => {
    setSearchInput(text);
    setPage(1);
  }, []);

  const getStatusForAPI = useCallback((tab: TabType) => {
    if (tab === "all") return undefined;
    return tab.charAt(0).toUpperCase() + tab.slice(1);
  }, []);


  const { data: maternalData, isLoading, isError, refetch } = useMaternalRecords(
    page,
    pageSize,
    debouncedSearchTerm || '',
    getStatusForAPI(activeTab) || ''
  );
  const { data: maternalCount } = useMaternalCount();
  
  const maternalRecordss = maternalData?.results || [];
  const totalMCount = maternalData?.count || 0;
  const totalMPages = Math.ceil(totalMCount / pageSize);

  const counts = useMemo(() => ({
    all: maternalCount?.total_records || 0,
    resident: maternalCount?.resident_patients || 0,
    transient: maternalCount?.transient_patients || 0,
  }), [maternalCount]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (e) {
      console.error("Refetch error:", e);
    }
    setRefreshing(false);
  }, [refetch]);

  const handleRecordPress = useCallback((record: maternalRecords) => {
    try {
      router.push({
        pathname: "/admin/maternal/individual",
        params: {
          pat_id: record.pat_id,
          patientData: JSON.stringify(record),
        },
      });
    } catch (error) {
      console.log("Navigation error:", error);
    }
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalMPages) {
      setPage(newPage);
    }
  }, [totalMPages]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setPage(1);
  }, []);

  const renderItem = useCallback(({ item }: { item: maternalRecords }) => (
    <MaternalRecordCard
      record={item}
      onPress={() => handleRecordPress(item)}
    />
  ), [handleRecordPress]);

  const keyExtractor = useCallback((item: maternalRecords) => `mat-${item.pat_id}`, []);

  // Show loading only on initial load, not when searching or paginating
  const showInitialLoading = isLoading && !maternalRecordss.length && !debouncedSearchTerm;

  if (showInitialLoading) {
    return <LoadingState />;
  }

  if (isError && !maternalRecordss.length) {
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
        headerTitle={<Text className="">Maternal Records</Text>}
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
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">Maternal Records</Text>}
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
              value={searchInput}
              onChangeText={handleSearchChange}
            />
            {/* {isFetching && (
              <RefreshCw size={16} color="#6B7280" className="animate-spin" />
            )} */}
          </View>
        </View>

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} setActiveTab={handleTabChange} />
        
        {/* Results Info */}
                <View className="px-4 flex-row items-center justify-between py-3 bg-white border-b border-gray-200">
                  <Text className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalMCount)} of {totalMCount} records
                  </Text>
                  <Text className="text-sm font-medium text-gray-800">
                    Page {currentPage} of {totalMPages}
                  </Text>
                </View>
        {/* Records List */}
        {maternalRecordss.length === 0 ? (
          <EmptyState searchQuery={debouncedSearchTerm} activeTab={activeTab} />
        ) : (
          <FlatList
            data={maternalRecordss}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
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
            windowSize={10}
            removeClippedSubviews={true}
            
            ListFooterComponent={
              <PaginationFooter
                page={page}
                totalPages={totalMPages}
                onPageChange={handlePageChange}
              />
            }
          />
        )}
      </View>
    </PageLayout>
  );
}