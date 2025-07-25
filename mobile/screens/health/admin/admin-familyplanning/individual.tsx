import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation, useRoute } from '@react-navigation/native';
import { getFPRecordsForPatient } from "./GetRequest";
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
  Stethoscope
} from "lucide-react-native";
import { router } from "expo-router";

// Custom Components
const Card = ({ children, className = "", onPress = null }) => (
  <TouchableOpacity 
    onPress={onPress}
    className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}
    activeOpacity={onPress ? 0.95 : 1}
  >
    {children}
  </TouchableOpacity>
);

const CardContent = ({ children, className = "" }) => (
  <View className={`p-4 ${className}`}>
    {children}
  </View>
);

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800"
  };
  
  return (
    <View className={`px-3 py-1 rounded-full ${variants[variant]} ${className}`}>
      <Text className="text-xs font-medium">{children}</Text>
    </View>
  );
};

const Button = ({ children, onPress, variant = "default", disabled = false, className = "" }) => {
  const variants = {
    default: disabled ? "bg-gray-400" : "bg-blue-600",
    outline: "bg-transparent border-2 border-blue-600"
  };
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={disabled}
      className={`${variants[variant]} rounded-xl py-4 px-6 items-center justify-center ${className}`}
      activeOpacity={disabled ? 1 : 0.8}
    >
      {children}
    </TouchableOpacity>
  );
};

const InfoRow = ({ icon: Icon, label, value, iconColor = "#6B7280" }) => (
  <View className="flex-row items-center mb-2">
    <View className="w-5 h-5 mr-3">
      <Icon size={16} color={iconColor} />
    </View>
    <View className="flex-1">
      <Text className="text-sm text-gray-600">{label}:</Text>
      <Text className="text-sm font-medium text-gray-900">{value}</Text>
    </View>
  </View>
);

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

export default function IndividualFpRecordsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { patientId } = route.params as { patientId: string };
  const [selectedRecords, setSelectedRecords] = useState<FPRecord[]>([]);

  const {
    data: fpPatientRecords = [],
    isLoading,
    isError,
    error,
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

 const handleCompareRecords = () => {
  if (selectedRecords.length === 2) {
    router.push({
      pathname: "/admin/familyplanning/comparison",
      params: { 
        record1: JSON.stringify(selectedRecords[0]),
        record2: JSON.stringify(selectedRecords[1])
      }
    });
  } else {
    alert("Please select exactly two records to compare.");
  }
};

  const renderRecordItem = ({ item, index }: { item: FPRecord; index: number }) => {
    const isSelected = selectedRecords.some(r => r.fprecord === item.fprecord);
    
    return (
      <Card 
        className="mb-4 relative"
        onPress={() => router.push({
          pathname: "/admin/familyplanning/viewpage1",
          params: { fprecordId: item.fprecord }
        })}
      >
        <CardContent>
          {/* Header with Record ID and Selection */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <FileText size={20} color="#3B82F6" />
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-800">Record #{item.fprecord}</Text>
                <Badge variant="secondary">{`Visit ${index + 1}`}</Badge>
              </View>
            </View>
            
            {/* Selection Checkbox */}
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleCheckboxChange(item, !isSelected);
              }}
              className={`w-6 h-6 rounded border-2 items-center justify-center ${
                isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
              }`}
            >
              {isSelected && (
                <Text className="text-white text-xs font-bold">✓</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Patient Information */}
          <View className="bg-gray-50 rounded-lg p-3 mb-3">
            <InfoRow 
              icon={User} 
              label="Patient Name" 
              value={item.patient_name || "N/A"} 
              iconColor="#10B981"
            />
            <View className="flex-row">
              <View className="flex-1 mr-2">
                <InfoRow 
                  icon={Calendar} 
                  label="Age" 
                  value={`${item.patient_age || "N/A"} years`} 
                  iconColor="#10B981"
                />
              </View>
              <View className="flex-1 ml-2">
                <InfoRow 
                  icon={User} 
                  label="Sex" 
                  value={item.sex || "N/A"} 
                  iconColor="#10B981"
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
              iconColor="#10B981"
            />
            <InfoRow 
              icon={Calendar} 
              label="Created Date" 
              value={new Date(item.created_at).toLocaleDateString()} 
              iconColor="#10B981"
            />
          </View>

          {/* Action Indicator */}
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <Text className="text-sm text-gray-500">Tap to view full record</Text>
            <View className="w-6 h-6 bg-gray-100 rounded-full items-center justify-center">
              <Text className="text-gray-600 text-xs">→</Text>
            </View>
          </View>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <Loader2 size={32} color="#3B82F6" />
        <Text className="text-lg text-gray-600 mt-4">Loading patient records...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <AlertCircle size={32} color="#EF4444" />
        <Text className="text-lg text-red-600 mt-4 text-center">Failed to load records</Text>
        <Text className="text-sm text-gray-500 mt-2 text-center">{error?.message}</Text>
        <Button onPress={() => navigation.goBack()} className="mt-4">
          <Text className="text-white font-semibold">Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-6 pt-16 pb-6">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="mr-4 w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">Individual Records</Text>
            <Text className="text-blue-100 mt-1">Patient Family Planning History</Text>
          </View>
        </View>
      </View>

      <View className="flex-1 px-4 -mt-2">
        {/* Summary Card */}
        <Card className="mb-4">
          <CardContent>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-bold text-gray-800">Patient Records</Text>
                <Text className="text-sm text-gray-600">
                  {fpPatientRecords.length} record{fpPatientRecords.length !== 1 ? 's' : ''} found
                </Text>
              </View>
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                <FileText size={20} color="#3B82F6" />
              </View>
            </View>
            
            {selectedRecords.length > 0 && (
              <View className="mt-3 pt-3 border-t border-gray-100">
                <Text className="text-sm text-gray-600">
                  {selectedRecords.length} record{selectedRecords.length !== 1 ? 's' : ''} selected for comparison
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Records List */}
        {fpPatientRecords.length === 0 ? (
          <Card className="flex-1">
            <CardContent className="flex-1 items-center justify-center py-12">
              <FileText size={48} color="#9CA3AF" />
              <Text className="text-lg text-gray-500 mt-4 text-center">No Records Found</Text>
              <Text className="text-sm text-gray-400 mt-2 text-center">
                No Family Planning records available for this patient.
              </Text>
            </CardContent>
          </Card>
        ) : (
          <FlatList
            data={Array.isArray(fpPatientRecords) ? fpPatientRecords : []}
            renderItem={renderRecordItem}
            keyExtractor={(item) => item.fprecord ? item.fprecord.toString() : "0"}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Compare Button - Fixed at bottom */}
      {fpPatientRecords.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <Button
            onPress={handleCompareRecords}
            disabled={selectedRecords.length !== 2}
            className="flex-row items-center justify-center"
          >
            <GitCompare size={20} color="white" />
            <Text className="text-white font-semibold ml-2">
              Compare Records ({selectedRecords.length}/2)
            </Text>
          </Button>
        </View>
      )}
    </View>
  );
}