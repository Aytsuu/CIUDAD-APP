// screens/first-aid/my-records.tsx
import React, { useState, useMemo } from "react";
import { View, FlatList, TextInput, Text, Image, TouchableOpacity, RefreshControl } from "react-native";
import { User, FileText, AlertCircle, Package, Clock, Search, ChevronLeft, Calendar, RefreshCw } from "lucide-react-native";
import { router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageLayout from "@/screens/_PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/ui/loading-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api2 } from "@/api/api";
import { calculateAge } from "@/helpers/ageCalculator";
import { FirstAidRecord } from "../admin/admin-firstaid/types";
import { useLocalSearchParams } from "expo-router";
import { getPatientById, getPatientByResidentId } from "../animalbites/api/get-api";

// Update FirstAidRecord type to match API response
// interface FirstAidRecord {
//   farec_id: string | number;
//   created_at: string;
//   finv: number;
//   finv_details: {
//     fa_detail?: {
//       fa_name?: string;
//       catlist?: string;
//     };
//   };
//   patrec: number;
//   patrec_details: any;
//   qty: string;
//   reason?: string;
//   signature?: string;
//   staff: string;
// }

// Reuse the FirstAidRecordCard component
const FirstAidRecordCard = ({ item }: { item: FirstAidRecord }) => (
  <Card className="mb-3 bg-white border-slate-200">
    <CardContent className="p-4">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center">
          <Calendar size={16} color="#64748B" />
          <Text className="ml-2 text-slate-600 text-sm">
            {new Date(item.created_at || "").toLocaleDateString()}
          </Text>
        </View>
        <Badge variant="outline" className="border-blue-200 bg-blue-50">
          <Text className="text-blue-700 text-xs">#{item.farec_id}</Text>
        </Badge>
      </View>
      
      <View className="mb-3">
        <Text className="font-semibold text-lg text-slate-900 mb-1">
          {item.finv_details?.fa_detail?.fa_name || "Unknown Item"}
        </Text>
        <Text className="text-slate-600 text-sm">
          {item.finv_details?.fa_detail?.catlist || "N/A"}
        </Text>
      </View>
      
      <View className="flex-row items-center mb-3">
        <Package size={16} color="#64748B" />
        <Text className="ml-2 text-slate-600 text-sm">
          Quantity: <Text className="text-slate-900 font-medium">{item.qty}</Text>
        </Text>
      </View>
      
      {item.reason && (
        <View className="mb-3">
          <Text className="text-slate-600 text-sm mb-1">Reason:</Text>
          <Text className="text-slate-900">{item.reason}</Text>
        </View>
      )}
      
      {item.signature && (
        <View className="mt-3 pt-3 border-t border-slate-200">
          <Text className="text-slate-600 text-sm mb-2">Patient Signature:</Text>
          <Image 
            source={{ uri: `data:image/png;base64,${item.signature}` }}
            className="h-16 w-40 border border-slate-200 rounded-md"
            resizeMode="contain"
          />
        </View>
      )}
    </CardContent>
  </Card>
);

const PatientInfoCard = ({ patientData }: { patientData: any }) => {
  const formatAddress = () => {
    if (!patientData?.address) return "No address provided";
    const address = patientData.address;
    return [address.add_street, address.add_barangay, address.add_city, address.add_province]
      .filter(Boolean)
      .join(", ");
  };

  return (
    <Card className="mb-4 bg-white border-slate-200">
      <CardContent className="p-4">
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-blue-100">
            <User size={20} color="#3B82F6" />
          </View>
          <Text className="text-lg font-semibold text-gray-800">Patient Information</Text>
        </View>
        <View className="space-y-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-500">Full Name</Text>
            <Text className="text-sm font-medium text-gray-900">
              {patientData?.personal_info?.per_fname || "N/A"} {patientData?.personal_info?.per_mname || ""} {patientData?.personal_info?.per_lname || "N/A"}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-500">Age</Text>
            <Text className="text-sm font-medium text-gray-900">
              {patientData?.personal_info?.per_dob ? calculateAge(patientData.personal_info.per_dob) : "N/A"}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-500">Sex</Text>
            <Text className="text-sm font-medium text-gray-900">{patientData?.personal_info?.per_sex || "N/A"}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-500">Address</Text>
            <Text className="text-sm font-medium text-gray-900">{formatAddress()}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-500">Type</Text>
            <Text className="text-sm font-medium text-gray-900">{patientData?.pat_type || "N/A"}</Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
};

export default function MyFirstAidRecordsScreen() {
  const params = useLocalSearchParams<{ pat_id?: string }>();
  const patIdFromParams = params.pat_id;
  const { user } = useAuth();
  const rp_id = user?.resident?.rp_id;

  console.log("[DEBUG] my-records patIdFromParams:", patIdFromParams);
  console.log("[DEBUG] rp_id from auth:", rp_id);

  // Fetch patient data
  const { data: patientData, isLoading: isLoadingPatient, isError: isErrorPatient, error: errorPatient, refetch: refetchPatient } = useQuery({
    queryKey: ["patientDetails", patIdFromParams || rp_id],
    queryFn: async () => {
      if (patIdFromParams) {
        console.log(`🔍 Fetching patient with ID: ${patIdFromParams}`);
        return await getPatientById(patIdFromParams); // Admin/transient view
      } else if (rp_id) {
        console.log(`🔍 Fetching patient with resident ID: ${rp_id}`);
        return await getPatientByResidentId(rp_id); // User view
      }
      return null;
    },
    enabled: !!(patIdFromParams || rp_id),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const patient_id = patIdFromParams || patientData?.pat_id;
  console.log("[DEBUG] patient_id used for First Aid records:", patient_id);

  // Fetch records
  const {
    data: recordsData = [], // Default to empty array
    isLoading: isLoadingRecords,
    isError: isErrorRecords,
    error: errorRecords,
    refetch: refetchRecords
  } = useQuery({
    queryKey: ["firstAidRecords", patient_id],
    queryFn: async () => {
      if (!patient_id) throw new Error("No patient ID available");
      console.log(`🔍 Fetching First Aid records for pat_id: ${patient_id}`);
      try {
        const res = await api2.get(`firstaid/indiv-firstaid-record/${patient_id}/`);
        console.log("[DEBUG] First Aid records response:", JSON.stringify(res.data, null, 2));
        // Handle paginated response with results array
        return Array.isArray(res.data.results) ? res.data.results : [];
      } catch (error:any) {
        console.error("❌ Error fetching First Aid records:", error.response?.status, error.message);
        if (error.response && error.response.status === 404) {
          console.log("[DEBUG] 404: No First Aid records found for pat_id:", patient_id);
          return []; // Treat 404 as no records
        }
        throw error; // Re-throw other errors
      }
    },
    enabled: !!patient_id,
    staleTime: 5 * 60 * 1000,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const filteredData = useMemo(() => {
    console.log("[DEBUG] recordsData:", JSON.stringify(recordsData, null, 2));
    console.log("[DEBUG] filteredData processing, searchQuery:", searchQuery);
    if (!Array.isArray(recordsData)) return [];
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = recordsData.filter((item: FirstAidRecord) => {
      const nameMatch = item.finv_details?.fa_detail?.fa_name?.toLowerCase()?.includes(lowerQuery) || false;
      const reasonMatch = item.reason?.toLowerCase()?.includes(lowerQuery) || false;
      const idMatch = item.farec_id?.toString().toLowerCase().includes(lowerQuery) || false;
      console.log("[DEBUG] Item:", item.farec_id, "Matches:", { nameMatch, reasonMatch, idMatch });
      return nameMatch || reasonMatch || idMatch;
    });
    console.log("[DEBUG] filteredData length:", filtered.length);
    return filtered;
  }, [recordsData, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchRecords();
    await refetchPatient();
    setRefreshing(false);
  };

  if (isLoadingPatient || isLoadingRecords) {
    return <LoadingState />;
  }

  if (isErrorPatient || (isErrorRecords)) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-red-50">
        <AlertCircle size={48} color="#EF4444" />
        <Text className="text-xl font-semibold text-red-800 mt-4">
          {isErrorPatient ? "Patient Not Found" : "Error Loading Records"}
        </Text>
        <Text className="text-gray-600 mt-2 text-center">
          {(errorPatient || errorRecords)?.message ?? "Please try again later."}
        </Text>
        <View className="flex-row mt-4 space-x-4">
          <TouchableOpacity onPress={onRefresh} className="bg-blue-600 px-4 py-2 rounded-lg">
            <Text className="text-white">Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} className="bg-gray-600 px-4 py-2 rounded-lg">
            <Text className="text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!patient_id && !user) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-gray-50">
        <AlertCircle size={48} color="#9CA3AF" />
        <Text className="text-xl font-semibold text-gray-800 mt-4">Authentication Required</Text>
        <Text className="text-gray-500 mt-2 text-center">Please log in to view your first aid records.</Text>
      </View>
    );
  }

  if (!patientData) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-gray-50">
        <AlertCircle size={48} color="#9CA3AF" />
        <Text className="text-xl font-semibold text-gray-800 mt-4">Patient Not Found</Text>
        <Text className="text-gray-500 mt-2 text-center">No patient data available for this ID.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-blue-600 px-4 py-2 rounded-lg">
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
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
      headerTitle={<Text className="text-slate-900 text-lg font-semibold">{patIdFromParams ? 'First Aid Records' : 'My First Aid Records'}</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-gray-50">
        <PatientInfoCard patientData={patientData} />
        
        <View className="mx-4 mb-4">
          <View className="flex-row items-center p-3 border border-gray-200 bg-white rounded-xl">
            <Search size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-800 text-base"
              placeholder="Search records..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <FlatList
          data={filteredData}
          renderItem={({ item }) => <FirstAidRecordCard item={item} />}
          keyExtractor={(item) => item.farec_id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View className="px-4 mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Records ({filteredData.length})
              </Text>
            </View>
          }
          ListEmptyComponent={() => (
            <View className="justify-center items-center py-20">
              <FileText size={48} color="#D1D5DB" />
              <Text className="text-gray-600 text-lg font-semibold mb-2 mt-4">
                No records found
              </Text>
              <Text className="text-gray-500 text-center">
                {searchQuery
                  ? "No records match your search criteria."
                  : "No first aid records available for this patient."}
              </Text>
            </View>
          )}
        />
      </View>
    </PageLayout>
  );
}