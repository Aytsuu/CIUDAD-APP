import React, { useState, useMemo, useCallback, useEffect } from "react";
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList, Alert } from "react-native";
import { Search, ChevronLeft, AlertCircle, Users, Home, UserCheck, Pill, ChevronRight, RefreshCw } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import {  useQueryClient } from "@tanstack/react-query";
import { calculateAge } from "@/helpers/ageCalculator";
import { useDebounce } from "@/hooks/use-debounce";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { useMedicineRecords } from "./queries/fetch";
// Types
interface MedicineRecord {
  pat_id: string;
  fname: string;
  lname: string;
  mname: string;
  sex: string;
  age: string;
  dob: string;
  householdno: string;
  street: string;
  sitio: string;
  barangay: string;
  city: string;
  province: string;
  pat_type: string;
  address: string;
  medicine_count: number;
  patient_details?: {
    personal_info: {
      per_fname: string;
      per_lname: string;
      per_mname: string;
      per_sex: string;
      per_dob: string;
    };
    address: {
      add_street: string;
      add_sitio: string;
      add_barangay: string;
      add_city: string;
      add_province: string;
    };
    pat_type: string;
    households?: Array<{ hh_id: string }>;
  };
}

interface ApiResponse {
  results?: MedicineRecord[];
  count?: number;
  next?: string;
  previous?: string;
}

type TabType = "all" | "resident" | "transient";

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
          color: 'text-purple-700',
          bgColor: 'bg-purple-100',
          borderColor: 'border-purple-200',
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

const MedicineRecordCard: React.FC<{
  record: MedicineRecord;
  onPress: () => void;
}> = ({ record, onPress }) => {
  const formatAddress = () => {
    return record.address || [record.street, record.barangay, record.city, record.province]
      .filter(Boolean)
      .join(", ");
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
                <Pill color="white" size={20} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-lg text-gray-900">
                  {record.lname}, {record.fname} {record.mname}
                </Text>
                <Text className="text-gray-500 text-sm">ID: {record.pat_id}</Text>
              </View>
            </View>
          </View>
          <StatusBadge type={record.pat_type} />
        </View>
      </View>

      {/* Details */}
      <View className="p-4">
        <View className="flex-row items-center mb-3">
          <Users size={16} color="#6B7280" />
          <Text className="ml-2 text-gray-600 text-sm">
            Age: <Text className="font-medium text-gray-900">{record.age}</Text> • {record.sex}
          </Text>
        </View>

        <View className="flex-row items-center mb-3">
          <Text className="ml-2 text-gray-600 text-sm">
            Address: <Text className="font-medium text-gray-900">{formatAddress() || "No address provided"}</Text>
          </Text>
        </View>

        {record.sitio && (
          <View className="flex-row items-center mb-3">          <Users size={16} color="#6B7280" />

            <Text className="ml-2 text-gray-600 text-sm">
              Sitio: <Text className="font-medium text-gray-900">{record.sitio}</Text>
            </Text>
          </View>
        )}

        <View className="flex-row items-center justify-between">
        <Users size={16} color="#6B7280" />

          <View className="flex-row items-center">
            <Pill size={16} color="#6B7280" />
            <Text className="ml-2 text-gray-600 text-sm">
              Medicine Records: <Text className="font-medium text-gray-900">{record.medicine_count}</Text>
            </Text>
          </View>
          <ChevronRight size={16} color="#6B7280" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const PaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrevious: boolean;
}> = ({ currentPage, totalPages, onPageChange, hasNext, hasPrevious }) => (
  <View className="flex-row items-center justify-between bg-white px-4 py-3 border-t border-gray-200">
    <TouchableOpacity
      onPress={() => onPageChange(currentPage - 1)}
      disabled={!hasPrevious}
      className={`px-4 py-2 rounded-lg border ${!hasPrevious 
        ? 'bg-gray-100 border-gray-200' 
        : 'bg-white border-blue-600'
      }`}
    >
      <Text className={`font-medium ${!hasPrevious ? 'text-gray-400' : 'text-blue-600'}`}>
        Previous
      </Text>
    </TouchableOpacity>

    <View className="flex-row items-center space-x-2">
      <Text className="text-gray-600 text-sm">
        Page {currentPage} of {totalPages}
      </Text>
    </View>

    <TouchableOpacity
      onPress={() => onPageChange(currentPage + 1)}
      disabled={!hasNext}
      className={`px-4 py-2 rounded-lg border ${!hasNext 
        ? 'bg-gray-100 border-gray-200' 
        : 'bg-white border-blue-600'
      }`}
    >
      <Text className={`font-medium ${!hasNext ? 'text-gray-400' : 'text-blue-600'}`}>
        Next
      </Text>
    </TouchableOpacity>
  </View>
);

export default function OverAllMedicineRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  const queryClient = useQueryClient();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Build query parameters
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      page_size: pageSize,
      search: debouncedSearchQuery || undefined,
      patient_type: activeTab !== "all" ? activeTab : undefined
    }),
    [currentPage, pageSize, debouncedSearchQuery, activeTab]
  );

  // Use the useMedicineRecords hook instead of direct useQuery
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useMedicineRecords(queryParams);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, activeTab]);

  // Format medicine data
  const formatMedicineData = useCallback((): MedicineRecord[] => {
    if (!apiResponse?.results || !Array.isArray(apiResponse.results)) {
      return [];
    }

    return apiResponse.results.map((record: any) => {
      const details = record.patient_details || {};
      const info = details.personal_info || {};
      const address = details.address || {};
      
      const addressString = [
        address.add_street, 
        address.add_barangay, 
        address.add_city, 
        address.add_province
      ].filter((part) => part && part.trim().length > 0).join(", ") || "";

      return {
        pat_id: record.pat_id,
        fname: info.per_fname || "",
        lname: info.per_lname || "",
        mname: info.per_mname || "",
        sex: info.per_sex || "",
        age: calculateAge(info.per_dob).toString(),
        dob: info.per_dob || "",
        householdno: details.households?.[0]?.hh_id || "",
        street: address.add_street || "",
        sitio: address.add_sitio || "",
        barangay: address.add_barangay || "",
        city: address.add_city || "",
        province: address.add_province || "",
        pat_type: details.pat_type || "",
        address: addressString,
        medicine_count: record.medicine_count || 0

      };
    });
  }, [apiResponse?.results]);

  const formattedData = formatMedicineData();
  const totalCount = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNext = !!apiResponse?.next;
  const hasPrevious = !!apiResponse?.previous;

  // Calculate counts for summary cards and tabs
  const counts = useMemo(() => {
    if (!formattedData) return { all: 0, resident: 0, transient: 0 };
    
    const residentCount = formattedData.filter(r => r.pat_type.toLowerCase() === 'resident').length;
    const transientCount = formattedData.filter(r => r.pat_type.toLowerCase() === 'transient').length;
    
    return {
      all: totalCount,
      resident: residentCount,
      transient: transientCount,
    };
  }, [formattedData, totalCount]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (e) {
      console.error("Refetch error:", e);
    }
    setRefreshing(false);
  }, [refetch]);

  const handleRecordPress = (record: MedicineRecord) => {
    try {
      const patientData = {
        pat_id: record.pat_id,
        pat_type: record.pat_type,
        age: record.age,
        addressFull: record.address || "No address provided",
        address: {
          add_street: record.street,
          add_barangay: record.barangay,
          add_city: record.city,
          add_province: record.province,
          add_sitio: record.sitio
        },
        households: [{ hh_id: record.householdno }],
        personal_info: {
          per_fname: record.fname,
          per_mname: record.mname,
          per_lname: record.lname,
          per_dob: record.dob,
          per_sex: record.sex
        }
      };

      router.push({
        pathname: "/admin/medicinerecords/individual",
        params: { patientData: JSON.stringify(patientData) }
      });
    } catch (error) {
      console.log("Navigation error:", error);
    }
  };

  if (isLoading && !formattedData.length) {
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
        headerTitle={<Text className="">Medicine Records</Text>}
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
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">Medicine Records</Text>}
     
    >
      <View className="flex-1 bg-gray-50">
       

        {/* Search Bar */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center px-2 border border-gray-200 bg-gray-50 rounded-xl">
            <Search size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-800 text-base"
              placeholder="Search by name, medicine, or address..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />

        {/* Records List */}
        {!formattedData || formattedData.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Pill size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">No records found</Text>
            <Text className="text-gray-600 text-center mt-2">
              There are no medicine records available yet.
            </Text>
          </View>
        ) : (
          <>
            <FlatList
              data={formattedData}
              keyExtractor={(item) => `medicine-${item.pat_id}`}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh} 
                  colors={['#3B82F6']} 
                />
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16, paddingBottom: 0 }}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={10}
              renderItem={({ item }) => (
                <MedicineRecordCard
                  record={item}
                  onPress={() => handleRecordPress(item)}
                />
              )}
              ListFooterComponent={
                isFetching ? (
                  <View className="py-4 items-center">
                    <RefreshCw size={20} color="#3B82F6" className="animate-spin" />
                  </View>
                ) : null
              }
            />
            
            {/* Pagination Controls */}
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
            />
          </>
        )}
      </View>
    </PageLayout>
  );
}