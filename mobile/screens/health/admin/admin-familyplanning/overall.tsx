import React, { useState, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { getFPPatientsCounts, getFPRecordsList } from "./GetRequest";
import {
  ArrowLeft,
  Search,
  FileText,
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Users,
  UserCheck,
  UserPlus
} from "lucide-react-native";
import PageLayout from "@/screens/_PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";

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
    isFetching
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

  // const residentFPPercentage = totalFPPatients > 0 ? Math.round((residentFPPatients / totalFPPatients) * 100) : 0;
  // const transientFPPercentage = totalFPPatients > 0 ? Math.round((transientFPPatients / totalFPPatients) * 100) : 0;

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

  const renderRecordItem = ({ item }: { item: FPRecord }) => (
    <View className="px-4 mb-3">
      <Card className="bg-white border border-slate-200">
        <CardContent className="p-0">
          <TouchableOpacity
            onPress={() => handleRecordPress(item.patient_id)}
            accessibilityLabel={`View records for ${item.patient_name}`}
            className="p-4"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-slate-900 mb-1">
                  {item.patient_name || "N/A"}
                </Text>
                <View className="flex-row items-center">
                  <Badge 
                    variant={item.client_type === "New Acceptor" ? "default" : "secondary"}
                    className="mr-2"
                  >
                    <Text className="text-xs">{item.client_type || "N/A"}</Text>
                  </Badge>
                  <Text className="text-xs text-slate-500">
                    ID: {item.client_id}
                  </Text>
                </View>
              </View>
              <View className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center">
                <ChevronRight size={16} color="#64748b" />
              </View>
            </View>

            {/* Info Grid */}
            <View className="flex-row justify-between mb-3">
              <View className="flex-1 mr-3">
                <Text className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                  Patient Type
                </Text>
                <Text className="text-sm text-slate-700 font-medium">
                  {item.patient_type || "N/A"}
                </Text>
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                  Method
                </Text>
                <Text className="text-sm text-slate-700 font-medium">
                  {item.method_used || "Not specified"}
                </Text>
              </View>
            </View>

            {/* Date */}
            <View className="pt-3 border-t border-slate-100">
              <Text className="text-xs text-slate-500">
                Created: {new Date(item.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </TouchableOpacity>
        </CardContent>
      </Card>
    </View>
  );

  const renderHeader = () => (
    <View>
      {/* Stats Cards */}
      <View className="px-4 py-4">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <View className="flex-row items-center">
                  <Users size={24} color="#3b82f6" />
                  <View className="ml-3">
                    <Text className="text-2xl font-bold text-blue-900">
                      {totalFPPatients}
                    </Text>
                    <Text className="text-sm text-center text-blue-700">Patients</Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
          <View className="flex-1">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <View className="flex-row items-center">
                  <UserCheck size={24} color="#059669" />
                  <View className="ml-3">
                    <Text className="text-2xl font-bold text-green-900">
                      {residentFPPatients}
                    </Text>
                    <Text className="text-sm text-green-700">
                      {/* Resident ({residentFPPercentage}%) */}
                      Resident
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
          <View className="flex-1">
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <View className="flex-row items-center">
                  <UserPlus size={24} color="#d97706" />
                  <View className="ml-3">
                    <Text className="text-2xl font-bold text-amber-900">
                      {transientFPPatients}
                    </Text>
                    <Text className="text-sm text-amber-700">
                      Transients
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
        </View>
      </View>

      {/* Search & Filter */}
      <View className="px-4 mb-4">
        {/* Search Bar */}
        <Card className="mb-3 bg-white border-slate-200">
          <CardContent className="p-0">
            <View className="flex-row items-center px-4 py-3">
              <Search size={18} color="#94a3b8" />
              <TextInput
                className="flex-1 text-slate-900 ml-3"
                placeholder="Search patients..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                accessibilityLabel="Search family planning records"
              />
            </View>
          </CardContent>
        </Card>

        {/* Filter */}
        <Card className="bg-white border-slate-200">
          <CardContent className="p-2">
            <View className="flex-row justify-between">
              {clientTypeOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleFilterChange(option.id)}
                  className={`flex-1 items-center py-2 rounded-lg mx-1 ${
                    selectedFilter === option.id ? "bg-blue-600" : "bg-slate-50"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selectedFilter === option.id ? "text-white" : "text-slate-700"
                    }`}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </CardContent>
        </Card>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View className="px-4">
      <Card className="bg-white border-slate-200">
        <CardContent className="items-center justify-center py-12">
          <FileText size={48} color="#94a3b8" />
          <Text className="text-lg font-medium text-slate-900 mt-4">
            No records found
          </Text>
          <Text className="text-slate-500 text-center mt-2">
            Try adjusting your search or filter criteria
          </Text>
        </CardContent>
      </Card>
    </View>
  );

  const renderFooter = () => {
    if (filteredRecords.length === 0 || totalPages <= 1) return null;
    
    return (
      <View className="px-4 mb-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <View className="flex-row items-center justify-between">
              <Button
                onPress={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant={currentPage === 1 ? "secondary" : "default"}
                className={currentPage === 1 ? "bg-slate-200" : "bg-blue-600"}
              >
                <Text
                  className={`font-medium ${
                    currentPage === 1 ? "text-slate-400" : "text-white"
                  }`}
                >
                  Previous
                </Text>
              </Button>

              <Text className="text-slate-600 font-medium">
                {currentPage} of {totalPages}
              </Text>

              <Button
                onPress={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant={currentPage === totalPages ? "secondary" : "default"}
                className={currentPage === totalPages ? "bg-slate-200" : "bg-blue-600"}
              >
                <Text
                  className={`font-medium ${
                    currentPage === totalPages ? "text-slate-400" : "text-white"
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
  };

  if (isLoading || isLoadingCounts) {
    return <LoadingState/>}
  

  if (isError || isErrorCounts) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center px-6">
        <AlertCircle size={24} color="#ef4444" />
        <Text className="text-slate-900 font-medium mt-3 text-center">
          Something went wrong
        </Text>
        <Text className="text-slate-500 text-sm mt-1 text-center">
          {error?.message || errorCounts?.message}
        </Text>
        <Button onPress={handleRefresh} className="mt-4 bg-blue-600">
          <Text className="text-white font-medium">Try Again</Text>
        </Button>
      </View>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-slate-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-slate-900 text-[13px]">Family Planning Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-slate-50">
        <FlatList
          data={paginatedRecords}
          renderItem={renderRecordItem}
          keyExtractor={(item) => item.fprecord_id.toString()}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={handleRefresh}
              tintColor="#3b82f6"
              colors={["#3b82f6"]}
            />
          }
        />
      </View>
    </PageLayout>
  );
}