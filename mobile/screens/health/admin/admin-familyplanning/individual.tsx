import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation, useRoute } from '@react-navigation/native';
import { getFPCompleteRecord, getFPRecordsForPatient } from "./GetRequest";
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  User, 
  Activity, 
  GitCompare, 
  Loader2, 
  AlertCircle,
  Clock,
  Stethoscope,
  ChevronRight
} from "lucide-react-native";
import { router } from "expo-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Define FPRecord type
interface FPRecord {
  fprecord: number;
  patient_id: string;
  client_id: string;
  patient_name: string;
  patient_age: number;
  sex: string;
  method_used: string;
  created_at: string;
}

const InfoRow = ({ icon: Icon, label, value, iconColor = "#64748b" }) => (
  <View className="flex-row items-center py-2">
    <View className="w-5 h-5 mr-3">
      <Icon size={16} color={iconColor} />
    </View>
    <View className="flex-1">
      <Text className="text-xs text-slate-500 uppercase tracking-wide">{label}</Text>
      <Text className="text-sm font-medium text-slate-900 mt-1">{value}</Text>
    </View>
  </View>
);

export default function IndividualFpRecordsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { patientId } = route.params as { patientId: string };
  const [selectedRecords, setSelectedRecords] = useState<FPRecord[]>([]);
  const [isComparing, setIsComparing] = useState(false);

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
  };

  const renderRecordItem = ({ item, index }: { item: FPRecord; index: number }) => {
    const isSelected = selectedRecords.some(r => r.fprecord === item.fprecord);
    
    return (
      <View className="px-4 mb-3">
        <Card className="bg-white border border-slate-200">
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
                  <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-3">
                    <FileText size={20} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-slate-900">Record #{item.fprecord}</Text>
                    
                  </View>
                </View>
                
                {/* Selection Checkbox */}
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleCheckboxChange(item, !isSelected);
                  }}
                  className={`w-6 h-6 rounded border-2 items-center justify-center mr-2 ${
                    isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && (
                    <Text className="text-white text-xs font-bold">✓</Text>
                  )}
                </TouchableOpacity>

                <ChevronRight size={20} color="#64748b" />
              </View>

              {/* Patient Information */}
              <View className="bg-slate-50 rounded-lg p-3 mb-3">
                <InfoRow 
                  icon={User} 
                  label="Patient Name" 
                  value={item.patient_name || "N/A"} 
                  iconColor="#059669"
                />
                <View className="flex-row">
                  <View className="flex-1 mr-2">
                    <InfoRow 
                      icon={Calendar} 
                      label="Age" 
                      value={`${item.patient_age || "N/A"} years`} 
                      iconColor="#059669"
                    />
                  </View>
                  <View className="flex-1 ml-2">
                    <InfoRow 
                      icon={User} 
                      label="Sex" 
                      value={item.sex || "N/A"} 
                      iconColor="#059669"
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
                  iconColor="#7c3aed"
                />
                <InfoRow 
                  icon={Calendar} 
                  label="Created Date" 
                  value={new Date(item.created_at).toLocaleDateString()} 
                  iconColor="#dc2626"
                />
              </View>

              {/* Action Indicator */}
              <View className="mt-3 pt-3 border-t border-slate-100">
                <Text className="text-sm text-slate-500">Tap to view full record</Text>
              </View>
            </TouchableOpacity>
          </CardContent>
        </Card>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View className="bg-blue-600 px-4 pt-16 pb-6">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="mr-4 w-10 h-10 bg-white/20 rounded-xl items-center justify-center"
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">Individual Records</Text>
            <Text className="text-blue-100 mt-1">Patient Family Planning History</Text>
          </View>
        </View>
      </View>

      {/* Summary Card */}
      <View className="px-4 -mt-2 mb-4">
        <Card className="bg-white border border-slate-200">
          <CardContent className="p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-bold text-slate-900">Patient Records</Text>
                <Text className="text-sm text-slate-600">
                  {fpPatientRecords.length} record{fpPatientRecords.length !== 1 ? 's' : ''} found
                </Text>
              </View>
              <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center">
                <FileText size={20} color="#3b82f6" />
              </View>
            </View>
            
            {selectedRecords.length > 0 && (
              <View className="mt-3 pt-3 border-t border-slate-100">
                <Text className="text-sm text-slate-600">
                  {selectedRecords.length} record{selectedRecords.length !== 1 ? 's' : ''} selected for comparison
                </Text>
              </View>
            )}
          </CardContent>
        </Card>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View className="px-4">
      <Card className="bg-white border border-slate-200">
        <CardContent className="items-center justify-center py-12">
          <FileText size={48} color="#94a3b8" />
          <Text className="text-lg text-slate-500 mt-4 text-center">No Records Found</Text>
          <Text className="text-sm text-slate-400 mt-2 text-center">
            No Family Planning records available for this patient.
          </Text>
        </CardContent>
      </Card>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center p-6">
        <Loader2 size={32} color="#3b82f6" />
        <Text className="text-lg text-slate-600 mt-4">Loading patient records...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center p-6">
        <AlertCircle size={32} color="#ef4444" />
        <Text className="text-lg text-red-600 mt-4 text-center">Failed to load records</Text>
        <Text className="text-sm text-slate-500 mt-2 text-center">{error?.message}</Text>
        <Button onPress={() => router.back()} className="mt-4 bg-blue-600">
          <Text className="text-white font-semibold">Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <FlatList
        data={Array.isArray(fpPatientRecords) ? fpPatientRecords : []}
        renderItem={renderRecordItem}
        keyExtractor={(item) => item.fprecord ? item.fprecord.toString() : "0"}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingBottom: 100 }}
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

      {/* Compare Button */}
      {fpPatientRecords.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
          <Button
            onPress={handleCompareRecords}
            disabled={selectedRecords.length !== 2 || isComparing}
            className={`flex-row items-center justify-center ${
              selectedRecords.length !== 2 || isComparing ? 'bg-slate-400' : 'bg-blue-600'
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
  );
}