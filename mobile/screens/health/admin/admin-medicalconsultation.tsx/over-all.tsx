// all-medical-records-mobile.tsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList } from "react-native";
import { Search, ChevronLeft, AlertCircle, FileText, RefreshCw } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { calculateAge } from "@/helpers/ageCalculator";
import { useDebounce } from "@/hooks/use-debounce";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { useMedicalRecord } from "./queries/fetch";
import { Overallrecordcard } from "../components/overall-cards";
import { PaginationControls } from "../components/pagination-layout";

// Types
interface MedicalRecord {
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
  medicalrec_count: number;
  contact: string;
  patient_details?: {
    personal_info: {
      per_fname: string;
      per_lname: string;
      per_mname: string;
      per_sex: string;
      per_dob: string;
      per_contact: string;
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


type TabType = "all" | "resident" | "transient";

const TabBar: React.FC<{
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  counts: { all: number; resident: number; transient: number };
}> = ({ activeTab, setActiveTab, counts }) => (
  <View className="flex-row justify-around bg-white p-2 border-b border-gray-200">
    <TouchableOpacity onPress={() => setActiveTab("all")} className={`flex-1 items-center py-3 ${activeTab === "all" ? "border-b-2 border-blue-600" : ""}`}>
      <Text className={`text-sm font-medium ${activeTab === "all" ? "text-blue-600" : "text-gray-600"}`}>All ({counts.all})</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setActiveTab("resident")} className={`flex-1 items-center py-3 ${activeTab === "resident" ? "border-b-2 border-blue-600" : ""}`}>
      <Text className={`text-sm font-medium ${activeTab === "resident" ? "text-blue-600" : "text-gray-600"}`}>Residents ({counts.resident})</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setActiveTab("transient")} className={`flex-1 items-center py-3 ${activeTab === "transient" ? "border-b-2 border-blue-600" : ""}`}>
      <Text className={`text-sm font-medium ${activeTab === "transient" ? "text-blue-600" : "text-gray-600"}`}>Transients ({counts.transient})</Text>
    </TouchableOpacity>
  </View>
);

export default function AllMedicalRecord() {
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

  // Use the medical records hook
  const { data: apiResponse, isLoading, isError, error, refetch, isFetching } = useMedicalRecord(queryParams);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, activeTab]);

  // Format medical data
  const formatMedicalData = useCallback((): MedicalRecord[] => {
    if (!apiResponse?.results || !Array.isArray(apiResponse.results)) {
      return [];
    }

    return apiResponse.results.map((record: any) => {
      const details = record.patient_details || {};
      const info = details.personal_info || {};
      const address = details.address || {};

      const addressString = [address.add_street, address.add_barangay, address.add_city, address.add_province].filter((part) => part && part.trim().length > 0).join(", ") || "";

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
        pat_type: details.pat_type || record.pat_type || "",
        address: addressString,
        medicalrec_count: record.medicalrec_count || 0,
        contact: info.per_contact || ""
      };
    });
  }, [apiResponse?.results]);

  const formattedData = formatMedicalData();
  const totalCount = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNext = !!apiResponse?.next;
  const hasPrevious = !!apiResponse?.previous;

  // Calculate counts for summary cards and tabs
  const counts = useMemo(() => {
    if (!formattedData) return { all: 0, resident: 0, transient: 0 };

    const residentCount = formattedData.filter((r) => r.pat_type.toLowerCase() === "resident").length;
    const transientCount = formattedData.filter((r) => r.pat_type.toLowerCase() === "transient").length;

    return {
      all: totalCount,
      resident: residentCount,
      transient: transientCount
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

  const handleRecordPress = (record: MedicalRecord) => {
    try {
      router.push({
        pathname: "/medconsultation/my-records",
        params: {
          pat_id: record.pat_id,
          mode: "admin"
        }
      });
    } catch (error) {
      console.log("Navigation error:", error);
    }
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  if (isLoading && !formattedData.length) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-lg font-semibold">Medical Records</Text>}
        rightAction={<View className="w-10 h-10" />}
      >
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <AlertCircle size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">Error loading records</Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">Failed to load data. Please check your connection and try again.</Text>
          <TouchableOpacity onPress={onRefresh} className="flex-row items-center bg-blue-600 px-6 py-3 rounded-lg">
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
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">Medical Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1">
        {/* Search Bar */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center px-2 border border-gray-200 bg-gray-50 rounded-xl">
            <Search size={20} color="#6B7280" />
            <TextInput className="flex-1 ml-3 text-gray-800 text-base" placeholder="Search by name, patient ID, household number, address, or sitio..." placeholderTextColor="#9CA3AF" value={searchQuery} onChangeText={setSearchQuery} />
          </View>
        </View>

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />

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
        {!formattedData || formattedData.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <FileText size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">No records found</Text>
            <Text className="text-gray-600 text-center mt-2">{searchQuery ? "No records match your search criteria." : "There are no medical records available yet."}</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={formattedData}
              keyExtractor={(item) => `medical-record-${item.pat_id}`}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16 }}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={10}
              renderItem={({ item }) => <Overallrecordcard record={item} onPress={() => handleRecordPress(item)} />}
              ListFooterComponent={
                isFetching ? (
                  <View className="py-4 items-center">
                    <RefreshCw size={20} color="#3B82F6" className="animate-spin" />
                  </View>
                ) : null
              }
            />

            {/* Pagination Controls */}
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </View>
    </PageLayout>
  );
}
