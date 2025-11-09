import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getFPCompleteRecord, getFPRecordsForPatient } from "./GetRequest";
import { FileText, Calendar, User, GitCompare, Loader2, AlertCircle, Stethoscope, ChevronRight, ChevronLeft, ChevronFirst, ChevronLast } from "lucide-react-native";
import { router } from "expo-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRoute } from "@react-navigation/native";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";

// Define FPRecord type
interface FPRecord {
  fprecord: number;
  client_id: string;
  patient_name: string;
  patient_age: number;
  sex: string;
  method_used: string;
  created_at: string;
  client_type: string;
}

const RECORDS_PER_PAGE = 10;

const InfoRow = ({ icon: Icon, label, value, iconColor = "#64748b" }: { icon: any; label: string; value: string; iconColor?: string }) => (
  <View className="flex-row items-center py-2">
    <View className="w-5 h-5 mr-3">
      <Icon size={16} color={iconColor} />
    </View>
    <View className="flex-1">
      <Text className="text-xs text-gray-600 uppercase tracking-wide">{label}</Text>
      <Text className="text-sm font-medium text-gray-900 mt-1">{value}</Text>
    </View>
  </View>
);

export default function IndividualFpRecordsScreen() {
  const route = useRoute();
  const { patientId } = route.params as { patientId: string };
  const [selectedRecords, setSelectedRecords] = useState<FPRecord[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: fpPatientRecords = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery<FPRecord[]>({
    queryKey: ["fpRecordsForPatient", patientId],
    queryFn: () => getFPRecordsForPatient(patientId), 
    enabled: !!patientId,
  });

  // Pagination calculations
  const totalRecords = Array.isArray(fpPatientRecords) ? fpPatientRecords.length : 0;
  const totalPages = Math.ceil(totalRecords / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = Math.min(startIndex + RECORDS_PER_PAGE, totalRecords);
  const currentRecords = Array.isArray(fpPatientRecords) 
    ? fpPatientRecords.slice(startIndex, endIndex)
    : [];

  const handleCheckboxChange = (record: FPRecord, isChecked: boolean) => {
    setSelectedRecords((prevSelected) => {
      if (isChecked) {
        if (prevSelected.length >= 2) {
          return prevSelected;
        }
        return [...prevSelected, record];
      } else {
        return prevSelected.filter((r) => r.fprecord !== record.fprecord);
      }
    });
  };

  const handleCompareRecords = async () => {
    if (selectedRecords.length !== 2) {
      alert("Please select exactly two records to compare.");
      return;
    }

    setIsComparing(true);
    try {
      const [record1, record2] = await Promise.all([
        getFPCompleteRecord(selectedRecords[0].fprecord),
        getFPCompleteRecord(selectedRecords[1].fprecord)
      ]);

      router.push({
        pathname: "/admin/familyplanning/comparison",
        params: { 
          record1: JSON.stringify(record1),
          record2: JSON.stringify(record2)
        }
      });
    } catch (error) {
      console.error("Error fetching records for comparison:", error);
      alert("Failed to fetch records for comparison. Please try again.");
    } finally {
      setIsComparing(false);
    }
  };

  const handleRefresh = () => {
    refetch();
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToNextPage = () => currentPage < totalPages && goToPage(currentPage + 1);
  const goToPrevPage = () => currentPage > 1 && goToPage(currentPage - 1);

  const renderRecordItem = ({ item, index }: { item: FPRecord; index: number }) => {
    const isSelected = selectedRecords.some(r => r.fprecord === item.fprecord);
    
    return (
      <View className="px-4 mb-3">
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-0">
            <TouchableOpacity 
              onPress={() => router.push({
                pathname: "/admin/familyplanning/viewpage1",
                params: { fprecordId: item.fprecord }
              })}
              className="p-4"
            >
              {/* Header with Record ID and Selection */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center mr-3">
                    <FileText size={20} color="#1e40af" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900">Record #{item.fprecord}</Text>
                  </View>
                </View>
                
                {/* Selection Checkbox */}
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleCheckboxChange(item, !isSelected);
                  }}
                  className={`w-6 h-6 rounded border-2 items-center justify-center mr-2 ${
                    isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                  }`}
                >
                  {isSelected && (
                    <Text className="text-white text-xs font-bold">✓</Text>
                  )}
                </TouchableOpacity>

                <ChevronRight size={20} color="#6b7280" />
              </View>

              {/* Patient Information */}
              <View className="bg-gray-50 rounded-lg p-3 mb-3">
                <InfoRow 
                  icon={User} 
                  label="Patient Name" 
                  value={item.patient_name || "N/A"} 
                  iconColor="#065f46"
                />
                <View className="flex-row">
                  <View className="flex-1 mr-2">
                    <InfoRow 
                      icon={Calendar} 
                      label="Age" 
                      value={`${item.patient_age || "N/A"} years`} 
                      iconColor="#065f46"
                    />
                  </View>
                  <View className="flex-1 ml-2">
                    <InfoRow 
                      icon={User} 
                      label="Sex" 
                      value={item.sex || "N/A"} 
                      iconColor="#065f46"
                    />
                  </View>
                </View>
              </View>

              {/* Method and Date */}
              <View className="space-y-2">
                <InfoRow 
                  icon={Stethoscope} 
                  label="Method Used" 
                  value={item.method_used || "Not specified"}  
                  iconColor="#7e22ce"
                />
                <InfoRow 
                  icon={Stethoscope} 
                  label="CLIENT TYPE" 
                  value={item.client_type || "Not specified"} 
                  iconColor="#7e22ce"
                />
                <InfoRow 
                  icon={Calendar} 
                  label="Created Date" 
                  value={new Date(item.created_at).toLocaleDateString()} 
                  iconColor="#b91c1c"
                />
              </View>

              {/* Action Indicator */}
              <View className="mt-3 pt-3 border-t border-gray-100">
                <Text className="text-sm text-gray-500">Tap to view full record</Text>
              </View>
            </TouchableOpacity>
          </CardContent>
        </Card>
      </View>
    );
  };

  const PaginationControls = () => (
    <View className="px-4 py-3 bg-white border-t border-gray-200">
      <View className="flex-row items-center justify-center">
        
        
        <View className="flex-row items-center gap">
          {/* First Page */}
          <TouchableOpacity
            onPress={goToFirstPage}
            disabled={currentPage === 1}
            className={`p-2 ${currentPage === 1 ? 'opacity-50' : ''}`}
          >
            <ChevronFirst size={16} color={currentPage === 1 ? "#9ca3af" : "#374151"} />
          </TouchableOpacity>

          {/* Previous Page */}
          <TouchableOpacity
            onPress={goToPrevPage}
            disabled={currentPage === 1}
            className={`p-2 ${currentPage === 1 ? 'opacity-50' : ''}`}
          >
            <ChevronLeft size={16} color={currentPage === 1 ? "#9ca3af" : "#374151"} />
          </TouchableOpacity>

          {/* Page Info */}
          <View className="px-3 py-1 bg-gray-100 rounded">
            <Text className="text-sm font-medium text-gray-900">
              {currentPage} / {totalPages}
            </Text>
          </View>

          {/* Next Page */}
          <TouchableOpacity
            onPress={goToNextPage}
            disabled={currentPage === totalPages}
            className={`p-2 ${currentPage === totalPages ? 'opacity-50' : ''}`}
          >
            <ChevronRight size={16} color={currentPage === totalPages ? "#9ca3af" : "#374151"} />
          </TouchableOpacity>

          {/* Last Page */}
          <TouchableOpacity
            onPress={goToLastPage}
            disabled={currentPage === totalPages}
            className={`p-2  ${currentPage === totalPages ? 'opacity-50' : ""}`}
          >
            <ChevronLast size={16} color={currentPage === totalPages ? "#9ca3af" : "#374151"} />
          </TouchableOpacity>
        </View>
        
      </View>
      <View className="items-center flex-1">
          <Text className="text-sm text-gray-600">
            Showing {startIndex + 1}-{endIndex} of {totalRecords} records
          </Text>
        </View>
    </View>
  );

 
  const renderEmpty = () => (
    <View className="px-4">
      <Card className="bg-white border border-gray-200">
        <CardContent className="items-center justify-center py-12">
          <FileText size={48} color="#9ca3af" />
          <Text className="text-lg text-gray-500 mt-4 text-center">No Records Found</Text>
          <Text className="text-sm text-gray-400 mt-2 text-center">
            No Family Planning records available for this patient.
          </Text>
        </CardContent>
      </Card>
    </View>
  );

  if (isLoading) {
    return <LoadingState/>
  }

  if (isError) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <AlertCircle size={32} color="#dc2626" />
        <Text className="text-lg text-red-600 mt-4 text-center">Failed to load records</Text>
        <Text className="text-sm text-gray-500 mt-2 text-center">{error?.message}</Text>
        <Button onPress={() => router.back()} className="mt-4 bg-blue-600">
          <Text className="text-white font-semibold">Go Back</Text>
        </Button>
      </View>
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
        headerTitle={<Text className="text-gray-900 text-lg font-semibold">Individual Records</Text>}
      >
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={currentRecords}
        renderItem={renderRecordItem}
        keyExtractor={(item) => item.fprecord ? item.fprecord.toString() : Math.random().toString()}
        // ListHeaderComponent={}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={totalPages > 1 ? PaginationControls : null}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={handleRefresh}
            tintColor="#1e40af"
            colors={["#1e40af"]}
          />
        }
      />

      {/* Compare Button */}
      {totalRecords > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <Button
            onPress={handleCompareRecords}
            disabled={selectedRecords.length !== 2 || isComparing}
            className={`flex-row items-center justify-center ${
              selectedRecords.length !== 2 || isComparing ? 'bg-gray-400' : 'bg-blue-600'
            }`}
          >
            <GitCompare size={20} color="white" />
            <Text className="text-white font-semibold ml-2">
              {isComparing ? 'Comparing...' : `Compare Records (${selectedRecords.length}/2)`}
            </Text>
          </Button>
        </View>
      )}
    </View>
    </PageLayout>
  );
}