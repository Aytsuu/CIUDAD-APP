import React, { useState, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { getFPPatientsCounts, getFPRecordsList } from "./GetRequest";
import {
  ArrowLeft,
  Search,
  User,
  Users,
  FileText,
  Calendar,
  Stethoscope,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react-native";
import { Picker } from "@react-native-picker/picker";

interface FPRecord {
  fprecord_id: number;
  patient_id: string;
  client_id: string;
  patient_name: string;
  patient_age: number;
  client_type: string;
  patient_type: string;
  method_used: string;
  created_at: string;
  updated_at: string;
  sex: string;
}

interface FPPatientsCount {
  total_fp_patients: number;
  resident_fp_patients: number;
  transient_fp_patients: number;
}

export default function OverallFpRecordsScreen() {
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const queryClient = useQueryClient();

  const {
    data: fpRecords = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<FPRecord[], Error>({
    queryKey: ["fpRecordsList"],
    queryFn: getFPRecordsList,
  });

  const {
    data: fpCounts,
    isLoading: isLoadingCounts,
    isError: isErrorCounts,
    error: errorCounts,
  } = useQuery<FPPatientsCount, Error>({
    queryKey: ["fpPatientCounts"],
    queryFn: getFPPatientsCounts,
  });

  const filteredRecords = useMemo(() => {
    let filtered = fpRecords;

    if (searchQuery) {
      filtered = filtered.filter(
        (record) =>
          record.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.client_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.client_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.method_used.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter !== "all") {
      filtered = filtered.filter((record) => record.client_type === selectedFilter);
    }

    return filtered;
  }, [fpRecords, searchQuery, selectedFilter]);

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["fpPatientCounts"] });
  };

  const clientTypeOptions = [
    { id: "all", name: "All Types" },
    { id: "New Acceptor", name: "New Acceptor" },
    { id: "Current User", name: "Current User" },
  ];

  const totalFPPatients = fpCounts?.total_fp_patients || 0;
  const residentFPPatients = fpCounts?.resident_fp_patients || 0;
  const transientFPPatients = fpCounts?.transient_fp_patients || 0;

  const residentFPPercentage = totalFPPatients > 0 ? Math.round((residentFPPatients / totalFPPatients) * 100) : 0;
  const transientFPPercentage = totalFPPatients > 0 ? Math.round((transientFPPatients / totalFPPatients) * 100) : 0;

  const handleRecordPress = (patientId: string) => {
    try {
      router.push({
        pathname: "/admin/familyplanning/individual",
        params: { patientId },
      });
    } catch (error) {
      console.log("Navigation error:", error);
      // You can add a fallback action here, like showing an alert
    }
  };

 

  const renderRecordItem = ({ item }: { item: FPRecord }) => (
    <TouchableOpacity
      className="bg-white mx-4 mb-3 rounded-2xl shadow-sm"
      onPress={() => handleRecordPress(item.patient_id)}
      accessibilityLabel={`View records for ${item.patient_name}`}
    >
      <View className="p-5">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              {item.patient_name || "N/A"}
            </Text>
            {/* <Text className="text-sm text-gray-500">{item.client_id}</Text> */}
          </View>
          <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
            <ChevronRight size={16} color="#6B7280" />
          </View>
        </View>

        {/* Info Grid */}
        <View className="flex-row justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Client Type
            </Text>
            <Text className="text-sm text-gray-700 font-medium">
              {item.client_type || "N/A"}
            </Text>
            <Text className="text-xs text-gray-400 uppercase tracking-wide mb-1 mt-3">
              Patient Type
            </Text>
             <Text className="text-sm text-gray-700 font-medium">
              {item.patient_type || "N/A"}
            </Text>
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Method
            </Text>
            <Text className="text-sm text-gray-700 font-medium">
              {item.method_used || "Not specified"}
            </Text>
          </View>
        </View>

        {/* Date */}
        <View className="mt-3 pt-3 border-t border-gray-100">
          <Text className="text-xs text-gray-400">
            {new Date(item.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading || isLoadingCounts) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Loader2 size={24} color="#3B82F6" />
        <Text className="text-gray-600 mt-3">Loading...</Text>
      </View>
    );
  }

  if (isError || isErrorCounts) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <AlertCircle size={24} color="#EF4444" />
        <Text className="text-gray-900 font-medium mt-3 text-center">
          Something went wrong
        </Text>
        <Text className="text-gray-500 text-sm mt-1 text-center">
          {error?.message || errorCounts?.message}
        </Text>
        <TouchableOpacity
          onPress={handleRefresh}
          className="mt-4 bg-blue-600 px-6 py-3 rounded-xl"
          accessibilityLabel="Try again"
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center mr-3">
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-semibold text-gray-900">
              Family Planning
            </Text>
            <Text className="text-sm text-gray-500 mt-0.5">
              {filteredRecords.length} records
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="px-4 py-4">
        <View className="flex-row gap-3 ">
          <View className="flex-1 bg-white rounded-2xl p-4">
            <Text className="text-2xl font-bold text-gray-900">
              {totalFPPatients}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">Total Patients</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4">
            <Text className="text-2xl font-bold text-blue-600">
              {residentFPPatients}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Resident ({residentFPPercentage}%)
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4">
            <Text className="text-2xl font-bold text-amber-600">
              {transientFPPatients}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Transient ({transientFPPercentage}%)
            </Text>
          </View>
        </View>
      </View>

      {/* Search & Filter */}
      <View className="px-4 mb-4">
        {/* Search Bar */}
        <View className="bg-white rounded-2xl mb-3">
          <View className="flex-row items-center bg-white rounded-xl px-4 py-3">
            <Search size={18} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-gray-900 ml-3"
              placeholder="Search patients..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Search family planning records"
            />
          </View>
        </View>

        {/* Filter */}
        <View className="bg-white rounded-2xl overflow-hidden">
          <Picker
            selectedValue={selectedFilter}
            onValueChange={handleFilterChange}
            style={{ height: 50 }}
            accessibilityLabel="Filter by client type"
          >
            {clientTypeOptions.map((option) => (
              <Picker.Item key={option.id} label={option.name} value={option.id} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <FileText size={48} color="#D1D5DB" />
          <Text className="text-lg font-medium text-gray-900 mt-4">
            No records found
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            Try adjusting your search or filter criteria
          </Text>
        </View>
      ) : (
        <FlatList
          data={paginatedRecords}
          renderItem={renderRecordItem}
          keyExtractor={(item) => item.fprecord_id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Pagination */}
      {filteredRecords.length > 0 && totalPages > 1 && (
        <View className="bg-white mx-4 mb-4 rounded-2xl p-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-6 py-3 rounded-xl ${
                currentPage === 1 
                  ? "bg-gray-100" 
                  : "bg-blue-600"
              }`}
              accessibilityLabel="Previous page"
            >
              <Text 
                className={`font-medium ${
                  currentPage === 1 
                    ? "text-gray-400" 
                    : "text-white"
                }`}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <Text className="text-gray-600 font-medium">
              {currentPage} of {totalPages}
            </Text>

            <TouchableOpacity
              onPress={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-6 py-3 rounded-xl ${
                currentPage === totalPages 
                  ? "bg-gray-100" 
                  : "bg-blue-600"
              }`}
              accessibilityLabel="Next page"
            >
              <Text 
                className={`font-medium ${
                  currentPage === totalPages 
                    ? "text-gray-400" 
                    : "text-white"
                }`}
              >
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}