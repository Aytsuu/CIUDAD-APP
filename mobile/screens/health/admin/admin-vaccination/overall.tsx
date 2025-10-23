
import type React from "react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList } from "react-native";
import { Search, ChevronLeft, AlertCircle, Syringe, RefreshCw } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { calculateAge } from "@/helpers/ageCalculator";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { useVaccinationRecords } from "./queries/fetch";
import { Overallrecordcard } from "../components/overall-cards";
import { PaginationControls } from "../components/pagination-layout";
import { useDebounce } from "@/hooks/use-debounce";
import { TabType, TabBar } from "../components/tab-bar";

interface VaccinationRecord {
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
  count: number;
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
  results?: VaccinationRecord[];
  count?: number;
  next?: string;
  previous?: string;
  counts_by_type?: {
    all: number;
    resident: number;
    transient: number;
  };
}

// type TabType = "all" | "resident" | "transient";

// const TabBar: React.FC<{
//   activeTab: TabType;
//   setActiveTab: (tab: TabType) => void;
//   counts: { all: number; resident: number; transient: number };
// }> = ({ activeTab, setActiveTab, counts }) => (
//   <View className="flex-row justify-around bg-white p-2 border-b border-gray-200">
//     <TouchableOpacity onPress={() => setActiveTab("all")} className={`flex-1 items-center py-3 ${activeTab === "all" ? "border-b-2 border-blue-600" : ""}`}>
//       <Text className={`text-sm font-medium ${activeTab === "all" ? "text-blue-600" : "text-gray-600"}`}>All</Text>
//     </TouchableOpacity>
//     <TouchableOpacity onPress={() => setActiveTab("resident")} className={`flex-1 items-center py-3 ${activeTab === "resident" ? "border-b-2 border-blue-600" : ""}`}>
//       <Text className={`text-sm font-medium ${activeTab === "resident" ? "text-blue-600" : "text-gray-600"}`}>Residents</Text>
//     </TouchableOpacity>
//     <TouchableOpacity onPress={() => setActiveTab("transient")} className={`flex-1 items-center py-3 ${activeTab === "transient" ? "border-b-2 border-blue-600" : ""}`}>
//       <Text className={`text-sm font-medium ${activeTab === "transient" ? "text-blue-600" : "text-gray-600"}`}>Transients</Text>
//     </TouchableOpacity>
//   </View>
// );

export default function AllVaccinationRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Build query parameters
  const queryParams = useMemo(
  () => ({
    page: currentPage,
    page_size: pageSize,
    search: debouncedSearchQuery || undefined, // Use debounced value
    patient_type: activeTab !== "all" ? activeTab : undefined
  }),
  [currentPage, pageSize, debouncedSearchQuery, activeTab] // Add debouncedSearchQuery
);

  // Use the useVaccinationRecords hook
  const { data: apiResponse, isLoading, isError, refetch, isFetching } = useVaccinationRecords(queryParams);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // Format vaccination data
  const formatVaccinationData = useCallback((): VaccinationRecord[] => {
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
        pat_type: details.pat_type || "",
        address: addressString,
        vaccination_count: record.vaccination_count || 0
      };
    });
  }, [apiResponse?.results]);

  const formattedData = formatVaccinationData();
  const totalCount = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNext = !!apiResponse?.next;
  const hasPrevious = !!apiResponse?.previous;

  // Use counts from API response - this is the key fix
  const counts = useMemo(() => {
    if (!apiResponse?.counts_by_type) {
      return { all: 0, resident: 0, transient: 0 };
    }
    
    return {
      all: apiResponse.counts_by_type.all,
      resident: apiResponse.counts_by_type.resident,
      transient: apiResponse.counts_by_type.transient
    };
  }, [apiResponse?.counts_by_type]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (e) {
      console.error("Refetch error:", e);
    }
    setRefreshing(false);
  }, [refetch]);

  const handleRecordPress = (record: any) => {
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
        pathname: "/(health)/vaccination/my-records",
        params: { pat_id: patientData.pat_id, mode: "admin" }
      });
    } catch (error) {
      console.log("Navigation error:", error);
    }
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  if (isLoading) {
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
        headerTitle={<Text className="text-gray-900 text-lg font-semibold">Vaccination Records</Text>}
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
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">Vaccination Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1">
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center px-2 p-2 border border-gray-200 bg-gray-50 rounded-xl">
            <Search size={20} color="#6B7280" />
            <TextInput className="flex-1 ml-3 text-gray-800 text-base" placeholder="Search..." placeholderTextColor="#9CA3AF" value={searchQuery} onChangeText={setSearchQuery} />
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
        {!formattedData || formattedData.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Syringe size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">No records found</Text>
            <Text className="text-gray-600 text-center mt-2">There are no vaccination records available yet.</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={formattedData}
              keyExtractor={(item) => `vaccination-${item.pat_id}`}
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