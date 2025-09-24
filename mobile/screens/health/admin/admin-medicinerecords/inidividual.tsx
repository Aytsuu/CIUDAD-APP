import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList, Alert, ScrollView, Modal, Image } from "react-native";
import { Search, ChevronLeft, AlertCircle, User, Calendar, FileText, Pill, RefreshCw, Plus, Download, ChevronRight, MapPin, Clock, X, ArrowLeft, ArrowRight } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { router, useLocalSearchParams } from "expo-router";
import { format, parseISO, isValid } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { calculateAge } from "@/helpers/ageCalculator";
import { useDebounce } from "@/hooks/use-debounce";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { PaginationControls } from "../components/pagination-layout";
import { useIndividualMedicineRecords } from "./queries/fetch";
import { PatientInfoCard } from "../components/patientcards";
import { MedicineRecordCard } from "./medicine-record-cad";

export default function IndividualMedicineRecords() {
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const queryClient = useQueryClient();
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Parse patient data from params
  const patientData: any | null = useMemo(() => {
    try {
      if (params.patientData && typeof params.patientData === "string") {
        return JSON.parse(params.patientData);
      }
      return null;
    } catch (error) {
      console.error("Error parsing patient data:", error);
      return null;
    }
  }, [params.patientData]);

  // Use the useIndividualMedicineRecords hook
  const { data: apiResponse, isLoading, isError, error, refetch, isFetching } = useIndividualMedicineRecords(patientData?.pat_id || "", currentPage, pageSize, debouncedSearchQuery);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const medicineRecords = apiResponse?.results || [];
  const totalCount = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Calculate current entries being shown
  const startEntry = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endEntry = Math.min(currentPage * pageSize, totalCount);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      setCurrentPage(1); // Reset to first page on refresh
    } catch (e) {
      console.error("Refetch error:", e);
    }
    setRefreshing(false);
  }, [refetch]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Guard clause for missing patient data
  if (!patientData?.pat_id) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text>Medicine Records</Text>}
      >
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <AlertCircle size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">Patient Not Found</Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">No patient data was provided. Please select a patient first.</Text>
          <TouchableOpacity onPress={() => router.back()} className="bg-blue-600 px-6 py-3 rounded-lg">
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  if (isLoading && !medicineRecords.length) {
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
        headerTitle={<Text>Medicine Records</Text>}
      >
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <AlertCircle size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">Error loading records</Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">Failed to load medicine records. Please try again.</Text>
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
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-slate-900 text-[13px]">Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView className="flex-1 " refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} />}>
        {/* Patient Info Card */}
        <View className="px-4 pt-4">
          <PatientInfoCard patient={patientData} />
        </View>

        {/* Summary and Search */}
        <View className=" p-4">
          {/* Search */}
          <View className="">
            <View className="flex-row items-center space-x-3">
              <View className="flex-1 flex-row items-center px-2 border border-gray-300 bg-gray-50 rounded-lg shadow-sm">
                <Search size={20} color="#6B7280" />
                <TextInput className="flex-1 ml-3 text-gray-800 text-base" placeholder="Search by medicine name, category..." placeholderTextColor="#9CA3AF" value={searchQuery} onChangeText={setSearchQuery} />
              </View>
            </View>
          </View>
        </View>

        {/* Entries Summary */}
        <View className="px-4 py-2 border-b border-gray-100 bg-white">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">
              Showing {startEntry} to {endEntry} of {totalCount} entries
            </Text>
            <Text className="text-sm font-medium text-gray-800">
              Page {currentPage} of {totalPages}
            </Text>
          </View>
        </View>

        {/* Records List */}
        <View className="px-4 pb-4">
          {medicineRecords.length === 0 ? (
            <View className="bg-white rounded-xl p-8 items-center border border-gray-200">
              <Pill size={64} color="#9CA3AF" />
              <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">No medicine records found</Text>
              <Text className="text-gray-600 text-center mt-2 mb-4">{debouncedSearchQuery ? "No records match your search criteria." : "This patient doesn't have any medicine records yet."}</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={medicineRecords}
                keyExtractor={(item) => `medicine-record-${item.id}`}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                renderItem={({ item }) => <MedicineRecordCard record={item} />}
                ListFooterComponent={
                  isFetching ? (
                    <View className="py-4 items-center">
                      <RefreshCw size={20} color="#3B82F6" className="animate-spin" />
                    </View>
                  ) : null
                }
              />

              {/* Pagination Controls */}
              <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalCount} pageSize={pageSize} onPageChange={handlePageChange} />
            </>
          )}
        </View>
      </ScrollView>
    </PageLayout>
  );
}
